// menu.gs
// =============
//
// This file contains all the code related to setting up the menu, and 
// some setup functions that respond to the menu selections.

// Flubaroo Menu
// =============

function createFlubarooMenu()
{ 
  Debug.info("createFlubarooMenu() - entering");
  
  if (Autograde.stillRunning())
    {
      Debug.info("createFlubarooMenu() - won't update menu b/c autograde is running. returning.");
      // Autograde can't update any UI related stuff when running from
      // a trigger.
      return;
    }

  var dp = PropertiesService.getDocumentProperties();
  var up = PropertiesService.getUserProperties();
  var ss = SpreadsheetApp.getActiveSpreadsheet();  
  var sui = SpreadsheetApp.getUi();
  var menu = sui.createMenu(gbl_menu_name);
  var grades_sheet = getSheetWithGrades(ss);
  var category_names_sheet = getSheetWithCategories(ss);
  
  // DAA TODO: 5/10/16: Commented out this new check due to hanging b/c checkForOnSubmitTrigger() not returning. 
  //Autograde.checkAndCorrectState();  
  
  if (Autograde.isOn())
    {
      Debug.info("creating menu for Autograde ON");
      
      // Don't allow the usual options. Just the ability to turn this off.
      menu.addItem(langstr("FLB_STR_MENU_DISABLE_AUTO_GRADE"), "toggleAutograde");
      
      menu.addSeparator(); // line break
      menu.addItem(langstr("FLB_STR_MENU_ABOUT"), "aboutFlubaroo");  

      var dbg_menu = createDebugMenu(menu);
      
      if (dbg_menu)
        {
          menu.addSeparator(); // line break
          menu.addSubMenu(dbg_menu);
        }
      
      menu.addToUi();       
      return;
    }
   
  // Only show "Re-grade, Email Grade, View Report, etc, if (a) Grades sheet is present and
  // (b) user didn't just upgrade to a new version of Flubaroo in this sheet. If they just upgraded,
  // assignment must be re-graded first, incase format of Grades sheet is different in new version.
  else if (grades_sheet && !invalidateGradesOnUpdate())
    {      
      menu.addItem(langstr("FLB_STR_MENU_REGRADE_ASSIGNMENT"), "menuGradeStep1");

      menu.addItem(langstr("FLB_STR_MENU_SHARE_GRADES"), "menuShareGrades");
      
      menu.addItem(langstr("FLB_STR_MENU_VIEW_REPORT"), "viewReport");
      
      if (category_names_sheet)
        {
          menu.addItem(langstr("FLB_STR_MENU_VIEW_CATEGORY_REPORT"), "runCategoriesReport");
        }
      
      menu.addSeparator(); // line break

      if (helpTipsHidden())
        {
          menu.addItem(langstr("FLB_STR_MENU_EDIT_HELP_TIPS"), "toggleHelpTips");
        }
      else
        {
          menu.addItem(langstr("FLB_STR_MENU_HIDE_HELP_TIPS"), "toggleHelpTips");
        }

      var col_hidden = dp.getProperty(DOC_PROP_STUDENT_FEEDBACK_HIDDEN);
      
      if (col_hidden == "true")
        {
          menu.addItem(langstr("FLB_STR_MENU_EDIT_FEEDBACK"), "toggleFeedback");
        }
      else
        {
          menu.addItem(langstr("FLB_STR_MENU_HIDE_FEEDBACK"), "toggleFeedback");
        }
      
      // any manually graded questions?
      var grading_opt_str = dp.getProperty(DOC_PROP_UI_GRADING_OPT);
      if (grading_opt_str)
        {
          var grading_opt = grading_opt_str.split(",");
          for (var i=0; i < grading_opt.length; i++)
            {
              var gopt = grading_opt[i];
              if (isManuallyGraded(gopt))
                {
                  menu.addItem(langstr("FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS"), "showManuallyGradedQuestions");
                  break;
                }
            }
        }
    }
  else
    {
      menu.addItem(langstr("FLB_STR_MENU_GRADE_ASSIGNMENT"), "menuGradeStep1");
      menu.addSeparator(); // line break
      
      if (helpTipsHidden())
        {
          menu.addItem(langstr("FLB_STR_MENU_EDIT_HELP_TIPS"), "toggleHelpTips");
        }
      else
        {
          menu.addItem(langstr("FLB_STR_MENU_HIDE_HELP_TIPS"), "toggleHelpTips");
        }
    }
   
  menu.addSeparator(); // line break
  
  var submenu = sui.createMenu(langstr("FLB_STR_MENU_ADVANCED"));
  submenu.addItem(langstr("FLB_STR_MENU_ADV_OPTIONS"), "menuAdvancedOptions");
  submenu.addItem(langstr("FLB_STR_MENU_ENABLE_AUTO_GRADE"), "toggleAutograde");

  submenu.addItem(langstr("FLB_STR_MENU_PRINT_GRADES"), "menuPrintGrades");
  submenu.addItem(langstr("FLB_STR_MENU_SET_LANGUAGE"), "setLanguage");
  submenu.addItem(langstr("FLB_STR_MENU_SHOW_EMAIL_QUOTA"), "showEmailQuota");
  submenu.addItem(langstr("FLB_STR_MENU_EXPAND_FORMULAS"), "expandFormulaTokensInRange");

  // daa test triggers
  //submenu.addItem("test add trigger", "daaTestAddTrigger");

  menu.addSubMenu(submenu);

  menu.addSeparator(); // line break
  menu.addItem(langstr("FLB_STR_MENU_ABOUT"), "aboutFlubaroo");  
   
  var dbg_menu = createDebugMenu(menu);
  if (dbg_menu)
    {
      menu.addSeparator(); // line break
      menu.addSubMenu(dbg_menu);
    }
  
  var rs_sheet = ss.getSheetByName(FIELD_RESET_SHEET_NAME);
  if (rs_sheet)
    {
      menu.addSeparator();
      menu.addItem("Field Reset", "resetFlubaroo");
    }
  
  menu.addToUi(); 
  
  Debug.info("createFlubarooMenu() - exiting");

  return;
}

/*
function daaTestAddTrigger()
{
  var dp = PropertiesService.getDocumentProperties();

  try
    {
      var hour = dp.getProperty("daatriggerhour");
      if (!hour)
        {
          hour = 5;
        }
      else
        {
          hour = Number(hour) + 1;
        }

      var monitor_trigger = ScriptApp.newTrigger("daaDoNothing")
                                          .timeBased().atHour(5).everyDays(1)
                                          //.everyHours(1)
                                          .create();

      dp.setProperty("daatriggerhour", hour.toString());

    }
  catch (e)
    {
      Browser.msgBox("can't create trigger: " + e.message);
      console.log("can't create trigger: " + e.message)
      return;
    }

  var ss = SpreadsheetApp.getActiveSpreadsheet();  
  var all_triggers = ScriptApp.getUserTriggers(ss);
  Browser.msgBox("new trigger added for hour  " + hour + ". " + all_triggers.length + " total triggers");
  console.log("new trigger added for hour  " + hour + ". " + all_triggers.length + " total triggers");
}

function daaDoNothing()
{

}
*/

// createNonAuthMenu:
// We're in the case when this Add-On hasn't yet been used in the sheet, even though
// it's been approved in another sheet. So all we're able to do is setup a menu (i.e.
// can't read properties, etc). Setup a simple English menu, since we can't lookup their lang.
function createNonAuthMenu()
{   
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu(gbl_menu_name);
  
  menu.addItem(langstr_en("FLB_STR_MENU_ENABLE"), "enableInSheet");
  menu.addToUi();
}

// enableInSheet
// Simple menu option that does nothing, but by virtue of being clicked
// allows the menu to be enabled in this sheet. 
// Called for ScriptApp.AuthMode.NONE.
function enableInSheet()
{
  createFlubarooMenu();
  
  /*
  Browser.msgBox(langstr("FLB_STR_NOTIFICATION"),
                 langstr("FLB_STR_FLUBAROO_NOW_ENABLED"), Browser.Buttons.OK); 
  */
  
  UI.showMessageBox(langstr("FLB_STR_NOTIFICATION"), langstr("FLB_STR_FLUBAROO_NOW_ENABLED"));

  showUpdateNotice();
}

// skipUIMenu()
// ------------

function skipUIMenu()
{
  UI.off();
  
  createFlubarooMenu();
  
} // skipUIMenu()

// displayUIMenu()
// ---------------

function displayUIMenu()
{
  UI.on();
  
  createFlubarooMenu();
  
} // displayUIMenu()

function aboutFlubaroo()
{  
   var msg = langstr("FLB_STR_ABOUT_FLUBAROO_MSG1") + "<br><br>" + langstr("FLB_STR_ABOUT_FLUBAROO_MSG2");
   UI.showMessageBox(langstr("FLB_STR_MENU_ABOUT"), msg);

   logAboutFlubaroo();
  
   dumpConfig();
}

function menuGradeStep1()
{
  // Housecleaning. Clear this anytime a user explicitly chooses to grade
  // the assignment. It could be left set if a user quit prematurely while
  // setting autograde options, which could in turn mess up the UI flow for 
  // normal grading.
  Autograde.clearGatheringOptions();
 
  return gradeStep1(ENOUGH_SUBM_SOURCE_USER_FROM_MENU);
}

function menuAdvancedOptions()
{
  var html = UI.advancedOptions(); 
  
  SpreadsheetApp.getUi()
                  .showModalDialog(html, langstr("FLB_STR_ADV_OPTIONS_WINDOW_TITLE"))
  
  return;
}

function showManuallyGradedQuestions()
{
  return UI.showManuallyGradedQuestions();
}