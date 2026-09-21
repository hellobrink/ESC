/* =============================================================================
   ESC — state
   =============================================================================
   The single source of truth for everything anyone types.

   TWO SEPARATE BRANCHES, deliberately. They are analysed separately and must
   never be mixed:

     data.modules   what the group said about their initiative — the answers.
     data.feedback  what the group said about the TOOL — comments on the
                    prompts themselves. Test builds only.

   Shape:
     {
       version: 1,
       savedAt: null,
       groupCode: "",
       modules: {
         a: {
           prompts: { a1: { answer: "", rating: "" } },
           moduleRating: "",
           nextSteps: ["", "", ""]
         }
       },
       feedback: {
         a: { prompts: { a1: "" }, module: "" }
       }
     }

   Buckets are created lazily, so an untouched module takes up no space and an
   exported file only carries what people actually did.

   THREE LEVELS OF PERSISTENCE, least dependable last:

     1. The progress file. download() writes everything to a .json the group
        keeps; importFile() reads one back. This is the dependable route and
        behaves identically on file:// and over http.
     2. Autosave to localStorage. A convenience, nothing more. Every call is
        wrapped in try/catch, and a failure is recorded rather than thrown —
        private browsing, a full quota or a locked-down browser must not stop
        anyone working.
     3. status(), so people can see which of the above actually happened.

   Nothing here ever assumes localStorage exists or came back with anything.
   ========================================================================== */

window.ESC_STATE = (function () {
  "use strict";

  var VERSION = 1;
  var NEXT_STEP_COUNT = 3;
  var STORAGE_KEY = "esc.progress.v1";

  // Autosave is debounced so typing does not write to storage on every letter.
  var AUTOSAVE_DELAY = 400;

  var listeners = [];
  var data = blank();

  // null until localStorage has actually been tried.
  var storageOk = null;
  // Has the current state been written to a file the group keeps?
  var downloaded = false;
  var autosaveTimer = null;

  // esc-progress-<group code>-2026-09-08.json
  function filename() {
    return "esc-progress-" +
      (data.groupCode ? data.groupCode.replace(/[^A-Za-z0-9_-]+/g, "-") + "-" : "") +
      window.ESC_EXPORT.dateStamp() + ".json";
  }

  function blank() {
    return {
      version: VERSION,
      savedAt: null,
      groupCode: "",
      modules: {},
      feedback: {}
    };
  }

  /* --- lazy buckets ------------------------------------------------------ */

  function moduleBucket(moduleId) {
    if (!data.modules[moduleId]) {
      data.modules[moduleId] = {
        prompts: {},
        moduleRating: "",
        nextSteps: ["", "", ""]
      };
    }
    return data.modules[moduleId];
  }

  function promptBucket(moduleId, promptId) {
    var mod = moduleBucket(moduleId);
    if (!mod.prompts[promptId]) {
      mod.prompts[promptId] = { answer: "", rating: "" };
    }
    return mod.prompts[promptId];
  }

  function feedbackBucket(moduleId) {
    if (!data.feedback[moduleId]) {
      data.feedback[moduleId] = { prompts: {}, module: "" };
    }
    return data.feedback[moduleId];
  }

  /* --- change notification ----------------------------------------------
     Anything that writes calls this. Step 3 listens to autosave and to flag
     unsaved work; step 6 listens to log events. */

  function changed(detail) {
    var i;
    // Any edit means the file on disk is now out of date.
    downloaded = false;
    scheduleAutosave();
    for (i = 0; i < listeners.length; i++) {
      listeners[i](detail);
    }
  }

  // Status changes are not edits: they must not re-trigger an autosave.
  function statusChanged() {
    var i;
    for (i = 0; i < listeners.length; i++) {
      listeners[i]({ branch: "status" });
    }
  }

  /* --- localStorage ------------------------------------------------------
     Convenience only. Every path swallows its error and records that storage
     is not working, so status() can tell the truth about it. */

  function scheduleAutosave() {
    if (autosaveTimer) { window.clearTimeout(autosaveTimer); }
    autosaveTimer = window.setTimeout(writeStorage, AUTOSAVE_DELAY);
  }

  function writeStorage() {
    autosaveTimer = null;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      storageOk = true;
    } catch (e) {
      storageOk = false;
    }
    statusChanged();
  }

  function clearStorage() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Nothing to do: if it will not clear, it was never holding anything.
    }
  }

  function readStorage() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      storageOk = true;
    } catch (e) {
      storageOk = false;
      return null;
    }
    if (!raw) { return null; }
    try {
      return validate(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  /* Accept anything that looks like one of our files, filling in whatever an
     older or hand-edited one is missing. Returns null if it is not ours. */
  function validate(obj) {
    if (!obj || typeof obj !== "object") { return null; }
    if (!obj.modules || typeof obj.modules !== "object") { return null; }
    if (!obj.feedback || typeof obj.feedback !== "object") { obj.feedback = {}; }
    if (typeof obj.groupCode !== "string") { obj.groupCode = ""; }
    obj.version = obj.version || VERSION;
    return obj;
  }

  /* --- has anyone actually typed anything? -------------------------------
     Buckets are only created by a setter, so any bucket means the module was
     touched. Someone who types and then deletes leaves an empty bucket behind
     and still counts as having content — the safe way round, since it only
     ever means we warn about losing work that turns out to be blank. */

  function hasContent() {
    var key;
    for (key in data.modules) {
      if (Object.prototype.hasOwnProperty.call(data.modules, key)) { return true; }
    }
    for (key in data.feedback) {
      if (Object.prototype.hasOwnProperty.call(data.feedback, key)) { return true; }
    }
    return false;
  }

  /* --- reading ----------------------------------------------------------
     Readers never create a bucket. An unanswered prompt reads as "". */

  function readPrompt(moduleId, promptId, key) {
    var mod = data.modules[moduleId];
    if (!mod || !mod.prompts[promptId]) { return ""; }
    return mod.prompts[promptId][key] || "";
  }

  return {

    /* ---- answers ------------------------------------------------------ */

    getAnswer: function (moduleId, promptId) {
      return readPrompt(moduleId, promptId, "answer");
    },

    setAnswer: function (moduleId, promptId, value) {
      promptBucket(moduleId, promptId).answer = value;
      changed({ branch: "answers", moduleId: moduleId, promptId: promptId, field: "answer" });
    },

    getRating: function (moduleId, promptId) {
      return readPrompt(moduleId, promptId, "rating");
    },

    setRating: function (moduleId, promptId, value) {
      promptBucket(moduleId, promptId).rating = value;
      changed({ branch: "answers", moduleId: moduleId, promptId: promptId, field: "rating", value: value });
    },

    getModuleRating: function (moduleId) {
      var mod = data.modules[moduleId];
      return mod ? (mod.moduleRating || "") : "";
    },

    setModuleRating: function (moduleId, value) {
      moduleBucket(moduleId).moduleRating = value;
      changed({ branch: "answers", moduleId: moduleId, field: "moduleRating", value: value });
    },

    getNextStep: function (moduleId, index) {
      var mod = data.modules[moduleId];
      return (mod && mod.nextSteps[index]) ? mod.nextSteps[index] : "";
    },

    setNextStep: function (moduleId, index, value) {
      moduleBucket(moduleId).nextSteps[index] = value;
      changed({ branch: "answers", moduleId: moduleId, field: "nextStep", index: index });
    },

    /* ---- feedback on the tool (kept apart from answers) ---------------- */

    getPromptFeedback: function (moduleId, promptId) {
      var bucket = data.feedback[moduleId];
      if (!bucket) { return ""; }
      return bucket.prompts[promptId] || "";
    },

    setPromptFeedback: function (moduleId, promptId, value) {
      feedbackBucket(moduleId).prompts[promptId] = value;
      changed({ branch: "feedback", moduleId: moduleId, promptId: promptId });
    },

    getModuleFeedback: function (moduleId) {
      var bucket = data.feedback[moduleId];
      return bucket ? (bucket.module || "") : "";
    },

    setModuleFeedback: function (moduleId, value) {
      feedbackBucket(moduleId).module = value;
      changed({ branch: "feedback", moduleId: moduleId, field: "module" });
    },

    /* ---- session identity (set at step 6, in test builds only) --------- */

    getGroupCode: function () { return data.groupCode; },

    setGroupCode: function (code) {
      data.groupCode = code;
      changed({ branch: "session", field: "groupCode" });
    },

    /* ---- whole-object access, used by steps 3, 5 and 6 ----------------- */

    all: function () { return data; },

    replace: function (next) {
      data = next;
      changed({ branch: "all", field: "replace" });
    },

    // Wipe everything and clear the autosave with it, so the next group does
    // not inherit the last group's answers.
    reset: function () {
      data = blank();
      changed({ branch: "all", field: "reset" });
      // changed() has just scheduled an autosave, which would write the empty
      // object straight back. Cancel it, then clear, so starting fresh really
      // does leave nothing behind in this browser.
      if (autosaveTimer) { window.clearTimeout(autosaveTimer); autosaveTimer = null; }
      clearStorage();
      downloaded = false;
      statusChanged();
    },

    onChange: function (fn) { listeners.push(fn); },

    /* ---- persistence -------------------------------------------------- */

    // Called once at startup. Restores an autosave if there is one.
    start: function () {
      var restored = readStorage();
      if (restored) { data = restored; }
      // Restored or not, there is no file yet, so the work is still at risk.
      downloaded = false;
      return !!restored;
    },

    // Level 1: write everything to a file the group keeps.
    download: function () {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var ok = window.ESC_EXPORT.saveBlob(blob, filename());
      if (ok) { downloaded = true; }
      statusChanged();
      return ok;
    },

    // Level 1, the other direction. onDone(true) on success, onDone(false) if
    // the file could not be read or is not one of ours.
    importFile: function (file, onDone) {
      var reader;
      if (!window.FileReader) { onDone(false); return; }

      reader = new FileReader();
      reader.onerror = function () { onDone(false); };
      reader.onload = function () {
        var parsed = null;
        try {
          parsed = validate(JSON.parse(String(reader.result)));
        } catch (e) {
          parsed = null;
        }
        if (!parsed) { onDone(false); return; }

        data = parsed;
        changed({ branch: "all", field: "import" });
        // changed() has just marked the work un-filed, but the file they loaded
        // IS the copy, so put that back and say so.
        downloaded = true;
        statusChanged();
        onDone(true);
      };
      reader.readAsText(file);
    },

    /* Where the work is held right now:
         "empty"       nothing typed yet
         "downloaded"  written to a file, and unchanged since
         "no-storage"  typed, and this browser is not storing anything
         "stored-only" typed, autosaved, but no file yet */
    status: function () {
      if (!hasContent()) { return "empty"; }
      if (downloaded) { return "downloaded"; }
      if (storageOk === false) { return "no-storage"; }
      return "stored-only";
    },

    // True when there is work that is not in a file. Drives the close warning:
    // localStorage is never treated as good enough on its own.
    isDirty: function () { return hasContent() && !downloaded; },

    hasContent: hasContent,

    NEXT_STEP_COUNT: NEXT_STEP_COUNT,
    VERSION: VERSION

  };

}());
