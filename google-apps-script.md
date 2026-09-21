# Receiving test-build submissions in a Google Sheet

This is the receiving end of the **Send to the team** button that appears on the
Review screen in a *test* build. It is a Google Apps Script bound to a Google
Sheet. The tool posts one JSON payload per send; the script splits it into three
tabs: **answers**, **feedback** and **events**.

You do not need this for a release build. A release build sends nothing, ever.

## Setting it up (about ten minutes)

1. Create a new Google Sheet. Name it whatever you like.
2. In the Sheet, open **Extensions → Apps Script**.
3. Delete everything in the editor and paste the script below. Save (⌘S / Ctrl+S).
4. In the function dropdown at the top, choose **testPayload** and press **Run**.
   The first time, Google asks you to authorise the script to edit the Sheet.
   Allow it. Go back to the Sheet: three tabs should now exist, each with one
   test row. Delete the test rows if you like — the headers stay.
5. Press **Deploy → New deployment**. Click the gear next to *Select type* and
   choose **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
   Press **Deploy**, and copy the **Web app URL**. It ends in `/exec`.
6. Open `config.js` in the tool and paste that URL into `SUBMIT_ENDPOINT`:
   ```js
   SUBMIT_ENDPOINT: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
7. Open the tool, enter a group code, type something in a module, go to
   **Review and export** and press **Send to the team**. Rows appear in the Sheet
   within a few seconds.

**After any later edit to the script**, go to **Deploy → Manage deployments**,
click the pencil, set *Version* to **New version**, and press **Deploy**. A saved
edit does not reach the live URL until you do this.

## Why "Anyone"

The tool posts from a browser that is not signed in to Google — often from a
laptop opened from a zip file with no account at all. "Anyone" lets that request
in. It does **not** make the spreadsheet public: only the script is reachable,
and all it can do is append rows.

Treat the URL as semi-private all the same. Anything posted to it lands in the
Sheet, so do not publish it anywhere the tool itself is not.

## What arrives

The payload carries no names, no email addresses and no user agent — only the
group code and the session. See `js/telemetry.js` for the full list of events.

| tab | one row per |
|---|---|
| **answers** | prompt answered or rated; plus one row per module rating (`prompt_id` = `module`) and one per next step (`prompt_id` = `next-step-1` etc.) |
| **feedback** | comment on a prompt (`prompt_id` = the prompt) or on the module (`prompt_id` = `module`) |
| **events** | logged event, in order |

A group can press Send more than once. Every send is a complete snapshot, so
for analysis take the **latest `sent_at` per `group_code`** for answers and
feedback. Events accumulate across the session and are re-sent each time, so
de-duplicate those on `group_code` + `event_at` + `type`.

## Testing from the command line

```bash
curl -L -X POST -H "Content-Type: text/plain" \
  --data '{"sentAt":"2026-09-21T10:00:00Z","groupCode":"curl-test","answers":{"a":{"prompts":{"a1":{"answer":"hello","rating":"confident"}},"moduleRating":"","nextSteps":[]}},"feedback":{},"events":[]}' \
  "https://script.google.com/macros/s/AKfycb.../exec"
```

`-L` matters: Apps Script answers with a redirect. A working endpoint replies
`{"ok":true,"answers":1,"feedback":0,"events":0}`.

## The script

```javascript
/**
 * Education Scalability Conversations — submission receiver.
 *
 * Receives one JSON payload per "Send to the team" and appends rows to three
 * tabs of the bound Sheet: answers, feedback, events. Tabs and headers are
 * created on first use.
 */

var SHEET_HEADERS = {
  answers:  ["received_at", "sent_at", "group_code", "module_id", "prompt_id", "answer", "rating"],
  feedback: ["received_at", "sent_at", "group_code", "module_id", "prompt_id", "feedback"],
  events:   ["received_at", "sent_at", "group_code", "event_at", "type", "module_id", "prompt_id", "value", "seconds", "to"]
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  var result = { ok: false };

  try {
    // Two groups sending at the same moment must not write over each other.
    lock.waitLock(30000);

    var payload = JSON.parse(e.postData.contents);
    var rows = splitPayload(payload, new Date());
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    appendRows(ss, "answers", rows.answers);
    appendRows(ss, "feedback", rows.feedback);
    appendRows(ss, "events", rows.events);

    result = {
      ok: true,
      answers: rows.answers.length,
      feedback: rows.feedback.length,
      events: rows.events.length
    };
  } catch (err) {
    result = { ok: false, error: String(err) };
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Turns one payload into three arrays of rows. */
function splitPayload(payload, receivedAt) {
  var base = [receivedAt, payload.sentAt || "", payload.groupCode || ""];
  var answers = [], feedback = [], events = [];

  var modules = payload.answers || {};
  Object.keys(modules).forEach(function (moduleId) {
    var mod = modules[moduleId] || {};
    var prompts = mod.prompts || {};

    Object.keys(prompts).forEach(function (promptId) {
      var p = prompts[promptId] || {};
      if (p.answer || p.rating) {
        answers.push(base.concat([moduleId, promptId, p.answer || "", p.rating || ""]));
      }
    });

    if (mod.moduleRating) {
      answers.push(base.concat([moduleId, "module", "", mod.moduleRating]));
    }

    (mod.nextSteps || []).forEach(function (step, i) {
      if (step) { answers.push(base.concat([moduleId, "next-step-" + (i + 1), step, ""])); }
    });
  });

  var fb = payload.feedback || {};
  Object.keys(fb).forEach(function (moduleId) {
    var f = fb[moduleId] || {};
    var prompts = f.prompts || {};

    Object.keys(prompts).forEach(function (promptId) {
      if (prompts[promptId]) {
        feedback.push(base.concat([moduleId, promptId, prompts[promptId]]));
      }
    });

    if (f.module) { feedback.push(base.concat([moduleId, "module", f.module])); }
  });

  (payload.events || []).forEach(function (ev) {
    events.push(base.concat([
      ev.at ? new Date(ev.at) : "",
      ev.type || "",
      ev.moduleId || "",
      ev.promptId || "",
      ev.value || "",
      ev.seconds || "",
      ev.to || ""
    ]));
  });

  return { answers: answers, feedback: feedback, events: events };
}

/** Appends rows to a named tab, creating the tab and its header row if needed. */
function appendRows(ss, name, rows) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS[name]);
    sheet.setFrozenRows(1);
  }

  if (!rows.length) { return; }
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

/** A quick way to check the endpoint is alive from a browser. */
function doGet() {
  return ContentService.createTextOutput("ESC submission endpoint is running.");
}

/**
 * Run this once from the editor to authorise the script and create the tabs.
 * It writes one test row to each tab, which you can delete.
 */
function testPayload() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        sentAt: new Date().toISOString(),
        build: "test",
        groupCode: "setup-test",
        answers: { a: { prompts: { a1: { answer: "test answer", rating: "confident" } },
                        moduleRating: "unsure", nextSteps: ["test next step", "", ""] } },
        feedback: { a: { prompts: { a1: "test feedback" }, module: "" } },
        events: [{ at: Date.now(), type: "session_started", groupCode: "setup-test" }]
      })
    }
  };
  Logger.log(doPost(fake).getContent());
}
```
