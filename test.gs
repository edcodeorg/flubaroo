
function testui()
{  
  return UI.showStep1Grading();
}


// test.gas.gs
// ===========

TESTS_QA_SHEET_ID = "0AhRtIprIrwuzdGFtUTBpb1ljWGhQYnZHcWhHcGo1Z2c";
TESTS_NUM_ROWS = 57;
TESTS_NUM_COLS = 37;

// Offset into array for submission times.
TESTS_SUBMISSION_TIME_START = 7;
TESTS_SUBMISSION_TIME_END = 51;

// runTests()
// ---------- 

// TODO_AJR - Ultimately we want one of these for each file/class.

unitTestFunctions = 
[
  testQAGradesSheet,
  testDebugClass,
  testNumGradedSubm
]

function runTests()
{
  Debug.info("runTests()");

  var passed = true;
  var i = 0;
  
  for (; i < unitTestFunctions.length; i++)
    {
      if (!unitTestFunctions[i]())
        {
          passed = false;
        }
    }

  var result = passed ? "PASSED" : "FAILED";
  Debug.info("runTests() - TESTS " + result);
  Browser.msgBox("TESTS " + result + ". See trace log");

} // runTests()

// testGradesSheet()
// -----------------
//
// To test the grading feautures of Flubaroo the submission
// sheet from the "Flubaroo QA Spreadsheet" need to be copied 
// into the submission sheet and the resulting grades sheet is 
// compared against the manually checked results.
//
// See http://www.edcode.org/kb/flubaroo/testing-your-changes
// for details although a newer answer sheet was needed - as 
// described by the ID above.
//
// When grading:
//
//   Q1: 3 points
//   Q10: 4 points
//   Q24: Skip Grading
//   Q25: 5 points
//   All other questions: 1 point (except student identifiers)
//   Row 3 (with Full Name of "Answer Key") is the answer key to be used in Step 2.
//
// The spreadsheet need to be set to the local timezone for the 
// date comparisons to work (File>Spreadsheet settings...).

function testQAGradesSheet() 
{
  Debug.info("testQAGradesSheet()");

  // Read in the calculated grades sheet.
  var results = SpreadsheetApp.getActiveSpreadsheet()
                              .getSheetByName(gbl_grades_sheet_name)
                              .getRange(1, 1, TESTS_NUM_ROWS, TESTS_NUM_COLS)
                              .getValues();

  // Read in the same from the QA sheet.
  var answers = SpreadsheetApp.openById(TESTS_QA_SHEET_ID)
                              .getSheetByName(gbl_grades_sheet_name)
                              .getRange(1, 1, TESTS_NUM_ROWS, TESTS_NUM_COLS)
                              .getValues();
          
  var expected;
  var actual;

  // Compare the results against the answers.
  for (var i = 0, passed = true; i < TESTS_NUM_ROWS; i++)
    {
      for (var j = 0; j < TESTS_NUM_COLS; j++)
        {        
          expected = answers[i][j];
          actual = results[i][j];
         
          if (j === 0 && 
              (i >= TESTS_SUBMISSION_TIME_START && i <= TESTS_SUBMISSION_TIME_END))
            {
              // This is a submission times so ignore these as they 
              // are always different - some time zone stuff going on.
              // TODO_AJR - Bring these tests back in.
              continue;
            }
         
          if (actual !== expected)
            {
              Debug.info("testQAGradesSheet() - TEST FAILED: " + 
                        "[" + (i + 1) + "]" + 
                        "[" + (j + 1) + "] - " + " " +
                        "Expected: " + expected + " " +
                        "Actual: " + actual);
                        
              passed = false;
            }
        }        
    }
  
  return passed;
  
} // testQAGradesSheet()