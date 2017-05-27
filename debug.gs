// debug.gs
// ============
//
// Development/debug functions.

// TODO_AJR - Add function name as first parameter of logging functions

// TODO_AJR - Generally, should there be some indication to the user that,
// there has been an error when debug is turned off? Couldn't we try and 
// catch the errors further up rather than ignoring them in production and
// letting GAS catch them in debug.

// Unit Tests
// ==========

// testDebugClass()
// ----------------
//
// Unit tests for DebugClass(). Check log for results.

function testDebugClass()
{
  Debug.info("testDebugClass() - PASS - info test call");
  Debug.warning("testDebugClass() - PASS - warning test call");

  Debug.assert_w(false, "testDebugClass() - PASS - assert_w test call");  

  // This will test Debug.error().
  Debug.assert(true, "testDebugClass() - FAIL - Should not see this");
  
  Debug.info("testDebugClass() - All tests PASSED");
  
  return true;
  
} // testDebugClass()

// Debug Service
// =============

Debug = new DebugClass();

function DebugClass()
{
  this.debugOn = DEBUG_ON;
  this.loggingOn = LOGGING_ON;
  this.log_sheet;
  this.last_msg;
  this.field_log_messages = new Array();
  this.field_log_on = null;
  this.field_log_rows_written = 0;
  this.field_log_rate = null;
  
} // DebugClass()

// DebugClass.info()
// -----------------
//
// Output debug trace.

DebugClass.prototype.info = function(msg)
{
  if (this.debugOn)
    {
      Logger.log(msg);
    }

  if (this.checkFieldLog())
    {
      var now = new Date();
      this.field_log_messages.push(now + ": " + msg);
      this.field_log_rows_written++;
      
      if (this.field_log_rows_written >= this.getFieldLogRate())
        {
          this.field_log_rows_written = 0;
          this.writeToFieldLogSheet();
        }
    }
  
  this.last_msg = msg;

  if (!this.loggingOn)
    {
      return;
    }
  
  if (typeof this.log_sheet === 'undefined')
    { 
      // Store log sheet name.
      
      this.log_sheet = SpreadsheetApp.getActiveSpreadsheet()
                                     .getSheetByName(LOG_SHEET_NAME);
                                 
      if (this.log_sheet === null)
        {
          // TODO_AJR - Could create it.
          // TODO_AJR - use langStr.

          Browser.msgBox(langstr("FLB_STR_NOTIFICATION"), 
                         "You need to create a sheet called " + 
                           LOG_SHEET_NAME + 
                           " with logging enabled", 
                         Browser.Buttons.OK);

          this.error("DebugClass.info() - no 'log' sheet");
          
          return;
        }
    }

  if (this.log_sheet === null)
    {
      // Attempted, but failed, to find the log sheet on a 
      // previous call to info().
      return;
    }

  // Add the trace message to the end of log sheet.

  var row = this.log_sheet.getLastRow() + 1;
  var range = this.log_sheet.getRange(row, 1, 1, 2);
  var time = new Date();
  
  range.setValues([[time, msg]]);
    
} // DebugClass.info()

// DebugClass.warning()
// --------------------
//
// Output warning.

DebugClass.prototype.warning = function(msg)
{ 
  if (typeof msg !== "string")
    {
      this.error("DebugClass.warning() - incorrect parameter type");
    }
    
  this.info("WARNING - " + msg);
  
} // DebugClass.warning()

// DebugClass.error()
// ------------------
//
// Output error trace and throw an error (only this function
// should decide whether to throw the errors).

DebugClass.prototype.error = function(msg)
{ 
  if (typeof msg !== "string")
    {
      msg = "DebugClass.error() - parameter must be a string";
      
      this.info(msg);
      
      if (this.debugOn)
        {
          throw(msg);
        }
    }
    
  this.info("ERROR - " + msg);
  
  if (this.debugOn)
  {
    throw(msg);
  }
  
} // DebugClass.error()

// DebugClass.assert()
// -------------------
//
// Issue error if assertion false.

DebugClass.prototype.assert = function(assertion, msg) 
{ 
  if (typeof assertion !== "boolean")
    {
      assertion = false;
      msg = "DebugClass.assert() - first parameter must be a boolean";
    }
  else if (typeof msg !== 'string')
    {
      assertion = false;
      msg = "DebugClass.assert() - second parameter must be a string";
    }

  if (!assertion)
    {
      this.error(msg);
    }

} // DebugClass.assert()

// assert_w()
// ----------
//
// Issue warning if assertion false.

DebugClass.prototype.assert_w = function(assertion, msg) 
{ 
  if (typeof assertion !== 'boolean')
    {
      assertion = false;
      msg = "DebugClass.assert_w() - first parameter must be a boolean";
    }
  else if (typeof msg !== 'string')
    {
      assertion = false;
      msg = "DebugClass.assert_w() - second parameter must be a string";
    }
  
  if (!assertion)
    {
      this.warning(msg);
    }
    
} // DebugClass.assert_w()


DebugClass.prototype.mail = function(msg) 
{
  MailApp.sendEmail('dave@edcode.org', "Flubaroo debug email", msg);
}

DebugClass.prototype.checkFieldLog = function() 
{  
  if (this.field_log_on === null)
    {
      var rd_sheet = SpreadsheetApp.getActiveSpreadsheet()
                                   .getSheetByName(FIELD_LOG_SHEET_NAME);
  
      if (!rd_sheet)
        {
          this.field_log_on = false;
        }
      else 
        {
          this.field_log_on = true;
        }
    }
      
  return this.field_log_on;
}

DebugClass.prototype.getFieldLogRate = function()
{
  if (this.field_log_rate != null)
    {
      return this.field_log_rate;
    }

  var rate = FIELD_LOG_DEFAULT_RATE;  
  
  var rd_sheet = SpreadsheetApp.getActiveSpreadsheet()
                                   .getSheetByName(FIELD_LOG_SHEET_NAME);
  if (rd_sheet)
    {
      var r = rd_sheet.getRange(1, 1, 1, 1);
      var custom_rate = r.getValue();
      if (custom_rate != "")
        {
          rate = Number(custom_rate);
        }
    }
  
  this.field_log_rate = rate;
  return rate;
}


DebugClass.prototype.writeToFieldLogSheet = function() 
{  
  if (!this.checkFieldLog())
    {
      return;
    }
  else if (this.field_log_messages.length == 0)
    {
      return;
    }
  
  var rd_sheet = SpreadsheetApp.getActiveSpreadsheet()
                               .getSheetByName(FIELD_LOG_SHEET_NAME);

  // set max size of log. poor man's wrap-around for now.
  if (rd_sheet.getLastRow() > FIELD_LOG_WRAP_AROUND)
    {
      rd_sheet.getRange(2, 1, rd_sheet.getLastRow() - 1, 1).clear();
    }
  
  // if first log in sheet, want to skip past the first row (where the rate is kept)
  var first_log = (rd_sheet.getLastRow() <= 1) ? 1: 0;
  
  var total_rows_needed = rd_sheet.getLastRow() + this.field_log_messages.length;
  var more_rows_needed = total_rows_needed - rd_sheet.getMaxRows();
  
  if (more_rows_needed >= 0)
    {
      rd_sheet.insertRowsAfter(rd_sheet.getLastRow(), more_rows_needed + 1);
    }

  var range_start = rd_sheet.getLastRow() + 1 + first_log;

  var r = rd_sheet.getRange(range_start, 1, this.field_log_messages.length, 1);
  var vals = [];

  for (var i=0; i < this.field_log_messages.length; i++)
    {
      vals[i] = [this.field_log_messages[i]];
    }

  r.setValues(vals);
  
  this.field_log_messages = new Array();
}

DebugClass.prototype.createHiddenFieldLog = function() 
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();  
  var fl_sheet = ss.getSheetByName(FIELD_LOG_SHEET_NAME);
  if (!fl_sheet)
    {
      var fl_sheet = ss.insertSheet(FIELD_LOG_SHEET_NAME);

      fl_sheet.hideSheet();
    }
}

// Event Handlers
// ==============

function createDebugMenu(menu)
{
  var ui = SpreadsheetApp.getUi();
  
  var submenu = null;
  
  if (Debug.debugOn)
    {
      var dp = PropertiesService.getDocumentProperties();
      submenu = ui.createMenu("Debug");
 
      // Line break.
      submenu.addItem("Reset and delete Grades sheet", "resetFlubaroo");
      submenu.addItem("Reset without deleting Grades sheet", "reinitialize");

      if (UI.isOn())
        {
          submenu.addItem("Skip UI", "skipUIMenu");
        }
      else
        {
          submenu.addItem("Display UI", "displayUIMenu");
        }
        
      //submenu.addItem("Clear Log", "logClear");

      submenu.addItem("Trigger Autograde", "onAutogradeSubmission");
      
      submenu.addItem("Dump Config", "dumpConfig");      
      
      //submenu.addItem("Run Tests", "runTests");
      
      if (dp.getProperty(DOC_PROP_SKIP_EMAIL))
        {
          submenu.addItem("Send Emails", "toggleEmailSending");
        }
      else
        {
          submenu.addItem("Skip Emailing", "toggleEmailSending");
        }
    }
  
  return submenu;
  
} // createDebugMenu()

// dumpConfig()
// ------------

function dumpConfig()
{  
  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  var dp = PropertiesService.getDocumentProperties();
 
  Debug.info("dumpConfig() - DOC_PROP_NUM_GRADED_SUBM: " + 
             Number(dp.getProperty(DOC_PROP_NUM_GRADED_SUBM)));

  
  var trigger_id = dp.getProperty(DOC_PROP_AUTOGRADE_SUBMIT_TRIGGER_ID);
  if (trigger_id)
    {
      Debug.info("trigger_id: " + trigger_id);
    }
  else
    {
      Debug.info("no trigger id in properties");
    }
  
  if (trigger_id)
    {
      var tg = getTrigger(ss, trigger_id);
      if (tg)
        {
          Debug.info("trigger found!");
        }
      else
        {
          Debug.info("trigger not found");
        }
    }
  
  //var all_triggers = ScriptApp.getProjectTriggers(); 
  var all_triggers = ScriptApp.getUserTriggers(ss);
  Debug.info("all_triggers.length: " + all_triggers.length);
  for (var i=0; i < all_triggers.length; i++)
    {
      var t = all_triggers[i];
      Debug.info("trigger id [" + i + "]: " + t.getUniqueId() + ", event type: " + t.getEventType() + ", handler: " + t.getHandlerFunction());
    }
  
  dumpAllDocumentProperties();
  
  Debug.writeToFieldLogSheet();
  
} // dumpConfig()

// logClear()
// ----------

function logClear()
{
  Debug.info("logClear()");
 
  var log_sheet = SpreadsheetApp.getActiveSpreadsheet()
                                .getSheetByName(LOG_SHEET_NAME);
  
  if (log_sheet)
    {
      log_sheet.deleteRows(1, log_sheet.getMaxRows() - 1);
      log_sheet.insertRowsAfter(1, 5);
    }
  
} // logClear()


// reinitilize()
// --------------
function reinitialize()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  var dp = PropertiesService.getDocumentProperties();
  
  Debug.info("reinitialize()");

  dp.deleteAllProperties();
  
  // Clear the triggers.  
  var triggers = ScriptApp.getUserTriggers(ss);
  //var triggers = ScriptApp.getProjectTriggers();
  
  for (var i = 0; i < triggers.length; i++)
    {
      ScriptApp.deleteTrigger(triggers[i]);
    }

  // Simulate a re-installation.
  onInstall();
  
  return;
  
} // reinitialize()

// resetFlubaroo()
// ---------------

function resetFlubaroo()
{
  var rv = Browser.msgBox(langstr("FLB_STR_NOTIFICATION"), 
                         "Reset everything? You will lose your existing Grades sheet (maybe save it first).",
                         Browser.Buttons.YES_NO);
  
  if (rv != "yes")
    {
      return;
    }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();  
  var rs_sheet = ss.getSheetByName(FIELD_RESET_SHEET_NAME);
  if (rs_sheet)
    {
      ss.deleteSheet(rs_sheet);
    }
  
  logClear();
  deleteGradesSheet();
  reinitialize();
} // resetFlubaroo()

// deleteGradesSheet()
// -------------------

function deleteGradesSheet()
{  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetWithGrades(ss);
  
  if (sheet)
    {
      ss.setActiveSheet(sheet);
      ss.deleteActiveSheet();

      // To avoid a bug in which 'Grades' get deleted, but appears to
      // stick around, switch to another sheet after deleting it.
      // TODO_AJR: bug still exists sometimes.
    
      var switch_to_sheet = getSheetWithSubmissions(ss);
      ss.setActiveSheet(switch_to_sheet);
    }
  
} // deleteGradesSheet()

// toggleEmailSending()
// --------------------

function toggleEmailSending()
{
  var dp = PropertiesService.getDocumentProperties();
  
  if (dp.getProperty(DOC_PROP_SKIP_EMAIL))
    {
      dp.deleteProperty(DOC_PROP_SKIP_EMAIL);
    }
  else
    {
      dp.setProperty(DOC_PROP_SKIP_EMAIL, 'true');
    }
    
} // toggleEmailSending()


// dumpAllDocumentProperties()
// --------------------

function dumpAllDocumentProperties()
{
  var dp = PropertiesService.getDocumentProperties();
  
  Debug.info("dumpAllDocumentProperties()");
  var props = dp.getProperties();
  var prop_names = Object.keys(props);
  
  for (var i=0; i < prop_names.length; i++)
    {
      var p_name = prop_names[i];
      Debug.info("dumpAllDocumentProperties(): " + p_name + ": " + props[p_name]);
    }
}
