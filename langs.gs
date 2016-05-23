// lang.gas
// Contains definitions for all localized strings in Flubaroo.
// Any language specific string or message should be placed in this file in the format shown.

// ** For instructions on how to add your own translation, see here: 
//         http://www.edcode.org/kb/flubaroo/translation-instructions

// To do (June 7, 13): Strings in histogram are not translated. need to url encode translated versions in the code, first.

gbl_lang_id = ""; // identifies the language if the UI.

function setLanguage()
{   
   var ss = SpreadsheetApp.getActiveSpreadsheet();
   var app = UiApp.createApplication()
                      .setTitle(langstr("FLB_STR_MENU_SET_LANGUAGE"))
                      .setWidth("320").setHeight("100");

   var handler = app.createServerClickHandler('setLanguageHandler');
  
   // create the main panel to hold all content in the UI for this step,
   var main_panel = app.createVerticalPanel()
                       .setStyleAttribute('border-spacing', '10px');
   app.add(main_panel);
  
   ss.show(app);
 
   // create a pull-down box containing all the questions which identify a
   // student. 
   var lbox_name = "language_select";
   var lbox = app.createListBox(false).setId(lbox_name).setName(lbox_name);
   var position = -1;
   
   for (var item in langs)
     {
       lbox.addItem(langs[item]["FLB_LANG_IDENTIFIER"], item);
     }
   
   lbox.setSelectedIndex(0);    
   handler.addCallbackElement(lbox);  
  
    var hpanel = app.createHorizontalPanel()
       .setStyleAttribute('border-spacing', '6px')
    .add(app.createLabel(langstr("FLB_STR_MENU_SET_LANGUAGE") + ":"))
       .add(lbox);
   main_panel.add(hpanel);

   var btnSubmit = app.createButton(langstr("FLB_STR_BUTTON_CONTINUE"),handler).setId('CONTINUE');
  
   main_panel.add(btnSubmit);
 
   ss.show(app);   
 }

function setLanguageHandler(e)
 {
   var ss = SpreadsheetApp.getActiveSpreadsheet();
   var app = UiApp.getActiveApplication();

   var up = PropertiesService.getUserProperties();
   
   var language_id = e.parameter.language_select;
 
   up.setProperty(USER_PROP_LANGUAGE_ID, language_id);
   
   // reload menu
   createFlubarooMenu();
   
   // rename Student Submissions sheet, if it was already set to an English name.
   //renameSubmissionsSheet();
   
   app.close()
   return app;
 }


// langstr: Given a string id, returns the localized version of that string, based on the global gbl_lang_id.
function langstr(id)
{
  var up = PropertiesService.getUserProperties();

  if (gbl_lang_id == "")
    {
      // not yet defined. look it up!
      gbl_lang_id = up.getProperty(USER_PROP_LANGUAGE_ID);
      
      if (gbl_lang_id == "" || gbl_lang_id == null || gbl_lang_id === undefined)
        {
          // never explicitly set by user (via menu). set to default.
          gbl_lang_id = "en-us"; // default
        }
    }
  
  // Return the specified string in the language selected. if not defined, return the English version.
  if (langs[gbl_lang_id][id])
    {
      return langs[gbl_lang_id][id];
    }
  else
    {
      return langs['en-us'][id];
    }
}
// Special version of langstr that returns the string in English-US.
// Used in the rare & special case when we can't lookup the user's preferred language.
function langstr_en(id)
{
  return langs["en-us"][id];
}

// checkForMissingTranslations: Used for testing purposes only, before publishing a 
// new Add-on when a new language has been added.
function listMissingTranslations()
{    
  var new_doc = DocumentApp.openById('19p5HgdIhwLZNn4ShcMATw4_pzIBl3PzD-L-CE4-AdSU');
  var b = new_doc.getBody();
  b.clear();
  
  var body = new_doc.getBody();
  
  var en_translations = langs['en-us']; // dont' change
  
  var count = 0;
  for (var lang_to_check in langs)
    { 
      /*
      try
        {
          LanguageApp.translate("test translation", "en-us", lang_to_check);
        }
      catch (e)
        {
          continue; // next lang
        }
        */
      
      body.appendParagraph("");
      body.appendHorizontalRule();
      var p = body.appendParagraph("language: " + lang_to_check + "\r\r");
      for (var en_str_to_check in en_translations)
        {
          if (!(en_str_to_check in langs[lang_to_check]))
            {
              var line = '        "' + en_str_to_check + '": ""'; // + LanguageApp.translate(langs['en-us'][en_str_to_check], "en-us", lang_to_check) + '",';
              body.appendParagraph(line);
              body.appendParagraph("");
            }
        }

      body.appendPageBreak();
    }
  
  new_doc.saveAndClose();
}

// langs:
// Global collection of localized strings used in Flubaroo. 
langs = { 

    // START ENGLISH ////////////////////////////////////////////////////////////////////////////////
  
    "en-us": {
        // Name to identify language in language selector
        "FLB_LANG_IDENTIFIER": "English",

        // Grading option which identifies a student
        "FLB_STR_GRADING_OPT_STUD_ID" : "Identifies Student",

        // Grading option which tells Flubaroo to skip grading on a question
        "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Skip Grading",
      
        // Message shown when grading is complete (1 of 2).
        "FLB_STR_RESULTS_MSG1" : "A new worksheet called 'Grades' has been created. This worksheet contains a grade for each submission, and a summary of all grades at the top. The very last row shows the percent of students who got each question correct, with overall low-scoring questions highlighted in orange. Individual students who scored below passing will appear in red font.",

        // Message shown when grading is complete (2 of 2).
        "FLB_STR_RESULTS_MSG2" : "<b>IMPORTANT</b>: The 'Grades' sheet is not meant to be modified in any way, as this can interfere with emailing grades. If you need to modify this sheet, copy it and modify the copy.",
        
        // Follows the Flubaroo tip, directing users to read the corresponding article.
        "FLB_STR_RESULTS_TIP_READ_ARTICLE" : "Click <a target=_blank href=\"%s\">here</a> to find out more.",
        
        // Instructions shown on Step 1 of grading.
        "FBL_STR_STEP1_INSTR" : "Please select a grading option for each of the questions in the assignment. Flubaroo has done its best to guess the best option for you, but you should check the option for each question yourself.",

        // Instructions shown on Step 2 of grading.
        "FBL_STR_STEP2_INSTR" : "Please select which submission should be used as the Answer Key. Typically this will be a submission made by you. All other submissions will be graded against the Answer Key, so take care to ensure that you select the right one.",

        // Message shown if not enough submissions to perform grading.
        "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "There must are not enough submissions to perform grading. Ensure you've submitted an answer key, and/or try again when more students have submitted their answers.",

        // Please wait" message first shown when Flubaroo is first examining assignment.
        "FLB_STR_WAIT_INSTR1" : "Flubaroo is examining your assignment. Please wait...",

        // Please wait" message shown after Step 1 and Step 2, while grading is happening.
        "FLB_STR_WAIT_INSTR2" :  "Please wait while your assignment is graded. This may take a minute or two to complete.",

        // Asks user if they are sure they want to re-grade, if Grades sheet exists.
        "FLB_STR_REPLACE_GRADES_PROMPT" : "This will replace your existing grades. Are you sure you want to continue?",

        // Window title for "Preparing to grade" window
        "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Preparing to Grade",

        // Window title for "Please wait" window while grading occurs
        "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Grading Your Assignment",

        // Window title for "Grading Complete" window after grading occurs
        "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Grading Complete",

        // Window title for grading Step 1
        "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Grading Step 1",

        // Window title for grading Step 2
        "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Grading Step 2",

        // "Grading Option" label that appears over first column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Grading Option",

        // "Question" label that appears over third column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Question",
     
        // "Select" label that appears over radio button in first column of Step 2 of grading.
        "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Select",

        // "Submission Time" label that appears over second column in Step 2 of grading.
        "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Submission Time",

        // Label for "View Grades" button shown when grading completes.
        "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "View Grades",

        // Used for "summary" text shown at top of Grades sheet, and in report. 
        "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Summary",

        // Used for report and report email. Ex: "Report for 'My Test'" 
        "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Report for",

        // Points Possible. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Points Possible",

        // Average Points. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Average Points",

        // Counted Submissions. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Counted Submissions",

        // Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Number of Low Scoring Questions",

        // Name of column in Grades sheet that has total points scored.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Total Points",

        // Name of column in Grades sheet that has score as percent.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Percent",

        // Name of column in Grades sheet that has number of times student made a submission.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Times Submitted",

        // Name of column in Grades sheet that indicates if grade was already emailed out.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Emailed Grade?",

        // Name of column in Grades sheet that allows teacher to enter optional student feedback
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Feedback for Student (Optional)",

        // Window title for emailing grades
        "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Email Grades",

        // Instructions on how to email grades
        "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo can email each student their grade, as well as the correct answers. Use the pull-down menu to select the question that asked students for their email address. If email addresses were not collected, then you will not be able to email grades.",

        // Notice that grades cannot be emailed because the user has exceeded their daily quota.
        "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo cannot email grades at this time because you have exceeded your daily quota of emails per day. This quota is set by Google for all Add-ons. Please try again later.",
      
        // Message about how many grade emails *have* been sent. This message is preceeded by a number.
        // Example: "5 grades were successfully emailed"
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "grades were successfully shared",

        // Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "grades were not shared due to invalid or blank email addresses, because they have already had their grade shared with them, or because you have exceeded your daily email quota.",

        // Message about how many grade emails *have NOT* been sent.
        "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "No grades were shared because no valid email addresses were found, because all students have already had their grades shared with them, or because you have exceeded your daily email quota.",     
      
        // Subject of the email students receive. Followed by assignment name. 
        // Example: Here is your grade for "Algebra Quiz #6"
        "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Here is your grade for",

        // First line of email sent to students
        // Example: This email contains your grade for "Algebra Quiz #6"
        "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "This email contains your grade for",

        // Message telling students not to reply to the email with their grades
        "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Do not reply to this email",

        // Message that preceedes the student's grade
        "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Your grade",

        // Message that preceedes the instructor's (optional) message in the email
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Below is a message from your instructor, sent to the entire class",

        // Message that preceedes the instructor's (optional) feedback for the student in the email
        "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Your instructor has this feedback just for you",

        // Message that preceedes the summary of the student's information (name, date, etc)
        "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Summary of your submission",

        // Message that preceedes the table of the students scores (no answer key sent)
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Below is your score for each question",

        // Message that preceedes the table of the students scores, and answer key
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Below is your score for each question, along with the correct answer",

        // Header for the  column in the table of scores in the email which lists the question asked.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Question",

        // Header for the  column in the table of scores in the email which lists the student's answer.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Your Answer",

        // Header for the  column in the table of scores in the email which lists the correct answer.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Correct Answer",

        // Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Your Score",

        // Header for the  column in the table of scores in the email which lists the points possible (e.g. 5).
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Points Possible",

        // Header for the  column in the table of scores in the email which lists the Help Tip (if provided)
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Help for this Question",

        // Label for "points" used in the new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "point(s)",

        // Label for "Correct" questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Correct",

        // Label for "Incorrect" questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Incorrect",

        // Footer for the email sent to students, advertising Flubaroo.
        "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "This email was generated by Flubaroo, a free tool for grading and assessments",

        // Link at the end of the footer. Leads to www.flubaroo.com
        "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Visit flubaroo.com",

        // Subject of the record email sent to the instructor, when grades are emailed to the class.
        // Followed by the assignment name.
        // e.g. Record of grades emailed for Algebra Quiz #6
        "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Record of grades emailed for",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the name of the assignment, in the summary table.
        "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Assignment Name",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the number of emails sent, in the summary table.
        "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Number of Grades Shared",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the number of graded submissions, in the summary table
        "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Number of Graded Submissions",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the average score in points (vs percent), in the summary table
        "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Average Score (points)",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the points possible, in the summary table
        "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Points Possible",

        // Used in the record email sent to the instructor after she emails grades.
        // Indicated if an answer key was provided to the students, in the summary table
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Answer Key Provided?",

        // Used in the record email sent to the instructor after she emails grades.
        // Value in summary table if answer key was NOT sent to students by instructor
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "No",

        // Used in the record email sent to the instructor after she emails grades.
        // Value in summary table if answer key WAS sent to students by instructor
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Yes",

        // Used in the record email sent to the instructor after she emails grades.
        // Message that preceeds what message the instructor email to her students.
        "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "You also included this message",

        // About Flubaroo message (1 of 2)
        "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo is a free, time-saving tool that allows teachers to quickly grade multiple choice assignments and analyze the results",

        // About Flubaroo message (2 of 2)
        "FLB_STR_ABOUT_FLUBAROO_MSG2" : "To learn more, visit www.flubaroo.com.",

        // Message that appears when "Student Submissions" sheet cannot be located.
        "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo could not determine which sheet contains the student submissions. Please locate this sheet, and rename it to: ",

        // Message that appears when "Grades" sheet cannot be located.
        "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo could not determine which sheet contains the grades. Please grade the assignment, or locate this sheet, and rename it to: ",

        // Menu option to grade assignment.
        "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Grade Assignment",

        // Menu option to re-grade assignment.
        "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Regrade Assignment",

        // Menu option to email grades.
        "FLB_STR_MENU_EMAIL_GRADES" : "Email Grades",

        // Menu option to hide student feedback (hides the column)
        "FLB_STR_MENU_HIDE_FEEDBACK" : "Hide Student Feedback",

        // Menu option to edit student feedback (unhides the column)
        "FLB_STR_MENU_EDIT_FEEDBACK" : "Edit Student Feedback",

        // Menu option to hide help tips
        "FLB_STR_MENU_HIDE_HELP_TIPS" : "Hide Help Tips",

        // Menu option to edit help tips
        "FLB_STR_MENU_EDIT_HELP_TIPS" : "Edit Help Tips",

        // Menu option to view report.
        "FLB_STR_MENU_VIEW_REPORT" : "View Report",

        // Menu option to learn About Flubaroo.
        "FLB_STR_MENU_ABOUT" : "About Flubaroo",

        // Menu title for "Advanced" sub-menu
        "FLB_STR_MENU_ADVANCED" : "Advanced",
      
        // Menu title for Advanced > Options
        "FLB_STR_MENU_ADV_OPTIONS" : "Advanced Options",
      
        // Menu option to choose the language.
        "FLB_STR_MENU_SET_LANGUAGE" : "Set Language",

        // Menu option to enable autograde.
        "FLB_STR_MENU_ENABLE_AUTO_GRADE" : "Enable Autograde",
  
        // Menu option to disable autograde.
        "FLB_STR_MENU_DISABLE_AUTO_GRADE" : "Disable Autograde",
      
        // Menu option to see reamining daily email quota
        "FLB_STR_MENU_SHOW_EMAIL_QUOTA" : "Check Email Quota",
      
        // Menu option shown to enable Flubaroo in a sheet where it's never been used before
        "FLB_STR_MENU_ENABLE" : "Enable Flubaroo in this sheet",
      
        // Message to show when menu option for FLB_STR_MENU_ENABLE is chosen
        "FLB_STR_FLUBAROO_NOW_ENABLED" : "Flubaroo has been enabled for this sheet. You may now access it from the menu.<br><br>For instructions on how to start grading, click <a target=\"_blank\" href=\"http://www.flubaroo.com\">here</a>.",
      
        // Word that appears on the "Continue" button in grading and emailing grades.
        "FLB_STR_BUTTON_CONTINUE" : "Continue",

        // Name of "Student Submissions" sheet
        "FLB_STR_SHEETNAME_STUD_SUBM" : gbl_subm_sheet_name,     

        // Name of "Grades" sheet
        "FLB_STR_SHEETNAME_GRADES" : gbl_grades_sheet_name,

        // Text put in Grades sheet when a question isnt graded.
        "FLB_STR_NOT_GRADED" : "Not Graded",

        // Message that is displayed when a new version of Flubaroo is installed.
        "FLB_STR_NEW_VERSION_NOTICE" : "You've installed a new version Flubaroo! Visit flubaroo.com/blog to see what's new.",

        // Headline for notifications / alerts.
        "FLB_STR_NOTIFICATION" : "Flubaroo Notification",

        // For emailing grades, question which asks user to identify email question.
        "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Email Address Question: ", // note the space after ":"

        // For emailing grades, asks user if list of questions and scores should be sent.
        "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Include List of Questions and Scores: ", // note the space after ":"

        // For emailing grades, asks user if answer key should be sent...
        "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Include Answer Key: ", // note the space after ":"
        
        // For emailing grades, appears before text box for optional instructor message.
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Message To Include (optional):",

        // Window title for View Report window
        "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Grading Report",

        // Title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Histogram of Grades",

        // Y-Axis (vertical) title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Submissions",

        // X-Axis (horizontal) title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Points Scored",

        // Label of "Email Me Report" button in View Report window
        "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Email Me Report",

        // Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
        "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "The report has been emailed to",
      
        // Message to show the user in the top-left cell of the Grading sheet when grading starts. 
        "FLB_STR_GRADING_CELL_MESSAGE" : "Grading in progress...",
      
        // Message that pops up to notify the user that autograde is on.
        "FLB_STR_AUTOGRADE_IS_ON" : "Autograde is enabled. Flubaroo is waiting for new submissions to grade. Don't make changes to any sheets until autograde is turned off.",

        // Message that pops up to notify the user that autograde is on.
        "FLB_STR_AUTOGRADE_IS_OFF" : "Autograde has been turned off.",
      
        // Message to ask the user if they want to grade recent, ungraded submissions, before autograde is enabled.
        "FLB_STR_AUTOGRADE_GRADE_RECENT" : "Some recent submissions have yet to be graded. Would you like Flubaroo to grade them first, before autograde is enabled?",

        // Message to tell the user that autograde must gather grading and email settings before being turned on.      
        "FLB_STR_AUTOGRADE_SETUP" : "Before enabling autograde you must first setup your grading and email settings. Click 'OK' to proceed.",
 
        // Message asking user if they'd like to update their grading and email settings before turning on autograde.
        "FLB_STR_AUTOGRADE_UPDATE" : "Before enabling autograde, would you like to update your grading and email settings?",
      
        // Title of Advanced Options window
        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE" : "Advanced Options",

        // Advanced Options notice that appears at the top of the window, telling the user to read the help center articles.
        "FLB_STR_ADV_OPTIONS_NOTICE" : "Only change these settings if you have read the correponding help articles",
      
        // Text for Advanced Options, describing option to not use noreply@ email address when sending grades.      
        "FLB_STR_ADV_OPTIONS_NO_NOREPLY" : "Use my return address when emailing grades, rather than the noreply@ address.",
     
        // Text for Advanced Options, describing option to send each student a link to edit their response.
        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK" : "Upon submission, auto-email the student a link to quickly edit their response.",
      
        // Text for Advanced Options, describing option to change the 70% pass rate.
        "FLB_STR_ADV_OPTIONS_PASS_RATE" : "Percentage below which student info is highlighted in red: ",

        // Message about how many more emails user can send that day. Shown from the Advanced > Check Email Quota menu.  
        "FLB_STR_EMAIL_QUOTA_MSG" : "You have this many emails left in your daily quota: ",
     
        // "Points" label that appears over second column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_POINTS" : "Points",
      
        // Error message shown in Step 1 of grading if no fields selected with "Identifies Student"
        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR" : "You must select at least one question that identifies a student before continuing.",
       
        // Error message shown in Step 1 of grading if no fields selected that are gradeable
        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR" : "You must select at least one question that is gradeable.",
            
        // Error message shown in Step 2 of grading if no answer key selected.
        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED" : "You must select an answer key before continuing.",
      
        // Grading option which indicates Normal Grading (for display only in Step 1)
        "FLB_STR_GRADING_OPT_NORMAL_GRADING" : "Normal Grading",

        // Grading option which indicates Manual Grading (for display only in Step 1)
        "FLB_STR_GRADING_OPT_MANUAL_GRADING" : "Grade by Hand (New!)",
      
        // Message shown if user tries to enable autograde when a question is set for Manual Grading.
        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS" : "Autograde cannot be enabled because you have one or more questions that are set to be hand graded.",
        
        // Message shown if some questions are identical. All questions must be unique for Flubaroo to grade properly.
        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS" : "You selected one or more questions to be Graded by Hand. But grading cannot continue because \
                                                some of those questions are not distinct from one another. For example, you may have two questions \
                                                both titled \"Question\". Please modify the text of those \
                                                questions in Row 1 so that they are unique (i.e. \"Question 1\" and \"Question 2\"), and then try grading again.",
            
        // Label for manually graded questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL" : "Hand Graded",

        // Instructions that show-up in window when manual grading is selected.      
        "FBL_STR_MANUAL_GRADING_INSTR" : "Use the controls below to assign grades by hand. Note that this will only work properly on \
                                          questions for which you selected \"Grade By Hand\" in Step 1 of grading.",
      
        // Menu option to open window for manual (by hand) grading of questions.
        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS" : "Grade Questions by Hand",
      
        // Message shown in email to students if manually graded question wasn't assigned any points.
        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED" : "No points assigned",
      
        // Header for the column in the table of scores in the email which lists the Help Tip (if provided)
        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER" : "Comments made by your instructor",

        // Title for the "Grade by Hand" window      
        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE" : "Flubaroo - Grade Questions by Hand",
      
        // Label next to the first step in the "Grade by Hand" window, which allows the teacher to select the student.
        "FLB_STR_MANUAL_GRADING_STEP1" : "1. Select Student:",
      
        // Label next to the second step in the "Grade by Hand" window, which allows the teacher to select which question.
        "FLB_STR_MANUAL_GRADING_STEP2" : "2. Select Question:",
      
        // Label next to the third step in the "Grade by Hand" window, which allows the teacher to read the submission.
        "FLB_STR_MANUAL_GRADING_STEP3" : "3. Read Student's Submission:", 
      
        // Label next to the fourth step in the "Grade by Hand" window, which allows the teacher to enter notes.
        "FLB_STR_MANUAL_GRADING_STEP4" : "4. Enter Notes for Student (sent in email):", 
      
        // Text for the link that shows the teacher's answer key / rubric in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY" : "review answer key", 
      
        // Text for the button that is used to set the grade in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE" : "Set Grade",
      
        // Text that appears in the button while the grade is being applied in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING" : "Working",
      
        // Message that appears at the top of the "Grade by Hand" window after the grade has been successfully applied.
        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED" : "Grade has been applied.",
      
        // Message that appears at the top of the "Grade by Hand" window if the teacher doesn't enter a valid score in the box.
        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE" : "Please enter a valid grade.",
      
        // Message that appears at the top of the "Grade by Hand" window if an error occurs while setting the grade.
        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED" : "An error occured.",
      
        // Text for "Close X" link that allows the teacher to close the pop-up window that contains the answer key in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP" : "Close",
      
        // Message that appears if a teacher tries to disable autograde while grading is in process.
        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW" : "Autograde is presently grading one or more new submissions, so cannot be disabled. Try again shortly.",
      
        // Message that is shown to the user if grading cannot complete because no valid submissions were found in the submissions sheet (i.e. oinly blank rows).
        "FLB_STR_NO_VALID_SUBMISSIONS" : "A Grades sheet was not created because no valid submissions were found.",
      
        // Title of the window that informs the user that their Grades sheet is corrupted (badly formed).
        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Corrupted Grades Sheet - Cannot Continue",
      
        // Message shown in the "Corrupted Grades Sheet" window.
        "FLB_STR_INVALID_GRADES_SHEET" : "<p>Flubaroo cannot continue because your Grades sheet has been corrupted. Did you perhaps delete \
                                          rows, columns, or other data from the Grades sheet after grading last completed?</p>\
                                          <p>See <a href=\"http://www.flubaroo.com/hc/corrupted-grades-sheet\" target=\"_blank\">this article</a> for assistance.</p>",
      
        // Short message that is included at the top of the Grades sheet in bold, instructing users not to modify the Grades sheet.
        "FLB_STR_DO_NOT_DELETE_MSG" : "TO ENSURE FLUBAROO FUNCTIONS PROPERLY, DO NOT DELETE ROWS OR COLUMNS IN THIS SHEET", 
      
        // Label for the "Share Grades" window, which asks the user how they would like to share the grades (email, drive, or both).
        "FLB_STR_GRADES_SHARE_LABEL" : "Grade Sharing Method:",
      
        // Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via email.
        "FLB_STR_GRADES_SHARE_EMAIL" :  "Share via email (typical)", // always at index 0
      
        // Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via Google Drive.
        "FLB_STR_GRADES_SHARE_DRIVE" :  "Share via Google Drive (no email)",  // always at index 1
        
        // Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via both email and Drive.
        "FLB_STR_GRADES_SHARE_BOTH" :   "Share via both email and Drive", // always at index 2
      
        // Name of the folder where shared and printed grades get put in the teacher's My Drive.
        "FLB_STR_DRIVE_SHARE_FOLDER_NAME" : "Flubaroo - Shared Grades",
      
        // Text that begins the shared Google Document. Example: "Grade for dave@edcode.org - Exam #2"
        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE" : "Grade for",
      
        // Text/Link that is included in the emails to students if the "both" method of grade sharing was selected by the teacger.
        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG" : "Click to view this grade report in Google Drive",
      
        // Title for window that allows teachers to print the grades.
        "FLB_STR_PRINT_GRADES_WINDOW_TITLE" : "Flubaroo - Print Grades",
      
        // Instructions for the "Print Grades" window
        "FLB_STR_PRINT_GRADES_INSTR" : "Flubaroo will create a single Google Document containing grades for all students which you can then print and distribute. \
                                        You may specify a message to include in each document, as well as whether to include the list of questions and/or the correct answers.",
      
        // Title for the "Share Grades" window.
        "FLB_STR_SHARE_GRADES_WINDOW_TITLE" : "Flubaroo - Share Grades",
      
        // Instructions for the "Share Grades" window.
        "FLB_STR_SHARE_GRADES_INSTR" : "Flubaroo can share with each student their grade via email, Google Drive, or both. Use the pull-down menu to select the question that asked students for their email address. If email addresses were not collected, then you will not be able to share grades.",
      
        // Success message shown after grades have been printed. Followed by a link to the printable document.
        "FBL_STR_PRINT_GRADES_SUCCESS" : "A Google document has been created containing all student grades. Click the file name below to open it. Then print it and hand each student their print-out.",
      
        // Text that begins the name of the Google Document containing the printable grades. Example: "Printable grades for: Exam #2"
        "FBL_STR_PRINT_GRADES_TITLE_PRE": "Printable grades for:",
      
        // Menu option to share grades.
        "FLB_STR_MENU_SHARE_GRADES" : "Share Grades",
      
        // Menu option to print grades.
        "FLB_STR_MENU_PRINT_GRADES" : "Print Grades",
      
        // Grading option for "Extra Credit" on questions.
        "FLB_STR_GRADING_OPT_EXTRA_CREDIT": "Extra Credit",
     
         // Text for Advanced Options, describing option to allow extra credit.      
        "FLB_STR_ADV_OPTIONS_EXTRA_CREDIT" : "Allow extra credit when assigning points to questions",
 
        // Text for Advanced Options, asking if user wants to show some additional options in the pull-down menu in Step 1 of grading.
        "FLB_STR_ADV_OPTIONS_ADDITIONAL_GOPTS" : "Show additional grading options in Step 1 of grading",
      
        // Notice for Grades sheet (shown at top) if Autograde is enabled. Tells the user that grading isn't only considering a student's most recent submission.
        "FLB_STR_AUTOGRADE_NOT_SUMMARIZED" : "BECAUSE OF YOUR AUTOGRADE SETTINGS, THIS SHEET MAY CONTAIN MORE THAN ONE GRADED SUBMISSION PER STUDENT",
      
        // Text for Advanced Options, letting user decide if they want Autograde to grade only a student's most recent submission (if checked).
        "FLB_STR_ADV_OPTIONS_AG_WITH_SUMMARY" : "Autograde will process only a student's most recent submission (see <a target=\"_blank\" href=\"" + FLB_AUTOGRADE_SELECT_MODE_URL + "\">this article</a>).",
      
        // Text for Advanced Options, asking user if when using the "Grade Questions by Hand" tool, if it should auto advance to the next question when
        // a score is set (versus the next student).
        "FLB_STR_ADV_OPTIONS_MGR_ADV_QUESTION" : "When using \"Grade Questions by Hand\", auto-advance to next question (instead of next student)",
      
        // Advanced menu option that will expand the special tokens in formulas written by the teacher in the Grades sheet.
        "FLB_STR_MENU_EXPAND_FORMULAS" : "Expand Custom Formulas",
       
         // Grading option which ignores a question
        "FLB_STR_GRADING_OPT_IGNORE" : "Ignore",

         // Grading option which copies a column for reference to the Grades sheet
        "FLB_STR_GRADING_OPT_COPY_FOR_REFERENCE" : "Copy for Reference",
      
        // Message shown in sidebar for Flubaroo update announcements
        "FLB_STR_EMAIL_ME_THIS_ANNOUCNEMENT" : "Email Me This Announcement",
      
        // Flubaroo Tips, shown when grading completes.
        "FLB_STR_TIP_MSG_NUMBER_1" : "<b>Flubaroo Tip #1:</b> Flubaroo can accept more than one correct answer.",
        "FLB_STR_TIP_MSG_NUMBER_2" : "<b>Flubaroo Tip #2:</b> Flubaroo can grade numeric ranges for science and math assignments.",
        "FLB_STR_TIP_MSG_NUMBER_3" : "<b>Flubaroo Tip #3:</b> DOG vs dog? Grade case-sensitive answers.",
        "FLB_STR_TIP_MSG_NUMBER_4" : "<b>Flubaroo Tip #4:</b> Want to change the default 70% pass score?",
        "FLB_STR_TIP_MSG_NUMBER_5" : "<b>Flubaroo Tip #5:</b> Need to check your remaining email quota?",
        "FLB_STR_TIP_MSG_NUMBER_6" : "<b>Flubaroo Tip #6:</b> Want your assignments graded automatically?",
        "FLB_STR_TIP_MSG_NUMBER_7" : "<b>Flubaroo Tip #7:</b> You've got questions? We've got answers in our FAQs!",
        "FLB_STR_TIP_MSG_NUMBER_8" : "<b>Flubaroo Tip #8:</b> In a GAFE school? Collect email addresses automatically!",
        "FLB_STR_TIP_MSG_NUMBER_9" : "<b>Flubaroo Tip #9:</b> Can't share grades via email? Share then via Google Drive!",
        "FLB_STR_TIP_MSG_NUMBER_10" : "<b>Flubaroo Tip #10:</b> Want a hard copy of grades for your students? Learn how to print them!",
      
    },
    // END ENGLISH //////////////////////////////////////////////////////////////////////////////////

    // START SPANISH ////////////////////////////////////////////////////////////////////////////////
    // Thanks to these contributors for the Spanish translation: Felipe Calvo, Gabriel Crivelli, Luis Escolar, Iñaki Fernández, Manuel Fernández, Gatech López.
    "es-es": {
        "FLB_LANG_IDENTIFIER": "Español (Spanish)",

        "FLB_STR_GRADING_OPT_STUD_ID" : "Identifica alumno",

        "FLB_STR_GRADING_OPT_SKIP_GRADING" : "No evaluar",

        "FLB_STR_RESULTS_MSG1" : "¡La calificación ha finalizado! Se ha creado una nueva hoja de cálculo llamada 'Calificaciones'.    Esta hoja de cálculo contiene una calificación por cada envío y un resumen de todas    las calificaciones en la parte superior. ** Nota: La hoja de cálculo 'Calificaciones'    no debe ser modificada, ya que puede interferir en el envío de las calificaciones por   correo electrónico. Si necesita modificar esta hoja, por favor, haga una copia    y modifique dicha copia.",

        "FLB_STR_RESULTS_MSG2" : "Aviso: La última fila muestra el porcentaje de respuestas correctas.  Las preguntas con aciertos inferiores al 70 % se destacan con fondo de color naranja.  También se destaca con texto en rojo a los estudiantes que obtuvieron  una calificación inferior al 70%.",

        "FBL_STR_STEP1_INSTR" : "Por favor, seleccione una opción de calificación para cada una de las preguntas. Flubaroo se ha diseñado para tratar de identificar la opción adecuada, pero usted debe comprobar si la opción escogida para cada cuestión es la correcta.",

        "FBL_STR_STEP2_INSTR" : "Por favor, seleccione la fila que se utilizará como Clave de Respuestas. Normalmente, debería ser la primera enviada por usted. El resto de respuestas serán evaluadas comparando con la Fila Clave. Preste atención para asegurarse de seleccionar la correcta.",

        "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Importante: Debe haber al menos 2 respuestas para poder Calificar. Inténtelo de nuevo cuando al menos haya 2 filas con respuestas.",

        "FLB_STR_WAIT_INSTR1" : "Flubaroo está comprobando sus asignaciones. Por favor, espere...",

        "FLB_STR_WAIT_INSTR2" : "Por favor, espere mientras se procede a la calificación. Puede tardar entre uno y dos minutos en terminar.",

        "FLB_STR_REPLACE_GRADES_PROMPT" : "Se reemplazarán las calificaciones existentes. ¿Quieres continuar? ",

        "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Preparando para Calificar",

        "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Calificando Su Examen",

        "FLB_STR_GRADING_COMPLETE_TITLE" : "¡Flubaroo - Clasificación ha Finalizado!",

        "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Calificación PASO 1",

        "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Calificación PASO 2",

        "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Opciones de Calificación",

        "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Cuestión",

        "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Seleccione",

        "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Fecha de Envío",

        "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Ver calificaciones",

        "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Resultados",

        "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Informe para",

        "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Puntos Posibles",

        "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Promedio de Puntos",

        "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Número de Envíos",

        "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Preguntas con Calificación inferior al 70%",

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Total Puntos",

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Porcentaje",

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Número de Envíos",

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "¿Calificaciones enviadas?", 

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Comentario para el alumno (Opcional)",

        "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Envío de Calificaciones",

        "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo puede enviar por correo a cada alumno su calificación, así como las respuestas correctas. Use el menú desplegable para seleccionar la pregunta que contiene la dirección de correo electrónico. Si las direcciones de correo electrónico no fueron enviadas por los alumnos, no será posible enviar las calificaciones.",

        "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo no puede enviar por correo electrónico los calificaciones en este momento, ya que ha superado su cuota diaria de correos electrónicos por día. Esta cuota es fijada por Google. Por favor, inténtelo de nuevo más tarde.",
      
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : " informes de Calificaciones se enviaron corectamente",

        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "envíos no se han realizado - dirección incorrecta,en blanco o ya fueron efectuados con anterioridad.",

        "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "No se ha efectuado el envío - No se encontraron direcciones válidaso el envío ya se ha realizado.",

        "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Te enviamos tus resultados del examen:",

        "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Este correo contiene tus calificaciones para",

        "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Por favor no responda a este correo",

        "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Calificación",

        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Debajo verás un mensaje de tu Profesor/a, envió a toda la clase",

        "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Comentario de tu profesor/a, sólo para ti",

        "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Resumen de tu examen",

        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Debajo está tu puntuación para cada pregunta",

        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Debajo está tu puntuación para cada pregunta junto a la respuesta correcta",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Pregunta",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Su Respuesta",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Respuesta Correcta",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Tu Puntuación",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Puntos Posibles",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Ayuda para esta Pregunta/Ítem",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "punto(s)",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Correcta",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Incorrecta",

        "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Este correo fue generado por Flubaroo, una aplicación de uso gratuito para evaluar y enviar calificaciones",

        "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Visita flubaroo.com",

        "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Informe sobre tu envío de calificaciones en",

        "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Nombre del Examen",

        "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Cantidad de Correos Electrónicos Enviados",

        "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Cantidad de Envíos Calificados",

        "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Puntuación Promedio (puntos)",

        "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Máxima Calificación Posible",

        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "¿Lista de Respuestas Enviada? ",

        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "No",

        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Si",

        "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Usted incluyó este mensaje",

        "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo es una herramienta libre, que permite ahorrar tiempo a los profesores, ya que califica rápidamente pruebas de selección múltiple y analiza los resultados de forma automatizada.",

        "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Para aprender más visite www.flubaroo.com.",

        "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo no puede determinar la hoja de cálculo que contiene los envíos de los estudiantes. Por favor localice esta hoja y renómbrela como: ",

        "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo no puede determinar la hoja de cálculo que contiene los calificaciones. Por favor, volver a calificar, o localice esta hoja y renómbrela como: ",

        "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Calificar Tarea",

        "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Volver a Calificar",

        "FLB_STR_MENU_EMAIL_GRADES" : "Enviar Calificaciones",

        "FLB_STR_MENU_HIDE_FEEDBACK" : "Ocultar Comentarios Para Los Alumnos",

        "FLB_STR_MENU_EDIT_FEEDBACK" : "Mostrar Comentarios Para Los Alumnos",

        "FLB_STR_MENU_HIDE_HELP_TIPS" : "Ocultar Ayuda Para Preguntas",

        "FLB_STR_MENU_EDIT_HELP_TIPS" : "Mostrar Ayuda Para Preguntas",

        "FLB_STR_MENU_VIEW_REPORT" : "Ver Informe",

        "FLB_STR_MENU_ABOUT" : "Acerca de Flubaroo",

        "FLB_STR_MENU_SET_LANGUAGE" : "Seleccionar Idioma",

        "FLB_STR_BUTTON_CONTINUE" : "Continuar",

        "FLB_STR_SHEETNAME_STUD_SUBM" : "Respuestas",

        "FLB_STR_SHEETNAME_GRADES" : "Calificaciones",

        "FLB_STR_NOT_GRADED" : "No calificada",

        "FLB_STR_NEW_VERSION_NOTICE" : "¡Has instalado una nueva versión de Flubaroo! Visita flubaroo.com/blog para ver las novedades.",

        "FLB_STR_NOTIFICATION" : "Notificación de Flubaroo",

        "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Asunto del Email: ",

        "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Incluir la lista de preguntas y puntuaciones: ",

        "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Incluir las claves de respuestas correctas: ",

        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Mensaje para incluir en el correo electrónico (opcional):",

        "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Informe de Calificaciones",

        "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Histograma de Calificaciones",

        "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Envíos",

        "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Respuestas Correctas",

        "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Enviarme el informe por correo",

        "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "El informe ha sido enviado a",
      
        "FLB_STR_RESULTS_TIP_READ_ARTICLE": "Haga clic en <a target=_blank href=\"%s\"> aquí </a> para obtener más información.",

        "FLB_STR_MENU_ADVANCED": "Avanzado",

        "FLB_STR_MENU_ADV_OPTIONS": "Opciones Avanzadas",

        "FLB_STR_MENU_ENABLE_AUTO_GRADE": "Habilitar Autograde",

        "FLB_STR_MENU_DISABLE_AUTO_GRADE": "Desactivar Autograde",

        "FLB_STR_MENU_SHOW_EMAIL_QUOTA": "Compruebe Correo Cuota",

        "FLB_STR_MENU_ENABLE": "Habilitar Flubaroo en esta ficha",

        "FLB_STR_FLUBAROO_NOW_ENABLED": "Flubaroo se ha habilitado para esta hoja. Ahora puede acceder a él desde el menú.",

        "FLB_STR_GRADING_CELL_MESSAGE": "La clasificación últimas presentaciones ...",

        "FLB_STR_AUTOGRADE_IS_ON": "Autograde está habilitada. Flubaroo está a la espera de nuevas presentaciones a grado. No realizar cambios en todas las hojas hasta autograde está apagado.",

        "FLB_STR_AUTOGRADE_IS_OFF": "Autograde se ha apagado.",

        "FLB_STR_AUTOGRADE_GRADE_RECENT": "En algunas comunicaciones recientes aún no se han clasificado. ¿Te gustaría Flubaroo a ellos de grado primero, antes de que se habilita autograde?",

        "FLB_STR_AUTOGRADE_SETUP": "Antes de habilitar autograde primero debe configurar sus calificaciones y de correo electrónico ajustes. Haga clic en 'Aceptar' para continuar.",

        "FLB_STR_AUTOGRADE_UPDATE": "Antes de habilitar autograde, le gustaría actualizar sus calificaciones y de correo electrónico configuración?",

        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE": "Opciones Avanzadas",

        "FLB_STR_ADV_OPTIONS_NOTICE": "Sólo cambiar esta configuración si ha leído los artículos correponding ayuda",

        "FLB_STR_ADV_OPTIONS_NO_NOREPLY": "Uso mi dirección de retorno cuando emailing calificaciones, en lugar de la dirección noreply @.",

        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK": "Tras la presentación, auto-correo electrónico al estudiante un enlace para editar rápidamente su respuesta.",

        "FLB_STR_ADV_OPTIONS_PASS_RATE": "Porcentaje por debajo del cual info estudiante se resalta en rojo:",

        "FLB_STR_EMAIL_QUOTA_MSG": "Usted tiene esta cantidad de correos electrónicos que quedan en su cuota diaria:",

        "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Puntos",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "Debe seleccionar al menos una pregunta que identifica a un estudiante antes de continuar.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "Debe seleccionar al menos una pregunta que es gradeable.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Debe seleccionar una clave de respuestas antes de continuar.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Clasificación normal",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Grado de la mano (¡Nuevo!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "Autograde no puede ser habilitado porque usted tiene una o más preguntas que se establecen para ser calificada mano.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "Ha seleccionado una o varias preguntas que se calificará a mano. Pero la clasificación no puede continuar porque algunas de esas preguntas no son distintas entre sí. Por ejemplo, usted puede tener dos preguntas tanto titulado \"Cuestión\". Modifique el texto de dichas preguntas en la fila 1 por lo que son únicos (es decir, \"Pregunta 1\" y \"Pregunta 2\"), y luego tratar de clasificación de nuevo.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Mano Calificado",

        "FBL_STR_MANUAL_GRADING_INSTR": "Utilice los controles de abajo para asignar calificaciones a mano. Tenga en cuenta que esto sólo funcionará correctamente en las preguntas para las que haya seleccionado \"Grado de la mano\" en el paso 1 de la clasificación.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "Preguntas Grado de Mano",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "No hay puntos asignados",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Los comentarios hechos por su instructor",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Preguntas Grado de Mano - Flubaroo",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Seleccione Estudiante:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Seleccione Pregunta:",

        "FLB_STR_MANUAL_GRADING_STEP3": "Presentación de 3. Lea Estudiante:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Introduzca Notas para Estudiantes (enviado en el correo electrónico):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "Clave de respuestas opinión",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Establecer Grado",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "Trabajando",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "Grado se ha aplicado.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "Por favor, introduzca una calificación válida.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Ocurrió un error.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "Cerca",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "Autograde actualmente calificando una o más nuevas presentaciones, por lo que no se puede desactivar. Inténtalo de nuevo en breve.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Una hoja de calificaciones no fue creado porque no se encontraron presentaciones válidos.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Calificaciones dañados Hoja - No se puede continuar",

        "FLB_STR_INVALID_GRADES_SHEET": "<p> Flubaroo no puede continuar porque su hoja de Calificaciones se ha corrompido. ¿Sabía usted tal vez eliminar filas, columnas u otros datos de la hoja de calificaciones después de la clasificación última completado? </ P> <p> Consulte <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> esta </a> artículo para obtener ayuda.</ p>",

        "FLB_STR_DO_NOT_DELETE_MSG": "PARA ASEGURAR FUNCIONES FLUBAROO CORRECTAMENTE, NO BORRAR FILAS O COLUMNAS EN ESTA HOJA",

        "FLB_STR_GRADES_SHARE_LABEL": "Grado Método para compartir:",

        "FLB_STR_GRADES_SHARE_EMAIL": "Compartir por correo electrónico (típico)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Compartir a través de Google Drive (sin e-mail)",

        "FLB_STR_GRADES_SHARE_BOTH": "Compartir a través tanto de correo electrónico y Drive",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "Flubaroo - Calificaciones Compartidas",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Grado para",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Haz clic aquí para ver el informe de calificaciones en Google Drive",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - Imprimir los Calificaciones",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo creará un único documento de Google que contiene las calificaciones de todos los estudiantes que luego se puede imprimir y distribuir. Usted puede especificar un mensaje a incluir en cada documento, así como si se debe incluir la lista de preguntas y / o las respuestas correctas.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Compartir Calificationes",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo puede compartir con cada alumno su calificación a través de correo electrónico, Google Drive, o ambos. Utilice el menú desplegable para seleccionar la pregunta que pidió a los estudiantes por su dirección de correo electrónico. Si no se recogieron direcciones de correo electrónico, entonces usted no será capaz de compartir notas.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "Un documento de Google se ha creado que contiene todas las calificaciones de los estudiantes. Haga clic en el nombre del archivo a continuación para abrirlo. Imprimir y entregar a cada estudiante su impresión.",

        "FLB_STR_MENU_SHARE_GRADES": "Compartir Calificaciones",

        "FLB_STR_MENU_PRINT_GRADES": "Imprimir Calificaciones",
      
        "FBL_STR_PRINT_GRADES_TITLE_PRE": "Imprimir las calificaciones de:",

        "FLB_STR_GRADING_OPT_EXTRA_CREDIT": "Puntuación extra",

        "FLB_STR_ADV_OPTIONS_EXTRA_CREDIT": "Permitir puntuación extra cuando se asignen puntos a las preguntas",

        "FLB_STR_ADV_OPTIONS_ADDITIONAL_GOPTS": "Muestra más opciones en el paso 1 de la evaluación",

        "FLB_STR_AUTOGRADE_NOT_SUMMARIZED": "DEBIDO A LOS AJUSTES DE LA EVALUACIÓN AUTOMÁTICA, ESTA HOJA PUEDE CONTENER MÁS DE UNA NOTA POR ALUMNO",

        "FLB_STR_ADV_OPTIONS_AG_WITH_SUMMARY": "La evaluación automática solo funcionará con el último envío realizado por el alumno  (Ver <a target=\"_blank\" href=\"" + FLB_AUTOGRADE_SELECT_MODE_URL + "\"> este artículo</a>)",

        "FLB_STR_ADV_OPTIONS_MGR_ADV_QUESTION": "Cuando se \ “Evalúen las preguntas de forma manual\”, avanzar a la siguiente pregunta (en lugar de al siguiente alumno)",

        "FLB_STR_MENU_EXPAND_FORMULAS": "Expandir las fórmulas introducidas por el profesor",

        "FLB_STR_GRADING_OPT_IGNORE": "Ignorar",

        "FLB_STR_GRADING_OPT_COPY_FOR_REFERENCE": "Copia por referencia",

        "FLB_STR_TIP_MSG_NUMBER_1": "<b> Flubaroo Consejo # 1: </ b> Flubaroo puede aceptar más de una respuesta correcta.",

        "FLB_STR_TIP_MSG_NUMBER_2": "<b> Flubaroo Consejo # 2: </ b> Flubaroo puede grado rangos numéricos para las asignaciones de ciencias y matemáticas.",

        "FLB_STR_TIP_MSG_NUMBER_3": "<b> Flubaroo Consejo # 3: </ b> PERRO vs perro? Respuestas Grado mayúsculas y minúsculas.",

        "FLB_STR_TIP_MSG_NUMBER_4": "<b> Flubaroo Consejo # 4: </ b> ¿Quieres cambiar la puntuación pase por defecto 70%?",

        "FLB_STR_TIP_MSG_NUMBER_5": "<b> Flubaroo Consejo # 5: </ b> La necesidad de revisar su cuota restante de correo electrónico?",

        "FLB_STR_TIP_MSG_NUMBER_6": "<b> Flubaroo Consejo # 6: </ b> ¿Quieres que tus tareas clasifican automáticamente?",

        "FLB_STR_TIP_MSG_NUMBER_7": "<b> Flubaroo Consejo # 7: </ b> Tienes preguntas? Tenemos respuestas en nuestras Preguntas Frecuentes!",
        
        "FLB_STR_TIP_MSG_NUMBER_8": "Flubaroo Consejo 8: ¿Perteneces a una escuela GAFE (Google Apps For Education)? ¡Obtén las direcciones de correo electrónico automáticamente!",

        "FLB_STR_TIP_MSG_NUMBER_9": "Flubaroo Consejo  9: ¿No puedes compartir las calificaciones por correo electrónico? ¡Compártelas a través de Google Drive!",

        "FLB_STR_TIP_MSG_NUMBER_10": "Flubaroo Consejo 10: ¿Necesitas una copia impresa de las calificaciones de tus alumnos? ¡Aprende cómo imprimirlas!"
    },
    // END SPANISH ////////////////////////////////////////////////////////////////////////////////
  
    // START SWEDISH ////////////////////////////////////////////////////////////////////////////// 
    // Thanks to these contributors for the Swedish translation: Carl Holmberg
    "sv-se": {
        "FLB_LANG_IDENTIFIER": "Svenska (Swedish)",

        "FLB_STR_GRADING_OPT_STUD_ID" : "Identifierar elev",

        "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Poängsätt inte",

        "FLB_STR_RESULTS_MSG1" : "Poängsättning har avslutats! Ett nytt blad med namnet 'Poäng' har skapats. Detta blad innehåller poängen för varje elev och en sammanfattning av alla poäng överst. ** Observera: Det är inte tänkt att bladet 'Poäng' ska ändras på något sätt då detta kan störa epostandet av poängen. Om du behöver ändra i bladet så kan du kopiera bladet och ändra i kopian.",
      
        "FLB_STR_RESULTS_MSG2" : "Tips: Sista raden visar hur många procent av eleverna som hade rätt svar och med frågor med generellt låga poäng markerade i orange. Dessutom markeras elever med mindre än 70% av poängen i rött.",

        "FBL_STR_STEP1_INSTR" : "Vänligen välj ett poängsättningsalternativ för varje fråga i uppgiften. Flubaroo har försökt gissa det bästa alternativet, men du bör själv kontrollera varje val.",

        "FBL_STR_STEP2_INSTR" : "Vänligen välj vilken svarsrad som ska användas som svarsnyckel. Vanligen är detta en svarsrad som du bidragit med. Alla andra rader kommer att poängsättas mot svarsnyckeln, så se till att välja rätt rad.",

        "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "För att kunna poängsätta måste det finnas minst 2 svarsrader. Vänligen försök igen när fler elever svarat.",

        "FLB_STR_WAIT_INSTR1" : "Flubaroo undersöker uppgiften. Vänligen vänta...",

        "FLB_STR_WAIT_INSTR2" :  "Vänligen vänta medan uppgiften poängsätts. Detta kan ta ett par minuter att slutföra.",

        "FLB_STR_REPLACE_GRADES_PROMPT" : "Detta kommer att ersätta din poäng. Är du säker på att du vill fortsätta?",

        "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Förbereder poängsättning",

        "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Poängsätter uppgiften",

        "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Poängsättning klar",

        "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Poängsättning steg 1",

        "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Poängsättning steg 2",

        "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Poängsättningsval",

        "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Fråga",

        "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Val",

        "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Inskickat",

        "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Visa poäng",

        "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Sammanfattning",

        "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Rapport för",

        "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Möjliga poäng",

        "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Medelpoäng",

        "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Antal svarsrader",

        "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Antal frågor med låga svarspoäng",

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Totalpoäng",

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Procent",

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Antal inskick",

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Epostat poäng?",

        "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Elevfeedback (valfri)",

        "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Eposta poäng",

        "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo kan eposta poängen till varje elev inklusive rätta svaren. Använd menyn för att välja frågan som motsvarar elevernas epostadress. Om epostadresser inte samlades in så kommer du inte kunna eposta poängen.",

        "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo kan inte maila betyg just nu eftersom den har överskridit sin dagliga kvot på e-postmeddelanden per dag. Denna kvot är satt av Google. Försök igen senare.",
      
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "poäng epostades",

        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "poäng epostades inte på grund av ogiltiga/saknade epostadresser eller att de redan fått sina poäng skickade.",

        "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Inga poäng skickades då giltiga epostadresser saknades eller för att eleverna redan fått sina poäng skickade.",     

        "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Här är dina poäng för",

        "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Detta brev innehåller dina poäng för",

        "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Svara inte på detta brev",

        "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Dina poäng",

        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Nedan kommer ett meddelande från din lärare som skickats till hela gruppen",

        "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Din lärare hare feedback till dig",

        "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Sammanfattning av ditt svar",

        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Nedan kommer dina poäng för varje fråga",

        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Nedan kommer dina poäng för varje frånga tillsammans med det rätta svaret",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Fråga",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Ditt svar",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Rätt svar",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Dina poäng",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Möjliga poäng",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Hjälp för den här frågan",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "poäng",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Rätt",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Fel",

        "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Detta meddelande har skapats av Flubaroo – ett gratisverktyg för poängsättning och bedömning",

        "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Besök flubaroo.com",

        "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Poängregister epostat för",

        "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Namn på uppgiften",

        "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Antal skickade epostmeddelanden",

        "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Antal poängsatta svarsrader",

        "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Medelpoäng",

        "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Möjliga poäng",

        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Svarsnyckel finns?",

        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Nej",

        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Ja",

        "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Du bifogade även detta meddelande",

        "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo är ett verktyg som är gratis, sparar tid och låter lärare snabbt poängsätta flervalsuppgifter och analysera resultatet",

        "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Besök www.flubaroo.com för att lära dig mer.",

        "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo kunde inte avgöra vilket blad som innehåller elevsvaren. Vänligen döp om den till: ",

        "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo kunde inte avgöra vilket blad som inehåller poängen. Vänligen poängsätt uppgiften eller döp om den till: ",

        "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Poängsätt uppgift",

        "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Poängsätt uppgift på nytt",

        "FLB_STR_MENU_EMAIL_GRADES" : "Eposta poäng",

        "FLB_STR_MENU_HIDE_FEEDBACK" : "Dölj elevfeedback",

        "FLB_STR_MENU_EDIT_FEEDBACK" : "Ändra elevfeedback",

        "FLB_STR_MENU_HIDE_HELP_TIPS" : "Dölj hjälptips",

        "FLB_STR_MENU_EDIT_HELP_TIPS" : "Ändra hjälptips",

        "FLB_STR_MENU_VIEW_REPORT" : "Visa rapport",

        "FLB_STR_MENU_ABOUT" : "Om Flubaroo",

        "FLB_STR_MENU_SET_LANGUAGE" : "Välj språk",

        "FLB_STR_BUTTON_CONTINUE" : "Fortsätt",

        "FLB_STR_SHEETNAME_STUD_SUBM" : "Elevsvar", 

        "FLB_STR_SHEETNAME_GRADES" : "Poäng",

        "FLB_STR_NOT_GRADED" : "Inte poängsatt",

        "FLB_STR_NEW_VERSION_NOTICE" : "Du har installerat en ny version av Flubaroo! Besök flubaroo.com/blog för att se nyheterna.",

        "FLB_STR_NOTIFICATION" : "Flubaroo-meddelande",

        "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Fråga med epostadress: ",

        "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Bifoga lista med frågor och poäng: ", 

        "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Bifoga svarsnyckel: ",

        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Meddelande att bifoga epost (valfri):",

        "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Poängrapport",

        "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Histogram över poäng",

        "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Antal svar",

        "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Antal poäng",

        "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Eposta rapporten till mig",

        "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Rapporten har inte epostats till",
      
        "FLB_STR_RESULTS_TIP_READ_ARTICLE": "Klicka <a target=_blank href=\"%s\"> här </a> ta reda på mer.",

        "FLB_STR_MENU_ADVANCED": "Avancerad",

        "FLB_STR_MENU_ADV_OPTIONS": "Avancerade alternativ",

        "FLB_STR_MENU_ENABLE_AUTO_GRADE": "Aktivera Autograde",

        "FLB_STR_MENU_DISABLE_AUTO_GRADE": "Inaktivera Autograde",

        "FLB_STR_MENU_SHOW_EMAIL_QUOTA": "Kontrollera e-Kvot",

        "FLB_STR_MENU_ENABLE": "Aktivera Flubaroo i detta blad",

        "FLB_STR_FLUBAROO_NOW_ENABLED": "Flubaroo har aktiverats för detta blad. Nu kan du komma åt den från menyn.",

        "FLB_STR_GRADING_CELL_MESSAGE": "Sortering senast insänt ...",

        "FLB_STR_AUTOGRADE_IS_ON": "Autograde är aktiverad. Flubaroo väntar på nya inlagor till klass. Inte göra ändringar i några ark tills autograde är avstängd.",

        "FLB_STR_AUTOGRADE_IS_OFF": "Autograde har stängts av.",

        "FLB_STR_AUTOGRADE_GRADE_RECENT": "Några nya inlagor har ännu inte graderas. Vill du Flubaroo att gradera dem först, innan autograde är aktiverad?",

        "FLB_STR_AUTOGRADE_SETUP": "Innan du aktiverar autograde måste du först ställa in dina betygs och e-postinställningar. Klicka på \"OK\" för att fortsätta.",

        "FLB_STR_AUTOGRADE_UPDATE": "Innan du aktiverar autograde, vill du uppdatera dina betygs och e-postinställningar?",

        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE": "Avancerade alternativ",

        "FLB_STR_ADV_OPTIONS_NOTICE": "Ändra endast dessa inställningar om du har läst correponding hjälpartiklar",

        "FLB_STR_ADV_OPTIONS_NO_NOREPLY": "Använd min avsändaradress när e-post betyg, snarare än noreply @ adressen.",

        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK": "Vid inlämning, automatisk e-studenten en länk för att snabbt redigera sina svar.",

        "FLB_STR_ADV_OPTIONS_PASS_RATE": "Procentsats under vilken studerande info markeras i rött:",

        "FLB_STR_EMAIL_QUOTA_MSG": "Du har så här många e-postmeddelanden kvar i din dagliga kvot:",

        "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Poäng",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "Du måste välja minst en fråga som identifierar en student innan du fortsätter.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "Du måste välja minst en fråga som är gradeable.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Du måste välja ett facit innan du fortsätter.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Normal Gradering",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Grad av Hand (Ny!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "Autograde kan inte aktiveras eftersom du har en eller flera frågor som är inställda på att handen graderade.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "Du har valt en eller flera frågor som ska klassificeras efter hand. Men betygssättning kan inte fortsätta eftersom en del av dessa frågor är inte skiljer sig från varandra. Till exempel kan du ha två frågor både titeln \"Question\". Ändra texten till dessa frågor i rad 1, så att de är unika (dvs \"Fråga 1\" och \"Fråga 2\"), och sedan försöka klassificera igen.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Hand Graded",

        "FBL_STR_MANUAL_GRADING_INSTR": "Använd kontrollerna nedan för att tilldela grader för hand. Observera att detta endast kommer att fungera på frågor som du valt \"Grad av Hand\" i steg 1 i betygssättning.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "Grade Frågor från Hand",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "Inga poäng tilldelas",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Synpunkter från din instruktör",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Flubaroo - gradera Frågor från Hand",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Välj Elev:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Välj Fråga:",

        "FLB_STR_MANUAL_GRADING_STEP3": "3. Läs Elev Submission:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Ange Notes for Student (skickas i e-post):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "omdöme svarsknappen",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Ställ Grade",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "Arbetssätt",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "Grade har tillämpats.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "Ange ett giltigt klass.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Ett fel inträffade.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "Nära",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "Autograde närvarande gradering en eller flera nya inlagor, så kan inte inaktiveras. Försök igen inom kort.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Ett grader ark skapades inte eftersom inga giltiga argument hittades.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Skadade Betyg Sheet - kan inte fortsätta",

        "FLB_STR_INVALID_GRADES_SHEET": "<p> Flubaroo kan inte fortsätta eftersom din betyg ark har skadats. Har du kanske ta bort rader, kolumner eller andra data från grader arket efter klassificering senast avslutade? </ P> <p> Se <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> den här artikeln </a> för att få hjälp. </ p>",

        "FLB_STR_DO_NOT_DELETE_MSG": "FÖR ATT SÄKERSTÄLLA FLUBAROO fungerar väl, inte ta bort rader eller kolumner i detta blad",

        "FLB_STR_GRADES_SHARE_LABEL": "Poäng Delning Metod:",

        "FLB_STR_GRADES_SHARE_EMAIL": "Dela via e-post (typiskt)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Dela via Google Drive (ingen e-post)",

        "FLB_STR_GRADES_SHARE_BOTH": "Tipsa en vän med både e-post och Drive",
      
        "FLB_STR_DRIVE_SHARE_FOLDER_NAME" : "Flubaroo - Delade Poäng",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Poäng för",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Klicka för att visa klass rapport i Google Drive",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - Tryck betyg",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo kommer att skapa en enda Google dokument som innehåller betyg för alla studenter som du sedan kan skriva ut och distribuera. Du kan ange ett meddelande som ska ingå i varje dokument, samt om att inkludera lista med frågor och / eller de rätta svaren.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Dela betyg",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo kan dela med varje elev sin klass via e-post, Google Drive, eller bådadera. Använd rullgardinsmenyn för att välja den fråga som ställdes eleverna för deras e-postadress. Om e-postadresser inte samlades, kommer du inte att kunna dela kvaliteter.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "En Google-dokument har skapats med alla student kvaliteter. Klicka på filnamnet nedan för att öppna den. Sedan skriva ut den och lämna varje elev sin utskrift.",

        "FLB_STR_MENU_SHARE_GRADES": "Dela grader",

        "FLB_STR_MENU_PRINT_GRADES": "Utskrifts grader",

        "FLB_STR_TIP_MSG_NUMBER_1": "<b> Flubaroo Tips # 1: </ b> Flubaroo kan ta emot mer än ett korrekt svar.",

        "FLB_STR_TIP_MSG_NUMBER_2": "<b> Flubaroo Tips # 2: </ b> Flubaroo kan gradera numeriska intervall för vetenskap och matematik uppdrag.",

        "FLB_STR_TIP_MSG_NUMBER_3": "<b> Flubaroo Tips # 3: </ b> DOG vs hund? Grade fall känsliga svar.",

        "FLB_STR_TIP_MSG_NUMBER_4": "<b> Flubaroo Tips # 4: </ b> Vill du ändra standard 70% passerar poäng?",

        "FLB_STR_TIP_MSG_NUMBER_5": "<b> Flubaroo Tips # 5: </ b> Behöver du kontrollera din återstående e-kvot?",

        "FLB_STR_TIP_MSG_NUMBER_6": "<b> Flubaroo Tips # 6: </ b> Vill du ha dina uppdrag betygsätts automatiskt?",

        "FLB_STR_TIP_MSG_NUMBER_7": "<b> Flubaroo Tips # 7: </ b> Du har frågor? Vi har svaren på våra frågor!",
    },
    // END SWEDISH ////////////////////////////////////////////////////////////////////////////// 

    // START RUSSIAN //////////////////////////////////////////////////////////////////////////// 
    // Thanks to these contributors for the Russian translation: Lyudmila Rozhdestvenskaya, Alexandra Barysheva and Boris Yarmakhov
    "ru-ru": {
        "FLB_LANG_IDENTIFIER": "русский (Russian)",
      
        "FLB_STR_GRADING_OPT_STUD_ID" : "Имя учащегося",
 
        "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Не оценивать",
 
        "FLB_STR_RESULTS_MSG1" : "Оценивание завершено! В таблице был создан новый лист “Оценки”. В этом листе находятся оценки всех ответов, а также статистика по всем оценкам. ** Внимание: Лист 'Оценки' нельзя изменять, поскольку это может повлиять на отчеты, рассылаемые по e-mail Если вы хотите внести в него изменения, скопируйте его и работайте с копией",
 
        "FLB_STR_RESULTS_MSG2" : "Обратите внимание: В последней строке указан процент учащихся, ответивших на каждый вопрос правильно, Оранжевым цветом выделяются вопросы, на которые было получено более всего неправильных оценок. Имена учащихся, набравших менее 70% правильных ответов, выделяются красным шрифтом.",
 
        "FBL_STR_STEP1_INSTR" : "Пожалуйста, выберите вариант ответа для каждого вопроса в задании. Flobaroo разработан таким образом, чтобы работа с ним была бы максимально удобной, Однако, для каждого из заданий вам следует проверить настройки самостоятельно.",
 
        "FBL_STR_STEP2_INSTR" : "Пожалуйста, выберите те ответы в форме, которые должны использоваться, как ключи к ответам. Как правило, это будут ответы, предоставленные вами. Все остальные ответы будут оцениваться в соответствии с ключами, поэтому убедитесь, что вы выбрали правильный вариант.",
 
        "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "В форме должно быть не менее 2-х ответов для выполнения процедуры оценивания. Пожалуйста, повторяйте процедуру каждый раз, когда новые ученики отправляют свои ответы в форму.",
 
        "FLB_STR_WAIT_INSTR1" : "Flubaroo оценивает ваше задание. Пожалуйста, подождите...",
 
        "FLB_STR_WAIT_INSTR2" : "Подождите, ваше задание оценивается. Это может занять минуту или две",
 
        "FLB_STR_REPLACE_GRADES_PROMPT" : "Это приведет к замене существующих оценок. Уверены, что хотите продолжить?",
 
        "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Подготовка к оцениванию",
 
        "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - задание оценивается",
 
        "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Оценивание выполнено!",
 
        "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Оценивание. Шаг 1. ",
 
        "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Оценивание. Шаг 2. ",
 
        "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Настройки оценивания",
 
        "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Вопросы",
 
        "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Выбрать",
 
        "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Время отправки",
 
        "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Посмотреть результаты",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Результаты",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Отчет по",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Максимальный балл",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Средний балл",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Количество ответов",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Количество ответов с низким результатом",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Баллы",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Проценты",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Количество попыток",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Письмо отправлено?",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Обратная связь (по выбору)",
 
        "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Послать результаты по e-mail",
 
        "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo может отправить каждому учащемуся его баллы, а также правильные ответы. Используйте выпадающее меню для выбора вопроса, запрашивающего электронные адреса учеников. Если адреса электронной почты не были собраны, то вы не сможете отправить оценки по электронной почте. ",

        "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo не может сорта по электронной почте в это время, потому что он превысил свои ежедневные квоты писем в день. Эта квота устанавливается Google. Пожалуйста, повторите попытку позже.",
      
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "оценок  успешно отправлены",
 
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "оценки не были отправлены из-за недействительных или пропущенных адресов электронной почты, или т.к. ученики уже получили свои результаты по электронной почте. ",
 
        "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Результаты не были отправлены по электронной почте, т.к. не были найдены действительные адреса электронной почты или т.к. ученики уже получили свои результаты по электронной почте.",
 
        "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Вот ваша оценка за",
 
        "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Это письмо содержит ваши результаты за",
 
        "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Не отвечайте на это письмо.",
 
        "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Ваша оценка",
 
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Ниже находится сообщение от вашего преподавателя, отправленное всему классу",
 
        "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Комментарий преподавателя лично для вас",
 
        "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Сводка результатов по выполненному заданию",
 
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Ниже ваш балл за каждый вопрос",
 
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Ниже ваш балл за каждый вопрос вместе с правильными ответами",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Вопросы",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Ваш ответ",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Правильный ответ",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Ваш результат",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Максимально возможный балл",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Подсказка для вопроса ",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "балл(ы) ",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Верно",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Неверно",
 
        "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Это письмо сгенерировано с помощью приложения Flubaroo, бесплатного инструмента для оценивания.",
 
        "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Посетите www.flubaroo.com.",
 
        "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT" : "Сообщение об отправке результатов за",
 
        "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME" : "Название задания",
 
        "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT" : "Количество отправленных писем",
 
        "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM" : "Количество оцененных заданий",
 
        "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE" : "Средний результат (балл)",
 
        "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE" : "Максимально возможный результат (балл)",
 
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED" : "Предоставлен ли ключ с правильными ответами?",
 
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO" : "Нет",
 
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES" : "Да",
 
        "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE" : "Вы также  включили это сообщение",
 
        "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo - бесплатный  инструмент, позволяющий учителю быстро оценить ответы	учеников и проанализировать результаты",
 
        "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Чтобы узнать больше, посетите наш сайт www.flubaroo.com.",
 
        "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo не может определить, какой лист содержит ответы учеников. Выберите этот лист и переименуйте его в:",
 
        "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo не может определить, какой лист содержит результаты оценивания. Выполните процедуру оценивания  или выберите этот лист и переименуйте его в: ",
 
        "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Произвести оценивание",
 
        "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Повторить оценивание",
 
        "FLB_STR_MENU_EMAIL_GRADES" : "Отправить результаты по e-mail",
 
        "FLB_STR_MENU_HIDE_FEEDBACK" : "Скрыть комментарии учащихся",
 
        "FLB_STR_MENU_EDIT_FEEDBACK" : "Редактировать комментарии учащихся",
 
        "FLB_STR_MENU_HIDE_HELP_TIPS" : "Скрыть подсказки",
 
        "FLB_STR_MENU_EDIT_HELP_TIPS" : "Редактировать подсказки",
 
        "FLB_STR_MENU_VIEW_REPORT" : "Посмотреть результаты",
 
        "FLB_STR_MENU_ABOUT" : "О программе Flubaroo",
 
        "FLB_STR_MENU_SET_LANGUAGE" : "Выбрать язык",
 
        "FLB_STR_BUTTON_CONTINUE" : "Продолжить",
 
        "FLB_STR_SHEETNAME_STUD_SUBM" : "Ответы",
 
        "FLB_STR_SHEETNAME_GRADES" : "Оценки",
 
        "FLB_STR_NOT_GRADED" : "Не оценено",
 
        "FLB_STR_NEW_VERSION_NOTICE" : "Вы установили новую версию Flubaroo! Посетите flubaroo.com/blog и познакомьтесь с последними новостями.",
 
        "FLB_STR_NOTIFICATION" : "Оповещение Flubaroo: ",
 
        "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Ваш адрес e-mail: ",
 
        "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Добавить список вопросов и результатов: ",
 
        "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Добавить ключи ответов: ",
 
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Добавить сообщение (по выбору)",
 
        "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Отчет",
 
        "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Гистограмма оценок",
 
        "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Ответы учеников",
 
        "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Набранные баллы",
 
        "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Отправить мне Отчет",
 
        "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Отчет был отправлен на адрес",
      
        "FLB_STR_RESULTS_TIP_READ_ARTICLE": "Нажмите <a target=_blank href=\"%s\"> здесь </a>, чтобы узнать больше.",

        "FLB_STR_MENU_ADVANCED": "Передовой",

        "FLB_STR_MENU_ADV_OPTIONS": "Расширенные опции",

        "FLB_STR_MENU_ENABLE_AUTO_GRADE": "Включить AutoGrade",

        "FLB_STR_MENU_DISABLE_AUTO_GRADE": "Отключить AutoGrade",

        "FLB_STR_MENU_SHOW_EMAIL_QUOTA": "Проверка по электронной почте взноса",

        "FLB_STR_MENU_ENABLE": "Включить Flubaroo в этом листе",

        "FLB_STR_FLUBAROO_NOW_ENABLED": "Flubaroo была включена для этого листа. Теперь Вы можете получить доступ из меню.",

        "FLB_STR_GRADING_CELL_MESSAGE": "Классификация последние представления ...",

        "FLB_STR_AUTOGRADE_IS_ON": "AutoGrade включен. Flubaroo ждет новых материалов в классе. Не вносить изменения в любые листов до AutoGrade не будет выключен.",

        "FLB_STR_AUTOGRADE_IS_OFF": "AutoGrade был выключен.",

        "FLB_STR_AUTOGRADE_GRADE_RECENT": "Некоторые недавние материалы еще не оценивали. Хотите Flubaroo до степени их сначала, перед AutoGrade включен?",

        "FLB_STR_AUTOGRADE_SETUP": "Перед включением AutoGrade вы должны сначала настроить ваш профилирования и электронной почты. Нажмите 'OK', чтобы продолжить.",

        "FLB_STR_AUTOGRADE_UPDATE": "Перед включением AutoGrade, вы хотели бы обновить профилирования и электронной почты?",

        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE": "Расширенные опции",

        "FLB_STR_ADV_OPTIONS_NOTICE": "Только изменить эти настройки, если вы читали correponding справочные статьи",

        "FLB_STR_ADV_OPTIONS_NO_NOREPLY": "Используйте свой обратный адрес, когда по электронной почте оценки, а не noreply @ адресу.",

        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK": "После представления, авто-электронной почте студенту ссылку, чтобы быстро изменить свой ответ.",

        "FLB_STR_ADV_OPTIONS_PASS_RATE": "Процент ниже которого студент Информация выделен красным:",

        "FLB_STR_EMAIL_QUOTA_MSG": "Вы должны это много писем, оставшихся в вашей повседневной квоты:",

        "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Точки",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "Вы должны выбрать по крайней мере один вопрос, который идентифицирует студента, прежде чем продолжить.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "Вы должны выбрать по крайней мере один вопрос, который gradeable.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Вы должны выбрать клавишу ответа, прежде чем продолжить.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Нормальная классификации",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Оценка по руке (Новая функция!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "AutoGrade не может быть включен, потому что у вас есть один или несколько вопросов, которые установлены для рук оцениваются.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "Вы выбрали один или более вопросов, чтобы быть классифицированы по руке. Но градация не может продолжаться, потому что некоторые из этих вопросов не отличаются друг от друга. Например, у вас может быть два вопроса и под названием \"Вопрос\". Пожалуйста, измените текст этих вопросов в строке 1, так что они уникальны (т.е. \"Вопрос 1\" и \"Вопрос 2\"), а затем попытаться снова классификации.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Рука сортовой",

        "FBL_STR_MANUAL_GRADING_INSTR": "Используйте элементы управления ниже, чтобы назначить оценки вручную. Обратите внимание, что это будет работать только на вопросы, для которых вы выбрали \"Оценка по руке\" на шаге 1 градуировки.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "Оценка Вопросы вручную",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "Очки не присваиваются",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Комментарии, сделанные инструктором",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Вопросы Grade вручную - Flubaroo",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Выберите Студент:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Выберите Вопрос:",

        "FLB_STR_MANUAL_GRADING_STEP3": "3. Прочитайте Студенческая Представление:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Введите Примечания для студента (отправлено по электронной почте):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "Обзор ключевой ответ",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Установите Grade",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "За работой",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "Оценка была применена.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "Пожалуйста, введите класс.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Произошла ошибка.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "Закрыть",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "AutoGrade настоящее классификации один или несколько новых представлений, поэтому не может быть отключена. Попробуйте еще раз в ближайшее время.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Сортов лист не был создан, потому что никакие действительные представления не были найдены.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Поврежденные сортов лист - не удалось продолжить",

        "FLB_STR_INVALID_GRADES_SHEET": "<р> Flubaroo не может продолжаться, потому что ваш сортов лист был поврежден. Ты, возможно, удалить строки, столбцы или другие данные из листа Классы после выбраковки последний завершенный? </ P> <P> в разделе <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> эта статья </a> для помощи. </ P>",

        "FLB_STR_DO_NOT_DELETE_MSG": "ЧТОБЫ FLUBAROO функции должным образом, НЕ удалять строки или столбцы в этом листе",

        "FLB_STR_GRADES_SHARE_LABEL": "Оценка общего доступа Метод:",

        "FLB_STR_GRADES_SHARE_EMAIL": "Поделиться по электронной почте (типичное)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Поделиться с помощью Google Drive (нет электронной почты)",

        "FLB_STR_GRADES_SHARE_BOTH": "Поделиться как через электронную почту и Drive",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "Flubaroo - Оценки Рейтинги",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Оценка для",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Нажмите, чтобы посмотреть этот отчет класса в Google Drive",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - Распечатать сортов",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo создадут единый документ, содержащий оценки Google для всех студентов, которые вы можете распечатать и распространять. Вы можете задать сообщение, чтобы включить в каждый документ, а также включать ли список вопросов и / или правильные ответы.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Поделиться сортов",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo можете поделиться с каждого студента их класса с помощью электронной почты, Google Drive, или обоих. Используйте выпадающее меню для выбора вопрос, который задал студентам для их адреса электронной почты. Если адреса электронной почты не были собраны, то вы не будете иметь возможность поделиться сорта.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "Документ Google была создана, содержащий все студенческие оценки. Щелкните имя файла ниже, чтобы открыть его. Затем распечатать его и вручить каждому учащемуся распечатку.",

        "FLB_STR_MENU_SHARE_GRADES": "Поделиться сортов",

        "FLB_STR_MENU_PRINT_GRADES": "Печать сортов",

        "FLB_STR_TIP_MSG_NUMBER_1": "<B> Flubaroo Совет # 1: </ B> Flubaroo может принимать более одного правильного ответа.",

        "FLB_STR_TIP_MSG_NUMBER_2": "<B> Flubaroo Совет # 2: </ B> Flubaroo можете классов числовые диапазоны научных и математических задач.",

        "FLB_STR_TIP_MSG_NUMBER_3": "<B> Flubaroo Совет # 3: </ B> СОБАКА против собаки? Оценка дело чувствительные ответы.",

        "FLB_STR_TIP_MSG_NUMBER_4": "<B> Flubaroo Совет # 4: </ B> Хотите изменить 70% проходной балл по умолчанию?",

        "FLB_STR_TIP_MSG_NUMBER_5": "<B> Flubaroo Совет # 5: </ B> Нужно проверить оставшееся электронной квоту?",

        "FLB_STR_TIP_MSG_NUMBER_6": "<B> Flubaroo Совет # 6: </ B> Хотите, чтобы ваш задания оцениваются автоматически?",

        "FLB_STR_TIP_MSG_NUMBER_7": "<B> Flubaroo Совет # 7: </ B> Ты есть вопросы? Мы получили ответы на часто задаваемые вопросы наших!",      
    },
    // END RUSSIAN //////////////////////////////////////////////////////////////////////////////   

    // START DUTCH ////////////////////////////////////////////////////////////////////////////// 
    // Thanks to these contributors for the Dutch translation: Ingmar Remmelzwaal
    "nl-nl": {
        "FLB_LANG_IDENTIFIER": "Nederlands (Dutch)",
      
        "FLB_STR_GRADING_OPT_STUD_ID" : "Identificeert student",
 
        "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Beoordeling overslaan",

        "FLB_STR_RESULTS_MSG1" : "Het beoordelen is afgerond! Een nieuw werkblad met de naam 'Beoordelingen' is gemaakt. Dit werkblad bevat de beoordeling van iedere inzending en bovenaan staat een samenvatting van alle beoordelingen. ** Opmerking: Het is niet de bedoeling dat het blad 'Beoordelingen' handmatig gewijzigd wordt. Dit kan het e-mailen van de beoordelingen verstoren. Als je het blad wilt wijzigen, maak een kopie en wijzig deze.",
 
        "FLB_STR_RESULTS_MSG2" : "Tips: De allerlaatste rij laat het percentage zien van studenten die iedere vraag goed hebben, vragen die over de gehele linie laag scoren zijn oranje. Individuele studenten die lager dan 70% scoren worden in een rood lettertype weergegeven.",
 
        "FBL_STR_STEP1_INSTR" : "Selecteer een beoordelingsoptie voor iedere vraag in de toets. Flubaroo heeft geprobeerd om de beste optie voor jou te raden, maar je moet dit voor iedere optie zelf nagaan.",
 
        "FBL_STR_STEP2_INSTR" : "Selecteer welke inzending gebruikt moet worden als de oplossing. Meestal is dit de inzending die door jou gemaakt is. Alle andere inzendingen zullen beoordeeld worden aan de hand van deze oplossing. Dus let op dat je de juiste selecteert.",
 
        "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Er moeten op zijn minst 2 inzendingen zijn om een beoordeling te maken. Probeer het opnieuw als er meer studenten hun antwoorden hebben verstuurd.",
 
        "FLB_STR_WAIT_INSTR1" : "Flubaroo voert je opdracht uit. Even geduld...",
 
        "FLB_STR_WAIT_INSTR2" : "Wacht even totdat je toets is beoordeeld. Dit kan één tot twee minuten duren.",
 
        "FLB_STR_REPLACE_GRADES_PROMPT" : "Dit zal je bestaande beoordelingen vervangen. Weet je zeker dat je door wilt gaan?",
 
        "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Beoordeling voorbereiden",
 
        "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Toets beoordelen",
 
        "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Beoordeling afgerond",
 
        "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Beoordeling STAP 1",
 
        "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Beoordeling STAP 2",
 
        "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Beoordelingsoptie",
 
        "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Vraag",
 
        "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Selecteer",
 
        "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Inzendtijd",
 
        "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Bekijk beoordelingen",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Resultaten",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Rapportage voor",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Maximum te behalen punten",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Gemiddeld aantal punten",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Aantal inzendingen",
 
        "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Aantal laag scorende vragen",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Puntentotaal",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Percentage",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Aantal keer verstuurd",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Beoordeling verstuurd",
 
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Feedback voor student (Optioneel)",
 
        "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Verstuur beoordelingen",
 
        "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo kan iedere student een e-mail sturen met de beoordeling en eventueel met de goede antwoorden. Gebruik het keuzemenu om de vraag te selecteren dat de studenten naar hun e-mailadres vroeg. Als er geen e-mailadressen zijn verzameld, kun je geen beoordelingen versturen.",
      
        "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo kan niet rangen e-mail op dit moment omdat het zijn dagelijkse quotum van e-mails per dag is overschreden. Dit contingent wordt door Google ingesteld. Probeer het later opnieuw.",
      
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : " beoordelingen werden succesvol verstuurd",
 
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : " beoordelingen zijn niet verstuurd omdat het geen of een ongeldig e-mailadres bevat",
 
        "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Er zijn geen beoordelingen verstuurd omdat er geen geldig e-mailadres werd gevonden of omdat alle studenten al hun beoordeling hebben ontvangen.",
 
        "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Dit is je beoordeling voor",
 
        "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Deze e-mail bevat je beoordeling voor",
 
        "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Beantwoord deze e-mail niet!",
 
        "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Je beoordeling",
 
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Hieronder staat een bericht dat je docent naar de hele klas heeft gestuurd",
 
        "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Jouw docent heeft de volgende feedback voor jou",
 
        "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Samenvatting van je inzending",
 
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Hieronder staat voor iedere vraag je score",
 
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Hieronder staat je score voor iedere vraag met daarbij het goede antwoord",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Vraag",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Jouw antwoord",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Het juiste antwoord",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Jouw score",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Maximum te behalen punten",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Hulp bij deze vraag",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "punt(en)",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Goed",
 
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Fout",
 
        "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Deze e-mail werd samengesteld door Flubaroo, een gratis hulpmiddel voor het automatisch nakijken en beoordelen van toetsen",
 
        "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Bezoek flubaroo.com",
 
        "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT" : "Overzicht van verstuurde beoordelingen voor",
 
        "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME" : "Naam van toets",
 
        "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT" : "Aantal verzonden e-mails",
 
        "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM" : "Aantal beoordeelde inzendingen",
 
        "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE" : "Gemiddelde score (punten)",
 
        "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE" : "Maximum te behalen punten",
 
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED" : "Antwoorden verstrekt",
 
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO" : "Nee",
 
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES" : "Ja",
 
        "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE" : "Je hebt ook dit bericht bijgevoegd",
 
        "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo is een gratis en tijdbesparend hulpmiddel dat docenten in staat stelt om snel meerkeuzetoetsen te beoordelen en te analyseren.",
 
        "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Wil je meer weten, bezoek www.flubaroo.com.",
 
        "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo kon niet vaststellen welk blad de inzendingen van de studenten bevat. Zoek het blad op en hernoem dit naar: ",
 
        "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo kon niet vaststellen welk blad de beoordelingen bevat. Beoordeel eerst de toets of zoek het blad op en hernoem dit naar: ",
 
        "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Beoordeel toets",
 
        "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Beoordeel toets opnieuw",
 
        "FLB_STR_MENU_EMAIL_GRADES" : "E-mail de beoordelingen",
 
        "FLB_STR_MENU_HIDE_FEEDBACK" : "Verberg feedback voor student",
 
        "FLB_STR_MENU_EDIT_FEEDBACK" : "Bewerk feedback voor student",

        "FLB_STR_MENU_HIDE_HELP_TIPS" : "Verberg helptips",

        "FLB_STR_MENU_EDIT_HELP_TIPS" : "Bewerk helptips",         
      
        "FLB_STR_MENU_VIEW_REPORT" : "Bekijk overzicht",
 
        "FLB_STR_MENU_ABOUT" : "Over Flubaroo",
 
        "FLB_STR_MENU_SET_LANGUAGE" : "Selecteer taal",
 
        "FLB_STR_BUTTON_CONTINUE" : "Ga verder",
 
        "FLB_STR_SHEETNAME_STUD_SUBM" : "Antwoorden",
 
        "FLB_STR_SHEETNAME_GRADES" : "Beoordelingen",
 
        "FLB_STR_NOT_GRADED" : "Niet beoordeeld",
 
        "FLB_STR_NEW_VERSION_NOTICE" : "Je hebt een nieuwe versie van Flubaroo geïnstalleerd! Lees op flubaroo.com/blog wat nieuw is.",
 
        "FLB_STR_NOTIFICATION" : "Flubaroo melding",
 
        "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Vraag naar e-mailadres: ",
 
        "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Voeg lijst toe van vragen en scores: ",
 
        "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Voeg juiste antwoorden toe: ",
 
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Voeg bericht aan e-mail toe (optioneel): ",
 
        "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Beoordelingsoverzicht",
 
        "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Grafiek met verdeling van scores",
 
        "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Inzendingen",
 
        "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Behaalde punten",
 
        "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Stuur mij het overzicht",
 
        "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Het overzicht is gestuurd naar",
      
        "FLB_STR_RESULTS_TIP_READ_ARTICLE": "Klik <a target=_blank href=\"%s\"> hier </a> om meer te weten te komen.",

        "FLB_STR_MENU_ADVANCED": "Gevorderd",

        "FLB_STR_MENU_ADV_OPTIONS": "Geavanceerde mogelijkheden",

        "FLB_STR_MENU_ENABLE_AUTO_GRADE": "Inschakelen Autograde",

        "FLB_STR_MENU_DISABLE_AUTO_GRADE": "Uitschakelen Autograde",

        "FLB_STR_MENU_SHOW_EMAIL_QUOTA": "Controleer Email Quota",

        "FLB_STR_MENU_ENABLE": "Inschakelen Flubaroo in dit blad",

        "FLB_STR_FLUBAROO_NOW_ENABLED": "Flubaroo is ingeschakeld voor dit blad. U kunt nu toegang krijgen tot deze in het menu.",

        "FLB_STR_GRADING_CELL_MESSAGE": "Indeling laatste inzendingen ...",

        "FLB_STR_AUTOGRADE_IS_ON": "Autograde is ingeschakeld. Flubaroo is wachten op nieuwe inzendingen naar de rang. Geen veranderingen aan een vel totdat autograde wordt uitgeschakeld.",

        "FLB_STR_AUTOGRADE_IS_OFF": "Autograde is uitgeschakeld.",

        "FLB_STR_AUTOGRADE_GRADE_RECENT": "Enkele recente inzendingen moeten nog worden beoordeeld. Wilt u eerst Flubaroo rang hen, voordat autograde is ingeschakeld?",

        "FLB_STR_AUTOGRADE_SETUP": "Voordat zodat autograde moet u eerst het opzetten van je sorteren en e-mailinstellingen. Klik op 'OK' om verder te gaan.",

        "FLB_STR_AUTOGRADE_UPDATE": "Voordat waardoor autograde, wilt u uw indeling en e-mail instellingen bij te werken?",

        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE": "Geavanceerde mogelijkheden",

        "FLB_STR_ADV_OPTIONS_NOTICE": "Alleen veranderen deze instellingen als u hebt gelezen de correponding helpartikelen",

        "FLB_STR_ADV_OPTIONS_NO_NOREPLY": "Gebruik mijn adres van de afzender wanneer e-mailen kwaliteiten, in plaats van de noreply @ adres.",

        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK": "Bij de indiening, auto-e-mail de student een link naar hun reactie snel te bewerken.",

        "FLB_STR_ADV_OPTIONS_PASS_RATE": "Percentage waaronder student info is gemarkeerd in het rood:",

        "FLB_STR_EMAIL_QUOTA_MSG": "Je hebt dit veel e-mails nog in uw dagelijkse quotum:",

        "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Punten",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "U moet ten minste één vraag die een student identificeert voordat u verder gaat selecteren.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "U moet minstens één vraag die gradeable selecteren.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Je moet een antwoord sleutel voordat u verder gaat selecteren.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Normale Beoordelen",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Handmatig Beoordelen (nieuw!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "Autograde kan niet worden ingeschakeld omdat u een of meer vragen die zijn ingesteld op de hand worden ingedeeld.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "U één of meer vragen om te worden beoordeeld door Hand. Maar indeling kan niet doorgaan omdat sommige van die vragen zijn niet te onderscheiden van elkaar. Bijvoorbeeld, kunt u twee vragen beide getiteld \"vraag\" te hebben. Wijzig de tekst van die vragen op rij 1, zodat ze uniek zijn (dat wil zeggen \"Vraag 1\" en \"vraag 2\"), en probeer het opnieuw sorteren.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Handmatig Beoordelen",

        "FBL_STR_MANUAL_GRADING_INSTR": "Gebruik de onderstaande controles kwaliteiten toewijzen met de hand. Merk op dat dit alleen goed zal werken aan vragen waarvoor u \"Handmatig Beoordelen\" in stap 1 van de indeling gekozen.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "Handmatig Beoordelen",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "Geen punten toegekend",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Opmerkingen van je instructeur",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Flubaroo - Handmatig Beoordelen",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Selecteer Student:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Selecteer Vraag:",

        "FLB_STR_MANUAL_GRADING_STEP3": "3. Lees student Submission:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Geef notities voor Student (verzonden in e-mail):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "beoordeling antwoord sleutel",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Stel Beoordelen",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "Werken",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "Beoordelen is toegepast.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "Vul een geldig cijfer.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Er is een fout opgetreden.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "Dicht",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "Autograde momenteel indeling één of meer nieuwe inzendingen, dus kan niet worden uitgeschakeld. Probeer opnieuw kort.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Een kwaliteiten plaat werd niet gemaakt omdat er geen geldige inzendingen werden gevonden.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Corrupted Grades Sheet - kan niet doorgaan",

        "FLB_STR_INVALID_GRADES_SHEET": "<p> Flubaroo kan niet doorgaan omdat uw kwaliteiten sheet is beschadigd. Hebt u misschien rijen, kolommen, of andere gegevens uit de rangen blad te verwijderen na het sorteren laatste voltooide? </ P> <p> Zie <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> dit artikel </a> voor hulp. </ p>",

        "FLB_STR_DO_NOT_DELETE_MSG": "OM FLUBAROO functies Controleer CORRECT, NOOIT rijen of kolommen NIET VERWIJDEREN in dit blad",

        "FLB_STR_GRADES_SHARE_LABEL": "Toet Delen Methode:",

        "FLB_STR_GRADES_SHARE_EMAIL": "Delen via e-mail (typisch)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Delen via Google Drive (geen e-mail)",

        "FLB_STR_GRADES_SHARE_BOTH": "Delen via zowel e-mail en Drive",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "Flubaroo - Gedeelde Beoordelen",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Rang voor",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Klik om deze graad rapport in Google Drive bekijken",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Printen de Beoordelingen",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo zal een enkele Google-document met cijfers voor alle studenten die u vervolgens kunt afdrukken en verspreiden creëren. U kunt een bericht opgeven om op te nemen in elk document, evenals de vraag of aan de lijst met vragen en / of de juiste antwoorden bevatten.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Delen de Beoordelingen",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo kunt delen met elke student hun rang via e-mail, Google Drive, of beide. Gebruik de pull-down menu om de vraag die de studenten gevraagd om hun e-mailadres te selecteren. Als e-mailadressen niet werden verzameld, dan zal je niet in staat zijn om kwaliteiten te delen.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "Een Google-document is gemaakt met alle cijfers van studenten. Klik op de naam van het bestand om het te openen. Dan af te drukken en geef elke student hun print-out.",

        "FLB_STR_MENU_SHARE_GRADES": "Delen de Beoordelingen",
      
        "FLB_STR_MENU_PRINT_GRADES": "Printen de Beoordelingen",
        
        "FBL_STR_PRINT_GRADES_TITLE_PRE": "Printbare beoordeling voor:",

        "FLB_STR_GRADING_OPT_EXTRA_CREDIT": "Extra punten",

        "FLB_STR_ADV_OPTIONS_EXTRA_CREDIT": "Sta extra punten toe bij het toekennen van punten aan vragen",

        "FLB_STR_ADV_OPTIONS_ADDITIONAL_GOPTS": "Laat aanvullende beoordelingsopties zien in Stap 1 van de beoordeling",

        "FLB_STR_AUTOGRADE_NOT_SUMMARIZED": "DOOR JE AUTOMATISCHE BEOORDELINGSOPTIES KAN DIT BLAD MEER DAN ÉÉN INZENDING PER STUDENT BEVATTEN",

        "FLB_STR_ADV_OPTIONS_AG_WITH_SUMMARY": "De automatische beoordeling zal alleen de meest recente inzending verwerken (zie <a target=\"_blank\" href=\"" + FLB_AUTOGRADE_SELECT_MODE_URL + "\">dit artikel</a>).",

        "FLB_STR_ADV_OPTIONS_MGR_ADV_QUESTION": "Wanneer je \"Beoordeel vragen handmatig\", gebruikt, moet je automatisch doorgaan naar de volgende vraag (in plaats van de volgende student)",

        "FLB_STR_MENU_EXPAND_FORMULAS": "Geef aangepaste formules weer",

        "FLB_STR_GRADING_OPT_IGNORE": "Negeer",

        "FLB_STR_GRADING_OPT_COPY_FOR_REFERENCE": "Referentiekopie",

        "FLB_STR_TIP_MSG_NUMBER_1": "<b> Flubaroo Tip # 1: </ b> Flubaroo kan meer dan één juist antwoord te aanvaarden.",

        "FLB_STR_TIP_MSG_NUMBER_2": "<b> Flubaroo Tip # 2: </ b> Flubaroo kan leerjaar numerieke reeksen voor de wetenschap en wiskunde opdrachten.",

        "FLB_STR_TIP_MSG_NUMBER_3": "<b> Flubaroo Tip # 3: </ b> DOG vs hond? Grade hoofdlettergevoelig antwoorden.",

        "FLB_STR_TIP_MSG_NUMBER_4": "<b> Flubaroo Tip # 4: </ b> Wil je de standaard 70% pas score veranderen?",

        "FLB_STR_TIP_MSG_NUMBER_5": "<b> Flubaroo Tip # 5: </ b> Wilt u uw resterende e-quota te controleren?",

        "FLB_STR_TIP_MSG_NUMBER_6": "<b> Flubaroo Tip # 6: </ b> Wilt u uw opdrachten automatisch ingedeeld?",

        "FLB_STR_TIP_MSG_NUMBER_7": "<b> Flubaroo Tip # 7: </ b> U hebt nog vragen? We hebben de antwoorden in onze FAQ!",
      
        "FLB_STR_TIP_MSG_NUMBER_8": "<b>Flubaroo Tip #8:</b> Gebruik je GAFE (Google Apps For Education)? Verzamel automatisch de e-mailadressen!",

        "FLB_STR_TIP_MSG_NUMBER_9": "<b>Flubaroo Tip #9:</b> Kun je de beoordelingen niet via e-mail delen? Deel deze via Google Drive!",

        "FLB_STR_TIP_MSG_NUMBER_10": "<b>Flubaroo Tip #10:</b> Wil je een uitdraai van de beoordeling voor je studenten? Leer hoe je deze kunt afdrukken!",
    },
    // END DUTCH //////////////////////////////////////////////////////////////////////////////  
 
    // START FRENCH (FRANCE) //////////////////////////////////////////////////////////////////
    // Thanks to these contributors for the French translation: Sylvain de France, Stéphane Métral
   "fr-fr": {
       // Name to identify language in language selector
       "FLB_LANG_IDENTIFIER": "Français (French)",

       // Grading option which identifies a student
       "FLB_STR_GRADING_OPT_STUD_ID" : "Identification de l'élève",

       // Grading option which tells Flubaroo to skip grading on a question
       "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Non évalué",

       // Message shown when grading is complete (1 of 2).
       "FLB_STR_RESULTS_MSG1" : "Notation terminée! Une nouvelle feuille de calcul appelée « Notation » a été créée. Cette feuille de calcul contient une note pour chaque formulaire reçu et résume l'ensemble des résultats.** Note: la fiche Notations n'est pas destinée à être modifiée en aucune façon, cela pourrait interférer sur le contenu des mails. Si vous avez besoin de modifier la fiche : la copier et modifier la copie.",

       // Message shown when grading is complete (2 of 2).
       "FLB_STR_RESULTS_MSG2" : "Information: la dernière ligne montre le pourcentage de bonnes réponses obtenu par chaque étudiant, les questions ayant obtenu un faible score sont en surbrillance orange. Aussi, les étudiants qui obtiennent moins de 70% apparaissent en rouge",

       // Instructions shown on Step 1 of grading.
       "FBL_STR_STEP1_INSTR" : "S'il vous plaît, sélectionner une option de classement pour chacune des questions. Flubaroo à fait de son mieux pour deviner la meilleure option, mais vous devez vérifier vous-même ",

       // Instructions shown on Step 2 of grading.
       "FBL_STR_STEP2_INSTR" : "Merci de sélectionner la réponse qui sera utilisée comme corrigé. Généralement il s'agit d'un formulaire envoyé par vous-même avec les réponses attendues. L'ensemble des réponses seront corrigées par rapport à ce formulaire, assurez-vous de choisir celui qui convient.",

       // Message shown if not enough submissions to perform grading.
       "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Important: il doit y avoir au moins 2 soumissions pour effectuer un classement. S'il-vous-plaît essayer de nouveau quand plus d'élèves  auront soumis leurs réponses.",

       // Please wait" message first shown when Flubaroo is first examining assignment.
       "FLB_STR_WAIT_INSTR1" : "Flubaroo examine votre soumission. Merci de patienter ...",

       // Please wait" message shown after Step 1 and Step 2, while grading is happening.
       "FLB_STR_WAIT_INSTR2" :  "S'il vous plaît patienter pendant que votre soumission est notée. Cela peut prendre quelques minutes.",

       // Asks user if they are sure they want to re-grade, if Grades sheet exists.
       "FLB_STR_REPLACE_GRADES_PROMPT" : "La notation existante va être remplacée. Etes-vous sûr de vouloir continuer?",

       // Window title for "Preparing to grade" window
       "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Préparation de la Notation",

       // Window title for "Please wait" window while grading occurs
       "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Notation de votre soumission",

       // Window title for "Grading Complete" window after grading occurs
       "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Notation terminée!",

       // Window title for grading Step 1
       "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Notation étape 1",

       // Window title for grading Step 2
       "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Notation étape 2",

       // "Grading Option" label that appears over first column in Step 1 of grading.
       "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Options de Notation",

       // "Question" label that appears over third column in Step 1 of grading.
       "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Question",

       // "Select" label that appears over radio button in first column of Step 2 of grading.
       "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Sélectionner",

       // "Submission Time" label that appears over second column in Step 2 of grading.
       "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Date d'envoi",

       // Label for "View Grades" button shown when grading completes.
       "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Voir la Notation",

       // Used for "summary" text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Résulats",

       // Used for report and report email. Ex: "Report for 'My Test'"
       "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Rapport pour",

       // Points Possible. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Points possibles",

       // Average Points. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Moyenne",

       // Counted Submissions. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Nombre de soumissions",

       // Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Question avec une notation inférieure à 70%",

       // Name of column in Grades sheet that has total points scored.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Total Points",

       // Name of column in Grades sheet that has score as percent.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Pourcentage",

       // Name of column in Grades sheet that has number of times student made a submission.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Nombre de soumissions",

       // Name of column in Grades sheet that indicates if grade was already emailed out.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Notations envoyées",

       // Name of column in Grades sheet that allows teacher to enter optional student feedback
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Commentaire pour les élèves (optionnel)",

       // Window title for emailing grades
       "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Courriel de Notation",

       // Instructions on how to email grades
       "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo peut envoyer à chaque élève de la classe les réponses correctes. Utiliser le menu déroulant pour sélectionner la question qui portait sur l’adresse de courriel des étudiants. Si les adresses n'ont pas été recueillies, alors vous ne serez pas en mesure d'envoyer correctement les courriels.",

       // Notice that grades cannot be emailed because the user has exceeded their daily quota.
       "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo ne peut pas envoyer par courriel les scores en ce moment parce que vous avez dépassé votre quota quotidien de courriels par jour. Ce quota est fixé par Google  pour tous les Add-ons. Merci d’essayer ultérieurement.",
    
       // Message about how many grade emails *have* been sent. This message is preceeded by a number.
       // Example: "5 grades were successfully emailed"
       "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : " notations ont été envoyées correctement",

       // Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
       "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : " notations n'ont pas été envoyées en raison d’adresses de courriels non valides ou inexistantes, ou parce qu'elles ont déjà été envoyées.",

       // Message about how many grade emails *have NOT* been sent.
       "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Aucune note n’a été envoyée par courriel, car aucune adresse valide n’a été trouvée ou parce que tous les élèves ont déjà reçus leur résultat.",    
    
       // Subject of the email students receive. Followed by assignment name.
       // Example: Here is your grade for "Algebra Quiz #6"
       "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Résultats du devoir :",

       // First line of email sent to students
       // Example: This email contains your grade for "Algebra Quiz #6"
       "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Ce courriel contient votre note pour",

       // Message telling students not to reply to the email with their grades
       "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Ne pas répondre à ce message",

       // Message that preceedes the student's grade
       "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Votre notation",

       // Message that preceedes the instructor's (optional) message in the email
       "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Message du professeur pour l'ensemble de la classe",

       // Message that preceedes the instructor's (optional) feedback for the student in the email
       "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Commentaire personnel de votre professeur",

       // Message that preceedes the summary of the student's information (name, date, etc)
       "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Résumé du devoir",

       // Message that preceedes the table of the students scores (no answer key sent)
       "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Ci-dessous votre résultat pour chaque question, avec la réponse correcte",

       // Message that preceedes the table of the students scores, and answer key
       "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Ci-dessous la note pour chaque question, avec la réponse correcte",

       // Header for the  column in the table of scores in the email which lists the question asked.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Question",

       // Header for the  column in the table of scores in the email which lists the student's answer.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Votre réponse",

       // Header for the  column in the table of scores in the email which lists the correct answer.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Réponse correcte",

       // Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Votre résultat",

       // Header for the  column in the table of scores in the email which lists the points possible (e.g. 5).
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Points Possibles",

       // Header for the  column in the table of scores in the email which lists the Help Tip (if provided)
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Aide pour cette question",

       // Label for "points" used in the new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "point(s)",

       // Label for "Correct" questions in new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Correct",

       // Label for "Incorrect" questions in new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Incorrect",

       // Footer for the email sent to students, advertising Flubaroo.
       "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Ce courrier à été envoyé par Flubaroo, c'est une application gratuite d'envoi de notation.",

       // Link at the end of the footer. Leads to www.flubaroo.com
       "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Visiter flubaroo.com",

       // Subject of the record email sent to the instructor, when grades are emailed to the class.
       // Followed by the assignment name.
       // e.g. Record of grades emailed for Algebra Quiz #6
       "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Enregistrement pour l'envoi de notation de",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the name of the assignment, in the summary table.
       "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Nom du devoir",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the number of emails sent, in the summary table.
       "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Nombre de courriels envoyés",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the number of graded submissions, in the summary table
       "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Nombre d'envois de Notation",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the average score in points (vs percent), in the summary table
       "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Moyenne (points)",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the points possible, in the summary table
       "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Nombre de points possibles",

       // Used in the record email sent to the instructor after she emails grades.
       // Indicated if an answer key was provided to the students, in the summary table
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Liste des questions envoyées",

       // Used in the record email sent to the instructor after she emails grades.
       // Value in summary table if answer key was NOT sent to students by instructor
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Non",

       // Used in the record email sent to the instructor after she emails grades.
       // Value in summary table if answer key WAS sent to students by instructor
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Oui",

       // Used in the record email sent to the instructor after she emails grades.
       // Message that preceeds what message the instructor email to her students.
       "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Vous avez également inclus ce message",

       // About Flubaroo message (1 of 2)
       "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo est un outil gratuit, qui permet aux enseignants de gagner du temps. Il permet de corriger, de noter des QCM de façon automatique et d’analyser les résultats.",

       // About Flubaroo message (2 of 2)
       "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Pour en savoir plus, visitez www.flubaroo.com. Vous pouvez aussi envoyer vos commentaires ou idées à feedback@flubaroo.com",

       // Message that appears when "Student Submissions" sheet cannot be located.
       "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo n'a pas pu déterminer la feuille qui contient les soumissions. Localiser cette feuille et la renommer:",

       // Message that appears when "Grades" sheet cannot be located.
       "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo n'a pas pu déterminer la feuille qui contient la notation. S'il vous plaît re-noter le devoir, ou localiser cette fiche,et la renommer:",

       // Menu option to grade assignment.
       "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Lancer la notation",

       // Menu option to re-grade assignment.
       "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Re-noter la soumission",

       // Menu option to email grades.
       "FLB_STR_MENU_EMAIL_GRADES" : "Envoyer les Notations",

       // Menu option to hide student feedback (hides the column)
       "FLB_STR_MENU_HIDE_FEEDBACK" : "Cacher les commentaires pour les élèves",

       // Menu option to edit student feedback (unhides the column)
       "FLB_STR_MENU_EDIT_FEEDBACK" : "Montrer les commentaires pour les élèves",

       // Menu option to hide help tips
       "FLB_STR_MENU_HIDE_HELP_TIPS" : "Cacher l'aide aux questions",

       // Menu option to edit help tips
       "FLB_STR_MENU_EDIT_HELP_TIPS" : "Montrer l'aide aux questions",

       // Menu option to view report.
       "FLB_STR_MENU_VIEW_REPORT" : "Voir le rapport",

       // Menu option to learn About Flubaroo.
       "FLB_STR_MENU_ABOUT" : "A propos de Flubaroo",

       // Menu option to choose the language.
       "FLB_STR_MENU_SET_LANGUAGE" : "Séléctionner la langue",

       // Word that appears on the "Continue" button in grading and emailing grades.
       "FLB_STR_BUTTON_CONTINUE" : "Continuer",

       // Name of "Student Submissions" sheet
       "FLB_STR_SHEETNAME_STUD_SUBM" :"Réponses élèves",  // gbl_subm_sheet_name

       // Name of "Grades" sheet
       "FLB_STR_SHEETNAME_GRADES" :"Notations", //gbl_grades_sheet_name

       // Text put in Grades sheet when a question isnt graded.
       "FLB_STR_NOT_GRADED" : "Non noté",

       // Message that is displayed when a new version of Flubaroo is installed.
       "FLB_STR_NEW_VERSION_NOTICE" : "Vous avez installé une nouvelle version Flubaroo! Visitez flubaroo.com blog pour voir ce qui est nouveau.",

       // Headline for notifications / alerts.
       "FLB_STR_NOTIFICATION" : "Notification de Flubaroo",

       // For emailing grades, question which asks user to identify email question.
       "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Sujet du courriel :  ", // note the space after ":"

       // For emailing grades, asks user if list of questions and scores should be sent.
       "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Inclure la liste des questions et le barême :  ", // note the space after ":"

       // For emailing grades, asks user if answer key should be sent...
       "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Inclure les réponses correctes: ", // note the space after ":"
      
       // For emailing grades, appears before text box for optional instructor message.
       "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Message à inclure dans Email (facultatif) :",

       // Window title for View Report window
       "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Rapport de Notation",

       // Title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Histogramme de Notations",

       // Y-Axis (vertical) title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Envoyer",

       // X-Axis (horizontal) title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Réponses correctes",

       // Label of "Email Me Report" button in View Report window
       "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Envoyer le rapport par courriel",

       // Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
       "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Le rapport à été envoyé à",
     
       "FLB_STR_RESULTS_TIP_READ_ARTICLE": "Cliquez <a target=_blank href=\"%s\"> ici </a> pour en savoir plus.",

        "FLB_STR_MENU_ADVANCED": "Avancé",

        "FLB_STR_MENU_ADV_OPTIONS": "Options avancées",

        "FLB_STR_MENU_ENABLE_AUTO_GRADE": "Activer Autograde",

        "FLB_STR_MENU_DISABLE_AUTO_GRADE": "Désactiver Autograde",

        "FLB_STR_MENU_SHOW_EMAIL_QUOTA": "Vérifiez le Quota Email",

        "FLB_STR_MENU_ENABLE": "Activer Flubaroo pour cette feuille",

        "FLB_STR_FLUBAROO_NOW_ENABLED": "Flubaroo a été activé pour cette feuille. Vous pouvez maintenant y accéder à partir du menu.",

        "FLB_STR_GRADING_CELL_MESSAGE": "Evaluation des dernières soumissions...",

        "FLB_STR_AUTOGRADE_IS_ON": "Autograde est activé. Flubaroo attend de nouvelles soumissions à évaluer. N’apporter aucun changements à ces feuilles jusqu'à ce qu’Autograde soit désactivé.",

        "FLB_STR_AUTOGRADE_IS_OFF": "Autograde a été désactivé.",

        "FLB_STR_AUTOGRADE_GRADE_RECENT": "Des demandes récentes doivent encore être évaluées. Voulez-vous que Flubaroo les évalue avant d’activer Autograde?",

        "FLB_STR_AUTOGRADE_SETUP": "Avant d'activer Autograde vous devez d'abord configurer vos paramètres d’évaluation et d’email. Cliquez sur 'OK' pour continuer.",

        "FLB_STR_AUTOGRADE_UPDATE": "Avant d'activer Autograde, aimeriez-vous mettre à jour vos paramètres d’évaluation et d’email ?",

        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE": "Options avancées",

        "FLB_STR_ADV_OPTIONS_NOTICE": "Modifier ces paramètres uniquement si vous avez lu les rubriques correspondantes de l'aide",

        "FLB_STR_ADV_OPTIONS_NO_NOREPLY": "Lors de l’envoi de notations, utiliser mon adresse courriel de retour, plutôt que l'adresse noreply de @.",

        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK": "Lors de la soumission, auto-email à l'étudiant un lien pour modifier rapidement ses réponses.",

        "FLB_STR_ADV_OPTIONS_PASS_RATE": "Pourcentage en dessous duquel l’info étudiant est surlignée en rouge:",

        "FLB_STR_EMAIL_QUOTA_MSG": "Vous avez de nombreux courriels disponibles dans votre quota quotidien:",

        "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Des points",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "Vous devez sélectionner au moins une question qui identifie un étudiant avant de continuer.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "Vous devez sélectionner au moins une question à évaluer.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Vous devez sélectionner une clé de réponse avant de continuer.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Classement normal",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Évaluation manuelle (Nouveau!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "Autograde ne peut pas être activé parce que vous avez une ou plusieurs questions qui sont doivent être évaluées à la main.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "Vous avez sélectionné une ou plusieurs questions à évaluer à la main. Mais l’évaluation ne peut pas être effectuée parce que certaines de ces questions ne sont pas distinctes l'une de l'autre. Par exemple, vous pouvez avoir deux questions toutes deux intitulées \"Question\". S'il vous plaît modifier le titre de ces questions dans la Rangée 1 de sorte qu'elles soient uniques (ie \"Question 1\" et \"Question 2\"), puis essayez à nouveau l’évaluation.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Évaluation manuelle",

        "FBL_STR_MANUAL_GRADING_INSTR": "Utiliser les commandes ci-dessous pour attribuer des notes à la main. Noter que cela ne fonctionne correctement que sur les questions pour lesquelles vous avez sélectionné \"Évaluation manuelle\" à l'étape 1 du classement.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "Etat des questions évaluées manuellement",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "Pas de points attribués",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Observations faites par votre professeur",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Flubaroo - Etat des questions évaluées manuellement",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Sélectionnez l'étudiant:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Sélectionnez Question:",

        "FLB_STR_MANUAL_GRADING_STEP3": "3. Lire la soumissiom de l'étudiant:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Entrez les notes de l'étudiant (envoyé par courrier électronique):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "examen clé de réponse",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Attribuer la note.",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "En cours d’éxécution.",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "La note a été attribuée.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "S'il vous plaît entrer une note valide.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Une erreur s'est produite.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "Fermer",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "Autograde est actuellement en train de corriger une ou plusieurs nouvelles soumissions et ne peut donc pas être désactivé. Essayez à nouveau prochainement.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Aucune feuille d’évaluation n'a étée créé, car aucune soumission valide n’a été trouvée.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Feuille de Notation corrompue - Vous ne pouvez pas continuer",

        "FLB_STR_INVALID_GRADES_SHEET": "<p>Flubaroo ne peut pas continuer parce que votre feuille de Notation a été corrompue. Avez-vous peut-être supprimé des lignes, des colonnes ou d'autres données de la feuille de Notation après la dernière évaluation?</ P> <p> Voir <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> cet article </a> de l'aide. </ p>",

        "FLB_STR_DO_NOT_DELETE_MSG": "Pour assurer le bon fonctionnement de FLUBAROO, ne pas supprimer des lignes ou des colonnes dans CETTE FICHE",

        "FLB_STR_GRADES_SHARE_LABEL": "Méthode de partage des Notations :",

        "FLB_STR_GRADES_SHARE_EMAIL": "Partager par email (typique)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Partager par Google Drive (aucun e-mail)",

        "FLB_STR_GRADES_SHARE_BOTH": "Partager par email et par Google Drive",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "Flubaroo - Notations Partagées",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Notation pour",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Cliquez ici pour voir ce rapport de Notation dans Google Drive",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - Imprimer les Notations",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo va créer un document Google unique contenant les Notations pour tous les étudiants que vous pouvez ensuite imprimer et distribuer. Vous pouvez spécifier un message à inclure dans chaque document, et aussi inclure la liste des questions et / ou les réponses correctes.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Partager Grades",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo peut partager avec chaque élève leur Notation par email, Google Drive, ou les deux. Utilisez le menu déroulant pour sélectionner la question qui demandait aux élèves leur adresse e-mail. Si les adresses e-mail ne sont pas recueillies, alors vous ne serez pas en mesure de partager les Notations.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "Un document Google a été créé contenant toutes les notes des étudiants. Cliquez sur le nom de fichier ci-dessous pour l'ouvrir. Puis imprimer et remettre à chaque élève son impression.",

        "FLB_STR_MENU_SHARE_GRADES": "Partager Grades",

        "FLB_STR_MENU_PRINT_GRADES": "Imprimer Grades",
     
        "FBL_STR_PRINT_GRADES_TITLE_PRE": "Relevé de note pour :",

        "FLB_STR_GRADING_OPT_EXTRA_CREDIT": "Notation extra",

        "FLB_STR_ADV_OPTIONS_EXTRA_CREDIT": "Permet une notation extra lors de l'attribution des points aux questions",

        "FLB_STR_ADV_OPTIONS_ADDITIONAL_GOPTS": "Afficher les options de classement supplémentaires à l'étape 1",

        "FLB_STR_AUTOGRADE_NOT_SUMMARIZED": "En raison de vos réglages de notation automatique, cette fiche peut contenir plus d’une soumission notée par étudiant",

        "FLB_STR_ADV_OPTIONS_AG_WITH_SUMMARY": "La notation automatique traitera la soumission la plus récente d’un étudiant (voir<a target=\"_blank\" href=\"" + FLB_AUTOGRADE_SELECT_MODE_URL + "\">this article</a>).",

        "FLB_STR_ADV_OPTIONS_MGR_ADV_QUESTION": "Lorsque vous utilisez \"Notation manuelle \", il avance automatiquement à  la question suivante (au lieu du prochain étudiant)",

        "FLB_STR_MENU_EXPAND_FORMULAS": "Développer les formules personnalisées",

        "FLB_STR_GRADING_OPT_IGNORE": "Ignorer",

        "FLB_STR_GRADING_OPT_COPY_FOR_REFERENCE": "Copie pour référence",

        "FLB_STR_TIP_MSG_NUMBER_1": "<b> Flubaroo Astuce n ° 1: </ b> Flubaroo peut accepter plus d'une réponse correcte.",

        "FLB_STR_TIP_MSG_NUMBER_2": "<b> Flubaroo Astuce n ° 2: </ b> Flubaroo peut évaluer des valeurs numériques pour les formulaires de  science et de mathématiques.",

        "FLB_STR_TIP_MSG_NUMBER_3": "<b> Flubaroo Astuce n ° 3: </ b> Chien ou chien? Réponses sensibles à la casse.",

        "FLB_STR_TIP_MSG_NUMBER_4": "<b> Flubaroo Astuce n ° 4: </ b> Vous voulez changer la valeur par défaut de 70% note de passage?",

        "FLB_STR_TIP_MSG_NUMBER_5": "<b> Flubaroo Astuce n ° 5: </ b> Besoin de vérifier votre quota de courriel restant?",

        "FLB_STR_TIP_MSG_NUMBER_6": "<b> Flubaroo Conseil n ° 6: </ b> Vous voulez que vos formulaires soient évalués automatiquement?",

        "FLB_STR_TIP_MSG_NUMBER_7": "<b> Flubaroo Conseil n ° 7: </ b> Vous avez des questions? Nous avons les réponses dans notre FAQ!",
        
        "FLB_STR_TIP_MSG_NUMBER_8": "<b>Flubaroo Conseil #8:</b> Vous avez Google Education? Collecter les emails automatiquement!",

        "FLB_STR_TIP_MSG_NUMBER_9": "<b>Flubaroo Conseil #9:</b> Vous ne pouvez pas partager vos notations par courriel? Partagez via Google Drive!",

        "FLB_STR_TIP_MSG_NUMBER_10": "<b>Flubaroo Conseil #10:</b> Vous voulez une copie papier de notes de vos élèves? Apprenez à les imprimer!!",
   },
   // END FRENCH //////////////////////////////////////////////////////////////////////////////////

   // START FRENCH CANADIAN //////////////////////////////////////////////////////////////////
   // Vous pouvez traduire tout ce qui n'est pas en majuscule. 
   // Tous les textes précédés par // sont des commentaires. Ils ne sont pas prioritaires.
   // Merci de nous aider à traduire ce script. 
   //
   // Traducteurs : Pascal Lapalme et Jean Desjardins. Guylaine Duranceau, Audrey-Anne Ross et Roxanne Roy ont contribué à adapter les versions plus récentes. 
   //
   // Version française (Canada)
   //
   ///////////////////////////////////////////////////////////////////////////////////////////
    "fr-CA": {
        // Name to identify language in language selector
        "FLB_LANG_IDENTIFIER": "Français (Canada)",

        // Grading option which identifies a student
        "FLB_STR_GRADING_OPT_STUD_ID" : "Identification de l’élève",

        // Grading option which tells Flubaroo to skip grading on a question
        "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Ne pas noter",

        // Message shown when grading is complete (1 of 2).
        "FLB_STR_RESULTS_MSG1" : "Correction terminée! Une nouvelle feuille appelée « Résultats » a été créée plus bas. Cette feuille contient les résultats de chaque élève ainsi qu'un sommaire. ** Note: La feuille 'Résultats' ne devrait pas être modifiée. Cela pourrait interférer avec l'envoi par courriel des résultats. Si vous avez besoin de le faire, copiez la feuille et modifiez la copie.",

        // Message shown when grading is complete (2 of 2).
        "FLB_STR_RESULTS_MSG2" : "Conseils : La dernière ligne montre le pourcentage des élèves qui ont réussi chaque question. Les questions les plus ratées sont en surbrillance orange. De plus, les noms des élèves qui ont eu moins de 70% sont en rouge",

        // Instructions shown on Step 1 of grading.
        "FBL_STR_STEP1_INSTR" : "Veuillez choisir l’option de notation la meilleure pour chaque question de votre test. Flubaroo a essayé de le déterminer pour vous, mais vous êtes l’humain derrière la machine!",

        // Instructions shown on Step 2 of grading.
        "FBL_STR_STEP2_INSTR" : "Veuillez choisir quelle entrée au formulaire servira de clé de correction. Habituellement, cela sera une réponse que vous aurez soumise vous-même. Flubaroo fonctionne en comparant les cases avec la clé.",

        // Message shown if not enough submissions to perform grading.
        "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Il doit y avoir au minimum deux entrées pour effectuer la correction. Essayez plus tard lorsque d'autres élèves auront envoyé leurs réponses.",

        // Please wait" message first shown when Flubaroo is first examining assignment.
        "FLB_STR_WAIT_INSTR1" : "Flubaroo examine votre test. Veuillez patienter...",

        // Please wait" message shown after Step 1 and Step 2, while grading is happening.
        "FLB_STR_WAIT_INSTR2" :  "Merci de patienter pendant que votre test se corrige. Ceci peut prendre quelques instants.",

        // Asks user if they are sure they want to re-grade, if Grades sheet exists.
        "FLB_STR_REPLACE_GRADES_PROMPT" : "Ceci va remplacer vos notes existantes. Est-ce bien ce que vous voulez?",

        // Window title for "Preparing to grade" window
        "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - En préparation pour la correction",

        // Window title for "Please wait" window while grading occurs
        "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Correction de votre test",

        // Window title for "Grading Complete" window after grading occurs
        "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Correction complétée",

        // Window title for grading Step 1
        "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Classement Étape 1",

        // Window title for grading Step 2
        "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Classement Étape 2",

        // "Grading Option" label that appears over first column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Options de classement",

        // "Question" label that appears over third column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Question",

        // "Select" label that appears over radio button in first column of Step 2 of grading.
        "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Choisir",

        // "Submission Time" label that appears over second column in Step 2 of grading.
        "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Horodateur",

        // Label for "View Grades" button shown when grading completes.
        "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Voir les résultats",

        // Used for "summary" text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Sommaire",

        // Used for report and report email. Ex: "Report for 'My Test'"
        "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Résultat pour",

        // Points Possible. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Points maximum",

        // Average Points. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Moyenne",

        // Counted Submissions. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Nombre de formulaires reçus corrigés",

        // Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Nombre de questions à faible pointage",

        // Name of column in Grades sheet that has total points scored.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Résultat",

        // Name of column in Grades sheet that has score as percent.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Pourcentage",

        // Name of column in Grades sheet that has number of times student made a submission.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Nombre de soumissions",

        // Name of column in Grades sheet that indicates if grade was already emailed out.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Courriel envoyé?",

        // Name of column in Grades sheet that allows teacher to enter optional student feedback
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Rétroaction à l’élève (optionel)",

        // Window title for emailing grades
        "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Envoyer les résultats par courriel",

        // Instructions on how to email grades
        "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo peut envoyer un courriel à chaque élève, de même que les réponses. Identifiez la question pour laquelle vous avez demandé les courriels. Si l’adresse est incomplète ou invalide, les envois ne fonctionneront pas.",

        // Notice that grades cannot be emailed because the user has exceeded their daily quota.
        "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo ne peut envoyer les courriels parce que vous avez dépassé la limite d’envoi quotidien que fixe Google aux modules externes comme Flubaroo. Merci de réessayer demain.",
      
        // Message about how many grade emails *have* been sent. This message is preceeded by a number.
        // Example: "5 grades were successfully emailed"
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "Les notes et rétroactions ont été acheminées correctement",

        // Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "Les notes n’ont pas été envoyées, car l’adresse de courriel est absente ou invalide, ou parce que les notes ont déjà été envoyées.",

        // Message about how many grade emails *have NOT* been sent.
        "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Aucun envoi n’a été effectué, soit parce que Flubaroo n’a pas trouvé d’adresse courriel valide, parce que votre quota d’envoi quotidien a été atteint ou encore parce que les élèves les avaient déjà reçus. Si vous voulez les renvoyer, effacez le x dans la case de la feuille des résultats",     
      
        // Subject of the email students receive. Followed by assignment name.
        // Example: Here is your grade for "Algebra Quiz #6"
        "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Voici votre résultat pour",

        // First line of email sent to students
        // Example: This email contains your grade for "Algebra Quiz #6"
        "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Ce courriel contient votre résultat pour",

        // Message telling students not to reply to the email with their grades
        "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Ne répondez pas à ce courriel",

        // Message that preceedes the student's grade
        "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Votre résultat",

        // Message that preceedes the instructor's (optional) message in the email
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Voici un message de l'enseignant(e), envoyé à tous",

        // Message that preceedes the instructor's (optional) feedback for the student in the email
        "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Votre enseignant(e) vous destine ce message à vous en particulier",

        // Message that preceedes the summary of the student's information (name, date, etc)
        "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Sommaire de votre soumission",

        // Message that preceedes the table of the students scores (no answer key sent)
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Vous trouverez ci-dessous, vos notes pour chaque question",

        // Message that preceedes the table of the students scores, and answer key
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "En plus de la bonne réponse, vous trouverez votre résultat pour chacune des questions", 

        // Header for the  column in the table of scores in the email which lists the question asked.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Question",

        // Header for the  column in the table of scores in the email which lists the student's answer.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Votre réponse",

        // Header for the  column in the table of scores in the email which lists the correct answer.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Bonne réponse",

        // Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Votre résultat",

        // Header for the  column in the table of scores in the email which lists the points possible (e.g. 5).
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Résultat maximal",

        // Header for the  column in the table of scores in the email which lists the Help Tip (if provided)
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Aide pour cette question",

        // Label for "points" used in the new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "point(s)",

        // Label for "Correct" questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Bonne réponse",

        // Label for "Incorrect" questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Mauvaise réponse",

        // Footer for the email sent to students, advertising Flubaroo.
        "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Ce courriel a été généré par Flubaroo pour les formulaires Google, un outil gratuit de correction et de rétroaction.",

        // Link at the end of the footer. Leads to www.flubaroo.com
        "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Visitez flubaroo.com",

        // Subject of the record email sent to the instructor, when grades are emailed to the class.
        // Followed by the assignment name.
        // e.g. Record of grades emailed for Algebra Quiz #6
        "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Résultats envoyés par courriel pour",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the name of the assignment, in the summary table.
        "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Nom du devoir ou du travail",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the number of emails sent, in the summary table.
        "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Nombre de courriels envoyés",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the number of graded submissions, in the summary table
        "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Nombre de copies notées soumises",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the average score in points (vs percent), in the summary table
        "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Résultat moyen (points)",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the points possible, in the summary table
        "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Note maximale",//à revoir selon le contexte

        // Used in the record email sent to the instructor after she emails grades.
        // Indicated if an answer key was provided to the students, in the summary table
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Avez-vous fourni les réponses?",

        // Used in the record email sent to the instructor after she emails grades.
        // Value in summary table if answer key was NOT sent to students by instructor
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Non",

        // Used in the record email sent to the instructor after she emails grades.
        // Value in summary table if answer key WAS sent to students by instructor
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Oui",

        // Used in the record email sent to the instructor after she emails grades.
        // Message that preceeds what message the instructor email to her students.
        "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Vous avez aussi inclus ce message",

        // About Flubaroo message (1 of 2)
        "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo est gratuit et vous permet de gagner du temps. Il corrige des questions simples, analyse les résultats et donne une rétroaction aux élèves",

        // About Flubaroo message (2 of 2)
        "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Pour en apprendre plus, il y a www.flubaroo.com.",

        // Message that appears when "Student Submissions" sheet cannot be located.
        "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo ne peut déterminer quelle feuille contient les soumissions des élèves.  Veuillez trouver cette feuille et la renommer: ",

        // Message that appears when "Grades" sheet cannot be located.
        "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo ne peut déterminer quelle feuille contient les notes.  Veuillez noter le travail, ou trouver cette feuille et la renommer: ",

        // Menu option to grade assignment.
        "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Corriger le formulaire",

        // Menu option to re-grade assignment.
        "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Corriger le formulaire à nouveau",

        // Menu option to email grades.
        "FLB_STR_MENU_EMAIL_GRADES" : "Envoyer le courriel des résulats",

        // Menu option to hide student feedback (hides the column)
        "FLB_STR_MENU_HIDE_FEEDBACK" : "Cacher les rétroactions individuelles",

        // Menu option to edit student feedback (unhides the column)
        "FLB_STR_MENU_EDIT_FEEDBACK" : "Colonne des rétroactions individuelles",

        // Menu option to hide help tips
        "FLB_STR_MENU_HIDE_HELP_TIPS" : "Cacher les rétroactions des questions",

        // Menu option to edit help tips
        "FLB_STR_MENU_EDIT_HELP_TIPS" : "Ligne des rétroactions pour les questions ratées",

        // Menu option to view report.
        "FLB_STR_MENU_VIEW_REPORT" : "Consulter le rapport",

        // Menu option to learn About Flubaroo.
        "FLB_STR_MENU_ABOUT" : "À propos Flubaroo",

        // Menu option to choose the language.
        "FLB_STR_MENU_SET_LANGUAGE" : "Choisir la langue",

        // Word that appears on the "Continue" button in grading and emailing grades.
        "FLB_STR_BUTTON_CONTINUE" : "Continuer",

        // Name of "Student Submissions" sheet
        "FLB_STR_SHEETNAME_STUD_SUBM" :"Réponses élèves",  // gbl_subm_sheet_name

        // Name of "Grades" sheet
        "FLB_STR_SHEETNAME_GRADES" :"Notations", //gbl_grades_sheet_name

        // Text put in Grades sheet when a question isnt graded.
        "FLB_STR_NOT_GRADED" : "Non évalué",

        // Message that is displayed when a new version of Flubaroo is installed.
        "FLB_STR_NEW_VERSION_NOTICE" : "Vous avez installé une nouvelle version de Flubaroo! Visitez flubaroo.com/blog pour plus de détails.",

        // Headline for notifications / alerts.
        "FLB_STR_NOTIFICATION" : "Notification de Flubaroo",

        // For emailing grades, question which asks user to identify email question.
        "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Question d’adresse de courriel ", // note the space after ":"

        // For emailing grades, asks user if list of questions and scores should be sent.
        "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Inclure la liste des questions et des résultats: ", // note the space after ":"

        // For emailing grades, asks user if answer key should be sent...
        "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Inclure la clé de correction: ", // note the space after ":"
        
        // For emailing grades, appears before text box for optional instructor message.
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Rétroaction au groupe (optionnel):",

        // Window title for View Report window
        "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Résultats",

        // Title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Histogramme des résultats",

        // Y-Axis (vertical) title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Effectif",

        // X-Axis (horizontal) title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Points obtenus",

        // Label of "Email Me Report" button in View Report window
        "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Envoyez-moi les résultats",

        // Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
        "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Les résultats ont été envoyés à",

        "FLB_STR_MENU_ADVANCED": "Avancée",

        "FLB_STR_MENU_ADV_OPTIONS": "Options avancées",

        "FLB_STR_MENU_ENABLE_AUTO_GRADE": "Activer la correction instantanée",

        "FLB_STR_MENU_DISABLE_AUTO_GRADE": "Désactiver la correction instantanée",

        "FLB_STR_MENU_SHOW_EMAIL_QUOTA": "Vérifiez combien reste-t-il de courriels à votre quota Google",

        "FLB_STR_MENU_ENABLE": "Activer Flubaroo",

        "FLB_STR_FLUBAROO_NOW_ENABLED": "Flubaroo a été activé pour ce formulaire. Vous pouvez maintenant y accéder à partir du menu.",

        "FLB_STR_GRADING_CELL_MESSAGE": "Correction des plus récents formulaires...",

        "FLB_STR_AUTOGRADE_IS_ON": "La correction instantanée est activée. Flubaroo attend les copies. N’apportez pas de changements aux feuilles jusqu'à ce que vous l’ayez désactivée.",

        "FLB_STR_AUTOGRADE_IS_OFF": "La correction instantanée a été désactivée.",

        "FLB_STR_AUTOGRADE_GRADE_RECENT": "Des entrées récentes pourraient être évaluées. Aimeriez-vous le faire avant d’activer la correction instantanée?",

        "FLB_STR_AUTOGRADE_SETUP": "Avant d'activer la correction instantanée, vous devez d'abord configurer vos paramètres de notation et de courriel. Cliquez 'OK' pour continuer.",

        "FLB_STR_AUTOGRADE_UPDATE": "Avant d'activer la correction instantanée, aimeriez-vous mettre à jour votre clef de correction et votre adresse de messagerie électronique?",

        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE": "Options avancées",

        "FLB_STR_ADV_OPTIONS_NOTICE": "Il est conseilleé de ne modifier ces paramètres que si vous avez lu les articles d'aide correspondants",

        "FLB_STR_ADV_OPTIONS_NO_NOREPLY": "Pour permettre les échanges, utilisez mon adresse courriel à l’envoi des résultats, plutôt que l’adresse anonymisée standard.",

        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK": "Lien de modification: Lorsqu’il soumet son formulaire, envoyer automatiquement un lien à l'élève par courriel pour le laisser rapidement modifier sa réponse.",

        "FLB_STR_ADV_OPTIONS_PASS_RATE": "Pourcentage en dessous duquel les infos de l’élève sont en surbrillance rouge:",

        "FLB_STR_EMAIL_QUOTA_MSG": "Il vous reste de nombreux courriels inutilisés dans votre quota Google quotidien:",

        "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Des points",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "Vous devez sélectionner au moins une question qui identifie un élève avant de continuer.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "Vous devez sélectionner au moins une question à évaluer.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Vous devez sélectionner une clé de réponse avant de continuer.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Classement normal",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Attribuer les résultats à la main (nouveau!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "La correction instantanée ne peut pas être activée parce que vous avez choisi qu’une ou plusieurs questions à être «évaluées à la main».",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "Vous avez sélectionné une ou plusieurs questions à être corrigées à la main. Le classement ne peut par contre pas continuer parce que certaines de ces questions ne sont pas distinctes. Par exemple, vous ne pouvez pas avoir deux questions à la fois intitulées \"Question\". S'il vous plaît, modifier le texte de ces questions dans la rangée 1 de sorte qu'elles soient uniques (c-à-d \"Question 1\" et \"Question 2\"), puis essayez à nouveau.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Évaluer à la main",

        "FBL_STR_MANUAL_GRADING_INSTR": "Utilisez les commandes ci-dessous pour attribuer des points manuellement. Notez que cela ne fonctionne correctement qu’aux questions pour lesquelles vous avez sélectionné \"Évaluer à la main\" à l'étape 1 du classement.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "État de l’évaluation manuelle",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "Pas de points attribués",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Observations faites par votre enseignant.e",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Flubaroo - État de l’évaluation manuelle",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Sélectionnez l’élève:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Sélectionnez la question:",

        "FLB_STR_MANUAL_GRADING_STEP3": "3. Évaluer en lisant ou en regardant:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Entrez les notes de l’élève (envoyées par courriel):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "Consulter la clé de réponse",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Déterminez la note",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "Flubaroo travaille...",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "Les résultats ont été attribués.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "S'il-vous-plaît, entrez un résultat valide.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Une erreur s'est produite.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "Fermer",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "La correction instantanée corrige actuellement une ou plusieurs nouvelles copies et ne peut donc pas être désactivée. Essayez à nouveau.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Aucune feuille de correction n'a pas été créé, car aucune soumission d’élève n'a été trouvée.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Grades corrompus Fiche - Vous ne pouvez pas Continuer",

        "FLB_STR_INVALID_GRADES_SHEET": "<p> Flubaroo ne peut pas continuer parce que votre feuille de résultats a été corrompue. Peut-être avez-vous supprimé des lignes, des colonnes ou d'autres données de la feuille de notes après avoir reçu le dernier classement?</ P> <p> Voir <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> cet article </a> de l'aide. </ p>",

        "FLB_STR_DO_NOT_DELETE_MSG": "Pour assurer des fonctions FLUBAROO correctement, ne pas supprimer des lignes ou des colonnes dans CETTE FICHE",

        "FLB_STR_GRADES_SHARE_LABEL": "Mode de partage des résultats:",

        "FLB_STR_GRADES_SHARE_EMAIL": "Partager par courriel (comme avant)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Partager par Google Drive",

        "FLB_STR_GRADES_SHARE_BOTH": "Partager par courriel et par Google Drive",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "Flubaroo - Résultats",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Notes imprimables pour:",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Cliquez ici pour voir ce rapport de notes dans Google Drive",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - Imprimer les résultats",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo va créer un document Google unique contenant les résultats pour tous les élèves que vous pourrez ensuite imprimer et distribuer. Vous pouvez spécifier un message à inclure dans chaque document. Vous avez aussi l'opportunité d'inclure la liste des questions et / ou les réponses correctes.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Partager Grades",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo peut partager avec chaque élève leur résultats par courriel, Google Drive, ou les deux. Utilisez le menu déroulant pour sélectionner la question qui demandait aux élèves leurs adresses courriel. Si les adresses courriel ne sont pas recueillies, alors vous ne serez pas en mesure de partager les résultats.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "Un document Google a été créé contenant toutes les notes des étudiants. Cliquez sur le nom de fichier ci-dessous pour l'ouvrir. Puis imprimez et remettez ensuite leur impression à chaque élève.",

        "FLB_STR_MENU_SHARE_GRADES": "Partager les résultats",

        "FLB_STR_MENU_PRINT_GRADES": "Imprimer les résultats",

        "FLB_STR_TIP_MSG_NUMBER_1": "<b> Flubaroo Astuce n ° 1: </ b> Flubaroo peut accepter plus d'une réponse correcte.",

        "FLB_STR_TIP_MSG_NUMBER_2": "<b> Flubaroo Astuce n ° 2: </ b> En science et en mathématiques, Flubaroo peut traiter une intervalle numérique.",

        "FLB_STR_TIP_MSG_NUMBER_3": "<b> Flubaroo Astuce n ° 3: </ b> CHAT vs chat? Corriger les réponses majuscules.",

        "FLB_STR_TIP_MSG_NUMBER_4": "<b> Flubaroo Astuce n ° 4: </ b> Vous voulez changer la valeur de 70% des notes de passage Flubaroo?",

        "FLB_STR_TIP_MSG_NUMBER_5": "<b> Flubaroo Astuce n ° 5: </ b> Besoin de vérifier votre quota de courriel restant?",

        "FLB_STR_TIP_MSG_NUMBER_6": "<b> Flubaroo Conseil n ° 6: </ b> Vous voulez corriger automatiquement?",

        "FLB_STR_TIP_MSG_NUMBER_7": "<b> Flubaroo Conseil n ° 7: </ b> Vous avez des questions? Nous avons les réponses dans notre FAQ!",      
    },
    // END FRENCH CANADIAN ////////////////////////////////////////////////////////////////////////////
  

	// START HEBREW////////////////////////////////////////////////////////////////////////////////
	"he-il": {
	  // Name to identify language in language selector
	  "FLB_LANG_IDENTIFIER": "עברית (Hebrew)",

	  // Grading option which identifies a student
	  "FLB_STR_GRADING_OPT_STUD_ID" : "מזהה תלמיד",

	  // Grading option which tells Flubaroo to skip grading on a question
	  "FLB_STR_GRADING_OPT_SKIP_GRADING" : "ללא ניקוד",

	  // Message shown when grading is complete (1 of 2).
	  "FLB_STR_RESULTS_MSG1" : "הבדיקה הושלמה בהצלחה! נוצר גיליון נתונים חדש בשם ‘ציונים’. גיליון זה כולל בתוכו ציון לכל מענה שנשלח לבחינה, וסיכום של כל הציונים בראשית הגיליון. **הערה: הגיליון ‘ציונים’ אינו מיועד לעריכה בשום אופן, משום שזו עלולה לפגום ביכולתך לשלוח ציונים בדוא’’ל. אם ברצונך לשנות גיליון זה, אנא צור העתק וערוך את ההעתק שיצרת.",

	  // Message shown when grading is complete (2 of 2).
	  "FLB_STR_RESULTS_MSG2" : "טיפ: השורה האחרונה בתחתית הגיליון מציגה את אחוז התלמידים שענו נכונה בכל שאלה ושאלה, כשהשאלות שבהן טעו רבים מהתלמידים מסומנות בכתום. בנוסף, תלמידים שקיבלו ציון כללי הנמוך מ70% יסומנו בגופן בצבע אדום.",

	  // Instructions shown on Step 1 of grading.
	  "FBL_STR_STEP1_INSTR" : "אנא בחר אפשרות לציון עבור כל שאלה במטלת הביצוע. פלובארו עשה את המיטב כדי לנחש את האפשרות המתאימה ביותר עבורך, אך מומלץ שתבדוק את האפשרויות שנבחרו עבור כל שאלה בעצמך.",

	  // Instructions shown on Step 2 of grading.
	  "FBL_STR_STEP2_INSTR" : "אנא בחר איזו מטלת ביצוע תשמש כמפתח התשובות. בדרך-כלל, זו תהיה מטלה שהוגשה על-ידיך. כל המטלות האחרות שהוגשו ייבחנו בהשוואה אל מפתח התשובות, כך שמומלץ לשים לב ולבחור את המטלה הנכונה.",

	  // Message shown if not enough submissions to perform grading.
	  "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "חובה להגיש לפחות שתי מטלות ביצוע כדי לבצע את תהליך הבחינה. אנא נסה שוב לאחר שתלמידים נוספים יגישו את מטלותיהם.",

	  // Please wait" message first shown when Flubaroo is first examining assignment.
	  "FLB_STR_WAIT_INSTR1" : "פלובארו סורק את מטלת הביצוע שלך. אנא המתן...",

	  // Please wait" message shown after Step 1 and Step 2, while grading is happening.
	  "FLB_STR_WAIT_INSTR2" : "אנא המתן בזמן שתשובות התלמידים נבדקות. תהליך זה עשוי להימשך כמה דקות.",

	  // Asks user if they are sure they want to re-grade, if Grades sheet exists.
	  "FLB_STR_REPLACE_GRADES_PROMPT" : "הערכה מחדש תחליף את הציונים הקיימים במערכת כעת. האם אתה בטוח שברצונך להמשיך?",

	  // Window title for "Preparing to grade" window
	  "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "פלובארו - מתכונן להערכה",

	  // Window title for "Please wait" window while grading occurs
	  "FLB_STR_GRADING_WINDOW_TITLE" : "פלובארו - מדרג את מטלת הביצוע",

	  // Window title for "Grading Complete" window after grading occurs
	  "FLB_STR_GRADING_COMPLETE_TITLE" : "פלובארו - התהליך הושלם בהצלחה",

	  // Window title for grading Step 1
	  "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "פלובארו - תהליך הערכה שלב 1",

	  // Window title for grading Step 2
	  "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "פלובארו - תהליך הערכה שלב 2",

	  // "Grading Option" label that appears over first column in Step 1 of grading.
	  "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "אפשרות הערכה",

	  // "Question" label that appears over third column in Step 1 of grading.
	  "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "שאלה",

	  // "Select" label that appears over radio button in first column of Step 2 of grading.
	  "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "בחר כפתור",

	  // "Submission Time" label that appears over second column in Step 2 of grading.
	  "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "מועד ההגשה",

	  // Label for "View Grades" button shown when grading completes.
	  "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "צפה בציונים",

	  // Used for "summary" text shown at top of Grades sheet, and in report.
	  "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "סיכום",

	  // Used for report and report email. Ex: "Report for 'My Test'"
	  "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "דיווח תוצאות עבור",

	  // Points Possible. Used for text shown at top of Grades sheet, and in report.
	  "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "ניקוד אפשרי",

	  // Average Points. Used for text shown at top of Grades sheet, and in report.
	  "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "ניקוד ממוצע",

	  // Counted Submissions. Used for text shown at top of Grades sheet, and in report.
	  "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "מספר המטלות שהוגשו",

	  // Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
	  "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "מספר השאלות בעלות ממוצע נמוך",

	  // Name of column in Grades sheet that has total points scored.
	  "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "ניקוד סופי",

	  // Name of column in Grades sheet that has score as percent.
	  "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "ציון באחוזים",

	  // Name of column in Grades sheet that has number of times student made a submission.
	  "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "מספר הפעמים שהגיש",

	  // Name of column in Grades sheet that indicates if grade was already emailed out.
	  "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "נשלח דיווח בדוא’’ל?",

	  // Name of column in Grades sheet that allows teacher to enter optional student feedback
	  "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "(לא חובה) משוב אישי לתלמיד",

	  // Window title for emailing grades
	  "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "פלובארו - שליחת ציונים בדוא’’ל",

	  // Instructions on how to email grades
	  "FLB_STR_EMAIL_GRADES_INSTR" : "פלובארו יכול לשלוח ציונים בדואר האלקטרוני לכל תלמיד שנבחן במטלת הביצוע, וכן להציג בפניהם את התשובות הנכונות. השתמש בתפריט הנגלל כדי לבחור את השאלה שבה ביקשת מהתלמידים להזין את כתובת הדואר האלקטרוני שלהם. אם כתובת הדואר האלקטרוני לא הוזנה במבחן, אין באפשרותך לשלוח ציונים בדואר האלקטרוני.",

	  // Notice that grades cannot be emailed because the user has exceeded their daily quota.
	  "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "פלובארו אינו יכול לשלוח את הציונים בדואר האלקטרוני משום שחצית את המגבלה היומית שלך של הודעות דואר יוצא ביום. המגבלה הזו נקבעת על-ידי גוגל עבור כל התוספים. אנא נסה שנית במועד מאוחר יותר.",

	  // Message about how many grade emails *have* been sent. This message is preceeded by a number.
	  // Example: "5 grades were successfully emailed"
	  "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "ציונים נשלחו בהצלחה",

	  // Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
	  "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "ציונים אינם נשלחו בהצלחה משום שכתובת הדואר האלקטרוני אינה תקינה או שלא הוזנה, או משום שהציונים כבר נשלחו לפני כן.",

	  // Message about how many grade emails *have NOT* been sent.
	  "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "אף ציון אינו נשלח בדואר האלקטרוני משום שלא נמצאה כתובת דואר תקינה בתשובות התלמידים, או משום שכל התלמידים כבר קיבלו את הציונים שלהם בדואר האלקטרוני לפני כן.",

	  // Subject of the email students receive. Followed by assignment name.
	  // Example: Here is your grade for "Algebra Quiz #6"
	  "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "להלן ציונך עבור",

	  // First line of email sent to students
	  // Example: This email contains your grade for "Algebra Quiz #6"
	  "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "הודעה זו כוללת את ציונך עבור",

	  // Message telling students not to reply to the email with their grades
	  "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "נא לא להשיב להודעה זו",

	  // Message that preceedes the student's grade
	  "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "ציונך",

	  // Message that preceedes the instructor's (optional) message in the email
	  "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "להלן הודעה מהמדריך או המרצה שלך, שנשלחה לכלל תלמידי הכיתה",

	  // Message that preceedes the instructor's (optional) feedback for the student in the email
	  "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "המדריך שלך צירף את המשוב האישי הבא להודעה שנשלחה אלייך בלבד",

	  // Message that preceedes the summary of the student's information (name, date, etc)
	  "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "סיכום מטלת הביצוע שלך",

	  // Message that preceedes the table of the students scores (no answer key sent)
	  "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "להלן הניקוד שקיבלת עבור כל שאלה",

	  // Message that preceedes the table of the students scores, and answer key
	  "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "להלן הניקוד שקיבלת עבור כל שאלה, יחד עם התשובה הנכונה",

	  // Header for the column in the table of scores in the email which lists the question asked.
	  "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "שאלה",

	  // Header for the column in the table of scores in the email which lists the student's answer.
	  "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "תשובתך",

	  // Header for the column in the table of scores in the email which lists the correct answer.
	  "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "התשובה הנכונה",

	  // Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
	  "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "הניקוד שצברת",

	  // Header for the column in the table of scores in the email which lists the points possible (e.g. 5).
	  "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "ניקוד אפשרי",

	  // Header for the column in the table of scores in the email which lists the Help Tip (if provided)
	  "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "הכוונה לשאלה זו",

	  // Label for "points" used in the new style email summary of grades
	  "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "ניקוד",

	  // Label for "Correct" questions in new style email summary of grades
	  "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "נכון",

	  // Label for "Incorrect" questions in new style email summary of grades
	  "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "לא נכון",

	  // Footer for the email sent to students, advertising Flubaroo.
	  "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "הודעה זו נוצרה על-ידי פלובארו, כלי חינמי לניקוד והערכה של מטלות ביצוע",

	  // Link at the end of the footer. Leads to www.flubaroo.com
	  "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "בקר באתר flubaroo.com",

	  // Subject of the record email sent to the instructor, when grades are emailed to the class.
	  // Followed by the assignment name.
	  // e.g. Record of grades emailed for Algebra Quiz #6
	  "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "רשומת ציונים שנשלחו עבור",

	  // Used in the record email sent to the instructor after she emails grades.
	  // Labels the name of the assignment, in the summary table.
	  "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "שם המטלה",

	  // Used in the record email sent to the instructor after she emails grades.
	  // Labels the number of emails sent, in the summary table.
	  "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "מספר ההודעות שנשלחו",

	  // Used in the record email sent to the instructor after she emails grades.
	  // Labels the number of graded submissions, in the summary table
	  "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "מספר הציונים שנבדקו",

	  // Used in the record email sent to the instructor after she emails grades.
	  // Labels the average score in points (vs percent), in the summary table
	  "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "ציון ממוצע, בנקודות",

	  // Used in the record email sent to the instructor after she emails grades.
	  // Labels the points possible, in the summary table
	  "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "ניקוד אפשרי",

	  // Used in the record email sent to the instructor after she emails grades.
	  // Indicated if an answer key was provided to the students, in the summary table
	  "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "האם נשלחו תשובות נכונות?",

	  // Used in the record email sent to the instructor after she emails grades.
	  // Value in summary table if answer key was NOT sent to students by instructor
	  "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "לא",

	  // Used in the record email sent to the instructor after she emails grades.
	  // Value in summary table if answer key WAS sent to students by instructor
	  "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "כן",

	  // Used in the record email sent to the instructor after she emails grades.
	  // Message that preceeds what message the instructor email to her students.
	  "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "בנוסף שלחת את ההודעה הבאה",

	  // About Flubaroo message (1 of 2)
	  "FLB_STR_ABOUT_FLUBAROO_MSG1" : "פלובארו הוא כלי חינמי ופשוט לתפעול המאפשר למורים לדרג מטלות ביצוע המכילות שאלות בחירה-מרובה, ולנתח את התשובות שהתקבלו, בקלות ובמהירות",

	  // About Flubaroo message (2 of 2)
	  "FLB_STR_ABOUT_FLUBAROO_MSG2" : "כדי ללמוד עוד, בקרו באתר www.flubaroo.com",

	  // Message that appears when "Student Submissions" sheet cannot be located.
	  "FLB_STR_CANNOT_FIND_SUBM_MSG" : ".פלובארו לא הצליח למצוא את גיליון הנתונים שבו הוזנו מטלות הביצוע של התלמידים. אנא אתר את גיליון זה, ושנה את שמו לשם: ",

	  // Message that appears when "Grades" sheet cannot be located.
	  "FLB_STR_CANNOT_FIND_GRADES_MSG" : "פלובארו לא הצליח למצוא את גיליון הנתונים שבו הוזנו מטלות הביצוע של התלמידים. אנא אתר את גיליון זה, ושנה את שמו לשם: ",

	  // Menu option to grade assignment.
	  "FLB_STR_MENU_GRADE_ASSIGNMENT" : "הערכת ציוני תלמידים",

	  // Menu option to re-grade assignment.
	  "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "הערכה חוזרת",

	  // Menu option to email grades.
	  "FLB_STR_MENU_EMAIL_GRADES" : "שלח ציונים בדוא’’ל",

	  // Menu option to hide student feedback (hides the column)
	  "FLB_STR_MENU_HIDE_FEEDBACK" : "הסתר משוב אישי לתלמיד",

	  // Menu option to edit student feedback (unhides the column)
	  "FLB_STR_MENU_EDIT_FEEDBACK" : "ערוך משוב אישי לתלמיד",

	  // Menu option to hide help tips
	  "FLB_STR_MENU_HIDE_HELP_TIPS" : "הסתר הכוונה",

	  // Menu option to edit help tips
	  "FLB_STR_MENU_EDIT_HELP_TIPS" : "ערוך הכוונה",

	  // Menu option to view report.
	  "FLB_STR_MENU_VIEW_REPORT" : "צפה בדיווח",

	  // Menu option to learn About Flubaroo.
	  "FLB_STR_MENU_ABOUT" : "אודות פלובארו",

	  // Menu option to choose the language.
	  "FLB_STR_MENU_SET_LANGUAGE" : "קבע שפה",

	  // Word that appears on the "Continue" button in grading and emailing grades.
	  "FLB_STR_BUTTON_CONTINUE" : "המשך",

	  // Name of "Student Submissions" sheet
	  "FLB_STR_SHEETNAME_STUD_SUBM" : "תגובות התלמידים",

	  // Name of "Grades" sheet
	  "FLB_STR_SHEETNAME_GRADES" : "ציונים",

	  // Text put in Grades sheet when a question isnt graded.
	  "FLB_STR_NOT_GRADED" : "לא הוערכה",

	  // Message that is displayed when a new version of Flubaroo is installed.
	  "FLB_STR_NEW_VERSION_NOTICE" : "התקנת גרסה חדשה של פלובארו! כדי לראות מה השתנה, בקר באתר flubaroo.com/blog.",

	  // Headline for notifications / alerts.
	  "FLB_STR_NOTIFICATION" : "פלובארו - התראה",

	  // For emailing grades, question which asks user to identify email question.
	  "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "שאלה לקבלת דוא’’ל: ", // note the space after ":"

	  // For emailing grades, asks user if list of questions and scores should be sent.
	  "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "כלול רשימה של שאלות וניקוד לכל שאלה: ", // note the space after ":"

	  // For emailing grades, asks user if answer key should be sent...
	  "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "כלול מפתח תשובות: ", // note the space after ":"

	  // For emailing grades, appears before text box for optional instructor message.
	  "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "הודעה שתיכלל בדוא’’ל (לא חובה): ",

	  // Window title for View Report window
	  "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "פלובארו - דיווח תוצאות",

	  // Title of historgram chart in report
	  "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "גרף ציונים",

	  // Y-Axis (vertical) title of historgram chart in report
	  "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "מטלות שהוגשו",

	  // X-Axis (horizontal) title of historgram chart in report
	  "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "ניקוד שנצבר",

	  // Label of "Email Me Report" button in View Report window
	  "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "שלח לי דיווח בדוא’’ל",

	  // Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
	  "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "הדיווח נשלח בדואר לכתובת",
      
        "FLB_STR_RESULTS_TIP_READ_ARTICLE": "לחץ <a target=_blank href=\"%s\"> כאן </a> כדי לברר פרטים נוספים.",

        "FLB_STR_MENU_ADVANCED": "מִתקַדֵם",

        "FLB_STR_MENU_ADV_OPTIONS": "אפשרויות מתקדמות",

        "FLB_STR_MENU_ENABLE_AUTO_GRADE": "אפשר Autograde",

        "FLB_STR_MENU_DISABLE_AUTO_GRADE": "השבת Autograde",

        //"FLB_STR_MENU_SHOW_EMAIL_QUOTA": "בדוק מכסת דוא"ל",

        "FLB_STR_MENU_ENABLE": "אפשר Flubaroo בגיליון זה",

        "FLB_STR_FLUBAROO_NOW_ENABLED": "Flubaroo אופשר לגיליון זה. כעת אתה יכול לגשת אליו מהתפריט.",

        "FLB_STR_GRADING_CELL_MESSAGE": "דירוג ההגשות אחרונות ...",

        "FLB_STR_AUTOGRADE_IS_ON": "Autograde מופעל. Flubaroo מחכה להגשות חדשות לכיתה. לא לבצע שינויים בכל גיליונות עד autograde כבוי.",

        "FLB_STR_AUTOGRADE_IS_OFF": "Autograde כבר כבוי.",

        "FLB_STR_AUTOGRADE_GRADE_RECENT": "כמה הגשות האחרונות עדיין לא להיות מדורגות. האם ראשון שאתה אוהב Flubaroo להם כיתה, לפני autograde מופעל?",

        "FLB_STR_AUTOGRADE_SETUP": "לפני הפעלת autograde אתה חייב התקנה ראשונה ההגדרות לדירוג ודואר אלקטרוניים שלך. לחץ על 'אישור' כדי להמשיך.",

        "FLB_STR_AUTOGRADE_UPDATE": "לפני הפעלת autograde, אתה רוצה לעדכן את ההגדרות לדירוג ודואר אלקטרוניים שלך?",

        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE": "אפשרויות מתקדמות",

        "FLB_STR_ADV_OPTIONS_NOTICE": "לשנות הגדרות אלה רק אם יש לך לקרוא את מאמרי העזרה correponding",

        "FLB_STR_ADV_OPTIONS_NO_NOREPLY": "השתמש בכתובת דואר אלקטרוני שלי, כאשר תשואת ציונים, ולא את הכתובת @ noreply.",

        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK": "עם ההגשה, אוטומטי דוא”\ל הסטודנט קישור לערוך התגובה שלהם במהירות.",

        "FLB_STR_ADV_OPTIONS_PASS_RATE": "אחוז שמתחתיו מידע תלמיד מודגש באדום:",

        "FLB_STR_EMAIL_QUOTA_MSG": "יש לך מיילים רבים זה עזב במכסה היומית שלך:",

        "FLB_STR_GRADE_STEP1_LABEL_POINTS": "נקודות",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "עליך לבחור שאלה אחת לפחות שמזהה סטודנט לפני שתמשיך.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "עליך לבחור שאלה אחת לפחות שהיא gradeable.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "עליך לבחור מקש מענה לפני שתמשיך.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "דירוג רגיל",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "כיתה ביד (חדש!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "לא ניתן להפעיל Autograde כי יש לך שאלה אחת או יותר שנקבעו לידורג יד.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "אתה נבחר שאלה אחת או יותר ללהיות מדורגת על ידי יד. אבל דירוג לא יכול להמשיך כי חלק מהשאלות אלה אינם שונים מאחד לשנייה. לדוגמא, ייתכן שיש לך שתי שאלות שני שכותרתו “\שאלה”\. אנא שנה את הטקסט של שאלות אלה בשורה 1, כך שהם ייחודיים (כלומר “\שאלה 1”\ ו- “\שאלה 2”\), ולאחר מכן נסה שוב לדירוג.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "יד מדורגת",

        "FBL_STR_MANUAL_GRADING_INSTR": "השתמש בבקרים שלהלן כדי להקצות כיתות ביד. שים לב שזה יעבוד רק כראוי על שאלות שאתה נבחר “\כיתה ביד”\ בשלב 1 של דירוג.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "שאלות כיתה על ידי יד",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "אין נקודות שהוקצו",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "תגובות שנעשו על ידי המורה שלך",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "שאלות כיתה על ידי יד - Flubaroo",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. סטודנט בחר:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. שאלה בחירה:",

        "FLB_STR_MANUAL_GRADING_STEP3": "ההגשה של 3. קראו סטודנט:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. הזן הערות לסטודנטים (שנשלח בדואר אלקטרוני):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "מקש מענה סקירה",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "הגדר כיתה",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "עבודה",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "הכיתה יושמה.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "נא להזין את הכיתה בתוקף.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "חלה שגיאה.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "לִסְגוֹר",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "Autograde הוא כיום לדירוג הגשות אחד או יותר חדשות, כך שלא יכול להיות נכה. נסה שוב בקרוב.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "גיליון ציונים לא נוצר כי אין הגשות תקפות נמצאו.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "גיליון ציונים פגומים - לא ניתן להמשיך",

        "FLB_STR_INVALID_GRADES_SHEET": "<P> Flubaroo לא יכול להמשיך בגלל גיליון הציונים שלך פגום. האם אתה אולי למחוק שורות, טורים, או נתונים אחרים מגיליון הציונים לאחר השלים הדירוג אחרון? </ P> <p> ראה <a href = \”http://www.flubaroo.com/hc/corrupted-grades-sheet\”> </a> מאמר זה לקבלת סיוע. </ P>",

        "FLB_STR_DO_NOT_DELETE_MSG": "להבטחת פונקציות FLUBAROO כראוי, אל תמחקו את השורות או עמודות בגיליון זה",

        "FLB_STR_GRADES_SHARE_LABEL": "כיתה שיתוף שיטה:",

        "FLB_STR_GRADES_SHARE_EMAIL": "שתף באמצעות דואר אלקטרוני (אופייני)",

        "FLB_STR_GRADES_SHARE_DRIVE": "שתף באמצעות Google Drive (לא דואל)",

        "FLB_STR_GRADES_SHARE_BOTH": "שתף באמצעות דואר אלקטרוני והן כונן",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "כיתות משותפות - Flubaroo",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "כיתה ל",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "לחץ לצפייה בדוח כיתה זה ב- Google Drive",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - כיתות הדפסה",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo ייצור מסמך יחיד Google המכיל ציונים לכל התלמידים אשר תוכל להדפיס ולהפיץ. אתה יכול לציין הודעה לכלול בכל מסמך, כמו גם אם לכלול את רשימת שאלות ו / או התשובות הנכונות.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - שתף ציונים",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo יכול לחלוק עם כל תלמיד בכיתה שלהם באמצעות דואר אלקטרוני, Google Drive, או שניהם. השתמש בתפריט הנפתח כדי לבחור את השאלה ששאלה את התלמידים לכתובת הדואל שלהם. אם כתובות דואר אלקטרוני לא נאספו, אז אתה לא תוכל לחלוק את הציונים.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "מסמך גוגל כבר יצר המכיל את כל ציוני הסטודנט. לחץ על שם הקובץ כדי לפתוח אותו בהמשך. אז להדפיס אותו ולמסור לכל תלמיד התדפיס שלהם.",

        "FLB_STR_MENU_SHARE_GRADES": "שתף ציונים",

        "FLB_STR_MENU_PRINT_GRADES": "ציוני הדפסה",

        "FLB_STR_TIP_MSG_NUMBER_1": "<B> Flubaroo טיפ # 1: </ b> Flubaroo יכול לקבל יותר מתשובה אחת נכונה.",

        "FLB_STR_TIP_MSG_NUMBER_2": "<B> Flubaroo טיפ # 2: </ b> Flubaroo יכול טווחים מספריים כיתה למשימות מדע ומתמטיקה.",

        "FLB_STR_TIP_MSG_NUMBER_3": "<B> Flubaroo טיפ # 3: </ b> כלב vs כלב? תשובות כיתה רישיות.",

        "FLB_STR_TIP_MSG_NUMBER_4": "<B> Flubaroo טיפ # 4: </ b> רוצה לשנות את 70% הציון עובר כברירת מחדל?",

        "FLB_STR_TIP_MSG_NUMBER_5": "<B> Flubaroo טיפ # 5: </ b> צריך לבדוק מכסת הדואר האלקטרוני שנותרה?",

        "FLB_STR_TIP_MSG_NUMBER_6": "<B> Flubaroo טיפ # 6: </ b> רוצה המשימות שלך מדורגות באופן אוטומטי?",

        "FLB_STR_TIP_MSG_NUMBER_7": "<B> Flubaroo טיפ # 7: </ b> יש לך שאלות? יש לנו תשובות בשאלות הנפוצות שלנו!",

    },
    // END HEBREW//////////////////////////////////////////////////////////////////////////////////
  
   // START POLISH ////////////////////////////////////////////////////////////////////////////////
   "pl-pl": {
       // Name to identify language in language selector
       "FLB_LANG_IDENTIFIER": "Polski (Polish)",

       // Grading option which identifies a student
       "FLB_STR_GRADING_OPT_STUD_ID" : "Dane ucznia",

       // Grading option which tells Flubaroo to skip grading on a question
       "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Pomiń przy ocenianiu",

       // Message shown when grading is complete (1 of 2).
       "FLB_STR_RESULTS_MSG1" : "Klasyfikacja zakończona! Został utworzony nowy arkusz o nazwie \"Wyniki\". Zawiera on ocenę każdej pracy i na górze, statystykę wszystkich ocen. ** Uwaga: arkusza \"Wyniki\" nie należy zmieniać, ponieważ może to kolidować z mailową informacją o wynikach. Jeśli chcesz go zmodyfikować, skopiuj go i modyfikuj kopię.",

       // Message shown when grading is complete (2 of 2).
       "FLB_STR_RESULTS_MSG2" : "Uwaga: Ostatni wiersz podaje procent uczniów, którzy poprawnie odpowiedzieli na dane pytanie, z wyróżnionymi na pomarańczowo najniższymi procentami. Nazwiska uczniów, których wynik jest poniżej 70% pojawią się w kolorze czerwonym.",

       // Instructions shown on Step 1 of grading.
       "FBL_STR_STEP1_INSTR" : "Proszę wybrać opcję klasyfikacji dla każdego z pytań. Flubaroo dołożyło wszelkich starań, aby odgadnąć najlepszy/domyślny wybór, ale należy go sprawdzić i zaznaczyć poprawną opcję dla każdego pytania samodzielnie.",

       // Instructions shown on Step 2 of grading.
       "FBL_STR_STEP2_INSTR" : "Proszę wybrać pracę, która ma być kluczem odpowiedzi. Zwykle będzie to test wypełniony przez Ciebie. Wszystkie pozostałe będą oceniane na jego podstawie, więc zadbaj o to, aby wybrać ten właściwy.",

       // Message shown if not enough submissions to perform grading.
       "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Muszą być co najmniej 2 prace do sklasyfikowania. Spróbuj ponownie, gdy więcej osób przedłoży swoje odpowiedzi.",

       // Please wait" message first shown when Flubaroo is first examining assignment.
       "FLB_STR_WAIT_INSTR1" : "Flubaroo analizuje wyznaczone zadanie. Proszę czekać ...",

       // Please wait" message shown after Step 1 and Step 2, while grading is happening.
       "FLB_STR_WAIT_INSTR2" :  "Poczekaj podczas gdy Twoje zadanie jest oceniane. Ukończenie może zająć minutę lub dwie.",

       // Asks user if they are sure they want to re-grade, if Grades sheet exists.
       "FLB_STR_REPLACE_GRADES_PROMPT" : "Spowoduje to zastąpienie istniejących ocen. Czy na pewno chcesz kontynuować?",

       // Window title for "Preparing to grade" window
       "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Przygotowanie do oceniania",

       // Window title for "Please wait" window while grading occurs
       "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Zadanie jest oceniane",

       // Window title for "Grading Complete" window after grading occurs
       "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Klasyfikacja ukończona",

       // Window title for grading Step 1
       "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Klasyfikacja. Krok 1",

       // Window title for grading Step 2
       "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Klasyfikacja. Krok 2",

       // "Grading Option" label that appears over first column in Step 1 of grading.
       "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Wariant klasyfikacji",

       // "Question" label that appears over third column in Step 1 of grading.
       "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Pytanie",

       // "Select" label that appears over radio button in first column of Step 2 of grading.
       "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Wybierz",

       // "Submission Time" label that appears over second column in Step 2 of grading.
       "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Data złożenia",

       // Label for "View Grades" button shown when grading completes.
       "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Pokaż oceny",

       // Used for "summary" text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Podsumowanie",

       // Used for report and report email. Ex: "Report for 'My Test'"
       "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Raport z",

       // Points Possible. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Punkty możliwe",

       // Average Points. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Średnia punktów",

       // Counted Submissions. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Liczba prac",

       // Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Liczba nisko ocenionych pytań",

       // Name of column in Grades sheet that has total points scored.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Suma punktów",

       // Name of column in Grades sheet that has score as percent.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Procent",

       // Name of column in Grades sheet that has number of times student made a submission.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Liczba prób",

       // Name of column in Grades sheet that indicates if grade was already emailed out.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Wyniki wysłane?",

       // Name of column in Grades sheet that allows teacher to enter optional student feedback
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Uwagi do ucznia (opcjonalnie)",

       // Window title for emailing grades
       "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - E-mail z wynikami",

       // Instructions on how to email grades
       "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo może wysłać każdemu uczniowi jego wynik, jak również prawidłowe odpowiedzi. Użyj menu rozwijanego, aby wybrać pytanie skierowane do ucznia o jego adres e-mail. Jeśli adresy e-mail nie zostaną zebrane, nie będziesz w stanie wysłać ocen.",

       // Notice that grades cannot be emailed because the user has exceeded their daily quota.
       "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo nie może wysłać w tej chwili maili z wynikami, ponieważ został przekroczony limit 100 maili dziennie. Limit ten jest ustalony przez Google dla wszystkich dodatków. Spróbuj ponownie później.",
    
       // Message about how many grade emails *have* been sent. This message is preceeded by a number.
       // Example: "5 grades were successfully emailed"
       "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "maili z wynikami pomyślnie wysłanych",

       // Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
       "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "maili z wynikami nie wysłano z powodu nieprawidłowych lub brakujących adresów, albo dlatego, że zostały już wysłane wcześniej.",

       // Message about how many grade emails *have NOT* been sent.
       "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Nie wysłano żadnego maila z wynikami, ponieważ nie znaleziono żadnych poprawnych adresów e-mail, lub dlatego, że wszyscy uczniowie zostali już zawiadomieni.",    
    
       // Subject of the email students receive. Followed by assignment name.
       // Example: Here is your grade for "Algebra Quiz #6"
       "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Oto Twoje wyniki z",

       // First line of email sent to students
       // Example: This email contains your grade for "Algebra Quiz #6"
       "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Ten e-mail zawiera Twoje wyniki z",

       // Message telling students not to reply to the email with their grades
       "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Nie odpowiadaj na tego maila",

       // Message that preceedes the student's grade
       "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Twoje wyniki (punkty)",

       // Message that preceedes the instructor's (optional) message in the email
       "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Poniżej wiadomość od Twojego nauczyciela, wysłana do całej klasy",

       // Message that preceedes the instructor's (optional) feedback for the student in the email
       "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Komentarz nauczyciela skierowany konkretnie do Ciebie",

       // Message that preceedes the summary of the student's information (name, date, etc)
       "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Podsumowanie wypełnionego przez Ciebie zadania",

       // Message that preceedes the table of the students scores (no answer key sent)
       "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Poniżej, Twój wynik z każdego pytania",

       // Message that preceedes the table of the students scores, and answer key
       "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Poniżej, Twój wynik z każdego pytania, wraz z poprawną odpowiedzią",

       // Header for the  column in the table of scores in the email which lists the question asked.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Pytanie",

       // Header for the  column in the table of scores in the email which lists the student's answer.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Twoja odpowiedź",

       // Header for the  column in the table of scores in the email which lists the correct answer.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Prawidłowa odpowiedź",

       // Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Twój wynik",

       // Header for the  column in the table of scores in the email which lists the points possible (e.g. 5).
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Punkty możliwe",

       // Header for the  column in the table of scores in the email which lists the Help Tip (if provided)
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Podpowiedź do pytania",

       // Label for "points" used in the new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "punkt(y)",

       // Label for "Correct" questions in new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Dobrze",

       // Label for "Incorrect" questions in new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Źle",

       // Footer for the email sent to students, advertising Flubaroo.
       "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Ta wiadomość została wygenerowana przez Flubaroo, darmowe narzędzie do klasyfikacji i oceny",

       // Link at the end of the footer. Leads to www.flubaroo.com
       "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Odwiedź flubaroo.com",

       // Subject of the record email sent to the instructor, when grades are emailed to the class.
       // Followed by the assignment name.
       // e.g. Record of grades emailed for Algebra Quiz #6
       "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Zapis przesłanych wyników z",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the name of the assignment, in the summary table.
       "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Nazwa zadania",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the number of emails sent, in the summary table.
       "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Liczba wysłanych maili",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the number of graded submissions, in the summary table
       "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Liczba ocenionych prac",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the average score in points (vs percent), in the summary table
       "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Średni wynik (punkty)",

       // Used in the record email sent to the instructor after she emails grades.
       // Labels the points possible, in the summary table
       "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Punkty możliwe",

       // Used in the record email sent to the instructor after she emails grades.
       // Indicated if an answer key was provided to the students, in the summary table
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Czy udostępniony klucz odpowiedzi?",

       // Used in the record email sent to the instructor after she emails grades.
       // Value in summary table if answer key was NOT sent to students by instructor
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Nie",

       // Used in the record email sent to the instructor after she emails grades.
       // Value in summary table if answer key WAS sent to students by instructor
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Tak",

       // Used in the record email sent to the instructor after she emails grades.
       // Message that preceeds what message the instructor email to her students.
       "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Dołączyłeś również tę wiadomość",

       // About Flubaroo message (1 of 2)
       "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo to bezpłatne, oszczędzające czas narzędzie, które pozwala nauczycielom szybko ocenić i przeanalizować wyniki testów jednokrotnego wyboru",

       // About Flubaroo message (2 of 2)
       "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Aby dowiedzieć się więcej, odwiedź www.flubaroo.com.",

       // Message that appears when "Student Submissions" sheet cannot be located.
       "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo nie mógł określić, który arkusz zawiera odpowiedzi uczniów. Zlokalizuj ten arkusz i zmień jego nazwę na:",

       // Message that appears when "Grades" sheet cannot be located.
       "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo nie mógł określić, który arkusz zawiera wyniki. Postępuj zgodnie z procedurą oceniania lub zlokalizuj ten arkusz i zmień jego nazwę na: ",

       // Menu option to grade assignment.
       "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Oceń prace",

       // Menu option to re-grade assignment.
       "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Ponownie oceń",

       // Menu option to email grades.
       "FLB_STR_MENU_EMAIL_GRADES" : "Wyślij wyniki mailem",

       // Menu option to hide student feedback (hides the column)
       "FLB_STR_MENU_HIDE_FEEDBACK" : "Ukryj komentarze uczniów",

       // Menu option to edit student feedback (unhides the column)
       "FLB_STR_MENU_EDIT_FEEDBACK" : "Edytuj komentarze uczniów",

       // Menu option to hide help tips
       "FLB_STR_MENU_HIDE_HELP_TIPS" : "Ukryj wskazówki",

       // Menu option to edit help tips
       "FLB_STR_MENU_EDIT_HELP_TIPS" : "Edytuj wskazówki",

       // Menu option to view report.
       "FLB_STR_MENU_VIEW_REPORT" : "Zobacz wyniki",

       // Menu option to learn About Flubaroo.
       "FLB_STR_MENU_ABOUT" : "Informacje o Flubaroo",

       // Menu option to choose the language.
       "FLB_STR_MENU_SET_LANGUAGE" : "Wybierz język",

       // Word that appears on the "Continue" button in grading and emailing grades.
       "FLB_STR_BUTTON_CONTINUE" : "Kontynuuj",

       // Name of "Student Submissions" sheet
       "FLB_STR_SHEETNAME_STUD_SUBM" : gbl_subm_sheet_name,    

       // Name of "Grades" sheet
       "FLB_STR_SHEETNAME_GRADES" : gbl_grades_sheet_name,

       // Text put in Grades sheet when a question isnt graded.
       "FLB_STR_NOT_GRADED" : "Nie oceniono",

       // Message that is displayed when a new version of Flubaroo is installed.
       "FLB_STR_NEW_VERSION_NOTICE" : "Zainstalowałeś nową wersję Flubaroo! Odwiedź flubaroo.com / blog, aby zobaczyć co nowego.",

       // Headline for notifications / alerts.
       "FLB_STR_NOTIFICATION" : "Powiadomienie Flubaroo",

       // For emailing grades, question which asks user to identify email question.
       "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Twój adres e-mail: ", // note the space after ":"

       // For emailing grades, asks user if list of questions and scores should be sent.
       "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Dołącz listę pytań i wyniki: ", // note the space after ":"

       // For emailing grades, asks user if answer key should be sent...
       "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Dołącz klucz odpowiedzi: ", // note the space after ":"
      
       // For emailing grades, appears before text box for optional instructor message.
       "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Dołącz do maila wiadomość (opcjonalnie):",

       // Window title for View Report window
       "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Raport klasyfikacji",

       // Title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Histogram wyników",

       // Y-Axis (vertical) title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Liczba uczniów",

       // X-Axis (horizontal) title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Uzyskane punkty",

       // Label of "Email Me Report" button in View Report window
       "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Wyślij mi raport",

       // Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
       "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Raport został wysłany do",
          
       // Follows the Flubaroo tip, directing users to read the corresponding article.
       "FLB_STR_RESULTS_TIP_READ_ARTICLE" : "Kliknij <a target=_blank href=\"%s\">tu</a> , aby dowiedzieć się więcej.",

       // Menu title for "Advanced" sub-menu
       "FLB_STR_MENU_ADVANCED" : "Zaawansowane",
         
       // Menu title for Advanced > Options
       "FLB_STR_MENU_ADV_OPTIONS" : "Opcje zaawansowane",
       
       // Menu option to enable autograde.
       "FLB_STR_MENU_ENABLE_AUTO_GRADE" : "Włącz autoocenianie",

       // Menu option to disable autograde.
       "FLB_STR_MENU_DISABLE_AUTO_GRADE" : "Wyłącz autoocenianie",
    
       // Menu option to see reamining daily email quota
       "FLB_STR_MENU_SHOW_EMAIL_QUOTA" : "Sprawdź przydział maili",
    
       // Menu option shown to enable Flubaroo in a sheet where it's never been used before
       "FLB_STR_MENU_ENABLE" : "Włącz Flubaroo w tym arkuszu",
    
       // Message to show when menu option for FLB_STR_MENU_ENABLE is chosen
       "FLB_STR_FLUBAROO_NOW_ENABLED" : "Flubaroo zostało włączone dla tego arkusza. Możesz teraz uzyskać do niego dostęp z menu.",

       // Message to show the user in the top-left cell of the Grading sheet when grading starts.
       "FLB_STR_GRADING_CELL_MESSAGE" : "Klasyfikowanie ostatnio dodanych...",

       // Message that pops up to notify the user that autograde is on.
       "FLB_STR_AUTOGRADE_IS_ON" : "Autoocenianie jest włączone. Flubaroo czeka na nowe zgłoszenia do klasyfikacji. Nie należy zmieniać arkuszy, przed wyłączeniem autooceniania.",

       // Message that pops up to notify the user that autograde is on.
       "FLB_STR_AUTOGRADE_IS_OFF" : "Autoocenianie zostało wyłączone.",
    
       // Message to ask the user if they want to grade recent, ungraded submissions, before autograde is enabled.
       "FLB_STR_AUTOGRADE_GRADE_RECENT" : "Niektóre ostatnie zgłoszenia nie zostały jeszcze sklasyfikowane. Czy chcesz, żeby Flubaroo je ocenił, przed włączeniem autooceniania?",

       // Message to tell the user that autograde must gather grading and email settings before being turned on.     
       "FLB_STR_AUTOGRADE_SETUP" : "Przed włączeniem autooceniania należy najpierw skonfigurować ustawienia oceniania i maili. Kliknij przycisk \"OK\", aby kontynuować.",

       // Message asking user if they'd like to update their grading and email settings before turning on autograde.
       "FLB_STR_AUTOGRADE_UPDATE" : "Czy chcesz, przed włączeniem autooceniania, skonfigurować ustawienia oceniania i maili?",

       // Title of Advanced Options window
       "FLB_STR_ADV_OPTIONS_WINDOW_TITLE" : "Opcje zaawansowane",

       // Advanced Options notice that appears at the top of the window, telling the user to read the help center articles.
       "FLB_STR_ADV_OPTIONS_NOTICE" : "Te ustawienia należy zmieniać tylko, jeśli przeczytano odpowiednie artykuły pomocy",
    
       // Text for Advanced Options, describing option to not use noreply@ email address when sending grades.     
       "FLB_STR_ADV_OPTIONS_NO_NOREPLY" : "Użyj mojego adresu zwrotnego, przy wysyłaniu ocen, a nie adresu noreply@.",
         
       // Text for Advanced Options, describing option to send each student a link to edit their response.
       "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK" : "Po złożeniu, automatycznie wyślij uczniowi link do szybkiego edytowania odpowiedzi.",
    
       // Text for Advanced Options, describing option to change the 70% pass rate.
       "FLB_STR_ADV_OPTIONS_PASS_RATE" : "Procent, poniżej którego info ucznia jest podświetlone na czerwono:",

       // Message about how many more emails user can send that day. Shown from the Advanced > Check Email Quota menu. 
       "FLB_STR_EMAIL_QUOTA_MSG" : "Masz tyle maili pozostawionych w codziennym przydziale: ",
    
       "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Zwrotnica",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "Musisz wybrać co najmniej jedno pytanie, który identyfikuje studenta przed kontynuowaniem.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "Musisz wybrać co najmniej jedno pytanie, które jest gradeable.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Musisz wybrać klucz odpowiedzi przed kontynuowaniem.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Normalna Klasa",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Klasa ręką (Nowość!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "Autograde nie może być włączony, bo masz jedno lub więcej pytań, które są ustawione do ręcznie sortowane.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "Wybrano jeden lub więcej pytań, aby być sortowane według Ręką. Jednak równania nie można kontynuować, ponieważ niektóre z tych kwestii, nie różnią się od siebie. Na przykład, możesz mieć dwa pytania, zarówno pod tytułem \"pytanie\". Proszę zmienić tekst tych pytań w wierszu 1, tak, że są one unikalne (czyli \"Pytanie 1\" i \"Pytanie 2\"), a następnie spróbuj ponownie klasyfikacji.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Ręcznie Graded",

        "FBL_STR_MANUAL_GRADING_INSTR": "Użyj poniższych kontroli przypisać stopnie ręcznie. Zauważ, że to działa tylko poprawnie na pytania, dla którego wybrano \"Klasa ręką\" w kroku 1 stopnia.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "Stopień Pytania ręcznie",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "Nie ma punktów przypisana",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Uwagi zgłoszone przez instruktora",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Flubaroo - Stopień Pytania ręcznie",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Wybierz Student:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Wybierz Pytanie:",

        "FLB_STR_MANUAL_GRADING_STEP3": "Składanie 3. Czytaj studenta:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Wprowadź Uwagi dla Studenta (wysłane w wiadomości e-mail):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "Przegląd klucz odpowiedzi",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Ustaw Stopnia",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "Pracujący",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "Stopień zastosowano.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "Wpisz poprawną ocenę.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Wystąpił błąd.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "Blisko",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "Autograde obecnie klasyfikacji jednego lub kilku nowych zgłoszeń, więc nie może być wyłączona. Spróbuj ponownie wkrótce.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Arkusz stopnie nie został utworzony, ponieważ nie stwierdzono prawidłowe wnioski.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Uszkodzone stopnie Sheet - Nie można dalej",

        "FLB_STR_INVALID_GRADES_SHEET": "<p> Flubaroo nie może kontynuować, ponieważ arkusz stopnie została uszkodzona. Czy może usunąć wiersze, kolumny lub inne dane z arkusza stopnie po klasyfikacji ostatnia ukończona? </ P> <p> Zobacz <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> ten artykuł </a> o pomoc. </ p>",

        "FLB_STR_DO_NOT_DELETE_MSG": "Zapewniające funkcje FLUBAROO prawidłowo, nie należy usuwać wiersze lub kolumny W TEJ KARCIE",

        "FLB_STR_GRADES_SHARE_LABEL": "Rozpowszechnianie Wyników Metoda:",

        "FLB_STR_GRADES_SHARE_EMAIL": "Wyślij wyniki mailem (typowy)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Udostępnij przez Google Drive (nie e-mail)",

        "FLB_STR_GRADES_SHARE_BOTH": "Udostępnij przez e-mail i Drive",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "Flubaroo - Wspólne Wyniki",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Wyniki dla",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Kliknij, by zobaczyć tę raport klasy w Google Drive",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - Wydrukować Wyniki",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo utworzy pojedynczy dokument Google zawierający oceny dla wszystkich studentów, które można następnie wydrukować i dystrybucja. Możesz podać wiadomość do uwzględnienia w każdym dokumencie, jak również, czy zawierają listę pytań i / lub poprawnych odpowiedzi.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Rozpowszechnianie wyników",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo może podzielić się z każdym studentem ich jakości poprzez e-mail, Google lub napędu. Użyj menu rozwijanego, aby wybrać pytanie, które zapytał studentów do ich adres e-mail. Jeśli adresy e-mail nie zostały zebrane, to nie będzie w stanie podzielić się stopnie.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "Dokument został stworzony Google zawierający wszystkie oceny ucznia. Kliknij poniżej nazwę pliku, aby go otworzyć. Następnie wydrukować i wręczyć każdemu uczniowi ich wydruk.",

        "FLB_STR_MENU_SHARE_GRADES": "Rozpowszechnianie Wyniki",

        "FLB_STR_MENU_PRINT_GRADES": "Wydrukować Wyniki",
     
       // Flubaroo Tips, shown when grading completes.
       "FLB_STR_TIP_MSG_NUMBER_1" : "<b>Flubaroo Rada #1:</b> Flubaroo może akceptować więcej niż jedną prawidłową odpowiedź.",
       "FLB_STR_TIP_MSG_NUMBER_2" : "<b>Flubaroo Rada #2:</b> Flubaroo może oceniać zakresy liczbowe w zadaniach numerycznych.",
       "FLB_STR_TIP_MSG_NUMBER_3" : "<b>Flubaroo Rada #3:</b> PIES vs pies? Ocenianie uwzględniające wielkość liter odpowiedzi.",
       "FLB_STR_TIP_MSG_NUMBER_4" : "<b>Flubaroo Rada #4:</b> Chcesz zmienić wynik zaliczający z domyślnych 70% ?",
       "FLB_STR_TIP_MSG_NUMBER_5" : "<b>Flubaroo Rada #5:</b> Potrzebujesz sprawdzić przydział pozostałych maili?",
       "FLB_STR_TIP_MSG_NUMBER_6" : "<b>Flubaroo Rada #6:</b> Chcesz swoje zadania oceniać automatycznie?",
       "FLB_STR_TIP_MSG_NUMBER_7" : "<b>Flubaroo Rada #7:</b> Masz pytania? Mamy odpowiedzi na często zadawane pytania!",
   },
   // END POLISH //////////////////////////////////////////////////////////////////////////////////

   // START PORTUGUESE ////////////////////////////////////////////////////////////////////////////////
   "pt-PT": {
       // Name to identify language in language selector
       "FLB_LANG_IDENTIFIER": "Português PT (Portugal Portuguese)",


       // Grading option which identifies a student
       "FLB_STR_GRADING_OPT_STUD_ID" : "Identifica o aluno",


       // Grading option which tells Flubaroo to skip grading on a question
       "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Não classificar",


       // Grading option for 1 point
       "FLB_STR_GRADING_OPT_1_PT" : "1 ponto",


       // Grading option for 2 points
       "FLB_STR_GRADING_OPT_2_PT" : "2 pontos",


       // Grading option for 3 points
       "FLB_STR_GRADING_OPT_3_PT" : "3 pontos",


       // Grading option for 4 points
       "FLB_STR_GRADING_OPT_4_PT" : "4 pontos",


       // Grading option for 5 points
       "FLB_STR_GRADING_OPT_5_PT" : "5 pontos",


       // Message shown when grading is complete (1 of 2).
       "FLB_STR_RESULTS_MSG1" : "Foi criada uma nova folha chamada  'Classificações'. Esta folha contém uma avaliação de cada submissão e um resumo de todas as classificações no topo. A última linha revela a percentagem de alunos que acertou em cada questão, com as questões de baixos resultados globais destacadas a laranja. Os alunos com classificações mais baixas são destacados com letra vermelha.",


       // Message shown when grading is complete (2 of 2).
       "FLB_STR_RESULTS_MSG2" : "<b>IMPORTANT</b>: A folha 'Classificações' não deve ser manualmente modificada, pois isso pode interferir com o processo de envio das classificações. Se precisar de modificar esta folha, copie-a e modifique a cópia.",
      
       // Follows the Flubaroo tip, directing users to read the corresponding article.
       "FLB_STR_RESULTS_TIP_READ_ARTICLE" : "Clique <a target=_blank href=\"%s\">here</a> para saber mais.",
      
       // Instructions shown on Step 1 of grading.
       "FBL_STR_STEP1_INSTR" : "Escolha uma opção de classificação para cada uma das questões. Flubaroo tenta adivinhar a opção mais adequada para cada caso, mas deve confirmar.",


       // Instructions shown on Step 2 of grading.
       "FBL_STR_STEP2_INSTR" : "Escolha a submissão que deve ser usada com chave de respostas. Normalmente é uma submissão feita por si. Todas as restantes submissões serão classificadas de acordo com a chave de respostas, portanto deve assinalá-la com cuidado.",


       // Message shown if not enough submissions to perform grading.
       "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Parece que não existem submissões suficientes para fazer a classificação. Assegure-se de que indicou a chave de respostas e / ou tente mais tarde, quando mais alunos tiverem submetido as suas respostas.",


       // Please wait" message first shown when Flubaroo is first examining assignment.
       "FLB_STR_WAIT_INSTR1" : "Flubaroo está a examinar. Espere um pouco, por favor...",


       // Please wait" message shown after Step 1 and Step 2, while grading is happening.
       "FLB_STR_WAIT_INSTR2" :  "Espere enquanto a classificação está a ser feita. Pode demorar um minuto ou dois.",


       // Asks user if they are sure they want to re-grade, if Grades sheet exists.
       "FLB_STR_REPLACE_GRADES_PROMPT" : "Isto substituirá as classificações existentes. Tem a certeza de que quer continuar?",


       // Window title for "Preparing to grade" window
       "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Preparando a classificação",


       // Window title for "Please wait" window while grading occurs
       "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Classificando",


       // Window title for "Grading Complete" window after grading occurs
       "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Classificação terminada",


       // Window title for grading Step 1
       "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Classificando, Passo 1",


       // Window title for grading Step 2
       "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Classificando, Passo 2",


       // "Grading Option" label that appears over first column in Step 1 of grading.
       "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Opção de classificação",


       // "Question" label that appears over second column in Step 1 of grading.
       "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Questão",


       // "Select" label that appears over radio button in first column of Step 2 of grading.
       "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Escolher",


       // "Submission Time" label that appears over second column in Step 2 of grading.
       "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Submetido em",


       // Label for "View Grades" button shown when grading completes.
       "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Ver classificações",


       // Used for "summary" text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Resumo",


       // Used for report and report email. Ex: "Report for 'My Test'"
       "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Relatório de",


       // Points Possible. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Pontos possíveis",


       // Average Points. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Média de pontos",


       // Counted Submissions. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Total de submissões",


       // Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Número de questões com baixos resultados",


       // Name of column in Grades sheet that has total points scored.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Total de pontos",


       // Name of column in Grades sheet that has score as percent.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Percentagem",


       // Name of column in Grades sheet that has number of times student made a submission.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Número de submissões",


       // Name of column in Grades sheet that indicates if grade was already emailed out.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Classificação enviada por e-mail?",


       // Name of column in Grades sheet that allows teacher to enter optional student feedback
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Feedback para o aluno (Opcional)",


       // Window title for emailing grades
       "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Enviar classificações por e-mail",


       // Instructions on how to email grades
       "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo pode enviar a cada aluno a sua classificação por e-email, bem como as repostas corretas. Use o menu pendente para assinalar a questão que contém o endereço eletrónico dos alunos. Se não foi recolhido qualquer endereço de e-email, não é possível enviar as classificações.",


       // Notice that grades cannot be emailed because the user has exceeded their daily quota.
       "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo não pode, neste momento, enviar as classificações por ter sido atingida a quota diária de mensagens. Esta quota é definida pela Google para todos os Extras. Por favor, tente mais tarde.",
    
       // Message about how many grade emails *have* been sent. This message is preceeded by a number.
       // Example: "5 grades were successfully emailed"
       "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "classificações foram enviadas com sucesso",


       // Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
       "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "classificações não foram enviadas devido a endereços inválidos ou em branco, por já terem sido enviadas anteriormente, ou porque a quota diária foi atingida.",


       // Message about how many grade emails *have NOT* been sent.
       "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Não foram enviadas classificações por não terem sido encontrados endereços válidos, por já terem sido previamente enviadas, ou porque a quota diária foi atingida.",    
    
       // Subject of the email students receive. Followed by assignment name.
       // Example: Here is your grade for "Algebra Quiz #6"
       "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Eis a sua classificação de",


       // First line of email sent to students
       // Example: This email contains your grade for "Algebra Quiz #6"
       "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Este e-mail contém a sua classificação de",


       // Message telling students not to reply to the email with their grades
       "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Não responda a este e-mail",


       // Message that preceedes the student's grade
       "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "A sua classificação",


       // Message that preceedes the instructor's (optional) message in the email
       "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Segue-se uma mensagem do professor, dirigida a toda a turma",


       // Message that preceedes the instructor's (optional) feedback for the student in the email
       "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "O professor enviou esta mensagem apenas para si",


       // Message that preceedes the summary of the student's information (name, date, etc)
       "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Resumo da sua submissão",


       // Message that preceedes the table of the students scores (no answer key sent)
       "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "A sua pontuação em cada questão",


       // Message that preceedes the table of the students scores, and answer key
       "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "A sua pontuação em cada questão, acompanhada da resposta correta",


       // Header for the  column in the table of scores in the email which lists the question asked.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Questão",


       // Header for the  column in the table of scores in the email which lists the student's answer.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "A sua resposta",


       // Header for the  column in the table of scores in the email which lists the correct answer.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "A resposta correta",


       // Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "A sua pontuação",


       // Header for the  column in the table of scores in the email which lists the points possible (e.g. 5).
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Pontos possíveís",


       // Header for the  column in the table of scores in the email which lists the Help Tip (if provided)
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Ajuda para esta questão",


       // Label for "points" used in the new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "ponto(s)",


       // Label for "Correct" questions in new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Correto",


       // Label for "Incorrect" questions in new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Incorreto",


       // Footer for the email sent to students, advertising Flubaroo.
       "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Este e-mail foi gerado por Flubaroo, uma ferramenta gratuita para classificação e avaliação",


       // Link at the end of the footer. Leads to www.flubaroo.com
       "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Visite flubaroo.com",


       // Subject of the record email sent to the instructor, when grades are emailed to the class.
       // Followed by the assignment name.
       // e.g. Record of grades emailed for Algebra Quiz #6
       "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Registo de classificações enviadas por e-mail para",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the name of the assignment, in the summary table.
       "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Designação da tarefa",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the number of emails sent, in the summary table.
       "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Número de mensagens enviadas",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the number of graded submissions, in the summary table
       "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Número de submissões classificadas",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the average score in points (vs percent), in the summary table
       "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Classificação média (pontos)",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the points possible, in the summary table
       "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Pontos possíveis",


       // Used in the record email sent to the instructor after she emails grades.
       // Indicated if an answer key was provided to the students, in the summary table
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Chave de respostas fornecida?",


       // Used in the record email sent to the instructor after she emails grades.
       // Value in summary table if answer key was NOT sent to students by instructor
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Não",


       // Used in the record email sent to the instructor after she emails grades.
       // Value in summary table if answer key WAS sent to students by instructor
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Sim",


       // Used in the record email sent to the instructor after she emails grades.
       // Message that preceeds what message the instructor email to her students.
       "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Também incluiu esta mensagem",

       // About Flubaroo message (1 of 2)
       "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo é uma ferramenta gratuita que permite aos professores poupar tempo, classificando automaticamente itens de resposta fechada e analisando os resultados",

       // About Flubaroo message (2 of 2)
       "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Para saber mais, visite www.flubaroo.com.",

       // Message that appears when "Student Submissions" sheet cannot be located.
       "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo não consegue determinar qual a folha que contém as submissões dos alunos. Por favor, localize essa folha e mude-lhe o nome para: ",

       // Message that appears when "Grades" sheet cannot be located.
       "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo não consegue determinar qual a folha que contém as classificações. Por favor, localize essa folha e mude-lhe o nome para: ",

       // Menu option to grade assignment.
       "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Classificar tarefa",

       // Menu option to re-grade assignment.
       "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Reclassificar tarefa",

       // Menu option to email grades.
       "FLB_STR_MENU_EMAIL_GRADES" : "Enviar classificações por e-mail",

       // Menu option to hide student feedback (hides the column)
       "FLB_STR_MENU_HIDE_FEEDBACK" : "Ocultar feedback ao aluno",

       // Menu option to edit student feedback (unhides the column)
       "FLB_STR_MENU_EDIT_FEEDBACK" : "Editar feedback ao aluno",

       // Menu option to hide help tips
       "FLB_STR_MENU_HIDE_HELP_TIPS" : "Ocultar dicas de ajuda",

       // Menu option to edit help tips
       "FLB_STR_MENU_EDIT_HELP_TIPS" : "Editar dicas de ajuda",

       // Menu option to view report.
       "FLB_STR_MENU_VIEW_REPORT" : "Ver relatório",

       // Menu option to learn About Flubaroo.
       "FLB_STR_MENU_ABOUT" : "Acerca de Flubaroo",

       // Menu title for "Advanced" sub-menu
       "FLB_STR_MENU_ADVANCED" : "Avançado",
    
       // Menu title for Advanced > Options
       "FLB_STR_MENU_ADV_OPTIONS" : "Opções avançadas",
    
       // Menu option to choose the language.
       "FLB_STR_MENU_SET_LANGUAGE" : "Definir idioma",

       // Menu option to enable autograde.
       "FLB_STR_MENU_ENABLE_AUTO_GRADE" : "Ativar classificação automática",

       // Menu option to disable autograde.
       "FLB_STR_MENU_DISABLE_AUTO_GRADE" : "Desativar classificação automática",
    
       // Menu option to see reamining daily email quota
       "FLB_STR_MENU_SHOW_EMAIL_QUOTA" : "Verificar quota de e-mail",
    
       // Menu option shown to enable Flubaroo in a sheet where it's never been used before
       "FLB_STR_MENU_ENABLE" : "Ativar Flubaroo nesta folha",
    
       // Message to show when menu option for FLB_STR_MENU_ENABLE is chosen
       "FLB_STR_FLUBAROO_NOW_ENABLED" : "Flubaroo foi ativado para esta folha. Pode aceder-lhe a partir do menu.",
    
       // Word that appears on the "Continue" button in grading and emailing grades.
       "FLB_STR_BUTTON_CONTINUE" : "Continuar",

       // Name of "Student Submissions" sheet
       "FLB_STR_SHEETNAME_STUD_SUBM" : gbl_subm_sheet_name,    

       // Name of "Grades" sheet
       "FLB_STR_SHEETNAME_GRADES" : gbl_grades_sheet_name,

       // Text put in Grades sheet when a question isnt graded.
       "FLB_STR_NOT_GRADED" : "Não classificada",

       // Message that is displayed when a new version of Flubaroo is installed.
       "FLB_STR_NEW_VERSION_NOTICE" : "Foi instalada uma nova versão de Flubaroo! Visite flubaroo.com/blog para ver o que há de novo.",

       // Headline for notifications / alerts.
       "FLB_STR_NOTIFICATION" : "Notificação de Flubaroo",

       // For emailing grades, question which asks user to identify email question.
       "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Endereço de e-mail: ", // note the space after ":"

       // For emailing grades, asks user if list of questions and scores should be sent.
       "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Incluir lista de questões e pontuações: ", // note the space after ":"

       // For emailing grades, asks user if answer key should be sent...
       "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Incluir chave de respostas: ", // note the space after ":"
      
       // For emailing grades, appears before text box for optional instructor message.
       "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Mensagem a incluir no e-mail (opcional):",

       // Window title for View Report window
       "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - relatório de classificação",

       // Title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Histograma de classificações",

       // Y-Axis (vertical) title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Submissões",

       // X-Axis (horizontal) title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Pontos conseguidos",

       // Label of "Email Me Report" button in View Report window
       "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Enviar-me o relatório por e-mail",

       // Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
       "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Este relatório foi enviado para",
    
       // Message to show the user in the top-left cell of the Grading sheet when grading starts.
       "FLB_STR_GRADING_CELL_MESSAGE" : "Classificando as submissões mais recentes...",
    
       // Message that pops up to notify the user that autograde is on.
       "FLB_STR_AUTOGRADE_IS_ON" : "Classificação automática ativada. Flubaroo aguarda novas submissões para classificar. Não faça qualquer alteração a qualquer folha até desativar a classificação automática.",

       // Message that pops up to notify the user that autograde is on.
       "FLB_STR_AUTOGRADE_IS_OFF" : "Classificação automática desativada.",
    
       // Message to ask the user if they want to grade recent, ungraded submissions, before autograde is enabled.
       "FLB_STR_AUTOGRADE_GRADE_RECENT" : "As submissões mais recentes ainda não foram classificadas. Deseja que Flubaroo as classifique antes de ativar a classificação automática?",

       // Message to tell the user that autograde must gather grading and email settings before being turned on.     
       "FLB_STR_AUTOGRADE_SETUP" : "Antes de ativar a classificação automática deve configurar as definições relativas à classificação e ao e-mail. Clique em 'OK' para prosseguir.",

       // Message asking user if they'd like to update their grading and email settings before turning on autograde.
       "FLB_STR_AUTOGRADE_UPDATE" : "Antes de ativar a classificação automática, deseja atualizar as definições de classificação e e-mail?",
    
       // Title of Advanced Options window
       "FLB_STR_ADV_OPTIONS_WINDOW_TITLE" : "Opções avançadas",

       // Advanced Options notice that appears at the top of the window, telling the user to read the help center articles.
       "FLB_STR_ADV_OPTIONS_NOTICE" : "Antes de modificar estas opções leia os artigos da ajuda a elas referentes",
    
       // Text for Advanced Options, describing option to not use noreply@ email address when sending grades.     
       "FLB_STR_ADV_OPTIONS_NO_NOREPLY" : "Usar o meu endereço de e-mail ao enviar as classificações, em vez de noreply@ .",
   
       // Text for Advanced Options, describing option to send each student a link to edit their response.
       "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK" : "Após a submissão, enviar uma mensagem de e-mail automática ao aluno para poder editar as suas respostas.",
    
       // Text for Advanced Options, describing option to change the 70% pass rate.
       "FLB_STR_ADV_OPTIONS_PASS_RATE" : "Percentagem abaixo da qual o aluno surge em letras vermelhas: ",

       // Message about how many more emails user can send that day. Shown from the Advanced > Check Email Quota menu. 
       "FLB_STR_EMAIL_QUOTA_MSG" : "Dispõe desta quantidade de mensagens na sua quota diária: ",

       "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Pontos",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "Você deve selecionar pelo menos uma pergunta que identifica um estudante antes de continuar.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "Você deve selecionar pelo menos uma pergunta que é gradeable.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Você deve selecionar uma chave de resposta antes de continuar.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Grading normal",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Votação por Hand (Novo!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "Autograde não pode ser habilitado porque você tem uma ou mais perguntas que estão definidos para serem classificados mão.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "Você selecionou uma ou mais questões a serem classificados pela mão. Mas de classificação não pode continuar porque a algumas dessas perguntas não são distintos um do outro. Por exemplo, você pode ter duas questões ambos intitulados \"Pergunta\". Por favor, modificar o texto dessas questões na linha 1, de modo que eles são exclusivos (ou seja, \"questão 1\" e \"Pergunta 2\"), e em seguida, tente novamente a classificação.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Mão Graded",

        "FBL_STR_MANUAL_GRADING_INSTR": "Use os controles abaixo para atribuir notas à mão. Note que isto só irá funcionar corretamente em perguntas para as quais você selecionou \"Votação por Hand\" no Passo 1 de classificação.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "Votação Perguntas de Mão",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "Não há pontos atribuídos",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Os comentários feitos pelo seu instrutor",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Flubaroo - Votação Perguntas de Mão",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Selecione Aluno:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Selecione Pergunta:",

        "FLB_STR_MANUAL_GRADING_STEP3": "Submissão de 3. Leia Aluno:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Digite Notes para Student (enviado no e-mail):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "avaliação chave de resposta",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Definir Grade",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "Trabalhando",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "Grau foi aplicada.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "Por favor, indique um grau válido.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Um erro ocorreu.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "Fechar",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "Autograde está actualmente a classificação de um ou mais novas submissões, portanto, não pode ser desativado. Tente novamente em breve.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Uma folha de classes não foi criado porque não se pronunciou válido foi encontrado.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Grades corrompidos Folha - Não é possível continuar",

        "FLB_STR_INVALID_GRADES_SHEET": "<p> Flubaroo não pode continuar porque sua folha de classes foi corrompido. Você talvez excluir linhas, colunas ou outros dados da folha de classes depois da classificação última concluída? </ P> <p> Veja <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> este artigo </a> para assistência. </ p>",

        "FLB_STR_DO_NOT_DELETE_MSG": "Destinados a assegurar funções FLUBAROO corretamente, não eliminar linhas ou colunas nesta folha",

        "FLB_STR_GRADES_SHARE_LABEL": "Grade Método Partilha:",

        "FLB_STR_GRADES_SHARE_EMAIL": "Partilhar por e-mail (típico)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Partilhar por Google Drive (nenhum e-mail)",

        "FLB_STR_GRADES_SHARE_BOTH": "Partilhar por e-mail e Google Drive",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "Flubaroo - Classificações Compartilhados",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Votação para",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Clique para ver este relatório classificações no Google Drive",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - Imprimir Classificações",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo irá criar um único documento do Google contendo notas para todos os estudantes que você pode então imprimir e distribuir. Você pode especificar uma mensagem a incluir em cada documento, bem como se pretende incluir a lista de perguntas e / ou as respostas corretas.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Compartilhar Classificações",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo pode compartilhar com cada aluno sua classificações por e-mail, o Google Drive, ou ambos. Utilize o menu suspenso para selecionar a pergunta que pediu aos alunos de seu endereço de e-mail. Se os endereços de e-mail não foram coletados, então você não será capaz de compartilhar classificações.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "Um documento do Google foi criado contendo todas as notas dos alunos. Clique no nome do arquivo abaixo para abri-lo. Em seguida, imprimi-lo e entregá cada aluno sua impressão.",

        "FLB_STR_MENU_SHARE_GRADES": "Compartilhar Classificações",

        "FLB_STR_MENU_PRINT_GRADES": "Imprimir Classificações",

       // Flubaroo Tips, shown when grading completes.
       "FLB_STR_TIP_MSG_NUMBER_1" : "<b>Flubaroo Dica #1:</b> Flubaroo pode aceitar mais do que uma resposta correta.",
       "FLB_STR_TIP_MSG_NUMBER_2" : "<b>Flubaroo Dica #2:</b> Flubaroo pode classificar intervalos numéricos para questões de matemática a ciências.",
       "FLB_STR_TIP_MSG_NUMBER_3" : "<b>Flubaroo Dica #3:</b> DOG vs dog? Ter em consideração maiúsculas e minúsculas.",
       "FLB_STR_TIP_MSG_NUMBER_4" : "<b>Flubaroo Dica #4:</b> Deseja alterar a percentagem de 70% para positiva?",
       "FLB_STR_TIP_MSG_NUMBER_5" : "<b>Flubaroo Dica #5:</b> Precisa de verificar a utilização da sua quota diária de e-mail??",
       "FLB_STR_TIP_MSG_NUMBER_6" : "<b>Flubaroo Dica #6:</b> Deseja que as tarefas sejam classificadas automaticamente?",
       "FLB_STR_TIP_MSG_NUMBER_7" : "<b>Flubaroo Dica #7:</b> Tem perguntas? Nós temos respostas na secção de FAQs!", 
   },
   // END PT-PORTUGUESE ////////////////////////////////////////////////////////////////////////////////
  
   // START BR-PORTUGUESE ////////////////////////////////////////////////////////////////////////////////
   "pt-br": {
    	"FLB_LANG_IDENTIFIER": "Português BR (Brazilian Portuguese)",

    	"FLB_STR_GRADING_OPT_STUD_ID" : "Identificação do aluno",

    	"FLB_STR_GRADING_OPT_SKIP_GRADING" : "Não avaliar",

    	"FLB_STR_GRADING_OPT_1_PT" : "1 Ponto",

    	"FLB_STR_GRADING_OPT_2_PT" : "2 Pontos",

    	"FLB_STR_GRADING_OPT_3_PT" : "3 Pontos",

    	"FLB_STR_GRADING_OPT_4_PT" : "4 Pontos",

    	"FLB_STR_GRADING_OPT_5_PT" : "5 Pontos",

    	"FLB_STR_RESULTS_MSG1" : "A avaliação foi finalizada! Uma nova planilha foi criada.	Esta planilha contém a avaliação para cada formulário submetido pelos alunos e um resumo na parte superior. **Observação: a planilha que contém a avaliação não deve ser modificada, pois isso pode interferir no envio das avaliações por E-mail. Se você precisar modificar esta planilha, sugerimos que faça uma cópia para as modificações",

        "FLB_STR_RESULTS_MSG2" : "Aviso: A última linha apresenta o percentual de estudantes que responderam corretamente cada questão. As perguntas com acertos inferiores a 70% são destacadas com fundo de cor alaranjada. Além disso, as identificações dos estudantes cujos acertos foram inferiores a 70% são destacadas com fonte de cor alaranjada",
    
    	"FBL_STR_STEP1_INSTR" : "Por favor, selecione uma opção de avaliação para cada uma das questões. Flubaroo foi desenvolvido para identificar a opção adequada, mas é necessário confirmar se a opção escolhida para cada questão esta correta",

    	"FBL_STR_STEP2_INSTR" : "Por favor, selecione o formulário que será utilizado como padrão para avaliação das respostas. Normalmente, deve ser um formulário enviado por você com as respostas corretas. As respostas do formulário selecionado serão comparadas com as respostas de todos os demais formulários submetidos. Portanto, selecione o formulário padrão com atenção.",

        "FLB_STR_RESULTS_TIP_READ_ARTICLE" : "Clique <a target=_blank href=\"%s\">aqui</a> para descobrir mais.",

    	"FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Importante: é preciso haver pelo menos duas submissões com respostas para avaliação. Tente novamente quando existirem pelo menos duas submissões.",

    	"FLB_STR_WAIT_INSTR1" : "Flubaroo está avaliando as respostas. Por favor, espere...",

    	"FLB_STR_WAIT_INSTR2" : "Por favor espere, as respostas estão sendo avaliadas. Este processo pode levar alguns minutos para ser finalizado.",

    	"FLB_STR_REPLACE_GRADES_PROMPT" : "As avaliações anteriores serão substituídas. Tem certeza de que quer continuar?",

        "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Preparando para avaliar",

    	"FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Avaliando o seu formulário",

    	"FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Avaliação finalizada!",

    	"FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Avaliação: primeiro passo",

    	"FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Avaliação: segundo passo",

    	"FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Opções de avaliação",

    	"FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Questão",

    	"FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Selecione",

    	"FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Data da submissão",

    	"FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Ver avaliação",

    	"FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Resultados",

    	"FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Relatório para",

    	"FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Pontos possíveis",

    	"FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Pontuação média",

    	"FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Número de formulários submetidos",

    	"FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Formulários com acertos inferiores a 70%",

    	"FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Pontos totais",

    	"FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Percentual",

    	"FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Número de submissões",

    	"FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Avaliação enviada por E-mail?",

    	"FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Comentário para o aluno (opcional)",

    	"FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Envio das avaliações",

        "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo pode enviar por E-mail as avaliações, bem como as respostas corretas. Use o menu abaixo para selecionar a questão referente ao endereço de E-mail. Se os endereços de E-mail não foram requisitados no formulário não será possível enviar as avaliações.",

        "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo não pôdeenviar as avaliações por E-mail neste momento porque você excedeu a sua cota diária de E-mails enviados. Esta cota é definida pelo Google para todos os seus complementos. Por favor, tente novamente mais tarde.",

    	"FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "avaliações foram enviadas com sucesso.",

    	"FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "avaliações não foram enviadas porque os E-mails não foram indicados ou eram inválidos ou porque já foram enviadas ou porque a sua cota de E-mails enviados foi excedida.",

    	"FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Nenhuma avaliação foi enviada porque os E-mails não foram indicados ou eram inválidos ou porque os já foram enviadas ou porque a sua cota de E-mails enviados foi excedida.",

        "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Aqui estão os resultados referentes a avaliação do formulário:",

    	"FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Este E-mail contém a avaliação para",

    	"FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Por favor não responda a este E-mail",

    	"FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Avaliação",

        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Encontre abaixo uma mensagem do seu professor(a) enviada para toda a turma",

    	"FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Mensagem individual do seu professor(a)",

    	"FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Resumo da sua avaliação",

    	"FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Abaixo está a sua pontuação para cada pergunta",

    	"FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Abaixo está a sua pontuação para cada pergunta, bem como a resposta correta",

    	"FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Pergunta",

    	"FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Sua resposta",

    	"FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Resposta correta",

    	"FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Sua pontuação",

    	"FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Pontos possíveis",

    	"FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Texto de ajuda para esta questão",

    	"FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "ponto(s)",

    	"FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Correta",

    	"FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Incorreta",

    	"FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Este E-mail foi gerado por Flubaroo, um complemento gratuíto para analisar e avaliar formulários",

    	"FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Visite flubaroo.com",

    	"FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Informações sobre o envio das suas avaliações para:",

    	"FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Nome do formulário",

    	"FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Total de E-mails enviados",

    	"FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Número de formulários submetidos",

    	"FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Pontuação média (pontos)",

    	"FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Pontuação máxima possível",

    	"FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Respostas corretas enviadas?",

    	"FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Não",

    	"FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Sim",

    	"FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Você também incluiu como mensagem",

        "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo é uma ferramenta gratuita que permite ganhar tempo ao avaliar formulários rapidamente de maneira automatizada.",

    	"FLB_STR_ABOUT_FLUBAROO_MSG2" : "Para descobrir mais sobre o Flubaroo visite www.flubaroo.com.",

    	"FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo não pôde determinar o formulário de cálculo que contém as submissões dos estudantes. Por favor localize este formulário e o renomeie como: ",

    	"FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo não pode determinar o formulário de cálculo que contém as submissões dos estudantes. Por favor, avalie novamente o formulário ou o localize e renomeie com: ",

    	"FLB_STR_MENU_GRADE_ASSIGNMENT" : "Avaliar formulário",

    	"FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Avaliar novamente",

    	"FLB_STR_MENU_EMAIL_GRADES" : "Enviar avaliações",

    	"FLB_STR_MENU_HIDE_FEEDBACK" : "Ocultar os comentários de ajuda das questões",

    	"FLB_STR_MENU_EDIT_FEEDBACK" : "Mostrar os comentários de ajuda das questões",

    	"FLB_STR_MENU_HIDE_HELP_TIPS" : "Ocultar comentários de ajuda",

    	"FLB_STR_MENU_EDIT_HELP_TIPS" : "Mostrar comentários de ajuda",

    	"FLB_STR_MENU_VIEW_REPORT" : "Ver relatório",

    	"FLB_STR_MENU_ABOUT" : "A respeito do Flubaroo",

        "FLB_STR_MENU_ADVANCED" : "Avançado",

        "FLB_STR_MENU_ADV_OPTIONS" : "Opções avançadas",

        "FLB_STR_MENU_ENABLE_AUTO_GRADE" : "Permitir autoavaliação",

        "FLB_STR_MENU_DISABLE_AUTO_GRADE" : "Impedir autoavaliação",

        "FLB_STR_MENU_SHOW_EMAIL_QUOTA" : "Conferir a cota de E-mails",

        "FLB_STR_MENU_ENABLE" : "Ativar Flubaroo neste formulário",

    	"FLB_STR_FLUBAROO_NOW_ENABLED" : "Flubaroo foi ativado neste formulário. Agora você pode acessar o menu deste complemento.",

        "FLB_STR_MENU_SET_LANGUAGE" : "Selecionar idioma",

    	"FLB_STR_BUTTON_CONTINUE" : "Continuar",

    	"FLB_STR_SHEETNAME_STUD_SUBM" : "Respostas",

    	"FLB_STR_SHEETNAME_GRADES" : "Avaliações",

    	"FLB_STR_NOT_GRADED" : "Não avaliada",

    	"FLB_STR_NEW_VERSION_NOTICE" : "Você instalou uma nova versão do Flubaroo! Visite flubaroo.com/blog para ver quais são as novidades.",

    	"FLB_STR_NOTIFICATION" : "Notificação do Flubaroo",

    	"FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "A questão que contém o E-mail: ",

    	"FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Incluir na lista de perguntas e pontuações: ",

    	"FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Incluir a resposta correta no E-mail: ",

    	"FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Adicionar um comentário ao E-mail (opcional):",

    	"FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Relatório de avaliações",

    	"FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Histograma de avaliações",

    	"FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Submissões",

    	"FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Respostas corretas",

    	"FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Me envie estas informações por E-mail",

    	"FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "O E-mail foi enviado para",

        "FLB_STR_GRADING_CELL_MESSAGE" : "Avaliando as últimas submissões...",
 	 
    	"FLB_STR_AUTOGRADE_IS_ON" : "A autoavaliação está ativada. Flubaroo está aguardando por novas submissões para avaliar. Não modifique nenhuma planilha enquanto a opção autoavaliação estiver ativada.",

    	"FLB_STR_AUTOGRADE_IS_OFF" : "A autoavaliação foi desativada.",
 	 
        "FLB_STR_AUTOGRADE_GRADE_RECENT" : "Algumas submissões recentes podem ser avaliadas. Você gostaria que o Flubaroo avaliasse estas submissões antes que a autoavaliação seja ativada?",

    	"FLB_STR_AUTOGRADE_SETUP" : "Antes de ativar a autoavaliação você precisa configurar as opções de avaliação e E-mail. Clique 'OK' para prosseguir.",
 
    	"FLB_STR_AUTOGRADE_UPDATE" : "Antes de ativar a autoavaliação, você gostaria de atualizar a avaliação e as opções E-mail?",
 	 
    	"FLB_STR_ADV_OPTIONS_WINDOW_TITLE" : "Opções avançadas",

    	"FLB_STR_ADV_OPTIONS_NOTICE" : "Apenas modifique estas opções se você tiver conhecimento sobre os artigos relacionados na seção de ajuda",
 	 
    	"FLB_STR_ADV_OPTIONS_NO_NOREPLY" : "Use o meu endereço de E-mail para o retorno de E-mails referentes a avaliação ao invés do endereço noreply@.",
	 
    	"FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK" : "No momento da submissão, envie um E-mail automático para o estudante com um link para edição rápida das suas respostas.",
 	 
    	"FLB_STR_ADV_OPTIONS_PASS_RATE" : "Percentual abaixo do qual a avaliação do estudante será evidenciada em vermelho: ",

    	"FLB_STR_EMAIL_QUOTA_MSG" : "A sua cota diária de E-mails restantes é: ",
 	 
        "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Pontos",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "Você deve selecionar pelo menos uma pergunta que identifica um estudante antes de continuar.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "Você deve selecionar pelo menos uma pergunta que é gradeable.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Você deve selecionar uma chave de resposta antes de continuar.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Grading normal",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Votação por Hand (Novo!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "Autograde não pode ser habilitado porque você tem uma ou mais perguntas que estão definidos para serem classificados mão.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "Você selecionou uma ou mais questões a serem classificados pela mão. Mas de classificação não pode continuar porque a algumas dessas perguntas não são distintos um do outro. Por exemplo, você pode ter duas questões ambos intitulados \"Pergunta\". Por favor, modificar o texto dessas questões na linha 1, de modo que eles são exclusivos (ou seja, \"questão 1\" e \"Pergunta 2\"), e em seguida, tente novamente a classificação.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Mão Graded",

        "FBL_STR_MANUAL_GRADING_INSTR": "Use os controles abaixo para atribuir notas à mão. Note que isto só irá funcionar corretamente em perguntas para as quais você selecionou \"Votação por Hand\" no Passo 1 de classificação.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "Votação Perguntas de Mão",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "Não há pontos atribuídos",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Os comentários feitos pelo seu instrutor",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Flubaroo - Votação Perguntas de Mão",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Selecione Aluno:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Selecione Pergunta:",

        "FLB_STR_MANUAL_GRADING_STEP3": "Submissão de 3. Leia Aluno:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Digite Notes para Student (enviado no e-mail):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "avaliação chave de resposta",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Definir Grade",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "Trabalhando",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "Grau foi aplicada.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "Por favor, indique um grau válido.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Um erro ocorreu.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "Fechar",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "Autograde está actualmente a classificação de um ou mais novas submissões, portanto, não pode ser desativado. Tente novamente em breve.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Uma folha de classes não foi criado porque não se pronunciou válido foi encontrado.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Grades corrompidos Folha - Não é possível continuar",

        "FLB_STR_INVALID_GRADES_SHEET": "<p> Flubaroo não pode continuar porque sua folha de classes foi corrompido. Você talvez excluir linhas, colunas ou outros dados da folha de classes depois da classificação última concluída? </ P> <p> Veja <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> este artigo </a> para assistência. </ p>",

        "FLB_STR_DO_NOT_DELETE_MSG": "Destinados a assegurar funções FLUBAROO corretamente, não eliminar linhas ou colunas nesta folha",

        "FLB_STR_GRADES_SHARE_LABEL": "Grade Método Partilha:",

        "FLB_STR_GRADES_SHARE_EMAIL": "Partilhar por e-mail (típico)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Partilhar por Google Drive (nenhum e-mail)",

        "FLB_STR_GRADES_SHARE_BOTH": "Partilhar por e-mail e Google Drive",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "Flubaroo - Avaliações Compartilhados",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Votação para",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Clique para ver este relatório grau no Google Drive",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - Imprimir Avaliações",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo irá criar um único documento do Google contendo notas para todos os estudantes que você pode então imprimir e distribuir. Você pode especificar uma mensagem a incluir em cada documento, bem como se pretende incluir a lista de perguntas e / ou as respostas corretas.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Compartilhar Avaliações",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo pode compartilhar com cada aluno sua nota via e-mail, o Google Drive, ou ambos. Utilize o menu suspenso para selecionar a pergunta que pediu aos alunos de seu endereço de e-mail. Se os endereços de e-mail não foram coletados, então você não será capaz de compartilhar notas.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "Um documento do Google foi criado contendo todas as notas dos alunos. Clique no nome do arquivo abaixo para abri-lo. Em seguida, imprimi-lo e entregá cada aluno sua impressão.",

        "FLB_STR_MENU_SHARE_GRADES": "Compartilhar Avaliações",

        "FLB_STR_MENU_PRINT_GRADES": "Imprimir Avaliações",
     
    	"FLB_STR_TIP_MSG_NUMBER_1" : "<b>Flubaroo dica #1:</b> Flubaroo pode aceitar mais de uma resposta correta.",

    	"FLB_STR_TIP_MSG_NUMBER_2" : "<b>Flubaroo dica #2:</b> Flubaroo pode avaliar séries numéricas para exercícios científicos e matemáticos.",

    	"FLB_STR_TIP_MSG_NUMBER_3" : "<b>Flubaroo dica #3:</b> CÃO vs cão? Flubaroo pode avaliar repostas considerando letras maiúsculas ou minúsculas.",

    	"FLB_STR_TIP_MSG_NUMBER_4" : "<b>Flubaroo dica #4:</b> Quer mudar a pontuação de corte padrão de 70%?",

    	"FLB_STR_TIP_MSG_NUMBER_5" : "<b>Flubaroo dica #5:</b> Precisa checar a sua cota de E-mails restantes?",

    	"FLB_STR_TIP_MSG_NUMBER_6" : "<b>Flubaroo dica #6:</b> Quer que o seu exercício seja avaliado automaticamente?",

    	"FLB_STR_TIP_MSG_NUMBER_7" : "<b>Flubaroo Tip #7:</b> Está com dúvidas? Nós temos as respostas no FAQs!",
	},
	// END PORTUGUESE (Brasil) ////////////////////////////////////////////////////////////////////////////


   // START Dansk ////////////////////////////////////////////////////////////////////////////////
   "da-dk": {
       // Name to identify language in language selector
       "FLB_LANG_IDENTIFIER": "Dansk (Danish)",


       // Grading option which identifies a student
       "FLB_STR_GRADING_OPT_STUD_ID" : "Identificerer elev",


       // Grading option which tells Flubaroo to skip grading on a question
       "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Skal ikke rettes",


       // Grading option for 1 point
       "FLB_STR_GRADING_OPT_1_PT" : "1 Point",


       // Grading option for 2 points
       "FLB_STR_GRADING_OPT_2_PT" : "2 Point",


       // Grading option for 3 points
       "FLB_STR_GRADING_OPT_3_PT" : "3 Point",


       // Grading option for 4 points
       "FLB_STR_GRADING_OPT_4_PT" : "4 Point",


       // Grading option for 5 points
       "FLB_STR_GRADING_OPT_5_PT" : "5 Point",


       // Message shown when grading is complete (1 of 2).
       "FLB_STR_RESULTS_MSG1" : "Et nyt ark med navnet ‘Grades’ er oprettet. Dette ark indeholder rettelser for hvert enkelt svar, og en oversigt over alle svar i toppen af arket. Den sidste række indeholder den procentsats af elever der har besvaret hvert enkelt spørgsmål korrekt, og den laveste score fremhævet med orange. De elever der har scoret mindre end beståelsesprocenten er fremhævet med rødt.",


       // Message shown when grading is complete (2 of 2).
       "FLB_STR_RESULTS_MSG2" : "<b>IMPORTANT</b>: 'Grades' arket må ikke ændres, da det kan betyde at der ikke kan sendes auto-svar ud til eleverne. Hvis du har brug for at ændre i dette ark, skal du lave en kopi af arket og lave ændringer i din kopi.",
      
       // Follows the Flubaroo tip, directing users to read the corresponding article.
       "FLB_STR_RESULTS_TIP_READ_ARTICLE" : "Klik <a target=_blank href=\"%s\">her</a> for at læse mere.",
      
       // Instructions shown on Step 1 of grading.
       "FBL_STR_STEP1_INSTR" : "Du skal vælge en rette mulighed til hvert enkelt spørgsmål i din quiz. Flubaroo har gjort sit bedste for at vælge den bedste mulighed for dig, men du bør tjekke hvert enkelt spørgsmål. Således at du sikrer dig, at den rigtige mulighed er valgt.",


       // Instructions shown on Step 2 of grading.
       "FBL_STR_STEP2_INSTR" : "Du skal vælge hvilket svar, der skal bruges som rettenøgle. Det vil oftest være det svar du selv har indsendt. Alle andre svar, vil blive rettet i forhold til dette svar, du skal derfor være sikker på at du vælger det rigtige svar.",


       // Message shown if not enough submissions to perform grading.
       "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Der er ikke nok svar for at kunne automatisk rette dine svar. Du skal sikre dig at der et facit svar, og mindst et ekstra svar. Prøv igen når der er mindst 2 svar i dit regneark.",


       // Please wait" message first shown when Flubaroo is first examining assignment.
       "FLB_STR_WAIT_INSTR1" : "Flubaroo undersøger dine svar. Vent venligst...",


       // Please wait" message shown after Step 1 and Step 2, while grading is happening.
       "FLB_STR_WAIT_INSTR2" :  "Vent venligst, medens dine svar bliver rettet. Der kan gå et minut eller to.",


       // Asks user if they are sure they want to re-grade, if Grades sheet exists.
       "FLB_STR_REPLACE_GRADES_PROMPT" : "Dette vil erstatte dine eksisterende rettelser. Er du sikker på at du vil fortsætte?",


       // Window title for "Preparing to grade" window
       "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Gør klar til at rette",


       // Window title for "Please wait" window while grading occurs
       "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Retter dine svar",


       // Window title for "Grading Complete" window after grading occurs
       "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Rettelser færdiggjort",


       // Window title for grading Step 1
       "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Rettelser trin 1",


       // Window title for grading Step 2
       "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Rettelser trin 2",


       // "Grading Option" label that appears over first column in Step 1 of grading.
       "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Rette muligheder",


       // "Question" label that appears over second column in Step 1 of grading.
       "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Spørgsmål",


       // "Select" label that appears over radio button in first column of Step 2 of grading.
       "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Vælg",


       // "Submission Time" label that appears over second column in Step 2 of grading.
       "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Svar tidspunkt",


       // Label for "View Grades" button shown when grading completes.
       "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Se rettelser",


       // Used for "summary" text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Oversigt",


       // Used for report and report email. Ex: "Report for 'My Test'"
       "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Rapport til",


       // Points Possible. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Antal mulige point",


       // Average Points. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Gennemsnitlige point",


       // Counted Submissions. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Antal svar",


       // Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
       "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Antal af lavt scorede spørgsmål",


       // Name of column in Grades sheet that has total points scored.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Total antal points",


       // Name of column in Grades sheet that has score as percent.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Procent",


       // Name of column in Grades sheet that has number of times student made a submission.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Antal indsendte svar",


       // Name of column in Grades sheet that indicates if grade was already emailed out.
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Rettelse sendt med email?",


       // Name of column in Grades sheet that allows teacher to enter optional student feedback
       "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Feedback til elev (Valgfri)",


       // Window title for emailing grades
       "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Email rettelser",


       // Instructions on how to email grades
       "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo kan sende en email til hver enkelt elev, med deres rettelse, såvel som de rigtige svar. Du skal bruge drop-ned menuen for at vælge det spørgsmål som du har brugt for at indhente elevernes emailadresse.- Hvis du IKKE har indhentet emailadresserne, vil det ikke være muligt at sende rettelserne med email.",


       // Notice that grades cannot be emailed because the user has exceeded their daily quota.
       "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo kan ikke sende email, du har overskredet din daglige email kvote, den er bestemt af Google. Prøv igen senere.",
    
       // Message about how many grade emails *have* been sent. This message is preceeded by a number.
       // Example: "5 grades were successfully emailed"
       "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "rettelser sendt med email .",


       // Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
       "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "rettelser blev ikke sendt, enten pga. mailadresse ikke angivet, eller forkert mailadresse angivet. Eller fordi email allerede er sendt til elev, eller fordi du har overskredet din daglige mail kvote.",


       // Message about how many grade emails *have NOT* been sent.
       "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "rettelser blev ikke sendt, enten pga. mailadresse ikke angivet, eller forkert mailadresse angivet. Eller fordi email allerede er sendt til elev, eller fordi du har overskredet din daglige mail kvote.",    
    
       // Subject of the email students receive. Followed by assignment name.
       // Example: Here is your grade for "Algebra Quiz #6"
       "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Her er din rettelse til",


       // First line of email sent to students
       // Example: This email contains your grade for "Algebra Quiz #6"
       "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Denne email indeholder din rettelse til",


       // Message telling students not to reply to the email with their grades
       "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Denne email kan ikke besvares",


       // Message that preceedes the student's grade
       "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Din rettelse",


       // Message that preceedes the instructor's (optional) message in the email
       "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Herunder er en besked fra din underviser, sendt til hele klassen",


       // Message that preceedes the instructor's (optional) feedback for the student in the email
       "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Din underviser har denne feedback til dig",


       // Message that preceedes the summary of the student's information (name, date, etc)
       "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Oversigt over dit svar",


       // Message that preceedes the table of the students scores (no answer key sent)
       "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Herunder er din score til hvert af dine svar",


       // Message that preceedes the table of the students scores, and answer key
       "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Herunder er din score til hvert spørgsmål, sammen med det rigtige svar",


       // Header for the  column in the table of scores in the email which lists the question asked.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Spørgsmål",


       // Header for the  column in the table of scores in the email which lists the student's answer.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Dit svar",


       // Header for the  column in the table of scores in the email which lists the correct answer.
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Rigtigt svar",


       // Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Din score",


       // Header for the  column in the table of scores in the email which lists the points possible (e.g. 5).
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Antal mulige point",


       // Header for the  column in the table of scores in the email which lists the Help Tip (if provided)
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Hjælp til dette spørgsmål",


       // Label for "points" used in the new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "point",


       // Label for "Correct" questions in new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Rigtigt",


       // Label for "Incorrect" questions in new style email summary of grades
       "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Forkert",


       // Footer for the email sent to students, advertising Flubaroo.
       "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Denne email er genereret af Flubaroo, et gratis værktøj til at rette og evaluere",


       // Link at the end of the footer. Leads to www.flubaroo.com
       "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Besøg flubaroo.com",


       // Subject of the record email sent to the instructor, when grades are emailed to the class.
       // Followed by the assignment name.
       // e.g. Record of grades emailed for Algebra Quiz #6
       "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Optegnelse over rettelser emailed til",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the name of the assignment, in the summary table.
       "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Opgave navn",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the number of emails sent, in the summary table.
       "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Antal af sendte emails",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the number of graded submissions, in the summary table
       "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Antal af rettede svar",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the average score in points (vs percent), in the summary table
       "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Gennemsnits score (point)",


       // Used in the record email sent to the instructor after she emails grades.
       // Labels the points possible, in the summary table
       "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Antal mulige point",


       // Used in the record email sent to the instructor after she emails grades.
       // Indicated if an answer key was provided to the students, in the summary table
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Rettenøgle vedlagt?",


       // Used in the record email sent to the instructor after she emails grades.
       // Value in summary table if answer key was NOT sent to students by instructor
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Nej",


       // Used in the record email sent to the instructor after she emails grades.
       // Value in summary table if answer key WAS sent to students by instructor
       "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Ja",


       // Used in the record email sent to the instructor after she emails grades.
       // Message that preceeds what message the instructor email to her students.
       "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Du har også medsendt denne besked",


       // About Flubaroo message (1 of 2)
       "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo er et gratis, tidsbesparende værktøj der giver undervisere mulighed for hurtigt at rette multiple choice quizzer og analysere resultaterne.",


       // About Flubaroo message (2 of 2)
       "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Vil du vide mere, så besøg www.flubaroo.com.",


       // Message that appears when "Student Submissions" sheet cannot be located.
       "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo kunne ikke afgøre hvilket ark der indeholder elev-svar. Du skal lokalisere arket og omdøbe det til: ",


       // Message that appears when "Grades" sheet cannot be located.
       "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo kunne ikke finde arket med rettelser. Du skal rette svarene eller lokalisere arket og omdøbe det til: ",


       // Menu option to grade assignment.
       "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Ret opgaverne",


       // Menu option to re-grade assignment.
       "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Gen-ret opgaverne",


       // Menu option to email grades.
       "FLB_STR_MENU_EMAIL_GRADES" : "Email rettelser",


       // Menu option to hide student feedback (hides the column)
       "FLB_STR_MENU_HIDE_FEEDBACK" : "Skjul elev feedback",


       // Menu option to edit student feedback (unhides the column)
       "FLB_STR_MENU_EDIT_FEEDBACK" : "Ret i elev feedback",


       // Menu option to hide help tips
       "FLB_STR_MENU_HIDE_HELP_TIPS" : "Skjul hjælpe tips",


       // Menu option to edit help tips
       "FLB_STR_MENU_EDIT_HELP_TIPS" : "Ret i hjælpe tips",


       // Menu option to view report.
       "FLB_STR_MENU_VIEW_REPORT" : "Se rapport",


       // Menu option to learn About Flubaroo.
       "FLB_STR_MENU_ABOUT" : "Om Flubaroo",


       // Menu title for "Advanced" sub-menu
       "FLB_STR_MENU_ADVANCED" : "Avanceret",
    
       // Menu title for Advanced > Options
       "FLB_STR_MENU_ADV_OPTIONS" : "Avancerede indstillinger",
    
       // Menu option to choose the language.
       "FLB_STR_MENU_SET_LANGUAGE" : "Vælg sprog",


       // Menu option to enable autograde.
       "FLB_STR_MENU_ENABLE_AUTO_GRADE" : "Aktivér auto-rettelse",


       // Menu option to disable autograde.
       "FLB_STR_MENU_DISABLE_AUTO_GRADE" : "De-aktiver auto-rettelse",
    
       // Menu option to see reamining daily email quota
       "FLB_STR_MENU_SHOW_EMAIL_QUOTA" : "Tjek email kvote",
    
       // Menu option shown to enable Flubaroo in a sheet where it's never been used before
       "FLB_STR_MENU_ENABLE" : "Aktivér Flubaroo i dette ark",
    
       // Message to show when menu option for FLB_STR_MENU_ENABLE is chosen
       "FLB_STR_FLUBAROO_NOW_ENABLED" : "Flubaroo er aktiveret i dette ark. Du kan nu vælge det i menuen.",
    
       // Word that appears on the "Continue" button in grading and emailing grades.
       "FLB_STR_BUTTON_CONTINUE" : "Fortsæt",


       // Name of "Student Submissions" sheet
       "FLB_STR_SHEETNAME_STUD_SUBM" : gbl_subm_sheet_name,    


       // Name of "Grades" sheet
       "FLB_STR_SHEETNAME_GRADES" : gbl_grades_sheet_name,


       // Text put in Grades sheet when a question isnt graded.
       "FLB_STR_NOT_GRADED" : "Ikke rettet",


       // Message that is displayed when a new version of Flubaroo is installed.
       "FLB_STR_NEW_VERSION_NOTICE" : "Du har installeret en ny version af Flubaroo! Besøg flubaroo.com/blog for at læse de seneste nyheder.",


       // Headline for notifications / alerts.
       "FLB_STR_NOTIFICATION" : "Flubaroo Notifikation",


       // For emailing grades, question which asks user to identify email question.
       "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Email addresse spørgsmål: ", // note the space after ":"


       // For emailing grades, asks user if list of questions and scores should be sent.
       "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Inkludér liste med spørgsmål og score: ", // note the space after ":"


       // For emailing grades, asks user if answer key should be sent...
       "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Inkludér rettenøgle: ", // note the space after ":"
      
       // For emailing grades, appears before text box for optional instructor message.
       "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Besked der skal sendes med email (valgfri):",


       // Window title for View Report window
       "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Karakter rapport",


       // Title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Histogram over karakterer",


       // Y-Axis (vertical) title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Svar",


       // X-Axis (horizontal) title of historgram chart in report
       "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Scorede point",


       // Label of "Email Me Report" button in View Report window
       "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Email rapporten til mig",


       // Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
       "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Rapporten er blevet send med email til",
    
       // Message to show the user in the top-left cell of the Grading sheet when grading starts.
       "FLB_STR_GRADING_CELL_MESSAGE" : "Retter de seneste svar...",
    
       // Message that pops up to notify the user that autograde is on.
       "FLB_STR_AUTOGRADE_IS_ON" : "Auto-rettelse er aktiveret. Flubaroo venter på nye svar der skal rettes. Du må ikke lave ændringer i dit regneark, så længe auto-rettelse er aktiveret.",


       // Message that pops up to notify the user that autograde is on.
       "FLB_STR_AUTOGRADE_IS_OFF" : "Auto-rettelse er nu de-aktiveret.",
    
       // Message to ask the user if they want to grade recent, ungraded submissions, before autograde is enabled.
       "FLB_STR_AUTOGRADE_GRADE_RECENT" : "Der er svar der endnu ikke er rettet. Vil du have Flubaroo til at rette dem først, inden auto-rettelser bliver aktiveret?",


       // Message to tell the user that autograde must gather grading and email settings before being turned on.     
       "FLB_STR_AUTOGRADE_SETUP" : "Inden du kan aktiverer auto-rettelse skal du gennemgå opsætning til dine rettelser og din email-indstillinger. Klik på ‘OK’ for at fortsætte.",


       // Message asking user if they'd like to update their grading and email settings before turning on autograde.
       "FLB_STR_AUTOGRADE_UPDATE" : "Inden du aktiverer auto-rettelse, kan du opdatere dine rette- og email-indstillinger.",
    
       // Title of Advanced Options window
       "FLB_STR_ADV_OPTIONS_WINDOW_TITLE" : "Avancerede indstillinger",


       // Advanced Options notice that appears at the top of the window, telling the user to read the help center articles.
       "FLB_STR_ADV_OPTIONS_NOTICE" : "Du bør kun ændre disse indstillinger, hvis du har læst den hertil hørende hjælpe artikel",
    
       // Text for Advanced Options, describing option to not use noreply@ email address when sending grades.     
       "FLB_STR_ADV_OPTIONS_NO_NOREPLY" : "Brug min email som svar adresse, når rettelser bliver sendt med email, istedet for at bruge noreply@ addresse.",
      
       // Text for Advanced Options, describing option to send each student a link to edit their response.
       "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK" : "Ved indsendelse af svar, auto-email et link til eleven for at han/hun kan hurtigt ændre sit svar.",
    
       // Text for Advanced Options, describing option to change the 70% pass rate.
       "FLB_STR_ADV_OPTIONS_PASS_RATE" : "Den nedenstående procentsats er gældende for om en elev bliver markeret med rødt: ",


       // Message about how many more emails user can send that day. Shown from the Advanced > Check Email Quota menu. 
       "FLB_STR_EMAIL_QUOTA_MSG" : "Så mange emails har du tilbage i din daglige: ",
    
       // Flubaroo Tips, shown when grading completes.
       "FLB_STR_TIP_MSG_NUMBER_1" : "<b>Flubaroo Tip #1:</b> Flubaroo kan acceptere mere end et svar.",
       "FLB_STR_TIP_MSG_NUMBER_2" : "<b>Flubaroo Tip #2:</b> Flubaroo kan rette numeriske rækkevidde til dine matematik og fysik opgaver.",
       "FLB_STR_TIP_MSG_NUMBER_3" : "<b>Flubaroo Tip #3:</b> HUND vs hund? Rette små-STORE bogstaver svar.",
       "FLB_STR_TIP_MSG_NUMBER_4" : "<b>Flubaroo Tip #4:</b> Vil du ændre den automatiske beståelsesprocent på 70% der er standard?",
       "FLB_STR_TIP_MSG_NUMBER_5" : "<b>Flubaroo Tip #5:</b> Har du brug for at tjekke hvordan det ser ud med din email kvote?",
       "FLB_STR_TIP_MSG_NUMBER_6" : "<b>Flubaroo Tip #6:</b> Vil du have de indsendte svar rettet automatisk?",
       "FLB_STR_TIP_MSG_NUMBER_7" : "<b>Flubaroo Tip #7:</b> Har du spørgsmålene? Vi har svarene i vores FAQs!",
   },
   // END Danish //////////////////////////////////////////////////////////////////////////////////  

// START CZECH ////////////////////////////////////////////////////////////////////////////////
"cs-cs": {
// Name to identify language in language selector
"FLB_LANG_IDENTIFIER": "Čeština (Czech)",

// Grading option which identifies a student
"FLB_STR_GRADING_OPT_STUD_ID" : "Identifikace studenta",

// Grading option which tells Flubaroo to skip grading on a question
"FLB_STR_GRADING_OPT_SKIP_GRADING" : "Přeskočit",

// Grading option for 1 point
"FLB_STR_GRADING_OPT_1_PT" : "1 bod",

// Grading option for 2 points
"FLB_STR_GRADING_OPT_2_PT" : "2 body",

// Grading option for 3 points
"FLB_STR_GRADING_OPT_3_PT" : "3 body",

// Grading option for 4 points
"FLB_STR_GRADING_OPT_4_PT" : "4 body",

// Grading option for 5 points
"FLB_STR_GRADING_OPT_5_PT" : "5 bodů",

// Message shown when grading is complete (1 of 2).
"FLB_STR_RESULTS_MSG1" : "Byl vytvořen nový list s názvem 'Vyhodnocení'. Tento list obsahuje vyhodnocení jednotlivých záznamů a také celkové hodnocení. Poslední řádka ukazuje procento studentů, kteří odpověděli správně. Otázka s nejmenším počtem správných odpovědí je zvýrazněna oranžově. Studenti, kteří nedosáhli požadovaného minima, jsou zvýrazněni červeným písmem.",

// Message shown when grading is complete (2 of 2).
"FLB_STR_RESULTS_MSG2" : "<b>DŮLEŽITÉ</b>: List 'Vyhodnocení' nesmí být jakkoli pozměňován. Pokud potřebuje zanést jakékoli změny, vytvořte kopii tohoto listu a tu upravujte.",

// Follows the Flubaroo tip, directing users to read the corresponding article.
"FLB_STR_RESULTS_TIP_READ_ARTICLE" : "Více se dozvíte <a target=_blank href=\"%s\">zde</a>.",

// Instructions shown on Step 1 of grading.
"FBL_STR_STEP1_INSTR" : "Vyberte možnost pro každou z otázek. Doplněk Flubaroo navrhuje (podle dosavadních zkušeností) nejvhodnější možnosti. Ty je však možné libovolně upravit.",

// Instructions shown on Step 2 of grading.
"FBL_STR_STEP2_INSTR" : "Prosím zvolte, která z odpovědí má být zvolena jako vzorová. Většinou je to odpověď vložená přímo vámi. Ostatní odpovědi budou posuzovány právě podle této vzorové, proto volte obezřetně.",

// Message shown if not enough submissions to perform grading.
"FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Není dostatek odpovědí pro vyhodnocení. Zkontrolujte výběr vzorové odpovědi a (nebo) zkuste vyhodnocení ve chvíli, kdy bude k dispozici více studentských odpovědí.",

// Please wait" message first shown when Flubaroo is first examining assignment.
"FLB_STR_WAIT_INSTR1" : "Flubaroo vyhodnocuje odpovědi. Čekejte, prosím...",

// Please wait" message shown after Step 1 and Step 2, while grading is happening.
"FLB_STR_WAIT_INSTR2" : "Čekejte, prosím, vyhodnocování stále probíhá. Může to trvat několik minut.",

// Asks user if they are sure they want to re-grade, if Grades sheet exists.
"FLB_STR_REPLACE_GRADES_PROMPT" : "Vaše existující vyhodnocení bude přepsáno. Opravdu chcete pokračovat?",

// Window title for "Preparing to grade" window
"FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Příprava vyhodnocení",

// Window title for "Please wait" window while grading occurs
"FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Probíhá vyhodnocování",

// Window title for "Grading Complete" window after grading occurs
"FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Grading Complete",

// Window title for grading Step 1
"FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Grading Step 1",

// Window title for grading Step 2
"FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Grading Step 2",

// "Grading Option" label that appears over first column in Step 1 of grading.
"FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Možnosti vyhodnocení",

// "Question" label that appears over second column in Step 1 of grading.
"FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Otázka",

// "Select" label that appears over radio button in first column of Step 2 of grading.
"FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Výběr",

// "Submission Time" label that appears over second column in Step 2 of grading.
"FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Čas vyhodnocování",

// Label for "View Grades" button shown when grading completes.
"FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Zobrazit vyhodnocení",

// Used for "summary" text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Souhrn",

// Used for report and report email. Ex: "Report for 'My Test'"
"FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Vyhodnocení: ",

// Points Possible. Used for text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Maximální počet bodů",

// Average Points. Used for text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Průměrný počet bodů",

// Counted Submissions. Used for text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Vyhodnocených odpovědí",

// Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Number of Low Scoring Questions",

// Name of column in Grades sheet that has total points scored.
"FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Celkem bodů",

// Name of column in Grades sheet that has score as percent.
"FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Úspěšnost v %",

// Name of column in Grades sheet that has number of times student made a submission.
"FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Počet odeslání odpovědí",

// Name of column in Grades sheet that indicates if grade was already emailed out.
"FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Vyhodnocení odesláno e-mailem?",

// Name of column in Grades sheet that allows teacher to enter optional student feedback
"FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Zpětná vazba (volitelné)",

// Window title for emailing grades
"FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Odeslání vyhodnocení e-mailem",

// Instructions on how to email grades
"FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo může každému studentovi poslat vyhodnocení, stejně tak správné odpovědi. Vyberte položku s e-mailovými adresami studentů. Pokud mezi odpověďmi chybí e-mailové adresy studentů, e-maily s vyhodnocením nemohou být odeslány.",

// Notice that grades cannot be emailed because the user has exceeded their daily quota.
"FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo nemůže odeslat vyhodnocení. Došlo k vyčerpání denního limitu odeslaných e-mailových zpráv. Tento limit je nastaven pro všechny Google doplňky. Zkuste odeslání později.",

// Message about how many grade emails *have* been sent. This message is preceeded by a number.
// Example: "5 grades were successfully emailed"
"FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "vyhodnocení bylo úspěšně odesláno",

// Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
"FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "vyhodnocení nebylo odesláno kvůli chybné nebo chybějící e-mailové adrese. Případně už bylo vyhodnocení na dané e-mailové adresy odesláno nebo byl vyčerpán denní limit odeslaných e-mailových zpráv.",

// Message about how many grade emails *have NOT* been sent.
"FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Nebylo odesláno žádné vyhodnocení, protože nebyla nalezena žádná platná e-mailová adresa. Případně už bylo vyhodnocení na dané e-mailové adresy odesláno nebo byl vyčerpán denní limit odeslaných e-mailových zpráv.",

// Subject of the email students receive. Followed by assignment name.
// Example: Here is your grade for "Algebra Quiz #6"
"FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Vyhodnocení: ",

// First line of email sent to students
// Example: This email contains your grade for "Algebra Quiz #6"
"FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Tento e-mail obsahuje vyhodnocení: ",

// Message telling students not to reply to the email with their grades
"FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Na tuto e-mailovou zprávu neodpovídejte.",

// Message that preceedes the student's grade
"FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Vaše vyhodnocení",

// Message that preceedes the instructor's (optional) message in the email
"FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Zpráva učitele pro všechny studenty:",

// Message that preceedes the instructor's (optional) feedback for the student in the email
"FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Zpráva učitele přímo pro vás:",

// Message that preceedes the summary of the student's information (name, date, etc)
"FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Souhrn vyhodnocení",

// Message that preceedes the table of the students scores (no answer key sent)
"FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Níže jsou vaše výsledky pro každou otázku",

// Message that preceedes the table of the students scores, and answer key
"FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Níže jsou vaše výsledky pro každou otázku společně se správnými odpověďmi",

// Header for the column in the table of scores in the email which lists the question asked.
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Otázka",

// Header for the column in the table of scores in the email which lists the student's answer.
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Vaše odpověď",

// Header for the column in the table of scores in the email which lists the correct answer.
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Správná odpověď",

// Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Vaše body",

// Header for the column in the table of scores in the email which lists the points possible (e.g. 5).
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Maximální počet bodů",

// Header for the column in the table of scores in the email which lists the Help Tip (if provided)
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Nápověda k otázce",

// Label for "points" used in the new style email summary of grades
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "bodů",

// Label for "Correct" questions in new style email summary of grades
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Správně",

// Label for "Incorrect" questions in new style email summary of grades
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Špatně",

// Footer for the email sent to students, advertising Flubaroo.
"FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Tento e-mail byl vygenerován pomocí Flubaroo, zdarma dostupného doplňku pro vyhodnocování",

// Link at the end of the footer. Leads to www.flubaroo.com
"FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Navštivte flubaroo.com",

// Subject of the record email sent to the instructor, when grades are emailed to the class.
// Followed by the assignment name.
// e.g. Record of grades emailed for Algebra Quiz #6
"FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Potvrzení odeslání vyhodnocení: ",

// Used in the record email sent to the instructor after she emails grades.
// Labels the name of the assignment, in the summary table.
"FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Název",

// Used in the record email sent to the instructor after she emails grades.
// Labels the number of emails sent, in the summary table.
"FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Počet odeslaných e-mailů",

// Used in the record email sent to the instructor after she emails grades.
// Labels the number of graded submissions, in the summary table
"FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Počet vyhodnocených testů",

// Used in the record email sent to the instructor after she emails grades.
// Labels the average score in points (vs percent), in the summary table
"FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Průměrný počet bodů",

// Used in the record email sent to the instructor after she emails grades.
// Labels the points possible, in the summary table
"FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Maximální počet bodů",

// Used in the record email sent to the instructor after she emails grades.
// Indicated if an answer key was provided to the students, in the summary table
"FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Odeslány správné odpovědi?",

// Used in the record email sent to the instructor after she emails grades.
// Value in summary table if answer key was NOT sent to students by instructor
"FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Ne",

// Used in the record email sent to the instructor after she emails grades.
// Value in summary table if answer key WAS sent to students by instructor
"FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Ano",

// Used in the record email sent to the instructor after she emails grades.
// Message that preceeds what message the instructor email to her students.
"FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Přiložená zpráva učitele",

// About Flubaroo message (1 of 2)
"FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo je zdarma dostupný doplněk umožňující učitelům rychlé vyhodnocení testů a následné analyzování výsledků.",

// About Flubaroo message (2 of 2)
"FLB_STR_ABOUT_FLUBAROO_MSG2" : "Pokud se chcete dozvědět více, navštivte www.flubaroo.com.",

// Message that appears when "Student Submissions" sheet cannot be located.
"FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo nemůže najít list s odpověďmi. Najděte tento list a pojmenujte: ",

// Message that appears when "Grades" sheet cannot be located.
"FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo nemůže najít list s vyhodnocením. Proveďte nové vyhodnocování, případně najděte list s vyhodnocením a pojmenujte jej: ",

// Menu option to grade assignment.
"FLB_STR_MENU_GRADE_ASSIGNMENT" : "Vyhodnotit",

// Menu option to re-grade assignment.
"FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Znovu vyhodnotit",

// Menu option to email grades.
"FLB_STR_MENU_EMAIL_GRADES" : "Poslat vyhodnocení e-mailem",

// Menu option to hide student feedback (hides the column)
"FLB_STR_MENU_HIDE_FEEDBACK" : "Skrýt zpětnou vazbu studentům",

// Menu option to edit student feedback (unhides the column)
"FLB_STR_MENU_EDIT_FEEDBACK" : "Upravit zpětnou vazbu studentům",

// Menu option to hide help tips
"FLB_STR_MENU_HIDE_HELP_TIPS" : "Skrýt nápovědu",

// Menu option to edit help tips
"FLB_STR_MENU_EDIT_HELP_TIPS" : "Upravit nápovědu",

// Menu option to view report.
"FLB_STR_MENU_VIEW_REPORT" : "Zobrazit souhrn",

// Menu option to learn About Flubaroo.
"FLB_STR_MENU_ABOUT" : "O doplňku Flubaroo",

// Menu title for "Advanced" sub-menu
"FLB_STR_MENU_ADVANCED" : "Více",

// Menu title for Advanced > Options
"FLB_STR_MENU_ADV_OPTIONS" : "Rozšířené možnosti",

// Menu option to choose the language.
"FLB_STR_MENU_SET_LANGUAGE" : "Nastavení jazyka",

// Menu option to enable autograde.
"FLB_STR_MENU_ENABLE_AUTO_GRADE" : "Povolit automatické vyhodnocování",

// Menu option to disable autograde.
"FLB_STR_MENU_DISABLE_AUTO_GRADE" : "Zakázat automatické vyhodnocování",

// Menu option to see reamining daily email quota
"FLB_STR_MENU_SHOW_EMAIL_QUOTA" : "Kontrola limitu e-mailových zpráv",

// Menu option shown to enable Flubaroo in a sheet where it's never been used before
"FLB_STR_MENU_ENABLE" : "Povolit Flubaroo v tomto dokumentu",

// Message to show when menu option for FLB_STR_MENU_ENABLE is chosen
"FLB_STR_FLUBAROO_NOW_ENABLED" : "Doplněk Flubaroo byl povolen. Nyní jej můžete použít, zobrazen je v horním menu.",

// Word that appears on the "Continue" button in grading and emailing grades.
"FLB_STR_BUTTON_CONTINUE" : "Pokračovat",

// Name of "Student Submissions" sheet
"FLB_STR_SHEETNAME_STUD_SUBM" : gbl_subm_sheet_name,

// Name of "Grades" sheet
"FLB_STR_SHEETNAME_GRADES" : gbl_grades_sheet_name,

// Text put in Grades sheet when a question isnt graded.
"FLB_STR_NOT_GRADED" : "Nehodnoceno",

// Message that is displayed when a new version of Flubaroo is installed.
"FLB_STR_NEW_VERSION_NOTICE" : "Nová verze Flubaroo nainstalována! Navštivte flubaroo.com/blog pro informace o novinkách.",

// Headline for notifications / alerts.
"FLB_STR_NOTIFICATION" : "Upozornění Flubaroo",

// For emailing grades, question which asks user to identify email question.
"FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Otázka obsahující e-mailové adresy: ", // note the space after ":"

// For emailing grades, asks user if list of questions and scores should be sent.
"FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Zahrnout list s otázkami a vyhodnocením: ", // note the space after ":"

// For emailing grades, asks user if answer key should be sent...
"FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Zahrnout správné odpovědi: ", // note the space after ":"

// For emailing grades, appears before text box for optional instructor message.
"FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Zpráva zobrazená v e-mailu (nepovinné):",

// Window title for View Report window
"FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Vyhodnocení",

// Title of historgram chart in report
"FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Grafické znázornění",

// Y-Axis (vertical) title of historgram chart in report
"FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Otázky",

// X-Axis (horizontal) title of historgram chart in report
"FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Body",

// Label of "Email Me Report" button in View Report window
"FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Odeslat souhrn na e-mail",

// Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
"FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Souhrn byl odeslán na e-mail",

// Message to show the user in the top-left cell of the Grading sheet when grading starts.
"FLB_STR_GRADING_CELL_MESSAGE" : "Vyhodnocování odpovědí...",

// Message that pops up to notify the user that autograde is on.
"FLB_STR_AUTOGRADE_IS_ON" : "Automatické vyhodnocování je zapnuto. Flubaroo čeká na nové odpovědi k vyhodnocování. Neprovádějte změny v žádném listu, dokud je automatické vyhodnocování je zapnuto.",

// Message that pops up to notify the user that autograde is on.
"FLB_STR_AUTOGRADE_IS_OFF" : "Automatické vyhodnocování bylo vypnuto.",

// Message to ask the user if they want to grade recent, ungraded submissions, before autograde is enabled.
"FLB_STR_AUTOGRADE_GRADE_RECENT" : "Některé odpovědi ještě nebyly vyhodncoeny. Chcete je vyhodnotit před zapnutím automatického vyhodnocování?",

// Message to tell the user that autograde must gather grading and email settings before being turned on.
"FLB_STR_AUTOGRADE_SETUP" : "Před zapnutím automatického vyhodnocování musíte nejdříve provést nastavení. Klepněte na 'OK'.",

// Message asking user if they'd like to update their grading and email settings before turning on autograde.
"FLB_STR_AUTOGRADE_UPDATE" : "Chcete před zapnutím automatického vyhodnocování provést úpravu nastavení?",

// Title of Advanced Options window
"FLB_STR_ADV_OPTIONS_WINDOW_TITLE" : "Rozšířené možnosti",

// Advanced Options notice that appears at the top of the window, telling the user to read the help center articles.
"FLB_STR_ADV_OPTIONS_NOTICE" : "Nastavení měňte jen v případě, že jste seznámeni s příslušnými texty nápovědy.",

// Text for Advanced Options, describing option to not use noreply@ email address when sending grades.
"FLB_STR_ADV_OPTIONS_NO_NOREPLY" : "Umožnit studentům odpovědět na můj e-mail (nebude použita adresa noreply@...).",

// Text for Advanced Options, describing option to send each student a link to edit their response.
"FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK" : "Po odeslání zaslat studentům odkaz pro rychlou úpravu odpovědí.",

// Text for Advanced Options, describing option to change the 70% pass rate.
"FLB_STR_ADV_OPTIONS_PASS_RATE" : "Minimální hranice pro úspěšné absolvování testu: ",

// Message about how many more emails user can send that day. Shown from the Advanced > Check Email Quota menu.
"FLB_STR_EMAIL_QUOTA_MSG" : "Počet zbývajících e-mailů z denního limitu: ",

        "FLB_STR_GRADE_STEP1_LABEL_POINTS": "Body",

        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR": "Musíte vybrat alespoň jednu otázku, která identifikuje studenta před pokračováním.",

        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR": "Musíte vybrat alespoň jednu otázku, která je gradeable.",

        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED": "Musíte vybrat správné odpovědi před pokračováním.",

        "FLB_STR_GRADING_OPT_NORMAL_GRADING": "Normální Třídění",

        "FLB_STR_GRADING_OPT_MANUAL_GRADING": "Grade po ruce (New!)",

        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS": "Autograde nelze povolit, protože máte jeden nebo více otázek, které jsou nastaveny, aby se ruka odstupňovaná.",

        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS": "Vybrali jste jednu nebo více otázek, aby se třídí ručně. Ale třídění nemůže pokračovat, protože některé z těchto otázek nejsou odlišné od sebe navzájem. Například, můžete mít dvě otázky oba s názvem \"Otázka\". Upravte text těchto otázek v řádku 1 tak, že jsou jedinečné (tj \"Otázka 1\" a \"Otázka 2\"), a zkuste to znovu třídění.",

        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL": "Ruční Graded",

        "FBL_STR_MANUAL_GRADING_INSTR": "Použijte ovládací prvky níže přiřadit stupně ručně. Všimněte si, že to bude fungovat správně pouze v otázkách, pro které jste zvolili \"Grade od ruky\", v kroku 1 stupně.",

        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS": "Grade Otázky Hand",

        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED": "Žádné body přidělen",

        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER": "Komentáře od svého instruktora",

        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE": "Flubaroo - Grade Otázky Hand",

        "FLB_STR_MANUAL_GRADING_STEP1": "1. Vyberte Student:",

        "FLB_STR_MANUAL_GRADING_STEP2": "2. Vyberte Otázka:",

        "FLB_STR_MANUAL_GRADING_STEP3": "3. Přečtěte si studenta Podání:",

        "FLB_STR_MANUAL_GRADING_STEP4": "4. Zadejte Poznámky pro studenta (zaslány v e-mailu):",

        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY": "Přezkum odpověď klíč",

        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE": "Nastavit Grade",

        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING": "Pracovní",

        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED": "Grade byla použita.",

        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE": "Zadejte prosím platnou známku.",

        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED": "Nastala chyba.",

        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP": "V blízkosti",

        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW": "Autograde je v současné době třídění jeden nebo více nových podání, takže nemůže být zakázán. Zkuste to znovu krátce.",

        "FLB_STR_NO_VALID_SUBMISSIONS": "Stupně list nebyl vytvořen, protože nebyly nalezeny žádné platné podání.",

        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Poškozené stupňů list - nemůže pokračovat",

        "FLB_STR_INVALID_GRADES_SHEET": "<p> Flubaroo nemůže pokračovat, protože váš stupně list byl poškozen. Možná, že jste odstranit řádky, sloupce, nebo jiná data z stupně listu po třídění poslední dokončený? </ P> <p> Viz <a href = \"http://www.flubaroo.com/hc/corrupted-grades-sheet\"> tento článek </a> o pomoc. </ p>",

        "FLB_STR_DO_NOT_DELETE_MSG": "K ZAJIŠTĚNÍ FLUBAROO řádně funguje, neodstraňujte řádky nebo sloupce v tomto listu",

        "FLB_STR_GRADES_SHARE_LABEL": "Metoda Grade Sdílení:",

        "FLB_STR_GRADES_SHARE_EMAIL": "Podíl e-mailem (typická)",

        "FLB_STR_GRADES_SHARE_DRIVE": "Sdílet přes Disk Google (ne e-mail)",

        "FLB_STR_GRADES_SHARE_BOTH": "Sdílet přes e-mail a jak disk",

        "FLB_STR_DRIVE_SHARE_FOLDER_NAME": "Flubaroo - Sdílené Vyhodnocení",

        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE": "Grade pro",

        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG": "Klikněte pro zobrazení této zprávy stupeň v Disku Google",

        "FLB_STR_PRINT_GRADES_WINDOW_TITLE": "Flubaroo - Tiskové stupně",

        "FLB_STR_PRINT_GRADES_INSTR": "Flubaroo vytvoří jednotný dokument Google, který obsahuje známky pro všechny studenty, který pak můžete tisknout a distribuovat. Můžete zadat zprávu zahrnout do každého dokumentu, stejně jako, zda chcete zahrnout seznam otázek a / nebo správných odpovědí.",

        "FLB_STR_SHARE_GRADES_WINDOW_TITLE": "Flubaroo - Sdílení stupně",

        "FLB_STR_SHARE_GRADES_INSTR": "Flubaroo můžete sdílet s každým studentem jejich platové třídě prostřednictvím e-mailu, Google Drive nebo obojí. Použijte rozbalovací nabídce zvolte otázku, kterou žádal studenty pro svou e-mailovou adresu. Pokud e-mailové adresy nebyly shromážděny, pak nebudete moci sdílet stupně.",

        "FBL_STR_PRINT_GRADES_SUCCESS": "Dokument Google byl vytvořen obsahující všechny studentské stupně. Klepněte na název souboru níže jej otevřete. Pak ji vytisknout a předat každému studentovi svou tiskovou-out.",

        "FLB_STR_MENU_SHARE_GRADES": "Sdílení stupně",

        "FLB_STR_MENU_PRINT_GRADES": "Tiskové stupně",
  
// Flubaroo Tips, shown when grading completes.
"FLB_STR_TIP_MSG_NUMBER_1" : "<b>Flubaroo Tip #1:</b> Flubaroo může vyhodnocovat odpovědi s více než jednou správnou odpovědí.",
"FLB_STR_TIP_MSG_NUMBER_2" : "<b>Flubaroo Tip #2:</b> Flubaroo může vyhodnocovat číselné odpovědi s daným rozpětím.",
"FLB_STR_TIP_MSG_NUMBER_3" : "<b>Flubaroo Tip #3:</b> PES nebo pes? Využijte rozlišení velkých a malých písmen.",
"FLB_STR_TIP_MSG_NUMBER_4" : "<b>Flubaroo Tip #4:</b> Chcete změnit limit 70 % pro úspěšné absolvování testu?",
"FLB_STR_TIP_MSG_NUMBER_5" : "<b>Flubaroo Tip #5:</b> Chcete zjistit počet zbývajících e-mailů do denního limitu?",
"FLB_STR_TIP_MSG_NUMBER_6" : "<b>Flubaroo Tip #6:</b> Chcete vyhodnocovat odpovědi automaticky?",
"FLB_STR_TIP_MSG_NUMBER_7" : "<b>Flubaroo Tip #7:</b> Máte nějaké otázky? Odpovědi hledejte ve FAQ na webu www.flubaroo.com!",
},
// END CZECH //////////////////////////////////////////////////////////////////////////////////

// START FINNISH ////////////////////////////////////////////////////////////////////////////////
"fi": {
// Name to identify language in language selector
"FLB_LANG_IDENTIFIER": "Suomi (Finnish)",
// Grading option which identifies a student
"FLB_STR_GRADING_OPT_STUD_ID" : "Vastaajan tunnus",
// Grading option which tells Flubaroo to skip grading on a question
"FLB_STR_GRADING_OPT_SKIP_GRADING" : "Älä tarkista",
// Message shown when grading is complete (1 of 2).
"FLB_STR_RESULTS_MSG1" : "Luotiin uusi laskutaulukko “Tulokset”. Taulukko sisältää tuloksen jokaiselle lähetetylle vastaukselle, sekä yläreunassa kaikkien tulosten yhteenvedon. \
Viimeisellä rivillä on kaikkiin kysymyksiin oikein vastanneiden prosentuaalinen määrä, sekä yleisimmin vähän pisteitä saaneet kysymykset oranssilla korostettuna. Hyväksytyn rajan alle jääneet yksittäiset vastaajat erottuvat punaisella kirjasimella.",
// Message shown when grading is complete (2 of 2).
"FLB_STR_RESULTS_MSG2" : "<b>TÄRKEÄTÄ</b>: Tulokset-taulukkoa ei ole tarkoitettu muokattavaksi, sillä taulukon muokkaaminen saattaa häiritä tulosten lähettämistä sähköpostilla. Jos taulukko on välttämätöntä muokata, tee siitä kopio muokattavaksesi.",
// Follows the Flubaroo tip, directing users to read the corresponding article.
"FLB_STR_RESULTS_TIP_READ_ARTICLE" : "Klikkaa <a target=_blank href=\"%s\">here</a> lisätietoja.",
// Instructions shown on Step 1 of grading.
"FBL_STR_STEP1_INSTR" : "Valitse tarkistusvaihtoehto jokaiselle kysymykselle. Flubaroo koettaa päätellä parhaan vaihtoehdon, mutta sinun kannattaa silti varmistaa jokainen kysymys itse.",
// Instructions shown on Step 2 of grading.
"FBL_STR_STEP2_INSTR" : "Valitse mallivastauksena käytettävä vastaus. Yleensä mallivastaus luodaan vastaamalla kysymyksiin itse. \
Muita vastauksia verrataan mallivastaukseen, joten ole huolellinen mallivastausta valitessasi.",
// Message shown if not enough submissions to perform grading.
"FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Vastauksia ei ole vielä tarpeeksi tarkistamista varten. Varmista, että olet lähettänyt ja valinnut mallivastauksen, ja/tai yritä uudelleen, kun vastauksia on lähetetty lisää.",
// Please wait" message first shown when Flubaroo is first examining assignment.
"FLB_STR_WAIT_INSTR1" : "Flubaroo tutkii kyselyä, ole hyvä ja odota...",
// Please wait" message shown after Step 1 and Step 2, while grading is happening.
"FLB_STR_WAIT_INSTR2" : "Odota kunnes kyselysi on tarkistettu. Tähän saattaa mennä hetki.",
// Asks user if they are sure they want to re-grade, if Grades sheet exists.
"FLB_STR_REPLACE_GRADES_PROMPT" : "Tämä korvaa aikaisemmat tulokset. Haluatko jatkaa?",
// Window title for "Preparing to grade" window
"FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - tarkistusta valmistellaan",
// Window title for "Please wait" window while grading occurs
"FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - tarkistetaan vastauksia.",
// Window title for "Grading Complete" window after grading occurs
"FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - tarkistus on valmis",
// Window title for grading Step 1
"FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - tarkistusvaihe 1",
// Window title for grading Step 2
"FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - tarkistusvaihe 2",
// "Grading Option" label that appears over first column in Step 1 of grading.
"FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Tarkistusvaihtoehto",
// "Question" label that appears over third column in Step 1 of grading.
"FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Kysymys",
// "Select" label that appears over radio button in first column of Step 2 of grading.
"FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Valitse",
// "Submission Time" label that appears over second column in Step 2 of grading.
"FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Vastausaika",
// Label for "View Grades" button shown when grading completes.
"FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Näytä tulokset",
// Used for "summary" text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Yhteenveto",
// Used for report and report email. Ex: "Report for 'My Test'"
"FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Raportti kohteelle",
// Points Possible. Used for text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Enimmäispisteet",
// Average Points. Used for text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Pisteitä keskimäärin",
// Counted Submissions. Used for text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Vastausten määrä",
// Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
"FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Pistemäärältään alhaisten kysymysten lukumäärä",
// Name of column in Grades sheet that has total points scored.
"FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Yhteispistemäärä",
// Name of column in Grades sheet that has score as percent.
"FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Prosentti",
// Name of column in Grades sheet that has number of times student made a submission.
"FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Vastauskertojen määrä",
// Name of column in Grades sheet that indicates if grade was already emailed out.
"FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Tulos on jo postitettu?",
// Name of column in Grades sheet that allows teacher to enter optional student feedback
"FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Palautetta vastaajalle (valinnainen)",
// Window title for emailing grades
"FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - tulosten lähettäminen",
// Instructions on how to email grades
"FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo voi lähettää jokaiselle vastanneelle heidän saamansa tuloksen ja oikeat vastaukset sähköpostitse. Valitse pudotusvalikosta se kysymys, johon vastaajat antoivat sähköpostiosoitteensa. Jos sähköpostiosoitteita ei kerätty, tuloksia ei voi lähettää.",
// Notice that grades cannot be emailed because the user has exceeded their daily quota.
"FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo ei tällä hetkellä voi lähettää tuloksia, koska päivittäinen sähköpostikiintiösi ylittyi. Google on asettanut kiintiön kaikille laajennuksille. Yritä myöhemmin uudelleen.",
// Message about how many grade emails *have* been sent. This message is preceeded by a number.
// Example: "5 grades were successfully emailed"
"FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "tulosta lähetettiin onnistuneesti",
// Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
"FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "tulosta ei lähetetty johtuen joko epäkelvoista tai tyhjistä sähköpostiosoitteista, jo lähetetyistä vastauksista tai koska päivittäinen sähköpostikiintiösi ylittyi.",
// Message about how many grade emails *have NOT* been sent.
"FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Tuloksia ei lähetetty, koska sähköpostiosoitteita ei löytynyt, kaikki vastaajat olivat jo saaneet tuloksensa tai koska päivittäinen sähköpostikiintiösi ylittyi.",
// Subject of the email students receive. Followed by assignment name.
// Example: Here is your grade for "Algebra Quiz #6"
"FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Tuloksesi kyselylle ",
// First line of email sent to students
// Example: This email contains your grade for "Algebra Quiz #6"
"FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Sähköposti sisältää tuloksesi kyselylle",
// Message telling students not to reply to the email with their grades
"FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Älä vastaa tähän viestiin",
// Message that preceedes the student's grade
"FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Tuloksesi",
// Message that preceedes the instructor's (optional) message in the email
"FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Alla kaikille vastaajille lähetetty viesti kyselyn järjestäjältä",
// Message that preceedes the instructor's (optional) feedback for the student in the email
"FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Tämä on palautetta kyselyn järjestäjältä vain sinulle",
// Message that preceedes the summary of the student's information (name, date, etc)
"FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Vastauksesi yhteenveto",
// Message that preceedes the table of the students scores (no answer key sent)
"FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Alla jokaisen kysymyksen pistemääräsi",
// Message that preceedes the table of the students scores, and answer key
"FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Alla jokaisen kysymyksen pistemääräsi, sekä oikea vastaus",
// Header for the column in the table of scores in the email which lists the question asked.
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Kysymys",
// Header for the column in the table of scores in the email which lists the student's answer.
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Vastauksesi",
// Header for the column in the table of scores in the email which lists the correct answer.
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Oikea vastaus",
// Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Tuloksesi",
// Header for the column in the table of scores in the email which lists the points possible (e.g. 5).
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Enimmäispisteet",
// Header for the column in the table of scores in the email which lists the Help Tip (if provided)
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Apua tähän kysymykseen",
// Label for "points" used in the new style email summary of grades
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "pisteitä",
// Label for "Correct" questions in new style email summary of grades
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Oikein",
// Label for "Incorrect" questions in new style email summary of grades
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Väärin",
// Footer for the email sent to students, advertising Flubaroo.
"FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Tämän viestin lähetti Flubaroo, maksuton apuväline kyselyvastausten tarkistamiseen.",
// Link at the end of the footer. Leads to www.flubaroo.com
"FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Lisätietoa flubaroo.com",
// Subject of the record email sent to the instructor, when grades are emailed to the class.
// Followed by the assignment name.
// e.g. Record of grades emailed for Algebra Quiz #6
"FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Lähetettyjen tulosten lukumäärä kyselylle",
// Used in the record email sent to the instructor after she emails grades.
// Labels the name of the assignment, in the summary table.
"FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Kyselyn nimi",
// Used in the record email sent to the instructor after she emails grades.
// Labels the number of emails sent, in the summary table.
"FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Lähetettyjen tulosten lukumäärä",
// Used in the record email sent to the instructor after she emails grades.
// Labels the number of graded submissions, in the summary table
"FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Tarkistettujen vastausten lukumäärä",
// Used in the record email sent to the instructor after she emails grades.
// Labels the average score in points (vs percent), in the summary table
"FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Pistekeskiarvo",
// Used in the record email sent to the instructor after she emails grades.
// Labels the points possible, in the summary table
"FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Enimmäispisteet",
// Used in the record email sent to the instructor after she emails grades.
// Indicated if an answer key was provided to the students, in the summary table
"FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Mallivastaus valittu?",
// Used in the record email sent to the instructor after she emails grades.
// Value in summary table if answer key was NOT sent to students by instructor
"FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Ei",
// Used in the record email sent to the instructor after she emails grades.
// Value in summary table if answer key WAS sent to students by instructor
"FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Kyllä",
// Used in the record email sent to the instructor after she emails grades.
// Message that preceeds what message the instructor email to her students.
"FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Sisällytit myös tämän viestin",
// About Flubaroo message (1 of 2)
"FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo on maksuton, aikaa säästävä apuväline, jonka avulla esimerkiksi kouluissa voidaan tarkistaa monivalintakyselyjä ja analysoida niiden tuloksia",
// About Flubaroo message (2 of 2)
"FLB_STR_ABOUT_FLUBAROO_MSG2" : "Lisätietoja www.flubaroo.com.",
// Message that appears when "Student Submissions" sheet cannot be located.
"FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo ei tunnistanut vastaukset sisältävää laskentataulukkoa. Paikanna taulukko, ja anna sille nimeksi: ",
// Message that appears when "Grades" sheet cannot be located.
"FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo ei tunnistanut tulokset sisältävää laskentataulukkoa. Tarkista kysely tai paikanna taulukko, ja anna sille nimeksi: ",
// Menu option to grade assignment.
"FLB_STR_MENU_GRADE_ASSIGNMENT" : "Tarkista kysely",
// Menu option to re-grade assignment.
"FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Tarkista kysely uudelleen",
// Menu option to email grades.
"FLB_STR_MENU_EMAIL_GRADES" : "Lähetä tulokset",
// Menu option to hide student feedback (hides the column)
"FLB_STR_MENU_HIDE_FEEDBACK" : "Piilota vastaajan palaute",
// Menu option to edit student feedback (unhides the column)
"FLB_STR_MENU_EDIT_FEEDBACK" : "Muokkaa vastaajan palautetta",
// Menu option to hide help tips
"FLB_STR_MENU_HIDE_HELP_TIPS" : "Piilota vihjeet",
// Menu option to edit help tips
"FLB_STR_MENU_EDIT_HELP_TIPS" : "Muokkaa vihjeitä",
// Menu option to view report.
"FLB_STR_MENU_VIEW_REPORT" : "Katsele raporttia",
// Menu option to learn About Flubaroo.
"FLB_STR_MENU_ABOUT" : "Flubaroo",
// Menu title for "Advanced" sub-menu
"FLB_STR_MENU_ADVANCED" : "Lisävalinnat",
// Menu title for Advanced > Options
"FLB_STR_MENU_ADV_OPTIONS" : "Lisävalinnat",
// Menu option to choose the language.
"FLB_STR_MENU_SET_LANGUAGE" : "Valitse kieli",
// Menu option to enable autograde.
"FLB_STR_MENU_ENABLE_AUTO_GRADE" : "Tarkistaminen päälle",
// Menu option to disable autograde.
"FLB_STR_MENU_DISABLE_AUTO_GRADE" : "Tarkistaminen pois",
// Menu option to see reamining daily email quota
"FLB_STR_MENU_SHOW_EMAIL_QUOTA" : "Tarkista sähköpostikiintiö",
// Menu option shown to enable Flubaroo in a sheet where it's never been used before
"FLB_STR_MENU_ENABLE" : "Aktivoi Flubaroo tässä laskentataulukossa",
// Message to show when menu option for FLB_STR_MENU_ENABLE is chosen
"FLB_STR_FLUBAROO_NOW_ENABLED" : "Flubaroo on aktivoitu tälle laskentataulukolle. Voit nyt käyttää sitä valikosta.",
// Word that appears on the "Continue" button in grading and emailing grades.
"FLB_STR_BUTTON_CONTINUE" : "Jatka",
// Name of "Student Submissions" sheet
"FLB_STR_SHEETNAME_STUD_SUBM" : gbl_subm_sheet_name,
// Name of "Grades" sheet
"FLB_STR_SHEETNAME_GRADES" : gbl_grades_sheet_name,
// Text put in Grades sheet when a question isnt graded.
"FLB_STR_NOT_GRADED" : "Ei tarkistettu",
// Message that is displayed when a new version of Flubaroo is installed.
"FLB_STR_NEW_VERSION_NOTICE" : "Asensit Flubaroon uuden version! Osoitteessa flubaroo.com/blog näet mikä on uutta.",
// Headline for notifications / alerts.
"FLB_STR_NOTIFICATION" : "Flubaroon ilmoitus",
// For emailing grades, question which asks user to identify email question.
"FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Sähköpostiosoitteen kysyminen: ", // note the space after ":"
// For emailing grades, asks user if list of questions and scores should be sent.
"FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Sisällytä kysymykset ja pistemäärät: ", // note the space after ":"
// For emailing grades, asks user if answer key should be sent...
"FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Sisällytä mallivastaus: ", // note the space after ":"
// For emailing grades, appears before text box for optional instructor message.
"FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Vapaavalintainen viesti:",
// Window title for View Report window
"FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - tulokset",
// Title of historgram chart in report
"FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Tulokset histogrammina",
// Y-Axis (vertical) title of historgram chart in report
"FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Vastaukset",
// X-Axis (horizontal) title of historgram chart in report
"FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Saadut pisteet",
// Label of "Email Me Report" button in View Report window
"FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Lähetä raportti minulle",
// Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
"FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Raportti lähetettiin osoitteeseen ",
// Message to show the user in the top-left cell of the Grading sheet when grading starts.
"FLB_STR_GRADING_CELL_MESSAGE" : "Tarkistaa uusimpia vastauksia...",
// Message that pops up to notify the user that autograde is on.
"FLB_STR_AUTOGRADE_IS_ON" : "Tarkistaminen on päällä. Flubaroo odottaa uusia vastauksia tarkistettavaksi. Älä muokkaa laskentataulukoita ennen kuin tarkistaminen on kytketty pois.",
// Message that pops up to notify the user that autograde is on.
"FLB_STR_AUTOGRADE_IS_OFF" : "Tarkistaminen on kytketty pois päältä.",
// Message to ask the user if they want to grade recent, ungraded submissions, before autograde is enabled.
"FLB_STR_AUTOGRADE_GRADE_RECENT" : "Äskettäisiä vastauksia on vielä tarkistamatta. Haluatko että Flubaroo tarkistaa ne, ennen kuin tarkistaminen aktivoidaan uudelleen?",
// Message to tell the user that autograde must gather grading and email settings before being turned on.
"FLB_STR_AUTOGRADE_SETUP" : "Ennen tarkistamisen aktivointia sinun tulee ensin asettaa tarkistuksen ja sähköpostin asetukset. Klikkaa 'OK' jatkaaksesi.",
// Message asking user if they'd like to update their grading and email settings before turning on autograde.
"FLB_STR_AUTOGRADE_UPDATE" : "Haluatko päivittää tarkistamisen ja sähköpostin asetukset, ennen tarkistamisen aktivointia?",
// Title of Advanced Options window
"FLB_STR_ADV_OPTIONS_WINDOW_TITLE" : "Lisävalinnat",
// Advanced Options notice that appears at the top of the window, telling the user to read the help center articles.
"FLB_STR_ADV_OPTIONS_NOTICE" : "Muokkaa näitä asetuksia luettuasi ensin vastaavat ohjeet",
// Text for Advanced Options, describing option to not use noreply@ email address when sending grades.
"FLB_STR_ADV_OPTIONS_NO_NOREPLY" : "Käytä @noreply-osoitteen sijaan vastausosoitettani tulosten lähettämiseen.",
// Text for Advanced Options, describing option to send each student a link to edit their response.
"FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK" : "Vastausta lähetettäessä, lähetä vastaajalle linkki vastauksen pikamuokkausta varten.",
// Text for Advanced Options, describing option to change the 70% pass rate.
"FLB_STR_ADV_OPTIONS_PASS_RATE" : "Hyväksytyn raja (%), jonka perusteella vastaajan tiedot näytetään punaisella: ",
// Message about how many more emails user can send that day. Shown from the Advanced > Check Email Quota menu.
"FLB_STR_EMAIL_QUOTA_MSG" : "Sinulla on päivittäisestä sähköpostikiintiöstäsi käyttämättä näin monta viestiä: ",
// "Points" label that appears over second column in Step 1 of grading.
"FLB_STR_GRADE_STEP1_LABEL_POINTS" : "Pisteet",
// Error message shown in Step 1 of grading if no fields selected with "Vastaajan tunniste"
"FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR" : "Ennen jatkamista sinun tulee valita ainakin yksi kysymys vastaajan tunnisteeksi.",
// Error message shown in Step 1 of grading if no fields selected that are gradeable
"FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR" : "Sinun tulee valita ainakin yksi automaattisesti tarkistettavissa oleva kysymys.",
// Error message shown in Step 2 of grading if no answer key selected
"FBL_STR_GRADE_STEP2_NO_AK_SELECTED" : "Sinun tulee valita mallivastaus ennen jatkamista.",
// Grading option which indicates Normal Grading (for display only in Step 1)
"FLB_STR_GRADING_OPT_NORMAL_GRADING" : "Tavallinen tarkistus",
// Grading option which indicates Manual Grading (for display only in Step 1)
"FLB_STR_GRADING_OPT_MANUAL_GRADING" : "Tarkista itse (Uusi!)",
// Message shown if user tries to enable autograde when a question is set for Manual Grading.
"FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS" : "Automaattista tarkistamista ei voi aktivoida, koska kyselyssäsi on yksi tai useampia itse tarkistettavia kysymyksiä.",
// Message shown if some questions are identical. All questions must be unique for Flubaroo to grade properly.
"FBL_STR_GRADE_NON_UNIQUE_QUESTIONS" : "Valitsit yhden tai useamman kysymyksen käsin tarkistettavaksi. Tarkistaminen ei kuitenkaan voi edetä, koska \
jotkut valituista kysymyksistä ovat keskenään samankaltaisia. Kyselyssä voi olla Esimerkiksi voi olla kaksi kysymystä \
joiden nimi on \"Kysymys\". Muuta tekstejä \
näiden kysymysten kohdalta rivillä 1 siten, että ne ovat erilaiset (esim. \"Kysymys 1\" ja \"Kysymys 2\"), ja käynnistä tarkistaminen sitten uudelleen.",
// Label for manually graded questions in new style email summary of grades
"FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL" : "Itse tarkistettu",
// Instructions that show-up in window when manual grading is selected.
"FBL_STR_MANUAL_GRADING_INSTR" : "Käytä ao. painikkeita tarkistaaksesi kysymyksiä itse. Huomaa, että tämä toimii kunnollisesti ainoastaan \ kysymyksille, joille valitsit \
\"Tarkista itse\" tarkistuksen vaiheessa 1.",
// Menu option to open window for manual (by hand) grading of questions.
"FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS" : "Tarkista kysymyksiä itse",
// Message shown in email to students if manually graded question wasn't assigned any points.
"FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED" : "Pisteitä ei ole määritelty",
// Header for the column in the table of scores in the email which lists the Help Tip (if provided)
"FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER" : "Kyselyn laatijan kommentit",
// Title for the "Grade by Hand" window
"FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE" : "Flubaroo - Tarkista kysymyksiä itse",
// Label next to the first step in the "Grade by Hand" window, which allows the teacher to select the student.
"FLB_STR_MANUAL_GRADING_STEP1" : "1. Valitse vastaaja:",
// Label next to the second step in the "Grade by Hand" window, which allows the teacher to select which question.
"FLB_STR_MANUAL_GRADING_STEP2" : "2. Valitse kysymys:",
// Label next to the third step in the "Grade by Hand" window, which allows the teacher to read the submission.
"FLB_STR_MANUAL_GRADING_STEP3" : "3. Lue vastaus:",
// Label next to the fourth step in the "Grade by Hand" window, which allows the teacher to enter notes.
"FLB_STR_MANUAL_GRADING_STEP4" : "4. Anna palautetta vastaajalle (lähetetään sähköpostilla):",
// Text for the link that shows the teacher's answer key / rubric in the "Grade by Hand" window.
"FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY" : "katso mallivastaus",
// Text for the button that is used to set the grade in the "Grade by Hand" window.
"FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE" : "Syötä tulos",
// Text that appears in the button while the grade is being applied in the "Grade by Hand" window.
"FLB_STR_MANUAL_GRADING_BUTTON_WORKING" : "Hetkinen",
// Message that appears at the top of the "Grade by Hand" window after the grade has been successfully applied.
"FLB_STR_MANUAL_GRADING_GRADE_APPLIED" : "Tulos on määritetty.",
// Message that appears at the top of the "Grade by Hand" window if the teacher doesn't enter a valid score in the box.
"FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE" : "Anna kelvollinen tulos.",
// Message that appears at the top of the "Grade by Hand" window if an error occurs while setting the grade.
"FLB_STR_MANUAL_GRADING_ERROR_OCCURED" : "Tapahtui virhe.",
// Text for "Close X" link that allows the teacher to close the pop-up window that contains the answer key in the "Grade by Hand" window.
"FLB_STR_MANUAL_GRADING_CLOSE_POPUP" : "Sulje",
// Message that appears if a teacher tries to disable autograde while grading is in process.
"FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW" : "Automaattinen tarkistus käsittelee juuri yhtä tai useampaa uutta vastausta, joten sitä ei voi sulkea. Yritä uudelleen hetken päästä.",
// Message that is shown to the user if grading cannot complete because no valid submissions were found in the submissions sheet (i.e. oinly blank rows).
"FLB_STR_NO_VALID_SUBMISSIONS" : "Tulostaulukkoa ei luotu, sillä kelvollisia vastauksia ei löytynyt.",
// Title of the window that informs the user that their Grades sheet is corrupted (badly formed).
"FLB_STR_INVALID_GRADE_SHEET_TITLE": "Viallinen tulostaulukko - ei voida jatkaa",
// Message shown in the "Corrupted Grades Sheet" window.
"FLB_STR_INVALID_GRADES_SHEET" : "<p>Flubaroo ei voi jatkaa, sillä tulostaulukko on viallinen. Poistitkko kenties \
rivejä, sarakkeita, tai muuta dataa tulostaulukosta edellisen tarkistamisen päätyttyä?</p>\
<p>Tästä <a href=\"http://www.flubaroo.com/hc/corrupted-grades-sheet\">ohjeesta</a> voi olla apua.</p>",
// Short message that is included at the top of the Grades sheet in bold, instructing users not to modify the Grades sheet.
"FLB_STR_DO_NOT_DELETE_MSG" : "JOTTA FLUBAROO TOIMISI OIKEIN, ÄLÄ POISTA RIVEJÄ TAI SARAKKEITA TÄSTÄ TAULUKOSTA",
// Label for the "Share Grades" window, which asks the user how they would like to share the grades (email, drive, or both).
"FLB_STR_GRADES_SHARE_LABEL" : "Tulosten jakotapa:",
// Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via email.
"FLB_STR_GRADES_SHARE_EMAIL" : "Lähetä sähköpostitse (tavallinen)", // always at index 0
// Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via Google Drive.
"FLB_STR_GRADES_SHARE_DRIVE" : "Jaa Google Drivessa (ei sähköpostia)", // always at index 1
// Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via both email and Drive.
"FLB_STR_GRADES_SHARE_BOTH" : "Jaa sekä sähköpostitse, että Drivessa", // always at index 2
// Name of the folder where shared and printed grades get put in the teacher's My Drive.
"FLB_STR_DRIVE_SHARE_FOLDER_NAME" : "Flubaroo - Jaetut tulokset",
// Text that begins the shared Google Document. Example: "Grade for dave@edcode.org - Exam #2"
"FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE" : "Tulokset kyselylle",
// Text/Link that is included in the emails to students if the "both" method of grade sharing was selected by the teacger.
"FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG" : "Klikkaa katsoaksesi raportti Google Drivessa",
// Title for window that allows teachers to print the grades.
"FLB_STR_PRINT_GRADES_WINDOW_TITLE" : "Flubaroo - Tulosta tulokset",
// Instructions for the "Print Grades" window
"FLB_STR_PRINT_GRADES_INSTR" : "Flubaroo luo tulostettavaksi ja jaettavaksi Google Dokumentin, jossa on kaikkien vastaajien tulokset. \
Voit sisällyttää dokumenttiin myös viestin, sekä kysymysluettelon ja/tai oikeat vastaukset.",
// Title for the "Share Grades" window.
"FLB_STR_SHARE_GRADES_WINDOW_TITLE" : "Flubaroo - jaa tulokset",
// Instructions for the "Share Grades" window.
"FLB_STR_SHARE_GRADES_INSTR" : "Flubaroo voi jakaa kyselyn tuloksen vastaajalle sähköpostitse, Google Drivessa tai käyttäen molempia. Valitse pudotusvalikosta se kysymys, johon vastaajat antoivat sähköpostiosoitteensa. Jos sähköpostiosoitetta ei annettu, tuloksia ei voi jakaa.",
// Success message shown after grades have been printed. Followed by a link to the printable document.
"FBL_STR_PRINT_GRADES_SUCCESS" : "Kaikki tulokset sisältävä Google dokumentti on luotu. Klikkaa ao. tiedostonimeä avataksesi dokumentin. Voit tulostaa dokumentin ja antaa kullekin vastaajalle heidän osansa tulosteesta.",
// Text that begins the name of the Google Document containing the printable grades. Example: "Printable grades for: Exam #2"
"FBL_STR_PRINT_GRADES_TITLE_PRE": "Tulostettavat tulokset kyselylle:",
// Menu option to share grades.
"FLB_STR_MENU_SHARE_GRADES" : "Jaa tulokset",
// Menu option to print grades.
"FLB_STR_MENU_PRINT_GRADES" : "Tulosta tulokset",
// Grading option for "Extra Credit" on questions.
"FLB_STR_GRADING_OPT_EXTRA_CREDIT": "Lisäpisteet",
// Text for Advanced Options, describing option to allow extra credit.
"FLB_STR_ADV_OPTIONS_EXTRA_CREDIT" : "Salli lisäpisteet kysymysten pisteitä määrättäessä",
"FLB_STR_ADV_OPTIONS_ADDITIONAL_GOPTS": "Näytä tarkistuksen lisävaihtoehdot vaiheessa yksi",
"FLB_STR_AUTOGRADE_NOT_SUMMARIZED": "AUTOMAATTISEN TARKISTUKSEN ASETUKSISTASI JOHTUEN TAULUKKO SAATTAA SISÄLTÄÄ ENEMMÄN KUIN YHDEN ARVIOIDUN PALAUTUKSEN OPPILASTA KOHTI",
"FLB_STR_ADV_OPTIONS_AG_WITH_SUMMARY": "Automaattinen tarkistus käsittelee ainoastaan viimeisimmän palautuksen (ks. <a target=\"_blank\" href=\"" + FLB_AUTOGRADE_SELECT_MODE_URL + "\">this article</a>).",
"FLB_STR_ADV_OPTIONS_MGR_ADV_QUESTION": "Käytettäessä \”Tarkista Kysymykset Käsin\”, siirry automaattisesti seuraavaan kysymykseen (seuraavan vastaajan sijaan)",
"FLB_STR_MENU_EXPAND_FORMULAS": "Laajenna Kustomoidut Kaavat",
"FLB_STR_GRADING_OPT_IGNORE": "Ohita",
"FLB_STR_GRADING_OPT_COPY_FOR_REFERENCE": "Kopioi viitteeksi",

// Flubaroo Tips, shown when grading completes.
"FLB_STR_TIP_MSG_NUMBER_1" : "<b>Flubaroo vinkki #1:</b> Flubaroo hyväksyy myös yhtä useampia oikeita vastauksia.",
"FLB_STR_TIP_MSG_NUMBER_2" : "<b>Flubaroo vinkki #2:</b> Flubaroo osaa tarkistaa lukualueita esim. luonnontieteiden ja matematiikan kyselyissä.",
"FLB_STR_TIP_MSG_NUMBER_3" : "<b>Flubaroo vinkki #3:</b> KISSA vai kissa? Voit tarkistaa myös kirjainkoon.",
"FLB_STR_TIP_MSG_NUMBER_4" : "<b>Flubaroo vinkki #4:</b> Haluatko muuttaa 70% hyväksymisrajan?",
"FLB_STR_TIP_MSG_NUMBER_5" : "<b>Flubaroo vinkki #5:</b> Haluatko tarkistaa sähköpostikiintiösi?",
"FLB_STR_TIP_MSG_NUMBER_6" : "<b>Flubaroo vinkki #6:</b> Haluatko tarkistaa kyselysi vastaukset automaattisesti?",
"FLB_STR_TIP_MSG_NUMBER_7" : "<b>Flubaroo vinkki #7:</b> Onko sinulla kysyttävää? Vastaus löytyy FAQ:sta",
"FLB_STR_TIP_MSG_NUMBER_8" : "<b>Flubaroo vinkki #8:</b> Oletteko GAFE koulu? Kerää vastaajien sähköpostiosoitteet automaattisesti!",
"FLB_STR_TIP_MSG_NUMBER_9" : "<b>Flubaroo vinkki #9:</b> Eikö tuloksia voi jakaa sähköpostitse? Jaa ne Google Drivessa!",
"FLB_STR_TIP_MSG_NUMBER_10" : "<b>Flubaroo vinkki #10:</b> Haluatko vastaajille paperikopion tuloksista? Tulostamiseen löytyy keino!",},
// END FINNISH //////////////////////////////////////////////////////////////////////////////////

// START BULGARIAN ////////////////////////////////////////////////////////////////////////////////

    "bg-BG": {
        // Name to identify language in language selector
        "FLB_LANG_IDENTIFIER": "Български (Bulgarian)",

        // Grading option which identifies a student
        "FLB_STR_GRADING_OPT_STUD_ID" : "Идентификатор на ученик",

        // Grading option which tells Flubaroo to skip grading on a question
        "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Пропусни оценяване",

        // Message shown when grading is complete (1 of 2).
        "FLB_STR_RESULTS_MSG1" : "Създаден е нов работен лист Оценки. Той съдържа оценка за всеки изпратен тест, както и обобщение за всички тестирани в горната част.\
                                  Последния ред показва процента на учениците, който са отговорили на въпроса правилно, като въпросите с най-много грешни отговори са оцветени в оранжево.\
                                  Учениците, които са постигнали неудовлетворителни резултати, са оцветени в червено.",

        // Message shown when grading is complete (2 of 2).
        "FLB_STR_RESULTS_MSG2" : "<b>ВАЖНО!</b>: Листът Оценки не бива да бъде променян, защото това може да направи невъзможно изпращането на имейли с оценките. Ако искате да работите върху данните от листа, копирайте го и работете с копието.",

        // Follows the Flubaroo tip, directing users to read the corresponding article.
        "FLB_STR_RESULTS_TIP_READ_ARTICLE" : "За повече информация натуснете <a target=_blank href=\"%s\">тук</a>.",

        // Instructions shown on Step 1 of grading.
        "FBL_STR_STEP1_INSTR" : "Моля да изберете начин за използване за всеки въпрос от теста. Flubaroo се е опитал автоматично да отгатне настройките за Вас, но вие трябва да ги проверите и потвърдите.",

        // Instructions shown on Step 2 of grading.
        "FBL_STR_STEP2_INSTR" : "Изберете кой от отговорите на теста да бъде използван като ключ с верните отговори. Обикновено това е отговорът от името на учителя. Всички други отговори ще бъдат оценявани за съответствие с този ключ, затова се уверете, че избирате правилния.",

        // Message shown if not enough submissions to perform grading.
        "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Няма достатъчно отговори за изпълнение на оценяване. Уверете се, че има попълнен ключ за отговори и опитайте пак, когато са се събрали достатъчно отговори на ученици.",

        // Please wait" message first shown when Flubaroo is first examining assignment.
        "FLB_STR_WAIT_INSTR1" : "Flubaroo проверява вашия тест. Изчакайте...",

        // Please wait" message shown after Step 1 and Step 2, while grading is happening.
        "FLB_STR_WAIT_INSTR2" :  "Моля, изчакайте, вашият тест се оценява. Това може да продължи няколко минути.",

        // Asks user if they are sure they want to re-grade, if Grades sheet exists.
        "FLB_STR_REPLACE_GRADES_PROMPT" : "Това действие ще премахне съществуващите оценки. Сигурни ли сте, че искате да продължите?",

        // Window title for "Preparing to grade" window
        "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - подготвя се за оценяване",

        // Window title for "Please wait" window while grading occurs
        "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - оценява теста",

        // Window title for "Grading Complete" window after grading occurs
        "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - оценяването е завършено",

        // Window title for grading Step 1
        "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Оценяване - Стъпка 1",

        // Window title for grading Step 2
        "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Оценяване - Стъпка 2",

        // "Grading Option" label that appears over first column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Настройки за оценяване",

        // "Question" label that appears over third column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Въпрос",

        // "Select" label that appears over radio button in first column of Step 2 of grading.
        "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Избор",

        // "Submission Time" label that appears over second column in Step 2 of grading.
        "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Час на предаване",

        // Label for "View Grades" button shown when grading completes.
        "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Виж оценките",

        // Used for "summary" text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Отчет",

        // Used for report and report email. Ex: "Report for 'My Test'"
        "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Отчет за ",

        // Points Possible. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Максимален брой точки",

        // Average Points. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Среден брой точки",

        // Counted Submissions. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Брой на отговорите",

        // Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Брой на незадоволителните отговори",

        // Name of column in Grades sheet that has total points scored.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Общи точки",

        // Name of column in Grades sheet that has score as percent.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Процент",

        // Name of column in Grades sheet that has number of times student made a submission.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Брой опити",

        // Name of column in Grades sheet that indicates if grade was already emailed out.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Изпратени ли са оценките по имейл?",

        // Name of column in Grades sheet that allows teacher to enter optional student feedback
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Рецензия (по избор)",

        // Window title for emailing grades
        "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - изпращане на оценките по имейл",

        // Instructions on how to email grades
        "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo може да изпрати оценките  на имейлите на учениците, както и верните отогвори. Изберете от падащите менюта въпросът, в който учениците са попълнили своя имейл адрес. Ако имейлът не е включен като въпрос в теста, няма как да изпратите оценките по имейл.",

        // Notice that grades cannot be emailed because the user has exceeded their daily quota.
        "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo не може да изпрати по имейл оценките в този момент, защото сте надвишили квотите за изпращане на имейли от Google. Те са определени от Google за всеки Add-ons. Моля, опитайте по-късно.",

        // Message about how many grade emails *have* been sent. This message is preceeded by a number.
        // Example: "5 grades were successfully emailed"
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "оценки са успешно изпратени",

        // Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "оценки не са изпратени поради непопълнен или невалиден имейл адрес, заради това, че оценките вече са изпратени веднъж или защото сте надвишили определените дневни квоти.",

        // Message about how many grade emails *have NOT* been sent.
        "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Не са изпратени оценки поради непопълнен или невалиден имейл адрес, заради това, че всички оценки са вече изпратени веднъж или защото сте надвишили определените дневни квоти.",

        // Subject of the email students receive. Followed by assignment name.
        // Example: Here is your grade for "Algebra Quiz #6"
        "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Ето ги оценките за ",

        // First line of email sent to students
        // Example: This email contains your grade for "Algebra Quiz #6"
        "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Имейлът съдържа резултатите Ви за ",

        // Message telling students not to reply to the email with their grades
        "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Не отговаряйте на това писмо",

        // Message that preceedes the student's grade
        "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Вашата оценка",

        // Message that preceedes the instructor's (optional) message in the email
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Общи изводи от проведения тест",

        // Message that preceedes the instructor's (optional) feedback for the student in the email
        "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Кратка рецензия от учителя",

        // Message that preceedes the summary of the student's information (name, date, etc)
        "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Резултати от теста",

        // Message that preceedes the table of the students scores (no answer key sent)
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Това са оценките ви за всеки въпрос",

        // Message that preceedes the table of the students scores, and answer key
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Това са оценките ви за всеки въпрос, последвани от верния отговор",

        // Header for the  column in the table of scores in the email which lists the question asked.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Въпрос",

        // Header for the  column in the table of scores in the email which lists the student's answer.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "Вашият отговор",

        // Header for the  column in the table of scores in the email which lists the correct answer.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Правилен отговор",

        // Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Вашата оценка",

        // Header for the  column in the table of scores in the email which lists the points possible (e.g. 5).
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Максимално възможни точки",

        // Header for the  column in the table of scores in the email which lists the Help Tip (if provided)
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Помощ за този въпрос",

        // Label for "points" used in the new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "точки",

        // Label for "Correct" questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Правилно",

        // Label for "Incorrect" questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Грешно",

        // Footer for the email sent to students, advertising Flubaroo.
        "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Този имейл е генериран от Flubaroo, безплатен инструмент за оценяване на тестове",

        // Link at the end of the footer. Leads to www.flubaroo.com
        "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Посетете flubaroo.com",

        // Subject of the record email sent to the instructor, when grades are emailed to the class.
        // Followed by the assignment name.
        // e.g. Record of grades emailed for Algebra Quiz #6
        "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Оценки, изпратени по имейл за ",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the name of the assignment, in the summary table.
        "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Име на теста",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the number of emails sent, in the summary table.
        "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Брой на изпратени имейли с оценки",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the number of graded submissions, in the summary table
        "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Брой на оценени отговори",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the average score in points (vs percent), in the summary table
        "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Среден успех (точки)",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the points possible, in the summary table
        "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Максимален брой точки",

        // Used in the record email sent to the instructor after she emails grades.
        // Indicated if an answer key was provided to the students, in the summary table
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Изпратен ли е ключ с верни отговори?",

        // Used in the record email sent to the instructor after she emails grades.
        // Value in summary table if answer key was NOT sent to students by instructor
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "Не",

        // Used in the record email sent to the instructor after she emails grades.
        // Value in summary table if answer key WAS sent to students by instructor
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Да",

        // Used in the record email sent to the instructor after she emails grades.
        // Message that preceeds what message the instructor email to her students.
        "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Вие включихте и следното съобщение",

        // About Flubaroo message (1 of 2)
        "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo е безплатно, пестящо време приложение, което позволява на учителите бързо да оценяват тестове и анализират резултатите",

        // About Flubaroo message (2 of 2)
        "FLB_STR_ABOUT_FLUBAROO_MSG2" : "За да научите повече, посетете www.flubaroo.com.",

        // Message that appears when "Student Submissions" sheet cannot be located.
        "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo не може да определи кой лист съдържа отговорите на учениците. Намерете листа и го преименувайте на: ",

        // Message that appears when "Grades" sheet cannot be located.
        "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo не може да определи кой лист съдържа оценките на учениците. Моля оценете отговорите, или намерете листа и го преименувайте на: ",

        // Menu option to grade assignment.
        "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Оцени отговорите",

        // Menu option to re-grade assignment.
        "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Оцени отговорите",

        // Menu option to email grades.
        "FLB_STR_MENU_EMAIL_GRADES" : "Изпрати по имейл отговорите",

        // Menu option to hide student feedback (hides the column)
        "FLB_STR_MENU_HIDE_FEEDBACK" : "Скрий колоната за рецензия",

        // Menu option to edit student feedback (unhides the column)
        "FLB_STR_MENU_EDIT_FEEDBACK" : "Покажи колоната за рецензия",

        // Menu option to hide help tips
        "FLB_STR_MENU_HIDE_HELP_TIPS" : "Скрий съветите",

        // Menu option to edit help tips
        "FLB_STR_MENU_EDIT_HELP_TIPS" : "Покажи съветите",

        // Menu option to view report.
        "FLB_STR_MENU_VIEW_REPORT" : "Покажи отчет",

        // Menu option to learn About Flubaroo.
        "FLB_STR_MENU_ABOUT" : "За Flubaroo",

        // Menu title for "Advanced" sub-menu
        "FLB_STR_MENU_ADVANCED" : "Разширени",

        // Menu title for Advanced > Options
        "FLB_STR_MENU_ADV_OPTIONS" : "Разширени настройки",

        // Menu option to choose the language.
        "FLB_STR_MENU_SET_LANGUAGE" : "Задай език",

        // Menu option to enable autograde.
        "FLB_STR_MENU_ENABLE_AUTO_GRADE" : "Разреши Autograde",

        // Menu option to disable autograde.
        "FLB_STR_MENU_DISABLE_AUTO_GRADE" : "Забрани Autograde",

        // Menu option to see reamining daily email quota
        "FLB_STR_MENU_SHOW_EMAIL_QUOTA" : "Провери квотата за имейли",

        // Menu option shown to enable Flubaroo in a sheet where it's never been used before
        "FLB_STR_MENU_ENABLE" : "Разреши Flubaroo на този лист",

        // Message to show when menu option for FLB_STR_MENU_ENABLE is chosen
        "FLB_STR_FLUBAROO_NOW_ENABLED" : "Flubaroo е позволен на този лист. Достъпен е през менюто.",

        // Word that appears on the "Continue" button in grading and emailing grades.
        "FLB_STR_BUTTON_CONTINUE" : "Продължи",

        // Name of "Student Submissions" sheet
        "FLB_STR_SHEETNAME_STUD_SUBM" : "Отговори",

        // Name of "Grades" sheet
        "FLB_STR_SHEETNAME_GRADES" : "Оценки",

        // Text put in Grades sheet when a question isnt graded.
        "FLB_STR_NOT_GRADED" : "Неоценени",

        // Message that is displayed when a new version of Flubaroo is installed.
        "FLB_STR_NEW_VERSION_NOTICE" : "Вие сте инсталирали нова версия на Flubaroo! Посетете flubaroo.com/blog за да видите новостите.",

        // Headline for notifications / alerts.
        "FLB_STR_NOTIFICATION" : "Съобщение от Flubaroo",

        // For emailing grades, question which asks user to identify email question.
        "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Въпрос, съдържащ имейл на ученик: ", // note the space after ":"

        // For emailing grades, asks user if list of questions and scores should be sent.
        "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Включи списък на въпросите и резултатите: ", // note the space after ":"

        // For emailing grades, asks user if answer key should be sent...
        "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Включи ключа с верните отговори: ", // note the space after ":"

        // For emailing grades, appears before text box for optional instructor message.
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Включи съобщението (по избор):",

        // Window title for View Report window
        "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Отчет с оценките",

        // Title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Графика на оценките",

        // Y-Axis (vertical) title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "изпратени теста",

        // X-Axis (horizontal) title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "точки",

        // Label of "Email Me Report" button in View Report window
        "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Изпрати ми отчет",

        // Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
        "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Отчетът е изпратен на",

        // Message to show the user in the top-left cell of the Grading sheet when grading starts.
        "FLB_STR_GRADING_CELL_MESSAGE" : "Оцени последните отговори...",

        // Message that pops up to notify the user that autograde is on.
        "FLB_STR_AUTOGRADE_IS_ON" : "Autograde е включен. Flubaroo изчаква нови отговори за оценяване. Не правете промени по листите, докато опцията не бъде изключена.",

        // Message that pops up to notify the user that autograde is on.
        "FLB_STR_AUTOGRADE_IS_OFF" : "Autograde е изключен.",

        // Message to ask the user if they want to grade recent, ungraded submissions, before autograde is enabled.
        "FLB_STR_AUTOGRADE_GRADE_RECENT" : "Някои от последните отговори трябва да бъдат оценени. Желаете ли Flubaroo да ги оцени и след това да бъде включен autograde?",

        // Message to tell the user that autograde must gather grading and email settings before being turned on.
        "FLB_STR_AUTOGRADE_SETUP" : "Преди да разрешите autograde трябва да зададете настройки за оценяване и избор на поле за имейл. Натиснете 'Да' за да продължите.",

        // Message asking user if they'd like to update their grading and email settings before turning on autograde.
        "FLB_STR_AUTOGRADE_UPDATE" : "Преди да бъде включен autograde, желаете ли да обновите настройките ви за оценка и избор на поле за имейл?",

        // Title of Advanced Options window
        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE" : "Разширени настройки",

        // Advanced Options notice that appears at the top of the window, telling the user to read the help center articles.
        "FLB_STR_ADV_OPTIONS_NOTICE" : "Променете настройките само след като сте се запознали с помощната информация",

        // Text for Advanced Options, describing option to not use noreply@ email address when sending grades.
        "FLB_STR_ADV_OPTIONS_NO_NOREPLY" : "Използвай моят адрес при изпращане на оценки, а не noreply@ адрес.",

        // Text for Advanced Options, describing option to send each student a link to edit their response.
        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK" : "При изпращане, автоматично изпрати имейл за ученика с линк за бързо редактиране на отговора.",

        // Text for Advanced Options, describing option to change the 70% pass rate.
        "FLB_STR_ADV_OPTIONS_PASS_RATE" : "Резултат (в %) за определяне на отговора като незадоволителен: ",

        // Message about how many more emails user can send that day. Shown from the Advanced > Check Email Quota menu.
        "FLB_STR_EMAIL_QUOTA_MSG" : "Брой останали имейл съобщения в квотата ви: ",

        // "Points" label that appears over second column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_POINTS" : "Точки",

        // Error message shown in Step 1 of grading if no fields selected with "Identifies Student"
        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR" : "Трябва да изберете поне един въпрос, който идентифицира ученика, преди да продължите.",

        // Error message shown in Step 1 of grading if no fields selected that are gradeable
        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR" : "Трябва да изберете поне един въпрос за оценяване.",

        // Error message shown in Step 2 of grading if no answer key selected.
        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED" : "Трябва да изберете ключ с верни отговори, преди да продължите.",

        // Grading option which indicates Normal Grading (for display only in Step 1)
        "FLB_STR_GRADING_OPT_NORMAL_GRADING" : "Автоматично оценяване",

        // Grading option which indicates Manual Grading (for display only in Step 1)
        "FLB_STR_GRADING_OPT_MANUAL_GRADING" : "Оценяване на ръка",

        // Message shown if user tries to enable autograde when a question is set for Manual Grading.
        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS" : "Autograde не може да бъде включено, защот имате въпроси, които се оценяват на ръка.",

        // Message shown if some questions are identical. All questions must be unique for Flubaroo to grade properly.
        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS" : "Имате въпроси за ръчно оценяване. Оценяването не може да бъде изпълнено, защото \
                                                някои от тия въпроси не могат да бъдат различени. Например, въпроси с еднакво име. \
                                                Моля проверете текста на въпросите в първия ред, така че да бъдат уникални \
                                                и опитайте да оцените теста отново.",

        // Label for manually graded questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL" : "Оценени на ръка",

        // Instructions that show-up in window when manual grading is selected.
        "FBL_STR_MANUAL_GRADING_INSTR" : "Използвайте настройките, за да оцените въпроса на ръка. \
					  Това ще работи добре само за въпроси, отбелязани за оценяване на ръка \
                                          на Стъпка 1.",

        // Menu option to open window for manual (by hand) grading of questions.
        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS" : "Оценявай въпросите на ръка",

        // Message shown in email to students if manually graded question wasn't assigned any points.
        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED" : "Няма присъдени точки",

        // Header for the column in the table of scores in the email which lists the Help Tip (if provided)
        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER" : "Рецензия от учителя",

        // Title for the "Grade by Hand" window
        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE" : "Flubaroo - оцени въпросите на ръка",

        // Label next to the first step in the "Grade by Hand" window, which allows the teacher to select the student.
        "FLB_STR_MANUAL_GRADING_STEP1" : "1. Избери ученик:",

        // Label next to the second step in the "Grade by Hand" window, which allows the teacher to select which question.
        "FLB_STR_MANUAL_GRADING_STEP2" : "2. Избери въпрос:",

        // Label next to the third step in the "Grade by Hand" window, which allows the teacher to read the submission.
        "FLB_STR_MANUAL_GRADING_STEP3" : "3. Прочети отговора на ученика:",

        // Label next to the fourth step in the "Grade by Hand" window, which allows the teacher to enter notes.
        "FLB_STR_MANUAL_GRADING_STEP4" : "4. Напиши рецензия на ученика (включва се в имейл):",

        // Text for the link that shows the teacher's answer key / rubric in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY" : "прегледай ключа с отговори",

        // Text for the button that is used to set the grade in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE" : "Присъди точки",

        // Text that appears in the button while the grade is being applied in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING" : "Работя",

        // Message that appears at the top of the "Grade by Hand" window after the grade has been successfully applied.
        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED" : "Оценката е записана.",

        // Message that appears at the top of the "Grade by Hand" window if the teacher doesn't enter a valid score in the box.
        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE" : "Напишете валидна оценка.",

        // Message that appears at the top of the "Grade by Hand" window if an error occurs while setting the grade.
        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED" : "Грешка.",

        // Text for "Close X" link that allows the teacher to close the pop-up window that contains the answer key in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP" : "Затвори",

        // Message that appears if a teacher tries to disable autograde while grading is in process.
        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW" : "Autograde в момента оценява тест, така че не можете да го спрете. Опитайте след малко.",

        // Message that is shown to the user if grading cannot complete because no valid submissions were found in the submissions sheet (i.e. oinly blank rows).
        "FLB_STR_NO_VALID_SUBMISSIONS" : "Листът Оценки не може да бъде създаден, защото няма валидни отговори на теста.",

        // Title of the window that informs the user that their Grades sheet is corrupted (badly formed).
        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Промяна в лист Оценки - не мога да продължа",

        // Message shown in the "Corrupted Grades Sheet" window.
        "FLB_STR_INVALID_GRADES_SHEET" : "<p>Flubaroo не може да продължи, защото листът с оценки е бил променен. Вероятно сте изтрили \
                                          редове, колони, данни от листа след последното оценяване.</p>\
                                          <p>Вижте <a href=\"http://www.flubaroo.com/hc/corrupted-grades-sheet\">статията</a> за повече информация.</p>",

        // Short message that is included at the top of the Grades sheet in bold, instructing users not to modify the Grades sheet.
        "FLB_STR_DO_NOT_DELETE_MSG" : "ЗА ДА СТЕ СИГУРНИ, ЧЕ FLUBAROO РАБОТИ ПРАВИЛНО, НЕ ИЗТРИВАЙТЕ РЕДОВЕ И КОЛОНИ ОТ ЛИСТА",

        // Label for the "Share Grades" window, which asks the user how they would like to share the grades (email, drive, or both).
        "FLB_STR_GRADES_SHARE_LABEL" : "Метод за изпращане на оценките:",

        // Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via email.
        "FLB_STR_GRADES_SHARE_EMAIL" :  "Изпрати по имейл", // always at index 0

        // Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via Google Drive.
        "FLB_STR_GRADES_SHARE_DRIVE" :  "Изпрати чрез Google Drive (без имейл)",  // always at index 1

        // Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via both email and Drive.
        "FLB_STR_GRADES_SHARE_BOTH" :   "Изпрати по имейл и чрез Google Drive", // always at index 2

        // Name of the folder where shared and printed grades get put in the teacher's My Drive.
        "FLB_STR_DRIVE_SHARE_FOLDER_NAME" : "Flubaroo - изпрати оценки",

        // Text that begins the shared Google Document. Example: "Grade for dave@edcode.org - Exam #2"
        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE" : "Оценки за",

        // Text/Link that is included in the emails to students if the "both" method of grade sharing was selected by the teacger.
        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG" : "Натисни, за да видиш отчет за оценките в Google Drive",

        // Title for window that allows teachers to print the grades.
        "FLB_STR_PRINT_GRADES_WINDOW_TITLE" : "Flubaroo - отпечатай оценки",

        // Instructions for the "Print Grades" window
        "FLB_STR_PRINT_GRADES_INSTR" : "Flubaroo ще създаде Google Document с оценките на всички ученици, който може да се принтира. \
                                        Можете да зададете съобщение с всеки документ и дали да включвате въпросите и верните отговори.",

        // Title for the "Share Grades" window.
        "FLB_STR_SHARE_GRADES_WINDOW_TITLE" : "Flubaroo - изпрати оценките",

        // Instructions for the "Share Grades" window.
        "FLB_STR_SHARE_GRADES_INSTR" : "Flubaroo може да изпрато иценките по имейл, чрез Google Drive, или и по двата начина. Използвайте падащото меню да изберете въпросът, който съдържа имейл адресите на учениците. Ако нямате имейлите на учениците, няма как да изпратите оценките.",

        // Success message shown after grades have been printed. Followed by a link to the printable document.
        "FBL_STR_PRINT_GRADES_SUCCESS" : "Създаден е Google document с всички оценки на учениците. Натиснете името на файла отдолу, за да го отворите. Отпечатайте го и раздайте на учениците.",

        // Text that begins the name of the Google Document containing the printable grades. Example: "Printable grades for: Exam #2"
        "FBL_STR_PRINT_GRADES_TITLE_PRE": "Оценки за:",

        // Menu option to share grades.
        "FLB_STR_MENU_SHARE_GRADES" : "Изпрати оценките",

        // Menu option to print grades.
        "FLB_STR_MENU_PRINT_GRADES" : "Отпечатай оценките",

        // Grading option for "Extra Credit" on questions.
        "FLB_STR_GRADING_OPT_EXTRA_CREDIT": "Допълнителен бонус",

         // Text for Advanced Options, describing option to allow extra credit.
        "FLB_STR_ADV_OPTIONS_EXTRA_CREDIT" : "Позволява допълнителен бонус при оценяване на учениците",

        // Flubaroo Tips, shown when grading completes.
        "FLB_STR_TIP_MSG_NUMBER_1" : "<b>Flubaroo съвет 1:</b> Flubaroo може да приема повече от еди верен отговор.",
        "FLB_STR_TIP_MSG_NUMBER_2" : "<b>Flubaroo съвет 2:</b> Flubaroo може да оценява числови интервали при математически и научни въпроси.",
        "FLB_STR_TIP_MSG_NUMBER_3" : "<b>Flubaroo съвет 3:</b> ОТГОВОР или отговор? Оценяване на чуствителни към главни и малки букви въпроси.",
        "FLB_STR_TIP_MSG_NUMBER_4" : "<b>Flubaroo съвет 4:</b> Искате ли да промените изисквания 70% минимум?",
        "FLB_STR_TIP_MSG_NUMBER_5" : "<b>Flubaroo съвет 5:</b> Искате ли да проверите оставащата ви дневна квота?",
        "FLB_STR_TIP_MSG_NUMBER_6" : "<b>Flubaroo съвет 6:</b> Искате ли отговорите да се оценяват автоматично?",
        "FLB_STR_TIP_MSG_NUMBER_7" : "<b>Flubaroo съвет 7:</b> Имате въпроси? Ще намерите отговори в нашите ЧЗВ!",
        "FLB_STR_TIP_MSG_NUMBER_8" : "<b>Flubaroo съвет 8:</b> Вашето училище участва в ли в GAFE? Тогава можете да получавате имейлите автоматично!",
        "FLB_STR_TIP_MSG_NUMBER_9" : "<b>Flubaroo съвет 9:</b> Не можете да изпращате оценките по имейл? Изпращайте ги чрез Google Drive!",
        "FLB_STR_TIP_MSG_NUMBER_10" : "<b>Flubaroo съвет 10:</b> Искате разпечатка на оценките на учениците? Научете как да я направите!",

    },
// END BULGARIAN //////////////////////////////////////////////////////////////////////////////////  

////////////////////////////////////////////////////////////////////////////////
// START ITALIAN ////////////////////////////////////////////////////////////////////////////////
  
    "it": {
        // Name to identify language in language selector
        "FLB_LANG_IDENTIFIER": "Italiano (Italian)",

        // Grading option which identifies a student
        "FLB_STR_GRADING_OPT_STUD_ID" : "Identifica lo studente",

        // Grading option which tells Flubaroo to skip grading on a question
        "FLB_STR_GRADING_OPT_SKIP_GRADING" : "Non valutare",
      
        // Message shown when grading is complete (1 of 2).
        "FLB_STR_RESULTS_MSG1" : "È stato creato un nuovo foglio elettronico chiamato 'Valutazioni'. Contiene una valutazione per ogni test completato e un sommario iniziale di tutte le valutazioni. Le ultime righe mostrano le percentuali di studenti che hanno fornito una risposta corretta a ciascuna domanda e le domande con una bassa percentuale di risposte corrette sono evidenziate in arancio. Gli studenti che hanno ottenuto un punteggio inferiore al minimo per superare il test appaiono in rosso.",

        // Message shown when grading is complete (2 of 2).
        "FLB_STR_RESULTS_MSG2" : "<b>IMPORTANTE</b>: Il foglio elettronico 'Valutazioni' non deve essere modificato in alcun modo, poiché questo può interferire con l’assegnazione dei voti. Se hai bisogno di modificare questo foglio, fanne prima una copia e modifica la copia.",
        
        // Follows the Flubaroo tip, directing users to read the corresponding article.
        "FLB_STR_RESULTS_TIP_READ_ARTICLE" : "Clicca <a target=_blank href=\"%s\">qui</a> per maggiori informazioni.",
        
        // Instructions shown on Step 1 of grading.
        "FBL_STR_STEP1_INSTR" : "Seleziona un’opzione di punteggio per ogni domanda del test. Flubaroo ha cercato di individuare l’opzione migliore, ma dovresti ricontrollare tutto tu stesso.",

        // Instructions shown on Step 2 of grading.
        "FBL_STR_STEP2_INSTR" : "Seleziona la riga che deve essere utilizzata come Risposta Chiave. Generalmente si tratta della riga corrispondente alle tue risposte. Tutte le altre risposte saranno valutate confrontando la risposta chiave, quindi presta attenzione a selezionare la riga giusta.",

        // Message shown if not enough submissions to perform grading.
        "FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS" : "Non ci sono abbastanza test completati per assegnare voti. Controlla di aver inserito una risposta chiave e prova di nuovo quando più studenti avranno completato il test.",

        // Please wait" message first shown when Flubaroo is first examining assignment.
        "FLB_STR_WAIT_INSTR1" : "Flubaroo sta controllando il tuo test.  Aspetta, per favore...",

        // Please wait" message shown after Step 1 and Step 2, while grading is happening.
        "FLB_STR_WAIT_INSTR2" :  "Aspetta che il tuo test sia valutato.  Questa operazione può richiedere uno o due minuti.",

        // Asks user if they are sure they want to re-grade, if Grades sheet exists.
        "FLB_STR_REPLACE_GRADES_PROMPT" : "In questo modo verranno sostituite le valutazioni attuali.  Sei sicuro di voler continuare?",

        // Window title for "Preparing to grade" window
        "FLB_STR_PREPARING_TO_GRADE_WINDOW_TITLE" : "Flubaroo - Preparazione della valutazione",

        // Window title for "Please wait" window while grading occurs
        "FLB_STR_GRADING_WINDOW_TITLE" : "Flubaroo - Assegnazione delle valutazioni",

        // Window title for "Grading Complete" window after grading occurs
        "FLB_STR_GRADING_COMPLETE_TITLE" : "Flubaroo - Valutazione completata",

        // Window title for grading Step 1
        "FLB_STR_GRADE_STEP1_WINDOW_TITLE" : "Flubaroo - Valutazione passo 1",

        // Window title for grading Step 2
        "FLB_STR_GRADE_STEP2_WINDOW_TITLE" : "Flubaroo - Valutazione passo 2",

        // "Grading Option" label that appears over first column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_GRADING_OPTION" : "Opzione di punteggio",

        // "Question" label that appears over third column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_QUESTION" : "Domanda",
     
        // "Select" label that appears over radio button in first column of Step 2 of grading.
        "FLB_STR_GRADE_STEP2_LABEL_SELECT" : "Seleziona",

        // "Submission Time" label that appears over second column in Step 2 of grading.
        "FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME" : "Orario di invio",

        // Label for "View Grades" button shown when grading completes.
        "FLB_STR_GRADE_BUTTON_VIEW_GRADES" : "Mostra le valutazioni",

        // Used for "summary" text shown at top of Grades sheet, and in report. 
        "FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY" : "Sommario",

        // Used for report and report email. Ex: "Report for 'My Test'" 
        "FLB_STR_GRADE_SUMMARY_TEXT_REPORT_FOR" : "Risultati per",

        // Points Possible. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE" : "Punti Possibili",

        // Average Points. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS" : "Punteggio medio",

        // Counted Submissions. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS" : "Numero di test",

        // Number of Low Scoring Questions. Used for text shown at top of Grades sheet, and in report.
        "FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING" : "Numero di domande con voti bassi",

        // Name of column in Grades sheet that has total points scored.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS" : "Punti totali",

        // Name of column in Grades sheet that has score as percent.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT" : "Percentuale",

        // Name of column in Grades sheet that has number of times student made a submission.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED" : "Numero di tentativi",

        // Name of column in Grades sheet that indicates if grade was already emailed out.
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE" : "Risultato inviato?",

        // Name of column in Grades sheet that allows teacher to enter optional student feedback
        "FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK" : "Feedback per lo studente (Opzionale)",

        // Window title for emailing grades
        "FLB_STR_EMAIL_GRADES_WINDOW_TITLE" : "Flubaroo - Invio risultati",

        // Instructions on how to email grades
        "FLB_STR_EMAIL_GRADES_INSTR" : "Flubaroo può spedire via email a ciascuno studente il suo risultato, così come le risposte corrette. Utilizza il menù a tendina per selezionare la domanda contenente il loro indirizzo email. Se gli indirizzi email non sono stati richiesti, non sarai in grado di spedire i voti.",

        // Notice that grades cannot be emailed because the user has exceeded their daily quota.
        "FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED" : "Flubaroo non può inviare i risultati ora perché hai superato la quota giornaliera di invio email.  Questa quota è fissata da Goggle per tutti gli Add-ons.  Prova più tardi.",
      
        // Message about how many grade emails *have* been sent. This message is preceeded by a number.
        // Example: "5 grades were successfully emailed"
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT" : "risultati sono stati inviati con successo",

        // Message about how many grade emails *have NOT* been sent. This message is preceeded by a number.
        "FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT" : "risultati non sono stati inviati a causa di indirizzi email nulli o non validi, perché sono stati già inviati in passato, o perché hai superato la tua quota giornaliera di email.",

        // Message about how many grade emails *have NOT* been sent.
        "FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT" : "Non è stato inviato nessun risultato, a causa di indirizzi email nulli o non validi, perché sono stati già inviati in passato, o perché hai superato la tua quota giornaliera di email.",     
      
        // Subject of the email students receive. Followed by assignment name. 
        // Example: Here is your grade for "Algebra Quiz #6"
        "FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT" : "Questo è il tuo risultato per",

        // First line of email sent to students
        // Example: This email contains your grade for "Algebra Quiz #6"
        "FLB_STR_EMAIL_GRADES_EMAIL_BODY_START" : "Questo messaggio contiene il tuo risultato per",

        // Message telling students not to reply to the email with their grades
        "FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG" : "Non rispondere a questo messaggio",

        // Message that preceedes the student's grade
        "FLB_STR_EMAIL_GRADES_YOUR_GRADE" : "Il tuo risultato",

        // Message that preceedes the instructor's (optional) message in the email
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW" : "Qui sotto è riportato un messaggio dal tuo docente, inviato a tutti gli studenti",

        // Message that preceedes the instructor's (optional) feedback for the student in the email
        "FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW" : "Il tuo docente ha un messaggio specifico per te",

        // Message that preceedes the summary of the student's information (name, date, etc)
        "FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY" : "Sommario del tuo test",

        // Message that preceedes the table of the students scores (no answer key sent)
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE" : "Qui sotto è riportato il punteggio per ciascuna risposta",

        // Message that preceedes the table of the students scores, and answer key
        "FLB_STR_EMAIL_GRADES_BELOW_IS_YOUR_SCORE_AND_THE_ANSWER" : "Qui sotto è riportato il punteggio per ciascuna risposta, insieme alla risposta corretta",

        // Header for the  column in the table of scores in the email which lists the question asked.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER" : "Domanda",

        // Header for the  column in the table of scores in the email which lists the student's answer.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER" : "La tua risposta",

        // Header for the  column in the table of scores in the email which lists the correct answer.
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER" : "Risposta corretta",

        // Header for the column in the table of scores in the email which lists the student's score (0, 1, 2...)
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_SCORE_HEADER" : "Il tuo punteggio",

        // Header for the  column in the table of scores in the email which lists the points possible (e.g. 5).
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS_POSSIBLE_HEADER" : "Punti possibili",

        // Header for the  column in the table of scores in the email which lists the Help Tip (if provided)
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER" : "Aiuto per questa domanda",

        // Label for "points" used in the new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS" : "punti",

        // Label for "Correct" questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT" : "Corretta",

        // Label for "Incorrect" questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT" : "Sbagliata",

        // Footer for the email sent to students, advertising Flubaroo.
        "FLB_STR_EMAIL_GRADES_EMAIL_FOOTER" : "Questo messaggio è stato generato da Flubaroo, un software libero per valutare test",

        // Link at the end of the footer. Leads to www.flubaroo.com
        "FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO" : "Visita flubaroo.com",

        // Subject of the record email sent to the instructor, when grades are emailed to the class.
        // Followed by the assignment name.
        // e.g. Record of grades emailed for Algebra Quiz #6
        "FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT": "Risultato inviato per",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the name of the assignment, in the summary table.
        "FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME": "Nome del test",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the number of emails sent, in the summary table.
        "FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT": "Numero di risultati inviati",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the number of graded submissions, in the summary table
        "FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM": "Numero di test valutati",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the average score in points (vs percent), in the summary table
        "FLB_STR_EMAIL_RECORD_AVERAGE_SCORE": "Punteggio medio",

        // Used in the record email sent to the instructor after she emails grades.
        // Labels the points possible, in the summary table
        "FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE": "Punti possibili",

        // Used in the record email sent to the instructor after she emails grades.
        // Indicated if an answer key was provided to the students, in the summary table
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED": "Risposta corretta fornita?",

        // Used in the record email sent to the instructor after she emails grades.
        // Value in summary table if answer key was NOT sent to students by instructor
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO": "No",

        // Used in the record email sent to the instructor after she emails grades.
        // Value in summary table if answer key WAS sent to students by instructor
        "FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES": "Sì",

        // Used in the record email sent to the instructor after she emails grades.
        // Message that preceeds what message the instructor email to her students.
        "FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE": "Hai anche inviato il seguente messaggio",

        // About Flubaroo message (1 of 2)
        "FLB_STR_ABOUT_FLUBAROO_MSG1" : "Flubaroo è un software libero che consente a docenti di valutare velocemente test a risposta multipla e di analizzarne i risultati.",

        // About Flubaroo message (2 of 2)
        "FLB_STR_ABOUT_FLUBAROO_MSG2" : "Per saperne di più, visita www.flubaroo.com.",

        // Message that appears when "Student Submissions" sheet cannot be located.
        "FLB_STR_CANNOT_FIND_SUBM_MSG" : "Flubaroo non ha potuto capire quale foglio contenga le risposte degli studenti.  Trova il foglio giusto e rinominalo come: ",

        // Message that appears when "Grades" sheet cannot be located.
        "FLB_STR_CANNOT_FIND_GRADES_MSG" : "Flubaroo non ha potuto capire quale foglio contenga i risultati.  Valuta il test, o trova il foglio con i voti e rinominalo come: ",

        // Menu option to grade assignment.
        "FLB_STR_MENU_GRADE_ASSIGNMENT" : "Valuta il test",

        // Menu option to re-grade assignment.
        "FLB_STR_MENU_REGRADE_ASSIGNMENT" : "Rivaluta il test",

        // Menu option to email grades.
        "FLB_STR_MENU_EMAIL_GRADES" : "Invia i risultati",

        // Menu option to hide student feedback (hides the column)
        "FLB_STR_MENU_HIDE_FEEDBACK" : "Nascondi il feedback per gli studenti",

        // Menu option to edit student feedback (unhides the column)
        "FLB_STR_MENU_EDIT_FEEDBACK" : "Modifica il feedback per gli studenti",

        // Menu option to hide help tips
        "FLB_STR_MENU_HIDE_HELP_TIPS" : "Nascondi i suggerimenti di aiuto",

        // Menu option to edit help tips
        "FLB_STR_MENU_EDIT_HELP_TIPS" : "Modifica i suggerimenti di aiuto",

        // Menu option to view report.
        "FLB_STR_MENU_VIEW_REPORT" : "Vedi il report",

        // Menu option to learn About Flubaroo.
        "FLB_STR_MENU_ABOUT" : "A proposito di Flubaroo",

        // Menu title for "Advanced" sub-menu
        "FLB_STR_MENU_ADVANCED" : "Avanzate",
      
        // Menu title for Advanced > Options
        "FLB_STR_MENU_ADV_OPTIONS" : "Opzioni avanzate",
      
        // Menu option to choose the language.
        "FLB_STR_MENU_SET_LANGUAGE" : "Scegli la lingua",

        // Menu option to enable autograde.
        "FLB_STR_MENU_ENABLE_AUTO_GRADE" : "Attiva la valutazione automatica",
  
        // Menu option to disable autograde.
        "FLB_STR_MENU_DISABLE_AUTO_GRADE" : "Disattiva la valutazione automatica",
      
        // Menu option to see reamining daily email quota
        "FLB_STR_MENU_SHOW_EMAIL_QUOTA" : "Controlla la quota email",
      
        // Menu option shown to enable Flubaroo in a sheet where it's never been used before
        "FLB_STR_MENU_ENABLE" : "Attiva Flubaroo su questo foglio",
      
        // Message to show when menu option for FLB_STR_MENU_ENABLE is chosen
        "FLB_STR_FLUBAROO_NOW_ENABLED" : "Flubaroo è stato attivato per questo foglio elettronico. Puoi ora accedere al menù relativo.",
      
        // Word that appears on the "Continue" button in grading and emailing grades.
        "FLB_STR_BUTTON_CONTINUE" : "Continua",

        // Name of "Student Submissions" sheet
        "FLB_STR_SHEETNAME_STUD_SUBM" : "Risposte Degli Studenti",     

        // Name of "Grades" sheet
        "FLB_STR_SHEETNAME_GRADES" : "Valutazioni",

        // Text put in Grades sheet when a question isnt graded.
        "FLB_STR_NOT_GRADED" : "Non valutata",

        // Message that is displayed when a new version of Flubaroo is installed.
        "FLB_STR_NEW_VERSION_NOTICE" : "Hai installato una nuova versione di Flubaroo! Visita flubaroo.com/blog per vedere cosa c’è di nuovo.",

        // Headline for notifications / alerts.
        "FLB_STR_NOTIFICATION" : "Notifiche di Flubaroo",

        // For emailing grades, question which asks user to identify email question.
        "FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL" : "Domanda relativa all’indirizzo email: ", // note the space after ":"

        // For emailing grades, asks user if list of questions and scores should be sent.
        "FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES" : "Includi la lista di domande ed i punteggi: ", // note the space after ":"

        // For emailing grades, asks user if answer key should be sent...
        "FLB_STR_EMAIL_GRADES_ANSWER_KEY" : "Includi la risposta chiave: ", // note the space after ":"
        
        // For emailing grades, appears before text box for optional instructor message.
        "FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE" : "Messaggio da includere (opzionale):",

        // Window title for View Report window
        "FLB_STR_VIEW_REPORT_WINDOW_TITLE" : "Flubaroo - Rapporto della valutazione",

        // Title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_CHART_TITLE" : "Istogramma dei punteggi",

        // Y-Axis (vertical) title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_Y-AXIS_TITLE" : "Invii",

        // X-Axis (horizontal) title of historgram chart in report
        "FLB_STR_VIEW_REPORT_HISTOGRAM_X-AXIS_TITLE" : "Punti ottenuti",

        // Label of "Email Me Report" button in View Report window
        "FLB_STR_VIEW_REPORT_BUTTON_EMAIL_ME" : "Inviami il rapporto",

        // Notification that tells who the report was emailed to (example: "The report has been emailed to: bob@hi.com")
        "FLB_STR_VIEW_REPORT_EMAIL_NOTIFICATION" : "Il rapporto è stato spedito a",
      
        // Message to show the user in the top-left cell of the Grading sheet when grading starts. 
        "FLB_STR_GRADING_CELL_MESSAGE" : "Valuto gli invii più recenti...",
      
        // Message that pops up to notify the user that autograde is on.
        "FLB_STR_AUTOGRADE_IS_ON" : "La valutazione automatica è attivata. Non modificare alcun foglio finché la valutazione automatica è attiva.",

        // Message that pops up to notify the user that autograde is on.
        "FLB_STR_AUTOGRADE_IS_OFF" : "La valutazione automatica è ora disabilitata.",
      
        // Message to ask the user if they want to grade recent, ungraded submissions, before autograde is enabled.
        "FLB_STR_AUTOGRADE_GRADE_RECENT" : "Alcuni test più recenti non sono stati valutati. Vuoi che Flubaroo li valuti prima di attivare la valutazione automatica?",

        // Message to tell the user that autograde must gather grading and email settings before being turned on.      
        "FLB_STR_AUTOGRADE_SETUP" : "Prima di attivare la valutazione automatica devi selezionare alcune opzioni relative al sistema di valutazione ed all’invio di messaggi. Premi 'OK' per proseguire.",
 
        // Message asking user if they'd like to update their grading and email settings before turning on autograde.
        "FLB_STR_AUTOGRADE_UPDATE" : "Prima di attivare la valutazione automatica vuoi aggiornare le tue opzioni di valutazione e di invio messaggi?",
      
        // Title of Advanced Options window
        "FLB_STR_ADV_OPTIONS_WINDOW_TITLE" : "Opzioni avanzate",

        // Advanced Options notice that appears at the top of the window, telling the user to read the help center articles.
        "FLB_STR_ADV_OPTIONS_NOTICE" : "Modifica queste opzioni solo se hai letto gli articoli corrispondenti",
      
        // Text for Advanced Options, describing option to not use noreply@ email address when sending grades.      
        "FLB_STR_ADV_OPTIONS_NO_NOREPLY" : "Utilizza il mio indirizzo come indirizzo di risposta, invece di noreply@.",
     
        // Text for Advanced Options, describing option to send each student a link to edit their response.
        "FLB_STR_ADV_OPTIONS_EMAIL_EDIT_LINK" : "Dopo l’invio di un test, spedisci allo studente un link per modificare facilmente la sua risposta.",
      
        // Text for Advanced Options, describing option to change the 70% pass rate.
        "FLB_STR_ADV_OPTIONS_PASS_RATE" : "Percentuale sotto la quale lo studente è evidenziato in rosso: ",

        // Message about how many more emails user can send that day. Shown from the Advanced > Check Email Quota menu.  
        "FLB_STR_EMAIL_QUOTA_MSG" : "Nella tua quota giornaliera ti rimangono questi messaggi da inviare: ",
     
        // "Points" label that appears over second column in Step 1 of grading.
        "FLB_STR_GRADE_STEP1_LABEL_POINTS" : "Punti",
      
        // Error message shown in Step 1 of grading if no fields selected with "Identifies Student"
        "FBL_STR_GRADE_STEP1_STUD_IDENT_ERROR" : "Devi selezionare almeno una domanda che identifichi lo studente prima di continuare.",
       
        // Error message shown in Step 1 of grading if no fields selected that are gradeable
        "FBL_STR_GRADE_STEP1_NO_GRADEABLE_ERROR" : "Devi selezionare almeno una domanda che sia valutabile.",
            
        // Error message shown in Step 2 of grading if no answer key selected.
        "FBL_STR_GRADE_STEP2_NO_AK_SELECTED" : "Devi selezionare una risposta chiave prima di proseguire.",
      
        // Grading option which indicates Normal Grading (for display only in Step 1)
        "FLB_STR_GRADING_OPT_NORMAL_GRADING" : "Valutazione normale",

        // Grading option which indicates Manual Grading (for display only in Step 1)
        "FLB_STR_GRADING_OPT_MANUAL_GRADING" : "Valutazione manuale (Nuovo!)",
      
        // Message shown if user tries to enable autograde when a question is set for Manual Grading.
        "FLB_STR_AUTOGRADE_NO_MANUAL_QUESTIONS" : "La valutazione automatica non può essere abilitata perché hai una o più domande valutate manualmente.",
        
        // Message shown if some questions are identical. All questions must be unique for Flubaroo to grade properly.
        "FBL_STR_GRADE_NON_UNIQUE_QUESTIONS" : "Hai richiesto che una o più domande siano valutate manualmente.  Tuttavia la valutazione non \
                                                può proseguire poiché alcune domande sono identiche ad altre. Ad esempio, puoi avere due domande \
                                                chiamate entrambe \"Domanda\". Modifica il testo di queste domande nella Riga 1 in modo tale che \
                                                siano differenti (ad esempio, \"Domanda 1\" e \"Domanda 2\") e prova ancora.",
            
        // Label for manually graded questions in new style email summary of grades
        "FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL" : "Valutata manualmente",

        // Instructions that show-up in window when manual grading is selected.      
        "FBL_STR_MANUAL_GRADING_INSTR" : "Utilizza i controlli qui sotto per assegnare voti manualmente. La funzione è attiva solo per domande per le quali hai selezionato \"Valutazione manuale\" al Passo 1 della valutazione.",
      
        // Menu option to open window for manual (by hand) grading of questions.
        "FLB_STR_MENU_MANUALLY_GRADE_QUESTIONS" : "Valuta le risposte manualmente",
      
        // Message shown in email to students if manually graded question wasn't assigned any points.
        "FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED" : "Nessun punteggio assegnato",
      
        // Header for the column in the table of scores in the email which lists the Help Tip (if provided)
        "FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER" : "Commenti del tuo docente",

        // Title for the "Grade by Hand" window      
        "FLB_STR_MANUALLY_GRADE_QUESTIONS_WINDOW_TITLE" : "Flubaroo - Valuta le risposte manualmente",
      
        // Label next to the first step in the "Grade by Hand" window, which allows the teacher to select the student.
        "FLB_STR_MANUAL_GRADING_STEP1" : "1. Seleziona lo studente:",
      
        // Label next to the second step in the "Grade by Hand" window, which allows the teacher to select which question.
        "FLB_STR_MANUAL_GRADING_STEP2" : "2. Seleziona la domanda:",
      
        // Label next to the third step in the "Grade by Hand" window, which allows the teacher to read the submission.
        "FLB_STR_MANUAL_GRADING_STEP3" : "3. Vedi la risposta dello studente:", 
      
        // Label next to the fourth step in the "Grade by Hand" window, which allows the teacher to enter notes.
        "FLB_STR_MANUAL_GRADING_STEP4" : "4. Inserisci le note per lo studente (verranno inviate via mail):", 
      
        // Text for the link that shows the teacher's answer key / rubric in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_REVIEW_ANSWER_KEY" : "controlla la risposta chiave", 
      
        // Text for the button that is used to set the grade in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_BUTTON_SET_GRADE" : "Inserisci il punteggio",
      
        // Text that appears in the button while the grade is being applied in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_BUTTON_WORKING" : "Attendere",
      
        // Message that appears at the top of the "Grade by Hand" window after the grade has been successfully applied.
        "FLB_STR_MANUAL_GRADING_GRADE_APPLIED" : "Il punteggio è stato inserito.",
      
        // Message that appears at the top of the "Grade by Hand" window if the teacher doesn't enter a valid score in the box.
        "FLB_STR_MANUAL_GRADING_ENTER_VALID_GRADE" : "Inserisci un valore valido.",
      
        // Message that appears at the top of the "Grade by Hand" window if an error occurs while setting the grade.
        "FLB_STR_MANUAL_GRADING_ERROR_OCCURED" : "Si è verificato un errore.",
      
        // Text for "Close X" link that allows the teacher to close the pop-up window that contains the answer key in the "Grade by Hand" window.
        "FLB_STR_MANUAL_GRADING_CLOSE_POPUP" : "Chiudi",
      
        // Message that appears if a teacher tries to disable autograde while grading is in process.
        "FLB_STR_AUTOGRADE_CANNOT_DISABLE_NOW" : "La valutazione automatica sta attualmente valutando uno o più test, pertanto non può essere disabilitata.  Prova di nuovo tra breve.",
      
        // Message that is shown to the user if grading cannot complete because no valid submissions were found in the submissions sheet (i.e. oinly blank rows).
        "FLB_STR_NO_VALID_SUBMISSIONS" : "Il foglio di valutazioni non è stato creato perché non è stato trovato nessun test valido.",
      
        // Title of the window that informs the user that their Grades sheet is corrupted (badly formed).
        "FLB_STR_INVALID_GRADE_SHEET_TITLE": "Foglio di valutazioni corrotto - Non posso continuare",
      
        // Message shown in the "Corrupted Grades Sheet" window.
        "FLB_STR_INVALID_GRADES_SHEET" : "<p>Flubaroo non può continuare perché il tuo foglio di valutazioni è corrotto. Hai per caso cancellato righe, colonne \
o altri dati dal foglio Valutazioni recentemente?</p>\
                                          <p>Vedi <a href=\"http://www.flubaroo.com/hc/corrupted-grades-sheet\">questo articolo</a> per aiuto.</p>",
      
        // Short message that is included at the top of the Grades sheet in bold, instructing users not to modify the Grades sheet.
        "FLB_STR_DO_NOT_DELETE_MSG" : "PER FARE IN MODO CHE FLUBAROO FUNZIONI CORRETTAMENTE NON CANCELLARE RIGHE O COLONNE IN QUESTO FOGLIO", 
      
        // Label for the "Share Grades" window, which asks the user how they would like to share the grades (email, drive, or both).
        "FLB_STR_GRADES_SHARE_LABEL" : "Metodo di invio dei risultati:",
      
        // Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via email.
        "FLB_STR_GRADES_SHARE_EMAIL" :  "Tramite email (tipico)", // always at index 0
      
        // Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via Google Drive.
        "FLB_STR_GRADES_SHARE_DRIVE" :  "Tramite Google Drive (nessuna email)",  // always at index 1
        
        // Pull-down menu selection for the "Share Grades" window which specifies grades should be shared via both email and Drive.
        "FLB_STR_GRADES_SHARE_BOTH" :   "Tramite entrambi, email e Drive", // always at index 2
      
        // Name of the folder where shared and printed grades get put in the teacher's My Drive.
        "FLB_STR_DRIVE_SHARE_FOLDER_NAME" : "Flubaroo - Risultati inviati",
      
        // Text that begins the shared Google Document. Example: "Grade for dave@edcode.org - Exam #2"
        "FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE" : "Risultato per",
      
        // Text/Link that is included in the emails to students if the "both" method of grade sharing was selected by the teacher.
        "FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG" : "Clicca per vedere il report dei risultati su Google Drive",
      
        // Title for window that allows teachers to print the grades.
        "FLB_STR_PRINT_GRADES_WINDOW_TITLE" : "Flubaroo - Stampa i Voti",
      
        // Instructions for the "Print Grades" window
        "FLB_STR_PRINT_GRADES_INSTR" : "Flubaroo creerà un singolo documento Google che conterrà i risultati di tutti gli studenti che puoi stampare e distribuire. \
                                        Puoi specificare un messaggio specifico da includere in ogni documento, così come decidere di includere una lista di domande e/o delle risposte corrette.",
      
        // Title for the "Share Grades" window.
        "FLB_STR_SHARE_GRADES_WINDOW_TITLE" : "Flubaroo - Invia risultati",
      
        // Instructions for the "Share Grades" window.
        "FLB_STR_SHARE_GRADES_INSTR" : "Flubaroo può inviare a ciascun studente i risultati via mail, Google Drive, o entrambi. Utilizza il menù a tendina per selezionare la domanda contenente il loro indirizzo email. Se gli indirizzi email non sono stati richiesti, non sarai in grado di spedire i voti.",
      
        // Success message shown after grades have been printed. Followed by a link to the printable document.
        "FBL_STR_PRINT_GRADES_SUCCESS" : "È stato creato un documento Google contenente tutti i risultati degli studenti. Clicca sul file qui sotto per aprirlo, quindi stampalo e consegna a ciascuno studente la sua stampa.",
      
        // Text that begins the name of the Google Document containing the printable grades. Example: "Printable grades for: Exam #2"
        "FBL_STR_PRINT_GRADES_TITLE_PRE": "Risultati stampabili per:",
      
        // Menu option to share grades.
        "FLB_STR_MENU_SHARE_GRADES" : "Invia i risultati",
      
        // Menu option to print grades.
        "FLB_STR_MENU_PRINT_GRADES" : "Stampa i risultati",
      
        // Grading option for "Extra Credit" on questions.
        "FLB_STR_GRADING_OPT_EXTRA_CREDIT": "Credito extra",
     
         // Text for Advanced Options, describing option to allow extra credit.      
        "FLB_STR_ADV_OPTIONS_EXTRA_CREDIT" : "Permetti credito extra quando si assegnano punti alle domande",
      
        // Text for Advanced Options, asking if user wants to show some additional options in the pull-down menu in Step 1 of grading.
        "FLB_STR_ADV_OPTIONS_ADDITIONAL_GOPTS" : "Mostra opzioni aggiuntive per il passo 1 della valutazione",
      
        // Notice for Grades sheet (shown at top) if Autograde is enabled. Tells the user that grading isn't only considering a student's most recent submission.
        "FLB_STR_AUTOGRADE_NOT_SUMMARIZED" : "A CAUSA DELLE TUE IMPOSTAZIONI PER LA VALUTAZIONE AUTOMATICA QUESTO FOGLIO POTREBBE CONTENERE PIÙ DI UNA VALUTAZIONE PER STUDENTE",
      
        // Text for Advanced Options, letting user decide if they want Autograde to grade only a student's most recent submission (if checked).
        "FLB_STR_ADV_OPTIONS_AG_WITH_SUMMARY" : "La valutazione automatica elaborerà solo l’immissione più recente dello studente (vedi <a target=\"_blank\" href=\"" + FLB_AUTOGRADE_SELECT_MODE_URL + "\">questo articolo</a>)",
      
        // Text for Advanced Options, asking user if when using the "Grade Questions by Hand" tool, if it should auto advance to the next question when
        // a score is set (versus the next student).
        "FLB_STR_ADV_OPTIONS_MGR_ADV_QUESTION" : "Durante la valutazione manuale avanza automaticamente alla domanda successiva (invece che allo studente successivo)",
      
        // Advanced menu option that will expand the special tokens in formulas written by the teacher in the Grades sheet.
        "FLB_STR_MENU_EXPAND_FORMULAS" : "Espandi le formule dell’utente",
       
         // Grading option which ignores a question
        "FLB_STR_GRADING_OPT_IGNORE" : "Ignora",

         // Grading option which copies a column for reference to the Grades sheet
        "FLB_STR_GRADING_OPT_COPY_FOR_REFERENCE" : "Copia per riferimento",
      
        // Message shown in sidebar for Flubaroo update announcements
        "FLB_STR_EMAIL_ME_THIS_ANNOUCNEMENT" : "Mi invia questo annuncio",
      
        "FLB_STR_ADV_OPTIONS_ADDITIONAL_GOPTS": "Mostra opzioni aggiuntive per il passo 1 della valutazione",

        "FLB_STR_AUTOGRADE_NOT_SUMMARIZED": "A CAUSA DELLE TUE IMPOSTAZIONI PER LA VALUTAZIONE AUTOMATICA QUESTO FOGLIO POTREBBE CONTENERE PIÙ DI UNA VALUTAZIONE PER STUDENTE",

        "FLB_STR_ADV_OPTIONS_AG_WITH_SUMMARY": "La valutazione automatica elaborerà solo l’immissione più recente dello studente (vedi <a target=\"_blank\" href=\"" + FLB_AUTOGRADE_SELECT_MODE_URL + "\">questo articolo</a>)",

        "FLB_STR_ADV_OPTIONS_MGR_ADV_QUESTION": "Durante la valutazione manuale avanza automaticamente alla domanda successiva (invece che allo studente successivo)",

        "FLB_STR_MENU_EXPAND_FORMULAS": "Espandi le formule dell’utente",

        "FLB_STR_GRADING_OPT_IGNORE": "Ignora",

        "FLB_STR_GRADING_OPT_COPY_FOR_REFERENCE": "Copia per riferimento",
      
        // Flubaroo Tips, shown when grading completes.
        "FLB_STR_TIP_MSG_NUMBER_1" : "<b>Flubaroo Suggerimento #1:</b> Flubaroo può accettare più di una risposta corretta.",
        "FLB_STR_TIP_MSG_NUMBER_2" : "<b>Flubaroo Suggerimento #2:</b> Flubaroo può valutare intervalli numerici per test scientifici e matematici.",
        "FLB_STR_TIP_MSG_NUMBER_3" : "<b>Flubaroo Suggerimento #3:</b> CANE vs cane? Valuta risposte senza ignorare il maiuscolo.",
        "FLB_STR_TIP_MSG_NUMBER_4" : "<b>Flubaroo Suggerimento #4:</b> Vuoi cambiare il limite soglia del 70%?",
        "FLB_STR_TIP_MSG_NUMBER_5" : "<b>Flubaroo Suggerimento #5:</b> Hai bisogno di controllare la quota email che ti resta?",
        "FLB_STR_TIP_MSG_NUMBER_6" : "<b>Flubaroo Suggerimento #6:</b> Vuoi valutare i test automaticamente?",
        "FLB_STR_TIP_MSG_NUMBER_7" : "<b>Flubaroo Suggerimento #7:</b> Hai domande? Abbiamo risposte nelle nostre FAQ!",
        "FLB_STR_TIP_MSG_NUMBER_8" : "<b>Flubaroo Suggerimento #8:</b> Sei in una scuola che usa Google Apps For Education? Ottieni gli indirizzi email automaticamente!",
        "FLB_STR_TIP_MSG_NUMBER_9" : "<b>Flubaroo Suggerimento #9:</b> Non puoi inviare i risultati via email? Utilizza Google Drive!",
        "FLB_STR_TIP_MSG_NUMBER_10" : "<b>Flubaroo Suggerimento #10:</b> Vuoi una stampa dei risultati dei tuoi studenti? Impara come farla!",
      
    },
    // END ITALIAN   //////////////////////////////////////////////////////////////////////////////////
  
  
} // end langs

////////////////////////////////////////////////////////////////////////////////////////////////////////////

