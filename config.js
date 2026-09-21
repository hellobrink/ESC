/* =============================================================================
   ESC — build configuration
   =============================================================================
   This file is read before everything else. It decides whether this copy of the
   tool is a TEST build (feedback + telemetry active) or a RELEASE build
   (completely inert — nothing is recorded, nothing is ever sent anywhere).

   BEFORE HANDING THE TOOL OVER TO A PARTNER TO HOST, set BUILD to "release".
   ========================================================================== */

window.ESC_CONFIG = {

  // "test"    = feedback, group code and telemetry are active.
  // "release" = telemetry and submission are inert. Nothing phones home.
  BUILD: "test",

  // Google Apps Script web app URL that receives the "send to the team" payload.
  // Leave empty to force the download fallback. Ignored entirely when BUILD is "release".
  SUBMIT_ENDPOINT: "",

  // Record a local event log during a session. Ignored when BUILD is "release".
  TELEMETRY: true,

  // Ask for a short group code at the start of a test session.
  // Ignored when BUILD is "release".
  REQUIRE_GROUP_CODE: true

};
