// File: driveShare.gs
// Description: 
// This file contains functions needed for sharing grades in Google Drive.

// createAssignmentFolder:
// Creates a folder for this assignment and puts it in the user's main Flubaroo folder.
// Returns the folder as a Drive Folder object.
function createAssignmentFolder(mydrive_folder, drive_share_assignment_folder_name)
{
  var af = null;
  var mydrive_folder_id = mydrive_folder.getId();
  
  // First locate the main "Flubaroo - Shared Grades" folder. If doesn't exist, create it.
  var drive_iter = DriveApp.getFoldersByName(langstr("FLB_STR_DRIVE_SHARE_FOLDER_NAME"));
  var main_folder = null;
  if (drive_iter.hasNext())
    {
      main_folder = drive_iter.next();
    }
  else
    {
      try
        {
          main_folder = DriveApp.createFolder(langstr("FLB_STR_DRIVE_SHARE_FOLDER_NAME"));
        }
      catch (e)
        {
          Debug.info("Unable to create folder '" + langstr("FLB_STR_DRIVE_SHARE_FOLDER_NAME") + "'. error: " + e);
          return null;
        }
    }
 
  // Next locate the folder for this assignment in the main folder. If it doesn't exist, create it.
  drive_iter = main_folder.getFoldersByName(drive_share_assignment_folder_name);
  
  if (drive_iter.hasNext())
    {
      // folder for this assignment already exists (previous grading)
      Debug.info("Folder '" + drive_share_assignment_folder_name + "' already exists. No need to create.");
      af = drive_iter.next();
    }
  else
    {
      // no folder yet for this assignment (first grading). create one.
      Debug.info("Folder '" + drive_share_assignment_folder_name + "' didn't exist. Creating it.");
      try
        {
          af = DriveApp.createFolder(drive_share_assignment_folder_name);
        }
      catch (e)
        {
          Debug.info("Unable to create folder '" + drive_share_assignment_folder_name + "'. error: " + e);
          return null;
        }
    }
  
  // move the folder for this assignment into the main folder. but first, remove it from "My Drive"
  drive_iter = af.getParents();
  while (drive_iter.hasNext())
    {
      if (drive_iter.next().getId() == mydrive_folder_id)
        {
          mydrive_folder.removeFolder(af);
          break;
        }
    }
  
  main_folder.addFolder(af);
  
  return af;
}

// createGradeDocument:
// Creates a document with a summary of grades for a specific graded submission, places it in the
// teacher's folder for the assignment, and then shares it with the student ('Comment' access).
// Returns the document as a Drive File object.
function createGradeDocument(mydrive_folder, assignment_name, assignment_folder, 
                             instructor_message, show_questions, show_questions_type,
                             show_answers, show_student_response,
                             points_possible, show_score_option, email_address, 
                             has_manually_graded_ques, show_anskey_for_mgr_ques,
                             graded_subm, sticker_img, sticker_percent)

{
  var clean_email_address = email_address.replace(/'/g, "");
  var doc_title = langstr("FLB_STR_DRIVE_SHARE_DOC_TITLE_PRE") + " " + clean_email_address + ": " + assignment_name;
      
  var new_doc = createUniqueEmptyFile(mydrive_folder, assignment_folder, doc_title);
    
  if (new_doc === null)
    {
      return null;
    }
  
  Debug.info("New file has been created with title: " + doc_title);
  Debug.info("Now writing contents...");
  
  
  writeContentsOfGradeDocument(new_doc,
                               assignment_name, instructor_message, show_questions, 
                               show_questions_type, show_answers, show_student_response,
                               points_possible, show_score_option,
                               has_manually_graded_ques, show_anskey_for_mgr_ques,
                               graded_subm, false, sticker_img, sticker_percent);
      
  // save and close the doc
  new_doc.saveAndClose();
  
  Debug.info("Contents of new file have been written! Now sharing with student: " + email_address);
  
  // share the document with the student
  var new_doc_drive_file = DriveApp.getFileById(new_doc.getId());

  Drive.Permissions.insert(
    {
     'role': 'reader',
     'additionalRoles': ['commenter'],
     'type': 'user',
     'value': email_address,
   },
   new_doc_drive_file.getId(),
   {
     'sendNotificationEmails': 'false'
   });
    
  Debug.info("Shared successfully!");
  
  return new_doc_drive_file;
}
  
// startPrintableGradesDocument:
// Creates an empty document that will hold the printable grades. Places it in the
// teacher's folder for the assignment. Returns the document as a Drive File object.
function startPrintableGradesDocument(mydrive_folder, assignment_name, assignment_folder)
{
  var doc_title = langstr("FBL_STR_PRINT_GRADES_TITLE_PRE") + " " + assignment_name;
  
  // Create new doc, and remove it from "My Drive" just after creation.
  // (less clutter in My Drive view this way).
  var new_doc = createUniqueEmptyFile(mydrive_folder, assignment_folder, doc_title);
  
  return new_doc;
}

function createUniqueEmptyFile(mydrive_folder, assignment_folder, doc_title)
{
  // find if this doc already exists, and if so, remove it.
  Debug.info("searching for existing file: " + doc_title);
  var d_iter = assignment_folder.searchFiles("title = '" + doc_title + "'");
    
  if (d_iter.hasNext())
    {
      // file exists in the assignment folder. remove it and trash it.
      var existing_doc = d_iter.next();
      assignment_folder.removeFile(existing_doc);
      existing_doc.setTrashed(true);
    }
  
  // Create new doc, and remove it from "My Drive" just after creation.
  // (less clutter in My Drive view this way).
  var new_doc;
  try
    {
      new_doc = DocumentApp.create(doc_title);
    }
  catch (e)
    {
      Debug.info("Unable to create new doc '" + doc_title + "', error: " + e);
      return null;
    }
  
  var body = new_doc.getBody();
  
  // put document in landscape mode with narrow margins and 10pt Arial font
  var page_height = 8.5; // inches
  var page_width = 11;   // inches
  var margin = 0.5;      // inches
  body.setPageHeight(in2Pts(page_height));
  body.setPageWidth(in2Pts(page_width));
  body.setMarginTop(in2Pts(margin));
  body.setMarginRight(in2Pts(margin));
  body.setMarginBottom(in2Pts(margin));
  body.setMarginLeft(in2Pts(margin));
  
  var style = {};
  style[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
  style[DocumentApp.Attribute.FONT_SIZE] = 10;
  body.setAttributes(style); 
  
  var new_doc_drive_file = DriveApp.getFileById(new_doc.getId());
  
  mydrive_folder.removeFile(new_doc_drive_file);
  
  assignment_folder.addFile(new_doc_drive_file);

  return new_doc;
}

// writeContentsOfGradeDocument:
// Writes into the document the contents of the grades summary and table of grades for the
// submittion given.
function writeContentsOfGradeDocument(grades_doc,
                                      assignment_name, instructor_message, show_questions,
                                      show_questions_type, show_answers, show_student_response,
                                      points_possible, show_score_option, 
                                      has_manually_graded_ques, show_anskey_for_mgr_ques,
                                      graded_subm, append, sticker_img, sticker_percent)
{
  var body = grades_doc.getBody();
  
  // write a header that includes the assignment name, student identifying information and timestamp
  var header = assignment_name + "\r\r";
 
  for (var q = graded_subm.getFirstQuestion(); q != null; q = graded_subm.getNextQuestion(q))
    {
      if (q.getGradingOption() === GRADING_OPT_STUD_ID)
        {
          header += q.getFullSubmissionText() + "\r";
        }
    }

  header += graded_subm.getTimestamp();

  var par;
  if (!append)
    {      
      par = body.insertParagraph(0, header);
    }
  else
    {
      par = body.appendParagraph(header);
    }
  par.setBold(true);
  
  if (sticker_img && (graded_subm.getScorePercent() >= sticker_percent))
    {
      var blob = sticker_img.getBlob();
      var pi = par.addPositionedImage(blob);
      pi.setLayout( DocumentApp.PositionedLayout.WRAP_TEXT);
   
      // to format properly in the doc, all sticker images should be 200px wide. rescale if needed.
      var ratio = 200 / pi.getWidth();
      pi.setWidth( pi.getWidth() * ratio );
      pi.setHeight( pi.getHeight() * ratio );
      pi.setLeftOffset(560);
    }   
  
  var style = {};
  style[DocumentApp.Attribute.FONT_SIZE] = 11;
  par.setAttributes(style);
  
  if (show_score_option != GRADE_SCORE_SHOW_NEITHER)
    {
      var score_str = "";
      if (isInt(graded_subm.getScorePoints()))
        {
          score_str = graded_subm.getScorePoints().toString();
        }
      else
        {
          score_str = floatToPrettyText(graded_subm.getScorePoints());
        }
  
      // write out the students score. put it in a "box" (a 1x1 table).
      var pts_string = langstr("FLB_STR_EMAIL_GRADES_YOUR_GRADE") + ": " 
                       + score_str + " / " + points_possible + " ";
      
      if (show_score_option != GRADE_SHARE_SHOW_POINTS_ONLY)
        {
          pts_string += "(" + floatToPrettyText(graded_subm.getScorePercent() * 100) + "%)";
        }
      
      par = body.appendParagraph(pts_string);
      par.setBold(true);
      style = {};
      style[DocumentApp.Attribute.FONT_SIZE] = 11;
      par.setAttributes(style);
    }
  
  if (instructor_message !== "")
    {
      par = body.appendParagraph('\r' + langstr("FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW"));
      par.setBold(true);
      par = body.appendParagraph(instructor_message);
      par.setBold(false);
      par.setItalic(true);
      par.setIndentFirstLine(in2Pts(0.5));
      par.setIndentStart(in2Pts(0.5));
    }
     
  if (graded_subm.getStudentFeedback() !== "")
    {
      var student_feedback = graded_subm.getStudentFeedback();
      student_feedback = student_feedback.replace(/\n/g, "\r");
        
      par = body.appendParagraph('\r' + langstr("FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW"));
      par.setBold(true);
      par = body.appendParagraph(student_feedback);
      par.setBold(false);
      par.setItalic(true);
      par.setIndentFirstLine(in2Pts(0.5));
      par.setIndentStart(in2Pts(0.5));
    }
  
   if (show_questions_type === QUESTIONS_SHARE_CORRECT)
     {
       par = body.appendParagraph('\r' + langstr("FLB_STR_EMAIL_GRADES_ONLY_CORRECT"));
     }
   else if (show_questions_type === QUESTIONS_SHARE_INCORRECT)
     {
       par = body.appendParagraph('\r' + langstr("FLB_STR_EMAIL_GRADES_ONLY_INCORRECT"));
     }
  
  if (show_questions !== 'true')
    {
      // we're done!
      return;
    }

  par = body.appendParagraph("");    
  par.setItalic(false);

  // create and append a table with all of the information about the submission.
  var header_row = [];
  header_row.push(langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_QUESTION_HEADER"));
  
  if (show_student_response)
    {
      header_row.push(langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER"));
    }
  
  if (show_answers === 'true')
    {
      header_row.push(langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER"));
    }
  header_row.push(langstr("FLB_STR_GRADE_STEP1_LABEL_POINTS"));
  if (has_manually_graded_ques)
    {
      header_row.push(langstr("FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER"));
    }
  if (graded_subm.getHelpTipsPresent())
    {
      header_row.push(langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER"));
    }
  
  var table_data = [ header_row ];
  
  for (q = graded_subm.getFirstQuestion(); 
       q != null; 
       q = graded_subm.getNextQuestion(q))
    {
      if (q.isTimestamp())
        {
          continue;
        }
            
       var gopt = q.getGradingOption();
            
       if (gopt === GRADING_OPT_STUD_ID 
           || gopt === GRADING_OPT_COPY_FOR_REFERENCE
           || gopt === GRADING_OPT_IGNORE)

         {
           continue;
         }
 
      var ak_has_formula = false;
      var ak_value = makePrettyAnswerKeyValue(q.getAnswerKeyText());      
      
      if (typeof ak_value === 'string' && ak_value.substring(0,2) == "%=")
        {
          // don't show formulas in the answer key when sharing grades.
          // unwiedly, long, and not necessarily fully decipherable by the student anyway.
          ak_has_formula = true;
        }
       
      // should we include this question in the summary?
      var ques_pts_worth = getPointsWorth(q.getGradingOption());

      if (q.getGradedVal() >= ques_pts_worth) // full credit or more
        {
          if (show_questions_type === QUESTIONS_SHARE_INCORRECT && (gopt !== GRADING_OPT_SKIP))
            {
              // Question is correct. Don't include if we're only showing incorrect questions.
              continue;
            }
         }
       else // incorrect (or not full-score, or not graded yet)
         {
           // Question is incorrect. Don't include if we're only showing correct questions.
           if (show_questions_type === QUESTIONS_SHARE_CORRECT && (gopt !== GRADING_OPT_SKIP))
             {
               continue;
             }
         }
      
       var score = "";
       if (gopt === GRADING_OPT_SKIP)
         {
           score = langstr("FLB_STR_NOT_GRADED");
         }
       else
         {
           var is_num = (q.getGradedVal() !== "") && !isNaN(q.getGradedVal().toString());
           if (is_num)
             {
               var score_str = "";
               if (isInt(q.getGradedVal()))
                 {
                   score_str = q.getGradedVal().toString();
                 }
               else
                 {
                   score_str = floatToPrettyText(q.getGradedVal());
                 }     
               
               score = score_str + " / " + getPointsWorth(q.getGradingOption());
             }
           else
             {
               // for "Grade By Hand" questions with no score assigned.
               score = langstr("FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED");
             }
         }
      
      var row_data = [];

      row_data.push(q.getFullQuestionText());
      
      if (show_student_response)
        {
          row_data.push(q.getFullSubmissionText());    
        }

      if (show_answers === 'true')
        {
          if ( (isNormallyGraded(gopt) || (isManuallyGraded(gopt) && show_anskey_for_mgr_ques))
                && !ak_has_formula )
            {
              row_data.push(ak_value);
            }
          else
            {
              row_data.push("");
            }
        }
      
      row_data.push(score);
      
      if (has_manually_graded_ques)
        {
          row_data.push(q.getGradedTeacherComment());
        }
      
      if (graded_subm.getHelpTipsPresent())
        {
          row_data.push(q.getHelpTip());
        }
      
      table_data.push(row_data);
    }      
 
  var question_col_index = 0;
  var your_ans_col_index = 1;
  var correct_ans_col_index = 2; // if present
  var pts_col_index = 3;
  var mgr_teacher_comment_col_index = 4;
  var help_tip_col_index = 5;

  if (show_student_response !== 'true')
    {
      correct_ans_col_index--;
      pts_col_index--;
      help_tip_col_index--;
      mgr_teacher_comment_col_index--;
    }
  if (show_answers !== 'true')
    {
      pts_col_index--;
      help_tip_col_index--;
      mgr_teacher_comment_col_index--;
    }
  if (!has_manually_graded_ques)
    {
      help_tip_col_index--;
    }
  
  var table_in_doc = body.appendTable(table_data);  
  table_in_doc.getRow(0).setBold(true);
  
  var additional_width = 0.0;
  if (show_answers !== 'true')
    {
      additional_width += 0.4;
    }   
  if (!has_manually_graded_ques)
    {
      additional_width += 0.4;
    }
  if (!graded_subm.getHelpTipsPresent())
    {
      additional_width += 0.58;
    }
  
  style = {};
  style[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
  style[DocumentApp.Attribute.FONT_SIZE] = 9;
  table_in_doc.setAttributes(style);
  
  table_in_doc.setColumnWidth(question_col_index, in2Pts(1.9 + additional_width)); 
  table_in_doc.setColumnWidth(your_ans_col_index, in2Pts(1.75 + additional_width)); 
  if (show_answers === 'true')
    {
      table_in_doc.setColumnWidth(correct_ans_col_index, in2Pts(1.75 + additional_width)); 
    }

  table_in_doc.setColumnWidth(pts_col_index, in2Pts(0.7));

  if (has_manually_graded_ques)
    {
      table_in_doc.setColumnWidth(mgr_teacher_comment_col_index, in2Pts(2.0));
    }
  
  if (graded_subm.getHelpTipsPresent())
    {
      table_in_doc.setColumnWidth(help_tip_col_index, in2Pts(1.75 + additional_width)); 
    }
  
  if (append)
    {
      body.appendPageBreak();
    }
}
     
// in2Pts: Converts inches to points.
function in2Pts(inches)
{
  var ppi = 72; // points per inch
  return ppi * inches;
}

