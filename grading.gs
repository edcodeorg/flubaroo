// File: grading.gs
// Description:
// This file contains all the general purpose functions for grading the assignment.

// TODO_AJR - Add headers to each file.

// TODO_AJR - Percentage in submissions not coloured on just one submissions.

// TODO_AJR - Few functions at the bottom that could do with moving.

// TODO_AJR - Create and agree on FlubarooStyle guide.

// TODO_AJR - Does menuGradeStep1() need to be seperate?

// TODO_AJR - Notification msgBoxes are half empty.

// TODO_AJR - Unit tests (QUint).

// TODO_AJR - The online editor assumes standard indentation, could we use it to?

// TODO_AJR - Double grade sheets on regrade - only if skipping ui.

// TODO_AJR - Search for each Debug.info() function opener, to make sure first thing.

// TODO_AJR - With the clearing of "gathering options", it could be worth
// checking/initialising all of the script properties.

// TODO_AJR - Emailing creates two gws objects, couldn't the earlier one be used for
// emailing.

// TODO_AJR - Go a search for Debug.info() and check spacing.

// TODO_AJR - Incorporating autograde has made made managing the grading a bit
// complicated. The main submission processing loop could be moved higher up
// so they are always processed one at a time.

// TODO_AJR - There is alot of dead code that could be removed.

// The comment below changes the permissions that Flubaroo must ask for when
// installed, limiting it from accessing all their spreadsheets to just the
// spreadsheets where this Add-on is installed (which is more accurate).

// autograded_gws_g: global used for passing the existing gws object from
// grading to emailing when autograde is enabled.
autograded_gws_g = null;

function preGradeChecks(enough_subm_source)
{
  // Rename "Sheet1" (or equivalent) to something more friendly.
  var status = renameSubmissionsSheet();

  // Check for submission sheet
  // ----------------------
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetWithSubmissions(ss);

  if (!sheet)
    {
      UI.msgBox(langstr("FLB_STR_NOTIFICATION"),
                langstr("FLB_STR_CANNOT_FIND_SUBM_MSG") +
                langstr("FLB_STR_SHEETNAME_STUD_SUBM"),
                Browser.Buttons.OK);

      Debug.warning("preGradeChecks - cannot find submission sheet");
      return false;
    }

  // Check if enough submissions to grade
  var enough_subm = enoughSubmToGrade(sheet, enough_subm_source);

  if (!enough_subm)
    {
      UI.msgBox(langstr("FLB_STR_NOTIFICATION"),
                langstr("FBL_STR_GRADE_NOT_ENOUGH_SUBMISSIONS"),
                Browser.Buttons.OK);

      Debug.warning("preGradeChecks - not enough submissions");

      return false;
    }

  return true;
}

function gradeStep1(enough_subm_source)
{
  Debug.info("gradeStep1()");

  var wait_app;
  var ss;
  var sheet;
  var num_rows;
  var help_tips_row;
  var result;
  var app;
  var status = STATUS_OK;

  // Initialize grading
  // ------------------

  // Before doing anything related to grading, take care of some
  // housekeeping that can't be done in onInstall (unfortuntately)
  // because it involves setting properties, which isn't allowed there.

  // Used for anonymous analytics.
  setFlubarooUid();

  if (!preGradeChecks(enough_subm_source))
    {
      return STATUS_CANNOT_CONTINUE;
    }

  // Added 8/21/2015 to help with debugging intermittent issue affecting many users.
  // Should leave here no more than 2-3 weeks, then replace for equal amount of time with
  // Debug.deleteHiddenFieldLog() (to be written), and then remove entirely.
  Debug.createHiddenFieldLog();

  // Check submission sheet
  // ----------------------

  ss = SpreadsheetApp.getActiveSpreadsheet();
  sheet = getSheetWithSubmissions(ss);

  // In case the menu is being accessed from a different sheet, make the sheet
  // with the submissions the active one.
  ss.setActiveSheet(sheet);

  // If there are already grades, make sure the instructor knows that
  // re-grading will overwrite them, unless the UI is off.
  if (gotSheetWithGrades(ss) && UI.isOn())
    {
      result = UI.msgBox(langstr("FLB_STR_NOTIFICATION"),
                         langstr("FLB_STR_REPLACE_GRADES_PROMPT"),
                         Browser.Buttons.YES_NO);

      if (result !== "yes")
        {
          Debug.info("gradeStep1() - instructor choose not to " +
                     "overwrite grades sheet");
          return STATUS_NO_EFFECT;
        }
      else
        {
          Debug.info("gradeStep1() - instructor choose to " +
                     "overwrite grades sheet");
        }
    }

  // Start the grading
  // -----------------
  if (UI.isOff())
    {
      if (gotGradingInfo())
        {
          Debug.info("gradeStep1() - skipping UI, going straight " +
                      "to step2EventHandler()");

          status = gradingStep2SubmitHandler(null);
        }
      else
        {
          Debug.error("gradeStep1() - missing grading info, unable to skip UI");
        }
    }
  else
    {
      // Create and display the Step 1 UI window.
      Debug.info("about to show step1 grading UI...");
      UI.showStep1Grading(sheet);
      Debug.info("UI displayed");
    }

  return status;

} // gradeStep1()


// gradingStep1SubmitHandler()
// -------------------
//
// Event handler for step 1 of the grading UI.
function gradingStep1SubmitHandler(grading_opts)
{
  // record the grading options selected in step 1.
  var dp = PropertiesService.getDocumentProperties();
  dp.setProperty(DOC_PROP_UI_GRADING_OPT, grading_opts.toString());

  // from these grading options, construct a Step 2 UI to
  // allow user to select answer key row.
  return UI.showStep2Grading();
}

// gradingStep2SubmitHandler()
// -------------------
//
// Event handler for step 2 of the grading UI.
function gradingStep2SubmitHandler(ak_subm_row)
{
  Debug.info("gradingStep2SubmitHandler()");

  var dp = PropertiesService.getDocumentProperties();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetWithSubmissions(ss);
  var app;
  var gws_graded = null;
  var gws;
  var subm_read_index;
  var repeat_subm;
  var just_write_latest_subm;
  var status = STATUS_OK;

  Debug.info("gradingStep2SubmitHandler() - got event");

  if (UI.isOn())
    {
      // Store the answer key row that was passed in the event.
      dp.setProperty(DOC_PROP_ANSWER_KEY_ROW_NUM, ak_subm_row.toString());

      // We might be here to collect grading options for autograde. If so, we need to
      // move on to collecting email options. Not typical.
      if (Autograde.isGatheringOptions())
        {
          Debug.info("gradingStep2SubmitHandler() - gathering autograde info");

          app = UI.emailGrades(ss, false);
          ss.show(app);
          return STATUS_OK;
        }

      // Give the instructor some notice that we're
      // grading their assignment.
      app = UI.pleaseWait(sheet,
                          langstr("FLB_STR_GRADING_WINDOW_TITLE"),
                          langstr("FLB_STR_WAIT_INSTR2"));
      ss.show(app);
    }

  Debug.info("invalidate grades sheet on update: " + invalidateGradesOnUpdate());

  // If user selected an option of "Grade by Hand" for one or more questions,
  // ensure that all of those questions have unique question text. If not, inform
  // the user that grading cannot continue, and quit.
  if (!checkUniqueManuallyGradedQuestions(sheet))
    {
      Debug.info("gradingStep2SubmitHandler() - cannot continue as some questions are identical");
      UI.msgBox(langstr("FLB_STR_NOTIFCATION"),
                langstr("FBL_STR_GRADE_NON_UNIQUE_QUESTIONS"),
                Browser.Buttons.OK);
      return STATUS_CANNOT_CONTINUE;
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
      UI.showMessageBox(langstr("FLB_STR_INVALID_GRADE_SHEET_TITLE"), langstr("FLB_STR_INVALID_GRADES_SHEET"));

      if (Autograde.isOn())
        {
          // Email this warning to the user if Autograde is running and somehow the Grades sheet got corrupted.
          // Also turn off Autograde. Better to have it off than to have it running and failing on a corrupted sheet.
          notifyOwnerOfCorruptedGradesSheet();
          Autograde.off();
        }

      return STATUS_CANNOT_CONTINUE;
    }
  else if (grades_sheet && grades_sheet_is_valid && !invalidateGradesOnUpdate())
    {
      // Read in a copy of the grades sheet.
      // We need to do this so we can retain the values of
      // "Already Emailed" when generating a new Grades
      // sheet, as well as the values in the "Student
      // Feedback" columns.
      Debug.info("gradingStep2SubmitHandler() - collecting info on " +
                "grades already emailed and student feedback");

      gws_graded = new GradesWorksheet(ss, INIT_TYPE_GRADED_PARTIAL);
    }

  // Create a new gws object from the submissions sheet.
  gws = new GradesWorksheet(ss, INIT_TYPE_SUBM);

  // Write the submissions to the new grades sheet. Whether we're
  // just writing the last submission or all of them depends on
  // whether autograde is enabled and whether there has been a submission
  // from this student before.

  // TODO_AJR - Rather than re-write all the submissions in the grades sheet
  // when we have a repeat, it would be possible to just replace the one.
  // This could also be applied to manual re-grading, although there could be
  // advantages to re-creating the whole grade sheet, although this can
  // easily be done by deleting it and refreshing.

  // TODO_DAA: Explore the use of just_write_latest_subm (from AJR) in
  // main Flubaroo code to speed up Autograde. Turning off for now due to
  // concerns about a bug, and also b/c it makes for an inconsistent
  // experience in the Grades sheet (headers not updated, etc).

  /* just_write_latest_subm = Autograde.isOn() && !gbl_repeat_subm; */
  just_write_latest_subm = false; // for now, until I can spend more time investigating this - DAA

  // Finished with this now.
  gbl_repeat_subm = false;

  status = gws.writeGradesSheet(gws_graded, just_write_latest_subm);

  if (Autograde.isOn())
    {
      // Save a reference to this gws variable, so we can use it in emailing just after this.
      autograded_gws_g = gws;
    }

  if (status == STATUS_CANNOT_CONTINUE)
    {
      // Unable to write Grades sheet. Should be a rare occurence.
      // Delete the new (empty) Grades sheet that was just created.
      Debug.error("gradingStep2SubmitHandler() - Unable to write new Grades sheet!");
      grades_sheet = getSheetWithGrades(ss);
      ss.deleteSheet(grades_sheet);
    }
  else
    {
      Debug.info("gradingStep2SubmitHandler() - grades sheet written");
    }

  // Regenerate the menu, so it's consistent with any UI changes
  // that took place during grading (i.e. rehiding of student feedback).
  createFlubarooMenu();

  // With first grading complete, take note of the current
  // version this user has installed in this sheet. can't do
  // this in onOpen or onInstall.
  setCurrentVersionInfo();

  if (UI.isOn())
  {
    // Close the waiting UI.
    app.close();

    if (status == STATUS_OK)
      {
        // Display grading complete.
        var html = UI.createGradingResults();
        SpreadsheetApp.getUi()
                      .showModalDialog(html, langstr("FLB_STR_GRADING_COMPLETE_TITLE"));
      }
    else
      {
        UI.showMessageBox(langstr("FLB_STR_NOTIFICATION"), langstr("FLB_STR_NO_VALID_SUBMISSIONS"));
      }
  }

  Debug.info("gradingStep2SubmitHandler() - returning");

  Debug.writeToFieldLogSheet();

  //return app;
  return status;

} // gradingStep2SubmitHandler()

function checkUniqueManuallyGradedQuestions(sheet)
{
  var dp = PropertiesService.getDocumentProperties();
  var ques_vals = getQuestionValsFromSubmissions(sheet);

  var grade_opt_str = dp.getProperty(DOC_PROP_UI_GRADING_OPT);
  var grading_options = grade_opt_str.split(",");

  var unique_check = new Object();
  for (var i=0; i < grading_options.length; i++)
    {
      var gopt = grading_options[i];

      if (!isManuallyGraded(gopt))
        {
          continue;
        }

      // for manually graded questions, ensure they have unique text from one another.
      var full_ques_text = ques_vals[i];

      if (unique_check.hasOwnProperty(full_ques_text))
        {
          return false;
        }
      else
        {
          unique_check[full_ques_text] = 1;
        }
    }

  return true;
}

 // createQuestionSummary
 // Returns the text of the question from the header row for the question.
 //  If too long, truncates the question text and adds "...".
 function createQuestionSummary(question)
 {
   if (question.length > 40)
     {
       // truncate the question and add "..." to the end.
       question = question.substring(0,40) + " ...";
     }

   return question;
 }

 // quesShouldBeSkipped:
 // Takes the full text of a question (should be lowercased first),
 // and returns if this question should not be graded (e.g. "Today's Date:")
 function quesShouldBeSkipped(ques)
 {
   if (ques.indexOf('date') != -1)
     {
       return true;
     }

   return false;
 }

 // quesIdentifiesStudent:
 // Takes the full text of a question (should be lowercased first),
 // and examines the content to guess if this question is a means of
 // identifying a student (e.g. "First Name")
 function quesIdentifiesStudent(ques)
 {
   if (ques.indexOf('first') != -1)
     {
       return true;
     }
   else if (ques.indexOf('last') != -1)
     {
       return true;
     }
   else if (ques.indexOf('name') != -1)
     {
       return true;
     }

   else if (ques == 'id')
     {
       return true;
     }

   var id_index = ques.indexOf('id');
   if (id_index != -1)
     {
       if (id_index > 0)
         {
           if (ques[id_index-1] == ' ')
             {
               // e.g. "student id"
               return true;
             }
         }
     }
   else if (ques.indexOf('id:') != -1)
     {
       // e.g. student id:
       return true;
     }
   else if (ques.indexOf('identity') != -1)
     {
       return true;
     }
   else if (ques.indexOf('identifier') != -1)
     {
       return true;
     }
   else if (ques.indexOf('class') != -1)
     {
       return true;
     }
   else if (ques.indexOf('section') != -1)
     {
       return true;
     }
   else if (ques.indexOf('period') != -1)
     {
       return true;
     }
   else if (ques.indexOf('room') != -1)
     {
       return true;
     }
   else if (ques.indexOf('student') != -1)
     {
       return true;
     }
   else if (ques.indexOf('teacher') != -1)
     {
       return true;
     }
   else if (ques.indexOf('email') != -1)
     {
       return true;
     }
   else if (ques.indexOf('e-mail') != -1)
     {
       return true;
     }

   // spanish
   else if (ques.indexOf('correo') != -1)
     {
       return true;
     }

   return false;
 }

// isWorthPoints:
// Given a grading option, returns true if the grading option indicates
// that this question is worth points, and so can be graded. Returns
// false otherwise.
function isWorthPoints(grade_opt)
{
  // questions worth points will be of the form: "Manual Grading|5 Points" or "Normal Grading|1"
  var gopt_pair = grade_opt.split("|");

  if (gopt_pair.length < 2)
    {
      return false;
    }

  return true;
}

// getPointsWorth:
// Given a grading option that indicates a number of points (e.g. "Manual Grading|5 Points")
// returns a corresponding integer for the number of points it's worth
// (5, in this example).
function getPointsWorth(grade_opt)
{
  var gopt_pair = grade_opt.split("|");

  if (gopt_pair.length < 2)
    {
      // invalid input
      return 0;
    }

  var pt = gopt_pair[1];

  return Number(pt);
}

// isBonusQuestion:
// Given a grading option, returns true if the grading option indicates
// that this question is worth bonus points.
function isBonusQuestion(grade_opt)
{
  if (grade_opt.indexOf(GRADING_OPT_EXTRA_CREDIT) != -1)
    {
      return true;
    }

  return false;
}

// isStudentIdentifier:
// Returns true if grading option for this question is one that identifies a student
function isStudentIdentifier(grade_opt)
{
  return (grade_opt === GRADING_OPT_STUD_ID);
}

// isManuallyGraded:
// Returns true if the grading option for this question identifies a question that's manually graded.
function isManuallyGraded(grade_opt)
{
  return (grade_opt.split("|")[0]).indexOf(GRADING_OPT_MANUAL) != -1;
}

// isNormallyGraded:
// Returns true if the grading option for this question identifies a question that's graded normally (not manually).
function isNormallyGraded(grade_opt)
{
  return (grade_opt.split("|")[0]).indexOf(GRADING_OPT_NORMAL) != -1;
}

function gotGradingInfo()
{
  var dp = PropertiesService.getDocumentProperties();

  // These script properties need to be set up before the
  // grading process can begin.

  Debug.info("gotGradingInfo() - ui grading opt: " +
             dp.getProperty(DOC_PROP_UI_GRADING_OPT));

  Debug.info("gotGradingInfo() - ans key row num: " +
             dp.getProperty(DOC_PROP_ANSWER_KEY_ROW_NUM));

  if (dp.getProperty(DOC_PROP_UI_GRADING_OPT) &&
      dp.getProperty(DOC_PROP_ANSWER_KEY_ROW_NUM))
    {
      return true;
    }

  return false;

} // gotGradingInfo()

function gotGradingAndEmailInfo()
{
  var dp = PropertiesService.getDocumentProperties();

  // These script properties need to be set up before the
  // grading process can begin.

  Debug.info("gotGradingAndEmailInfo() - email address question: " +
             dp.getProperty(DOC_PROP_EMAIL_ADDRESS_QUESTION));

  if (gotGradingInfo() &&
      dp.getProperty(DOC_PROP_EMAIL_ADDRESS_QUESTION))
    {
      return true;
    }

  return false;

} // gotGradingAndEmailInfo()


function enoughSubmToGrade(subm_sheet, enough_subm_source)
{
  var dp = PropertiesService.getDocumentProperties();

  // Make sure there are enough rows in this sheet to do grading.
  var num_rows = subm_sheet.getLastRow();
  var help_tips_row = getTipsRow(subm_sheet);

  var enough_subm = true;

  // we must ensure there is an answer key row, which is not
  // to be confused with an optional Help Tips row.
  if ((num_rows == 0) || (num_rows == 1) || ((num_rows == 2) && (help_tips_row != null)))
    {
      // either only one row (header only), or ...
      // only 2 rows, and one of them is help tips (other is header).
      //    either way ==> no answer key!
      return false;
    }

  // at this point we're guaranteed there is answer key row.
  // if only setting up autograde, then we can return true.
  if (enough_subm_source == ENOUGH_SUBM_SOURCE_USER_AG_SETUP_OPTIONS)
    {
      return true;
    }

  // from here on out we need there to be at least one true submission (besides the AK)
  var min_rows_needed = 3; // for manual grading: header, ans key, & one submission.
  if (help_tips_row != null)
    {
      // account for the help tips row, if there.
      min_rows_needed += 1;
    }

  if (num_rows >= min_rows_needed)
    {
      return true;
    }

  return false;
}
