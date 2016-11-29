// ui.gas
// ------
//
// This file contains all of the functions that display a UI.
//

// UIClass
// =======
UI = new UIClass();

function UIClass()
{
  // Private members
  // ===============

  // Privileged Members
  // ==================

  // isOn()
  // ------
  
  this.isOn = function()
  {
    var dp = PropertiesService.getDocumentProperties();
    var on = (dp.getProperty(DOC_PROP_UI_OFF) === null);
    Debug.info("UIClass.isOn(): " + on);
    return on;

  } // UIClass.isOn()

  // isOff()
  // ------

  this.isOff = function()
  {
    var dp = PropertiesService.getDocumentProperties();
    var off = (dp.getProperty(DOC_PROP_UI_OFF) === "true"); 
    Debug.info("UIClass.isOff(): " + off);  
    return off;

  } // UIClass.isOff()

  // on()
  // ----

  this.on = function()
  {
    Debug.info("UIClass.on()");

    // Autograde manages the relationship between autograde and the UI.
    Autograde.uiOn();

  } // UIClass.on()

  // off()
  // -----

  this.off = function()
  {
    Debug.info("UIClass.off()");

    // Autograde manages the relationship between autograde and the UI.
    Autograde.uiOff();
    
  } // UIClass.off()

  // msgBox()
  // --------

  this.msgBox = function(title, prompt, buttons) 
  {
    // Some msg boxes only continue if yes is selected, so default
    // to that for silent operation.
    var result = "yes";

    if (this.isOn())
      {
        result = Browser.msgBox(title, prompt, buttons); 
      }
    
    return result;
    
  } // UIClass.msgBox()

  // pleaseWait()
  // ------------
  //
  // Create a simple UI asking the user to wait while their
  // assignment is being graded. This UI will be replaced once grading
  // completes.
  
  this.pleaseWait = function(sheet, title, msg)
  {
    Debug.info("UIClass.pleaseWait()");
  
    var app = UiApp.createApplication()
                   .setTitle(title)
                   .setWidth("500").setHeight("200");
    
    // Create the main panel to hold all content in the UI for this step.
    
    var main_panel = app.createVerticalPanel()
                        .setStyleAttribute('border-spacing', '10px');
    app.add(main_panel);
    
    var hpanel_main = app.createHorizontalPanel()
                         .setStyleAttribute('border-spacing', '10px');
    
    var vpanel1 = app.createVerticalPanel()
                     .setStyleAttribute('border-spacing', '10px');
    
    // Add a top level hpanel for instructions and picture.
    
    var vpanel1 = app.createVerticalPanel()
                     .setStyleAttribute('border-spacing', '10px')
                     .add(app.createImage(FLUBAROO_WELCOME_IMG_URL));
    
    var vpanel2 = app.createVerticalPanel()
                     .setStyleAttribute('border-spacing', '10px');
    
    var hpanel_r_top = app.createHorizontalPanel()
                          .setStyleAttribute('border-spacing', '10px')
                          .add(app.createLabel(msg));
    
    var hpanel_r_bot = app.createHorizontalPanel()
                          .setStyleAttribute('border-spacing', '10px')
                          .add(app.createImage(FLUBAROO_WORKING_IMG_BAR_URL));
    
    vpanel2.add(hpanel_r_top);
    vpanel2.add(hpanel_r_bot); 
    
    hpanel_main.add(vpanel1);
    hpanel_main.add(vpanel2);
    
    main_panel.add(hpanel_main);
    
    return app;
    
  } // UIClass.pleaseWait()
  
  // showStep1Grading()
  // --------------
  //
  // Show Step 1 of the UI used to set up submission grading   
  this.showStep1Grading = function()
  {
    var html = HtmlService.createTemplateFromFile('uiStep1')
      .evaluate()
      .setWidth(getUIStep1Width()) 
      .setHeight(UI_STEP1_HEIGHT)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
    SpreadsheetApp.getUi()
                  .showModalDialog(html, langstr("FLB_STR_GRADE_STEP1_WINDOW_TITLE"));
  }
  
  // showStep2Grading()
  // --------------
  //
  // Show Step 2 of the UI used to set up submission grading.
  // Takes as argument an array of grading options selected in Step 1.
  this.showStep2Grading = function()
  {
    var html = HtmlService.createTemplateFromFile('uiStep2')
      .evaluate()
      .setWidth(UI_STEP2_WIDTH) 
      .setHeight(UI_STEP2_HEIGHT)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
    SpreadsheetApp.getUi()
                  .showModalDialog(html, langstr("FLB_STR_GRADE_STEP2_WINDOW_TITLE"));
  }
      
  // showShareGrades()
  // -------------
  //
  this.showShareGrades = function(sheet)
  {
    var dp = PropertiesService.getDocumentProperties(); 
    dp.setProperty(DOC_PROP_SHARE_OR_PRINT_GRADES, "share");
    
    var html = HtmlService.createTemplateFromFile('uiPrintOrShareGrades.html')
                  .evaluate()
                  .setWidth(UI_SHARE_GRADES_WIDTH) 
                  .setHeight(UI_SHARE_GRADES_HEIGHT)
                  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
    SpreadsheetApp.getUi()
                  .showModalDialog(html, langstr("FLB_STR_SHARE_GRADES_WINDOW_TITLE"));
  }

  // showPrintGrades()
  // -------------
  //
  this.showPrintGrades = function(sheet)
  {
    var dp = PropertiesService.getDocumentProperties();
    dp.setProperty(DOC_PROP_SHARE_OR_PRINT_GRADES, UI_PRINT_DIALOGUE_MODE);
        
    var html = HtmlService.createTemplateFromFile('uiPrintOrShareGrades.html')
                  .evaluate()
                  .setWidth(UI_PRINT_GRADES_WIDTH) 
                  .setHeight(UI_PRINT_GRADES_HEIGHT)
                  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
    SpreadsheetApp.getUi()
                  .showModalDialog(html, langstr("FLB_STR_PRINT_GRADES_WINDOW_TITLE"));

  }
  
  // gradingResults()
  // -------------
  //
  // Create the UI for grading results (when grading completes)
  
  this.createGradingResults = function()
  {
    var html = HtmlService.createHtmlOutput()
                          .setSandboxMode(HtmlService.SandboxMode.IFRAME)
                          .setWidth(550).setHeight(300);

    html.setTitle(langstr("FLB_STR_GRADING_COMPLETE_TITLE"));
    
    var h = "<html><body>";
    h += '<div style="font-family:Sans-Serif;font-size:14px;">';
    h += '<img style="padding-right:15px;" src="' + FLUBAROO_WELCOME_IMG_URL + '" align="left">';
       
    
    h += "<p>" + langstr("FLB_STR_RESULTS_MSG1") + "</p><br><br>";
    //h += langstr("FLB_STR_RESULTS_MSG2") + "</p>";
    
    var tip_html = getFlubarooTipHTML();

    h += '<br><div><img src="' + FLUBAROO_TIP_IMG_URL + '" align="left" \
width=60 style="padding-left:10px;padding-right:15px;"><p><br>' + tip_html + "</p></div>"; 
    
    /*
    h += '<br><div align="right">';
    h += '<br><form action="" id="gr_form">';
    h += '<input type="button" value="' + langstr("FLB_STR_GRADE_BUTTON_VIEW_GRADES") + '" ';
    h += 'onclick="google.script.host.close()" />';
    h += "</form></div>";
    */
    
    h += '</div>';
        
    h += "</body></html>";
    
    html.append(h);
    
    return html;
  }

  // showMessageBox()
  // -------------
  //
  // Display a generic UI for messages. Shown with a Flubaroo logo.
  this.showMessageBox = function(title, msg)
  {
    if (this.isOn())
      {
        var html = UI.createMessageBox(title, msg);
        SpreadsheetApp.getUi()
                      .showModalDialog(html, title);
      }
  }
  
  // showSideBarMessage()
  // -------------
  //
  // Display a generic UI for messages. Shown with a Flubaroo logo.
  this.showSidebarMessage = function(title, msg, email_me_button)
  {
    if (this.isOn() || Autograde.isOn())
      {
        var html = UI.createSidebarMessage(title, msg, email_me_button);
        SpreadsheetApp.getUi()
                      .showSidebar(html);
      }
  }
  
  // createMessageBox()
  // -------------
  //
  // Create HTML for messages, which is used by showMessageBox.
  
  this.createMessageBox = function(title, msg)
  {
    var html = HtmlService.createHtmlOutput()
                          .setSandboxMode(HtmlService.SandboxMode.IFRAME)
                          .setWidth(510).setHeight(155);

    html.setTitle(title);
    
    var h = "<html><body>";
    h += '<img src="' + FLUBAROO_WELCOME_IMG_URL + '" style="float:left;padding-right:15px;">';
    h += '<div style="font-face:Roboto,Arial;font-family:Sans-Serif;font-size:14px;padding:10px;">';      
    
    h += '<p style="padding-top:0px;margin-top:0px;">' + msg + "</p>";
 
    h += '</div>';
        
    h += "</body></html>";
    
    html.append(h);
    
    return html;
  }
  
  this.createSidebarMessage = function(title, msg, email_me_button)
  {
    var html = HtmlService.createHtmlOutput().setWidth(300)
                          .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    html.setTitle(title);
    
    //var h = "<html><body>";
    h = '<!DOCTYPE html><link rel="stylesheet" href="https://ssl.gstatic.com/docs/script/css/add-ons1.css">';
    h += '<img style="padding:10px 10px 0px 10px;" src="' + FLUBAROO_MARQUEE_IMG_URL + '"><br>';
    h += '<div style="font-face:Roboto,Arial;font-family:Sans-Serif;font-size:14px;padding:0px 10px; 0px; 10px;">';      
    
    h += '<p style="padding-top:0px;margin-top:0px;padding-top:0px;margin-bottom:0px;">' + msg + "</p>";
 
    h += '</div>';
    
    if (email_me_button)
      {
        h += '<div style="font-face:Roboto,Arial;font-family:Sans-Serif;font-size:14px;padding:10px;">';
        h += '<input type="button" id="emailMeButton" class="action" value="' + langstr("FLB_STR_EMAIL_ME_THIS_ANNOUCNEMENT") + '" onclick="emailAnnouncement()" />';
        h += '</div>';
      }
    
    h += "<script>function emailAnnouncement() { var b = document.getElementById(\"emailMeButton\"); b.disabled = true; google.script.run.emailUserAnnouncement(); } </script>";
    //h += "</body></html>";
    
    html.append(h);
    
    return html;
    
  }
  
  // advancedOptions()
  // -------------
  //
  // Create the UI used for advanced options.
  
  this.advancedOptions = function()
  {
    var dp = PropertiesService.getDocumentProperties();
    var up = PropertiesService.getUserProperties();
    
    // grab the current saved values for the options.
    var edit_link = dp.getProperty(DOC_PROP_ADV_OPTION_EMAIL_EDIT_LINK);
    
    var clear_grades = dp.getProperty(DOC_PROP_CLEAR_VS_DELETE_GRADES_SHEET);
    
    var no_noreply = up.getProperty(USER_PROP_ADV_OPTION_NO_NOREPLY);
    
    var extra_credit = up.getProperty(USER_PROP_ADV_OPTION_EXTRA_CREDIT);
    
    var additional_gopts = up.getProperty(USER_PROP_ADV_OPTION_SHOW_ADDITIONAL_GOPTS);
    
    var mgr_adv_by_question = up.getProperty(USER_PROP_ADV_OPTION_MGR_ADVANCE_BY_QUESTION);

    var autograde_do_full_regrade = Autograde.getDoFullRegrade();

    var share_score_type = up.getProperty(USER_PROP_ADV_OPTION_SHARE_GRADE_SCORE_TYPE);
    
    var email_send_name = up.getProperty(USER_PROP_ADV_OPTION_EMAIL_SEND_NAME);
    
    var show_anskey_for_mgr_ques = up.getProperty(USER_PROP_ADV_OPTION_SHOW_ANSKEY_FOR_MGR_QUES);
    
    var max_pts_str = up.getProperty(USER_PROP_ADV_OPTION_MAX_QUESTION_POINTS);
    if (!max_pts_str || isNaN(max_pts_str))
      {
        max_pts_str = MAX_QUESTION_POINTS_DEFAULT.toString();
      }
    
    var checked;
    
    var h = "<!DOCTYPE html>";

    h += "<?!= HtmlService.createHtmlOutputFromFile('uiStyle').getContent(); ?>";
    h += '<div id="adv_opt_mw" style="font-family:Sans-Serif;font-size:14px;">';
    h += '<b>' + langstr("FLB_STR_ADV_OPTIONS_NOTICE") + ' (<a target="_blank" href="http://flubaroo.com/hc">flubaroo.com/hc</a>).</b><br><br>';

    h += '<div id="adv_opt_selections">';    
    h += '<form id ="adv_options_form" action="">';
    
    // --------------- Options below are for this spreadsheet only ---------------    
    h += '<br>Options for this spreadsheet only:<br>';
    
    h += '<p style="padding-left:25px;">'
 
    var rates = new Array("0.50", "0.55", "0.60", "0.65", "0.70", "0.75", "0.80", "0.85", "0.90", "0.95", "1.00");
    var selected = [];
    for (var i=0; i < rates.length; i++)
      {
        selected.push("");
      }
    
    var opt_pass_rate = dp.getProperty(DOC_PROP_ADV_OPTION_PASS_RATE);
    if (!opt_pass_rate)
      {
        opt_pass_rate = LOWSCORE_STUDENT_PERCENTAGE.toString();
      }
    
    for (var i=0; i < selected.length; i++)
      {
        if (Number(rates[i]) == Number(opt_pass_rate))
          {
            selected[i] = "selected";
            break;
          } 
      }
    
    h += langstr("FLB_STR_ADV_OPTIONS_PASS_RATE") + '<select name="pass_rate">';
    for (var i=0; i < rates.length; i++)
      {
        h += '<option value="' + rates[i] + '" ' + selected[i] + '>' + (Number(rates[i]) * 100).toFixed(1) + "%" + '</option>';
      }
    h += '</select><br><br>';
    
    checked = autograde_do_full_regrade ? "checked" : "";
    h += '<input type="checkbox" name="autograde_do_full_regrade" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_AG_WITH_SUMMARY") + '<br><br>';
    
    checked = clear_grades ? "checked" : "";
    h += '<input type="checkbox" name="clear_grades" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_CLEAR_GRADES") + '<br>';
    
    h += '</p>';

    // --------------- Options below are for ALL spreadsheets where Flubaroo is installed ----------------
    h += "<hr><br>";
    h += 'Options for all spreadsheets where Flubaroo is installed:<br>';

    h += '<p style="padding-left:25px;">';
    
    h += langstr("FLB_STR_ADV_OPTIONS_MAX_QUESTION_POINTS") + ': <input type="text" name="max_ques_points" value="' + max_pts_str + '" size=2 maxlength=2><br><br>';
    
    checked = extra_credit ? "checked" : "";
    h += '<input type="checkbox" name="extra_credit" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_EXTRA_CREDIT") + '<br><br>';
    
    checked = additional_gopts ? "checked" : "";
    h += '<input type="checkbox" name="additional_gopts" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_ADDITIONAL_GOPTS") + '<br><br>';

    checked = mgr_adv_by_question ? "checked" : "";
    h += '<input type="checkbox" name="mgr_adv_by_question" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_MGR_ADV_QUESTION") + '<br><br>';
  
    checked = show_anskey_for_mgr_ques ? "checked" : "";
    h += '<input type="checkbox" name="show_anskey_for_mgr_ques" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_INCLUDE_ANSKEY_FOR_MGR_QUESTIONS") + '<br><br>';
    
    selected = ["", "", ""];
    if (!share_score_type)
      {
        share_score_type = GRADE_SHARE_SHOW_POINTS_AND_PERCENT; // 0
      }
    selected[ Number(share_score_type) ] = "selected";
    
    h += langstr("FLB_STR_ADV_OPTIONS_SHARE_SCORE_TYPE") + ": ";
    h += '<select name="share_score_type">';
    h += '<option value="<?!= GRADE_SHARE_SHOW_POINTS_AND_PERCENT ?>" ' + selected[0] + '><?!= langstr("FLB_STR_GRADE_SHARE_SHOW_POINTS_AND_PERCENT") ?></option>';
    h += '<option value="<?!= GRADE_SHARE_SHOW_POINTS_ONLY ?>" ' + selected[1] + '><?!= langstr("FLB_STR_GRADE_SHARE_SHOW_POINTS_ONLY") ?></option>';
    h += '<option value="<?!= GRADE_SCORE_SHOW_NEITHER ?>" ' + selected[2] + '><?!= langstr("FLB_STR_GRADE_SHARE_SHOW_NEITHER") ?></option>';
    h += '</select><br><br>';
    
    checked = no_noreply ? "checked" : "";
    h += '<input type="checkbox" name="no_noreply" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_NO_NOREPLY") + '<br><br>';
    
    if (email_send_name === null)
      {
        email_send_name = EMAIL_SEND_NAME_DEFAULT;
      }
    
    h += langstr("FLB_STR_ADV_OPTIONS_EMAIL_SENDER_NAME_QUESTION") + ': <input type="text" name="email_send_name" value="' + email_send_name + '" size=25><br><br>';
    
    h += '</p>';
    h += '</div>'; // #adv_opt_selections

    h += '<div style="position: absolute;right:0;bottom:0;margin-top:20px;">'
    var onclick="google.script.run.withSuccessHandler(aoCloseWindow).processAdvOptionsForm($('#adv_options_form')[0])";
    h += '<input type="button" class="action" value="Submit" onclick="' + onclick + '" />';
    h += '</div>';

    h += '</form>';    
    h += '</div>'; // #adv_opt_mw
    
    h += "<script>function aoCloseWindow() { google.script.host.close(); }</script>";
    h += '<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>';
  
    var html = HtmlService.createTemplate(h);

    var output = html.evaluate()
                     .setSandboxMode(HtmlService.SandboxMode.IFRAME)
                     .setTitle(langstr("FLB_STR_ADV_OPTIONS_WINDOW_TITLE"))
                     .setWidth(UI_ADV_OPT_WIDTH)
                     .setHeight(UI_ADV_OPT_HEIGHT);
    
    return output;
  }
  
  // showManuallyGradedQuestions()
  // --------------
  //
  // Show side-bar to do manual grading of questions
  this.showManuallyGradedQuestions = function()
  {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var grades_sheet = getSheetWithGrades(ss);
    var grades_sheet_is_valid = false;
    if (grades_sheet)
      {
        grades_sheet_is_valid = gwsGradesSheetIsValid(grades_sheet);
      }
  
    // Check if the existing grades sheet is valid.
    if (grades_sheet && !grades_sheet_is_valid)
      {
        // Existing Grades sheet is invalid! Cannot continue with re-grading.
        UI.showMessageBox(langstr("FLB_STR_INVALID_GRADE_SHEET_TITLE"), langstr("FLB_STR_INVALID_GRADES_SHEET"));
        return STATUS_CANNOT_CONTINUE;
      }
    
    // Check that the active cell is one for which manual grading was selected as an option.
    // If not, default to the first question/column where manual grading as selected.
    var cell_a1_range = grades_sheet.getRange(1, 1, 1, 1);
    var hidden_row_num_start = cell_a1_range.getValue();
    var grading_opt_row = hidden_row_num_start + GRADES_HIDDEN_ROW_TYPE_GRADING_OPT;
    var grading_opts = grades_sheet.getRange(grading_opt_row, 1, 1, grades_sheet.getLastColumn()).getValues()[0];

    var active_col = grades_sheet.getActiveRange().getColumn();
    var active_row = grades_sheet.getActiveRange().getRowIndex();
    
    // determine first manually graded question. we are guaranteed to find one, as this
    // menu won't be presented to the user unless there is at least one.
    var first_mgr_quetion_col_num = null;
    for (var i=0; i < grading_opts.length; i++)
      {
        if (isManuallyGraded(grading_opts[i]))
          {
            first_mgr_quetion_col_num = i+1;
            break;
          }
      }
    
    if (!isManuallyGraded(grading_opts[active_col - 1]))
      {
        var new_active_cell = grades_sheet.getRange(active_row, first_mgr_quetion_col_num, 1, 1);
        grades_sheet.setActiveRange(new_active_cell);
      }
       
    var html = HtmlService.createTemplateFromFile('uiManualGrading')
      .evaluate()
      .setWidth(UI_MGR_WIDTH) 
      .setHeight(UI_MGR_HEIGHT)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
    SpreadsheetApp.getUi()
                  .showModalDialog(html, langstr("FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE"));
  }
  
  
} // UIClass

// Event handlers
// ==============

// TODO_AJR - I've tried these as private but doesn't work, they could be inside the 
// privileged methods somehow???

// continueButtonClickHandler()
// ----------------------------
//
// Button handler for several UIs.

function continueButtonClickHandler(e)
{
  var app = UiApp.getActiveApplication();
  
  var working_img = app.getElementById('working');
  var continue_button = app.getElementById('CONTINUE');
  var cancel_button = app.getElementById('CANCEL');
  
  Debug.info("continueButtonClickHandler()");
  
  if (continue_button)
  {
    // Disable the continue button.
    continue_button.setEnabled(false);
  }
  
  // Display the "working" image.
  working_img.setVisible(true);
  
  return app;
  
} // continueButtonClickHandler()   

// step2RadioClickHandler()
// ------------------------

function step2RadioClickHandler(e_step2)
{
  Debug.info("step2RadioClickHandler()");

  // Enable this radio button.
  var app = UiApp.getActiveApplication();
  var continue_button = app.getElementById('CONTINUE');
  continue_button.setEnabled(true);
  return app;
  
} // step2RadioClickHandler()


// gradingResultsEventHandler()
// ----------------------------

function gradingResultsEventHandler(e)
{
  Debug.info("gradingResultsEventHandler()");

  // Grading complete - do nothing (for now anyway)
  
  var app = UiApp.getActiveApplication();
  app.close();
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var grades_sheet = getSheetWithGrades(ss);
  if (grades_sheet !== null)
    {
      ss.setActiveSheet(grades_sheet);  
    }
  else
    {
      Debug.error("gradingResultsEventHandler() - no grades sheet");
    }  
  
  return app;
  
} // gradingResultsEventHandler()

// showQuestionsValueChangeHandler()
// ---------------------------------

function showQuestionsValueChangeHandler(e)
{
  var app = UiApp.getActiveApplication();  
  var sa_cbox = app.getElementById('show_answers');
  var new_value = e.parameter.show_questions;
  
  if (new_value === 'true')
  {
    sa_cbox.setEnabled(true);
  }
  else
  {
    sa_cbox.setValue(false);
    sa_cbox.setEnabled(false);
  }
  
  return app;
  
} // showQuestionsValueChangeHandler()

// processShareorPrintSubmit()
// --------------------
function processShareorPrintSubmit(form_obj)
{
  var dp = PropertiesService.getDocumentProperties();
  var mode = dp.getProperty(DOC_PROP_SHARE_OR_PRINT_GRADES);

  if (mode !== UI_PRINT_DIALOGUE_MODE)
    {
      dp.setProperty(DOC_PROP_EMAIL_ADDRESS_QUESTION, 
                                   form_obj.email_ques);
  
      dp.setProperty(DOC_PROP_EMAIL_SHARE_OPTION,
                                   form_obj.sharing_method);
    }
  
  if (!form_obj.include_ques)
    {
      dp.deleteProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_SCORES);
    }
  else
    {
      dp.setProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_SCORES, "true");
    }
    
  dp.setProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_TYPE,
                               form_obj.include_ques_type);
  
  
  if (!form_obj.include_stud_response)
    {
      dp.deleteProperty(DOC_PROP_EMAIL_INCLUDE_STUD_RESP);
    }
  else
    {
      dp.setProperty(DOC_PROP_EMAIL_INCLUDE_STUD_RESP, "true");
    }
    
  if (!form_obj.include_anskey)
    {
      dp.deleteProperty(DOC_PROP_EMAIL_INCLUDE_ANSWER_KEY);
    }
  else
    {
      dp.setProperty(DOC_PROP_EMAIL_INCLUDE_ANSWER_KEY, "true");
    }
   
  dp.setProperty(DOC_PROP_EMAIL_INSTRUCTOR_MESSAGE, 
                               form_obj.instr_message);
  
  dp.setProperty(DOC_PROP_EMAIL_INSTRUCTOR_ADDRESS, 
                               Session.getEffectiveUser().getEmail());
  
  // let's form populator know that properties have been set atleast once
  dp.setProperty(DOC_PROP_EMAIL_FIRST_PROPERTIES_SET, "true");
  
  // If we're just gathering or updating options for autograde 
  // then don't actually send any emails.
  if (Autograde.isGatheringOptions())
    {
      Autograde.finalizeOn();
      Autograde.clearGatheringOptions();
      return;
    }
  
  if (mode !== UI_PRINT_DIALOGUE_MODE)
    {
      doShareGrades();
    }
  else
    {
      doPrintGrades();
    }
  
  Debug.writeToFieldLogSheet();
  
  return;
  
}

function processAdvOptionsForm(formObject)
{
  Debug.info("in the advanced options form handler");
  var up = PropertiesService.getUserProperties(); 
  var dp = PropertiesService.getDocumentProperties();

  // process all of the true/false options
  
  /* works, but removing for now.
  if (!formObject.edit_link)
    {
      removeFormSubmitTrigger();
      dp.deleteProperty(DOC_PROP_ADV_OPTION_EMAIL_EDIT_LINK);
    }
  else
    {
      setupFormSubmitTrigger();
      dp.setProperty(DOC_PROP_ADV_OPTION_EMAIL_EDIT_LINK, "true");
    }
   */
  
  if (formObject.max_ques_points)
    {
      if (formObject.max_ques_points != "" 
          && !isNaN(formObject.max_ques_points) && (Number(formObject.max_ques_points) > 0))
        {
          up.setProperty(USER_PROP_ADV_OPTION_MAX_QUESTION_POINTS, formObject.max_ques_points);
        }
    }
  
  if (!formObject.no_noreply)
    {
      up.deleteProperty(USER_PROP_ADV_OPTION_NO_NOREPLY);
    }
  else
    {
      up.setProperty(USER_PROP_ADV_OPTION_NO_NOREPLY, "true");
    }
  
  if (!formObject.extra_credit)
    {
      up.deleteProperty(USER_PROP_ADV_OPTION_EXTRA_CREDIT);
    }
  else
    {
      up.setProperty(USER_PROP_ADV_OPTION_EXTRA_CREDIT, "true");
    }
  
  if (!formObject.additional_gopts)
    {
      up.deleteProperty(USER_PROP_ADV_OPTION_SHOW_ADDITIONAL_GOPTS);
    }
  else
    {
      up.setProperty(USER_PROP_ADV_OPTION_SHOW_ADDITIONAL_GOPTS, "true");
    }
 
  if (!formObject.mgr_adv_by_question)
    {
      up.deleteProperty(USER_PROP_ADV_OPTION_MGR_ADVANCE_BY_QUESTION);
    }
  else
    {
      up.setProperty(USER_PROP_ADV_OPTION_MGR_ADVANCE_BY_QUESTION, "true");
    }
  
  if (!formObject.show_anskey_for_mgr_ques)
    {
      up.deleteProperty(USER_PROP_ADV_OPTION_SHOW_ANSKEY_FOR_MGR_QUES);
    }
  else
    {
      up.setProperty(USER_PROP_ADV_OPTION_SHOW_ANSKEY_FOR_MGR_QUES, "true");
    }
  
  if (!formObject.autograde_do_full_regrade)
    {
      Debug.info("calling Autograde.setDoFullRegrade(false)");
      Autograde.setDoFullRegrade(false);
    }
  else
    {
      Debug.info("calling Autograde.setDoFullRegrade(true)");
      Autograde.setDoFullRegrade(true);
    }
  
  if (!formObject.clear_grades)
    {
      dp.deleteProperty(DOC_PROP_CLEAR_VS_DELETE_GRADES_SHEET);
    }
  else
    {
      dp.setProperty(DOC_PROP_CLEAR_VS_DELETE_GRADES_SHEET, "true");
    }
  
  if (formObject.share_score_type)
    {
      up.setProperty(USER_PROP_ADV_OPTION_SHARE_GRADE_SCORE_TYPE, formObject.share_score_type);
    }
  
  var pass_rate = formObject.pass_rate;

  if (pass_rate && !isNaN(pass_rate))
    {
      dp.setProperty(DOC_PROP_ADV_OPTION_PASS_RATE, pass_rate);
    }
  
  if (formObject.email_send_name)
    {
      up.setProperty(USER_PROP_ADV_OPTION_EMAIL_SEND_NAME, formObject.email_send_name);
    }
  
  // update the menu incase any changes in options will affect it.
  createFlubarooMenu();
}

function getFlubarooTipHTML()
{
  var num_tips = 10; // update when new tips added
  
  var article = langstr("FLB_STR_RESULTS_TIP_READ_ARTICLE");
  var text = "";
  var url = "";
  
  var up = PropertiesService.getUserProperties();
  var nt = up.getProperty(USER_PROP_NEXT_TIP_NUMBER);
  
  if (!nt)
    {
      nt = 1;
    }
  else
    {
      nt = Number(nt);
    }
  
  switch (nt)
    {
      case 1:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_1");
        url  = "http://www.flubaroo.com/hc/multiple-correct-answers";
        break;
      case 2:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_2");
        url  = "http://www.flubaroo.com/hc/numerical-ranges";
        break;
      case 3:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_3");
        url  = "http://www.flubaroo.com/hc/case-sensitive-answers";
        break;
      case 4:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_4");
        url  = "http://www.flubaroo.com/hc/change-default-70-mark-for-students";
        break;
      case 5:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_5");
        url  = "http://www.flubaroo.com/hc/check-daily-email-quota";
        break;
      case 6:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_6");
        url  = "http://www.flubaroo.com/hc/using-flubaroo-autograde";
        break;
      case 7:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_7");
        url  = "http://www.flubaroo.com/faqs";
        break;
      case 8:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_8");
        url  = "https://sites.google.com/a/flubaroo.com/welcome-to-flubaroo/hc/automatically-collect-email-addresses";
        break;
      case 9:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_9");
        url  = "http://www.flubaroo.com/hc/share-grades-via-drive";
        break;
      case 10:
      default:
        text = langstr("FLB_STR_TIP_MSG_NUMBER_10");
        url  = "http://www.flubaroo.com/hc/print-grades";
        break;
    }
  
  nt = nt + 1;
  if (nt > num_tips)
    {
      nt = 1;
    }

  up.setProperty(USER_PROP_NEXT_TIP_NUMBER, nt.toString());
  
  article = article.replace("%s", url);
  var html = text + " " + article;
  
  return html;
}

// uiStep1GetQuestionData()
// --------------------
// 
// Server-side function to return (as JSON object) all information about
// the questions in Step 1 of grading. Used in uiStep1.html.
function uiStep1GetQuestionData()
{
  var dp = PropertiesService.getDocumentProperties();
  var up = PropertiesService.getUserProperties();
  
  var qdata = 
    {
      // possible grading options to display to user
      possible_gopts_disp : [langstr('FLB_STR_GRADING_OPT_STUD_ID'), langstr('FLB_STR_GRADING_OPT_SKIP_GRADING'), 
                             langstr('FLB_STR_GRADING_OPT_NORMAL_GRADING'),
                             langstr('FLB_STR_GRADING_OPT_MANUAL_GRADING')],
     
      // corresponding grading option strings (used internally)
      possible_gopts : [GRADING_OPT_STUD_ID, GRADING_OPT_SKIP, GRADING_OPT_NORMAL, GRADING_OPT_MANUAL],
     
      // whether or not to show "extra credit" column. false by default unless advanced option is set.
      show_extra_credit: false,
            
      // possible point values to display and set
      possible_pts : [],
      
      // list of question (summaries) to show
      ques_vals : [],
      
      // default grading options - for each question in the ques_vals array, identifies index into possible_gopts 
      // array for default value.
      default_gopts : [],
      
      // default points worth - for each question in the ques_vals array, identifies index into possible_pts 
      // array for default value.
      default_pts : [],
      
      // default value for extra credit checkboxes on each question. either false (unchecked) or true (checked).
      default_extra_credit : [],
      
      // list of category names, pulled from the 'Categories' sheet (if present). Could be empty.
      category_names: [],
      
      // defaults for list of category names, based on possible previous selections
      default_categories: [],
    }
  
  // Check if user has changed the max number of points assignable to a question.
  // Use the default of 10 if not, or if their value isn't a number.
  var max_pts_str = up.getProperty(USER_PROP_ADV_OPTION_MAX_QUESTION_POINTS);
  var max_pts = MAX_QUESTION_POINTS_DEFAULT; // 10
  if (max_pts_str && !isNaN(max_pts_str))
    {
      max_pts = Number(max_pts_str);
    }
  
  // setup the possible assignable points for each question.
  for (var p=1; p <= max_pts; p++)
    {
      qdata.possible_pts.push(p.toString());
    }
  
  var show_additional_gopts = up.getProperty(USER_PROP_ADV_OPTION_SHOW_ADDITIONAL_GOPTS);
  if (show_additional_gopts === "true")
    {
      qdata.possible_gopts_disp.push(langstr('FLB_STR_GRADING_OPT_IGNORE'));
      qdata.possible_gopts_disp.push(langstr('FLB_STR_GRADING_OPT_COPY_FOR_REFERENCE'));
      qdata.possible_gopts.push(GRADING_OPT_IGNORE);
      qdata.possible_gopts.push(GRADING_OPT_COPY_FOR_REFERENCE);
    }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetWithSubmissions(ss);
  
  var num_questions = getNumQuestionsFromSubmissions(sheet);
  //var question_vals = singleRowToArray(sheet, 1, num_questions, false);
  var question_vals = getQuestionValsFromSubmissions(sheet);

  var dp = PropertiesService.getDocumentProperties();
  var up = PropertiesService.getUserProperties();
  
  var existing_gopts = dp.getProperty(DOC_PROP_UI_GRADING_OPT);
  if (existing_gopts)
    {
      existing_gopts = existing_gopts.split(",");
    }
  
  var existing_category_names = dp.getProperty(DOC_PROP_UI_CATEGORY_NAMES);
  if (existing_category_names)
    {
      existing_category_names = existing_category_names.split(FLB_GENERIC_DELIMETER);
    }
  
  var show_extra_credit = up.getProperty(USER_PROP_ADV_OPTION_EXTRA_CREDIT);
  
  if (show_extra_credit === 'true')
    {
      qdata.show_extra_credit = true;
    }
  
  for (var i = 1; i < num_questions; i++)
    {
      // Display a summary of the question, so the instructor can identify it.
      var qd = createQuestionSummary(question_vals[i]);
      var default_gopt_sel;
      var default_pt_sel = 0; // default to "1" point.
      var ex_cb = false;
      var default_cat_sel = 0; // default to first item in list.

      qdata.ques_vals.push(qd);
      
      if (!existing_gopts || (existing_gopts.length != num_questions))
        {
          qdata.default_extra_credit.push(ex_cb);
          
          // Try to detect the type of question (identifies student / skip / 1 pt).
          // We'll assume that longer questions must be gradable (academic) ones.
          default_gopt_sel = 2; // Normal Grading
          if (qd.length < 35)
            {
              qd = qd.toLowerCase();
        
              if (quesIdentifiesStudent(qd))
                {
                  default_gopt_sel = 0;
                }
              else if (quesShouldBeSkipped(qd))
                {
                  default_gopt_sel = 1;
                }
             }
        }
      else
        {
          // restore previously selected grading options.
          var ext_gopt_pair = existing_gopts[i].split("|");
          
          var ext_gopt = ext_gopt_pair[0];

          // pull out any extra credit modifier
          if (ext_gopt.indexOf(GRADING_OPT_EXTRA_CREDIT) != -1)
            {
              ex_cb = true;
            }
          
          ext_gopt = ext_gopt.split("+")[0];

          default_gopt_sel = qdata.possible_gopts.indexOf(ext_gopt);
          if (default_gopt_sel == -1)
            {
              // could happen if user had allowed and selected  additional options (like "Ignore"), but then
              // turned them off.
              default_gopt_sel = 2; // Normal Grading
            }
          
          if (ext_gopt_pair.length > 1)
            {
              // convert points (i.e. 3) into select menu index (i.e. 2).
              default_pt_sel = ext_gopt_pair[1] - 1;
            }
          else
            {
              // just default to first choice ("1" point).
              default_pt_sel = 0;
            }
        }
      
      // restore category selection.
      if (existing_category_names && (existing_gopts.length == num_questions))
        {
          default_cat_sel = existing_category_names[i];
        }
      
      qdata.default_extra_credit.push(ex_cb);
      qdata.default_gopts.push(default_gopt_sel);
      qdata.default_pts.push(default_pt_sel);
      qdata.default_categories.push(default_cat_sel);

    } // for each question.
  
  // populate optional list of categories, if present  
  var cat_sheet = getSheetWithCategories(ss);
  if (cat_sheet)
    { 
      var cat_names = cat_sheet.getRange(1, 1, cat_sheet.getLastRow(), 1).getValues();     
      for (var i=0; i < cat_names.length; i++)
        {
          qdata.category_names.push(cat_names[i][0]);
        }
    }
   
  return qdata;
}

function getUIStep1Width()
{
  // we may need to increase the width if Categories are present to select.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var window_width = UI_STEP1_WIDTH;
  if (getSheetWithCategories(ss))
    {
      window_width += 300;
    }
 
  return window_width;
}

// uiStep2GetAnswerKeyData()
// --------------------
// 
// Server-side function to return (as JSON object) all information about
// the selectable answer keys, for selecting in Step 2 of grading.
function uiStep2GetAnswerKeyData()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetWithSubmissions(ss);

  var num_rows = sheet.getLastRow();
  var num_subm = num_rows - 1;
  
  var ques_col; // spreadsheet column number, which starts from 1.
  var question = '';
  var student_id_cols = [];
  
  var question_vals = getQuestionValsFromSubmissions(sheet);
  //  var question_vals = singleRowToArray(sheet, 1, num_questions, false)
  var trunc_len = 18; // max length of text in each column in the UI
  
  var ak_data = 
    {
      // aks_header: List of questions that identify students.
      aks_header: [],
      
      // aks_vals: 2D array of possible answer key rows that can be selected.
      // Each entry in the array represents a submission, and contains:
      //   [<timestamp value>, <stud ident subm #1>, <stud ident subm #2>, ...]
      aks_vals: [],
      
      // aks_subm_rows: List of numbers which identify the submission row numbers
      aks_subm_rows: [],
      
      // aks_last_selected: Row number of answer key selected last time
      aks_last_selected: -1,
    }
  
  var dp = PropertiesService.getDocumentProperties();
  
  var gopt_str = dp.getProperty(DOC_PROP_UI_GRADING_OPT);
  
  var gopts = gopt_str.split(",");
 
  // Go through each question from the previous step and identify those 
  // that are student identifiers. Put these into their own array.
  for (var i = 1; i < gopts.length; i++)
    {
      if (gopts[i] == GRADING_OPT_STUD_ID)
        {
          // Record this column number.
          ques_col = i + 1; // index 1 is column 2
          student_id_cols.push(ques_col);
        }
    } 
  
  // Next go through each submission, and record just the values for
  // those questions that identify a student, plus the Form's timestamp.
  // To do this, we must first get each column which is associated with a
  // student identifier. We'll create an array of Ranges called
  // 'answer_key_cols'for this, where each Range is a single column.
  // Note that this range starts from row 2 (skips sheet header row).
  var answer_key_cols = [];
  var timestamp_column = sheet.getRange(2, 1, num_rows-1, 1).getValues();
  answer_key_cols.push(timestamp_column);
    
  // get the column associated with each student identifying question.
  for (var i = 0; i < student_id_cols.length; i++)
    {
      // get 1 column containing all submissions (except spreadsheet header
      // row) for this question which identifies a student.
      var single_column = sheet.getRange(2,student_id_cols[i],
                                         num_subm, 1).getValues();
      answer_key_cols.push(single_column);
    }
  
  // populate ak_data.aks_header[]
  ak_data.aks_header.push(langstr("FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME"));

  for (var i = 0; i < student_id_cols.length; i++)
    {
      question = question_vals[student_id_cols[i]-1];
      var ques_trunc = question;
      if (ques_trunc.length > trunc_len)
        {
          ques_trunc = ques_trunc.substring(0,trunc_len) + "...";
        }
      
      ak_data.aks_header.push(ques_trunc);
    }
  
  var row_num;
  var subm_row = 1;  // row to read in each single-column range (which already starts at sheet row #2)
  var text = "";
  var radio_value = "";
    
  // Check if a row of help tips was provided. If so, don't show it in the UI,
  // as it can't be used as an answer key.
  var help_tip_timestamp = timestamp_column[0][0];
  if (help_tip_timestamp == "")
    {
      // There is a help tip here (row after the header that has an empty timestamp).
      // skip it.
      subm_row = 2;
    }

  // populate ak_data.aks_vals
  for (; subm_row <= num_subm; subm_row++)
    {
      var ak_vals = [];
      
      // record the sheet row number of this submission
      row_num = subm_row + 1;
      ak_data.aks_subm_rows.push(row_num);
      
      // get the timestamp for this submission. it's always the first answer key col.
      var subm_date = String(timestamp_column[subm_row - 1][0]);
      subm_date = subm_date.split(" GMT")[0];
      ak_vals.push(subm_date);
      
      var subm_text;
      for (var ques_index = 1; ques_index <= student_id_cols.length; ques_index++)
        {
          subm_text = String((answer_key_cols[ques_index])[subm_row-1][0]);
          if (subm_text.length > trunc_len)
            {
              // Truncate the response and add "..." to the end.
              subm_text = subm_text.substring(0,trunc_len) + "...";
            }
          
          ak_vals.push(subm_text);
        }
      
      // add this the answr key selector values for this submission.
      ak_data.aks_vals.push(ak_vals);
      
    } // for each submission.
  
  var ak_row = dp.getProperty(DOC_PROP_ANSWER_KEY_ROW_NUM)
  if (ak_row != null)
    {
      ak_data.aks_last_selected = Number(ak_row);
    }
  
  return ak_data;
}

function uiPrintOrShareScriptlet_getHeight()
{
  var dp = PropertiesService.getDocumentProperties();
  
  // property DOC_PROP_SHARE_OR_PRINT_GRADES is set in UI.showShareGrades() and/or
  // UI.showPrintGrades()
  var mode = dp.getProperty(DOC_PROP_SHARE_OR_PRINT_GRADES);
  var instr = "";
  
  if (mode === UI_PRINT_DIALOGUE_MODE)
    {
      instr = UI_PRINT_GRADES_HEIGHT;
    }
  else
    {
      instr = UI_SHARE_GRADES_HEIGHT;
    }
  
  return instr;
}

function uiPrintOrShareScriptlet_getWidth()
{
  var dp = PropertiesService.getDocumentProperties();
  
  // property DOC_PROP_SHARE_OR_PRINT_GRADES is set in UI.showShareGrades() and/or
  // UI.showPrintGrades()
  var mode = dp.getProperty(DOC_PROP_SHARE_OR_PRINT_GRADES);
  var instr = "";
  
  if (mode === UI_PRINT_DIALOGUE_MODE)
    {
      instr = UI_PRINT_GRADES_WIDTH;
    }
  else
    {
      instr = UI_SHARE_GRADES_WIDTH;
    }
  
  return instr;
}

function uiPrintOrShareScriplet_includeIfShareMode(include_str)
{
  var rv = "";
  var dp = PropertiesService.getDocumentProperties();
  
  // property DOC_PROP_SHARE_OR_PRINT_GRADES is set in UI.showShareGrades() and/or
  // UI.showPrintGrades()
  var mode = dp.getProperty(DOC_PROP_SHARE_OR_PRINT_GRADES);
  
  if (mode !== UI_PRINT_DIALOGUE_MODE)
    {
      // must be share mode
      rv = include_str;
    }
  
  return rv;
}

function uiPrintOrShareScriplet_includeIfPrintMode(include_str)
{
  var rv = "";
  var dp = PropertiesService.getDocumentProperties();
  
  // property DOC_PROP_SHARE_OR_PRINT_GRADES is set in UI.showShareGrades() and/or
  // UI.showPrintGrades()
  var mode = dp.getProperty(DOC_PROP_SHARE_OR_PRINT_GRADES);
  
  if (mode === UI_PRINT_DIALOGUE_MODE)
    {
      // must be share mode
      rv = include_str;
    }
  
  return rv;
}

function uiShareGradesGetFormData()
{  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetWithSubmissions(ss);

  var dp = PropertiesService.getDocumentProperties();
  var action = dp.getProperty(DOC_PROP_SHARE_OR_PRINT_GRADES);
  
  var props_set = dp.getProperty(DOC_PROP_EMAIL_FIRST_PROPERTIES_SET);
  
  // Setup the data structure that will be returned, including some default values.
  var fd = 
      {
        'mode': action,
        'stud_ident_ques_trunc' : [],
        'stud_ident_ques_full' : [],
        'selected_stud_ident_index' : -1,
        'selected_share_option' : GRADE_SHARE_METHOD_EMAIL.toString(), // form & properties use strings
        'include_questions_checked' : true,
        'selected_include_ques_type' : QUESTIONS_SHARE_ALL.toString(), // form & properties use strings
        'include_anskey_checked': false,
        'include_student_resp_checked' : true,
        'teacher_message' : "",
        'sticker_enabled': false,
        'chosen_sticker_fid' : "",
      };

  // Lookup any selections previously made  
  var email_question = dp.getProperty(DOC_PROP_EMAIL_ADDRESS_QUESTION); 
  var share_option = dp.getProperty(DOC_PROP_EMAIL_SHARE_OPTION);
  var show_answers = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_ANSWER_KEY);
  var instructor_message = dp.getProperty(DOC_PROP_EMAIL_INSTRUCTOR_MESSAGE);
  var show_questions = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_SCORES);
  var show_questions_type = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_TYPE);
  var show_student_response = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_STUD_RESP);
  var chosen_sticker_fid = dp.getProperty(DOC_PROP_STICKER_FILE_ID);
  var sticker_enabled = dp.getProperty(DOC_PROP_STICKER_ENABLED);
 
  if (share_option)
    {
      fd.selected_share_option = share_option;
    }
  if (props_set && !show_questions)
    {
      fd.include_questions_checked = false; 
    }
  
  if (show_questions_type)
    {
      fd.selected_include_ques_type = show_questions_type;
    }
  if (show_answers)
    {
      fd.include_anskey_checked = true;
    }
  if (props_set && !show_student_response)
    {
      fd.include_student_resp_checked = false;
    }
  
  Debug.info("uiShareGradesGetFormData(): props_set=" + props_set 
              + ", show_student_response=" + show_student_response 
              + ", fd.include_student_resp_checked = " + fd.include_student_resp_checked);
  
  if (instructor_message)
    {
      fd.teacher_message = instructor_message;
    }
  
  if (sticker_enabled)
    {
      fd.sticker_enabled = sticker_enabled;
    }
  
  if (chosen_sticker_fid)
    {
      fd.chosen_sticker_fid = chosen_sticker_fid;
    }

  // Grab the list of questions, so the user can select which contains
  // the email. Note: we don't use a GradesWorksheet object as this
  // function could be getting invoked from AutoGrade setup, where
  // no submissions or grades yet exist.
  var questions_full_text = getQuestionValsFromSubmissions(sheet);   
        
  // grading options guaranteed to be set at this point.    
  var grade_opt_str = dp.getProperty(DOC_PROP_UI_GRADING_OPT);
  var grading_options = grade_opt_str.split(",");
  var position = -1;
    
  for (var q_index = 0; q_index < questions_full_text.length; q_index++)
    {
      var ques_val = questions_full_text[q_index];
      var gopt = grading_options[q_index];
        
      if (gopt === GRADING_OPT_STUD_ID)
        {
          var ques_val_orig = ques_val;
 
          if (ques_val.length > 40)
            {
              ques_val = ques_val.substring(0, 35) + "..."; 
            } 
          
          position++;
          fd.stud_ident_ques_trunc.push(ques_val);
          fd.stud_ident_ques_full.push(ques_val_orig);
          
          if (!email_question)
            {
              // no previous selection. guess which question collected email addresses.
              if (quesContainsEmail(ques_val_orig))
                {       
                  fd.selected_stud_ident_index = position;
                }
            }
          else
            {
              if (email_question === ques_val_orig)
                {
                  fd.selected_stud_ident_index = position;
                }
            }
        }
    }
  
    // Private functions.
    function quesContainsEmail(ques_txt)
      {
        ques_txt = ques_txt.toLowerCase();
      
        if (ques_txt.indexOf('email') != -1 ||
            ques_txt.indexOf('e-mail') != -1 ||
            ques_txt.indexOf('correo') != -1)
            {
              return true;
            }
      
        return false;    
      }
  
  return fd;
}

function uiShareGradesSaveSticker(sticker_enabled, drive_file_id, sticker_percent)
{
  var dp = PropertiesService.getDocumentProperties();
  
  if (!sticker_enabled)
    {
      Debug.info("User opted not to send a sticker");
      dp.deleteProperty(DOC_PROP_STICKER_ENABLED);
    }
  else
    {
      Debug.info("User has chosen to send a sticker");
      dp.setProperty(DOC_PROP_STICKER_ENABLED, "true");
    }
                     
  // check that a valid percentage was set
  if (sticker_percent != "" && !isNaN(sticker_percent) && (Number(sticker_percent) >= 0))
    {
      // valid percentage threshold. record it.
      dp.setProperty(DOC_PROP_STICKER_THRESHOLD1, sticker_percent);
      
      // check if a file was selected. if so, record which one.
      if (drive_file_id !== "")
        {
          // record the drive file id
          dp.setProperty(DOC_PROP_STICKER_FILE_ID, drive_file_id);
        }
      else
        {
          dp.deleteProperty(DOC_PROP_STICKER_FILE_ID);
        }
      
      Debug.info("User opted to include sticker (id=" + drive_file_id + ") when sharing grades and score >= " + sticker_percent + "%");
    }
  else
    {
      dp.deleteProperty(DOC_PROP_STICKER_THRESHOLD1);
    } 

  return;
}


function uiShareGradesLoadStickerList()
{
  var dp = PropertiesService.getDocumentProperties();

  var sticker_enabled = dp.getProperty(DOC_PROP_STICKER_ENABLED);
  var sticker_file_id = dp.getProperty(DOC_PROP_STICKER_FILE_ID);
  var sticker_percent = dp.getProperty(DOC_PROP_STICKER_THRESHOLD1);
  
  var sd = 
    {
      'sticker_enabled' : false,
      'sticker_file_id' : "",
      'sticker_percent' : "",
      ids: [],
      names : [],
    };
   
  if (sticker_enabled)
    {
      sd.sticker_enabled = true;
    }
  if (sticker_file_id)
    {
      sd.sticker_file_id = sticker_file_id;
    }
  if (sticker_percent)
    {
      sd.sticker_percent = sticker_percent;
    }
    
  // Pull in list of free/public stickers
  var public_stickers_folder = DriveApp.getFolderById("0B3gmIDjKT36hSXRPdmp3ZDBSN28");
  var public_stickers = public_stickers_folder.getFiles();
  
  while (public_stickers.hasNext())
    {
      var sticker = public_stickers.next();
      
      var fname = sticker.getName();
      var clean_name = fname.substr(0, fname.lastIndexOf('.')) || fname;
      var ext_name = fname.substr(fname.lastIndexOf('.') + 1).toLowerCase();
      
      if (ext_name === "jpg" || ext_name === "png")
        {
          sd.names.push(clean_name);
          sd.ids.push(sticker.getId());
        }
    }
  
  
  // Pull in this user's own stickers, from "Flubaroo - Stickers" in their My Drive
  var status = unzipStickers();
  
  if (status)
    {
      // something went worng unzipping. let user know.
      throw "Unable to complete unzip successfully";
    }
  
  //var folders = DriveApp.getFoldersByName(MY_FLUBAROO_STICKERS_FOLDER);
  var folders = DriveApp.searchFolders("title = '" + MY_FLUBAROO_STICKERS_FOLDER + "' and 'me' in owners");
  var my_stickers_folder = null;
  if (folders.hasNext())
    {
      my_stickers_folder = folders.next();
    }
    
  if (my_stickers_folder)
    {      
      // ensure permission is set to be viewable for folks with link
      my_stickers_folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      var my_stickers = my_stickers_folder.getFiles();
      
      while (my_stickers.hasNext())
        {
          var sticker = my_stickers.next();
      
          var fname = sticker.getName();
          var clean_name = fname.substr(0, fname.lastIndexOf('.')) || fname;
          var ext_name = fname.substr(fname.lastIndexOf('.') + 1).toLowerCase();
          
          if (ext_name === "jpg" || ext_name === "png")
            {
              sd.names.push(clean_name);
              sd.ids.push(sticker.getId());
            }
        }
    }
  
  return sd;
}

