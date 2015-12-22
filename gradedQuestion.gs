// File: graded_question.gas
// Description:
// This file contains the class for a graded question.

// GradedQuestion class:
// Contains information about a question that can be, or has been, graded.
function GradedQuestion(ques_index, full_question_text, full_subm_text, gopt,
                        help_tips_present, help_tips_val,
                        full_anskey_text, full_anskey_text_lc,
                        graded_val, formula, manually_graded_teacher_comment, is_timestamp)
{
  this.full_question_text = full_question_text;
  this.full_subm_text = full_subm_text;
  this.gopt = gopt;
  this.full_anskey_text = full_anskey_text;
  this.full_anskey_text_lc = full_anskey_text_lc;
  this.graded_val = graded_val;
  this.formula = formula;
  this.is_timestamp = is_timestamp;
  this.help_tips_present = help_tips_present;
  this.help_tips_val = help_tips_val;
  this.manually_graded_teacher_comment = manually_graded_teacher_comment;

  // This ties the question back to the GradedSubmission it originates from, in which all
  // information about questions are stored in linear arrays. This is the index into that array.
  this.ques_index = ques_index;
}

GradedQuestion.prototype.getGradedVal = function()
{
  return this.graded_val;
}

GradedQuestion.prototype.getFormula = function()
{
  return this.formula;
}

GradedQuestion.prototype.hasFormula = function()
{
  return (this.formula != "");
}

GradedQuestion.prototype.setGradedVal = function(graded_val)
{
  this.graded_val = graded_val;
}

GradedQuestion.prototype.setFormula = function(formula)
{
  return this.formula = formula;
}

GradedQuestion.prototype.getFullQuestionText = function()
{
  return this.full_question_text;
}

GradedQuestion.prototype.getAnswerKeyText = function()
{
  return this.full_anskey_text;
}

GradedQuestion.prototype.getAnswerKeyLCText = function()
{
  return this.full_anskey_text_lc;
}

GradedQuestion.prototype.getFullSubmissionText = function()
{
  return this.full_subm_text;
}

GradedQuestion.prototype.getGradingOption = function()
{
  return this.gopt;
}

GradedQuestion.prototype.isTimestamp = function()
{
  return this.is_timestamp;
}

GradedQuestion.prototype.getQuesIndex = function()
{
  return this.ques_index;
}

GradedQuestion.prototype.getHelpTip = function()
{
  if (this.help_tips_present)
    {
      return this.help_tips_val;
    }
  else
    {
      return "";
    }
}

GradedQuestion.prototype.getGradedTeacherComment = function()
{
  return this.manually_graded_teacher_comment;
}
