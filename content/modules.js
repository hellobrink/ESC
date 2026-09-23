/* =============================================================================
   EDUCATION SCALABILITY CONVERSATIONS — CONTENT FILE
   =============================================================================

   THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE THE WORDS IN THE TOOL.
   You do not need to know how to code. You do need to be careful with
   punctuation, because a missing comma or quote mark will stop the tool loading.

   THE FIVE RULES
   --------------
   1. Every piece of text sits between "double quotes".
   2. Every item in a list ends with a comma, except you may leave the comma off
      the last one.
   3. If your text contains a double quote mark, write it as \" (backslash then
      quote). Apostrophes are fine as they are: don't, we're, learners'.
   4. Never change the words on the LEFT of a colon (title:, guidance:, id:).
      They are the labels the code looks for. Change the words on the RIGHT.
   5. An "id" is an internal name. It must be lower case, no spaces, and it must
      match wherever else it is used. Changing an id will unlink saved answers,
      so avoid it once people have started using the tool.

   HOW TO CHECK YOUR EDIT
   ----------------------
   Save the file, then open index.html in a browser and press refresh. If the
   page comes up blank or shows an error, undo your last change and try again.

   WHERE THE WORDS CAME FROM
   -------------------------
   Loaded from "Text for Prototype 1" (the Google Doc) on 21 September 2026.
   Anything in [square brackets] is a gap or a query in that source document —
   search for "[" to find them all.

   WHAT IS IN THIS FILE
   --------------------
   meta                 the home screen (intro, about, instructions, guidelines),
                        the short labels used around the interface, and the
                        attribution.
   ratings              the three-way choice offered after every prompt.
   stakeholderCategories  the three headings the stakeholder list sits under.
   stakeholderGroups    the people a module can be run with.
   stages               the scaling stages a module can belong to.
   modules              the seven modules, in the order they appear.

   NOTE ON THE EU FUNDING STATEMENT
   --------------------------------
   The European Union funding statement in the footer is deliberately NOT in
   this file. It must appear verbatim on every screen and every printed page,
   so it is written directly into index.html where it cannot be edited by
   accident. Do not add it here.

   ========================================================================== */

window.ESC_CONTENT = {

  /* ===========================================================================
     META — home screen text and interface labels
     ======================================================================== */
  meta: {

    // Shown as the main heading on the home screen and in the browser tab.
    title: "Education Scalability Conversations",

    // WHERE "Download your canvas here" GOES. Paste a new link between the
    // quotes to change it. It opens in a new tab and needs an internet
    // connection; everything else in the tool works offline.
    canvasUrl: "https://www.vvob.org/sites/default/files/2025-10/USER%20GUIDE%20TO%20THE%20EDUCATION%20SCALABILITY%20CHECKLIST.pdf",

    // The short introduction under the title on the home screen.
    intro: "A set of structured conversations for teams thinking about scaling an education programme. Each module takes a group through one question in depth. One person types while everyone else talks. At the end you export what you wrote and keep it.",

    // ABOUT — the welcome text, one paragraph per line. Shown on the home
    // screen under "About".
    about: [
      "If you're reading this, it's likely that you are building or implementing something that gives children access to quality education.",
      "We believe locally-led, effective education initiatives already exist — you're probably working on one right now! The more pressing challenge is scaling them up to different contexts, while sustaining the shifts in practice, policy and structures they require. This tool helps you tackle that challenge.",
      "Underpinning this tool is the belief that conversations matter. They build shared understanding, give new ideas or insights, and can spark tangible action.",
      "Below, you will see a set of modules. Each one contains a facilitator's guide to running one focused conversation, around a specific scaling topic. This includes guidance on why it matters, who to include, key guiding questions and prompts, an example to learn from, and ideas for next steps.",
      "Each module should take roughly two hours, from planning, to running the conversation itself, to reflecting on next steps. You don't need to do everything at once — we have some tips below on which module is most relevant for where you are now.",
      "Before you dive in, we recommend you read the facilitator guidelines below. These give valuable context on how to make the most of the modules."
    ],

    // THE SIX INSTRUCTIONS, in order. Guidelines section 01.
    instructions: [
      "Pick a module. Each module focuses on a core category for scalability. Below, we have further guidance on how to choose the right conversation, based on your scaling stage.",
      "Bring together the suggested stakeholders for a 30-90 minute meeting (in person or a call), or leverage time you already have. Below, we have recommendations on who to convene for each module.",
      "Start your time together by discussing the core question. You can find this at the top of the module.",
      "Then, use the further prompts to guide your discussion. Together, we hope that this furthers your understanding of the initiative's scalability within this particular category, unlock new insights and ideas.",
      "After the conversation, take 30 mins to work through the list of prompts and capture whether you feel confident, unsure, or worried about it. Based on this, give the module an overall rating.",
      "Agree the next steps. We provide some ideas and examples on how other initiatives have improved their scalability in this category."
    ],

    // THE SIX STEPS IN SHORT, for the cards on "How to use this tool".
    // The full versions above are still shown on the Guidelines page.
    instructionsShort: [
      "Pick a module",
      "Bring together suggested stakeholders for a 30-90 minute meeting",
      "Start your time together by discussing the core question",
      "Use further prompts to guide the discussion",
      "After the conversation, take 30 minutes to work through the list of prompts",
      "Agree the next step"
    ],

    // GUIDELINES sections 02, 03 and 04. (Section 01 is the instructions above.)
    guidelines: {

      // 02 — WHEN to have each conversation. The stages themselves, with their
      // descriptions, are in the `stages` list further down.
      when: {
        title: "When to have each conversation",
        intro: [
          "It's impossible to focus on everything from the start. At the same time, we believe different moments in the scaling journey trigger different conversations.",
          "That's why we've tagged each module with a point in the scaling journey. In our experience, this is the stage from which the conversation usually becomes important. We've aligned these to the six scaling stages set out by the International Development Innovation Alliance (IDIA), a widely used framework. The four stages we focus on are:"
        ],
        outro: [
          "Note that a module doesn't stop being relevant as you move on. It stays live, and we encourage you to return to modules as your initiative scales. For example, we recommend you begin conversations on evidence of impact from the R&D phase, but deepen them as you move through subsequent stages."
        ]
      },

      // 03 — WHO to include. The grouped list itself comes from
      // `stakeholderCategories` and `stakeholderGroups` further down.
      who: {
        title: "Who to include",
        intro: [
          "This tool is targeted at a core facilitator(s), who convenes and runs each conversation. Beyond that, not all stakeholders belong in every conversation.",
          "We've also tagged each module with the people we believe matter most — either because they can bring important insights and ideas, or aligning them is crucial, or they will play a role in follow-on actions. Getting people into these strategic conversations early builds ownership, and getting the right people focuses efforts and minds. Our experience teaches us that this is critical to scaling any initiative.",
          "Here's the full list of stakeholders. You'll engage different groups at different points:"
        ]
      },

      // 04 — FACILITATOR TIPS. Each has a short title and a paragraph.
      tips: {
        title: "Facilitator tips",
        subtitle: "Five ways to get the most out of your Education Scalability Conversations.",
        items: [
          {
            title: "Have ~3 scalability conversations per year",
            body: "This equals about one day of work for the lead facilitator, per year — an investment we believe is very worthwhile to help make sure your initiative has the best possible chances of scaling, and course correct. A rhythm of roughly three scalability conversations keeps scalability a live question within your organisation and its partners."
          },
          {
            title: "Revisit the modules as you scale",
            body: "These modules are not \"one and done\". Revisit earlier modules as you talk to different stakeholders and as you grow, particularly where your confidence is low."
          },
          {
            title: "Use what's already in your calendar",
            body: "Scalability can be folded into existing touchpoints: monitoring visits to schools, review meetings with funders, or update calls with local or national government officials. You can do this by taking the core question and a smaller number of the prompts in each module, and embedding them into the existing conversations."
          },
          {
            // The source document links "this 5 minute read" to an outside web
            // page. The tool cannot open outside pages offline, so the link is
            // not included. Add a URL in the text here if you want one.
            title: "Practice generative listening",
            body: "Generative listening is a deep form of listening where you listen for new possibilities that you didn't expect or think about prior to the conversation. It involves slowing down, listening to the words, images and emotions chosen, suspending judgement, and noticing what you don't understand. You can learn more about generative listening in this 5 minute read."
          },
          {
            title: "Close the loop right away",
            body: "After the conversation, capture the key points you heard and at least one concrete next step. We provide a basic template for this in each module, with examples and ideas. Capturing this quickly helps make sure the discussion turns to action, and that knowledge on scalability is codified and builds up over time."
          }
        ]
      }
    },

    // SHORT LABELS used around the interface. Change the wording if you like,
    // but keep every label present.
    labels: {
      review: "Review & Export",

      // --- the header ---
      beta: "Beta",

      // --- 1. the welcome screen ---
      welcomeTitle: "Welcome",
      canvasCta: "Download your canvas here",
      heroCta: "Get started",

      // --- 2. how to use this tool ---
      howTitle: "How to use this tool",
      howIntro: "Six steps, from picking a module to agreeing what happens next.",
      howCta: "Let's go",
      guidelinesLink: "Read full guidelines",
      back: "Back",

      // --- the guidelines page ---
      guidelinesTitle: "Guidelines",
      guidelinesIntro: "Fuller guidance on when to hold each conversation, who to bring, and how to facilitate it well.",
      guidelinesIndexTitle: "In this section",  // read out by screen readers only
      guidelinesHowTitle: "How to use the tool",

      // --- 3. choosing a module ---
      moduleListTitle: "Choose a module",
      moduleListIntro: "Each module is a separate conversation. You do not have to do them in order.",
      stageLabel: "Use from",
      useWithLabel: "Use with",
      useWithOptionalLabel: "optional",
      // A small eyebrow above the question, not a heading.
      centralQuestionLabel: "Start your conversation from here",
      moduleNotFoundTitle: "Module not found",
      moduleNotFound: "That module could not be found. Go back to the home screen and choose one from the list.",
      attributionTitle: "Who made this",

      // --- saving and loading ---
      // The file is the dependable copy. The browser's own memory is a
      // convenience and the wording should not suggest otherwise. The
      // distinction to get across: held on this device automatically, versus
      // a file someone has deliberately saved.
      progressTitle: "Your progress",
      saveProgress: "Save a copy",
      saveHelp: "Download your progress so you can continue later.",
      // Shown briefly after the file downloads, and only then: the format is
      // named here rather than sitting on the screen the whole time.
      saveConfirm: "Copy saved. This downloads your progress as a JSON file. Keep it somewhere safe — you'll need it to continue your work later.",
      loadProgress: "Load a saved copy",

      // The two dialogues. Saving and loading both go through a step that
      // explains the file before anything happens, because the file is the
      // only thing that carries work between sessions or between devices.
      saveDialogTitle: "Before you save your progress",
      saveDialogBody: "Your progress will be downloaded as a JSON file. Keep this file somewhere safe — you’ll need to upload it when you return if you want to continue where you left off.",
      saveDialogConfirm: "I understand that I need to keep this file to restore my progress.",
      saveDialogGo: "Download progress",
      loadDialogTitle: "Load saved progress",
      loadDialogBody: "Upload the JSON file you previously downloaded to restore your saved progress and continue where you left off.",
      loadDialogChoose: "Choose file",
      // Every dialogue can be left without doing anything.
      dialogCancel: "Cancel",
      startFresh: "Start fresh",
      // Shown in the browser's own confirm box before anything is wiped.
      startFreshConfirm: "This clears everything typed so far, on every module, and cannot be undone. If you have not saved a file, that work is gone. Start fresh anyway?",
      statusEmpty: "Nothing entered yet.",
      statusStoredOnly: "✓ Changes saved on this device. To keep a copy you can return to later, save your progress as a file.",
      statusNoStorage: "Changes are not being saved on this device. Save a copy now to keep your work.",
      statusDownloaded: "✓ Saved as a file. Your copy is up to date.",
      statusLoadFailed: "That file could not be read. Check it is a progress file saved by this tool.",
      // Shown only by very old browsers when closing with work that is not in a
      // file. Everything current shows its own wording instead. Must not be empty.
      unsavedWarning: "You have not saved your progress to a file yet.",

      // --- the module screen ---
      promptsTitle: "Prompts for further discussion",
      promptsIntro: "Use these prompts to probe further. When the conversation is over, mark whether you feel confident, unsure, or concerned about the specific prompt, and write down the key evidence for this response and any other key points.",
      answerLabel: "What did your group say?",
      // Grey hint text inside the empty box. Not a label: the label above stays.
      answerPlaceholder: "Capture key points, evidence or reflections from the conversation…",
      ratingLegend: "How does your group feel about this?",
      moduleRatingLegend: "Overall, we feel...",
      ideasTitle: "Ideas for taking action",
      nextStepsTitle: "Next steps",
      nextStepPrefix: "Based on the above, I will...",

      // --- feedback on the TOOL (test builds only) ---
      // These are not questions about the initiative. They collect comments on
      // the tool itself, and they are stored and analysed separately.
      promptFeedbackSummary: "Feedback on this prompt",
      promptFeedbackHeading: "Help us improve this prompt",
      promptFeedbackLabel: "Was anything unclear, difficult to answer or missing?",
      moduleFeedbackTitle: "Help us improve this module",
      moduleFeedbackLabel: "Was anything unclear, difficult to answer or missing?",

      // --- the review screen and the exported write-up ---
      reviewIntro: "See everything entered so far across your modules and export a copy to keep.",
      reviewEmpty: "Nothing has been entered yet. Open a module from the home screen to begin.",
      reviewNotStarted: "Nothing entered in this module yet.",
      reviewEditModule: "Open this module",
      noAnswer: "No answer recorded.",
      noRating: "Not rated.",
      ratingPrefix: "Rating",
      overallRatingPrefix: "Overall",
      noNextSteps: "No next steps recorded.",
      exportTitle: "Export a copy",
      exportWord: "Download Word document",
      exportPrint: "Print / Save as PDF",
      // In the Word document only
      docSubtitle: "Write-up",
      docDateLabel: "Date",
      docGroupCodeLabel: "Group name",

      // --- TEST BUILDS ONLY: the notice and sending ---
      // None of this is shown when config.js has BUILD set to "release".
      // NOT CURRENTLY SHOWN: testing is happening in the room, with the team
      // present, so the notice is off for this round. renderWelcome() in
      // js/app.js is where it goes back.
      testNoticeTitle: "About this test version",
      testNotice: "This is a test version of the tool. To help improve it, it records your responses, your ratings, any feedback you give and how you move through the tool. It does not ask for your name or email address. Nothing leaves this computer until someone chooses Send to the team on the Review & Export screen.",
      sendTitle: "Send to the team",
      sendIntro: "Sends your answers, your feedback and the usage record to the team. Nothing that identifies you personally is included.",
      sendButton: "Send to the team",
      sendSending: "Sending...",
      sendSent: "Sent. Thank you.",
      sendDownloaded: "It could not be sent, probably because there is no connection. A file has been downloaded instead: please email it to the team.",
      sendNothing: "Nothing to send yet."
    },

    // THE ATTRIBUTION BLOCK in the footer.
    // Each entry is a line: a label, then the organisations on that line.
    attribution: [
      {
        label: "Developed by",
        organisations: ["Enabel", "in collaboration with VVOB and Brink"]
      },
      {
        label: "An updated version of the Education Scalability Checklist, originally created by",
        organisations: [
          "VVOB",
          "Brookings Center for Universal Education",
          "Educate!",
          "Management Systems International (MSI)",
          "Pratham",
          "STiR Education"
        ]
      }
    ]

  },

  /* ===========================================================================
     RATINGS
     ---------------------------------------------------------------------------
     The three-way choice offered after every prompt, and once more for the
     module as a whole. Change the labels if you like. Keep it to three unless
     you have also agreed how the extra option gets analysed — the ids are what
     get stored against every answer.
     ======================================================================== */
  ratings: [
    { id: "confident", label: "Confident" },
    { id: "unsure",    label: "Unsure" },
    { id: "concerned", label: "Concerned" }
  ],

  /* ===========================================================================
     STAKEHOLDERS
     ---------------------------------------------------------------------------
     Three headings, and the groups under them. Each module lists the group ids
     it applies to in its "useWith" line (and "useWithOptional" for the ones the
     source marks as optional). Add a group here first, then reference its id.
     ======================================================================== */
  stakeholderCategories: [
    { id: "internal",   label: "Inside your organisation" },
    { id: "government", label: "Government & the education system" },
    { id: "allies",     label: "Wider allies" }
  ],

  stakeholderGroups: [
    { id: "org-leadership",           category: "internal",   label: "Organisational Leadership (internal)" },
    { id: "frontline-staff",          category: "internal",   label: "Frontline / Field Staff (internal)" },
    { id: "finance",                  category: "internal",   label: "Finance & Budget holders (internal)" },
    { id: "me-research",              category: "internal",   label: "M&E or Research Team (internal)" },
    { id: "national-policymakers",    category: "government", label: "National policymakers" },
    { id: "local-education-officers", category: "government", label: "Local Education Officers" },
    { id: "school-leaders",           category: "government", label: "School Leaders" },
    { id: "teachers",                 category: "government", label: "Teachers & Educators" },
    { id: "caregivers-community",     category: "allies",     label: "Learners' Caregivers & Communities" },
    { id: "funders",                  category: "allies",     label: "Funders & Donors" },
    { id: "coalition-partners",       category: "allies",     label: "Coalition Partners & Influential Allies" }
  ],

  /* ===========================================================================
     STAGES OF SCALING
     ---------------------------------------------------------------------------
     The four IDIA stages the tool focuses on, in order. Each module says which
     stage(s) it is for in its "useFromStages" line. The descriptions are shown
     in Guidelines section 02.
     ======================================================================== */
  stages: [
    {
      id: "ideation",
      label: "Ideation",
      description: "Defining and analysing the development problem and generating potential solutions through horizon scanning of existing and new ideas."
    },
    {
      id: "rd",
      label: "Research and Development",
      description: "Further developing specific innovations that have potential to address the problem."
    },
    {
      id: "proof-of-concept",
      label: "Proof of Concept",
      description: "When the intellectual concept behind an innovation is field-tested to gain an early, 'real-world' assessment of its potential."
    },
    {
      id: "transition-to-scale",
      label: "Transition to Scale",
      description: "When innovations that have demonstrated small-scale success develop their model and attract partners to help fill gaps in their capacity to scale."
    }
  ],

  /* ===========================================================================
     MODULES
     ---------------------------------------------------------------------------
     Every module has the same shape. To add one, copy an entire module block
     from the { to the } and paste it after the last one, then change the id and
     the letter. Every id must be unique.

     id               internal name, lower case, no spaces. Appears in the web
                      address as index.html#/module/a
     letter           the letter shown on screen
     title            the module title
     useFromStages    one or more stage ids, from the stages list above
     useWith          one or more stakeholder group ids, from the list above
     useWithOptional  stakeholder groups the source marks as optional
     centralQuestion  the single question the whole module hangs on
     prompts          the questions the group works through, in order. Each has
                      an id, a question and a paragraph of guidance (which may
                      be empty).
     ideasForAction   short suggestions shown after the prompts, each a body
                      paragraph and an optional title. The source document has
                      not written these yet for any module.
     image            The small icon on the module's card, as a path inside
                      this folder. Set it to "" to fall back to a plain
                      placeholder square.
     ======================================================================== */
  modules: [

    /* ------------------------------------------------------------------------
       MODULE A
       --------------------------------------------------------------------- */
    {
      id: "a",
      letter: "A",
      title: "What is the initiative, and why does it matter?",
      useFromStages: ["ideation"],
      useWith: ["org-leadership", "frontline-staff", "teachers", "caregivers-community"],
      image: "icons/module-a.svg",
      useWithOptional: [],
      centralQuestion: "What's the problem we're trying to solve, and do we all agree exactly how we're solving it?",

      prompts: [
        {
          id: "a1",
          question: "Are we agreed on the problem we're trying to solve?",
          guidance: "Most education initiatives are trying to do one of three things: widen access to education, improve quality or relevance, or reduce gaps between groups of learners. Which one comes first for you, and what's the specific problem you're working on within it?"
        },
        {
          id: "a2",
          question: "How big is the problem we're solving?",
          guidance: "How long has the problem been there? How many learners or teachers does it affect? The larger and more persistent the problem, the easier it will be to build support around the initiative."
        },
        {
          id: "a3",
          question: "Could we all describe our initiative in the same way?",
          guidance: "It could be a new curriculum, teaching materials, education technology, or associated pedagogy, a course for in-service teachers or school leaders, the introduction of a new function such as mentor teacher or a new way of holding schools to account, and so on. Ask everyone to describe the initiative in a couple of sentences, and then compare notes. In particular, compare whether a user (e.g. a teacher) can describe it in the same way as the implementing organisation."
        },
        {
          id: "a4",
          question: "Which components of the initiative are essential, and which are extra?",
          guidance: "The essential parts are the ones that lead to impact, and must travel with the initiative as it scales. Everything else can be flexed to fit a new district."
        }
      ],

      ideasForAction: [
        {
          body: "If possible, populate this with ~2 ideas for next steps, ideally based on real-world actions that education initiatives have taken."
        }
      ]
    },

    /* ------------------------------------------------------------------------
       MODULE B
       --------------------------------------------------------------------- */
    {
      id: "b",
      letter: "B",
      title: "How will you scale?",
      useFromStages: ["ideation"],
      useWith: ["org-leadership", "coalition-partners"],
      image: "icons/module-b.svg",
      useWithOptional: ["national-policymakers", "local-education-officers", "funders"],
      centralQuestion: "How well do we understand our route from where we are today, to scale?",

      prompts: [
        {
          id: "b1",
          question: "Who exactly is expected to implement the initiative at a scaled-up basis?",
          // [The source sentence beginning "delivery network" is missing its
          // start; "they have the" has been supplied to make it read.]
          guidance: "When it comes to delivering public goods such as education sustainably and at scale, government institutions are essential: they have the delivery network, operational capacity, funding base and incentive structure needed to deliver education in perpetuity to large populations. While governments play an essential role in provision, as well as in setting and regulating standards and norms, there may also be other organisations involved (e.g. private partners, non-profit organisations, associations, etc). Can you name the doers involved in adopting the initiative at scale? The more specific roles and tasks you can outline here, the better."
        },
        {
          id: "b2",
          question: "Who decides on whether the initiative is adopted?",
          guidance: "How many decision makers are involved in adopting the initiative at scale? Who are they? The more specific names and decision points you can outline here, the better."
        },
        {
          id: "b3",
          question: "Which components of our initiatives are intended to scale?",
          guidance: "It's rare for the whole initiative to scale. In our experience, parts are typically dropped or heavily simplified. Answer this based on what you know about the problem and scaling partners — and expect it to change over time."
        },
        {
          id: "b4",
          question: "Who is benefitting at scale?",
          guidance: "Which teachers or learners? In which grades? In which districts? Are you aligned on a clear target group?"
        },
        {
          id: "b5",
          question: "By when will we scale?",
          guidance: "How many of our target group have we reached in 2 years? 5 years? 10 years? In our experience, 15 years from idea to scale is a good estimate."
        },
        {
          id: "b6",
          question: "How similar are the places we are scaling into to the place we started?",
          guidance: "You might think about geography, language, political structures, culture, income levels, and other factors. Scaling across more diverse contexts is harder — but crucial for educational equity."
        },
        {
          id: "b7",
          question: "What is our role when the initiative is at scale?",
          guidance: "Even when the initiative has been transferred, the implementing organisation will still have a role to play. This might involve advocacy, product development, certification, quality control, and so on. It is easier to plan towards scale when expectations about the future relationship between the originating and adopting organizations have been shared."
        }
      ],

      ideasForAction: [
        {
          body: "If possible, populate this with ~2 ideas for next steps, ideally based on real-world actions that education initiatives have taken."
        }
      ]
    },

    /* ------------------------------------------------------------------------
       MODULE C
       --------------------------------------------------------------------- */
    {
      id: "c",
      letter: "C",
      title: "What is the evidence of impact?",
      useFromStages: ["rd"],
      useWith: ["me-research", "frontline-staff", "local-education-officers", "national-policymakers", "funders"],
      image: "icons/module-c.svg",
      useWithOptional: [],
      centralQuestion: "How clear and robust is the evidence that the initiative improves learning, and will keep doing that as we grow into diverse settings?",

      prompts: [
        {
          id: "c1",
          question: "Do we have evidence from another context that we can use, and how similar is the context to the one we're scaling into?",
          guidance: "For example, this evidence might be from our initiative in another country, or a similar initiative in the same (or a similar) country."
        },
        {
          id: "c2",
          question: "Do we have evidence from the current implementation, and how similar is that to the context we are scaling into?",
          guidance: ""
        },
        {
          id: "c3",
          question: "Is our evidence rigorous on the outcomes we care about?",
          guidance: "For example, is impact attributable to our initiative? Outcomes might include: improved access, better learning outcomes, or reduced educational inequality between diverse groups."
        },
        {
          id: "c4",
          // [The source reads "the people we need to convince count perceive";
          // "count" looks like a leftover and has been dropped.]
          question: "Would the people we need to convince perceive this evidence as robust?",
          guidance: "For example, this may be national policymakers or funders."
        },
        {
          id: "c5",
          question: "Is the impact visible to people who matter?",
          guidance: "[The guidance for this prompt is unfinished in the source document: it reads \"For example, this may be\" and stops.]"
        },
        {
          id: "c6",
          question: "Is there evidence on the initiative that wasn't generated by us (the implementers)?",
          guidance: "Independent third-party evidence is typically seen as more credible."
        }
      ],

      ideasForAction: [
        {
          body: "If possible, populate this with ~2 ideas for next steps, ideally based on real-world actions that education initiatives have taken."
        }
      ]
    },

    /* ------------------------------------------------------------------------
       MODULE D
       --------------------------------------------------------------------- */
    {
      id: "d",
      letter: "D",
      title: "How strong is the support for the initiative, and the change it entails?",
      useFromStages: ["rd", "proof-of-concept"],
      useWith: ["frontline-staff", "me-research"],
      image: "icons/module-d.svg",
      useWithOptional: ["national-policymakers", "local-education-officers", "school-leaders", "teachers"],
      centralQuestion: "From the classroom to the Ministry, how strongly is the initiative (and change it entails) wanted?",

      prompts: [
        {
          id: "d1",
          question: "Are we addressing a need that is sharply felt by potential target groups?",
          guidance: "Do our target groups feel that the problem you're solving is a pressing and urgent priority? Or will it feel like it's your priority, not theirs? In this instance, target groups means everyone the initiative is aimed at — learners, teachers, school leaders, parents, district officials, etc."
        },
        {
          id: "d2",
          question: "How are our target groups solving the problem today?",
          guidance: "There is always a current approach, even if it amounts to coping, working around the problem, or having accepted it as normal. Find out what that approach is and how adequate people believe it to be."
        },
        {
          id: "d3",
          question: "Are we addressing an issue that is high on the national policy agenda?",
          guidance: "Is there demonstrated political will behind solving the problem? This might mean an appearance in a strategy document or ministerial speech. More promisingly, we should see someone spending time, budget or authority on moving it forward, and a willingness to meet resistance when it comes."
        },
        {
          id: "d4",
          question: "Is there a strong leadership coalition committed to the change, and expected to stay in place?",
          guidance: "To facilitate scaling in education, coalitions for change typically require strong leadership from the government (\"political will\") as well as from a range of other stakeholders. On the government side, sustaining political will over a long period of time – across election cycles and regime changes – can be challenging, which points to the importance of building a nonpartisan support base."
        },
        {
          id: "d5",
          question: "Is the change we are seeking supported by eminent individuals and institutions?",
          guidance: "\"Eminent\" can apply to a range of individuals or institutions, such as high-level government officials (signaling political buy-in and will), influential think tanks, media attractive supporters (e.g., celebrity ambassadors), etc."
        },
        {
          id: "d6",
          question: "Is there demonstrable support for the initiative among educators and key staff in the education system?",
          guidance: "\"Educators\" refers to teachers and school leaders. These groups are called out explicitly, because they play a dominant role in whether an initiative succeeds or fails while too often, they are not included in decision-making about implementation. Too often, teachers and school leaders are \"handed\" the initiative, on the assumption that they are or should be in support. \"Key staff\" refers to all those involved in taking the initiative to scale and implementing it at scale — i.e., system leaders at the level of districts / zones / provinces / …, teacher trainers, etc. Lack of support or active resistance from well-organized key staff will create challenges for scaling."
        }
      ],

      ideasForAction: [
        {
          body: "If possible, populate this with ~2 ideas for next steps, ideally based on real-world actions that education initiatives have taken."
        }
      ]
    },

    /* ------------------------------------------------------------------------
       MODULE E
       --------------------------------------------------------------------- */
    {
      id: "e",
      letter: "E",
      title: "What is the cost, and is there funding to cover it?",
      useFromStages: ["rd", "proof-of-concept"],
      useWith: ["org-leadership", "finance", "national-policymakers", "local-education-officers", "funders"],
      image: "icons/module-e.svg",
      useWithOptional: [],
      centralQuestion: "Do we know what this costs at scale — and is there a realistic route to it being paid for without us?",

      prompts: [
        {
          id: "e1",
          question: "Do you know what the cost is per learner (or per teacher, or per school), per year?",
          guidance: "This is different to the cost of your project. Once the initiative is running, what is the ongoing cost per year? Depending on your initiative, segment this by learner, by teacher, or by school. Separate the one-off costs of setting it up from the recurring cost of keeping it going."
        },
        {
          id: "e2",
          question: "Are the budget implications clear, predictable and justifiable to those who are expected to bear the costs?",
          guidance: "Whoever ends up bearing the cost — likely to include government agencies at national or local level — need to be able to see it, predict it, and justify it. Does our initiative allow for this?"
        },
        {
          id: "e3",
          question: "How does the cost compare to what is being spent today?",
          guidance: "This does not imply that cheaper solutions and models are necessarily better. Achieving educational equity typically has a price, for instance. Simply, it refers to the fact that initiatives that place less burden on budgets that are typically already overstretched, are easier to scale."
        },
        {
          id: "e4",
          question: "What will it take to reach scale, and how do we mobilise it?",
          guidance: "This might include funding for developing the product, building systems, initial training, and so on. It is usually a sharper payment than ongoing running costs, and falls more significantly on funders rather than governments. Understand what this initial funding might need to be, and honestly whether the amount is one you could raise."
        },
        {
          id: "e5",
          question: "Can the cost of implementation at scale be integrated in the government budget?",
          guidance: "Is there a budget line this could sit within, and is it plausible that money would actually be allocated to it? Funding that fits inside the existing budget structure is far easier to secure than funding that requires a new line to be created. Where non-state organisations will keep delivering part of the initiative, ask where their share comes from once your funding ends."
        }
      ],

      ideasForAction: [
        {
          body: "If possible, populate this with ~2 ideas for next steps, ideally based on real-world actions that education initiatives have taken."
        }
      ]
    },

    /* ------------------------------------------------------------------------
       MODULE F
       --------------------------------------------------------------------- */
    {
      id: "f",
      letter: "F",
      title: "Is the initiative designed for ease of transfer, particularly by adopting government institutions?",
      useFromStages: ["proof-of-concept", "transition-to-scale"],
      useWith: ["frontline-staff", "me-research", "teachers", "school-leaders", "local-education-officers"],
      image: "icons/module-f.svg",
      useWithOptional: [],
      centralQuestion: "How good is the fit between the initiative, and the organisations that would run it at scale?",

      prompts: [
        {
          id: "f1",
          question: "Can it be implemented with the people, skills, and infrastructure already present?",
          guidance: "What are you assuming exists already: this might be devices or connectivity, transport, physical space, personnel, and so on. Anything not there must be created, funded and maintained — scaling is easier when the initiative is implementable with resources already present in the education system."
        },
        {
          id: "f2",
          question: "How big a change is this for educators and key staff?",
          guidance: "Ideally, the initiative would only be a small departure from the current practices of educators and key staff in the education system."
        },
        {
          id: "f3",
          question: "Does it fit with existing policy, regulations and structures?",
          guidance: "Think of whether or not the initiative is in line with the existing school calendar and school hours; the official curriculum; existing mandates and levels of autonomy of those expected to implement the initiative, their function descriptions and the professional standards they are expected to live up to; etc."
        },
        {
          id: "f4",
          question: "Could someone else pick this up and run it?",
          guidance: "Ideally, the initiative shows low complexity and few components, and can be easily added onto the education system. Any roles, processes, tools and expected outputs should be described and documented clearly, so those who did build it can deliver it."
        },
        {
          id: "f5",
          question: "Can the system tell whether it is being done well?",
          guidance: "Uptake and quality of implementation should be easy to monitor, so supervisors (inspectors, district officials, etc.) can see whether the initiative is being implemented as intended."
        },
        {
          id: "f6",
          question: "How strong are the relationships between us and the organisations that would take this on?",
          guidance: "Strong collaborative relationships should exist between originating, intermediary and adopting organizations. The originating organization is the organization that develops and pilots the initiative. The \"intermediary organization\" is an organization specifically charged with facilitating the scaling up process. The \"adopting organization\" is the organization that takes up the initiative after it has been developed and piloted by the originating organization. In education, this is typically the government (alongside other actors)."
        },
        {
          id: "f7",
          question: "Do the adopting organisations have the capacity, reach and experience to run this at scale?",
          guidance: "Capacity: do they have the systems, staff and budget to deliver this across the whole territory, not only where you have been working? Reach: do they have real presence and credibility in the places the initiative needs to land? Experience: have they taken something like this to scale before, or would this be the first time?"
        },
        {
          id: "f8",
          question: "Does the initiative fit how adopting organisations actually work?",
          guidance: "Look at incentives, norms, accountability structures, and how much discretion people are given. Does our initiative fit within that?"
        }
      ],

      ideasForAction: [
        {
          body: "If possible, populate this with ~2 ideas for next steps, ideally based on real-world actions that education initiatives have taken."
        }
      ]
    },

    /* ------------------------------------------------------------------------
       MODULE G
       --------------------------------------------------------------------- */
    {
      id: "g",
      letter: "G",
      title: "Is your organisation set up to scale the initiative?",
      useFromStages: ["proof-of-concept", "transition-to-scale"],
      useWith: ["org-leadership"],
      image: "icons/module-g.svg",
      useWithOptional: [],
      centralQuestion: "Does our organisation have the time, skills, and commitment to see the journey through from beginning to end?",

      prompts: [
        {
          id: "g1",
          question: "Do we have the skills and capacity to build, test, and validate this initiative?",
          guidance: "This is about developing the initiative itself: designing it, trying it out in the real world, finding out honestly whether it works, and improving it on the evidence. It calls for specific skills: a deep understanding of the user and education system, developing a Theory of Change and measuring impact, and so on. Do you have the people, with the time and skills, to do this work?"
        },
        {
          id: "g2",
          question: "Do we have the skills and capacity for transferring this initiative?",
          guidance: "Handing over the initiative relies on a different set of skills to running it. For example, advocacy and policy engagement, convening partners, documenting the processes, and so on. As above, do you have the people, with the time and skills, to do this work?"
        },
        {
          id: "g3",
          question: "Do we have the financial resilience to see the initiative from idea to transfer?",
          guidance: "15 years from pilot to national scale is a fair estimate in education. Do you believe your organisation can remain financially resilient to do this work, over that time? While you may not be able to see your funding that far ahead, think honestly about where your funding comes from, and how much rests within a single donor. How might you diversify your income to build resilience?"
        },
        {
          id: "g4",
          question: "Are we committed — including at senior leadership — to prioritising and transferring the initiative?",
          guidance: "Has the leadership invested in a team with the time and skills to prioritise this initiative? And, just as importantly, are they committed to the costs of transfer as the initiative moves from idea, to transfer, to handover? This may include a change in roles and funding."
        }
      ],

      ideasForAction: [
        {
          body: "If possible, populate this with ~2 ideas for next steps, ideally based on real-world actions that education initiatives have taken."
        }
      ]
    }

  ]

};
