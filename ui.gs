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
                          .add(app.createImage(FLUBAROO_WORKING_IMG_URL));
    
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
      .setWidth(UI_STEP1_WIDTH) 
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
  
  // gradingResults()
  // ----------------
  
  this.gradingResults = function()
  {
    Debug.info("UIClass.gradingResults()");
  
    var app = UiApp.createApplication()
                   .setTitle(langstr("FLB_STR_GRADING_COMPLETE_TITLE"))
                   .setWidth("500").setHeight("380");
    
    var handler = app.createServerClickHandler('gradingResultsEventHandler');
    
    // create the main panel to hold all content in the UI for this step,
    var main_panel = app.createVerticalPanel()
                        .setStyleAttribute('border-spacing', '10px');
    
    var form = app.createFormPanel()
                  .setId('form')
                  .setEncoding('multipart/form-data');
                  
    form.add(main_panel);   
    
    app.add(form);
    
    // add a top level hpanel for instructions and picture
    var hpanel = app.createHorizontalPanel()
                    .setStyleAttribute('border-spacing', '10px')
                    .add(app.createImage(FLUBAROO_WELCOME_IMG_URL))
                    .add(app.createLabel(langstr("FLB_STR_RESULTS_MSG1"))
                    .setStyleAttribute('margin-top', '10px'));
                    
    var hpanel2 = app.createHorizontalPanel()
                     .add(app.createLabel(langstr("FLB_STR_RESULTS_MSG2"))
                     .setStyleAttribute('margin-left', '10px'));
    
    main_panel.add(hpanel);
    main_panel.add(hpanel2);
    
    // add the button at the bottom.
    var btnGrid = app.createGrid(1, 1).setStyleAttribute('float', 'right');
    var btnSubmit = app.createButton(langstr("FLB_STR_GRADE_BUTTON_VIEW_GRADES"), handler)
                       .setId('VIEW GRADES');
    
    btnGrid.setWidget(0,0,btnSubmit);
    
    main_panel.add(btnGrid);
    
    // Refresh the menu to make sure that the 'Email Grades' option is shown.
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    createFlubarooMenu();
    
    return app;
    
  } // UIClass.gradingResults()
  
  // emailGrades()
  // -------------
  //
  // Display the UI used for emailing the grades.
  // Flag 'just_printing_grades' tells function that "Print Grades" was selected from the
  // menu, which uses a subset of the "Email Grades" UI.
  
  this.emailGrades = function(sheet, just_printing_grades)
  {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dp = PropertiesService.getDocumentProperties();
    var up = PropertiesService.getUserProperties();
    
    Debug.info("UIClass.emailGrades");
  
    var title = langstr("FLB_STR_EMAIL_GRADES_WINDOW_TITLE");
    var height = "555";
    
    if (just_printing_grades)
      {
        title = langstr("FLB_STR_PRINT_GRADES_WINDOW_TITLE");
        height = "455";
      }
    else
      {
        title = langstr("FLB_STR_SHARE_GRADES_WINDOW_TITLE");
      }
    
    var app = UiApp.createApplication().setTitle(title)
                                       .setWidth("450")
                                       .setHeight(height);
    
    var gws;
    
    // Declare the handler that will be called when the 'Continue' or 'Cancel'
    // buttons are clicked.
    var handler = app.createServerClickHandler('emailGradesHandler');
    var click_handler = app.createServerClickHandler('continueButtonClickHandler');
    var show_questions_value_change_handler = app.createServerChangeHandler('showQuestionsValueChangeHandler');
    
    var email_addr = Session.getEffectiveUser().getEmail();
    var email_addr_field = app.createHidden("email_addr", email_addr)
                              .setId("email_addr")
                              .setName("email_addr");

    var just_printing_field = app.createHidden("just_printing_grades", just_printing_grades)
                                 .setId("just_printing_grades").setName("just_printing_grades");
    
    var hidden_vars = app.createVerticalPanel().setVisible(false);
    hidden_vars.add(email_addr_field);
    hidden_vars.add(just_printing_field);
    handler.addCallbackElement(email_addr_field);
    handler.addCallbackElement(just_printing_field);
    
    // Create the main panel to hold all content in the UI for this step.
    var main_panel = app.createVerticalPanel()
                        .setStyleAttribute('border-spacing', '10px');
    
    // Add a top level hpanel for instructions and picture.
    var instr = langstr("FLB_STR_EMAIL_GRADES_INSTR");

    if (just_printing_grades)
      {
        instr = langstr("FLB_STR_PRINT_GRADES_INSTR");
      }
    else
      {
        instr = langstr("FLB_STR_SHARE_GRADES_INSTR");
      }

    var hpanel = app.createHorizontalPanel()
                    .setStyleAttribute('border-spacing', '10px')
                    .add(app.createImage(FLUBAROO_WELCOME_IMG_URL))
                    .add(app.createLabel(instr)
                    .setStyleAttribute('margin-top', '5px'));
    
    main_panel.add(hpanel);
    
    if (!just_printing_grades)
      {
        // Create a pull-down box containing all the questions which identify a
        // student. 
        var lbox_name = "email_ques_index";
        var lbox = app.createListBox(false).setId(lbox_name).setName(lbox_name);
        var position = -1;
    
        var sheet = getSheetWithSubmissions(ss);
        
        // Grab the list of questions, so the user can select which contains
        // the email. Note: we don't use a GradesWorksheet object as this
        // function could be getting invoked from AutoGrade setup, where
        // no submissions or grades yet exist.
        var questions_full_text = getQuestionValsFromSubmissions(sheet);

        // grading options guaranteed to be set at this point.    
        var grade_opt_str = dp.getProperty(DOC_PROP_UI_GRADING_OPT);
        var grading_options = grade_opt_str.split(",");
    
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
          
                lbox.addItem(ques_val, ques_val_orig);
                position++;
                    
                if (quesContainsEmail(ques_val_orig))
                  {       
                    lbox.setSelectedIndex(position); 
                  }
              }
          }
 
        var hpanel2 = app.createHorizontalPanel()
                         .setStyleAttribute('border-spacing', '6px')
                         .add(app.createLabel(langstr("FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL")))
                         .add(lbox);

        main_panel.add(hpanel2);
   
        // add a pull down with options for Drive sharing
        var lbox_share_name = "share_ques_index";
        var lbox_share = app.createListBox(false).setId(lbox_share_name).setName(lbox_share_name);
        lbox_share.addItem(langstr("FLB_STR_GRADES_SHARE_EMAIL"), "0");
        lbox_share.addItem(langstr("FLB_STR_GRADES_SHARE_DRIVE"), "1");
        lbox_share.addItem(langstr("FLB_STR_GRADES_SHARE_BOTH"), "2");
        
        var share_prev_selected = dp.getProperty(DOC_PROP_EMAIL_SHARE_OPTION);
        
        if ((share_prev_selected != 'undefined') && (share_prev_selected != null))
          {
            lbox_share.setSelectedIndex(Number(share_prev_selected));
          }

        var hpanel2_5 = app.createHorizontalPanel()
                         .setStyleAttribute('border-spacing', '6px')
                         .add(app.createLabel(langstr("FLB_STR_GRADES_SHARE_LABEL")))
                         .add(lbox_share);

        main_panel.add(hpanel2_5);

      }
    
    var cbox_name = "show_questions";
    var cbox = app.createCheckBox()
                  .setId(cbox_name)
                  .setName(cbox_name)
                  .setValue(true)
                  .addValueChangeHandler(show_questions_value_change_handler);
                  
    var hpanel3 = app.createHorizontalPanel()
                     .setStyleAttribute('border-spacing', '6px')
                     .add(app.createLabel(langstr("FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES")))
                     .add(cbox);
                      
    main_panel.add(hpanel3);
    
    // Depends on above being checked.
    var cbox2_name = "show_answers";
    var cbox2 = app.createCheckBox().setId(cbox2_name).setName(cbox2_name);
    var hpanel4 = app.createHorizontalPanel()
                     .setStyleAttribute('border-spacing', '6px')
                     .add(app.createLabel(langstr("FLB_STR_EMAIL_GRADES_ANSWER_KEY")))
                     .add(cbox2);
                     
    main_panel.add(hpanel4);
    
    var textbox_name = "instructor_message";
    var tbox = app.createTextArea()
                  .setId(textbox_name)
                  .setName(textbox_name)
                  .setWidth('350')
                  .setHeight('100');
                  
    var hpanel4 = app.createHorizontalPanel()
                     .setStyleAttribute('border-spacing', '6px')
                     .add(app.createLabel(langstr("FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE")))
    
    main_panel.add(hpanel4);
    
    var hpanel5 = app.createHorizontalPanel()
                     .setStyleAttribute('border-spacing', '6px')
                     .add(tbox);
    
    main_panel.add(hpanel5);
    
    // Make selections available in handler.
    if (!just_printing_grades)
      {
        handler.addCallbackElement(lbox);
        handler.addCallbackElement(lbox_share);
      }
    
    handler.addCallbackElement(cbox);
    handler.addCallbackElement(cbox2);
    handler.addCallbackElement(tbox);
    
    // Add the Continue and Cancel buttons at the bottom.
    var btnGrid = app.createGrid(1, 3).setStyleAttribute('float', 'right');
    var btnSubmit = app.createButton(langstr("FLB_STR_BUTTON_CONTINUE"),handler)
                       .setId('CONTINUE')
                       .addClickHandler(click_handler);
    
    btnGrid.setWidget(0,1,btnSubmit);
    //btnGrid.setWidget(0,2,app.createButton('Cancel',handler).setId('CANCEL'));
    btnGrid.setWidget(0,0,app.createImage(FLUBAROO_WORKING_IMG_URL).setVisible(false).setId('working'));
    
    main_panel.add(btnGrid);
    app.add(main_panel);    

    return app;
    
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
      
    } // UIClass.emailGrades.quesContainsEmail()
    
  } // UIClass.emailGrades()
      
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
    h += '<img style="padding:10px;" src="' + FLUBAROO_WELCOME_IMG_URL + '"><br>';
    h += '<div style="font-face:Roboto,Arial;font-family:Sans-Serif;font-size:14px;padding:10px;">';      
    
    h += '<p style="padding-top:0px;margin-top:0px;">' + msg + "</p>";
 
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
    var no_noreply = up.getProperty(USER_PROP_ADV_OPTION_NO_NOREPLY);
    
    var extra_credit = up.getProperty(USER_PROP_ADV_OPTION_EXTRA_CREDIT);
    
    var additional_gopts = up.getProperty(USER_PROP_ADV_OPTION_SHOW_ADDITIONAL_GOPTS);
    
    var mgr_adv_by_question = up.getProperty(USER_PROP_ADV_OPTION_MGR_ADVANCE_BY_QUESTION);

    var autograde_do_full_regrade = Autograde.getDoFullRegrade();
    
    var checked;
    
    var html = HtmlService.createHtmlOutput()
                          .setSandboxMode(HtmlService.SandboxMode.IFRAME)
                          .setWidth(700)
                          .setHeight(400);

    html.setTitle(langstr("FLB_STR_ADV_OPTIONS_WINDOW_TITLE"))
    
    var h = "<html><body>";
    h += '<div style="font-family:Sans-Serif;font-size:14px;">';
    h += '<b>' + langstr("FLB_STR_ADV_OPTIONS_NOTICE") + ' (<a href="http://flubaroo.com/hc">flubaroo.com/hc</a>).</b><br><br>';
    
    h += '<form id ="adv_options_form" action="">';
    h += '<br>Options for this spreadsheet only:<br>';
    
    h += '<p style="padding-left:25px;">'
    
    // removing for now until I work out how to do it
    /*
    checked = edit_link ? "checked" : "";
    h += '<input type="checkbox" name="edit_link" ' + checked + '>' + langstr("FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK") + '<br><br>';
    */
 
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
    h += '</select>';
    
    h += '<p style="padding-left:25px;">'
    checked = autograde_do_full_regrade ? "checked" : "";
    h += '<input type="checkbox" name="autograde_do_full_regrade" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_AG_WITH_SUMMARY") + '<br>';

    h += '</p>';
    
    h += "<hr><br>";
    h += 'Options for all spreadsheets where Flubaroo is installed:<br>';

    h += '<p style="padding-left:25px;">'
    checked = extra_credit ? "checked" : "";
    h += '<input type="checkbox" name="extra_credit" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_EXTRA_CREDIT") + '<br>';
    
    h += '<p style="padding-left:25px;">'
    checked = additional_gopts ? "checked" : "";
    h += '<input type="checkbox" name="additional_gopts" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_ADDITIONAL_GOPTS") + '<br>';

    h += '<p style="padding-left:25px;">'
    checked = mgr_adv_by_question ? "checked" : "";
    h += '<input type="checkbox" name="mgr_adv_by_question" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_MGR_ADV_QUESTION") + '<br>';
    
    h += '<p style="padding-left:25px;">'
    checked = no_noreply ? "checked" : "";
    h += '<input type="checkbox" name="no_noreply" ' + checked + '> ' + langstr("FLB_STR_ADV_OPTIONS_NO_NOREPLY") + '<br><br>';
    
    h += '</p>';
    
    var onclick="google.script.run.withSuccessHandler(aoCloseWindow).processAdvOptionsForm(this.parentNode)";
    
    h += '<br><input type="button" value="Submit" onclick="' + onclick + '" />';
   
    h += '</form>';
    h += '</div>';
    
    h += "<script>function aoCloseWindow() { google.script.host.close(); }</script>";
    
    h += "</body></html>";
    
    html.append(h);
    
    return html;
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

// emailGradesHandler()
// --------------------

function emailGradesHandler(e)
{
  var dp = PropertiesService.getDocumentProperties();
  Debug.info("emailGradesHandler()");

  // TODO_AJR - I don't think cancel is used.
  
  var dp = PropertiesService.getDocumentProperties();
   
  var app = UiApp.getActiveApplication();
  var source = e.parameter.source;
  var just_printing_grades = false;
  
  if (source === 'CANCEL')
  {
    app.close();
    return app;
  }
  
  if (e.parameter.just_printing_grades === 'true')
    {
      just_printing_grades = true;
    }
  
  // Get the user's selections from the event and and store them.
  
  if (!just_printing_grades)
    {
      dp.setProperty(DOC_PROP_EMAIL_ADDRESS_QUESTION, 
                                   e.parameter.email_ques_index);
  
      dp.setProperty(DOC_PROP_EMAIL_SHARE_OPTION,
                                   e.parameter.share_ques_index);
    }
  
  dp.setProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_SCORES, 
                               e.parameter.show_questions);
  
  dp.setProperty(DOC_PROP_EMAIL_INCLUDE_ANSWER_KEY, 
                               e.parameter.show_answers);
  
  dp.setProperty(DOC_PROP_EMAIL_INSTRUCTOR_MESSAGE, 
                               e.parameter.instructor_message);
  
  dp.setProperty(DOC_PROP_EMAIL_INSTRUCTOR_ADDRESS, 
                               e.parameter.email_addr);
  
  
  // If we're just gathering or updating options for autograde 
  // then don't actually send any emails.
  if (Autograde.isGatheringOptions())
  {
    Autograde.finalizeOn();
    Autograde.clearGatheringOptions();
    app.close();
    return app;
  }
  
  if (just_printing_grades)
    {
      doPrintGrades();
    } 
  else
    {
      doShareGrades();
    }
  
  return app;
  
} // emailGradesHandler()


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
  
  
  var pass_rate = formObject.pass_rate;

  if (pass_rate && !isNaN(pass_rate))
    {
      dp.setProperty(DOC_PROP_ADV_OPTION_PASS_RATE, pass_rate);
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
                             langstr('FLB_STR_GRADING_OPT_NORMAL_GRADING'), langstr('FLB_STR_GRADING_OPT_MANUAL_GRADING')],
     
      // corresponding grading option strings (used internally)
      possible_gopts : [GRADING_OPT_STUD_ID, GRADING_OPT_SKIP, GRADING_OPT_NORMAL, GRADING_OPT_MANUAL],
     
      // whether or not to show "extra credit" column. false by default unless advanced option is set.
      show_extra_credit: false,
            
      // possible point values to display
      possible_pts : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      
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
      
       qdata.default_extra_credit.push(ex_cb);
       qdata.default_gopts.push(default_gopt_sel);
       qdata.default_pts.push(default_pt_sel);
      
    } // for each question.
    
   return qdata;
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

