// categoryReport.gas
// =============
//
// This file contains all the code related to running/generating
// a Categories Report.


function runCategoriesReport()
{
  var ss =   ss = SpreadsheetApp.getActiveSpreadsheet();
  var gws = new GradesWorksheet(ss, INIT_TYPE_GRADED_PARTIAL, -1);

  var graded_subm = gws.getFirstGradedSubmission();
  
  for (var q = graded_subm.getFirstQuestion(); q != null; q = graded_subm.getNextQuestion(q))
    {
      Logger.log(q.getFullQuestionText() + " - " + q.getCategoryName());
    }
}

