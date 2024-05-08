// autograde.gas
// =============
//
// This file contains all the code related to the Autograde function.
//
// All access to the autograde script properties should be within 
// the autograde object.

// TODO_AJR - assert on edits when Autograde on (?).

// TODO_AJR - Decide on consistent function description styles.

// TODO_AJR - Should we be checking explicitly or just using falsey/truthy
// type conversion. if (!a) {...} or if (a === null) {...}. I probably
// prefer the later as it's stronger typing, the other could fall through
// with unexpected values. 

// TODO_AJR - Is deleting a property each time going to be slower than setting it?

// The global Autograde object
// ---------------------------

// TODO_AJR - Should we just have an instance of this when we need it?
Autograde = new AutogradeClass();

// Autograde class
// ---------------

function AutogradeClass()
{
  // Private properties
  // ==================
  
  // Autograde/UI Events - offsets into the State/Event Table.
  var agUIEvents = 
    {
      AUTOGRADE_ON: 0,
      AUTOGRADE_OFF: 1,
      UI_ON: 2,
      UI_OFF: 3,
      LENGTH: 4
    };
  
  // setAgUiState()
  // ----------------
  //
  // This is a state machine that ensures that only legal combinations of 
  // autograde and UI (present and previous) states.
  //
  // There is a very tight relationship between the UI and autograde.
  // When autograde is on, UI must be off. But when autograde is turned off
  // the UI is usually turned back on, unless it was originally off in which
  // case it is left off.
  // 
  // So the autograde/UI state can be described by three flags:
  //
  // Each of these states are stored in a Document Property to ensure they are
  // persistent for the life of the script, not just a particular execution.
  //
  // To check that only the correct states are being used each flag is stored 
  // in a bitmask and on an event (autograde or the UI being turned on or off) 
  // the subsequent state is derived from the State/Event Table.
  // 
  //   bit 0 - autograde: on (1) or off (0)
  //   bit 1 - UI: on (1) or off (0)
  //   bit 2 - UI state before the autograde was toggled: on (1) or off (0)
  //   bit 3 - Whether this state is allowed: ok (0) or illegal (1)
    
  function setAgUiState(event)
  {    
    Debug.info("AutogradeClass.setAgUiState() - event: " + event);
  
    Debug.assert(typeof event === "number" && event < agUIEvents.LENGTH, 
                 "AutogradeClass.setAgUiState() - Illegal event");
  
    // Autograde/UI bitmasks of their possible states.
    var UIWASOFF_UIOFF_AGOFF = 0;  // 0000
    var UIWASOFF_UIOFF_AGON  = 1;  // 0001
    var UIWASOFF_UION__AGOFF = 2;  // 0010
    var UIWASOFF_UION__AGON  = 3;  // 0011
    var UIWASON__UIOFF_AGOFF = 4;  // 0100
    var UIWASON__UIOFF_AGON  = 5;  // 0101
    var UIWASON__UION__AGOFF = 6;  // 0110
    var UIWASON__UION__AGON  = 7;  // 0111
    var ILLEGAL_STATE        = 15; // 1111
  
    var AG_MASK = 1;
    var UI_MASK = 2;
    var UIWASON_MASK = 4;
  
    var stateEventTable = 
      [
        // AUTOGRADE_ON       AUTOGRADE_OFF         UI_ON                 UI_OFF
        // ------------       -------------         -----                 ------ 
        [UIWASOFF_UIOFF_AGON, ILLEGAL_STATE,        UIWASOFF_UION__AGOFF, ILLEGAL_STATE],        // UIWASOFF_UIOFF_AGOFF
        [ILLEGAL_STATE,       UIWASOFF_UIOFF_AGOFF, ILLEGAL_STATE,        ILLEGAL_STATE],        // UIWASOFF_UIOFF_AGON
        [UIWASON__UIOFF_AGON, ILLEGAL_STATE,        ILLEGAL_STATE,        UIWASON__UIOFF_AGOFF], // UIWASOFF_UION__AGOFF
        [ILLEGAL_STATE,       ILLEGAL_STATE,        ILLEGAL_STATE,        ILLEGAL_STATE],        // UIWASOFF_UION__AGON
        [UIWASOFF_UIOFF_AGON, ILLEGAL_STATE,        UIWASOFF_UION__AGOFF, ILLEGAL_STATE],        // UIWASON__UIOFF_AGOFF
        [ILLEGAL_STATE,       UIWASOFF_UION__AGOFF, ILLEGAL_STATE,        ILLEGAL_STATE],        // UIWASON__UIOFF_AGON
        [UIWASON__UIOFF_AGON, ILLEGAL_STATE,        UIWASON__UION__AGOFF, UIWASON__UIOFF_AGOFF], // UIWASON__UION__AGOFF
        [ILLEGAL_STATE,       ILLEGAL_STATE,        ILLEGAL_STATE,        ILLEGAL_STATE]         // UIWASON__UION__AGON
      ];
  
    // Get the present state
    // ---------------------
    
    // Cast the propertie's value as a Boolean and then a number.
    // So e.g. if the property is "true" this is cast to true and then 1.
    var dp = PropertiesService.getDocumentProperties();
    var v = dp.getProperty(DOC_PROP_AUTOGRADE_ENABLED);
    var b = !!v;
    var autogradeOn = +b;
    
    var v1 = dp.getProperty(DOC_PROP_UI_OFF);
    var b1 = !v1;
    var uiOn = +b1;
    
    var v2 = dp.getProperty(DOC_PROP_UI_WAS_OFF);
    var b2 = !v2;
    var uiWasOn = +b2;
    
    // Set up a three digit bitmask to represent the state of 
    // the autograde, UI and the UI state before the last event.
    var presentState = (uiWasOn << 2) | (uiOn << 1) | autogradeOn;
    
    Debug.info("AutogradeClass.setAgUiState() - present state: " + presentState);
    
    // Get the new state
    // -----------------
    
    var newState = stateEventTable[presentState][event];
    
    Debug.info("AutogradeClass.setAgUiState() - new state: " + newState);  
    Debug.info("AutogradeClass.setAgUiState() - event: " + event);
    
    Debug.assert(newState !== ILLEGAL_STATE, "AutogradeClass.setAgUiState() - illegal state");
    
    // Set the script properties
    // -------------------------
    
    if (!!(newState & AG_MASK))
      {
        dp.setProperty(DOC_PROP_AUTOGRADE_ENABLED, "true");
        Debug.info("AutogradeClass.setAgUiState() - autograde on");      
      }
    else
      {
        dp.deleteProperty(DOC_PROP_AUTOGRADE_ENABLED);
        Debug.info("AutogradeClass.setAgUiState() - autograde off");            
      }
  
    if (!!(newState & UI_MASK))
      {
        dp.deleteProperty(DOC_PROP_UI_OFF);
        Debug.info("AutogradeClass.setAgUiState() - UI on");      
      }
    else
      {
        dp.setProperty(DOC_PROP_UI_OFF, "true");
        Debug.info("AutogradeClass.setAgUiState() - UI off");            
      }
  
    if (!!(newState & UIWASON_MASK))
      {
        dp.deleteProperty(DOC_PROP_UI_WAS_OFF);
        Debug.info("AutogradeClass.setAgUiState() - UI was on");      
      }
    else
      {
        dp.setProperty(DOC_PROP_UI_WAS_OFF, "true");
        Debug.info("AutogradeClass.setAgUiState() - UI was off");            
      }
      
  }; // AutogradeClass.setAgUiState()
    
  // Privileged methods
  // ==================
  //
  // Methods that are public but have access to local properties.
  
  // on()
  // ----
  //
  // Enable autograding. In order to perform autograding all grading 
  // and email options need to have been setup. If they have give the 
  // user the option to change them.

  this.on = function()
  {
    Debug.info("AutogradeClass.on()");
    Debug.info("AutogradeClass.on() - getDoFullRegrade = " + Autograde.getDoFullRegrade());
  
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var gather_app = null;
    var result;
    var gather_options = false;

    if (!preGradeChecks(ENOUGH_SUBM_SOURCE_USER_AG_SETUP_OPTIONS))
      {
        return;
      }
    
    var grades_sheet = getSheetWithGrades(ss);
    var grades_sheet_is_valid = false;
    if (grades_sheet)
      {
        grades_sheet_is_valid = gwsGradesSheetIsValid(grades_sheet);
      }
  
    // Process the existing grades sheet, if present and valid.
    if (grades_sheet && !grades_sheet_is_valid)
      {
        // Existing Grades sheet is invalid! Cannot continue with re-grading.
        UI.showInvalidGradesSheetMessage();
        return;
      }
    
    if (!gotGradingAndEmailInfo())
      {
        result = UI.msgBox(langstr("FLB_STR_NOTIFICATION"), 
                                langstr("FLB_STR_AUTOGRADE_SETUP"),
                                Browser.Buttons.OK_CANCEL);
      
        if (result != "ok")
          {
            // user chose not to setup autograde.
            return;
          }
        
        gather_options = true;
      }
    else 
      {
        // at this point, we have grading & email options stored. but see if the user
        // wants to update them before we proceed.

        // grading options set, but find out if user wants to update them.
        result = Browser.msgBox(langstr("FLB_STR_NOTIFICATION"), 
                                langstr("FLB_STR_AUTOGRADE_UPDATE"),
                                Browser.Buttons.YES_NO);
      
        if (result === "yes")
          {
            gather_options = true;
          }
        else if (result === "cancel")
          {
            return;
          }
      }     

    // What's the user decided?
    if (gather_options)
      {
        gather_app = launchOptionsUpdate();
      }
    else
      {
        this.finalizeOn();
      }

    return gather_app;
    
    // launchOptionsUpdate()
    // ---------------------
    
    function launchOptionsUpdate()
    {
      Debug.info("AutogradeClass.on.launchOptionsUpdate()");
      var dp = PropertiesService.getDocumentProperties();
      dp.setProperty(DOC_PROP_AUTOGRADE_GATHERING_OPTIONS, "true");
      
      /*
      if (!preGradeChecks(ENOUGH_SUBM_SOURCE_USER_AG_SETUP_OPTIONS))
        {
          return;
        }
      */
      
      // Gather or update grading options via UI.
      var sheet = getSheetWithSubmissions(ss);
      UI.showStep1Grading(sheet);
      
    } // launchOptionsUpdate()
    
  } // AutogradeClass.on()
  
  // off()
  // -----
  //
  // Disable autograding.
  
  this.off = function()
  {
    Debug.info("AutogradeClass.off()");  
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dp = PropertiesService.getDocumentProperties();
    var trigger_id = dp.getProperty(DOC_PROP_AUTOGRADE_SUBMIT_TRIGGER_ID);
     
    if (trigger_id)
      {
        // Delete actual trigger.
        deleteTrigger(ss, trigger_id);

        // Clear the stored trigger ID.
        dp.deleteProperty(DOC_PROP_AUTOGRADE_SUBMIT_TRIGGER_ID);
      }
    else
      {
        Debug.warning("Autograde.off() - submit trigger had not recorded property.");
      }
    
    var monitor_trigger_id = dp.getProperty(DOC_PROP_AUTOGRADE_MONITOR_TRIGGER_ID);
    if (monitor_trigger_id)
      {
        // Delete actual trigger.
        
        deleteProjectTrigger(ss, monitor_trigger_id);

        // Clear the stored trigger ID.
        dp.deleteProperty(DOC_PROP_AUTOGRADE_MONITOR_TRIGGER_ID);        
      }

    // Set autograding and ui flags.
    setAgUiState(agUIEvents.AUTOGRADE_OFF);
    
    // For good measure, ensure we've deleted the enabled flag
    // (sometimes bad UI states have caused this problem for users... not sure how,
    //  but they get stuck in a state where they're unable to disable it).
    dp.deleteProperty(DOC_PROP_AUTOGRADE_ENABLED);
    
    // Cleanup the "running" flag, incase it was left set somehow.
    dp.deleteProperty(DOC_PROP_AUTOGRADE_RUNNING);
    
    // Rebuild the menu.
    createFlubarooMenu(ss);
    
    this.trackUse(false);
    
    Debug.writeToFieldLogSheet();
    
    // Tell the user.
    setNotification(ss, langstr("FLB_STR_NOTIFICATION"),
                    langstr("FLB_STR_AUTOGRADE_IS_OFF"));
    
  } // AutogradeClass.off()
  
  // finalizeOn()
  // ------------
  //
  // Finalize the process of enabling autograde.
  
  this.finalizeOn = function()
  {  
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dp = PropertiesService.getDocumentProperties();
    var sheet = getSheetWithSubmissions(ss);
    
    // ensure that there aren't any manually graded questions. if so, quit.
    var dp = PropertiesService.getDocumentProperties();
    var grading_opt_str = dp.getProperty(DOC_PROP_UI_GRADING_OPT);
    var grading_opt = grading_opt_str.split(",");
    for (var i=0; i < grading_opt.length; i++)
      {
        var gopt = grading_opt[i];
        if (isManuallyGraded(gopt))
          {
            Browser.msgBox(langstr("FLB_STR_NOTIFICATION"), 
                           langstr("FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS"),
                           Browser.Buttons.OK);
            return;
          }
      }
    
    // create the trigger to fire on form submit.
    var trigger = checkForOnSubmitTrigger(ss);
    var monitor_trigger = null;
    
    if (trigger)
      {
        // Before creating the trigger, check for the (rare?) case that the trigger
        // already exists. Seen this sometimes, possibly due to Flubaroo being uninstalled
        // while Autograde still on.
        Debug.info("Autograde.finalizeOn() - onFormSubmit trigger already existed: " + trigger.getUniqueId()); 
      }
    else
      {
        // typical case
        try
          {
            trigger = ScriptApp.newTrigger("onAutogradeSubmission")
                               .forSpreadsheet(ss)
                               .onFormSubmit()
                               .create();
    
            Debug.info("Autograde.finalizeOn() - onFormSubmit trigger created: " + trigger.getUniqueId()); 
          }
        catch (e)
          {
            Debug.info("Autograde.finalizeOn() - onFormSubmit trigger failed to create! reason: " + e);
            Debug.writeToFieldLogSheet();

            throw e;
          }

        try
          {         
            // also create the hourly timed trigger that checks-up on the form submit trigger.
            monitor_trigger = ScriptApp.newTrigger("monitorAutogradeSubmission")
                                       .timeBased()
                                       .everyHours(1)
                                       .create();
        
            Debug.info("Autograde.finalizeOn() - Autograde monitor trigger created: " + monitor_trigger.getUniqueId()); 
          }
        catch (e)
          {
            Debug.info("Autograde.finalizeOn() - monitorAutogradeSubmission trigger failed to create! reason: " + e);
          }

      }
        
    dp.setProperty(DOC_PROP_AUTOGRADE_SUBMIT_TRIGGER_ID, trigger.getUniqueId());
    dp.setProperty(DOC_PROP_AUTOGRADE_MONITOR_TRIGGER_ID, monitor_trigger.getUniqueId());
    
    setAgUiState(agUIEvents.AUTOGRADE_ON);
    
    createFlubarooMenu(ss);
    
    // If some new submissions since last time, or if first time auto-grade
    // is turned on, kick off an autograde (fake a submit trigger).
    // Only bother if enough rows to grade though (3).
    if (enoughSubmToGrade(sheet, ENOUGH_SUBM_SOURCE_USER_AG_GRADE_RECENT))
      {
        if (this.recentUngradedSubmissions())
          {
            var result = Browser.msgBox(langstr("FLB_STR_NOTIFICATION"), 
                                       langstr("FLB_STR_AUTOGRADE_GRADE_RECENT"),
                                       Browser.Buttons.YES_NO);
            
            if (result == "yes")
              {
                onAutogradeSubmission();
              }
          }
      }
    
    // track usage of autograde.
    this.trackUse(true);
    
    Debug.writeToFieldLogSheet();
    
    setNotification(ss, langstr("FLB_STR_NOTIFICATION"),
                    langstr("FLB_STR_AUTOGRADE_IS_ON"));
                             
  } // AutogradeClass.finalizeOn()

  // isOn()
  // ------
  //
  // Check whether Autograde is enabled.
  
  this.isOn = function()
  {
    var dp = PropertiesService.getDocumentProperties();
    
    // Cast the script property as a Boolean.
    var isOn = !!dp.getProperty(DOC_PROP_AUTOGRADE_ENABLED);
    Debug.info("AutogradeClass.isOn(): " + isOn); 

    return isOn;
    
  } // AutogradeClass.isOn()

  // isOff()
  // -------
  //
  // Check whether Autograde is disabled.
  
  this.isOff = function()
  {
    var dp = PropertiesService.getDocumentProperties();
    
    // Cast the script property as a Boolean.
    var isOff = !dp.getProperty(DOC_PROP_AUTOGRADE_ENABLED);
    Debug.info("AutogradeClass.isOff(): " + isOff);
    return isOff;
    
  } // AutogradeClass.isOff()
    
  // TODO_AJR - Should get cleared earlier, at the moment only menuGradeStep1
  
  // isGatheringOptions()
  // --------------------
  
  this.isGatheringOptions = function()
  {
    var dp = PropertiesService.getDocumentProperties();
    return dp.getProperty(DOC_PROP_AUTOGRADE_GATHERING_OPTIONS) === "true";
    
  } // AutogradeClass.isGatheringOptions()
  
  // clearGatheringOptions()
  // -----------------------
  
  this.clearGatheringOptions = function()
  {
    var dp = PropertiesService.getDocumentProperties();
    dp.deleteProperty(DOC_PROP_AUTOGRADE_GATHERING_OPTIONS);
    
  } // AutogradeClass.clearGatheringOptions()
  
  this.isRunning = function()
  {
    var dp = PropertiesService.getDocumentProperties();
    var running = dp.getProperty(DOC_PROP_AUTOGRADE_RUNNING);
    if (running == null)
      {
        return false;
      }
    
    return true;
    
  } // AutogradeClass.isRunning()
  
  this.stillRunning = function()
  {
    // first, check if autograde is enabled, and we are running
    if (!(Autograde.isOn() && Autograde.isRunning()))
    {
      Debug.info("Autograde.stillRunning - Autograde isn't on, and isn't running. So returning false.");
      return false;
    }

    Debug.info("Autograde.stillRunning - Autograde.isRunning(): " +  Autograde.isRunning());
        
    // next, check that it's not been more than X minutes since we 
    // started running. otherwise we'll assume grading died, in which
    // case we'll reset the running flag.
    var dp = PropertiesService.getDocumentProperties();
    var running = dp.getProperty(DOC_PROP_AUTOGRADE_RUNNING);

    Debug.info("Autograde.stillRunning() - running: " + running); 
    
    if (running == null)
      {
        // Bizzare, but I saw this (rarely) in user logs. actually saw a case where isRunning() call earlier in this
        // function returned "true", but then this running variable showed null! Apps Script bug? 
        // Causes issues when autograde truly is running, so catch this and return true.
        Debug.error("Autograde.stillRunning(): handling case where running == null");
        return true;
      }
    
    // fix issue for pre version 22 users who are stuck with "Help" menu.
    // can remove this "true" check on next version.
    if (running && (running == "true"))
    {
      dp.deleteProperty(DOC_PROP_AUTOGRADE_RUNNING);
      return false;
    }

    var ms1 = Number(running);
           
    var dt = new Date();
    var ms2 = dt.getTime();


    var diff = ms2 - ms1;
    Debug.info("Autograde.stillRunning(): time since run start: " + diff.toString());

    if ((ms2 - ms1) > (8 * 60 * 1000))
    {
      // grading probably died while autograde was running.
      // make this time period (currently 8 min) long enough that this won't 
      // happen on the edge case that autograde has just exceeded the 5 minute mark
      // (max apps script exec time) when this function is called.
      Debug.info("too much time has passed since autograde started.");
      dp.deleteProperty(DOC_PROP_AUTOGRADE_RUNNING);
      return false;       
    }
    
    return true;
    
  } // AutogradeClass.isRunning()
  
  this.uiOn = function ()
  {
    setAgUiState(agUIEvents.UI_ON);
    
  } // AutogradeClass.uiOn()

  this.uiOff = function ()
  {
    setAgUiState(agUIEvents.UI_OFF);
    
  } // AutogradeClass.uiOff()
  
  this.trackUse = function (is_on)
  {
    var up = PropertiesService.getUserProperties();
    var active_uses = up.getProperty(USER_PROP_AUTOGRADE_ACTIVE_USES);
    if (active_uses == null)
      {
        active_uses = 0;
      }
    else
      {
        active_uses = Number(active_uses);
      }

    if (is_on)
      {
        active_uses += 1;
      }
    else // is_off
      {
        active_uses = Math.max(0, active_uses - 1);
      }

    up.setProperty(USER_PROP_AUTOGRADE_ACTIVE_USES, active_uses.toString()); 
  } // AutogradeClass.trackUse()
  
 
  this.recentUngradedSubmissions = function ()
  {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dp = PropertiesService.getDocumentProperties();
    var sheet = getSheetWithSubmissions(ss);
    var grades_sheet = getSheetWithGrades(ss);  

    var num_rows = sheet.getLastRow();
    var last_row_count = dp.getProperty(DOC_PROP_LAST_GRADED_ROW_COUNT);
    if (last_row_count == null)
      {
        // grading has never been done before, so we definitely need to grade initially.
        last_row_count = 0;
      }
    
    Debug.info("AutogradeClass.recentUngradedSubmissions() - " + last_row_count + "," + num_rows);
    
    if (last_row_count != num_rows)
      {        
        // there has been a change (likely an increase) in the number
        // of rows in the submissions sheet since we last ran autograde.
        return true;
      }
    
    // also check if there simply isn't a Grades sheet yet. this could happen 
    // if the instructor deleted an old Grades sheet (corrupted), and then toggled Autograde off/on.
    // it's also helpful for debugging when I delete a Grades sheet and then trigger a fake form submission.
    if (grades_sheet == null)
      {
        return true;
      }
    
    // the number of rows in the submissions sheet is the same now as it
    // was when we last completed autograding. so nothing recent/new to grade.
    return false;
    
  } // AutogradeClass.recentUngradedSubmissions()          
 
  // setDoFullRegrade()
  // -----------------
  //
  // sets whether autograde will process all submissions (effectively regrading the
  // whole assignment), or just process the most recent submissions.
  this.setDoFullRegrade = function(true_or_false)
  {
    var dp = PropertiesService.getDocumentProperties();
    dp.setProperty(DOC_PROP_AUTOGRADE_DO_FULL_REGRADE, true_or_false.toString());  
  }

  // getDoFullRegrade()
  // -----------------
  //
  // returns true if autograde is setup to regrade the entire assignment upon each submission.
  // returns false if it only grades the most recent ungraded submissions.
  this.getDoFullRegrade = function()
  {
    var dp = PropertiesService.getDocumentProperties();
    var prop_str = dp.getProperty(DOC_PROP_AUTOGRADE_DO_FULL_REGRADE);  
  
    // if property was never set (old version of Flubaroo), then set it to false by default
    // since we don't know how many submissions we're dealing with.
    if (prop_str == null)
      {  
        this.setDoFullRegrade(false);
        prop_str = "false";
      }
  
    return (prop_str === 'true');
  }
  
} // AutogradeClass()

// Autograde event handlers
// ========================

// toggleAutograde()
// -----------------

// "toggle Autograde" menu event handler.
function toggleAutograde()
{
  Debug.info("toggleAutograde() - handling user's choice");
  //var ss = SpreadsheetApp.getActiveSpreadsheet();
  //var ss_id = ss.getId();
  //var owner = ReDriveApp.getFileById(ss_id).getOwner();
  
  if (Autograde.isRunning())
    {
      // need to inform the user that they cannot stop autograde just yet.
      // use Browser.msgBox, since UI is off, so UI.msgBox won't work.
      Browser.msgBox(langstr("FLB_STR_NOTIFICATION"), 
                     langstr("FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW"),
                     Browser.Buttons.OK);
      
    }

  // removing b/c now with /drive.file scope (vs full /drive scope), can no longer
  // open spreadsheet Flubaroo is installed in (since it did not create this file)
  /*
  else if (Autograde.isOff() && (owner === null))
    {
      // if we're in a team drive, don't allow autograde to be enabled 
      // (can't setup triggers).
      Browser.msgBox(langstr("FLB_STR_NOTIFICATION"), 
                         langstr("FLB_STR_AUTOGRADE_CANNOT_WORK_IN_TEAM_DRIVE"),
                         Browser.Buttons.OK);
    }
  */
  else
    {    
      Autograde.isOn() ? Autograde.off() : Autograde.on();
    }
  
  dumpConfig();
  Debug.writeToFieldLogSheet();

} // toggleAutograde()


// onAutogradeSubmission()
// -----------------------
//
// A form submission was made whilst autograde was enabled.

function onAutogradeSubmission()
{ 
  Debug.createHiddenFieldLog();
  
  Debug.info("onAutogradeSubmission() - entering");

  // Initial checks
  // --------------

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetWithSubmissions(ss);
  var dp = PropertiesService.getDocumentProperties();
  var completed = false;
  var backup_grades_sheet = null;
  var num_graded_subm_before_ag;
  
  var grading_lock;

  if (!Autograde.isOn())
    {
      // Trigger is present, but autograde not on. Seen this a few times, possibly because
      // Flubaroo was uninstalled while trigger was set (?). Remove trigger and quit.
      Debug.assert(Autograde.isOn(), 
                   "onAutogradeSubmission() - Autograde off, not expecting trigger");
      var t = checkForOnSubmitTrigger(ss);
      
      if (t)
        {
          deleteTrigger(ss, t.getUniqueId());
          Debug.info("Removed existing autograde trigger");    
        }

      return;
    }
  else
    {
      Debug.info("onAutogradeSubmission() - autograde is on");
    }
     
  if (!sheet)
    {
      Debug.warning("onAutogradeSubmission() - no submission sheet.");
      return;
    }
  
  // With recent upgrade to Version 30, it's possible that there are no
  // Step1 grading options if autograde was on when the update occured.
  // So, check for that case, and if detected, turn off autograde and notify
  // the user.
  if (!gotGradingAndEmailInfo())
    {
      Autograde.off();
      notifyOwnerOfAutogradeOff();
      return;
    }
  
  // Grade Submissions
  // -----------------
  //
  // While there are more submissions in the submissions sheet than 
  // have been graded keep on processing them. 

  // This could be "triggered" whilst another submission is being 
  // processed, so get an exclusive, public lock.
  //grading_lock = LockService.getPublicLock();
  grading_lock = LockService.getDocumentLock();
  
  // Try to get an exclusive lock on the document
  Debug.info("onAutogradeSubmission() - attempting to get lock");
  if (!grading_lock.tryLock(300000))
    {
      Debug.info("onAutogradeSubmission() - failed to get lock");
      return;
    }

  try
    {
      // We have lock, so a try/finally is used to make sure
      // the lock is released if we get an error mid-grading.
    
      Debug.info("onAutogradeSubmission() - got lock");
    
      // check if we even need to proceed. there's a good chance
      // that several closely timed submissions will all get graded
      // by the first trigger, even though each will call this same
      // trigger-based function in turn.
      if (!Autograde.recentUngradedSubmissions())
        {
          Debug.info("onAutogradeSubmission() - everything already graded, so exiting");
          grading_lock.releaseLock();
          Debug.info("onAutogradeSubmission() - lock released");
          return;
        }
      
      // check for a valid Grades sheet
      var grades_sheet = getSheetWithGrades(ss);  
      if (grades_sheet)
        {
          if (!gwsGradesSheetIsValid(grades_sheet))
            {
              // Email this warning to the user if Autograde is running and somehow the Grades sheet got corrupted.
              // Also turn off Autograde. Better to have it off than to have it running and failing on a corrupted sheet.
              notifyOwnerOfCorruptedGradesSheet();
              Autograde.off();
            }
        }
  
      // backup the existng Grades sheet, incase Autograde fails.
      if (grades_sheet && Autograde.getDoFullRegrade())
        {
          var old_backup = ss.getSheetByName("Grades (Autograde Backup)");
          if (old_backup)
            {
              ss.deleteSheet(old_backup);
            }
          
          backup_grades_sheet = grades_sheet.copyTo(ss).setName("Grades (Autograde Backup)");
        }
                  
      num_graded_subm_before_ag = dp.getProperty(DOC_PROP_NUM_GRADED_SUBM);
      
      // Always default to whatever is in the existing Grades sheet when it comes to
      // how many graded submissions there are. This handles cases when, for example,
      // autograde dies after having already set this property, but the Grades sheet was
      // reverted due to an exception.
      if (grades_sheet)
        {
          var single_cell = grades_sheet.getRange(GRADES_SUMMARY_COUNTED_SUBM_ROW_NUM, 2, 1, 1);  
          var grades_sheet_num_graded_subm = Number(single_cell.getValue());
          if (Number(num_graded_subm_before_ag) != grades_sheet_num_graded_subm)
            {
              Debug.info("inconsistent value for num graded submissions. setting property DOC_PROP_NUM_GRADED_SUBM to: " + grades_sheet_num_graded_subm);
              dp.setProperty(DOC_PROP_NUM_GRADED_SUBM, grades_sheet_num_graded_subm.toString());
            }
        }
           
      // log the time when autograde started running
      var dt = new Date();
      var ms = dt.getTime();
      var ms_str = ms.toString();
      dp.setProperty(DOC_PROP_AUTOGRADE_RUNNING, ms_str);
    
      var num_rows = sheet.getLastRow();
      var rows_processed = 0;
      var status;
      
      //while (rows_processed < num_rows)  // DAA May 2016 - do this only once to avoid going over app script time limit. if i put this loop back, also add back in the 'break' below (line 890)
      //  {
          Debug.info("onAutogradeSubmission: rows_processed=" + rows_processed + ", num_rows=" + num_rows);
  
          // Grade the next row in the submissions sheet and email the result.
          
          rows_processed = sheet.getLastRow();
          Debug.info("onAutogradeSubmission: starting grading");
          status = gradeStep1(ENOUGH_SUBM_SOURCE_AG_SUBMISSION);
          
          if (status == STATUS_OK)
            {
              completed = true;

              Debug.info("onAutogradeSubmission: grading done, starting emailing");
              doShareGrades();
                        
              // Get the figures to see if we need to go around again.
              num_rows = sheet.getLastRow();

            }
          else
            {
              Debug.info("onAutogradeSubmission: no grading was performed, so skipping emailing");
              //break;
            }
      //  }
    }
  catch (e)
     {
      /*
      Debug.error("onAutogradeSubmission() - Exception: " + e);
      var e_msg = "onAutogradeSubmission() - ss.getID() = " + ss.getId() + ", Exception: " + e + "\n\n";

      if (Debug.checkFieldLog())
        {
          Debug.writeToFieldLogSheet();
          
          var fl_sheet = SpreadsheetApp.getActiveSpreadsheet()
                                   .getSheetByName(FIELD_LOG_SHEET_NAME);
          var start_row = Math.max(1, fl_sheet.getLastRow() - 500);
          var lines = fl_sheet.getRange(start_row, 1, 500, 1).getValues();
 
          for (var i=0; i < lines.length; i++)
            {
              e_msg += lines[i][0] + "\n";
            }          
        }
      */
      
      //Debug.mail(e_msg);

      // daa 10/21/23: trying to track down source of autograde failures.
      console.error("onAutogradeSubmission() - Exception for user: " + getUid() + ": " + e);    
    }
  finally
    {      
      if (!completed)
        {
          // failure! restore the original grades sheet.
          
          // remove the failed Grades sheet. may contain partial or incomplete information.          
          if (backup_grades_sheet)
            {
              var grades_sheet = getSheetWithGrades(ss);
              if (grades_sheet)
                {
                  ss.deleteSheet(grades_sheet);
                }
              
              // restore the backup copy
              backup_grades_sheet.copyTo(ss).setName(langstr("FLB_STR_SHEETNAME_GRADES"));
              
              // if back copy restored, then delete the backup copy
              if (getSheetWithGrades(ss))
                {
                  // also restore properties that correspond to the Grade sheet being restored.
                  dp.setProperty(DOC_PROP_NUM_GRADED_SUBM, num_graded_subm_before_ag);
                  ss.deleteSheet(backup_grades_sheet);
                }
            }
        }
      else // completed!
        {
          if (backup_grades_sheet)
            {
              // delete the backup copy
              ss.deleteSheet(backup_grades_sheet);
            }
        } 
      
      SpreadsheetApp.flush();
      dp.deleteProperty(DOC_PROP_AUTOGRADE_RUNNING);
      grading_lock.releaseLock();
      Debug.info("onAutogradeSubmission() - lock released");
      Debug.writeToFieldLogSheet();
    }
      
} // onAutogradeSubmission()

// monitorAutogradeSubmission: Called every hour when autograde is On.
function monitorAutogradeSubmission()
{
  var ss;
  var dp;

  // noticed that sometimes I get this error in log from attempting to get doc props:
  // "No item with the given ID could be found. Possibly because you have not edited this item or you do not have permission to access it."... so putting in try/catch
  try
    {
      ss = SpreadsheetApp.getActiveSpreadsheet();
      dp = PropertiesService.getDocumentProperties();
    }
  catch (e)
    {
      return;
    }
  
  // check if we think autograde is on, but the trigger is missing (Google likely deleted it).
  // if detected, restore it and trigger autograde too incase we've missed any recent submissions.
  //Debug.info("monitorAutogradeSubmission(): Autograde.isOn() = " + Autograde.isOn() + ", checkForOnSubmitTrigger(ss) = " + checkForOnSubmitTrigger(ss));
  if (Autograde.isOn() && (checkForOnSubmitTrigger(ss) === null))
    {
      try
        {
          Debug.info("monitorAutogradeSubmission(): Re-creating missing form submit trigger");
          var trigger = ScriptApp.newTrigger("onAutogradeSubmission")
                                 .forSpreadsheet(ss)
                                 .onFormSubmit()
                                 .create();
          dp.setProperty(DOC_PROP_AUTOGRADE_SUBMIT_TRIGGER_ID, trigger.getUniqueId());
        }
      catch (e)
        {
          Debug.info("monitorAutogradeSubmission(): Unable to regenerate missing autograde submit trigger: " + e);
          return;
        }

      Debug.info("monitorAutogradeSubmission(): Triggering autograde to run");

      onAutogradeSubmission();
    }
  
  try {
    Debug.writeToFieldLogSheet();
  }
  catch (e) {
    
  }
}

function notifyOwnerOfAutogradeOff()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var owner = ss.getOwner();  
  var ss_name = ss.getName();
  var ss_link = ss.getUrl();
  
  var email_address = owner.getEmail();
  var msg_title = 'Flubaroo Notice - Autograde has been turned off in your sheet: "' + ss_name + '"';
  
  var html_body = '<p>A recent upgrade of the Flubaroo Add-on required that Autograde be turned off in your sheet: <a href=\"' + ss_link + '\">' + ss_name + '</a>.</p>';
  html_body += "<p>You will need to re-enable Autograde, and re-setup your grading options when prompted. Apologies for any inconvenience. This should be ";
  html_body += "a one-time occurrence.</p><p>The Flubaroo Team</p>";
  
  MailApp.sendEmail(email_address, msg_title, "",
                    {htmlBody: html_body, noReply: true, name: "Flubaroo Autograde"});
  
}

function notifyOwnerOfCorruptedGradesSheet()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var owner = ss.getOwner();  
  var ss_name = ss.getName();
  var ss_link = ss.getUrl();
  
  var email_address = owner.getEmail();
  var msg_title = 'Flubaroo Notice - Autograde has been turned off in your sheet: "' + ss_name + '"';
  
  var html_body = '<p>Flubaroo has detected that your Grades sheet is corrupted, \and as a result Autograde has been turned off in your sheet: <a href=\"' + ss_link + '\">' + ss_name + '</a>.</p>';
  html_body += "<p>Please see <a href=\"http://www.flubaroo.com/hc/corrupted-grades-sheet\">this article</a> for assistance, and then re-enable autograde once you again have a valid Grades sheet.";
  html_body += "<p>The Flubaroo Team</p>";
  
  MailApp.sendEmail(email_address, msg_title, "",
                    {htmlBody: html_body, noReply: true, name: "Flubaroo Autograde"});
  
}

// getAutogradeAnswerKeyValues()
// -----------------------------
// Returns an array of answer key values that were stored in a document property when
// autograding was setup. Should be identical to the array obtained from reading
// the answer key values from the Student Submissions sheet (non autograde case).
// Storing the answer key values in a property is needed to avoid cases of misgrading 
// when the answer key row shifts due to sorting or Google forms submit funnyness.
function getAutogradeAnswerKeyValues(subm_sheet, ak_row_number)
{
  var dp = PropertiesService.getDocumentProperties();

  var ag_ak_prop = dp.getProperty(DOC_PROP_AUTOGRADE_ANSWER_VALUES);
      
  if (!ag_ak_prop)
    {
      // we haven't yet stored the options. mostly likely b/c this instance of Autograde
      // was already turned on before I added this functionality, or because 
      // the user enabled autograde without updating their grading options.
      ag_ak_prop = setAutogradeAnswerKeyValues(subm_sheet, ak_row_number);
    }
  
  // next, process the array. we want to make this look exactly as if the row
  // was ready from the spreadsheet itself, which means returning things as the
  // proper objects instead of strings (which is all a property can store).
  var ak_row_vals = ag_ak_prop.split(FLB_AUTOGRADE_AK_DELIMITER);
  
  for (var i=0; i < ak_row_vals.length; i++)
    {
      var lc_ak = ak_row_vals[i].toLowerCase();
      
      if ((ak_row_vals[i] !== "") && !isNaN(ak_row_vals[i]))
        {
          ak_row_vals[i] = Number(ak_row_vals[i]);
        }
      else if (lc_ak == "true" || lc_ak == "false")
        {
          ak_row_vals[i] = (lc_ak === 'true');
        }  
    }
  
  Debug.info("getAutogradeAnswerKeyValues() - stored answer key row is: " + ak_row_vals);
  
  return ak_row_vals;
}

// setAutogradeAnswerKeyValues()
// -----------------------------
// Given a reference to the submissions sheet, and the row number that contains
// the answer key, sets the property that will contain the answer key values
// used by Autograde when grading.
function setAutogradeAnswerKeyValues(subm_sheet, ak_row_number)
{
  var dp = PropertiesService.getDocumentProperties();
  
  var ag_ak_vals = singleRowToArray(subm_sheet, ak_row_number,
                                    getNumQuestionsFromSubmissions(subm_sheet),
                                    false);
          
  var ag_ak_prop = ag_ak_vals.join(FLB_AUTOGRADE_AK_DELIMITER);
  dp.setProperty(DOC_PROP_AUTOGRADE_ANSWER_VALUES, ag_ak_prop);
  
  Debug.info("setAutogradeAnswerKeyValues: read and stored \
                the answer key values into a property from row " + ak_row_number); 
    
  // we return what we set, so it can be used in getAutogradeAnswerKeyValues
  return ag_ak_prop;
}