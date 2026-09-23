/* =============================================================================
   ESC — export
   =============================================================================
   Everything that turns the session into a file the group keeps.

   ONE TRAVERSAL, SEVERAL OUTPUTS
   buildWriteUp() walks the content and the answers once and returns a plain,
   neutral structure. The review screen (js/app.js) renders that structure; the
   Word writer below turns the same structure into a document. Neither knows
   anything about the other, and a new output format only needs a new writer.

   THE WORD DOCUMENT IS NOT A REAL .docx
   It is an HTML document in a Blob with the application/msword type and a .doc
   extension. Word and Google Docs both open it, it needs no library, and it
   works from file://. The trade-off is that it is not the modern format: some
   tools (and some corporate mail filters) treat .doc with suspicion, and there
   is no control over styles beyond what HTML gives.

   A real .docx writer slots in as another entry in WRITERS: same input, a Blob
   out. Nothing else changes.

   Everything here works from file:// as well as over http.
   ========================================================================== */

window.ESC_EXPORT = (function () {
  "use strict";

  /* -------------------------------------------------------------------------
     File plumbing
     ---------------------------------------------------------------------- */

  function saveBlob(blob, filename) {
    var url, link;

    // Old Edge and IE took a different route to the same place.
    if (window.navigator && window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, filename);
      return true;
    }

    if (!window.URL || !window.URL.createObjectURL) { return false; }

    url = window.URL.createObjectURL(blob);
    link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // Some browsers only follow a click on a link that is in the document.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Let the download start before the object URL is released.
    window.setTimeout(function () { window.URL.revokeObjectURL(url); }, 1000);
    return true;
  }

  // 2026-09-21, from the machine's own clock rather than UTC.
  function dateStamp() {
    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    return now.getFullYear() + "-" + (month < 10 ? "0" : "") + month +
           "-" + (day < 10 ? "0" : "") + day;
  }

  // Group code made safe for a filename.
  function fileSafe(text) {
    return String(text || "").replace(/[^A-Za-z0-9_-]+/g, "-");
  }

  /* -------------------------------------------------------------------------
     The write-up: content + answers, walked once
     ---------------------------------------------------------------------- */

  function map(list, fn) {
    var out = [];
    var i;
    for (i = 0; list && i < list.length; i++) { out.push(fn(list[i], i)); }
    return out;
  }

  function labelOf(list, id) {
    var i;
    for (i = 0; list && i < list.length; i++) {
      if (list[i].id === id) { return list[i].label; }
    }
    return "";
  }

  function moduleWriteUp(content, state, mod) {
    var touched = false;
    var rating;

    var prompts = map(mod.prompts, function (prompt, index) {
      var answer = state.getAnswer(mod.id, prompt.id);
      var ratingId = state.getRating(mod.id, prompt.id);
      if (answer || ratingId) { touched = true; }
      return {
        number: index + 1,
        question: prompt.question,
        guidance: prompt.guidance,
        answer: answer,
        rating: labelOf(content.ratings, ratingId)
      };
    });

    var nextSteps = [];
    var i;
    for (i = 0; i < state.NEXT_STEP_COUNT; i++) {
      nextSteps.push(state.getNextStep(mod.id, i));
      if (nextSteps[i]) { touched = true; }
    }

    rating = state.getModuleRating(mod.id);
    if (rating) { touched = true; }

    return {
      id: mod.id,
      letter: mod.letter,
      title: mod.title,
      stage: map(mod.useFromStages, function (id) { return labelOf(content.stages, id); }).join(", "),
      groups: map(mod.useWith, function (id) { return labelOf(content.stakeholderGroups, id); }),
      centralQuestion: mod.centralQuestion,
      prompts: prompts,
      moduleRating: labelOf(content.ratings, rating),
      nextSteps: nextSteps,
      ideas: mod.ideasForAction || [],
      // Did the group enter anything at all in this module?
      touched: touched
    };
  }

  function buildWriteUp() {
    var content = window.ESC_CONTENT;
    var state = window.ESC_STATE;
    var labels = (content.meta && content.meta.labels) || {};

    return {
      title: content.meta.title,
      subtitle: labels.docSubtitle || "",
      date: dateStamp(),
      groupCode: state.getGroupCode(),
      labels: labels,
      modules: map(content.modules, function (mod) {
        return moduleWriteUp(content, state, mod);
      })
    };
  }

  /* -------------------------------------------------------------------------
     Writer: Word-openable .doc (HTML inside)
     ---------------------------------------------------------------------- */

  // Everything typed by a person goes through here before it touches markup.
  function esc(text) {
    return String(text === null || text === undefined ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // A paragraph that keeps the line breaks people typed.
  function para(text, className) {
    return "<p class=\"" + className + "\">" +
      esc(text).replace(/\r?\n/g, "<br>") + "</p>";
  }

  function docPrompt(p, labels) {
    return [
      "<h3>" + p.number + ". " + esc(p.question) + "</h3>",
      para(p.guidance, "guidance"),
      p.answer ? para(p.answer, "answer") : para(labels.noAnswer, "empty"),
      "<p class=\"rating\">" + esc(labels.ratingPrefix) + ": " +
        esc(p.rating || labels.noRating) + "</p>"
    ].join("\n");
  }

  function docModule(m, labels) {
    var parts = [
      "<h2>Module " + esc(m.letter) + ". " + esc(m.title) + "</h2>",
      "<p class=\"meta\">" + esc(labels.stageLabel) + ": " + esc(m.stage) +
        " &middot; " + esc(labels.useWithLabel) + ": " + esc(m.groups.join(", ")) + "</p>",
      para(m.centralQuestion, "central")
    ];

    parts = parts.concat(map(m.prompts, function (p) { return docPrompt(p, labels); }));

    parts.push("<p class=\"rating\"><strong>" + esc(labels.overallRatingPrefix) + ":</strong> " +
      esc(m.moduleRating || labels.noRating) + "</p>");

    if (m.ideas.length) {
      parts.push("<h3>" + esc(labels.ideasTitle) + "</h3><ul>" +
        map(m.ideas, function (idea) {
          return "<li><strong>" + esc(idea.title) + "</strong> " + esc(idea.body) + "</li>";
        }).join("") + "</ul>");
    }

    parts.push("<h3>" + esc(labels.nextStepsTitle) + "</h3>");
    var steps = map(m.nextSteps, function (s) { return s; }).filter(function (s) { return !!s; });
    parts.push(steps.length
      ? "<ol>" + map(steps, function (s) {
          return "<li>" + esc(labels.nextStepPrefix) + " " + esc(s) + "</li>";
        }).join("") + "</ol>"
      : para(labels.noNextSteps, "empty"));

    return parts.join("\n");
  }

  function buildDocHtml(w) {
    var labels = w.labels;
    var touched = w.modules.filter(function (m) { return m.touched; });
    var body = [
      "<h1>" + esc(w.title) + (w.subtitle ? " &mdash; " + esc(w.subtitle) : "") + "</h1>",
      "<p class=\"meta\">" + esc(labels.docDateLabel) + ": " + esc(w.date) +
        (w.groupCode ? " &middot; " + esc(labels.docGroupCodeLabel) + ": " + esc(w.groupCode) : "") +
        "</p>"
    ];

    body = body.concat(touched.length
      ? map(touched, function (m) { return docModule(m, labels); })
      : [para(labels.reviewEmpty, "empty")]);

    /* Word reads the <style> block and the @page rule. The styles are the
       plainest readable defaults; they are the designer's to change. */
    return [
      "<!DOCTYPE html>",
      "<html><head><meta charset=\"utf-8\">",
      "<title>" + esc(w.title) + "</title>",
      "<style>",
      "@page { size: A4; margin: 2cm; }",
      "body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.4; }",
      "h1 { font-size: 18pt; } h2 { font-size: 14pt; margin-top: 24pt; } h3 { font-size: 12pt; margin-top: 14pt; }",
      ".meta { color: #555555; } .guidance { color: #555555; } .central { font-size: 13pt; }",
      ".empty { color: #777777; font-style: italic; } .rating { color: #333333; }",
      "</style></head><body>",
      body.join("\n"),
      "</body></html>"
    ].join("\n");
  }

  /* Every writer takes the neutral write-up and returns a Blob. To add a real
     .docx later: write buildDocxBlob(writeUp) and add it here. Nothing else in
     the tool needs to change. */
  var WRITERS = {
    doc: {
      extension: "doc",
      mime: "application/msword",
      build: function (writeUp) {
        // The byte-order mark tells Word the file is UTF-8 before it reads it.
        return new Blob(["﻿", buildDocHtml(writeUp)], { type: "application/msword" });
      }
    }
  };

  function exportWriteUp(format) {
    var writer = WRITERS[format];
    var writeUp = buildWriteUp();
    if (!writer) { return false; }
    return saveBlob(
      writer.build(writeUp),
      "Education Scalability Conversations - write-up" +
        (writeUp.groupCode ? " - " + fileSafe(writeUp.groupCode) : "") +
        " - " + writeUp.date + "." + writer.extension
    );
  }

  return {
    saveBlob: saveBlob,
    dateStamp: dateStamp,
    fileSafe: fileSafe,
    buildWriteUp: buildWriteUp,
    exportWriteUp: exportWriteUp,
    formats: WRITERS
  };

}());
