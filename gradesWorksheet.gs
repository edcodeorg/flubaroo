// File: graded_worksheet.gas
// Description: 
// This file contains the class to hold the grades worksheet.

// TODO_AJR - Try and get all of the type decisions on the same level. Things like 
// gws type and autogradeon.

// TODO_AJR - Get all of the ScriptProperties into an object to speed things up.
// Check how often they're called.

// TODO_AJR - Look for gws processing done during INIT_TYPE_GRADED_ that might 
// be used.

// TODO_AJR - Questions and percentages not coloured yellow first grading.

// TODO_AJR - Nested functions are acheiving the data hiding, but I'm not
// sure if it's "class" JS or not. Google for "nested class javascript"

// TODO_AJR_BUG - in original code in processGradesSheet() use of question_vals
// as gws property (worked somehow). Fixed but needs passing to DaveA. Showed up 
// when I ran sendEmails with no Grades sheet - should assert on that.

// TODO_AJR_BUG - No frozen row in grades sheet first time graded.

// TODO_AJR - Test for answer key not at row 2 in subm sheet.

// A global flag used to communicate between the submission processing
// and the later stages of the grading that the present submission
// is from a student that has already submitted one. This works as the 
// autograding in a single execution context.
gbl_repeat_subm = false;

// gbl_invalid_grades_sheet_error: Stores a string that describes the issue
// with the grades sheet that gwsGradesSheetIsValid determined makes it invalidl
gbl_invalid_grades_sheet_error = "";

// GradesWorksheet class:
// The GradesWorksheet class represents the "Grades" worksheet that will record
// all of the grades. This object obfuscates how that information is written out
// and accessed, making it easier to work with the data in that sheet (both
// during grading, and afterwards). There is only ever a single instance of this 
// object.
// Constructor takes as arguments:
//    spreadsheet: Reference to the entire spreadsheet
//    init_type: Specifies how GradesWorksheet is being initialized:
//               - INIT_TYPE_SUBM: Init from the Student Submissions sheet, during grading.
//               - INIT_TYPE_GRADED_*: Init from the 'Grades' sheet, such as when emailing grades
//    num_graded_submissions_to_read: Only used for INIT_TYPE_GRADED_ONLY_LATEST. Otherwise pass -1.
//                                    Specifies how many graded submissions to read in (from the bottom).
function GradesWorksheet(spreadsheet, init_type, num_graded_submissions_to_read)
{
  this.initGWSVars(spreadsheet, init_type, num_graded_submissions_to_read);
  
  if (init_type == INIT_TYPE_SUBM)
    {
      Debug.info("GradesWorksheet: INIT_TYPE_SUBM");
      this.prepNewGradesSheet(); // possibly remove depending on how autograde progresses.
      
      this.processSubmissionsSheet();
    }
  else if (init_type == INIT_TYPE_SUBM_ONLY_LATEST)
    {
      Debug.info("GradesWorksheet: INIT_TYPE_SUBM_ONLY_LATEST. num_graded_submissions_to_read = " + num_graded_submissions_to_read);      
      this.processSubmissionsSheet();
    }
  else // INIT_TYPE_GRADED_*
    {
      Debug.info("GradesWorksheet: INIT_TYPE_GRADED*");
      if (this.grades_sheet && (this.grades_sheet.getLastRow() > 2))
	    {
	      this.processGradesSheet();
	    }
    }
  
  Debug.writeToFieldLogSheet();
}

GradesWorksheet.prototype.initGWSVars = function(spreadsheet, init_type, num_graded_submissions_to_read)
{
  Debug.info("initGWSVars: entering. init_type=" + init_type);
  this.init_type = init_type;
  this.num_graded_submissions_to_read = num_graded_submissions_to_read;
  
  this.spreadsheet = spreadsheet;
  this.submissions_sheet = getSheetWithSubmissions(this.spreadsheet); 
  this.grades_sheet = getSheetWithGrades(this.spreadsheet);
  
  // TODO_AJR - Better to use an object rather than an associative array.
  
  // Associative array of all graded submissions in the grades sheet.
  // indexed by fingerprint.
  this.graded_submissions = new Array();
  
  // A read-only list of all fingerprints stored in 
  // this.graded_submissions.
  this.fingerprint_list = null;
  this.fingerprint_list_iterator = 0;

  // A subset of this.fingerprint_list, containing only fingerprints of
  // submissions that won't / don't have an 'x' in the "Already Emailed?"
  // column in the Grades sheet.
  this.not_already_emailed_fingerprints = new Object();
  
  this.points_possible = 0;
  
  this.num_student_identifiers = 0;
  this.num_gradeable_questions = 0;
  
  this.has_manually_graded_question = false;
  
  this.question_hash = null;
  
  var dp = PropertiesService.getDocumentProperties();  
  this.answer_key_row_num = Number(dp.getProperty(DOC_PROP_ANSWER_KEY_ROW_NUM));
  
  // data pulled from the summary at the top of the Grades sheet.
  this.avg_subm_score = 0;
  this.num_low = 0; 
  
  // 'true' if one of the answer key values is actually a '%=' formula.
  this.has_formula_anskey = false;
  
  Debug.info("initGWSVars: leaving");
}

GradesWorksheet.prototype.getPointsPossible = function()
{
  return this.points_possible;
}

GradesWorksheet.prototype.getAverageScore = function()
{
  return this.avg_subm_score;
}

GradesWorksheet.prototype.getNumStudentIdentifiers= function()
{
  return this.num_student_identifiers;
}

// getNumGradedSubmissions:
// Returns the number of graded submissions in the Grades worksheet.
// Note that this is the total number in the sheet itself, and not
// the number actually graded in the gws object (which could be less if
// we're using Autograde and grading just the most recent submissions).
//
// TODO_AJR - Would be nice to just be switching on init_type
// rather than assuming the fp has been set up, which it is when the 
// submission sheet is processed.

GradesWorksheet.prototype.getNumGradedSubmissions = function()
{
  var num;
  var use_fp_list = false;
  
  if (this.fingerprint_list != null && (this.fingerprint_list.length > 0)
      && this.init_type != INIT_TYPE_SUBM_ONLY_LATEST)
    {
      // fp list is populated with all the (unique) submissions.
      use_fp_list = true;
    }

  if (use_fp_list)
    {      
      // Whenever possible use the total number of unique 
      // fingerprints.      
      num = this.fingerprint_list.length;
    }
  else
    {
      // TODO DAA: replace this wrapper class with direct set/get of the Script Property.
      num = NumGradedSubm.get();
    }

  return num;
}

// getNumGradedSubmissions:
// For use with Autograde when grading only most recent submissions (vs whole
// Student Submissions sheet). Returns just the number of submissions that
// were most recently graded (vs total # in the Grades sheet).
GradesWorksheet.prototype.getNumRecentGradedSubmissions = function()
{
  if (this.fingerprint_list != null && (this.fingerprint_list.length > 0))
    {
      return this.fingerprint_list.length;
    }
  
  return 0;
}

// addGradedSubmission: Adds a new graded submission. If already exists (same fingerprint), replaces
// the existing one.
GradesWorksheet.prototype.addGradedSubmission = function(fingerprint, gs)
{
  this.graded_submissions[fingerprint] = gs; 
}

GradesWorksheet.prototype.checkForGradedSubmission = function(fingerprint)
{
  return (fingerprint in this.graded_submissions) ? true : false;
}

GradesWorksheet.prototype.countGradedSubmissions = function()
{
  var counted_subm_in_gws = Object.keys(this.graded_submissions).length;
  Debug.info("countGradedSubmissions() - counted_subm_in_gws: " + counted_subm_in_gws);
  
  return counted_subm_in_gws;
}

GradesWorksheet.prototype.getGradedSubmissionByFingerprint = function(fingerprint)
{
  if (fingerprint in this.graded_submissions)
    {    
      return this.graded_submissions[fingerprint];
    }
  else
    {
      return null;
    }
}

// getFirstGradedSubmission:
// To make sure we write only the final grades (e.g. counting multiple 
// submissions) we walk through the array of unique student 
// fingerprints.
GradesWorksheet.prototype.getFirstGradedSubmission = function()
{
  // Put each of the graded submissions into the fingerprint array.
  
  this.fingerprint_list = new Array();
  this.fingerprint_list_iterator = 0;
  
  for (var key in this.graded_submissions)
    {
      this.fingerprint_list.push(key);
    } 

  Debug.info("GradesWorksheet.getFirstGradedSubmission() - Initialised fp list"); 

  Debug.info("GradesWorksheet.getFirstGradedSubmission() - fp list length: " + 
             this.fingerprint_list.length);

  // Return the first submission in the array (extract the first entry 
  // from the array of fingerprints and use this as the key in the 
  // associative array of graded submissions).
  return this.graded_submissions[this.fingerprint_list[0]];
}
  
GradesWorksheet.prototype.getNextGradedSubmission = function()
{
  this.fingerprint_list_iterator++;
  
  if (this.fingerprint_list_iterator < this.fingerprint_list.length)
    {
      return this.graded_submissions[this.fingerprint_list[this.fingerprint_list_iterator]];
    }
  else
   {
     return null;
   }
}  

GradesWorksheet.prototype.addNotAlreadyEmailedFingerprint = function(fingerprint)
{
  this.not_already_emailed_fingerprints[fingerprint] = 1;
}

GradesWorksheet.prototype.getNotAlreadyEmailedFingerprintsList = function()
{
  var fingerprints_array = [];
  
  for (var fp in this.not_already_emailed_fingerprints)
    {
      if (this.not_already_emailed_fingerprints.hasOwnProperty(fp))
        {
          fingerprints_array.push(fp);
        }
    }
  
  return fingerprints_array;
}

// processSubmissionsSheet:
// Performs the grading of all rows compared to the answer key. 
GradesWorksheet.prototype.processSubmissionsSheet = function()
{
  var dp = PropertiesService.getDocumentProperties();
  
  var func_name = "GradesWorksheet.processSubmissionsSheet() - ";

  Debug.info(func_name + "entering");
  
  var grade_opt_str = dp.getProperty(DOC_PROP_UI_GRADING_OPT);
  
  var category_names_str = dp.getProperty(DOC_PROP_UI_CATEGORY_NAMES);
  
  Debug.info(func_name + "grade_opt_str:" + grade_opt_str);
  
  Debug.assert(grade_opt_str !== null, func_name + "grading options not set");
  
  this.grading_options = grade_opt_str.split(",");
  
  if (category_names_str)
    {
      this.category_names = category_names_str.split(FLB_GENERIC_DELIMETER);
    }
  else
    {
      this.category_names = [];
    }

  // Get the questions
  // -----------------
  
  // Read in the questions asked from the first row and mark the first 
  // value as the timestamp.
  
  var question_vals = getQuestionValsFromSubmissions(this.submissions_sheet);
    
  // TODO: We only use the question_hash for manually graded questions, so 
  // perhaps only store the questions for questions with that grading option.
  // Requires some good testing, which I don't have time for now. DA 7/22/15.
  // question_hash: stores at what location each question resides.
  this.question_hash = new Object();
  for (var i=0; i < question_vals.length; i++)
    {
      var full_ques_text = question_vals[i];
      this.question_hash[full_ques_text] = i;
    }
  
  Debug.info(func_name + "got question vals from submissions sheet");
  
  // Read in the grading options.
    
  this.processGradingOptions();
  
  // Get the answer key values
  // -------------------------
  
  // Collect the answers from the Answer Key row. Make all lowercase so we're
  // case insentive when comparing to text submissions.
  
  Debug.info(func_name + "getting answer key values...");
  
  var answer_key_vals;
  
  if (!Autograde.isOn())
    {
      // Read in the answer key values from the row specified by the user.
      // the user will have just specified this row number a moment ago when choosing
      // grading options (Step 2).
      Debug.info(func_name + "reading answer key row from submissions sheet...");
      answer_key_vals = singleRowToArray(this.submissions_sheet,
                                         this.answer_key_row_num,
                                         getNumQuestionsFromSubmissions(this.submissions_sheet),
                                         false);
    }
  else
    {
      // For autograde, we take the answer key values that were stored when Autograde
      // was setup. This is to handle the case when the answer key row may actually shift
      // to another row due to the way google form submits work sometimes.
      Debug.info(func_name + "autograde on, so reading answer key row from document property...");
      answer_key_vals = getAutogradeAnswerKeyValues(this.submissions_sheet, this.answer_key_row_num);
    }
  
  // Create a copy of the answer key array, not a reference to it.
  var answer_key_vals_lc = answer_key_vals.slice(0);  
  
  for (var i = 0; i < answer_key_vals_lc.length; i++)
    {
      if (typeof answer_key_vals_lc[i] == 'string')
        {
          answer_key_vals_lc[i] = strTrim(answer_key_vals_lc[i].toLowerCase());
        }
    }
  
  this.has_formula_anskey = gwsAnswerKeyHasFormula(answer_key_vals);
    
  // TODO_AJR - If, reading in the answer key values, one isn't a string is that
  // a problem?

  // Get the help tips
  // -----------------
  // Collect the help tips if any are present. These will always be in the second
  // row of the form (case insensitive when comparing to text submissions).
  var help_tips_vals = getTipsRow(this.submissions_sheet);  
  var help_tips_present = (help_tips_vals !== null) ? true : false;
  Debug.info(func_name + "help_tips_present: " + help_tips_present);
  
  // Get the student's submissions
  // -----------------------------
  //
  // Convert the row data from the submissions sheet into a 'graded submission' object
  // and link it to the preset 'graded worksheet' object in the 'fingerprint' array.
  
  var start_subm_row = 2; // one past header row
  var numb_rows = this.submissions_sheet.getLastRow();
  
  // only process latest submitted rows?
  if (this.init_type == INIT_TYPE_SUBM_ONLY_LATEST)
    {
      var last_processed_subm_row = dp.getProperty(DOC_PROP_LAST_GRADED_ROW_COUNT);
      if (last_processed_subm_row != null)
        {
          start_subm_row = Number(last_processed_subm_row) + 1;
        }
    }

  Debug.info(func_name + " - will start processing submissions at row: " + start_subm_row);
  
  // record how many rows we're about to grade. used by autograde logic.
  dp.setProperty(DOC_PROP_LAST_GRADED_ROW_COUNT, numb_rows);
  
  // Skip over the first row with questions in (row_num = 2).
  for (var subm_row_num = start_subm_row; subm_row_num <= numb_rows; subm_row_num++)
    {
      Debug.info(func_name + "processing row: " + subm_row_num);
      
      if (subm_row_num === this.answer_key_row_num)
        {
          // No need to include the answer key in the 
          // grades so skip it.
          Debug.info(func_name + "skip answer key");
          continue;
        }
      
      if (subm_row_num === 2 && help_tips_present)
        {
          // Skip over the help tips in the second row.
          Debug.info(func_name + "skip help tips");
          continue;
        }

      // Create a new GradedSubmission from this submission.
      var new_graded_subm = new GradedSubmission(this, 
                                                 this.submissions_sheet, 
                                                 this.grades_sheet,
                                                 question_vals, 
                                                 help_tips_present, 
                                                 help_tips_vals,
                                                 this.grading_options, 
                                                 this.category_names,
                                                 this.points_possible,
                                                 answer_key_vals, 
                                                 answer_key_vals_lc, 
                                                 this.num_student_identifiers,
                                                 this.num_gradeable_questions,
                                                 subm_row_num,
                                                 null, // grades sheet row (written to) will be set later
                                                 INIT_TYPE_SUBM);

      // Create a fingerprint to uniquely identify this student and
      // then check if we have already seen a submission from them in this
      // spreadsheet (the graded submissions are stored in an associative 
      // array in the graded worksheet object, where a unique "fingerprint" 
      // for each student is used as the key).
      
      var fingerprint = new_graded_subm.getSubmFingerprint();
 
      if (fingerprint == "")
        {
          Debug.info("processSubmissionsSheet() - blank fingerprint. skipping this submission.");
          continue;
        }
      
      var existing_graded_subm = this.getGradedSubmissionByFingerprint(fingerprint);

      if (existing_graded_subm != null)
        {
          // This is a second (or third, ...) submission from a student.
          // If this submission is newer than the last one seen, replace it.
          var existing_timestamp = new Date(existing_graded_subm.getTimestamp());
          var new_timestamp = new Date(new_graded_subm.getTimestamp());
          var existing_times_submitted = existing_graded_subm.getTimesSubmitted();

          if (new_timestamp > existing_timestamp)
            {
              // record how many times until now this particular student submitted.
              new_graded_subm.setTimesSubmitted(existing_times_submitted);
              this.addGradedSubmission(fingerprint, new_graded_subm);
            }
   
          // whether we replaced an entry or not, we still want to increment
          // the number of submissions.
          existing_graded_subm = this.getGradedSubmissionByFingerprint(fingerprint);
          existing_graded_subm.setTimesSubmitted(existing_times_submitted + 1);
          this.addGradedSubmission(fingerprint, existing_graded_subm);
        }
      else
        {
          // This is the first time we've seen a submission from this student.
          // There's no need to compare submission timestamp.
          this.addGradedSubmission(fingerprint, new_graded_subm);
        }
    }    
  
  Debug.info(func_name + "leaving");
} // GradesWorksheet.processSubmissionsSheet()

// processGradesSheet:
// Reads in all information in an existing 'Grades' sheet.
GradesWorksheet.prototype.processGradesSheet = function()
{
  Debug.info("GradesWorksheet.processGradesSheet()");
  
  Debug.assert(this.grades_sheet !== null, 
         "GradesWorksheet.processGradesSheet() - " +
           "no grades sheet");

  var numb_graded_submissions = this.getNumGradedSubmissions();
  var dp = PropertiesService.getDocumentProperties();
  
  // 8/21/15: for debugging purposes, log information about number of submissions perceived.
  var single_cell = this.grades_sheet.getRange(GRADES_SUMMARY_COUNTED_SUBM_ROW_NUM, 2, 1, 1);  
  var grades_sheet_num_graded_subm = single_cell.getValue();
  var prop_num_graded_subm = dp.getProperty(DOC_PROP_NUM_GRADED_SUBM);
  Debug.info("num graded subm: " + numb_graded_submissions + "," + prop_num_graded_subm + "," + grades_sheet_num_graded_subm);
   
  // Read in the hidden row containing the grading_options.
  this.grading_options = this.getHiddenRow(GRADES_HIDDEN_ROW_TYPE_GRADING_OPT, 
                                           "",
                                           numb_graded_submissions);
  
  // Read in any category names for the questions (will often be blank if no categories being used)
  if (getSheetWithCategories(this.spreadsheet))
    {
      this.category_names = singleRowToArray(this.grades_sheet, GRADES_CATEGORY_NAMES_ROW_NUM, -1, false);
    }
  else
    {
      this.category_names = [];
    }
  
  Debug.assert(this.grading_options[0] !== "", 
         "GradesWorksheet.processGradesSheet() - Can't find grading options");
  
  // Read in the hidden row containing the questions asked.
  var question_vals = this.getHiddenRow(GRADES_HIDDEN_ROW_TYPE_QUESTIONS_FULL, 
                                        "",
                                        numb_graded_submissions);
 
  // question_hash: stores at what location each question resides.
  // TODO: We only use the question_hash for manually graded questions, so 
  // perhaps only store the questions for questions with that grading option.
  // Requires some good testing, which I don't have time for now. DA 7/22/15.
  this.question_hash = new Object();
  for (var i=0; i < question_vals.length; i++)
    {
      var full_ques_text = question_vals[i];
      this.question_hash[full_ques_text] = i;
    }
  
  // Read through the grading options to initialize variables like:
  //      points_possible, num_student_identifiers, and num_gradeable_questions
  this.processGradingOptions();
 
  // Pull in some info from the summary table at the top.
  var summary_range = this.grades_sheet.getRange(GRADES_SUMMARY_PTS_POSSIBLE_ROW_NUM, 2, gbl_num_summary_rows, 1);
  var summary_col = summary_range.getValues();
  this.avg_subm_score = Number(summary_col[1]);
  this.num_low = Number(summary_col[3]);

  Debug.info("processGradesSheet() - reading answer key row from hidden row in Grades sheet...");
  
  var answer_key_vals = this.getHiddenRow(GRADES_HIDDEN_ROW_TYPE_ANSWER_KEY, 
                                          "", 
                                          numb_graded_submissions);
                                          
  var help_tips_vals = this.getHiddenRow(GRADES_HIDDEN_ROW_TYPE_HELP_TIPS,
                                         "",
                                         numb_graded_submissions);

  this.has_formula_anskey = gwsAnswerKeyHasFormula(answer_key_vals);
  
  // Check if any help tips are present. They will be if there's at least one
  // non-empty cell in this row. otherwise the row will be entirely blank.
  
  var help_tips_present = false;
  var i;
  
  for (i = 0; i < help_tips_vals.length; i++)
    {
      if (help_tips_vals[i] != "")
        {
          help_tips_present = true;
          break;
        }
    }
  
  Debug.info("GradesWorksheet.processGradesSheet() - init_type: " + this.init_type);
  
  var max_submissions_to_read = 0;
  
  // TODO_AJR - add else.
  
  // Read in and process graded submissions in the Grades sheet.
  var write_start_row = gbl_grades_start_row_num + 1;
  
  if (this.init_type == INIT_TYPE_GRADED_META)
    {
      // Just process a single submission so we can use it later to 
      // grab grading options, etc, but without needing to read and 
      // process *all* of the submissions. Used to construct the UI 
      // for emailing grades.
      max_submissions_to_read = 1;
    }
  else if (this.init_type == INIT_TYPE_GRADED_ONLY_LATEST)
    {
      // we want to read only the last few rows that were (just) written.
      // this is for emailing grades when autograde is in use, but a '%=' is in the answer key.
      max_submissions_to_read = this.num_graded_submissions_to_read;
      var last_written_graded_subm_row = gbl_grades_start_row_num + 1 + this.getNumGradedSubmissions() - 1;
      write_start_row = last_written_graded_subm_row - max_submissions_to_read + 1;
      
      Debug.info("GradesWorksheet.processGradesSheet() - init_type == INIT_TYPE_GRADED_ONLY_LATEST.");
      Debug.info("GradesWorksheet.processGradesSheet() - max_submissions_to_read = " + max_submissions_to_read);
      Debug.info("GradesWorksheet.processGradesSheet() - last_written_graded_subm_row = " + last_written_graded_subm_row);
      Debug.info("GradesWorksheet.processGradesSheet() - first row to read in Grades: " + write_start_row);
    }
  else // INIT_TYPE_GRADED_FULL or INIT_TYPE_GRADED_PARTIAL
    {
      // Read in all graded submissions.
      max_submissions_to_read = this.getNumGradedSubmissions();      
    }
  
  Debug.info("GradesWorksheet.processGradesSheet() - max submissions: " + 
              max_submissions_to_read);
               
  for (i = 0; i < max_submissions_to_read; i++)
    {
      
      // Create a new GradedSubmission from this graded submission.
      var new_graded_subm = new GradedSubmission(this, 
                                                 this.submissions_sheet, 
                                                 this.grades_sheet,
                                                 question_vals, 
                                                 help_tips_present, 
                                                 help_tips_vals,
                                                 this.grading_options, 
                                                 this.category_names,
                                                 this.points_possible,
                                                 answer_key_vals, 
                                                 answer_key_vals,
                                                 this.num_student_identifiers,
                                                 this.num_gradeable_questions,
                                                 null, // SS row not known here
                                                 write_start_row + i,                                                 
                                                 this.init_type);
      // Create a fingerprint to uniquely identify this student and store their submission.
      var fingerprint = new_graded_subm.getSubmFingerprint(); 
      this.addGradedSubmission(fingerprint, new_graded_subm);
      if (new_graded_subm.getAlreadyEmailed() == "")
        {
          this.addNotAlreadyEmailedFingerprint(fingerprint);
        }
      
      Debug.info("GradesWorksheet.processGradesSheet() - new grade submission just added " + i);
      
    } // For each submission.
    
} // GradesWorksheet.processGradesSheet

// processGradingOptions()  
// Processes this.grading_options to record how many student identifiers there are, as well as
// how many points possible. Records these in this.points_possible and this.num_student_identifiers.
GradesWorksheet.prototype.processGradingOptions = function()
{  
  Debug.info("GradesWorksheet.processGradingOptions()");
  Debug.info("this.grading_options: " + this.grading_options);

  for (var q_index=0; q_index < this.grading_options.length; q_index++)
    {
      var gopt = this.grading_options[q_index];
      if (gopt === "")
        {
          continue; // blank entry from hidden row in Grades sheet
        }
      
      if (gopt === GRADING_OPT_STUD_ID)
        {
          this.num_student_identifiers++;
        }
      else
        {
          this.num_gradeable_questions++;
          
          if (isWorthPoints(gopt) && !isBonusQuestion(gopt))
            {
              this.points_possible += getPointsWorth(gopt);
            }
          
          if (isManuallyGraded(gopt))
            {
              this.has_manually_graded_question = true;
            }
        }
      
    }
  
  this.num_gradeable_questions--; // discount "Timestamp" question, which is always skipped. 
}

GradesWorksheet.prototype.prepNewGradesSheet = function()
{
  Debug.info("GradesWorksheet.prepNewGradesSheet()");
  
  var dp = PropertiesService.getDocumentProperties();
  
  var clear_experiment = dp.getProperty(DOC_PROP_CLEAR_VS_DELETE_GRADES_SHEET);
  
  // Start by creating the 'Grades' sheet. If it already exists, then
  // delete it (instructor was already warned before in Step 1).
  if (this.grades_sheet)
    {
      // Present, so delete it.
      this.spreadsheet.setActiveSheet(this.grades_sheet);
      
      if (clear_experiment)
        {
          // To be tested by Joe. Sept 2016. Made the default if it all checks out.'
          unHideAllRowsAndColumns(this.grades_sheet);
          this.grades_sheet.setFrozenColumns(0);
          this.grades_sheet.setFrozenRows(0);
          this.grades_sheet.getDataRange().clear();
        }
      else
        {
          this.spreadsheet.deleteActiveSheet();
        }
        
      // To avoid a bug in which 'Grades' get deleted, but appears to
      // stick around, switch to another sheet after deleting it.
      // TODO_AJR: bug still exists sometimes.
      var switch_to_sheet = getSheetWithSubmissions(this.spreadsheet);
      this.spreadsheet.setActiveSheet(switch_to_sheet);  
    }
  
  if (!clear_experiment)
    {
      // Next, create a blank sheet for the grades.
      this.grades_sheet = this.spreadsheet.insertSheet(langstr("FLB_STR_SHEETNAME_GRADES"));
    
      // Enter enough blank rows into the new Grades sheet. It
      // starts with 100, but we may need more. Not having enough
      // causes an error when trying to write to non-existent rows.
      var num_blank_rows_needed = gbl_grades_start_row_num + 1 
                                  + (3 * this.submissions_sheet.getLastRow()) // grades, copies of submissions, and question comments
                                  + gbl_num_space_before_hidden 
                                  + gbl_num_hidden_rows 
                                  + 10; // extra 10 for good measure
  
      if (num_blank_rows_needed > 100)
        {
          this.grades_sheet.insertRows(1, num_blank_rows_needed - 100);
        }
    }
  
  // Write a simple message to the top-left cell, so users know
  // grades are being calculated.
  this.grades_sheet.getRange(2, 1, 1, 1)
                   .setValue(langstr("FLB_STR_GRADING_CELL_MESSAGE"))
                   .setFontWeight("bold");
  
  this.grades_sheet.getRange("A2").activate();
} // GradesWorksheet.prepNewGradesSheet()

// writeGradesSheet:
// Write the graded submissions into the grades sheet. For the purposes 
// of performing the write the sheet is seperated into three areas:
// 
//   header - submissions summary
//   body - the submissions
//   footer - internal data, usually hidden
//
// gws_existing: Points to (optional) gradesWorksheet object initialized
//             from previously existing Grades sheet (with INIT_TYPE_GRADED_PARTIAL).
//             Used to maintain information like "already emailed" column, and others,
//             when re-generating the Grades sheet.
//             This argument is passed as null if no prev Grades sheet exists.
//
// grades_sheet_update_type: 
//        Either GRADES_SHEET_UPDATE_TYPE_REGEN: Whole Grades sheet is regenerated
//           or  GRADES_SHEET_UPDATE_TYPE_INSERT: New graded submission rows are inserted
//               into existing Grades sheet (less common case).
//
GradesWorksheet.prototype.writeGradesSheet = function(gws_existing,
                                                      grades_sheet_update_type)
{ 
  // "Private" variables used in multiple functions nested in 'writeGradesSheet'.
  
  var first_graded_subm;
  var submissions_start_row;
  var next_footer_row;
  var last_row_written;
  var total_subm_score = 0;
  var num_graded_subm_written = 0;
  var already_emailed_info = null;
  var student_feedback_info = null;
  var status = STATUS_OK;

  Debug.info("GradesWorksheet.writeGradesSheet() - grades_sheet_update_type= " + grades_sheet_update_type);
  
  /* doesn't help b/c new Grades sheet already written by this point. revisit, if worth it. */
  if (this.countGradedSubmissions() == 0)
    {
      // no grades to write. should be a rare case. 
      // possibly due to a single subm with all blanks for student identifiers.
      Debug.info("GradesWorksheet.writeGradesSheet() - no submissions to write. returning.");
      return STATUS_CANNOT_CONTINUE;
    }
  
  if (gws_existing)
    {
      already_emailed_info = gws_existing.getAlreadyEmailedInfo();
      student_feedback_info = gws_existing.getStudentFeedbackInfo();
    }
  
  var dp = PropertiesService.getDocumentProperties();
  
  // Store "this" object for use in the nested functions.
  var self = this;
  
  // Write the contents of the grade sheet.
  initializeWriting();

  if (grades_sheet_update_type == GRADES_SHEET_UPDATE_TYPE_REGEN)
    {
      // Write the Header and Footer for the new Grades sheet
      writeHeader();
      writeFooter();
    }
  
  writeBody();
  finalizeWriting();

  // if all succeeded with writing/recording grades, log active usage
  logDailyPing();
  
  return status;
  
  // Private functions.
       
  function initializeWriting()
  {
    Debug.assert(self.grades_sheet !== null, 
                 "GradesWorksheet.writeGradesSheet.initializeWriting() - " +
                   "no grades sheet");
  
    // Get the first graded submission from the sumissions sheet. This 
    // also initiaises the process of reading the submissions later on.
    first_graded_subm = self.getFirstGradedSubmission();
    Debug.info("initializeWriting() - first_graded_subm = " + first_graded_subm);
    
    // Add 1 to allow for the header.
    submissions_start_row = gbl_grades_start_row_num + 1;
 
    // Calculate where the footer rows will start
    next_footer_row = submissions_start_row + 
                      self.getNumGradedSubmissions() + 
                      1 + 
                      gbl_num_space_before_hidden; 
                
    Debug.info("GradesWorksheet.writeGradesSheet.initializeWriting() - " + 
               "next_footer_row: " + 
                next_footer_row);
    
    if (grades_sheet_update_type != GRADES_SHEET_UPDATE_TYPE_REGEN)
      {
        Debug.info("GradesWorksheet.writeGradesSheet.initializeWriting() - " + 
                   "Updating num_graded_subm_written and next_footer_row for insert case");
        
        // We are inserting new entries, rather than regenerating the whole Grades sheet.
        // So update/ffwd 'num_graded_subm_written' to the value it would have been
        // had we actually just written the graded rows already present.
        num_graded_subm_written = self.getNumGradedSubmissions();
  
        // Also pretend that we've inserted all the footer rows already present
        next_footer_row += gbl_num_hidden_rows + num_graded_subm_written;
        
        // don't continue unless regenerating the entire Grades sheet
        return;
      }
  
    // Hide the columns containing student feedback and the offset of this 
    // question stored in the footer.
    var metric_start_col = self.num_student_identifiers + 2;
    var feedback_col_num =  metric_start_col + METRIC_STUDENT_FEEDBACK;
    self.grades_sheet.hideColumns(feedback_col_num);
    var subm_copy_row_index_col_num =  metric_start_col + METRIC_SUBM_COPY_ROW_INDEX;
    self.grades_sheet.hideColumns(subm_copy_row_index_col_num);
    
    dp.setProperty(DOC_PROP_STUDENT_FEEDBACK_HIDDEN, "true"); 
    
  } // GradesWorksheet.writeGradesSheet.initializeWriting()

  // Nested function to write the grade sheet header.
  function writeHeader()
  {    
    // Create an area at the top of this sheet where the grades
    // summary will go after grading is done.
    setCellValue(self.grades_sheet, 2, 1, langstr("FLB_STR_GRADE_SUMMARY_TEXT_SUMMARY") + ":");
    self.grades_sheet.getRange(2, 1, 1, 1).setFontWeight("bold");
    setCellValue(self.grades_sheet, GRADES_SUMMARY_PTS_POSSIBLE_ROW_NUM, 1, langstr("FLB_STR_GRADE_SUMMARY_TEXT_POINTS_POSSIBLE"));
    setCellValue(self.grades_sheet, GRADES_SUMMARY_AVG_PTS_ROW_NUM, 1, langstr("FLB_STR_GRADE_SUMMARY_TEXT_AVERAGE_POINTS"));
    setCellValue(self.grades_sheet, GRADES_SUMMARY_COUNTED_SUBM_ROW_NUM, 1, langstr("FLB_STR_GRADE_SUMMARY_TEXT_COUNTED_SUBMISSIONS"));
    setCellValue(self.grades_sheet, GRADES_SUMMARY_LOW_SCORE_ROW_NUM, 1, langstr("FLB_STR_GRADE_SUMMARY_TEXT_NUM_LOW_SCORING"));
    
    // Add a formula in cell A1 that determines where the hidden rows start.
    // This is needed to locate the hidden rows, and is better than a static calculation
    // which would break if the user deleted some rows in the Grades sheet (which happens often).
    gwsInsertHiddenRowLocatorFormula(self.grades_sheet, self.num_student_identifiers);
    
    if (first_graded_subm.hasCategories())
      {
        var categories_row = first_graded_subm.createRowForGradesSheet(GRADES_OUTPUT_ROW_TYPE_CATEGORY_NAMES,
                                                                       GRADES_CATEGORY_NAMES_ROW_NUM); 
        writeArrayToRow(self.grades_sheet, GRADES_CATEGORY_NAMES_ROW_NUM, 1, categories_row, "italic", "");
      }

    Debug.info("writeHeader - creating questions header. first_graded_subm = " + first_graded_subm);

    var headers = first_graded_subm.createRowForGradesSheet(GRADES_OUTPUT_ROW_TYPE_QUESTIONS_HEADER,
                                                            gbl_grades_start_row_num);       
    
    
    var col_num;
    var col_ltr;
    var col_range;
    var rg;
    var cols_to_format = gwsCheckForFormattedCellsInRow(headers);
    Debug.info(cols_to_format);
        
    writeArrayToRow(self.grades_sheet, gbl_grades_start_row_num, 1, headers, "bold", "");
    
    // apply special formatting to any columns in 'cols_to_format'
    for (var c=0; c < cols_to_format.length; c++)
      {
        col_num = cols_to_format[c].col_num;
        var col_format = cols_to_format[c].col_format;
        col_ltr = convertColNumToColLetter(col_num);
        col_range = col_ltr + gbl_grades_start_row_num + ":" + col_ltr;
        rg = self.grades_sheet.getRange(col_range);
        
        if (col_format == FLB_COLFORMAT_GREY_ITALIC_TEXT)
          {
            rg.setFontColor("#999999");
            rg.setFontStyle("italic");
          }
        else if (col_format == FLB_COLFORMAT_HIDDEN)
          {
            self.grades_sheet.hideColumns(col_num);
          }
        else if (col_format == FLB_COLFORMAT_WRAP_TEXT)
          {
            rg.setWrap(true);
          }
      }
    
    // turn on word wrap on the header rows.
	var wr = self.grades_sheet.getRange(1, 1, gbl_grades_start_row_num, headers.length);
    wr.setWrap(true);
    
    // format the entire percent column to show 0.00%
    col_num = 1 + self.num_student_identifiers + 1 + 1;
    col_ltr = convertColNumToColLetter(col_num);
    col_range = col_ltr + ":" + col_ltr;
    rg = self.grades_sheet.getRange(col_range);
    rg.setNumberFormat("0.00%");
    
    // format the entire timestamp column to show date + time (starting at row 2)
    col_ltr = "A";
    col_range = col_ltr + "2:" + col_ltr;
    rg = self.grades_sheet.getRange(col_range);
    rg.setNumberFormat("MM/d/yyyy H:mm:ss");
    
    Debug.info("writeHeader - done creating questions header.");
    
  } // GradesWorksheet.writeGradesSheet.writeHeader()

  // Nested function to write the grade sheet footer.  
  function writeFooter()
  {
    // Write out some rows at the bottom of the grades sheet for internal
    // data processing. These include information like the grading options 
    // and the answer key values. This information is referenced later when 
    // doing things like emailing grades, creating reports, etc. It will 
    // usually be hidden from the user.
  
    Debug.info("writeFooter - creating footer.");
    

    Debug.info("writeFooter - creating footer for GRADES_OUTPUT_ROW_TYPE_GRADING_OPT.");
    writeArrayToRow(self.grades_sheet, 
                    next_footer_row, 
                    1, 
                    first_graded_subm.createRowForGradesSheet(GRADES_OUTPUT_ROW_TYPE_GRADING_OPT, next_footer_row++), 
                    "", 
                    "");
        
    Debug.info("writeFooter - creating footer for GRADES_OUTPUT_ROW_TYPE_HELP_TIPS.");
    writeArrayToRow(self.grades_sheet, 
                    next_footer_row, 
                    1, 
                    first_graded_subm.createRowForGradesSheet(GRADES_OUTPUT_ROW_TYPE_HELP_TIPS, next_footer_row++), 
                    "", 
                    "");
        
    Debug.info("writeFooter - creating footer for GRADES_OUTPUT_ROW_TYPE_ANSWER_KEY.");
    writeArrayToRow(self.grades_sheet, 
                    next_footer_row, 
                    1, 
                    first_graded_subm.createRowForGradesSheet(GRADES_OUTPUT_ROW_TYPE_ANSWER_KEY, next_footer_row++), 
                    "", 
                    "");
        
    Debug.info("writeFooter - creating footer for GRADES_OUTPUT_ROW_TYPE_QUESTIONS_FULL.");
    writeArrayToRow(self.grades_sheet, 
                    next_footer_row, 
                    1, 
                    first_graded_subm.createRowForGradesSheet(GRADES_OUTPUT_ROW_TYPE_QUESTIONS_FULL, next_footer_row++), 
                    "", 
                    "");
      
    Debug.info("writeFooter - done creating footer.");
  } // GradesWorksheet.writeGradesSheet.writeFooter()

  // Nested function to write the body of the grade sheet - the submissions themselves.
  function writeBody() 
  {  
    Debug.info("GradesWorksheet.writeGradesSheet.writeBody() - " + 
               "next_footer_row: " + 
               next_footer_row);
    
    self.grades_sheet.getRange("A1").activate();
    
    var gs_count = 1;
    var subm_score;
    var ak_row_num;
    var gs = first_graded_subm;
    var fingerprint;
    var regen_grades_sheet = (grades_sheet_update_type == GRADES_SHEET_UPDATE_TYPE_REGEN);
    //var num_graded_submissions = self.getNumGradedSubmissions();
    
    var low_score = LOWSCORE_STUDENT_PERCENTAGE; // default
    var opt_low_score = dp.getProperty(DOC_PROP_ADV_OPTION_PASS_RATE);
    if (opt_low_score)
      {
        low_score = opt_low_score;
      }
    
    // Update some variables depending on whether we are regerating the entire Grades sheet,
    // or just inserting some rows into an exisitng one.
    if (!regen_grades_sheet)
      {    
        // update gs_count to the value it would have been had we written all the
        // rows present currently in the Grades sheet
        gs_count += num_graded_subm_written;
        
        // just inserting into this existing Grades sheet, so we already know where the hidden 
        // rows are. 
        //ak_row_num = this.getHiddenRowNum(GRADES_HIDDEN_ROW_TYPE_ANSWER_KEY, "");
      }
    else // regenerating Grades sheet
      {
        // do some math to determine where the hidden answer key row will get written.
        var hidden_row_start = gbl_grades_start_row_num + self.getNumGradedSubmissions()
                                + 2 + gbl_num_space_before_hidden;
        
        //ak_row_num = hidden_row_start + GRADES_HIDDEN_ROW_TYPE_ANSWER_KEY;
      }

    //Debug.info("For formula token expansion, ak_row_num = " + ak_row_num);                 
                     
    for (; gs != null; gs = self.getNextGradedSubmission(), gs_count++)
      { 
        // Initialize the write
        // --------------------
        fingerprint = gs.getSubmFingerprint();
      
        if (regen_grades_sheet)
          {        
            if (already_emailed_info)
              {
                // Before writing out the grades, check if we already emailed 
                // this student before. If so, make a note of it so they don't 
                // get another email. If their number of submissions has 
                // changed since last time, we'll let them get emailed again.
            
                if (fingerprint in already_emailed_info && 
                    gs.getTimesSubmitted() === already_emailed_info[fingerprint]
                    && !gs.getSubmissionEdited())
                  {
                    // No need to email their grade again.
                    gs.setAlreadyEmailed();
                  }
                else
                  {
                    // We should email them again, given their new submission. Track that.
                    self.addNotAlreadyEmailedFingerprint(fingerprint);
                  }
              }
            else
              {
                // haven't email them yet, so track that.
                self.addNotAlreadyEmailedFingerprint(fingerprint);
              }
      
            if (student_feedback_info)
              {
                fingerprint = gs.getSubmFingerprint();
            
                if (fingerprint in student_feedback_info) 
                  {
                    // Store the student's feedback.
                    gs.setStudentFeedback(student_feedback_info[fingerprint]);
                  }
              }

            var prev_graded_subm = null;
            if (gws_existing && self.hasManuallyGradedQuestion())
              {
                prev_graded_subm = gws_existing.getGradedSubmissionByFingerprint(fingerprint);
              }
        
            if (prev_graded_subm)
              {
                for (var q = gs.getFirstQuestion(); q != null; q = gs.getNextQuestion(q))
                  {
                    if (isManuallyGraded(q.getGradingOption()))
                      {
                        Debug.info("Manually graded question detected!");
                    
                        // get the question from the prev submission. if it's also manually graded
                        // (user didn't change option), then preserve its value.
                        var prev_q = prev_graded_subm.getQuestionByFullQuestionText(q.getFullQuestionText());
                        if (!prev_q || !isManuallyGraded(prev_q.getGradingOption()))
                          {
                            // either couldn't find this questoin (rare - user renamed it), or it wasn't
                            // manually graded before (user changed option). don't preserve previous values.
                            continue;
                          }

                        // copy over fields from existing Grades sheet unless the student has resubmitted.
                        if (prev_graded_subm.getTimesSubmitted() == gs.getTimesSubmitted())
                          {
                            // copy over existing manually entered score or formula 
                            if (prev_q.hasFormula())
                              {
                                Debug.info("copying over formula...");
                                Debug.info("formula is: " + prev_q.formula);
                                gs.setGradedQuestionFormula(prev_q);
                              }
                            else
                              {
                                Debug.info("copying over value...");
                                gs.setGradedQuestionVal(prev_q);
                              }
                         
                            // also copy over existing teacher comment for this question
                            gs.setGradedQuestionComment(prev_q);
                          }
                        else
                          {
                            Debug.info("Manually graded question, but not copying over old value due to new submision");
                            Debug.info("    " + gs.getSubmFingerprint());
                            Debug.info("    " + prev_graded_subm.getTimesSubmitted() + " != " 
                                       + gs.getTimesSubmitted());
                          }
                      }
                  }
              }
            
          }  // end if (regen_grades_sheet)
        else
          {
            // ensure this newly inserted graded submission gets an email
            self.addNotAlreadyEmailedFingerprint(fingerprint);
          }
        
        // Record the offset into the hidden row section where a copy 
        // of the original submission is kept. Note that we store the location 
        // of the row rather than infer it in case the user sorts the Grades. Note. 
        // This needs to be done before writing to the grades sheet.
        var subm_copy_row_index = gs_count - 1
        gs.setSubmCopyRowIndex(subm_copy_row_index);
        
        // based on col number where formula exists, turn into cell reference. 
        
        // Write the submissions to the grades sheet
        // -----------------------------------------
        var write_row = submissions_start_row + num_graded_subm_written++;
        Debug.info("writeBody() - writing graded subm at row: " + write_row);
            
        // If not regenerating whole Grades sheet, then insert new rows for the
        // graded submissions being added.
        if (!regen_grades_sheet)
          {
            // we need to insert a new row first to hold the graded submission
            Debug.info("writeBody() - inserting new row after row #" + write_row);
            self.grades_sheet.insertRowBefore(write_row);
            
            // by inserting this row, we've pushed the next_footer_row down by one too.
            next_footer_row++;
            
            // and then insert a new row to hold the copy of the student's submission
            self.grades_sheet.insertRowBefore(next_footer_row);
            self.grades_sheet.hideRows(next_footer_row);
          }
      
        // write out the graded submission to the Grades sheet
        writeGradedSubmission(gs, write_row, next_footer_row, ak_row_num, low_score);
            
        // record which row it ended up being written in
        gs.setGradesRowNum(write_row);        
        
        // Write out the original full-text answer for each submission 
        // in the footer, adding an extra row if needed.
        writeArrayToRow(self.grades_sheet, 
                        next_footer_row,
                        1, 
                        gs.createRowForGradesSheet(GRADES_OUTPUT_ROW_TYPE_SUBMISSION_VALS, next_footer_row), 
                        "", 
                        "");
            
        last_row_written = next_footer_row;
            
        // Write out the comments for any manually graded questions in the footer
        if (regen_grades_sheet && self.hasManuallyGradedQuestion())
          {
            var hrow_num = next_footer_row + self.getNumGradedSubmissions();
            writeArrayToRow(self.grades_sheet, 
                            hrow_num,
                            1, 
                            gs.createRowForGradesSheet(GRADES_OUTPUT_ROW_TYPE_MANUALLY_GRADED_COMMENTS,
                                                       hrow_num), 
                            "", 
                            "");
                
            last_row_written = hrow_num;
          }
            
         
        // Finalize the writing
        // --------------------

        // Even though we may not have written a new footer entry, we need to 
        // move past the one that's there.
        next_footer_row++;
        
        // Keep a running tally of the submissions scores.
        subm_score = gs.getScorePoints();
        total_subm_score += subm_score;

      } // for all submissions
        
    return;
    
    // Private Functions.
    
    // Write another row in the grades sheet.
    function writeGradedSubmission(graded_subm, write_row_num, student_subm_copy_row, ak_row_num, low_score)
    {
      // Set the values and color of this row.
      var row_to_write = graded_subm.createRowForGradesSheet(GRADES_OUTPUT_ROW_TYPE_GRADED_VALS,
                                                             write_row_num);
      
      // If present, expand the tokens in any teacher supplied spreadsheet formulas.
      expandFormulaTokensInRow(row_to_write, student_subm_copy_row, /* ak_row_num*/ null);
      
      var row_range = self.grades_sheet.getRange(write_row_num, 1, 1, row_to_write.length)
                                       .setValues([row_to_write]);

      var row_colors = [PALE_YELLOW, ""];
      var color = row_colors[num_graded_subm_written % 2];
      
      if (color)
        {
          row_range.setBackgroundColor(color);
        }
           
      Debug.assert(row_range !== null, "writeGradedSubmission() - write failed");

      // get the value of the percentage that was calculated for this student.
      var set_red_range = self.grades_sheet.getRange(write_row_num, 2,
                                                     1, self.num_student_identifiers + gbl_num_metrics_cols);    
    
      // Highlight in red the names of students with low scores.      
      if ((graded_subm.getScorePercent() < low_score) && !self.has_manually_graded_question)
        {
          set_red_range.setFontColor(PALE_RED);
        }      
        
    } // writeGradedSubmission()
      
  } // GradesWorksheet.writeGradesSheet.writeBody()
  
  // Nested function to finalize the writing of the grade sheet.
  function finalizeWriting()
  {
    var fp_length = self.fingerprint_list.length; // how many subm we just graded
        
    var num_graded_subm;

    if (grades_sheet_update_type != GRADES_SHEET_UPDATE_TYPE_REGEN)
      { 
        // increase current number graded by the number of subm we just *inserted*.
        num_graded_subm = fp_length + NumGradedSubm.get();
      }
    else // regenerating whole Grades sheet
      {
          // Put the number of graded submissions into persistent storage. 
        Debug.assert(!!fp_length, 
                     "GradesWorksheet.writeGradesSheet.finalizeWriting() - " + 
                       "fingerprint list empty");
             
        num_graded_subm = fp_length;
        
        // Hide the footer rows.
        var num_hidden_rows = num_graded_subm_written + gbl_num_hidden_rows;

        if (self.hasManuallyGradedQuestion())
          {
            // also hide the teacher comment rows.
            num_hidden_rows += num_graded_subm_written;
          }
    
        var hide_start_row = last_row_written + 1 - num_hidden_rows;
        self.grades_sheet.hideRows(hide_start_row, num_hidden_rows);

        // Update the summary of grades in the header.    
        setCellValue(self.grades_sheet, GRADES_SUMMARY_PTS_POSSIBLE_ROW_NUM, 2, self.points_possible);
    
        // Insert equation that shows average score
        var col_num = 1 + self.num_student_identifiers + 1;
        var col_ltr = convertColNumToColLetter(col_num);
        var eqn = "=average(" + col_ltr + ":" + col_ltr + ")";
        setCellValue(self.grades_sheet, GRADES_SUMMARY_AVG_PTS_ROW_NUM, 2, eqn);
        setCellNumberFormat(self.grades_sheet, GRADES_SUMMARY_AVG_PTS_ROW_NUM, 2, "0.00");

        // Insert equation that shows number of low-scoring questions.    
        var start_col_num = 1 + self.num_student_identifiers + gbl_num_metrics_cols + 1;
        var end_col_num = start_col_num + self.num_gradeable_questions - 1;
        var start_col = convertColNumToColLetter(start_col_num);
        var end_col = convertColNumToColLetter(end_col_num);
    
        var write_start_row = gbl_grades_start_row_num + 1; 
        var percent_correct_row = write_start_row + 
                                  num_graded_subm + 1;
     
        var range = start_col + percent_correct_row + ":" + end_col + percent_correct_row; // i.e. J40:U40
        eqn = '=countif(' + range + '; "<' + LOWSCORE_QUESTION_PERCENTAGE + '")';
    
        setCellValue(self.grades_sheet, GRADES_SUMMARY_LOW_SCORE_ROW_NUM, 2, eqn);
    
        // put message about not deleting rows or columns in cell E2
 	    var dnd = self.grades_sheet.getRange(2, 5, 1, 1);
        dnd.setWrap(false);
        dnd.setFontWeight("bold");
        dnd.setValue(langstr("FLB_STR_DO_NOT_DELETE_MSG"));
          
        // clear any stored metadata used by the Grade By Hand tool, as it's now likely changed. This will 
        // force it to reinitialize the metadata from the new Grades sheet.
        dp.deleteProperty(DOC_PROP_MGR_STORED_METADATA);
        
        // Also record number of student identifiers as a property, since we need to 
        // know it when generating the Flubaroo menu.
        dp.setProperty(DOC_PROP_NUM_STUDENT_IDENTIFIERS, 
                                     self.num_student_identifiers);
    
        // For ease of reading, freeze top rows and student id columns (that's 
        // a lot of flushing, but seems to be the only way to get it to work.
        SpreadsheetApp.flush();    
        self.grades_sheet.setFrozenRows(gbl_grades_start_row_num);
        SpreadsheetApp.flush();
        self.grades_sheet.setFrozenColumns(1 + self.num_student_identifiers);        
        SpreadsheetApp.flush();
      }

    // update the number of total graded submissions in the Grades sheet.
    // note: this must be done before we write the row of percentage eqns.
    NumGradedSubm.set(num_graded_subm);
    setCellValue(self.grades_sheet, GRADES_SUMMARY_COUNTED_SUBM_ROW_NUM, 2, num_graded_subm);

    // write the row of perc correct equations, if creating the Grades sheet.
    // or just updated it if it's already present b/c we're just inserting rows for Autograde.
    writePercentageEquations();
    
    // Give the hidden "Feedback for Student" column a different color (per Alice Keeler).
    var hidden_feedback_col_num = self.num_student_identifiers + gbl_num_metrics_cols
    var sf_col = self.grades_sheet.getRange(gbl_grades_start_row_num, hidden_feedback_col_num, num_graded_subm + 1, 1);
    sf_col.setBackgroundColor("#CFE2F3");
    
    // if Autograding and not regenerating the whole Grades sheet on each submission, 
    // make a note in the Grades sheet that there might be > 1 subm from each student. 
    if (Autograde.isOn() && !Autograde.getDoFullRegrade())
      {
        var hc_url = FLB_AUTOGRADE_SELECT_MODE_URL;
        var mogs = self.grades_sheet.getRange(4, 5, 1, 1);
        mogs.setWrap(false);
        mogs.setFontColor("blue");
        mogs.setValue(langstr("FLB_STR_AUTOGRADE_NOT_SUMMARIZED"));;
        mogs.setComment('For more information, see: ' + hc_url);
      }
    
    // Keep track (anonymously) of number of assignments manually 
    // graded using Flubaroo, as well as active monthly users.
    logActiveUserGrading();
    
    if (!Autograde.isOn())
      {
        logGrading(self.spreadsheet); 
      }

    // record the number of columns in the Grades sheet, for comparison later
    // to ensure the user didn't delete or insert unexpected columns.
    dp.setProperty(DOC_PROP_NUM_COLS_IN_GRADES, self.grades_sheet.getLastColumn());
    
    return;
    
    // Private Functions.
    
    // TODO_AJR - GetNumGradedSubmissions() is called a lot in here, could
    // we pass it in.
    
    // Nested function to write the percentage values to the 
    // grades sheet.
    function writePercentageEquations()
    {     
      var eqn_array = [];
      var gopt_array = [];
      var no_perc = "---"; // show for manually graded questions
      
      // First row into which to write grades
      var subm_start_row = gbl_grades_start_row_num + 1; 
      var subm_end_row = subm_start_row + self.getNumGradedSubmissions() - 1;
        
      // Add a space after the submissions (the '1').
      var percent_correct_row = subm_end_row + 2;
              
      var percent_correct_start_col = 1 + 
                                      self.num_student_identifiers + 
                                      gbl_num_metrics_cols + 
                                      1; 
      
      var gs = self.getFirstGradedSubmission(); 
      var i = 0;
      for (var q = gs.getFirstQuestion(); q != null; q = gs.getNextQuestion(q))
        {
          var eqn = no_perc; 
          var gopt = q.getGradingOption();            
          
          if (isStudentIdentifier(gopt) || q.isTimestamp())
            {
              // these columns aren't ones that get percentages.
              continue;
            }
      
          else // gradeable question
            {
              if (isNormallyGraded(gopt) || isManuallyGraded(gopt))
                {
                  var col_ltr = convertColNumToColLetter(percent_correct_start_col + i);
                  var range = col_ltr + subm_start_row + ":" + col_ltr + subm_end_row;
                  
                  // old way:
                  //eqn = '=countif(' + range + '; ">0") / $B$' + GRADES_SUMMARY_COUNTED_SUBM_ROW_NUM;
                  
                  // new formula per joe on 4/21/17
                  eqn = '=sum(' + range + ') / $B$' + GRADES_SUMMARY_COUNTED_SUBM_ROW_NUM + ' / ' + getPointsWorth(gopt);
                }
              
              eqn_array.push(eqn);
              gopt_array.push(gopt);
              i++;
            }                    
        }

       var perc_row_range = self.grades_sheet.getRange(percent_correct_row, 
                                                       percent_correct_start_col, 
                                                       1, 
                                                       eqn_array.length);
          
       // write the row of eqns
       perc_row_range.setValues([eqn_array]);
      
       // get the values calculated by the equations
       var perc_vals = perc_row_range.getValues()[0];

       // Set the percentage value and the question name background to orange.
       var low_avg_score_color = "orange";
        
       for (var i = 0; i < perc_vals.length; i++)
         {
           perc = perc_vals[i];

           var c_index = percent_correct_start_col + i;
            
            if (perc == "---")
              {
                setCellHorizontalAlignment(self.grades_sheet,
                                          percent_correct_row,
                                          c_index,
                                          "center");
              }
           
            else if (!isNaN(perc))
              {                  
                setCellNumberFormat(self.grades_sheet,
                                    percent_correct_row,
                                    c_index,
                                    "0.00%");
                                
                // Highlight low-scoring questions in orange. Don't do this for Grade by Hand questions
                // though, as they haven't actually been scored by the teacher yet.
                if ((perc < LOWSCORE_QUESTION_PERCENTAGE) && (!isManuallyGraded(gopt_array[i])))
                  {
                    setCellColor(self.grades_sheet, 
                                 gbl_grades_start_row_num, 
                                 c_index, 
                                 low_avg_score_color);
                
                    setCellColor(self.grades_sheet, 
                                 percent_correct_row, 
                                 c_index, 
                                 low_avg_score_color);
                  }
              }
          }
    }
        
  } // GradesWorksheet.writeGradesSheet.finalizeWriting()

} // GradesWorksheet.writeGradesSheet()

GradesWorksheet.prototype.getHiddenRowNum = function(hidden_row_id, 
                                                     opt_graded_subm_row_index)
{
  // Find out where the hidden rows start.
  var cell_a1_range = this.grades_sheet.getRange(1, 1, 1, 1);
  var hidden_row_num_start = cell_a1_range.getValue();
  
  var n = 0;

  if (opt_graded_subm_row_index)
    {
      // An offset past the first hidden row.
      n += opt_graded_subm_row_index; 
    }

  var row_num = hidden_row_num_start + hidden_row_id + n;
  
  return row_num;
}

GradesWorksheet.prototype.getHiddenRow = function(hidden_row_id, 
                                                  opt_graded_subm_row_index,
                                                  numb_graded_submissions)
{
  Debug.info("GradesWorksheet.getHiddenRow() - " + 
             "row_id: " + hidden_row_id + " " +
             "subm row index: " + opt_graded_subm_row_index +
             "numb_graded_submissions: " + numb_graded_submissions);

  /*
  // Find out where the hidden rows start.
  var cell_a1_range = this.grades_sheet.getRange(1, 1, 1, 1);
  var hidden_row_num_start = cell_a1_range.getValue();
  
  var n = 0;

  if (opt_graded_subm_row_index)
    {
      // An offset past the first hidden row.
      n += opt_graded_subm_row_index; 
    }

  var row_num = hidden_row_num_start + hidden_row_id + n;
  */
  
  var row_num = this.getHiddenRowNum(hidden_row_id, opt_graded_subm_row_index);
  
  if (hidden_row_id == GRADES_HIDDEN_ROW_TYPE_MANUALLY_GRADED_COMMENTS)
    {
      // fast-forward past copies of submission values, down to comments.
      row_num -= 1; // hack to move us back to start of submission value copies.
      row_num += numb_graded_submissions; // fast-forward
    }

  Debug.info("GradesWorksheet.getHiddenRow() - row_num: " + row_num);

  var hidden_row = singleRowToArray(this.grades_sheet, 
                                    row_num, 
                                    -1, false);

  return hidden_row;
}

// TODO_AJR - Looking at the log, the last submission in the grades sheet is coming 
// back false on getAlreadyEmailed() it's missing from the log.

// getAlreadyEmailedInfo:
// Note: Only for use when the init_type is INIT_TYPE_GRADED_PARTIAL or INIT_TYPE_GRADED_FULL.
// Returns an associative array, indexed by fingerprints, which contains the number
// of times a student has submitted the assignment. Only submissions for which an email has 
// already been sent will have an entry. 
GradesWorksheet.prototype.getAlreadyEmailedInfo = function()
{
  var already_emailed = [];
  var gs;
  var count;
  
  for (gs = this.getFirstGradedSubmission(), count = 0; 
       gs != null; 
       gs = this.getNextGradedSubmission())
    {
      if (gs.getAlreadyEmailed())
        {
          already_emailed[gs.getSubmFingerprint()] = gs.getTimesSubmitted();
          
          Debug.info("GradesWorksheet.getAlreadyEmailedInfo() fp: " + 
                     gs.getSubmFingerprint() +
                     " already emailed: " + 
                     already_emailed[gs.getSubmFingerprint()]);
          count++;
        }
    }

  Debug.info("GradesWorksheet.getAlreadyEmailedInfo(): count: " + count); 

  return already_emailed;
}

// getStudentFeedbackInfo:
// Note: Only for use when the init_type is INIT_TYPE_GRADED_PARTIAL or INIT_TYPE_GRADED_FULL.
// Returns an associative array, indexed by fingerprints, which contains the optional
// feedback entered by an instructor for a given student. If none, no fingerprint for that 
// student will exist.
GradesWorksheet.prototype.getStudentFeedbackInfo = function()
{
  var student_feedback = [];
  var gs;
  var feedback;
  
  for (gs = this.getFirstGradedSubmission(); 
       gs != null; 
       gs = this.getNextGradedSubmission())
    {
      feedback = gs.getStudentFeedback();
    
      if (feedback != "")
        {
          student_feedback[gs.getSubmFingerprint()] = feedback;
        }
    }
  
  return student_feedback;
}

GradesWorksheet.prototype.hasManuallyGradedQuestion = function()
{
  return this.has_manually_graded_question;
}

GradesWorksheet.prototype.hasFormulaAnswerKey = function()
{
  return this.has_formula_anskey;
}

// global used for debugging. see emailCorruptedGradesSheetHeader()
gws_invalid_grades_sheet_reason = 0;

// gwsGradesSheetIsValid: Returns true if grades_sheet is valid (grading completed). False otherwise.
// Assumes the grades_sheet passed isn't null (Grades sheet exists)
function gwsGradesSheetIsValid(grades_sheet)
{
  // In addition to checking for the formula in cell A1, insert it if not found.
  // This also handles the update of Grade sheets priod to version 40.
  gwsInsertHiddenForumlaInA1(grades_sheet);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var subm_sheet = getSheetWithSubmissions(ss);
  var subm_mod = Math.floor(subm_sheet.getLastRow() / 25) * 25;
  gws_invalid_grades_sheet_reason = 0;
  
  // check for "Grading in progress..." message in cell A2.
  // indicates that grading died previously
  var single_cell = grades_sheet.getRange(2, 1, 1, 1);  
  var val = single_cell.getValue();
  if (val === langstr("FLB_STR_GRADING_CELL_MESSAGE"))
    {
      gbl_invalid_grades_sheet_error = "Previous grading attempt never completed.";
      Debug.info(gbl_invalid_grades_sheet_error);
      logInvalidGradeSheet("Previous Incomplete");
      gws_invalid_grades_sheet_reason = 5;
      return false;
    }  
  
  // check for a minimum number of rows
  var min_rows = gbl_grades_start_row_num
                 + 1 // at least one graded submission
                 + 2 // blank row, then percentages row
                 + gbl_num_space_before_hidden - 1 // blank rows before hidden rows
                 + gbl_num_hidden_rows // hidden information rows (grading opts, ans key, etc)
                 + 1 // at least one hidden row for original response
                 
  var num_rows = grades_sheet.getLastRow();
  if (num_rows < min_rows)
    {
      gbl_invalid_grades_sheet_error = "Fewer rows found in Grades sheet than expected.";
      Debug.info(gbl_invalid_grades_sheet_error);
      logInvalidGradeSheet("Too Few Rows/" + num_rows);
      gws_invalid_grades_sheet_reason = 1;
      return false;
    }
  
  // check the total points
  var single_cell = grades_sheet.getRange(GRADES_SUMMARY_PTS_POSSIBLE_ROW_NUM, 2, 1, 1);  
  var val = single_cell.getValue();

  if (val == "" || isNaN(val))
    {
      gbl_invalid_grades_sheet_error = "Summary (top-left of Grades sheet) is missing expected information."
      Debug.info(gbl_invalid_grades_sheet_error);
      logInvalidGradeSheet("No Points");
      gws_invalid_grades_sheet_reason = 2;
      return false;
    }
  
  // check for a valid first grades row by looking at its timestamp value
  single_cell = grades_sheet.getRange(gbl_grades_start_row_num + 1, 1, 1, 1);
  val = single_cell.getValue();
  
  if (val == "" || isNaN(val))
    {
      gbl_invalid_grades_sheet_error = "Missing the required timestamps in Column A of Grades sheet.";
      Debug.info(gbl_invalid_grades_sheet_error);
      logInvalidGradeSheet("No Timestamp");
      gws_invalid_grades_sheet_reason = 3;
      return false;
    }
  
  
  /* Potential future check: Check that the user hasn't deleted columns in the 
   * Student Submissions sheet without updating grading options. Only for Autograde,
   * since this can't happen for manual grading. Untested!
   */
  /*
  if (Autograde.isOn())
    {
      var dp = PropertiesService.getDocumentProperties();   

      var grade_opt_str = dp.getProperty(DOC_PROP_UI_GRADING_OPT);  
      if (grade_opt_str)
        {
          var grading_options = grade_opt_str.split(",")
          var n_ques = getNumQuestionsFromSubmissions(sheet);
          if (grading_options.length > n_ques)
            {
              autogradeNotifyUserByEmail();
            }
         }
    }
   */  
    
  Debug.info("existing grades sheet is valid");

  return true;
}


function gwsInsertHiddenForumlaInA1(grades_sheet)
{
  var dp = PropertiesService.getDocumentProperties();
  var num_stud_ident = Number(dp.getProperty(DOC_PROP_NUM_STUDENT_IDENTIFIERS));
  
  // check in cell A1 for formula that identifies hidden row location. if not present (old Grades sheet), insert one.
  // fix in version 41: also check if equation uses commas (doesn't work internationally), and if so update to new
  // formula that ahs semicolons instead (works globally).
  var a1_cell_range = grades_sheet.getRange(1, 1, 1, 1);
  var a1_cell_formula = a1_cell_range.getFormula();
  if (a1_cell_formula == "")
    {
      // old Grades sheet with no hidden row A
      grades_sheet.insertRowBefore(1);
      gwsInsertHiddenRowLocatorFormula(grades_sheet, num_stud_ident);
    }
  else if (a1_cell_formula.indexOf(",") != -1)
    {
      // has hidden row A, but using non-internationalized version of formula from version 40.
      gwsInsertHiddenRowLocatorFormula(grades_sheet, num_stud_ident);
    }
}

function gwsInsertHiddenRowLocatorFormula(grades_sheet, num_stud_ident)
{
  var a1_cell_range = grades_sheet.getRange(1, 1, 1, 1);
  grades_sheet.hideRow(a1_cell_range);

  a1_cell_range.setFormula('=match("Skip Grading"; A2:A; 0) + 1');
  a1_cell_range.setNumberFormat('0.0'); // plain text
      
  var a2_cell_range = grades_sheet.getRange(1, 2, 1, 1);
  a2_cell_range.setValue(num_stud_ident);
  
  var a3_cell_range = grades_sheet.getRange(1, 3, 1, 1);
  a3_cell_range.setValue("THIS ROW USED BY FLUBAROO - DO NOT EDIT OR DELETE");
}

function gwsCheckForFormattedCellsInRow(row_to_write)
{
  var col_nums = [];
  
  for (var i=0; i < row_to_write.length; i++)
    {
      var val = row_to_write[i];
      
      if (typeof val !== 'string')
        {
          continue;
        }
      
      if (val.indexOf(FLB_COLFORMAT_GREY_ITALIC_TEXT) != -1)
        {
          val = val.replace(FLB_COLFORMAT_GREY_ITALIC_TEXT, "");
          
          row_to_write[i] = val;
          
          col_nums.push({col_num: i+1, col_format: FLB_COLFORMAT_GREY_ITALIC_TEXT});
        }
     
      if (val.indexOf(FLB_COLFORMAT_HIDDEN) != -1)
        {
          val = val.replace(FLB_COLFORMAT_HIDDEN, "");
          
          row_to_write[i] = val;
          
          col_nums.push({col_num: i+1, col_format: FLB_COLFORMAT_HIDDEN});
        }
      
      if (val.indexOf(FLB_COLFORMAT_WRAP_TEXT) != -1)
        {
          val = val.replace(FLB_COLFORMAT_WRAP_TEXT, "");
          
          row_to_write[i] = val;
          
          col_nums.push({col_num: i+1, col_format: FLB_COLFORMAT_WRAP_TEXT});
        }
    }
  
  return col_nums;
}

function gwsAnswerKeyHasFormula(answer_key_vals)
{
  for (var i=0; i < answer_key_vals.length; i++)
    {
      var ak_val = answer_key_vals[i];
      if (typeof ak_val == "string" && ak_val.substring(0, 2) == "%=")
        {
          Debug.info("gwsAnswerKeyHasFormula: returning true");
          return true;
        }
    }
  
  return false;
}