/* =============================================================================
   ESC — app
   =============================================================================
   Hash routing and rendering.

   Routes:  #/                  home
            #/module/<id>       one module
            #/review            everything typed, plus export

   Hash routing is used so the tool works identically from file:// and from a
   web server, with no server config.

   Every screen is rebuilt from content/modules.js and js/state.js on each
   route change. The DOM is never the source of truth for anything typed.

   Written for old browsers: no optional chaining, no template literals, no
   fetch, no modules. All text goes in as text nodes, never innerHTML.
   ========================================================================== */

(function () {
  "use strict";

  var CONTENT = window.ESC_CONTENT;
  var STATE = window.ESC_STATE;
  var EXPORT = window.ESC_EXPORT;
  var TELEMETRY = window.ESC_TELEMETRY;
  var CONFIG = window.ESC_CONFIG || {};

  // Feedback fields collect comments on the TOOL. A release build has no way to
  // send them anywhere, so they are not rendered at all.
  var IS_TEST_BUILD = !!(window.ESC_CONFIG && window.ESC_CONFIG.BUILD === "test");

  /* -------------------------------------------------------------------------
     h() — the only way elements are made in this file.

       h("p", { class: "prompt__guidance", text: guidance })
       h("div", { class: "row" }, [ childNode, "some text" ])
       h("input", { type: "radio", checked: true, on: { change: fn } })

     Props: "class" sets className, "text" appends a text node, "on" binds
     listeners; anything else is set as a property where one exists (id, value,
     checked, htmlFor) and as an attribute otherwise (aria-*, data-*).

     Null, undefined and false are skipped in both props and children, so a
     conditional child can be written inline as `test && node`.
     ---------------------------------------------------------------------- */

  function h(tag, props, children) {
    var node = document.createElement(tag);
    var key;

    for (key in (props || {})) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) { continue; }
      if (props[key] === null || props[key] === undefined || props[key] === false) { continue; }
      if (key === "class") { node.className = props[key]; }
      else if (key === "text") { node.appendChild(document.createTextNode(props[key])); }
      else if (key === "on") { bind(node, props[key]); }
      // href is set as an attribute so it stays relative — assigning the
      // property would resolve it to an absolute file:// URL.
      else if (key !== "href" && key in node) { node[key] = props[key]; }
      else { node.setAttribute(key, props[key]); }
    }

    return appendChildren(node, children);
  }

  // Shared by h() and fill(): strings become text nodes, and null/undefined/
  // false are skipped so conditional children can be written inline.
  function appendChildren(node, children) {
    var kids = (children === null || children === undefined) ? []
             : (Array.isArray(children) ? children : [children]);
    var i, kid;

    for (i = 0; i < kids.length; i++) {
      kid = kids[i];
      if (kid === null || kid === undefined || kid === false) { continue; }
      node.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
    }
    return node;
  }

  function bind(node, handlers) {
    var event;
    for (event in handlers) {
      if (Object.prototype.hasOwnProperty.call(handlers, event)) {
        node.addEventListener(event, handlers[event], false);
      }
    }
  }

  /* --- small helpers ----------------------------------------------------- */

  function byId(id) { return document.getElementById(id); }

  function clear(node) {
    while (node && node.firstChild) { node.removeChild(node.firstChild); }
  }

  // Empty a node and refill it.
  function replace(node, children) {
    if (!node) { return; }
    clear(node);
    appendChildren(node, children);
  }

  function fill(id, children) { replace(byId(id), children); }

  function map(list, fn) {
    var out = [];
    var i;
    for (i = 0; list && i < list.length; i++) { out.push(fn(list[i], i)); }
    return out;
  }

  /* --- content lookups --------------------------------------------------- */

  function findById(list, id) {
    var i;
    for (i = 0; list && i < list.length; i++) {
      if (list[i].id === id) { return list[i]; }
    }
    return null;
  }

  function stageLabel(id) {
    var stage = findById(CONTENT.stages, id);
    return stage ? stage.label : id;
  }

  function groupLabel(id) {
    var group = findById(CONTENT.stakeholderGroups, id);
    return group ? group.label : id;
  }

  function labels() {
    return (CONTENT.meta && CONTENT.meta.labels) || {};
  }

  /* -------------------------------------------------------------------------
     Shared blocks — used by both the module card and the module screen
     ---------------------------------------------------------------------- */

  // block is a BEM block-element root, e.g. "module__meta".
  // withOptional adds the stakeholders the source marks as optional.
  function metaList(block, mod, withOptional) {
    return h("dl", { class: block }, [
      metaRow(block, labels().stageLabel, stagePills(mod.useFromStages)),
      metaRow(block, labels().useWithLabel,
        groupPills(mod.useWith, withOptional ? mod.useWithOptional : null))
    ]);
  }

  // data-stage and data-category are the colour hooks: see css/tokens.css.
  function stagePills(stageIds) {
    return h("ul", { class: "pill-list" }, map(stageIds, function (id) {
      return h("li", { class: "pill", "data-stage": id, text: stageLabel(id) });
    }));
  }

  function metaRow(block, term, value) {
    return h("div", { class: block + "-row" }, [
      h("dt", { class: block + "-term", text: term }),
      h("dd", { class: block + "-value" }, value)
    ]);
  }

  function groupCategory(id) {
    var group = findById(CONTENT.stakeholderGroups, id);
    return group ? group.category : null;
  }

  function groupPills(groupIds, optionalIds) {
    return h("ul", { class: "pill-list" }, map(groupIds, function (id) {
      return h("li", { class: "pill", "data-category": groupCategory(id), text: groupLabel(id) });
    }).concat(map(optionalIds, function (id) {
      return h("li", { class: "pill pill--optional", "data-category": groupCategory(id) }, [
        groupLabel(id), " ",
        h("span", { class: "pill__note", text: "(" + labels().useWithOptionalLabel + ")" })
      ]);
    })));
  }

  /* -------------------------------------------------------------------------
     1. Welcome — the introduction, the test notice, and two ways on
     ---------------------------------------------------------------------- */

  function paragraphs(list, className) {
    return map(list, function (text) { return h("p", { class: className, text: text }); });
  }

  // [ "01", " ", "Pick a module…" ] — a number set apart from its text.
  function numbered(number, text, numberClass) {
    return [h("span", { class: numberClass, text: number }), " ", text];
  }

  // 1 -> "01". The interface counts in pairs, like the guide's numbering.
  function twoDigit(n) { return (n < 10 ? "0" : "") + n; }

  function renderWelcome() {
    var meta = CONTENT.meta;

    fill("welcome-title", [labels().welcomeTitle]);
    fill("welcome-body", paragraphs(meta.about, "welcome__paragraph"));

    // The recording notice is off for this round: testing happens in the room
    // with the team present. The wording is still in content/modules.js.

    fill("welcome-canvas", [labels().canvasCta]);
    byId("welcome-canvas").setAttribute("href", meta.canvasUrl || "#");
    fill("welcome-cta", [labels().heroCta]);
  }

  /* -------------------------------------------------------------------------
     2. How to use this tool — the six instructions as numbered cards.
     Informational: nothing here is clickable.
     ---------------------------------------------------------------------- */

  function renderHow() {
    fill("how-title", [labels().howTitle]);
    fill("how-intro", [labels().howIntro]);
    fill("how-steps", map(CONTENT.meta.instructionsShort, function (text, i) {
      return h("li", { class: "how__step" }, [
        h("p", { class: "how__step-number", text: twoDigit(i + 1) }),
        h("p", { class: "how__step-text", text: text })
      ]);
    }));
    fill("how-cta", [labels().howCta]);
    fill("how-guidelines", [labels().guidelinesLink]);
  }

  /* -------------------------------------------------------------------------
     Guidelines — the fuller guidance, on its own page
     ---------------------------------------------------------------------- */

  function guidelinesPart(part, children) {
    return h("section", { class: "guidelines-section", id: part.id,
                          "aria-labelledby": part.id + "-title" },
      [h("h2", { class: "guidelines-section__title", id: part.id + "-title", tabIndex: -1 },
         numbered(part.number, part.title, "guidelines-section__number"))].concat(children));
  }

  function guidelinesBody() {
    var g = CONTENT.meta.guidelines;
    var parts = [
      { id: "guidelines-how",  number: "01", title: labels().guidelinesHowTitle },
      { id: "guidelines-when", number: "02", title: g.when.title },
      { id: "guidelines-who",  number: "03", title: g.who.title },
      { id: "guidelines-tips", number: "04", title: g.tips.title }
    ];

    return [
      h("nav", { class: "guidelines-index", "aria-label": labels().guidelinesIndexTitle }, [
        h("ol", { class: "guidelines-index__list" }, map(parts, function (part) {
          return h("li", { class: "guidelines-index__item" }, [
            h("a", { class: "guidelines-index__link", href: "#" + part.id },
              numbered(part.number, part.title, "guidelines-index__number"))
          ]);
        }))
      ]),

      // 01 — the six steps, in full
      guidelinesPart(parts[0], [
        h("ol", { class: "steps" }, map(CONTENT.meta.instructions, function (text, i) {
          return h("li", { class: "steps__item" }, numbered(twoDigit(i + 1), text, "steps__number"));
        }))
      ]),

      // 02 — the scaling stages, with their descriptions
      guidelinesPart(parts[1], paragraphs(g.when.intro, "guidelines__paragraph").concat([
        h("dl", { class: "stage-list" }, map(CONTENT.stages, function (stage) {
          return h("div", { class: "stage-list__row" }, [
            h("dt", { class: "stage-list__term", text: stage.label }),
            h("dd", { class: "stage-list__description", text: stage.description })
          ]);
        }))
      ], paragraphs(g.when.outro, "guidelines__paragraph"))),

      // 03 — who to include, grouped under the three headings
      guidelinesPart(parts[2], paragraphs(g.who.intro, "guidelines__paragraph").concat(
        map(CONTENT.stakeholderCategories, function (category) {
          var members = CONTENT.stakeholderGroups.filter(function (group) {
            return group.category === category.id;
          });
          return h("div", { class: "stakeholder-group" }, [
            h("h3", { class: "stakeholder-group__title", text: category.label }),
            h("ul", { class: "stakeholder-group__list" }, map(members, function (group) {
              return h("li", { class: "stakeholder-group__item", text: group.label });
            }))
          ]);
        })
      )),

      // 04 — the facilitator tips
      guidelinesPart(parts[3], [
        g.tips.subtitle && h("p", { class: "guidelines__paragraph", text: g.tips.subtitle }),
        h("ol", { class: "tips" }, map(g.tips.items, function (tip) {
          return h("li", { class: "tips__item" }, [
            h("h3", { class: "tips__title", text: tip.title }),
            h("p", { class: "tips__body", text: tip.body })
          ]);
        }))
      ])
    ];
  }

  function renderGuidelines() {
    fill("guidelines-title", [labels().guidelinesTitle]);
    fill("guidelines-intro", [labels().guidelinesIntro]);
    fill("guidelines-body", guidelinesBody());
  }

  /* -------------------------------------------------------------------------
     3 + 4. The module picker — one component, two states.

     With no module chosen it is a grid of seven large cards. Choosing one
     condenses it to a compact row and the conversation appears underneath.
     Both states are the same seven links to #/module/<id>, so choosing and
     switching are the same action, and nothing touches state: every field is
     rebuilt from js/state.js on each render, exactly as before.
     ---------------------------------------------------------------------- */

  /* The icon is supporting, not the subject: a small placeholder until the
     seven assets arrive. Set `image` on a module in content/modules.js and it
     is used here; until then the placeholder carries the module colour.
     Decorative either way — the question is what is read. */
  function moduleIcon(mod) {
    return h("span", {
      // Without artwork the slot is a plain placeholder square; with it, the
      // icon stands on its own and the placeholder styling comes off.
      class: "module-card__icon" + (mod.image ? " module-card__icon--art" : ""),
      "aria-hidden": "true"
    }, mod.image ? [h("img", { class: "module-card__icon-image", src: mod.image, alt: "" })] : null);
  }

  // The id the conversation borrows for its accessible name.
  function questionId(mod) { return "module-q-" + mod.id; }

  /* A card is an icon and the module's question, and nothing else. Once a
     module is chosen the same cards collapse in place — the icons go, the
     questions stay, the positions do not move. */
  function moduleCard(mod, selectedId) {
    var current = mod.id === selectedId;
    return h("li", {
      class: "module-list__item module-card" + (current ? " module-card--current" : ""),
      "data-module": mod.id
    }, [
      moduleIcon(mod),
      h("h3", { class: "module-card__title", id: questionId(mod) }, [
        h("a", {
          class: "module-card__link",
          href: "#/module/" + mod.id,
          "aria-current": current ? "true" : null,
          text: mod.title
        })
      ])
    ]);
  }

  /* The same seven, in the same grid, whether or not one is selected. */
  function modulePicker(selectedId) {
    return h("ol", {
      class: "module-list__items" + (selectedId ? " module-list__items--collapsed" : "")
    }, map(CONTENT.modules, function (mod) { return moduleCard(mod, selectedId); }));
  }

  function renderAttribution() {
    fill("attribution-title", [labels().attributionTitle || ""]);
    fill("attribution-list", map(CONTENT.meta && CONTENT.meta.attribution, function (row) {
      return h("div", { class: "attribution__row" }, [
        h("dt", { class: "attribution__label", text: row.label }),
        h("dd", { class: "attribution__organisations",
                  text: (row.organisations || []).join(", ") })
      ]);
    }));
  }

  /* -------------------------------------------------------------------------
     Form fields

     Every field is a real <label> tied to a real control by id, with its value
     read out of state and one listener writing straight back to state.
     ---------------------------------------------------------------------- */

  // fieldId("answer", "a", "a1") -> "f-answer-a-a1"
  function fieldId() {
    return "f-" + Array.prototype.slice.call(arguments).join("-");
  }

  /* A field prints one of two ways, and the class on the wrapper is how
     css/print.css tells them apart:

       field--filled  print what was typed, as text. A <textarea> clips
                      anything past its own height when printed, so the typed
                      answer is mirrored into a <p> that print shows instead.
       field--empty   print the empty control as space to write in, so an
                      unfilled module comes out as a usable paper worksheet.

     The mirror is display:none on screen and never focusable. */
  function setFieldState(wrap, value) {
    wrap.classList.add(value ? "field--filled" : "field--empty");
    wrap.classList.remove(value ? "field--empty" : "field--filled");
  }

  /* opts: id, label, labelExtra, block, inputClass, multiline, value, onInput */
  function textField(opts) {
    var value = opts.value || "";
    var mirror = h("p", { class: "field__print" }, [value]);
    var wrap;

    var input = h(opts.multiline ? "textarea" : "input", {
      class: "field__input" + (opts.inputClass ? " " + opts.inputClass : ""),
      type: opts.multiline ? null : "text",
      id: opts.id,
      value: value,
      placeholder: opts.placeholder,
      // "input" rather than "change": nothing is lost if the tab is closed
      // mid-sentence.
      on: { input: function (e) {
        opts.onInput(e.target.value);
        replace(mirror, [e.target.value]);
        setFieldState(wrap, e.target.value);
      } }
    });

    wrap = h("div", { class: "field" + (opts.block ? " " + opts.block : "") }, [
      h("label", { class: "field__label", htmlFor: opts.id, text: opts.label },
        // Screen-reader-only text that tells otherwise identical labels apart.
        opts.labelExtra
          ? [" ", h("span", { class: "u-visually-hidden", text: opts.labelExtra })]
          : null),
      input,
      mirror
    ]);

    setFieldState(wrap, value);
    return wrap;
  }

  /* opts: name, legend, block, value, onChange */
  function rating(opts) {
    return h("fieldset", { class: "rating" + (opts.block ? " " + opts.block : "") }, [
      h("legend", { class: "rating__legend", text: opts.legend }),
      h("div", { class: "rating__options" }, map(CONTENT.ratings, function (choice) {
        var id = opts.name + "-" + choice.id;
        return h("div", { class: "rating__option rating__option--" + choice.id }, [
          h("input", {
            class: "rating__input",
            type: "radio",
            name: opts.name,
            id: id,
            value: choice.id,
            checked: opts.value === choice.id,
            on: { change: function (e) {
              if (e.target.checked) { opts.onChange(choice.id); }
            } }
          }),
          h("label", { class: "rating__label", htmlFor: id, text: choice.label })
        ]);
      }))
    ]);
  }

  // A <section> named by its own heading.
  function titledSection(block, title, titleId, children) {
    return h("section", { class: "module__section " + block, "aria-labelledby": titleId },
      [h("h2", { class: "screen__section-title " + block + "__title",
                 id: titleId, text: title })].concat(children || []));
  }

  /* -------------------------------------------------------------------------
     Module screen — built from content, in the order the brief sets out
     ---------------------------------------------------------------------- */

  function centralQuestion(mod) {
    return h("section", { class: "module__central central-question",
                          "aria-labelledby": "central-question-title" }, [
      h("h2", { class: "central-question__label", id: "central-question-title",
                text: labels().centralQuestionLabel }),
      h("p", { class: "central-question__text", text: mod.centralQuestion })
    ]);
  }

  function promptBlock(mod, prompt, index) {
    var number = (index < 9 ? "0" : "") + (index + 1);   // 01, 02 … 10
    return h("li", { class: "prompt-list__item prompt" }, [
      h("h3", { class: "prompt__question" }, [
        h("span", { class: "prompt__number", text: number }),
        " ",
        h("span", { class: "prompt__text", text: prompt.question })
      ]),
      prompt.guidance && h("p", { class: "prompt__guidance", text: prompt.guidance }),
      rating({
        name: fieldId("rating", mod.id, prompt.id),
        legend: labels().ratingLegend,
        block: "prompt__rating",
        value: STATE.getRating(mod.id, prompt.id),
        onChange: function (value) { STATE.setRating(mod.id, prompt.id, value); }
      }),
      textField({
        id: fieldId("answer", mod.id, prompt.id),
        label: labels().answerLabel,
        placeholder: labels().answerPlaceholder,
        block: "prompt__answer",
        inputClass: "field__input--answer",
        multiline: true,
        value: STATE.getAnswer(mod.id, prompt.id),
        onInput: function (value) { STATE.setAnswer(mod.id, prompt.id, value); }
      }),
      IS_TEST_BUILD && promptFeedback(mod, prompt)
    ]);
  }

  /* Feedback on the prompt, NOT an answer to it: separate branch of state,
     separate block in the markup, collapsed by default. <details> does the
     collapsing with no JS; where it is unsupported the field simply shows. */
  function promptFeedback(mod, prompt) {
    return h("div", { class: "prompt__feedback feedback" }, [
      h("details", { class: "feedback__disclosure", on: { toggle: function (e) {
        if (e.target.open) { TELEMETRY.record("feedback_opened", { moduleId: mod.id, promptId: prompt.id }); }
      } } }, [
        h("summary", { class: "feedback__summary", text: labels().promptFeedbackSummary }),
        h("h4", { class: "feedback__heading", text: labels().promptFeedbackHeading }),
        textField({
          id: fieldId("pfeedback", mod.id, prompt.id),
          label: labels().promptFeedbackLabel,
          block: "feedback__body",
          inputClass: "field__input--feedback",
          multiline: true,
          value: STATE.getPromptFeedback(mod.id, prompt.id),
          onInput: function (value) { STATE.setPromptFeedback(mod.id, prompt.id, value); }
        })
      ])
    ]);
  }

  function promptsSection(mod) {
    return titledSection("prompts", labels().promptsTitle, "prompts-title", [
      h("p", { class: "prompts__intro", text: labels().promptsIntro }),
      h("ol", { class: "prompt-list" }, map(mod.prompts, function (prompt, index) {
        return promptBlock(mod, prompt, index);
      }))
    ]);
  }

  function overallRating(mod) {
    return h("div", { class: "module__section module__overall" }, [
      rating({
        name: fieldId("modrating", mod.id),
        legend: labels().moduleRatingLegend,
        block: "rating--module",
        value: STATE.getModuleRating(mod.id),
        onChange: function (value) { STATE.setModuleRating(mod.id, value); }
      })
    ]);
  }

  function ideasSection(mod) {
    return titledSection("ideas", labels().ideasTitle, "ideas-title", [
      h("ul", { class: "ideas__list" }, map(mod.ideasForAction, function (idea) {
        // The title is optional: most ideas are a paragraph under the
        // section heading, and an empty h3 would break the heading order.
        return h("li", { class: "ideas__item" }, [
          idea.title && h("h3", { class: "ideas__item-title", text: idea.title }),
          h("p", { class: "ideas__item-body", text: idea.body })
        ]);
      }))
    ]);
  }

  function nextStepsSection(mod) {
    var lines = [];
    var i;
    for (i = 0; i < STATE.NEXT_STEP_COUNT; i++) {
      lines.push(h("li", { class: "next-steps__item" }, [nextStepField(mod, i)]));
    }
    return titledSection("next-steps", labels().nextStepsTitle, "next-steps-title", [
      h("ol", { class: "next-steps__list" }, lines)
    ]);
  }

  function nextStepField(mod, index) {
    return textField({
      id: fieldId("next", mod.id, index),
      label: labels().nextStepPrefix,
      labelExtra: String(index + 1),
      block: "next-steps__field",
      inputClass: "field__input--next-step",
      multiline: false,
      value: STATE.getNextStep(mod.id, index),
      onInput: function (value) { STATE.setNextStep(mod.id, index, value); }
    });
  }

  function moduleFeedback(mod) {
    return h("section", { class: "module__section feedback feedback--module",
                          "aria-labelledby": "module-feedback-title" }, [
      h("h2", { class: "screen__section-title feedback__title",
                id: "module-feedback-title", text: labels().moduleFeedbackTitle }),
      textField({
        id: fieldId("mfeedback", mod.id),
        label: labels().moduleFeedbackLabel,
        block: "feedback__body",
        inputClass: "field__input--feedback",
        multiline: true,
        value: STATE.getModuleFeedback(mod.id),
        onInput: function (value) { STATE.setModuleFeedback(mod.id, value); }
      })
    ]);
  }

  /* Save a copy and Review & Export, at the foot of a conversation — the
     point at which a group has finished talking. The same two are in the
     working bar at the top; this is the pair people reach by scrolling.
     Printing a single module is no longer offered here; Review & Export still
     carries Print / Save as PDF, and window.print() is untouched. */
  function moduleActions() {
    return h("div", { class: "module__section module__actions" }, [
      h("button", {
        type: "button",
        class: "module__save",
        text: labels().saveProgress,
        on: { click: function () { openSaveDialog(); } }
      }),
      h("a", { class: "module__review", href: "#/review", text: labels().review })
    ]);
  }

  function renderModule(moduleId) {
    var mod = moduleId ? findById(CONTENT.modules, moduleId) : null;

    if (moduleId && !mod) {
      fill("module-title", [labels().moduleNotFoundTitle || ""]);
      fill("module-intro", []);
      fill("module-picker", [modulePicker(null)]);
      fill("module-body", [h("p", { class: "notice", text: labels().moduleNotFound })]);
      return;
    }

    // Hook for the per-module colour, see css/tokens.css.
    byId("screen-module").setAttribute("data-module", mod ? mod.id : "");

    // The heading and the grid are the same either way: this screen is always
    // the choice of module. Choosing one only collapses the cards and opens
    // the conversation below them.
    fill("module-title", [labels().moduleListTitle]);
    fill("module-intro", mod ? [] : [labels().moduleListIntro]);
    fill("module-picker", [modulePicker(mod ? mod.id : null)]);

    if (!mod) {
      fill("module-body", []);
      return;
    }

    /* The conversation takes its accessible name from the selected card's
       question, so a screen reader announces which conversation this is
       without the question being written on the screen twice. */
    fill("module-body", [
      h("section", {
        class: "conversation",
        id: "conversation",
        tabIndex: -1,
        "aria-labelledby": questionId(mod)
      }, [
        metaList("module__meta", mod, true),        // stage and stakeholder groups
        centralQuestion(mod),                       // the central question
        promptsSection(mod),                        // the prompts
        overallRating(mod),                         // overall rating for the module
        ideasSection(mod),                          // ideas for taking action
        nextStepsSection(mod),                      // next steps
        IS_TEST_BUILD && moduleFeedback(mod),       // feedback on the whole module
        moduleActions()                             // save and review
      ])
    ]);
  }

  /* -------------------------------------------------------------------------
     Review screen — everything entered, from the same write-up structure the
     Word document is built from (js/export.js), plus the export options.
     ---------------------------------------------------------------------- */

  function reviewPrompt(p) {
    return h("li", { class: "review__prompt" }, [
      h("h3", { class: "review__question" }, [
        h("span", { class: "review__number", text: String(p.number) }), " ", p.question
      ]),
      p.answer
        ? h("p", { class: "review__answer", text: p.answer })
        : h("p", { class: "review__answer review__answer--empty", text: labels().noAnswer }),
      h("p", { class: "review__rating" + (p.rating ? "" : " review__rating--empty"),
               text: labels().ratingPrefix + ": " + (p.rating || labels().noRating) })
    ]);
  }

  function reviewNextSteps(m) {
    var steps = m.nextSteps.filter(function (step) { return !!step; });
    return [
      h("h3", { class: "review__subtitle", text: labels().nextStepsTitle }),
      steps.length
        ? h("ol", { class: "review__next-steps" }, map(steps, function (step) {
            return h("li", { class: "review__next-step" }, [
              h("span", { class: "review__next-step-prefix", text: labels().nextStepPrefix }), " ", step
            ]);
          }))
        : h("p", { class: "review__answer review__answer--empty", text: labels().noNextSteps })
    ];
  }

  function reviewModule(m) {
    var titleId = "review-" + m.id + "-title";
    var body = m.touched
      ? [
          h("p", { class: "review__central-question", text: m.centralQuestion }),
          h("ol", { class: "review__prompts" }, map(m.prompts, reviewPrompt)),
          h("p", { class: "review__module-rating" + (m.moduleRating ? "" : " review__rating--empty"),
                   text: labels().overallRatingPrefix + ": " + (m.moduleRating || labels().noRating) })
        ].concat(reviewNextSteps(m))
      : [h("p", { class: "review__not-started", text: labels().reviewNotStarted })];

    return h("section", {
      class: "review__module" + (m.touched ? "" : " review__module--empty"),
      "aria-labelledby": titleId
    }, [
      h("h2", { class: "screen__section-title review__module-title", id: titleId }, [
        h("span", { class: "review__module-letter", text: "Module " + m.letter }), " ",
        h("span", { class: "review__module-name", text: m.title })
      ])
    ].concat(body, [
      h("p", { class: "review__edit" }, [
        h("a", { class: "review__edit-link", href: "#/module/" + m.id, text: labels().reviewEditModule })
      ])
    ]));
  }

  /* TEST BUILDS ONLY: one button, one payload, one fallback. See telemetry.js. */
  function sendBlock() {
    var status = h("p", { class: "send__status", role: "status", "aria-live": "polite" });
    var button = h("button", { type: "button", class: "send__button", text: labels().sendButton,
      on: { click: function () {
        if (!STATE.hasContent()) { replace(status, [labels().sendNothing]); return; }
        button.disabled = true;
        replace(status, [labels().sendSending]);
        TELEMETRY.submit(function (result) {
          button.disabled = false;
          status.setAttribute("data-result", result);
          replace(status, [result === "sent" ? labels().sendSent : labels().sendDownloaded]);
        });
      } } });

    return h("div", { class: "export__send send" }, [
      h("h3", { class: "send__title", text: labels().sendTitle }),
      h("p", { class: "send__intro", text: labels().sendIntro }),
      button,
      status
    ]);
  }

  function exportActions() {
    return h("section", { class: "review__export export", "aria-labelledby": "export-title" }, [
      h("h2", { class: "screen__section-title export__title", id: "export-title", text: labels().exportTitle }),
      h("div", { class: "export__actions" }, [
        h("button", { type: "button", class: "export__word", text: labels().exportWord,
          on: { click: function () {
            TELEMETRY.record("export_word", {});
            EXPORT.exportWriteUp("doc");
          } } }),
        h("button", { type: "button", class: "export__print", text: labels().exportPrint,
          on: { click: function () {
            TELEMETRY.record("print", { screen: "review" });
            window.print();
          } } })
      ]),
      IS_TEST_BUILD && sendBlock()
    ]);
  }

  /* Only the modules the group has entered something in are shown, so the
     screen is as long as their work and no longer. Export follows the
     reading, so people review first and then take a copy. */
  function renderReview() {
    var writeUp = EXPORT.buildWriteUp();
    var anything = STATE.hasContent();
    var touched = writeUp.modules.filter(function (m) { return m.touched; });

    fill("review-title", [labels().review || ""]);
    fill("review-intro", [labels().reviewIntro || ""]);
    fill("review-body", [
      !anything && h("p", { class: "review__empty", text: labels().reviewEmpty })
    ].concat(map(touched, reviewModule), [anything && exportActions()]));
  }

  /* -------------------------------------------------------------------------
     Saving and loading

     Three levels, and the status line is how anyone finds out which of them
     actually happened. See js/state.js.
     ---------------------------------------------------------------------- */

  var STATUS_LABELS = {
    "empty": "statusEmpty",
    "stored-only": "statusStoredOnly",
    "no-storage": "statusNoStorage",
    "downloaded": "statusDownloaded",
    "error": "statusLoadFailed"
  };

  var shownStatus = null;

  /* The status line is an aria-live region, so it is only touched when the
     status genuinely changes — rewriting it on every keystroke would make a
     screen reader announce it on every keystroke. */
  function renderSaveStatus(key) {
    var node = byId("save-status");
    if (!node || key === shownStatus) { return; }
    shownStatus = key;
    node.setAttribute("data-status", key);
    fill("save-status", [labels()[STATUS_LABELS[key]] || ""]);
  }

  /* --- the two dialogues ------------------------------------------------

     Saving and loading both stop for a moment to explain the file, because
     the file is the only thing that carries work to another day or another
     machine. <dialog>.showModal() gives the backdrop, the focus trap and
     Escape for nothing; where it is missing, open() falls straight through
     to the direct behaviour rather than leaving someone stuck.
     -------------------------------------------------------------------- */

  // Focus goes back where it came from on close. Modern browsers restore it
  // themselves, older ones do not, so it is done here either way.
  var dialogOpener = null;

  function openDialog(id, fallback) {
    var dlg = byId(id);
    if (!dlg || !dlg.showModal) { fallback(); return; }
    dialogOpener = document.activeElement;
    dlg.showModal();
  }

  function closeDialog(id) {
    var dlg = byId(id);
    if (dlg && dlg.open) { dlg.close(); }
    if (dialogOpener && dialogOpener.focus) { dialogOpener.focus(); }
    dialogOpener = null;
  }

  /* The download is gated on the tick: the box is the acknowledgement, so
     the button cannot be reached without it. Reset on every opening. */
  function openSaveDialog() {
    var tick = byId("save-dialog-confirm");
    if (tick) {
      tick.checked = false;
      byId("save-dialog-go").disabled = true;
    }
    openDialog("save-dialog", saveCopy);
  }

  function wireDialogs() {
    var tick = byId("save-dialog-confirm");
    var go = byId("save-dialog-go");

    fill("save-dialog-title", [labels().saveDialogTitle]);
    fill("save-dialog-body", [labels().saveDialogBody]);
    fill("save-dialog-confirm-label", [labels().saveDialogConfirm]);
    fill("save-dialog-go", [labels().saveDialogGo]);
    fill("save-dialog-cancel", [labels().dialogCancel]);

    fill("load-dialog-title", [labels().loadDialogTitle]);
    fill("load-dialog-body", [labels().loadDialogBody]);
    fill("load-dialog-choose", [labels().loadDialogChoose]);
    fill("load-dialog-cancel", [labels().dialogCancel]);

    tick.addEventListener("change", function () { go.disabled = !tick.checked; }, false);

    go.addEventListener("click", function () {
      closeDialog("save-dialog");
      saveCopy();
    }, false);

    byId("save-dialog-cancel").addEventListener("click", function () {
      closeDialog("save-dialog");
    }, false);

    byId("load-dialog-cancel").addEventListener("click", function () {
      closeDialog("load-dialog");
    }, false);
  }

  var confirmTimer = null;

  /* Downloads the copy and says so. The confirmation is a live region that
     takes itself away again: nothing to dismiss. */
  function saveCopy() {
    var note = byId("save-confirm");
    if (!STATE.download()) { return; }
    TELEMETRY.record("progress_saved", {});
    fill("save-confirm", [labels().saveConfirm]);
    note.hidden = false;
    if (confirmTimer) { window.clearTimeout(confirmTimer); }
    confirmTimer = window.setTimeout(function () { note.hidden = true; }, 8000);
  }

  function wireProgressControls() {
    var loadInput = byId("load-progress");

    fill("progress-title", [labels().progressTitle]);
    fill("save-progress", [labels().saveProgress]);
    fill("save-help", [labels().saveHelp]);
    fill("progress-review", [labels().review]);
    // No title attribute: it would compete with the button's own text as the
    // accessible name. What the file is for is said in the dialogue instead.
    fill("load-progress-button", [labels().loadProgress]);

    wireDialogs();

    byId("save-progress").addEventListener("click", openSaveDialog, false);
    byId("load-progress-button").addEventListener("click", function () {
      // Without <dialog> the picker opens straight away, as it used to.
      openDialog("load-dialog", function () { loadInput.click(); });
    }, false);

    // Destructive, so it asks first — but only when there is something to lose.
    fill("reset-progress", [labels().startFresh]);
    byId("reset-progress").addEventListener("click", function () {
      if (STATE.hasContent() && !window.confirm(labels().startFreshConfirm)) { return; }
      STATE.reset();
    }, false);

    loadInput.addEventListener("change", function () {
      var file = loadInput.files && loadInput.files[0];
      if (!file) { return; }
      closeDialog("load-dialog");
      STATE.importFile(file, function (ok) {
        if (ok) { TELEMETRY.record("progress_loaded", {}); }
        if (!ok) { renderSaveStatus("error"); }
        // Clear the input so the same file can be chosen again after a failure.
        loadInput.value = "";
      });
    }, false);
  }

  /* -------------------------------------------------------------------------
     Routing
     ---------------------------------------------------------------------- */

  /* Where Back goes from each screen. A step up the journey rather than the
     browser's history, so it behaves the same however someone arrived —
     including on a deep link — and never leaves the tool. */
  var BACK_TO = {
    how: "#/",
    guidelines: "#/how",
    module: "#/how",
    review: "#/modules"
  };

  function renderBack(name, moduleId) {
    var back = byId("nav-back");
    // Welcome is the start of the journey: nothing to go back to.
    byId("site-header-back").hidden = (name === "welcome");
    back.setAttribute("href", moduleId ? "#/modules" : (BACK_TO[name] || "#/"));
  }

  var SCREEN_IDS = {
    welcome: "screen-welcome",
    how: "screen-how",
    guidelines: "screen-guidelines",
    module: "screen-module",
    review: "screen-review"
  };
  var TITLE_IDS = {
    welcome: "welcome-title",
    how: "how-title",
    guidelines: "guidelines-title",
    module: "module-title",
    review: "review-title"
  };

  var hasRendered = false;
  var shownScreen = null;

  function parseHash() {
    var raw = window.location.hash.replace(/^#/, "");
    var parts = raw.split("/");
    var clean = [];
    var i;

    for (i = 0; i < parts.length; i++) {
      if (parts[i] !== "") { clean.push(parts[i]); }
    }

    if (clean[0] === "module" && clean[1]) { return { name: "module", moduleId: clean[1] }; }
    if (clean[0] === "modules") { return { name: "module", moduleId: null }; }
    if (clean[0] === "review") { return { name: "review", moduleId: null }; }
    if (clean[0] === "how") { return { name: "how", moduleId: null }; }
    if (clean[0] === "guidelines") { return { name: "guidelines", moduleId: null }; }

    // Routes start with a slash. Anything else is an in-page anchor, and the
    // only ones left are the guidelines index: #guidelines-who, #guidelines-tips…
    if (raw && raw.charAt(0) !== "/") { return { name: "guidelines", moduleId: null, anchor: raw }; }
    return { name: "welcome", moduleId: null };
  }

  function showScreen(name) {
    var key;
    // css/layout.css uses this to decide where the working bar belongs.
    document.body.setAttribute("data-screen", name);
    for (key in SCREEN_IDS) {
      if (Object.prototype.hasOwnProperty.call(SCREEN_IDS, key)) {
        byId(SCREEN_IDS[key]).hidden = (key !== name);
      }
    }
  }

  function markCurrentNavLink(name) {
    var links = document.querySelectorAll(".nav__link");
    var i;
    for (i = 0; i < links.length; i++) {
      if (links[i].getAttribute("data-route") === name) {
        links[i].setAttribute("aria-current", "page");
      } else {
        links[i].removeAttribute("aria-current");
      }
    }
  }

  function route() {
    var current = parseHash();
    var heading, target = null;

    if (current.name === "welcome") { renderWelcome(); }
    if (current.name === "how") { renderHow(); }
    if (current.name === "guidelines") {
      // Moving between sections of a page already on show must not rebuild it
      // under the reader.
      if (shownScreen !== "guidelines") { renderGuidelines(); }
      target = current.anchor ? byId(current.anchor) : null;
    }
    if (current.name === "module") { renderModule(current.moduleId); }
    if (current.name === "review") { renderReview(); }

    // All no-ops in a release build. A module is only "opened" once one is
    // chosen; the picker on its own is not a conversation.
    if (current.name === "module" && current.moduleId) { TELEMETRY.moduleOpened(current.moduleId); }
    else { TELEMETRY.moduleClosed(); }
    TELEMETRY.record("navigation", { to: current.name, moduleId: current.moduleId, anchor: current.anchor });

    showScreen(current.name);
    // The working bar belongs to a conversation, not to choosing one.
    document.body.classList.toggle("has-conversation",
      current.name === "module" && !!current.moduleId);
    markCurrentNavLink(current.name);
    renderBack(current.name, current.moduleId);
    shownScreen = current.name;

    // The browser could not scroll to the anchor itself: the section was
    // hidden, or not yet rendered, when the hash changed. Do it now.
    // A module was chosen: move to the conversation that just opened, but
    // leave the scroll position alone so the grid stays where it was.
    if (current.name === "module" && current.moduleId && hasRendered) {
      heading = byId("conversation");
      if (heading) {
        try { heading.focus({ preventScroll: true }); } catch (e) { heading.focus(); }
      }
    } else if (target) {
      target.scrollIntoView(true);
      if (hasRendered) { (target.querySelector("[tabindex]") || target).focus(); }
    } else if (hasRendered) {
      // Move focus to the new screen's heading so keyboard and screen reader
      // users land in the right place. Not on first paint — that would be rude.
      heading = byId(TITLE_IDS[current.name]);
      if (heading) { heading.focus(); }
      window.scrollTo(0, 0);
    }
    hasRendered = true;
  }

  /* -------------------------------------------------------------------------
     Start
     ---------------------------------------------------------------------- */

  function start() {
    // This one string cannot live in the content file, because the content file
    // is the thing that failed to load.
    if (!CONTENT || !CONTENT.modules) {
      byId("content-error").hidden = false;
      byId("content-error").appendChild(document.createTextNode(
        "The content file could not be loaded. Check that content/modules.js is " +
        "present in the folder next to index.html."
      ));
      return;
    }

    document.title = (CONTENT.meta && CONTENT.meta.title) || document.title;

    // Chrome that never changes, rendered once.
    fill("masthead-brand", [CONTENT.meta.title]);
    fill("masthead-beta", [labels().beta]);
    fill("nav-back", [labels().back]);
    fill("nav-review", [labels().review]);
    renderAttribution();

    // Pick up an autosave from a previous session, if there is one and if this
    // browser is storing anything at all.
    STATE.start();
    TELEMETRY.start();
    wireProgressControls();
    // The gate used to mark the session's start; without it, loading does.
    TELEMETRY.record("session_started", {});

    STATE.onChange(function (detail) {
      // A whole-object change — a loaded file, or a reset — means the fields on
      // screen are stale. Everything else is already in sync, because the field
      // the user is typing in is the thing that wrote to state.
      if (detail.branch === "all") { shownScreen = null; route(); }
      renderSaveStatus(STATE.status());
    });
    renderSaveStatus(STATE.status());

    if (window.addEventListener) {
      window.addEventListener("hashchange", route, false);
      // Warn on close whenever there is work that is not in a file.
      //
      // All three lines are needed, and an EMPTY string in the last two would
      // suppress the dialog rather than raise it:
      //   preventDefault  modern browsers
      //   returnValue     older Chrome and Edge
      //   return value    older browsers still, which showed this text
      // Anything current ignores the wording and shows its own.
      window.addEventListener("beforeunload", function (e) {
        if (!STATE.isDirty()) { return undefined; }
        e.preventDefault();
        e.returnValue = labels().unsavedWarning;
        return labels().unsavedWarning;
      }, false);
    } else {
      window.onhashchange = route;
    }

    route();
  }

  start();

}());
