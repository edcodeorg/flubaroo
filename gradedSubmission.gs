// File: graded_submission.gas
// Description: 
// This file contains the class for a graded submiaaion from a student.

// GradedSubmission class:
// The GradedSubmission class contains all the information about a submission
// that has been graded. A object in this class can be constructed in one of 
// two ways:
//  1) Passing in a row number from the Student Submissions sheet,
//     with init_type == INIT_TYPE_SUBM. The submission will be graded during
//     object construction.
//  2) Passing in a row number from Grades (already graded), with 
//     init_type == INIT_TYPE_GRADED_*. This method is used when reading in
//     entries from the Grades sheet.

function GradedSubmission(gws,
                          submissions_sheet, 
                          grades_sheet,
                          question_vals, 
                          help_tips_present, 
                          help_tips_vals,
                          grading_options, 
                          category_names,
                          points_possible,
                          answer_key_vals, 
                          answer_key_vals_lc, 
                          num_stud_id, 
                          num_gradeable_ques,
                          row_num, 
                          grades_row_num,
                          init_type)
{
  // TODO_AJR - Could do with description of what each of these members do?

  // Internal GradedWorksheet object. 
  this.gws = gws; 
  
  // Google Sheet object for submissions sheet.
  this.submissions_sheet = submissions_sheet;
  
  // Google Sheet object for grades sheet.
  this.grades_sheet = grades_sheet;
  
  // The values in the answer key (and lowercase).
  this.answer_key_vals = answer_key_vals;
  this.answer_key_vals_lc = answer_key_vals_lc;
  
  this.grading_options = grading_options;
  this.category_names = category_names;
  this.points_possible = points_possible;
  this.question_vals = question_vals;
  this.num_gradeable_questions = num_gradeable_ques;
  this.help_tips_present = help_tips_present;
  this.help_tips_vals = help_tips_vals;
  this.num_student_identifiers = num_stud_id;
  
  // Keep track of where each question's info is, indexed by
  // the unique full question text.
  
  this.question_hash = this.gws.question_hash; // just point to it.
  
  // Row number of the original student submission.
  // Only valid for INIT_TYPE_SUBM.
  this.row_num = row_num;
  
  // Row number in the Grades sheet indicating the row to which the submission
  // was written (INIT_TYPE_SUBM), or the row from which it was initialized
  // (INIT_TYPE_GRADED_*).
  this.grades_row_num = grades_row_num;
  
  // Mainly whether this submission comes from the submission sheet or 
  // the grades sheet.
  this.init_type = init_type;
  
  // Unique identifier for this user.
  this.fingerprint = null;
  
  // Array of submission values
  this.submission_vals;
  
  // Should only be true if a user 'edited' their form submission (via link).
  this.submission_edited = false;
  
  // Array of values for Grades sheet
  this.graded_vals;
  
  // Formulas read form the Grades sheet, incase someone is using them to calculate grades.
  // Will be the same length as the graded_vals array, but contain an empty string if
  // no formula was present in that cell.
  this.formulas = null;
  
  // For submissions with manually graded questions, this array will hold the value of
  // the teacher's comment for each question. If not comment, will contain an empty string.
  this.manually_graded_comments = null;
  
  // The total number of points this submission scored.
  this.score_points = 0;
  
  // This submission's score as a percentage of all scores.
  this.score_percent = 0.0;
  
  this.times_submitted = 1;
  
  // Set to "x" when a graded submission has been sent to a student.
  this.already_emailed = "";
  
  this.student_feedback = "";
  this.q_index = 0;
  this.subm_copy_row_index = 0;
 
  this.initGSVars();
}

GradedSubmission.prototype.initGSVars = function()
{
  if (this.init_type === INIT_TYPE_SUBM)
    {
      var num_questions = getNumQuestionsFromSubmissions(this.submissions_sheet);
          
      // Create an array to hold the graded values for each question.
      this.graded_vals = new Array(num_questions); // yet to be graded
      
      // create a placeholder array for formulas. this will hold any formulas
      // copied over from an existing Grades sheet, so they can be re-written
      // when this submission is written out to the new Grades sheet.
      this.formulas = newArrayWithValue(num_questions, "");

      // Read in the submission values from the 'Student Submissions' sheet.
      this.submission_vals = singleRowToArray(this.submissions_sheet,
                                              this.row_num, 
                                              num_questions,
                                              false);
      
      // No comments since no Grades sheet exists yet. Initialize to "".
      this.manually_graded_comments = newArrayWithValue(num_questions, "");
      this.manually_graded_comments[0] = "comments row"; // need something non-blank in the row.
      
      // Perform the actual grading!
      this.gradeIt();
    }
  else // INIT_TYPE_GRADED_*
    {
      // Initializing from an already graded row in 'Grades' sheet.
      this.graded_vals = singleRowToArray(this.grades_sheet, this.grades_row_num, -1, false);
      
      if (this.gws.hasManuallyGradedQuestion())
        {  
          this.formulas = singleRowToArray(this.grades_sheet, this.grades_row_num, -1, true);
        }
      else
        {
          this.formulas = newArrayWithValue(num_questions, "");
        }
      
      // Read in values for 'Times Submitted' and 'Already Emailed'.
      // Values for points and percent are recalculated in gradeIt().
      var metric_start_col = this.num_student_identifiers + 2; 
      var vindex = metric_start_col + METRIC_TIMES_SUBMITTED; // just past points and percent
      this.times_submitted = this.graded_vals[vindex - 1];
      vindex = metric_start_col + METRIC_EMAILED_GRADE;
      this.already_emailed = this.graded_vals[vindex - 1];
      
      Debug.info("initGSVars() - this.already_emailed = '" + this.already_emailed + "'");
      
      vindex = metric_start_col + METRIC_STUDENT_FEEDBACK;
      this.student_feedback = this.graded_vals[vindex - 1];
      vindex = metric_start_col + METRIC_SUBM_COPY_ROW_INDEX;
      this.subm_copy_row_index = this.graded_vals[vindex - 1];
      
      if (this.init_type == INIT_TYPE_GRADED_FULL)
        {
          // Read in hidden row of orig submissions.
          this.submission_vals = this.gws.getHiddenRow(GRADES_HIDDEN_ROW_TYPE_SUBMISSION_VALS,
                                                       this.subm_copy_row_index,
                                                       this.gws.getNumGradedSubmissions());
        }
      else
        {
          // We didn't read in copies of the submission vals. but at least for student identifiers,
          // we can just copy them from the graded vals.
          this.submission_vals = singleRowToArray(this.grades_sheet, this.grades_row_num, -1, false);
        }
      
      // Read in the manually graded comments, if any.
      if (this.gws.hasManuallyGradedQuestion())
        {
          Debug.info("getting manually graded comments @row " + this.subm_copy_row_index);
          this.manually_graded_comments = this.gws.getHiddenRow(GRADES_HIDDEN_ROW_TYPE_MANUALLY_GRADED_COMMENTS,
                                                   this.subm_copy_row_index,
                                                   this.gws.getNumGradedSubmissions());
          Debug.info("manually graded comments row: " + this.manually_graded_comments);
        }
      else
        {
          this.manually_graded_comments = newArrayWithValue(this.submission_vals.length, "");
          this.manually_graded_comments[0] = "comments row"; // need something non-blank in the row.
        }
            
      // Calculate total points and percent. This is done in gradeIt() for INIT_TYPE_SUBM
      this.score_points = 0;
      this.score_percent = 0.0;

      for (var q = this.getFirstQuestion(); q != null; q = this.getNextQuestion(q))
        {
          if (isWorthPoints(q.getGradingOption()))
            {         
              var is_num = (q.getGradedVal() !== "") && !isNaN(q.getGradedVal().toString());
              if (is_num)
                {
                  // add in how much this question is worth.
                  // we ensure it's a number, incase it's a blank cell b/c teacher
                  // hasn't yet graded a manually graded questions.
                  this.score_points += q.getGradedVal();
                }
            }
        }

      this.score_percent = this.score_points / this.points_possible;
    }
}

// gradeIt: Performs the grading of each question in one student's 
// submission. Returns nothing, but sets some private variables.
// This function is called by the GradedSubmission constructor
// for GradedSubmissions created during initial grading.
GradedSubmission.prototype.gradeIt = function()
{   
  // Private variables updated in this function.
  this.score_points = 0;
  this.score_percent = 0.0;
  
  // Compare the student's submission to each question to the same
  // submission in the answer key, subject to the grading options.
  
  for (var q=this.getFirstQuestion(); q != null; q = this.getNextQuestion(q))
    {    
      var grade_val = 0; // Default to 0 points.
      
      var gopt = q.getGradingOption();
      gopt = gopt.split("|")[0];  // pull out the type, separate from the pts worth
       
      var ak_val = q.getAnswerKeyText();      
      var anskey_is_formula = (typeof ak_val === 'string')
                               && (ak_val.substring(0, 2) == "%=");
      
      switch (gopt)
        {
          case GRADING_OPT_SKIP:
 
            // The teacher wants to skip grading on this question.
         
            if (q.isTimestamp())
              {
                // Echo the value back in the grades if it is 
                // a timestamp.
                grade_val = q.getFullSubmissionText();
              }
            else
              {
                // Flag this question as 'not graded'.
                grade_val = langstr("FLB_STR_NOT_GRADED");
              }
      
            break;
            
        case GRADING_OPT_COPY_FOR_REFERENCE:
            
            // The teacher just wants to copy this column to the Grads sheet, for reference.
            // It will not affect grading.
            var ref_val = q.getFullSubmissionText();
            if (typeof ref_val == "number" || (typeof ref_val == "string" && !isNaN(ref_val)))
              {
                ref_val = "'" + ref_val;
              }
            
            grade_val = ref_val;
            break;
            
        case GRADING_OPT_IGNORE:
            
            // This column will be completely ignored and hidden
            grade_val = "";
            break;    
    
        case GRADING_OPT_STUD_ID:
          
            // This answer identifies the student so just echo it back.
            grade_val = q.getFullSubmissionText();
            break;
   
        case GRADING_OPT_MANUAL:
        case GRADING_OPT_MANUAL_EC:
            
            if (anskey_is_formula)
              {
                // less typical case. write out the formula from answer key that will determine the score
                grade_val = ak_val.substring(1); // skip past the leading '%'
              }
            else
              {
                // default to empty string, since teacher has yet to grade it if we're here.
                grade_val = "";
              }
            break;
   
        case GRADING_OPT_NORMAL:
        case GRADING_OPT_NORMAL_EC:
        default:
            
             if (anskey_is_formula)
              {
                // less typical case. write out the formula from answer key that will determine the score
                grade_val = ak_val.substring(1);
              }
            else
              {
                // Question that is worth points. Grade it!
                grade_val = this.gradeSubmission(q);
          
                // Keep track of this students score.
                this.score_points += grade_val; 
              }
                        
            break;
      }

      // set the grade (in points) for this question in this submission.
      this.setGradedQuestionValByIndex(q.getQuesIndex(), grade_val);
      
    } // for q
    
  this.score_percent = this.score_points / this.points_possible;
}

// gradeSubmission: Helper function to grade the answer submited 
// for this question q and return the answer's grade.
GradedSubmission.prototype.gradeSubmission = function(q)
{  
  // Get the answer key for this submission and the value of the 
  // submission itself. 
  var submission = q.getFullSubmissionText();
  
  // clear off any leading or trailing whitespace from the submissions
  if (typeof submission === 'string')
    {
      submission = strTrim(submission).toLowerCase();
    }
  
  var key = q.getAnswerKeyLCText();

  var key_list; // Array of correct answers.
  var key_set;  // Dictionary of correct answers (for %cb).
  var found_to = false; // Found %to operator?
  var found_cb = false; // Found %cb operator?
  var cb_multiplier = 1.0;
  
  // Process the answer key.
  if (typeof key === 'string')
    {
      if ((key.search(ANSKEY_OPERATOR_CASE_SENSITIVE) == 0) && (key.length > 4))
        {
          // special case. case-sensitive (cs) grading.
          key = q.getAnswerKeyText(); // original case.
          key = key.substr(4); // skip past '%cs '
          key_list = [key];
          if (typeof submission === 'string')
            {
              submission = strTrim(q.getFullSubmissionText()); // original case
            }
        }
     
      else if (key.search(ANSKEY_OPERATOR_NUMERIC_RANGE) != -1)
        {
          // Found '%to' operator.
          key_list = this.processToInKey(key);
          
          if (key_list.length == 2)
            {
              // Found a %to operator with the correct number
              // of values.
              found_to = true;
            }
        }
      else if (key.search(ANSKEY_OPERATOR_PLUSMINUS) != -1)
        {
          key_list = this.processPlusMinusInKey(key);
          
          if (key_list.length == 2)
            {
              found_to = true;
            }
        }
      else if (key.search(ANSKEY_OPERATOR_OR) != -1)
        {          
          // Found '%or' operator.
          key_list = this.processOrInKey(key);
        }
      else if ((key.search(ANSKEY_OPERATOR_CHECKBOX) == 0) && (key.length > 4))
        {
          var regex = /^%cb(\d+)?(\.\d+)? *(.*)/i;

          var found = key.match(regex);

          //Debug.info("%cb matches: " + found[0] + " | " + found[1] + " | " + found[2] + " | " + found[3]);
          
          if (found[1])
            {
              // if %cb1.25, found[1] will be "1" and found[2] will be ".25"
              cb_multiplier = Number(found[1]);
              if (found[2])
                {
                  cb_multiplier += Number(found[2]);
                }
            }
          else if (found[2]) // no leading 0 (i.e. .25 vs 0.25)
            {
              cb_multiplier = Number(found[2]); // ex: .25
            }
          
          key_set = this.processCheckBoxInKey(found[3]);
          found_cb = true;
        }
      else
        {
          // No operators found so simply store the answer key 
          // as one element.
          key_list = [key];
        }
    }
  else
    {
      key_list = [key];
    }

  // Compare the answers found against those in the submission.
  
  var grade_val = 0; // Default to 0 points.
  
  if (found_to)
    {
      var submission_num = parseFloat(submission);
      
      // The answer key list contains two values that define a range.
      if (!isNaN(submission_num) && 
          (submission_num >= key_list[0] && submission_num <= key_list[1]))
      {
        // Correct answer!
        grade_val = getPointsWorth(q.getGradingOption());
      }      
    }
  else if (found_cb)
    {
      var pts_worth = getPointsWorth(q.getGradingOption());
      var set_size = Object.keys(key_set).length;
      var pts_each = pts_worth / set_size;
         
      var subm_set; 
      
      if (typeof submission === 'string')
        {
          subm_set = submission.split(",");
        }
      else
        {
          subm_set = [ submission.toString() ];
        }

      for (var i=0; i < subm_set.length; i++)
        {
          var subm_trimmed = strTrim(subm_set[i]);

          if (key_set.hasOwnProperty(subm_trimmed))
            {
              grade_val += pts_each;
            }
          else
            {
              grade_val = grade_val - (cb_multiplier * pts_each);
            }
        }
      
      // Don't let grade be negative.
      grade_val = Math.max(grade_val, 0);
      
      // Don't end-up with values in Grades sheet or emails like 0.999..., due to rounding.
      if ( (pts_worth - grade_val) < 0.01 )
        {
          grade_val = pts_worth;
        }
    }
  else
    {
      // Loop through the answer key list and compare the submission 
      // to each.
      for (var i = 0; i < key_list.length; i++)
        {
          //Debug.info("gradeSubmission(): comparing " + submission + " (type " + typeof submission + ") to " + key_list[i] + "(type " + typeof key_list[i] + ")");
          if (submission === "" || key_list[i] === "")
            {
              // Handle this case specially since otherwise it will eval to "false" when compared to a Boolean type below,
              // and could lead to questions being scored wrong. I could also fix by making the comparator below strict (===),
              // but it's been abstract (==) since the launch of Flubaroo, and changing it could lead to unintended consequences.
              if (submission === key_list[i])
                {
                  grade_val = getPointsWorth(q.getGradingOption());
                  break;
                }
            }
          else if (submission == key_list[i])
            {
              // Correct answer!
              //Debug.info("gradeSubmission(): match!");
              grade_val = getPointsWorth(q.getGradingOption());
              break;
            }
        }
    }
  
  return grade_val;
  
} // gradeSubmission()

// processToInKey: Helper function to process an answer key 
// with the %to operator in it and if the syntax is correct
// return a two value array describing the range, otherwise
// a single value array containing the whole key.
GradedSubmission.prototype.processToInKey = function(key) 
{
  // Seperate the values defined in the range.
  var parsed_key_list = key.split(ANSKEY_OPERATOR_NUMERIC_RANGE);
  var rv_key_list;
  
  switch (parsed_key_list.length)
    {
  
    case 0:
    case 1:
       
        // Less than two range values specified so 
        // just return the key.
        rv_key_list = [key];
        
    case 2:
    default:
         
        // If two or more values just take the first two and 
        // convert these string values into numbers.
        var num1 = parseFloat(parsed_key_list[0]);
        var num2 = parseFloat(parsed_key_list[1]);
        
        if (isNaN(num1) || isNaN(num2)) 
          {
            // One of the range values isn't a number so just 
            // return the key.
            rv_key_list = [key];
          }
        else
          {
            // Found a number range.
            rv_key_list = [num1, num2];
          }
      }
  
  return rv_key_list;
  
} // processToInKey ()

// processPlusMinusInKey: Helper function to process an answer key 
// with the %pm operator in it and if the syntax is correct
// return a two value array describing the range, otherwise
// a single value array containing the whole key.
GradedSubmission.prototype.processPlusMinusInKey = function(key) 
{
  // Seperate the values defined in the range.
  var parsed_key_list = key.split(ANSKEY_OPERATOR_PLUSMINUS);
  var rv_key_list;
  
  switch (parsed_key_list.length)
    {
  
    case 0:
    case 1:
       
        // Less than two range values specified so 
        // just return the key.
        rv_key_list = [key];
        
    case 2:
    default:
         
        // If two or more values just take the first two and 
        // convert these string values into numbers.
        var num1 = parseFloat(parsed_key_list[0]);
        
        // remove percent-sign at end of second number, if user included one (optional)
        parsed_key_list[1] = parsed_key_list[1].replace("%", "");
        var num2 = parseFloat(parsed_key_list[1]);        
        
        if (isNaN(num1) || isNaN(num2)) 
          {
            // One of the range values isn't a number so just 
            // return the key.
            rv_key_list = [key];
          }
        else
          {
            // Found a number range.
            // Treat second number as a percent (i.e. 1.5 = 1.5%).
            var pm_percent = num2 /= 100;
            var r1 = num1 * (1 - pm_percent);
            var r2 = num1 * (1 + pm_percent);
            rv_key_list = [r1, r2];
          }
      }
  
  return rv_key_list;
  
} // processToInKey ()


// processOrSubmission: Help function to process an answer key containing
// the %or operator. Returns an array of values.
GradedSubmission.prototype.processOrInKey = function(key)
{ 
  var parsed_key_list = key.split(ANSKEY_OPERATOR_OR);
  var rv_key_list = parsed_key_list;

  if (parsed_key_list.length < 2)
    {  
        // Less than two range values specified so 
        // just return the whole key as one element.
        rv_key_list = [key];
    }

  return rv_key_list;
  
} // processOrInKey()

// processCheckboxInKey: Help function to process an answer key containing
// the %cb operator. Returns an array of values.
GradedSubmission.prototype.processCheckBoxInKey = function(key)
{ 
  //var key_vals = key.substr(4); // skip past '%cb '; // not needed with new regex for multipliet
  var key_vals = key;
  
  var parsed_key_list = key_vals.split(",");

  var answer_set = {};
  for (var i=0; i < parsed_key_list.length; i++)
    {
      var a = strTrim(parsed_key_list[i]);
      answer_set[a] = "";  // just make it present
    }
  
  return answer_set;
  
} // processOrInKey()

GradedSubmission.prototype.getTimesSubmitted = function()
{
  return this.times_submitted;
}
  
GradedSubmission.prototype.setTimesSubmitted = function(ts)
{
  this.times_submitted = ts;
}

GradedSubmission.prototype.getAlreadyEmailed = function()
{
  return this.already_emailed;
}

GradedSubmission.prototype.getSubmissionEdited = function()
{
  return this.submission_edited;
}

GradedSubmission.prototype.getGradesRowNum = function()
{
  return this.grades_row_num;
}

GradedSubmission.prototype.setGradesRowNum = function(grades_row_num)
{
  return this.grades_row_num = grades_row_num;
}

// This gets set to "x" (the value written to the grades sheet) when 
// a student has already been emailed a graded submission.
GradedSubmission.prototype.setAlreadyEmailed = function()
{
  this.already_emailed = "x";
}

GradedSubmission.prototype.getSubmCopyRowIndex = function()
{
  return this.subm_copy_row_index;
}

GradedSubmission.prototype.setSubmCopyRowIndex = function(ri)
{
  this.subm_copy_row_index = ri;
}

GradedSubmission.prototype.getStudentFeedback = function()
{
  return this.student_feedback;
}

GradedSubmission.prototype.setStudentFeedback = function(feedback)
{
  this.student_feedback = feedback;
}

GradedSubmission.prototype.getScorePercent = function()
{
  return this.score_percent;
}
  
GradedSubmission.prototype.getScorePoints = function()
{  
  return this.score_points;
}
  
GradedSubmission.prototype.getTimestamp = function()
{
  return this.graded_vals[0];
}

GradedSubmission.prototype.getHelpTipsPresent= function()
{  
  return this.help_tips_present;
}
  
// getFirstQuestion / getNextQuestion
// Returns the next question for this submission (the first will be the time submitted question).
// A question returned by these accessors can be any question in the original form (including timestamp),
// but does not count extra columns added in the Grades sheet, such as Number of Times Submitted, Points, etc.
GradedSubmission.prototype.getFirstQuestion = function()
{
  var question = null;
  var i;
  
  for (i = 0; i < this.grading_options.length; i++)
    {
      // Don't return fake questions (metrics), like "num points" or "times submitted"
      // Note: Fake questions only happen when reading in from the Grades sheet. 
      //       These questions will have no grading option.
      if (this.grading_options[i] != "")
        {
          question = this.getQuestionByIndex(i);
          break;
        }
    }
  
  return question;
}

GradedSubmission.prototype.getNextQuestion = function(q)
{
  var g_ques = null;
  
  // start from the next question to be considered
  var i = q.getQuesIndex() + 1;
  
  for (; i < this.grading_options.length; i++)
    {
      // Don't return fake questions (metrics), like "num points" or "times submitted"
      // Note: Fake questions only happen when reading in from the Grades sheet. 
      //       These questions will have no grading option.
      if (this.grading_options[i] != "")
        {
          g_ques = this.getQuestionByIndex(i);
          break;
        }
    }
  
  return g_ques;
}
  
// Create a new question object from properties in the submission object.
GradedSubmission.prototype.getQuestionByIndex = function(ques_index)
{ 
  var is_timestamp = (ques_index === 0) ? true : false; 
  
  var help_tips_val = "";
  
  if (this.help_tips_present)
    {
      help_tips_val = this.help_tips_vals[ques_index];
    }
  
  var g_ques = new GradedQuestion(ques_index,
                                  this.question_vals[ques_index],
                                  this.submission_vals[ques_index],
                                  this.grading_options[ques_index],
                                  this.help_tips_present, 
                                  help_tips_val,
                                  this.answer_key_vals[ques_index],
                                  this.answer_key_vals_lc[ques_index],
                                  this.graded_vals[ques_index],
                                  this.formulas[ques_index],
                                  this.manually_graded_comments[ques_index],
                                  this.category_names[ques_index],
                                  is_timestamp);
  
  return g_ques;
}

GradedSubmission.prototype.getQuestionByFullQuestionText = function(full_ques_text)
{
  if (!this.question_hash.hasOwnProperty(full_ques_text))
    {
      // handle case when question isn't found.
      // only occurs if user changed the text of the question (in the form or submission sheet),
      // after having already graded. Then full text of question in Grades sheet won't match.
      return null;
    }
  
  var q_index = this.question_hash[full_ques_text];
  
  return this.getQuestionByIndex(q_index);
}

GradedSubmission.prototype.setGradedQuestionVal = function(q)
{
  //var q_index = q.getQuesIndex();
  var full_ques_text = q.getFullQuestionText();
  
  var q_index = this.question_hash[full_ques_text];
  
  this.graded_vals[q_index] = q.getGradedVal();
}

GradedSubmission.prototype.setGradedQuestionFormula = function(q)
{
  //var q_index = q.getQuesIndex();
  var full_ques_text = q.getFullQuestionText();
  
  var q_index = this.question_hash[full_ques_text];

  Debug.info("setting formula at q_index " + q_index);

  this.formulas[q_index] = q.getFormula();
}

GradedSubmission.prototype.setGradedQuestionValByIndex = function(q_index, q_val)
{  
  this.graded_vals[q_index] = q_val;
}

GradedSubmission.prototype.setGradedQuestionComment = function(q)
{
  var full_ques_text = q.getFullQuestionText();
  
  var q_index = this.question_hash[full_ques_text];
  this.manually_graded_comments[q_index] = q.getGradedTeacherComment();
}

/*
GradedSubmission.prototype.setGradedQuestionFormulaByIndex = function(q_index, q_formula)
{  
  this.formulas[q_index] = q_formula;
}
*/
  
// createRowForGradesSheet:
// A GradedSubmission contains information about the actual grades for
// a given submission, as well as information such as the questions asked,
// the answer key, and the grading options used. Much of this information
// is written out to the Grades sheet in one row or another.
// To help produce that formatted output for the Grades sheet, this function
// creates a row that's ready to be written to the 'Grades' sheet, starting from
// the first column. The argument indicates the type of row to be written.
// Valid values for output_row_type are:
//
//    GRADES_OUTPUT_ROW_TYPE_GRADED_VALS:              Student Identifiers, Metrics, Grades (most prolific)
//    GRADES_OUTPUT_ROW_TYPE_QUESTIONS_HEADER:         Header row with summaries of each question
//    GRADES_OUTPUT_ROW_TYPE_QUESTIONS_FULL:           Full text of each question (hidden row)
//    GRADES_OUTPUT_ROW_TYPE_SUBMISSION_VALS:          Original submissions made by the student (hidden row)
//    GRADES_OUTPUT_ROW_TYPE_ANSWER_KEY:               Full answers from the answer key submission (hidden row)
//    GRADES_OUTPUT_ROW_TYPE_GRADING_OPT:              Grading options for each question (hidden row)
//    GRADES_OUTPUT_ROW_TYPE_HELP_TIPS:                Optional help tips, copied over from 
//                                                     the Student Submissions sheet (hidden row).
//    GRADES_OUTPUT_ROW_TYPE_MANUALLY_GRADED_COMMENTS  Any comments made by teacher when grading by hand.
//    GRADES_OUTPUT_ROW_TYPE_CATEGORY_NAMES            List of category names. Goes in row GRADES_CATEGORY_NAMES_ROW_NUM.
//
//
// The function also takes an output_row_num, which is needed when generating equations for
// the Grades sheet.
GradedSubmission.prototype.createRowForGradesSheet = function(output_row_type, output_row_num)
{
  var output_row = new Array(1);
  var data_vals;
  
  if ((output_row_type != GRADES_OUTPUT_ROW_TYPE_GRADED_VALS) && (output_row_type != GRADES_OUTPUT_ROW_TYPE_SUBMISSION_VALS))
    {
      Debug.info("createRowForGradesSheet() - output_row_type = " + output_row_type + ", output_row_num = " + output_row_num);
    }
  
  if (output_row_type == GRADES_OUTPUT_ROW_TYPE_GRADED_VALS)
    {
      data_vals = this.graded_vals.slice(0); // clone, since we may change entries below
 
      // If we're writing out any formulas (set by setGradedQuestionFormula()), then 
      // copy those into the data_vals array.
      for (var i=0; i < data_vals.length; i++)
        {         
         if (this.formulas[i] !== "")
            {
              data_vals[i] = this.formulas[i];
            }
        }
    }
  else if (output_row_type == GRADES_OUTPUT_ROW_TYPE_QUESTIONS_HEADER ||
           output_row_type == GRADES_OUTPUT_ROW_TYPE_QUESTIONS_FULL)
    {
      data_vals = this.question_vals;
      Debug.info("createRowForGradesSheet() - creating header row with data: " + data_vals);
      Debug.info("createRowForGradesSheet() - this.grading_options: " + this.grading_options);
    }
  else if (output_row_type == GRADES_OUTPUT_ROW_TYPE_ANSWER_KEY)
    {
      data_vals = this.answer_key_vals;
    }
  else if (output_row_type == GRADES_OUTPUT_ROW_TYPE_SUBMISSION_VALS)
    {
      data_vals = this.submission_vals;
    }
  else if (output_row_type == GRADES_OUTPUT_ROW_TYPE_GRADING_OPT)
    {
      data_vals = this.grading_options;
    }
  else if (output_row_type == GRADES_OUTPUT_ROW_TYPE_MANUALLY_GRADED_COMMENTS)
    {
      data_vals = this.manually_graded_comments;
    }
  else if (output_row_type == GRADES_OUTPUT_ROW_TYPE_CATEGORY_NAMES)
    {
      data_vals = this.category_names;
    }
  else if (output_row_type == GRADES_OUTPUT_ROW_TYPE_HELP_TIPS)
    {
      if (!this.help_tips_present)
        {
          // Output entirely blank row.
          data_vals = new Array(this.submission_vals.length);
          for (var i=0; i < data_vals.length; i++)
            {
              // Need to create a new array for this, otherwise
              // data_vals will point to the first submission.
              data_vals[i] = "";
            }
        }
      else
        {
          // Use the help tips provided in row #2.
          data_vals = this.help_tips_vals;
        }
    }
  
  // First write out the timestamp.
  output_row[0] = data_vals[0]; 
   
  // Follow with all student identifiers.
  for (var i = 1; i < this.grading_options.length; i++)
    {
      if (this.grading_options[i] == GRADING_OPT_STUD_ID)
        {
          if (output_row_type == GRADES_OUTPUT_ROW_TYPE_QUESTIONS_HEADER)
            {
              Debug.info("createRowForGradesSheet() - About to add student identifier [i] = " + i);
              output_row.push(createQuestionSummary(data_vals[i]));
            }
          else
            {
              output_row.push(data_vals[i]);
            }
        }
    }
   
   // If a row for a graded submission, write out all the metrics, such as 
   // score in points, score in percent, and number of times submitted.
   if (output_row_type == GRADES_OUTPUT_ROW_TYPE_GRADED_VALS)
     {
       var eqn;
       
       // Next write the total score as points and percent.
       var start_col_num = 1 + this.num_student_identifiers + gbl_num_metrics_cols + 1;
       var end_col_num = start_col_num + this.num_gradeable_questions - 1;
       var start_col = convertColNumToColLetter(start_col_num);
       var end_col = convertColNumToColLetter(end_col_num);
       eqn = "=sum(" + start_col + output_row_num + ":" + end_col + output_row_num + ")";
       output_row.push(eqn);
       
       start_col_num = 1 + this.num_student_identifiers + 1;
       start_col = convertColNumToColLetter(start_col_num);
       eqn = "=" + start_col + output_row_num + "/" + this.points_possible;
       output_row.push(eqn);
     
       // Next the number of times this student made a submission.
       output_row.push(this.times_submitted);
       
       // Next whether or not we've email a grade for this student.
       output_row.push(this.already_emailed);
       
       // Next push any feedback to send the student.
       output_row.push(this.student_feedback);
       
       // Last push the row number of the (hidden) copy of the original submission.
       output_row.push(this.subm_copy_row_index);
     }
  
   // If the header row, include the names of the metrics.
   else if (output_row_type == GRADES_OUTPUT_ROW_TYPE_QUESTIONS_HEADER)
     {
       // Include column names for the various metrics reported for each graded submission.
       output_row.push(langstr("FLB_STR_GRADES_SHEET_COLUMN_NAME_TOTAL_POINTS"));
       output_row.push(langstr("FLB_STR_GRADES_SHEET_COLUMN_NAME_PERCENT"));
       output_row.push(langstr("FLB_STR_GRADES_SHEET_COLUMN_NAME_TIMES_SUBMITTED"));
       output_row.push(langstr("FLB_STR_GRADES_SHEET_COLUMN_NAME_EMAILED_GRADE"));
       output_row.push(langstr("FLB_STR_GRADES_SHEET_COLUMN_NAME_STUDENT_FEEDBACK"));
       output_row.push("FOR FLUBAROO - DO NOT EDIT"); // subm copy row number
     }
  
   // Not a header row or graded values row, so no values to write for these metrics,
   // instead just record blanks in the columns where the metrics go.
   else  
     {
       for (var i = 0; i <  gbl_num_metrics_cols; i++)
         {
           output_row.push("");
         }
     }
  
  // Lastly, follow with the actual questions (non student ids).
  // For each write out the score in points or the original 
  // submission (depending on row type)
  for (var i = 1; i < this.grading_options.length; i++)
    {
      if (this.grading_options[i] != GRADING_OPT_STUD_ID)
        {
          if (output_row_type == GRADES_OUTPUT_ROW_TYPE_QUESTIONS_HEADER)
            {
              if (this.grading_options[i] == GRADING_OPT_COPY_FOR_REFERENCE)
                {
                  // prepend a special token that lets Flubaroo know to format the font on
                  // this text when writing out the row. Also add "//" characters before and after the question, to make 
                  // it unique (to avoid conflict with a Grade By Hand question with the same question text).
                  output_row.push(FLB_COLFORMAT_WRAP_TEXT + FLB_COLFORMAT_GREY_ITALIC_TEXT + "// " + createQuestionSummary(data_vals[i]) + " //");
                }
              else if (this.grading_options[i] == GRADING_OPT_IGNORE)
                {
                  // let Flubaroo know to hide this column when writing it out.
                  output_row.push(FLB_COLFORMAT_HIDDEN + FLB_COLFORMAT_GREY_ITALIC_TEXT + "// " + createQuestionSummary(data_vals[i]) + " //");
                }
              else
                {
                  // just a normal column for the heade row. copy a summary of the question asked.
                  output_row.push(createQuestionSummary(data_vals[i]));
                }              
            }
          else
            {
              // not the header row
              output_row.push(data_vals[i]);
            }
        }
    }

  if ((output_row_type != GRADES_OUTPUT_ROW_TYPE_GRADED_VALS) && (output_row_type != GRADES_OUTPUT_ROW_TYPE_SUBMISSION_VALS))
    {
      Debug.info("createRowForGradesSheet() - done writing row");
    }
  
   return output_row;
 }


GradedSubmission.prototype.getSubmFingerprint = function()
{
  if (this.fingerprint !== null)
    {
      return this.fingerprint;
    }
  
  this.fingerprint = "";
  
  var q = this.getFirstQuestion();

  Debug.assert_w(q !== null, 
                 "GradedSubmission.getSubmFingerprint() - no questions");
  
  for (; q !== null; q = this.getNextQuestion(q))
    {
      if (q.getGradingOption() === GRADING_OPT_STUD_ID)
        {  
          var val = q.getFullSubmissionText();

          if (val === "")
            {
              // sometimes happens if email column is blank
              continue;
            }
           
          if (typeof val !== 'string')
            {
              val = val.toString();
            }
          
          val = val.toLowerCase();
          
          this.fingerprint = this.fingerprint + val;
        }
    }
  
  Debug.info("GradedSubmission.getSubmFingerprint() - fingerprint: " + this.fingerprint);
  
  Debug.assert(this.fingerprint !== "", 
               "GradedSubmission.getSubmFingerprint() - fingerprint not created"); 
  
  return this.fingerprint;
}
 
GradedSubmission.prototype.recordEmailSentInGradesSheet = function()
{
  var metric_start_col = 2 + this.num_student_identifiers;
  var col_num = metric_start_col + METRIC_EMAILED_GRADE;
  setCellValue(this.grades_sheet, this.grades_row_num, col_num, "x");
}

GradedSubmission.prototype.hasCategories = function()
{
  return (this.category_names.length > 0);
}
