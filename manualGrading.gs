// File: manualGrading.gs
// Description: 
// Contains functions used to read and write values related to manually graded
// questions.

// global variables used just in this file. set in mgtInitGlobals.
ss_gbl = null;
sheet_gbl = null;
init_complete = false;
num_graded_subm_gbl = null;
num_stud_identifiers_gbl = null;
grade_values_start_row_gbl = null;
percent_correct_row_gbl = null;
hidden_row_num_start_gbl = null;
min_col_gbl = null;
max_col_gbl = null;
grade_values_end_row_gbl = null;
grades_sheet_last_col_num_gbl = null;
first_mgr_question_col_num_gbl = null;

// mgrInitGlobals:
// Function called at the start of each function in this file which is
// callable from the HTML page's JS. Function initializes
// certain global variables (static to this file) that are used repeatedly.
// This speeds up the process of returning information to the manual grading
// UI window.
function mgrInitGlobals()
{
  if (init_complete)
    {
      return true;
    }
    
  ss_gbl = SpreadsheetApp.getActiveSpreadsheet();
  sheet_gbl = getSheetWithGrades(ss_gbl);
  if (!sheet_gbl)
    {
      return false;
    }
  
  var dp = PropertiesService.getDocumentProperties();
  
  var stored_metadata_prop = dp.getProperty(DOC_PROP_MGR_STORED_METADATA);
  
  if (!stored_metadata_prop)
    {  
      Debug.info("mgrInitGlobals(): Initializing meta data from Grades sheet. sheet_gbl=" + sheet_gbl);
      var meta_data_range = sheet_gbl.getRange(1, 1, 5, 2).getValues();
  
      // number of student identifiers is recorded in the hidden row (B1)
      num_stud_identifiers_gbl = Number(meta_data_range[0][1]);

      // number of counted submissions will be read from the summary of grades at the top of the sheet
      num_graded_subm_gbl = Number(meta_data_range[GRADES_SUMMARY_COUNTED_SUBM_ROW_NUM-1][1]); // B5
 
      hidden_row_num_start_gbl = Number(meta_data_range[0][0]);
      grades_sheet_last_col_num_gbl = sheet_gbl.getLastColumn();
      
      stored_metadata_prop = num_stud_identifiers_gbl.toString() + "|" + num_graded_subm_gbl.toString() + "|"
                             + hidden_row_num_start_gbl.toString() + "|" + grades_sheet_last_col_num_gbl.toString();
      
      Debug.info("mgrInitGlobals(): stored_metadata_prop=" + stored_metadata_prop);
      
      dp.setProperty(DOC_PROP_MGR_STORED_METADATA, stored_metadata_prop);
    }
  else
    {
      Debug.info("mgrInitGlobals(): Initializing meta data from stored property.");

      var meta_vals = stored_metadata_prop.split("|");
      num_stud_identifiers_gbl = Number(meta_vals[0]);
      num_graded_subm_gbl = Number(meta_vals[1]);
      hidden_row_num_start_gbl = Number(meta_vals[2]);
      grades_sheet_last_col_num_gbl = Number(meta_vals[3]);
    }
  
  Debug.info("mgrInitGlobals(): num_stud_identifiers_gbl=" + num_stud_identifiers_gbl);
  Debug.info("mgrInitGlobals(): num_graded_subm_gbl=" + num_graded_subm_gbl);      
  Debug.info("mgrInitGlobals(): hidden_row_num_start_gbl=" + hidden_row_num_start_gbl);
  Debug.info("mgrInitGlobals(): grades_sheet_last_col_num_gbl=" + grades_sheet_last_col_num_gbl);
  
   
  grade_values_start_row_gbl = gbl_grades_start_row_num + 1;  
  grade_values_end_row_gbl = grade_values_start_row_gbl + num_graded_subm_gbl - 1; 
  
  // get a valid range of columns
  min_col_gbl = 1 + num_stud_identifiers_gbl + gbl_num_metrics_cols + 1;
  max_col_gbl = grades_sheet_last_col_num_gbl;
  
  init_complete = true;
  
  return true;
}

// mgrGetManuallyGradedQuestionList:
// Called client-side in uiManualGrading.html. Returns a list of all 
// manually graded questions and their column numbers, for use in
// populating the pull-down select in the UI.
function mgrGetManuallyGradedQuestionList()
{
  var list_data = 
    {
      advance_by_question: false,
      question_text: [],
      question_col_nums: [],
    }
    
  if (!mgrInitGlobals())
    {
      return list_data;
    }
  
  var up = PropertiesService.getUserProperties();
  var adv_method = up.getProperty(USER_PROP_ADV_OPTION_MGR_ADVANCE_BY_QUESTION);
  
  if (adv_method === 'true')
    {
      list_data.advance_by_question = true;
    }
   
  // Grab the grading options row. We could initialize a new GWS object for this, but I'm trying to be
  // faster than that (for large data sets).
  var grading_opt_row = hidden_row_num_start_gbl + GRADES_HIDDEN_ROW_TYPE_GRADING_OPT;  
  var grading_opts = sheet_gbl.getRange(grading_opt_row, 1, 1, max_col_gbl).getValues()[0];
  var question_text = sheet_gbl.getRange(gbl_grades_start_row_num, 1, 1, max_col_gbl).getValues()[0];

  for (var i = (min_col_gbl - 1); i < grading_opts.length; i++)
    {
      var gopt = grading_opts[i];
        
      if (isManuallyGraded(gopt))
        {
          var qtxt = question_text[i];
          list_data.question_col_nums.push(i + 1);
          list_data.question_text.push(qtxt);
        }
    }
  
  return list_data;
}

// mgrGetNextManuallyGradedSubmission:
// Returns data for the next manually graded submission.
// Takes as argument the current column and row number (which corresponds to the 
// current question and student), and a 'direction' which is one of -1, 0, 1:
//     1: Return data for the student in the next row
//    -1: Return data for the student in the previous row
//     0: Return data for the student in the current row
function mgrGetNextManuallyGradedSubmission(current_col_num, current_row_num, direction)
{
  var data = 
    {
      student_identifiers: null,
      student_response: "",
      teacher_comment : "",
      score: 0,
      pts_possible: 0,
      row_num: gbl_grades_start_row_num + 1, // first possible row
      col_num: -1,
      status: 0,
    }
    
  if (!mgrInitGlobals())
    {
      data.status = -1;
      return data;
    }

  // check for valid row and col number. must be within the range of graded submissions.
  current_row_num = mgrCheckRowBounds(current_row_num);
  current_col_num = mgrCheckColBounds(current_col_num);

  data.col_num = current_col_num;
  data.row_num = current_row_num;
  
  if (direction > 0)
    {
      // step forwards
      if (data.row_num < grade_values_end_row_gbl)
        {
          data.row_num = current_row_num + 1;
        }
      else
        {
          data.row_num = gbl_grades_start_row_num + 1; // start over
        }
    }
  else if (direction < 0) // step backwards
    {
      if (data.row_num > (gbl_grades_start_row_num + 1))
        {
          data.row_num = current_row_num - 1;
        }
    }
  
  data.student_identifiers = mgrGetStudentIdentifiers(data.row_num);
  data.student_response = mgrFlubarooStudentResponse(data.row_num, data.col_num).toString(); // return as string here
  data.teacher_comment = mgrFlubarooTeacherComment(data.row_num, data.col_num);
  data.score = mgrGetStudentGrade(data.row_num, data.col_num);  
  data.pts_possible = mgrGetPointsPossible(data.col_num);
  data.answer_key = mgrGetAnswerKey(data.col_num);
  
  return data;
}

// mgrGetStudentIdentifiers:
// Returns the student identifiers for the given row number (given submission).
function mgrGetStudentIdentifiers(row_num)
{
  var sid_data = 
    {
      sid_ques: [],
      sid_value: [],
    }
 
  var grading_opt_row = hidden_row_num_start_gbl + GRADES_HIDDEN_ROW_TYPE_GRADING_OPT;
  var grading_opts = sheet_gbl.getRange(grading_opt_row, 1, 1, max_col_gbl).getValues()[0];
  var question_text = sheet_gbl.getRange(gbl_grades_start_row_num, 1, 1, max_col_gbl).getValues()[0];

  var response = sheet_gbl.getRange(row_num, 1, 1, max_col_gbl).getValues()[0];

  var min_col = 2;
  
  for (var i = (min_col - 1); i < grading_opts.length; i++)
    {
      var gopt = grading_opts[i];
      if (gopt == GRADING_OPT_STUD_ID)
        {
          var qtxt = question_text[i];
          sid_data.sid_ques.push(qtxt.toString());
          sid_data.sid_value.push(response[i].toString());
        }
    }
  
  return sid_data;
}

// mgrGetPointsPossible:
// For a given col_num (question), returns how many points its worth.
// Should be used only on column numbers corresponding to manually graded questions.
function mgrGetPointsPossible(col_num)
{  
  if (!mgrInitGlobals())
    {
      return -1;
    }
  
  var grading_opt_row = hidden_row_num_start_gbl + GRADES_HIDDEN_ROW_TYPE_GRADING_OPT;
 
  // get a valid range of columns  
  var grading_opts = sheet_gbl.getRange(grading_opt_row, 1, 1, max_col_gbl).getValues()[0];

  return getPointsWorth(grading_opts[col_num - 1]);
}

// mgrGetPointsPossible:
// For a given col_num (question), returns the value of the answer key.
// Should be used only on column numbers corresponding to manually graded questions.
function mgrGetAnswerKey(col_num)
{  
  var answer_key_row = hidden_row_num_start_gbl + GRADES_HIDDEN_ROW_TYPE_ANSWER_KEY;

  // get a valid range of columns 
  var answer_key_val = sheet_gbl.getRange(answer_key_row, 1, 1, max_col_gbl).getValues()[0];

  return answer_key_val[col_num - 1].toString(); 
}

// mgrSetStudentGrade:
// For the given column and row number (which corresponds to a specific question and submission),
// sets the value of the grade in the Grades sheet_gbl.
function mgrSetStudentGrade(col_num, row_num, value_to_set)
{  
  if (!mgrInitGlobals())
    {
      return -1;
    }
  
  // check for valid row and col number. must be within the range of graded submissions.
  var row_num_bounded = mgrCheckRowBounds(row_num);
  var col_num_bounded = mgrCheckColBounds(col_num);
  
  if (row_num_bounded != row_num)
    {
      return;
    }
  else if (col_num_bounded != col_num)
    {
      return;
    }
   
  sheet_gbl.getRange(row_num_bounded, col_num_bounded, 1, 1).setValue(value_to_set);
  
  return 0;
}

// mgrGetStudentGrade:
// For the given column and row number (which corresponds to a specific question and submission),
// returns the value of the grade in the Grades sheet_gbl.
function mgrGetStudentGrade(row_num, col_num)
{  
  var cell = sheet_gbl.getRange(row_num, col_num, 1, 1)
  
  // put focus on this cell
  sheet_gbl.setActiveRange(cell);
  
  return cell.getValue();
}

// mgrSetTeacherComment:
// Sets the teacher comment for the given col and row number (corresponding to a 
// specific question and student response).
function mgrSetTeacherComment(col_num, row_num, comment)
{   
  if (!mgrInitGlobals())
    {
      return -1;
    }
  
  if (comment === "Loading..." || comment === "")
    {
      return 0;
    }
  
  // assume valid row and col number, since this is called after mgrSetStudentGrade, which
  // checks for that.
  
  var teacher_comment_row = mgrGetHiddenRowNumber(sheet_gbl, row_num, num_graded_subm_gbl, num_stud_identifiers_gbl) + num_graded_subm_gbl;
  
  Debug.info("Setting teacher comment from row " + teacher_comment_row + ", and column " + col_num);
  
  sheet_gbl.getRange(teacher_comment_row, col_num, 1, 1).setValue(comment);
  
  return 0;
}

// mgrGetHiddenRowNumber
// Given a row number of a submission, returns the row number of the hidden row
// further down in the Grades sheet that contains the student's original response.
function mgrGetHiddenRowNumber(sheet_gbl, row_num, num_graded_subm_gbl, num_stud_identifiers_gbl)
{
  // For this row, find out the offset into the hidden rows.
  var offset_col_num = 1 + num_stud_identifiers_gbl + gbl_num_metrics_cols;
  
  var subm_copy_row_index = sheet_gbl.getRange(row_num, offset_col_num, 1, 1).getValue();

  var student_responses_start_row = hidden_row_num_start_gbl + gbl_num_hidden_rows + subm_copy_row_index;
  
  return student_responses_start_row;
}

// mgrCheckRowBounds:
// Given a row number, checks if it's within the proper bounds of the
// grade results in the Grades sheet_gbl. If so, returns the same value
// passed. If it is out of bounds, changes the value to be in bounds
// (either to the very first or very last possible value).
function mgrCheckRowBounds(row_num)
{  
  if (row_num < grade_values_start_row_gbl)
    {
      row_num = grade_values_start_row_gbl;
    }
  else if (row_num > grade_values_end_row_gbl)
    {
      row_num = grade_values_end_row_gbl;
    }
 
  return row_num;
}

// mgrCheckColBounds:
// Given a column number, checks if it's within the proper bounds of the
// grade results in the Grades sheet_gbl. If so, returns the same value
// passed. If it is out of bounds, changes the value to be in bounds
// (either to the very first or very last possible value).
function mgrCheckColBounds(col_num)
{
  if (col_num < min_col_gbl)
    {
      col_num = min_col_gbl;
    }
  else if (col_num > max_col_gbl)
    {
      col_num = max_col_gbl;
    }
  
  return col_num;
}

// mgrFlubarooStudentResponse:
// For the given row and col number, returns what the student's response was.
// For use only on manually graded questions. This function name starts with 'flubaroo'
// instead of 'mgr' because it is the version used by advanced Flubaroo users in their
// formulas.
function mgrFlubarooStudentResponse(row_num, col_num)
{  
  if (!mgrInitGlobals())
    {
      return -1;
    }
  
  // check for valid row and col number. must be within the range of graded submissions.
  row_num = mgrCheckRowBounds(row_num);
  col_num = mgrCheckColBounds(col_num);
  
  var student_responses_start_row = mgrGetHiddenRowNumber(sheet_gbl, row_num, num_graded_subm_gbl, num_stud_identifiers_gbl);
  
  return sheet_gbl.getRange(student_responses_start_row, col_num, 1, 1).getValue();
}

// mgrFlubarooTeacherComment:
// For the given row and col number, returns what the teacher's comment was.
// For use only on manually graded questions. 
function mgrFlubarooTeacherComment(row_num, col_num)
{   
  if (!mgrInitGlobals())
    {
      return -1;
    }
      
  // check for valid row and col number. must be within the range of graded submissions.
  row_num = mgrCheckRowBounds(row_num);
  col_num = mgrCheckColBounds(col_num);
  
  var teacher_comment_row = mgrGetHiddenRowNumber(sheet_gbl, row_num, num_graded_subm_gbl, num_stud_identifiers_gbl) + num_graded_subm_gbl;
  
  return sheet_gbl.getRange(teacher_comment_row, col_num, 1, 1).getValue().toString();
}

/**
 * Returns the student's response for the question and submission
 * at the specified row and column number in the Grades sheet.
 *
 * @param {number} row_num The row number where the equation is being entered. Just pass ROW() 
 * @param {number} col_num The column number where the equation is being entered. Just pass COLUMN()
 * @return The full text of the student's submission.
 * @customfunction
 */
function flubarooStudentResponse(row_num, col_num)
{
  /*
  var flock = LockService.getDocumentLock();
   
  try 
    {
      flock.waitLock(5000);
    }
  catch (e)
    {
      return "Lock Error!";
    }
  */
  var sr = mgrFlubarooStudentResponse(row_num, col_num);
  
  //flock.releaseLock();
  
  return sr;
}

/**
 * Returns the points possible for the question at the specified 
 * column number in the Grades sheet. This corresponds to the points
 * selected in Step 1 of grading.
 *
 * @param {number} col_num The column number where the equation is being entered. Just pass COLUMN()
 * @return The points possible as a number (i.e. 4).
 * @customfunction
 */
function flubarooPointsPossible(col_num)
{
  /*
  var flock = LockService.getDocumentLock();
  
  try 
    {
      flock.waitLock(5000);
    }
  catch (e)
    {
      return 0;
    }
  */
  
  var pp = mgrGetPointsPossible(col_num);
  
  //flock.releaseLock();
  
  return pp;
}