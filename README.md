# Education Scalability Conversations (ESC)

A set of self-contained conversation modules for teams thinking about scaling an
education programme. Each module takes a group through one structured
conversation. One person types while the others talk. At the end the group
exports what they wrote and keeps it.

Built for Enabel and VVOB. Plain HTML, CSS and JavaScript: **no server, no
database, no build step, no dependencies, and nothing loaded from the internet.**
The whole tool is the folder this file is in.

---

## 1. Running it offline

Unzip the folder and double-click **`index.html`**. That is the entire install.

It runs from the file system with no internet connection, in Chrome, Edge,
Firefox or Safari. Nothing is installed and nothing phones home. When people are
finished they download their work as a file (see *Saving work*), so the laptop
can be wiped or handed to the next group afterwards.

Keep the folder together. `index.html` looks for the `css/`, `js/` and `content/`
folders next to it, and `config.js` too. If any are missing, the page tells you.

## 2. Putting it on a website

Upload the whole folder to any web host as static files. There is nothing to
configure: no server language, no database, no environment variables.

- The folder can sit at the root of a domain or in a subfolder. Links are
  relative, so both work.
- Navigation uses the part of the address after `#`, for example
  `index.html#/module/a`, so no URL rewriting is needed on the server.
- GitHub Pages, Netlify, an S3 bucket, a folder on an existing site: all fine.

**Before uploading for real users, read section 5 and set `BUILD` to
`"release"`.**

## 3. Editing the words

Every piece of text — the module content, the instructions, the button labels,
the notices — lives in one file:

```
content/modules.js
```

Open it in any text editor (TextEdit in plain-text mode, Notepad, VS Code). The
top of the file explains the five rules for editing it safely, and every section
is commented. Save the file and refresh the browser to see the change.

To **add a module**, copy an existing module block from its opening `{` to its
closing `}`, paste it after the last one, and give it a new `id` and `letter`.

To **add a stakeholder group or a stage**, add it to the list near the top of
the file first, then refer to its `id` from a module.

The one piece of text that is *not* in the content file is the European Union
funding statement in the footer. It is written directly into `index.html` so
that a content edit cannot change or remove it by accident.

If the page comes up blank after an edit, the most likely cause is a missing
comma or quote mark. Undo the last change and try again.

## 4. Saving work

The tool keeps people's work in three ways, from most to least dependable:

1. **Save my progress** (in the bar at the top) downloads a `.json` file with
   everything typed so far. **Load a saved file** reads one back in. This is
   the copy to rely on. It works identically offline and online.
2. The browser's own storage (*localStorage*) keeps an autosave as people type,
   so an accidental refresh loses nothing. This is a convenience only: private
   browsing, a locked-down machine or a full quota can switch it off, and the
   tool carries on working regardless.
3. The status line next to the buttons says which of these has actually
   happened: *Nothing entered yet* / *Held in this browser only* /
   *This browser is not holding your work* / *Saved to a file*.

Closing the tab with work that is not yet in a file brings up the browser's
"leave site?" warning. Browser storage on its own is never treated as safe.

**Start fresh** clears everything, including the autosave, after asking. Use it
between groups on a shared laptop.

## 5. Test build and release build — the handover switch

Open `config.js`:

```js
window.ESC_CONFIG = {
  BUILD: "test",              // "test" | "release"
  SUBMIT_ENDPOINT: "",
  TELEMETRY: true,
  REQUIRE_GROUP_CODE: true
};
```

| | `"test"` | `"release"` |
|---|---|---|
| Group code asked for at the start | yes (if `REQUIRE_GROUP_CODE`) | never |
| Plain-English notice of what is recorded | shown once | never |
| "Feedback on this prompt" and module feedback fields | shown | not rendered |
| Local event log (`TELEMETRY`) | kept in memory and browser storage | nothing recorded |
| "Send to the team" button on the Review screen | shown | not rendered |
| Anything sent over the network | one payload, on that button only | **nothing, ever** |

**Before handing the tool to a partner to host: set `BUILD` to `"release"`.**
That single change makes every recording and sending path inert — not hidden,
switched off. Every line of code that could send anything lives in
`js/telemetry.js`, behind that flag, so this is straightforward to verify.

## 6. The write-up: printing and the Word document

From a module screen, **Print this module** (or Ctrl/Cmd+P) prints a clean A4
worksheet: the prompts, the guidance, what was typed, and the ratings. Where a
box is empty it prints as ruled space to write in, so an unfilled module makes
a paper worksheet a group can sit round. Choose *Save as PDF* in the print
dialog to get a PDF.

From **Review and export**, **Download as a Word document** produces a `.doc`
that Word and Google Docs both open, containing every module the group entered
anything in.

Two limits worth knowing:

- **It is not a true `.docx`.** It is an HTML document with the Word file type,
  which needs no library and works offline. Some corporate mail filters are
  wary of `.doc`. A real `.docx` writer can be dropped into `js/export.js` later
  without touching anything else — the structure is already there.
- **On a printout of more than one page, the EU funding statement appears on
  the last page only.** The logo bar repeats on every page. The reason, and the
  two ways round it, are in the comments in `css/print.css`.

## 7. Feedback and telemetry (test builds only)

In a test build, the tool asks for a **group code** at the start — a short
name given to the group by the team. It records nothing that identifies a
person: no names, no email addresses, no user agent.

It keeps a local log of: session start, screens opened, modules opened and
closed (with time spent), the first time each prompt is answered, prompts left
empty when a module is left, ratings chosen, feedback boxes opened, saves,
loads, exports and prints. The full list is at the top of `js/telemetry.js`.

**Nothing is sent as it happens.** The **Send to the team** button on the Review
screen posts one payload — answers, feedback and the log — to
`SUBMIT_ENDPOINT`. If that fails for any reason (no connection, endpoint down),
the same payload is downloaded as a file with a message asking the group to
email it in. A session is never lost to bad wifi.

`google-apps-script.md` has a ready-to-paste script that receives the payload
into a Google Sheet, and the steps to deploy it.

## 8. What is in the folder

```
index.html              the page: markup, logo slots, footer, script order
config.js               BUILD switch, endpoint, telemetry flags
content/modules.js      ALL the words. Edit this one.
css/reset.css           flattens browser defaults
css/tokens.css          every colour, size, space and radius — the design surface
css/layout.css          structure only
css/print.css           the A4 worksheet
js/app.js               routing and rendering
js/state.js             answers, autosave, save/load file, status
js/export.js            the write-up structure and the Word document
js/telemetry.js         event log and sending — test builds only
google-apps-script.md   the receiving end for test-build submissions
README.md               this file
```

Scripts are loaded as plain `<script>` tags, in dependency order, at the end of
`index.html`. There are no modules, no bundler and no `fetch()`, because
browsers block those for local files and the tool has to work from a
double-clicked `index.html`.

## 9. Browsers and devices

Works in current Chrome, Edge, Firefox and Safari, and in Chrome and Edge
several versions back. The layout holds down to a 360px-wide screen and at
200% browser zoom. Everything is reachable by keyboard, with visible focus.

Two features degrade gracefully on very old browsers: the collapsible
"feedback on this prompt" box simply shows open, and the printed logo bar
appears once rather than on every page.

## 10. For the designer

- Every colour, space, size and radius is a custom property in
  `css/tokens.css`. `css/layout.css` contains structure only.
- The one hard-coded measurement in the project is the `@page` margin in
  `css/print.css`, because browsers do not reliably read custom properties
  there. It is commented at the point of use.
- Logo slots: `.logo-bar__slot--start` (Global Gateway) and
  `.logo-bar__slot--end` (EU), in `index.html`. Their dashed outline is a
  scaffolding aid: set `--esc-logo-slot-outline` to `none` when artwork is in.
- Class names describe what a thing is, not how it looks. State is expressed
  as classes and attributes (`field--filled`, `data-status`, `aria-current`),
  never as inline styles.
