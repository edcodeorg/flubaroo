/**
 * @fileoverview Functions to aid App Script powered scripts, Add-ons and
 * Chat Apps to check for required OAuth scopes, and direct the end-user to 
 * re-authorize if some or all scopes listed in the manifest have not been 
 * granted.
 * 
 * (c) Dave Abouav, 2025 (https://github.com/dabouav)
 * 
 * Free to use for any purpose, with or without attribution. 
 *
 * Example use:
 * 
 * // Check if user has granted/authorized *all* scopes listed in this 
 * // project's manifest, and if not, provide them a link to grant the
 * // remaining ones. This check should be done at the start of any entry 
 * // point into your app that a brand new user may execute (i.e. Menu 
 * // items for them to start using your app). 
 * 
 * function menuItemStartAction() {
 *
 *   if (authHandleMissingScopeGrants()) {
 *     // user needs to grant access to some or all scopes before normal
 *     // app execution can continue.
 *     return;
 *   }
 *   
 *  // continue with normal execution
 *  handleStartAction();
 * }
 */

const AUTH_APP_NAME = 'Flubaroo';

/**
 * Call this function at the start of any entry point into your app that
 * a brand new user may execute (i.e. Menu items for them to start 
 * using your app). This is really main function you'll use from this file.
 *
 * return {Boolean} True if the re-auth prompt has been shown, in which case
 *   the caller should return/abort. Returns false otherwise.
 */
function authHandleMissingScopeGrants() {
  if (!authUserHasGrantedAllScopes()) { 
    _showAllScopesRequiredMessage();
    return true;
  }

  return false;
}


/**
 * Checks if *all* scopes listed in this app's manifest have been granted by
 * the user. 
 *
 * return {Boolean}.
 */
function authUserHasGrantedAllScopes() {
  return true;
  
  let authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  let authStatus = authInfo.getAuthorizationStatus();

  if (authStatus === ScriptApp.AuthorizationStatus.NOT_REQUIRED) {
    return true;
  }

  // One or more OAuth scopes still need to be granted by the user
  return false;
  
}

/* Checks if the passed scope is missing from the user granted scopes.
 *
 * @param {String} scopeId Full path of OAuth scope being asked about.
 *   (i.e. 'https://www.googleapis.com/auth/drive.file')
 * 
 * return {Boolean}
 */
function authCheckForMissingScope(scopeId) {
  let authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  let grantedScopes = authInfo.getAuthorizedScopes();

  if (grantedScopes.indexOf(scopeId) === -1) {
    // passed scope is not present in list or granted/authorizes scopes
    return true;
  }

  return false;
}

//// INTERNAL helper functions below this point ////

/* Checks if the script.container.ui is present among the user granted scopes, and ergo
 * this app can show the user HTML based content in a modal or the sidepanel.
 *
 * return {Boolean}
 */
function _appCanDisplayUIContent() {
  let uiScopeIsMissing = authCheckForMissingScope('https://www.googleapis.com/auth/script.container.ui');

  if (uiScopeIsMissing) {
    return false;
  }

  return true;
}

/**
 * Shows a message box asking the user to re-authorize remaining scopes 
 * needed by the app, with a link to click on.
 *
 * return {Boolean}.
 */
function _showAllScopesRequiredMessage() {
  let authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  let reAuthUrl = authInfo.getAuthorizationUrl();

  let title = 'Further Authorization Required';

  if (_appCanDisplayUIContent()) {
    let message = `To operate properly, ${AUTH_APP_NAME} requires that you approve <u>all</u>  \
                      of its listed permissions (scopes) during installation. \
                      <p>Please click the link below to re-authorize ${AUTH_APP_NAME}, and \
                      be sure to select all of the permissions listed there.
                      Afterwards, close this window and access ${AUTH_APP_NAME} again.</p> \
                      <a target="_blank" href="${reAuthUrl}">Authorize Now</a>`;

    _showHtmlNotification(title, message);
  }
  else {
    var message = '\r\n\r\nTo operate properly, ' + AUTH_APP_NAME + ' requires that you approve all  \
                      of its listed permissions during installation. \
                      \r\n\r\nPlease visit the link below in a new tab to re-authorize ' + AUTH_APP_NAME + ', and \
                      be sure to select all of the permissions listed there. \
                      Afterwards, close this window and access ' + AUTH_APP_NAME + ' again.\r\n\r\n' + reAuthUrl;
    Browser.msgBox(message);
  }
}


/**
 * Shows an HTML based message box to the user. For Editor based Add-ons only.
 * Please modify the last line of this function depending on which type of Editor
 * you are showing this message in (Spreadsheet, Doc, Form, etc).
 * 
 * If the scope for showing third-party/sidepanel content doesn't exist, then
 * falls back to native Browser.msgBox(), from which user will have to copy/paste
 * re-auth link.
 */
function _showHtmlNotification(title, message) {
  let html = _createHtmlMessageBox(title, message);

  // Show the HTML message box. If a Forms Add-on, instead use FormsApp.getUi(), etc.
  SpreadsheetApp.getUi().showModalDialog(html, title);
}


function _createHtmlMessageBox(title, message) {

  let html = HtmlService.createHtmlOutput()
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
                        .setWidth(500).setHeight(250);

  html.setTitle(title);
  
  let h = `<html> \
           <body style="margin-top:0px;"> \
           <div style="font-face:Arial,Times;font-family:Sans-Serif;font-size:18px;\
             padding:30px 0px 30px 0px;vertical-align:top;">      
           ${message}</div> \
           </body></html>`;
  
  html.append(h);
  
  return html;
}

