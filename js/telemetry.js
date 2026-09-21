/* =============================================================================
   ESC — telemetry and submission. TEST BUILDS ONLY.
   =============================================================================
   Every line of code in this tool that could send anything anywhere lives in
   this one file, behind the flags in config.js:

     BUILD: "release"  →  everything here is INERT. record() returns at once,
                          nothing is written to storage, no listener is
                          attached, submit() refuses without touching the
                          network. Not hidden: switched off.
     BUILD: "test"     →  a local event log is kept, and one button on the
                          Review screen can post it, with the answers and the
                          feedback, to SUBMIT_ENDPOINT.

   WHAT IS RECORDED (test builds)
     session_started   with the group code
     navigation        which screen was opened
     module_opened     module_closed (with seconds spent)
     prompt_answered   the first time an answer becomes non-empty
     prompt_skipped    a prompt still empty when the module is left
     rating_chosen     every rating change; promptId is null for the module
     feedback_opened   a "feedback on this prompt" disclosure opened
     progress_saved    progress_loaded  export_word  print
     submit_attempted  submit_sent  submit_fallback

   Nothing that identifies a person: no names, no email, no user agent, no IP
   on this side (the receiving script sees a request like any other).

   NOTHING IS SENT AS IT HAPPENS. Events buffer in memory and localStorage.
   One "send to the team" action posts one payload. If that fails — no
   connection, bad wifi, endpoint down — the same payload is downloaded as a
   file instead, so a session is never lost.
   ========================================================================== */

window.ESC_TELEMETRY = (function () {
  "use strict";

  var CONFIG = window.ESC_CONFIG || {};

  var TEST_BUILD = CONFIG.BUILD === "test";
  var LOGGING = TEST_BUILD && CONFIG.TELEMETRY === true;

  var STORAGE_KEY = "esc.events.v1";
  var MAX_EVENTS = 5000;
  var SUBMIT_TIMEOUT = 20000;

  var events = [];
  var open = null;        // { moduleId, since } while a module is on screen
  var answered = {};      // "a/a1": true once prompt_answered has been logged

  function now() { return new Date().getTime(); }

  function content() { return window.ESC_CONTENT; }
  function state() { return window.ESC_STATE; }

  /* -------------------------------------------------------------------------
     The log
     ---------------------------------------------------------------------- */

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      // Convenience only. The log still lives in memory.
    }
  }

  function restore() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      events = raw ? (JSON.parse(raw) || []) : [];
    } catch (e) {
      events = [];
    }
  }

  function record(type, detail) {
    var event, key;
    if (!LOGGING) { return; }

    event = { at: now(), type: type };
    for (key in (detail || {})) {
      if (Object.prototype.hasOwnProperty.call(detail, key)) { event[key] = detail[key]; }
    }
    events.push(event);
    if (events.length > MAX_EVENTS) { events.shift(); }
    persist();
  }

  function clear() {
    events = [];
    answered = {};
    open = null;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* see persist() */ }
  }

  /* -------------------------------------------------------------------------
     Time on module, and prompts left empty
     ---------------------------------------------------------------------- */

  function moduleOpened(moduleId) {
    if (!LOGGING) { return; }
    moduleClosed();
    open = { moduleId: moduleId, since: now() };
    record("module_opened", { moduleId: moduleId });
  }

  function moduleClosed() {
    var mod, i;
    if (!LOGGING || !open) { return; }

    mod = findModule(open.moduleId);
    // A prompt still empty on the way out counts as skipped. If the group comes
    // back and answers it, prompt_answered follows and the analysis sees both.
    for (i = 0; mod && i < mod.prompts.length; i++) {
      if (!state().getAnswer(mod.id, mod.prompts[i].id)) {
        record("prompt_skipped", { moduleId: mod.id, promptId: mod.prompts[i].id });
      }
    }
    record("module_closed", {
      moduleId: open.moduleId,
      seconds: Math.round((now() - open.since) / 1000)
    });
    open = null;
  }

  function findModule(id) {
    var list = content().modules;
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].id === id) { return list[i]; }
    }
    return null;
  }

  /* Listens to the same change notifications that drive autosave. */
  function onStateChange(detail) {
    var key;
    if (!LOGGING) { return; }

    if (detail.branch === "all" && detail.field === "reset") {
      clear();                       // start fresh means a new group: new log
      return;
    }
    if (detail.branch !== "answers") { return; }

    if (detail.field === "answer") {
      key = detail.moduleId + "/" + detail.promptId;
      if (!answered[key] && state().getAnswer(detail.moduleId, detail.promptId)) {
        answered[key] = true;
        record("prompt_answered", { moduleId: detail.moduleId, promptId: detail.promptId });
      }
    } else if (detail.field === "rating") {
      record("rating_chosen", { moduleId: detail.moduleId, promptId: detail.promptId, value: detail.value });
    } else if (detail.field === "moduleRating") {
      record("rating_chosen", { moduleId: detail.moduleId, promptId: null, value: detail.value });
    }
  }

  function start() {
    if (!LOGGING) { return; }
    restore();
    state().onChange(onStateChange);
    // Closing the tab mid-module still records the time spent on it.
    window.addEventListener("pagehide", moduleClosed, false);
  }

  /* -------------------------------------------------------------------------
     Sending — one payload, one button, one fallback
     ---------------------------------------------------------------------- */

  function buildPayload() {
    var data = state().all();
    return {
      sentAt: new Date().toISOString(),
      build: CONFIG.BUILD,
      groupCode: data.groupCode,
      answers: data.modules,
      feedback: data.feedback,
      events: LOGGING ? events : []
    };
  }

  /* The fallback: the same payload, as a file, plus a message from the caller
     telling people to email it in. Never lose a session to bad wifi. */
  function fallback(body, onDone) {
    var name = "esc-submission-" +
      (state().getGroupCode() ? window.ESC_EXPORT.fileSafe(state().getGroupCode()) + "-" : "") +
      window.ESC_EXPORT.dateStamp() + ".json";
    record("submit_fallback", {});
    window.ESC_EXPORT.saveBlob(new Blob([body], { type: "application/json" }), name);
    onDone("downloaded");
  }

  /* onDone receives "sent", "downloaded" or "off".
     "off" is the only possible result in a release build. */
  function submit(onDone) {
    var body, xhr, finished = false;

    if (!TEST_BUILD) { onDone("off"); return; }

    record("submit_attempted", {});
    body = JSON.stringify(buildPayload());

    // No endpoint configured, no XHR, or the browser already knows it is
    // offline: straight to the file, no waiting.
    if (!CONFIG.SUBMIT_ENDPOINT || !window.XMLHttpRequest || window.navigator.onLine === false) {
      fallback(body, onDone);
      return;
    }

    function finish(ok) {
      if (finished) { return; }
      finished = true;
      if (ok) {
        record("submit_sent", {});
        onDone("sent");
      } else {
        fallback(body, onDone);
      }
    }

    try {
      xhr = new XMLHttpRequest();
      xhr.open("POST", CONFIG.SUBMIT_ENDPOINT, true);
      xhr.timeout = SUBMIT_TIMEOUT;
      // text/plain keeps the request "simple" so the browser sends it without a
      // CORS preflight, which a Google Apps Script web app cannot answer.
      xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      xhr.onload = function () { finish(xhr.status >= 200 && xhr.status < 300); };
      xhr.onerror = function () { finish(false); };
      xhr.ontimeout = function () { finish(false); };
      xhr.send(body);
    } catch (e) {
      finish(false);
    }
  }

  return {
    testBuild: TEST_BUILD,
    logging: LOGGING,
    start: start,
    record: record,
    moduleOpened: moduleOpened,
    moduleClosed: moduleClosed,
    submit: submit,
    events: function () { return events.slice(); },
    clear: clear
  };

}());
