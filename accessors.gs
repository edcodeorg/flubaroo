// File: accessors.gas
// Description: 
// This file contains functions that access data in the
// 'Student Submissions' and 'Grades' sheets. 
// Functions in this file are meant to centralize and obfuscate private 
// information about where different fields (like hidden rows) are stored.
// Other functions that simply make spreadsheet access easier
// (e.g. getCellValue), but which don't utilize private info, should be
// placed in the 'utilities.gas' file instead of this one.
 
 // getNumQuestionsFromSubmissions:
 // Given a reference to the submissions sheet, calculates and returns the number
 // of questions that were asked in the assignment, including the implicit
 // "Timestamp" question.
 function getNumQuestionsFromSubmissions(subm_sheet)
 { 
   // Write the question values into an array.   
   var n_ques = subm_sheet.getLastColumn();
   
   var question_vals = singleRowToArray(subm_sheet, 1, n_ques, false);
   
   // Remove any blank columns at the end, which may have been created by the user 
   // rearranging the columns.
   var i = question_vals.length - 1;
   
   for (; i >= 0; i--, n_ques--)
     {
       if (question_vals[i] !== "")
         {
           break;
         }
     }

   return n_ques;
 }


function getQuestionValsFromSubmissions(subm_sheet)
{
  var n_ques = subm_sheet.getLastColumn();
  
  var num_ques = getNumQuestionsFromSubmissions(subm_sheet);
  
  var question_vals = singleRowToArray(subm_sheet, 1, num_ques, false);
  
  question_vals[0] = langstr("FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME");
  
  return question_vals;
}

 // getSheetWithSubmissions:
 // Finds the sheet in the active spreadsheet with the submissions from the form,
 // and returns an instance of it. If not found, returns null.
 function getSheetWithSubmissions(ss)
 {
   var sheet = getSheetWithSubmissionsInternal(ss);
   
   // handle GAS bug
   if (sheet === null)
     {
       // Try again. may be bug in GAS. Line below prevents occurence of this bug:
       //    https://code.google.com/p/google-apps-script-issues/issues/detail?id=2559
       ss.setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]);
     }
   
   sheet = getSheetWithSubmissionsInternal(ss);
   
   //Debug.assert(sheet !== null, "getSheetWithSubmissions() - can't open submissions sheet");   
   
   return sheet;
 }

function getSheetWithSubmissionsInternal(ss)
{
   var up = PropertiesService.getUserProperties();
  
   var sheet = ss.getSheetByName(langstr("FLB_STR_SHEETNAME_STUD_SUBM"));
   
   if (sheet === null)
     {
       // could be that user switch languages since older version.
       // just check with old (pre v3.0) name ("Student Submissions")
       // for backwards compatability.
       sheet = ss.getSheetByName(gbl_subm_sheet_name);
       
       // if not english, then rename old style name to localized
       // version.
       var lang_id = up.getProperty(USER_PROP_LANGUAGE_ID);
       
       if ((sheet != null) && (lang_id != null) && (lang_id != 'en-us'))
         {
           sheet.setName(langstr("FLB_STR_SHEETNAME_STUD_SUBM"));
         }
     }
         
   return sheet;
 }

// TODO_AJR - This gets called a lot, leaving lots of places for 
// checks for whether or not a grades sheet exists. This needs 
// reviewing.

// getSheetWithGrades:
// Finds the sheet in the active spreadsheet with the grades,
// and returns an instance of it. If not found, returns null.
function getSheetWithGrades(ss)
{
  var sheet = getSheetWithGradesInternal(ss);
  
  if (sheet === null)
    {
      // Try again. may be bug in GAS. Line below prevents occurence of this bug:
      //    https://code.google.com/p/google-apps-script-issues/issues/detail?id=2559
      ss.setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]);
    }
    
  sheet = getSheetWithGradesInternal(ss);
  
  return sheet;
}

function getSheetWithGradesInternal(ss)
{
   var up = PropertiesService.getDocumentProperties();
  
   var sheet = ss.getSheetByName(langstr("FLB_STR_SHEETNAME_GRADES"));
  
   if (sheet === null)
     {
       // could be that user switch languages since older version.
       // just check with old (pre v3.0) name ("Student Submissions")
       // for backwards compatability.
       sheet = ss.getSheetByName(gbl_grades_sheet_name);
       
       // if not english, then rename old style name to localized
       // version.
       var lang_id = up.getProperty(USER_PROP_LANGUAGE_ID);
       
       if ((sheet != null) && (lang_id != null) && (lang_id != 'en-us'))
         {
           sheet.setName(langstr("FLB_STR_SHEETNAME_GRADES"));
         }
     }
  
   return sheet;
}

function gotSheetWithGrades(ss)
{
  return getSheetWithGrades(ss) !== null;
  
} // gotSheetWithGrades()


function getSheetWithCategories(ss)
{
  var category_sheet_name = langstr("FLB_STR_CATEGORIES_SHEET_NAME");

  var sheet = ss.getSheetByName(category_sheet_name);
  
  return sheet; // null if not present.
}
