// Change Log:
//   Version 1.0, 3/7/11: Initial release
//   Version 1.1, 3/22/11: Fixed bug with emailing of grades
//                         and added percent column.
//   Version 1.2, 6/28/11: Fixed serverChangeHandler problem,
//                         and whitespace problem.
//   Version 1.3, 11/30/11: Added Google Analytics tracking
//   Version 2.0, 1/17/12:  Major rewrite and feature additions. See blog
//                         post (flubaroo.com/blog) for list of new features. Internally,
//                         got rid of need for findPresentedQuestion
//                         function by changing grading options row.
//                         Added extra hidden rows to make 'Grades' self-contained.
//                         Broke 'flubaroo.gas' into multiple files.
//   Version 2.1, 11/29/12: Fixes for issues 8 and 9.

/*   Version 3.0, 6/24/13:
     Many changes in this version. The code has been compltely re-written from scratch
     (an effort which started a year ago) to make it easier to modify and extend by myself
     and others. Also:
      
      Bug / Issue fixes:
      - Fix for recent bug in which Flubaroo runs forever (sheet reference issue)
      - Issue 1 resolved
      
      New Features:
      - Flubaroo won't re-email students who have already been emailed (Issue 2).
      - Flubaroo can now send an optional help tip per question to students in the email (Issue 3).
*/                

//   Version 3.01, 6/26/13: Quick fix for answer key issue reported (issue 37).
//   Version 3.02, 11/1/13: Fix for issues 39, 65, and 66. 
//   Version 3.1, 1/2/14: Implementation of number ranges by Andrew Roberts (issue 42), andrewroberts.net.
//   Version 3.11 1/8/14: Quick fix for issue that affects TRUE/FALSE question types, introduced in 3.1.

//   Version 12 3/11/14: First release for new Google sheets & Add-ons. Introducing new, simpler versioning scheme (just a number). 
//                       Functinally the same as version 3.11, with the exception of some improved error handling.

//   Version 13 6/9/14: Fixed %or bug (issue 86), fixed minor issue with "Incorrect" text in emails sent, and modified 
//                      multiple language support to make it easier for contributors to localize Flubaroo. Added in notice
//                      if user is over their daily email quota. Also added in translations for Swedish, Dutch, and Russian.
//
//   Version 14 7/18/14: Introduced translations for French, French-Canadian, and Hebrew.
//   Version 15 8/31/14: Introduced %cs operator for case-sensitive grading (Issue #20).
//   Version 16 10/29/14: Changes auth dialog (on install) to clarify that Flubaroo only accesses info in the spreadsheets
//                        where it's installed.
//   Version 17 12/5/14: Launch of autograde feature! Also introduced advanced option menu.
//   Version 18 12/6/14: Small modification to speed-up autograding when there are multiple concurrent submissions.
//   Version 19 12/10/14: Fixing issue where autograde can't be disabled due to missing formSubmit trigger.
//                       Also reverted lock logic to how Andrew had it in his branch, as seeing some user-reported errors.
//   Version 20 12/12/14: Added fieldlog functionality. Also created new, simpler non-auth menu to clearup confusion
//                        on why Autograde couldn't be setup initially in a sheet where Flubaroo hadn't been used yet.
//                        Lastly, added extra code to ensure that (a) autograde can always be disabled and (b) multiple
//                        onSubmit triggers don't somehow pile up.
//   Version 21 12/15/14: Removed "toast" notification about autograde from onOpen. Fixed a properties issue when 
//                        writing grades that was affecting assignments with > 200 submissions.
//   Version 22 12/16/14: Added gradesSheetIsValid() check to ensure we dont' die trying to read invalid Grades sheet.
//                        Added Autograde.stillRunning() to fix issue with menu when autograde dies and leaves RUNNING
//                        property set.
//   Version 23 3/8/15:   Added Flubaroo Tips when grading completes.
//   Version 24 3/26/15:  Changed locking mechanism for autograde.
//   Version 25 4/1/15:   Removed code to delete all existing triggers when turning on autograde. This wasn't local to
//                        the sheet, and was actually disabling autograde across multiple sheets.
//   Version 26: 4/23/15: Added Polish language.
//   version 27: 7/1/15:  Updated URLs for images hosted on App Engine.
//   Version 28: 7/13/15: Added backup Grades sheet for autograde, and additional debugging, to catch autograde issue.
//   Version 29: 7/16/15: Quick fix for autograde backup. Delete old backup sheet first, if one exists.
//   Version 30: 7/20/15: Manual grading, recall grading options in Step 1 & 2 (with HTML UI), speed improvements.
//                        Also Portuguese and Danish lanuages.
//   Version 31: 7/21/15: Quick fix for menu generation when Grading by Hand is on for one or more questions.
//   Version 32: 7/21/15: Quick fix to gracefully handle case when user changes text of question in submissions sheet.
//                        Also added Czech language.
//   Version 33: 7/22/15: Update to the logic to detect non-unique questions. Made less error-prone.
//   Version 34: 7/22/15: Update to custom function flubarooStudentResponse.
//   Version 35: 7/23/15: Changed "," to ";" in countif formulas to work in multiple regions (US + Europe).
//   Version 36: 7/24/15: Disable autograde (and inform owner) if it was on during latest upgrade.
//   Version 37: 7/26/15: New logic around custom formulas. Added fieldreset. 
//                        Turned off Logger.log if debugOn = false.
//   Version 38: 8/21/15: Rollback number of graded submissions property if autograde fails. Turn on fieldlog for all
//                        grading for now (as hidden sheet) to help debug issues being seen. Set max fieldlog to 50k rows.
//                        Improved detection of invalid Grade sheet.
//   Version 39: 9/17/15: Fix for numeric types (non-strings) in Manually Graded questions.
//   Version 40: 11/9/15: Result of Sprint #1 during CSE rotation. Addressed issues with spaces after email, 
//                        and corrupted grades sheet. Also put formula in A1 of Grades sheet to locate hidden rows.
//   Version 41: 11/5/15: Fixed formula in A1 to be internationalied version (semi-colons). Also fix for autograde that broke in v40.
//   Version 42: 11/17/15: Experimental version of "Share grades" via Google Docs and printable grade report. Minor fix for autograde.
//   Version 43: 12/1/15: Updated all missing language strings, and finalized Share and Print grades features after testing.
//   Version 44: 12/2/15: Increased width of email grades UI by 20 px to accomodate Spanish which was pushing Continue button out of bounds.
//   Version 45: 12/9/15: Launched extra credit questions and support for checkbox questions (%cb). Also cleaned up "%" operators in emails.
//   Version 46: 12/14/15: Fixed Internet Explorer issue (.includes not supported in Strings), and apostrophee issue with Drive files. 
//   Version 47: 12/21/15: Fixed 3 %cb bugs (died on numbers, didn't mark incorrect response if first in list, recorded 0.9999... instead of 1),
//                         and now call doc.saveAndClose() when writing Drive Docs.
//   Version 48: 5/9/16:   New Autograde that processes only latest submissions. Support for %= formulas. Added translations.
//   Version 49: 5/10/16:  Added new "Ignore" and "Copy for Reference" options.
//   Version 50: 5/11/16:  Sped up "Grade by Hand" tool, added %cs[mult], and colored optional Student Feedback column.
//   Version 51: 5/16/16:  Autograde now reads in answer key from stored property, instead of from Student Submissions sheet each time.
//                         This is to avoid grading errors if/when the answer key row shifts due to Google forms funnyness.
//   Version 52: 5/19/16:  Added more translated strings for Italian, Spanish, Dutch, Finnish and French (fr). Also updated
//                         message that shows on sheet enable to have link to flubaroo.com.
//   Version 53: 6/10/16:  Added new user message for very first install, directing users to Flubaroo.com. Updated next tip # counter to use
//                         user property vs doc property.
//   Version 54: 7/1/16:   Fixed issue with %= when grades shared. Ensures that first install welcome message is only ever shown once.
//   Version 55: 11/29/16: Large update with many improvements to sending emails, including ability to select which questions to
//                         include, whether to show student's own response, ability to customize if/how summary of points is shown
//                         at top of shared doc/email, and ability to include stickers. Also ability to customize "Flubaroo Grader" field,
//                         ability to include answer key with Grade by Hand questions (adv option), and set upper limit on # points.:wq
