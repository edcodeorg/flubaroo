// File: email.gas.gs
// Description: 
// This file contains all relevant functions for sending email.

// TODO_AJR - There is a flag in the grades sheet about whether a student has 
// been emailed yet. So could use this rather than shortening the email loop.

// TODO_AJR - Look for other menu handlers that can be nested.

// TODO_AJR - some of the local vars in sendEmail's nested functions
// are probably redundant.

// TODO_AJR - processGradesSheet() is called a second time in doShareGrades().

// TODO_AJR_BUG - If an email fails to send the email options window stays open.

// TODO_AJR - Assert script properties set if expected to be.

function doShareGrades()
{
  Debug.info("doShareGrades()");
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dp = PropertiesService.getDocumentProperties();
  var up = PropertiesService.getUserProperties();
    
  // The object representing the grades sheet.
  
  // The send emails ui.
  //var app = UiApp.getActiveApplication();
  
  Debug.info("doShareGrades() 2");

  
  // The zero-offset index of the email question in the submissions.
  var question_index = 0;
    
  // The text of the email address question.
  var question = dp.getProperty(DOC_PROP_EMAIL_ADDRESS_QUESTION);  
    
  var share_option_type = dp.getProperty(DOC_PROP_EMAIL_SHARE_OPTION);
  var grade_share_option = GRADE_SHARE_METHOD_EMAIL;
  if (share_option_type)
    {
      grade_share_option = Number(share_option_type);
    } 
  
  // Whether to show answers in the student's 
  var show_answers = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_ANSWER_KEY);
    
  // The message from the instructor in the student's 
  var instructor_message = dp.getProperty(DOC_PROP_EMAIL_INSTRUCTOR_MESSAGE);
    
  // Include question scores in the 
  var show_questions = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_SCORES);
    
  // Include all questions, or just correct/incorrect ones?
  var show_questions_type = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_TYPE);
  if (show_questions_type)
    {
      show_questions_type = Number(show_questions_type);
    }
  
  // Include a copy of the student's own response?
  var show_student_response = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_STUD_RESP);
  var props_set = dp.getProperty(DOC_PROP_EMAIL_FIRST_PROPERTIES_SET);
  if (props_set === null)
    {
      // likely an autograde spreadsheet that got upgraded without the user
      // re-configuring the sharing options.
      show_student_response = true; // default, consistent with previous Flubaroo bhvr.
    }
  
  // The email address of the instructor.
  var user_email_addr = dp.getProperty(DOC_PROP_EMAIL_INSTRUCTOR_ADDRESS);
  Debug.assert(user_email_addr !== null, "doShareGrades() - DOC_PROP_EMAIL_INSTRUCTOR_ADDRESS not set")

  var show_score_option = up.getProperty(USER_PROP_ADV_OPTION_SHARE_GRADE_SCORE_TYPE);
  
  var show_anskey_for_mgr_ques = up.getProperty(USER_PROP_ADV_OPTION_SHOW_ANSKEY_FOR_MGR_QUES);
  
  var assignment_name = SpreadsheetApp.getActiveSpreadsheet().getName();
  
  // For English, remove "(Responses)" from the title, which is added by Google when
  // a new spreadsheet is created as the destination for form responses.
  assignment_name = assignment_name.replace(" (Responses)", "");
    
  // Also remove any single-quotes from it, as this causes problems with the Drive API
  assignment_name = assignment_name.replace(/'/g, "");
  
  var sticker_file_id = dp.getProperty(DOC_PROP_STICKER_FILE_ID);
  var sticker_resource_key = dp.getProperty(DOC_PROP_STICKER_RESOURCE_KEY);
  var sticker_enabled = dp.getProperty(DOC_PROP_STICKER_ENABLED);
  var sticker_threshold_percent = dp.getProperty(DOC_PROP_STICKER_THRESHOLD1);
  var sticker_blob_name = "";
  var img_file = null;
  
  
  // ensure a valid file and percent are set before allowing stickers to be sent out.
  // should never happen given how UI works, but just as a safeguard.
  if (sticker_threshold_percent === "" || isNaN(sticker_threshold_percent)
      || !sticker_file_id || sticker_file_id === "")
    {
      sticker_enabled = false;
      img_file = null;
    }
  else if (sticker_enabled)
    {
      sticker_threshold_percent /= 100;
      sticker_blob_name = "stickerBlob-" + sticker_file_id;

      try
        {
          if (sticker_resource_key)
            {
              img_file = DriveApp.getFileByIdAndResourceKey(sticker_file_id, sticker_resource_key);
            }
          else
            {
              img_file = DriveApp.getFileById(sticker_file_id);
            }
          
          img_file.getBlob().setName(sticker_blob_name);
        }
      catch (e)
        {
          Debug.info("Unable to load sticker with id=" + sticker_file_id + ", e: " + e);
          img_file = null;
        }
    }
  
  var num_email_send_attempts = 0;
  
  var num_emails_sent = 0;
    
  var num_emails_unsent = 0;
  
  var got_grades_sheet = gotSheetWithGrades(ss);
    
  var gws;
  
  // checkout the drive sharing options and create a drive folder for this assignment if needed
  var drive_share_assignment_folder_name = assignment_name;
  var assignment_folder = null;
  var mydrive_folder = null;
   
  Debug.info("grade_share_option: '" + grade_share_option + "'");
  
  if ((grade_share_option == GRADE_SHARE_METHOD_DRIVE)
       || (grade_share_option == GRADE_SHARE_METHOD_BOTH))
    {
      // create a folder for this assignment, and return a reference to that folder.
      mydrive_folder = DriveApp.getRootFolder();

      assignment_folder = createAssignmentFolder(mydrive_folder, assignment_name);
      if (assignment_folder === null)
        {
          Debug.info("unable to share grades. user may have Drive permissions issue");
          return;
        }
      
      Debug.info("created assignment folder for this assignment");
    }
    
  // Initialize a gws object from the Grades sheet
  if (Autograde.isOn() && autograded_gws_g)
    {
      // Autograde just completed, so we can potentially use the gws object from it, 
      // which is already in memory. Only exception is if the answer key has a custom '%='
      // formula. In this case we have to read the scores back from the spreadsheet, since
      // we won't have known ahead of time what the formula would evaluate them to.
      if (!autograded_gws_g.hasFormulaAnswerKey())
        {
          // Can use the one from Autograde, which just completed.
          Debug.info("doShareGrades(): grabbing existing gws object from autograde.");
          gws = autograded_gws_g;
        }
      else // answer key contains a '%=' formula. 
        {
          if (Autograde.getDoFullRegrade())
            {
              Debug.info("doShareGrades(): answer key has '%=' formula in it. Initializing from existing Grades sheet with type: INIT_TYPE_GRADED_FULL");
              gws = new GradesWorksheet(ss, INIT_TYPE_GRADED_FULL, -1);
            }
          else
            {
              Debug.info("doShareGrades(): answer key has '%=' formula in it. Initializing from existing Grades sheet with type: INIT_TYPE_GRADED_ONLY_LATEST");
              gws = new GradesWorksheet(ss, INIT_TYPE_GRADED_ONLY_LATEST, autograded_gws_g.getNumRecentGradedSubmissions());
            }
        }
    }
  else
    {
      // Initialise gws from the grades sheet.
      Debug.info("doShareGrades(): generating new gws object from Grades sheet.");
      gws = new GradesWorksheet(ss, INIT_TYPE_GRADED_FULL, -1);
    }
  
  var points_possible =  gws.getPointsPossible();
  var has_manually_graded_question = gws.hasManuallyGradedQuestion();
  
  // Remove any HTML formatting from the instructor's message.
  // TODO_AJR - Could probably do something clever here with regex.
  Debug.info("instructor_message: " + instructor_message);
  var instructor_message_email = instructor_message.replace(/</g, "&lt;");
  instructor_message_email = instructor_message_email.replace(/>/g, "&gt;");
  instructor_message_email = instructor_message_email.replace(/\n/g, "<br>");
  
  var instructor_message_doc = instructor_message.replace(/\n/g, "\r");
  
  // Find out which question contains the email address.
  
  var first_graded_subm = gws.getFirstGradedSubmission();
  var q;
  
  for (q = first_graded_subm.getFirstQuestion(); 
       q !== null; 
       q = first_graded_subm.getNextQuestion(q))
    { 
      // Guaranteed to find it.
      if (q.getGradingOption() === GRADING_OPT_STUD_ID && 
          q.getFullQuestionText() === question)
        {
          // Note: we have to iterate to find it, as this list could 
          // be initiated from either the Student Submissions or 
          // Grades sheet, which may have different orders for 
          // the questions.
          break;
        }
    
      question_index++;
    }
  
  Debug.info("doShareGrades() - " + 
             "found email address at: " + question_index + " " +
             "with value: " + question);
  
  // TODO_AJR - 
  // 1) In autograed add the option to not send out an email, just grade it.
  // 2) to let the instructor decide if they get an email every time.
  
  // Send all of the student result emails.
  sendAllStudentsGrades();
    
  if ((num_emails_sent > 0) && !Autograde.isOn())
    {
      sendInstructorEmail();
    }
  
  // log (anonymously) that emails were sent for an assignment.
  // do only for manually graded assignments. this ensures consistency
  // with existing analytics, and also avoids pollution due to high use
  // of AutoGrade.
  if (!Autograde.isOn())
    {
      if ((grade_share_option == GRADE_SHARE_METHOD_EMAIL) || (grade_share_option == GRADE_SHARE_METHOD_BOTH))
        {
          logEmail();
        }
      if ((grade_share_option == GRADE_SHARE_METHOD_DRIVE) || (grade_share_option == GRADE_SHARE_METHOD_BOTH))
        {
          logSharedGradesViaDrive();
        }
      
      if (sticker_enabled)
        {
          logStickerIncluded();
        }
    }
  
  Debug.writeToFieldLogSheet();
  
  notifyNumberEmailsSent();
  
  //return app;

  // Private functions.

  function sendAllStudentsGrades()
  {
    var gs;
    var email_address;
    var msg_body;
    var pdf_certificate = null;
    var date = new Date();
    var html_body;
    var msg_title = langstr("FLB_STR_EMAIL_GRADES_EMAIL_SUBJECT") + 
                    ' "' + 
                    assignment_name + '"';
    
    var up = PropertiesService.getUserProperties();
    
    Debug.info("sendAllStudentsGrades()");

    var send_email_fingerprints = gws.getNotAlreadyEmailedFingerprintsList();
    
    Debug.info("list of fingerprints that need emailing:");
    Debug.info(send_email_fingerprints);
       
    for (var i=0; i < send_email_fingerprints.length; i++)
      {
        Debug.info("getting graded submission by fingerprint: " + send_email_fingerprints[i]);
        var gs = gws.getGradedSubmissionByFingerprint(send_email_fingerprints[i]);

        if (gs)
          {
            Debug.info("gs.getSubmFingerprint(): " + gs.getSubmFingerprint());
          }
        else
          {
            Debug.info("gs.getSubmFingerprint() == null");
          }
        
        // Pull email address from grade sheet rather than the submissions sheet in case the 
        // instructor has edited the values inline.
        email_address = gs.getQuestionByIndex(question_index)
                          .getGradedVal();
        
        Debug.info("examining email: " + email_address);
        if (typeof email_address == 'string')
          {
            // trim any whitespace. a space after the address can cause sending to fail.
            email_address = strTrim(email_address);
          }

        if (!isValidEmailAddress(email_address) || gs.getAlreadyEmailed())
          {
            Debug.info("skipping email: '" + email_address + "'");
            num_emails_unsent++;
            continue;
          }

        num_email_send_attempts += 1;
        var grdoc_url = null;
        
        try 
          {
            if ((grade_share_option == GRADE_SHARE_METHOD_DRIVE)
                 || (grade_share_option == GRADE_SHARE_METHOD_BOTH))
              {        
                Debug.info("creating and sharing document with student grades");
                
                // Create a document with a summary of this student's grades, and 
                // share it with the student. The teacher will remain the owner, but the student
                // will have Comment rights. 
                var grdoc = createGradeDocument(mydrive_folder, assignment_name, assignment_folder, 
                                                instructor_message_doc, show_questions,
                                                show_questions_type, show_answers, show_student_response,
                                                points_possible, show_score_option, email_address, 
                                                has_manually_graded_question, show_anskey_for_mgr_ques, 
                                                gs, img_file, sticker_threshold_percent);
                grdoc_url = grdoc.getUrl();
              }
                                               
            Debug.info("sendAllStudentEmail() - sent email to " + email_address);
          }
        catch (exception)
          {
            Debug.error("sendAllStudentsGrades() - failed to create and share grades document for " + 
                        email_address + " " +
                        "Error: " + exception);
          }
        
        try
          {      
            if ((grade_share_option == GRADE_SHARE_METHOD_EMAIL)
                 || (grade_share_option == GRADE_SHARE_METHOD_BOTH))
              {
                html_body = constructGradesEmailBody(gs, grdoc_url, show_score_option);
                var no_noreply = up.getProperty(USER_PROP_ADV_OPTION_NO_NOREPLY);
                no_noreply = no_noreply ? true : false;
 
                var send_name = up.getProperty(USER_PROP_ADV_OPTION_EMAIL_SEND_NAME);
                if (send_name === null)
                  {
                    send_name = EMAIL_SEND_NAME_DEFAULT;
                  }
                
                // setup email options
                var email_opts = 
                    {htmlBody: html_body, 
                     noReply: !no_noreply, 
                     name: send_name,  // only shows when NOT sending from noreply@
                     attachments: pdf_certificate,
                    };
                
                // attach sticker image if applicable
                if (sticker_enabled
                    && (gs.getScorePercent() >= sticker_threshold_percent))
                  {
                    var inlineImages = {};
                    inlineImages[sticker_blob_name] = img_file.getBlob();
                    email_opts.inlineImages = inlineImages;
                  }
                
                // send the email with the scores!
                MailApp.sendEmail(email_address, 
                                  msg_title, 
                                  "",
                                  email_opts);
              }
            
            num_emails_sent++;
              
            gs.recordEmailSentInGradesSheet();
          }
        catch (exception)
          {
            // Just ignore malformed emails or email errors.
            num_emails_unsent++;
          
            Debug.error("sendAllStudentsGrades() - failed to send email to " + 
                        email_address + " " +
                        "Error: " + exception);
          }      
      }
    
    Debug.info("getting next fingerprint...");
      
  } // sendAllStudentsGrades()

  function sendInstructorEmail() 
  {
    var up = PropertiesService.getUserProperties();
    var no_noreply = up.getProperty(USER_PROP_ADV_OPTION_NO_NOREPLY);
    no_noreply = no_noreply ? true : false;        
    
    var msg_title = langstr("FLB_STR_EMAIL_RECORD_EMAIL_SUBJECT") + ": " + assignment_name;
    var msg_body = "<html><body><p>Below is a summary of the grades you just shared:<b>";
    var email_notification;
    
    msg_body += "<table border=0 cellspacing=12>";
    
    msg_body += '<tr><td>' + 
                langstr("FLB_STR_EMAIL_RECORD_ASSIGNMENT_NAME") + 
                ':</td><td><b><a href="' + 
                ss.getUrl() + 
                '">' + 
                assignment_name + 
                "</a></b></td></tr>";
    
    msg_body += "<tr><td>" + 
                langstr("FLB_STR_EMAIL_RECORD_NUM_EMAILS_SENT") + 
                ":</td><td><b>" + 
                num_emails_sent + 
                "</b></td></tr>";
    
    msg_body += "<tr><td>" + 
                langstr("FLB_STR_EMAIL_RECORD_NUM_GRADED_SUBM") + 
                ":</td><td><b>" + 
                gws.getNumGradedSubmissions() + 
                "</b></td></tr>";
    
    msg_body += "<tr><td>" + 
                langstr("FLB_STR_EMAIL_RECORD_AVERAGE_SCORE") + 
                ":</td><td><b>" + 
                gws.getAverageScore().toFixed(2) + 
                "</b></td></tr>";
    
    msg_body += "<tr><td>" + 
                langstr("FLB_STR_EMAIL_RECORD_POINTS_POSSIBLE") + 
                ":</td></td><b>" + 
                gws.getPointsPossible() + 
                "</b></td></tr>";
    
    msg_body += "<tr><td>" + 
                langstr("FLB_STR_EMAIL_RECORD_ANSWER_KEY_PROVIDED") + 
                "</td><td><b>";
    
    if (show_answers === 'true')
    {
      msg_body += langstr("FLB_STR_EMAIL_RECORD_ANSWER_KEY_YES");
    }
    else
    {
      msg_body += langstr("FLB_STR_EMAIL_RECORD_ANSWER_KEY_NO");
    }
    
    msg_body += "</b></td></tr></table>";
    
    if (instructor_message)
    {
      msg_body += "<p>" + 
                  langstr("FLB_STR_EMAIL_RECORD_INSTRUCTOR_MESSAGE") + 
                  ":<br><br>";
      
      msg_body += '<div style="padding-left:10px;padding-right:10px;' + 
                  'padding-top:10px;padding-bottom:10px;width:60%;' + 
                  'border:1px solid gray;">'; 
      
      msg_body += instructor_message_email + "</p></div>";
    }
    
    msg_body += "</body></html>";
    
    try
    {  
      MailApp.sendEmail(user_email_addr, 
                msg_title, 
                "",
                {htmlBody: msg_body, 
                 noReply: !no_noreply, 
                 name: "Flubaroo Grader"});
                 
       Debug.info("sendInstructorEmail() - sent email to " + user_email_addr);                 
    }
    catch (exception)
    {
      Debug.info("sendInstructorEmail() - failed to send email to instructor: " + 
             user_email_addr +
             " Error: " + 
             exception);
    }    
  } // sendInstructorEmail()
    
  function isValidEmailAddress(email_address)
  {
    if (!email_address)
      {
        Debug.info("isValidEmailAddress() - no email address");
        return false;
      }
    
    if (typeof email_address !== 'string')
      {
        Debug.warning("isValidEmailAddress() - parameter not a string");
        return false;
      }
    
    if (email_address.indexOf(' ') !== -1)
      {
        Debug.warning("isValidEmailAddress() - email contains spaces");      
        return false;
      }
    
    if (email_address.indexOf('@') === -1)
      {
        Debug.warning("isValidEmailAddress() - no @");          
        return false;
      }
    
    return true;
    
  } // isValidEmailAddress()
  
  // TODO_AJR - This isn't working yet.
  
  function sendEmail(recipient, subject, body, options)
  {
    var up = PropertiesService.getDocumentProperties();
    
    if (Debug.on())
      {
        if (up.getProperty(USER_PROP_SKIP_EMAIL))
          {
            // Email sending can be disabled in debug mode.
            MailApp.sendEmail(recipient, subject, body, options);
          }
      }
    else
      {
        MailApp.sendEmail(recipient, subject, body, options);
      }
    
  } // sendEmail()
  
  function constructGradesEmailBody(graded_subm, grdoc_url, show_score_option)
  {   
    // Find out if any help tips were provided. if so, we'll want to include a column for them in the email.
    var help_tips_provided = graded_subm.getHelpTipsPresent();
    
    var msg_body = '<html><body bgcolor="white">';
     
    msg_body += '<p>' + langstr("FLB_STR_EMAIL_GRADES_EMAIL_BODY_START") + ' <b>' + assignment_name + '</b>. '
                      + langstr("FLB_STR_EMAIL_GRADES_DO_NOT_REPLY_MSG") + '.</p>';

    msg_body += '<table border=0 width=80%><tr><td>';
    if (show_score_option != GRADE_SCORE_SHOW_NEITHER)
      {
        msg_body += '<div style="padding-left:10px;display:inline-block;border:1px solid black;">'; 
    
        var score_str = "";
        if (isInt(graded_subm.getScorePoints()))
          {
            score_str = graded_subm.getScorePoints().toString();
          }
        else
          {
            score_str = floatToPrettyText(graded_subm.getScorePoints());
          }
    
        msg_body += "<h2>" + 
                     langstr("FLB_STR_EMAIL_GRADES_YOUR_GRADE") + 
                     ": <b>" + 
                      score_str + 
                     " / " + 
                     gws.getPointsPossible() + "&nbsp;";
        
        if (show_score_option != GRADE_SHARE_SHOW_POINTS_ONLY)
          {
            msg_body += "(" + floatToPrettyText(graded_subm.getScorePercent() * 100) + "%)&nbsp;";
          }
        
        msg_body += "</h2></b></div>";
      }
    msg_body += '</td><td>';
    if (sticker_enabled
        && (graded_subm.getScorePercent() >= sticker_threshold_percent))
      {
        msg_body += "<img height='200' src='cid:" + sticker_blob_name + "'>";
      }
    msg_body += '</td><tr></table>';
    
    if (instructor_message !== "")
       {
         msg_body += '<br><br>';
         msg_body += langstr("FLB_STR_EMAIL_GRADES_INSTRUCTOR_MSG_BELOW") + ':<br><br>';
         msg_body += '<div style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:10px;width:60%;border:1px solid gray;">';
         msg_body +=  instructor_message_email;
         msg_body += "</div>";
       }
    
    if (graded_subm.getStudentFeedback() !== "")
      {
         var student_feedback = graded_subm.getStudentFeedback();
         Debug.info("student_feedback: " + student_feedback);
         student_feedback = student_feedback.replace("<", "&lt;");
         student_feedback = student_feedback.replace(">", "&gt;");
         student_feedback = student_feedback.replace("\n", "<br>");
        
         msg_body += '<br><br>';
         msg_body += langstr("FLB_STR_EMAIL_GRADES_STUDENT_FEEDBACK_BELOW") + ':<br><br>';
         msg_body += '<div style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:10px;width:60%;border:1px solid gray;">';
         msg_body +=  student_feedback;
         msg_body += "</div>";
      }
    
    if (grdoc_url)
      {
        msg_body += '<br><p><a href="' + grdoc_url + '">' + langstr("FLB_STR_EMAIL_GRADES_DRIVE_SHARE_MSG") + '</a><br>';
      }
     
    msg_body += "<br><p>" + langstr("FLB_STR_EMAIL_GRADES_SUBMISSION_SUMMARY") + ": ";
    
    msg_body += "<table border=0 cellspacing=12 width=80%>";
    
    for (var q = graded_subm.getFirstQuestion(); q != null; q = graded_subm.getNextQuestion(q))
      {
        if (q.getGradingOption() === GRADING_OPT_STUD_ID)
          {
            msg_body += "<tr><td>" + 
                        q.getFullQuestionText() + 
                        "</td><td>" + 
                        "<b>" + 
                        q.getFullSubmissionText() + 
                        "</b></td></tr>";
          }
      }
    
    msg_body += "<tr><td>" +
                langstr("FLB_STR_GRADE_STEP2_LABEL_SUBMISSION_TIME") + "</td><td>" +
                "<b>" + 
                graded_subm.getTimestamp() + 
                "</b></td></tr>";
    
    msg_body += "</table>";  
    msg_body += "</p>"; 
    
    if (show_questions === 'true')
      {
        var gopt;
        var grade_points_str = "";
        var grade_status = "";
        var q;
  
        if (show_questions_type === QUESTIONS_SHARE_CORRECT)
          {
            msg_body += "<p>" + langstr("FLB_STR_EMAIL_GRADES_ONLY_CORRECT") + "</p>";
          }
        else if (show_questions_type === QUESTIONS_SHARE_INCORRECT)
          {
            msg_body += "<p>" + langstr("FLB_STR_EMAIL_GRADES_ONLY_INCORRECT") + "</p>";
          }
        
        for (q = graded_subm.getFirstQuestion(); 
             q != null; 
             q = graded_subm.getNextQuestion(q))
          {
            if (q.isTimestamp())
              {
                continue;
              }
            
            gopt = q.getGradingOption();
            
            if (gopt === GRADING_OPT_STUD_ID 
                || gopt === GRADING_OPT_COPY_FOR_REFERENCE
                || gopt === GRADING_OPT_IGNORE)
              {
                continue;
              }
        
            grade_points_str = "";
            grade_status = "";
        
            if (gopt === GRADING_OPT_SKIP)
              {
                grade_status = langstr("FLB_STR_NOT_GRADED");
                grade_points_str = "";
              }
            else 
              {
                if (q.getGradedVal() > 0)
                  {
                    grade_points_str = "+";
                  }
                
                var ques_pts_worth = getPointsWorth(q.getGradingOption());
                
                // should we include this question in the summary?
                if (q.getGradedVal() >= ques_pts_worth) // full credit or more
                  {
                    if (show_questions_type === QUESTIONS_SHARE_INCORRECT)
                      {
                        // Question is correct. Don't include if we're only showing incorrect questions.
                        continue;
                      }
                  }
                else // incorrect (or not full-score, or not graded yet)
                  {
                    // Question is incorrect. Don't include if we're only showing correct questions.
                    if (show_questions_type === QUESTIONS_SHARE_CORRECT)
                      {
                        continue;
                      }
                  }           
                
                if (isNormallyGraded(gopt)) // not 'Grade by Hand'. for those we just always include them.
                  {
                    if (q.getGradedVal() >= ques_pts_worth)
                      {                        
                        grade_status = langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT");
                      }
                    else
                      {
                        grade_status = langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT");
                      }
                  }
                else // manually graded
                  {
                    grade_status = langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_MANUAL");
                  }
                
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
                    
                    grade_points_str += score_str + " / " + ques_pts_worth + " ";
                    grade_points_str += langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_POINTS");
                  }
                else
                  {
                    grade_points_str = langstr("FLB_STR_EMAIL_GRADES_SCORE_NO_POINTS_ASSIGNED");
                  }

              } 
            
            msg_body += constructQuestionDiv(q, grade_status, grade_points_str, show_answers, makePrettyAnswerKeyValue(q.getAnswerKeyText()));
            
          } // for each question.
          
      } // if show_questions is true.
  
    msg_body += '<p><b>' + langstr("FLB_STR_EMAIL_GRADES_EMAIL_FOOTER") + '. ';
    
    msg_body += '<a href="http://www.flubaroo.com">' + 
                 langstr("FLB_STR_EMAIL_GRADES_VISIT_FLUBAROO") + 
                 '</a>.</b></p>'; 
    
    msg_body += "</body></html>";
    
    return msg_body;
    
    // Construct the html "div" for the question in the email.
    function constructQuestionDiv(graded_ques, 
                                  grade_status, 
                                  grade_points_str, 
                                  show_answers,
                                  ak_value)
    {
      var bgcolor_red = "#FF4F4F";
      var bgcolor_green = "#44C93A";
      var bgcolor_gray = "#c0c0c0";
      var bgcolor_yellow = "#FFF77D";
      var bgcolor;
      
      var gopt = graded_ques.getGradingOption();
      
      if (gopt === GRADING_OPT_SKIP)
        {
          bgcolor = bgcolor_gray;
        }
      else if (isNormallyGraded(gopt))
        {
          var ques_pts_worth = getPointsWorth(gopt);

          if (graded_ques.getGradedVal() >= ques_pts_worth)
            {
              bgcolor = bgcolor_green;
            }
          else
            {
              bgcolor = bgcolor_red;
            }            
        }
      else // manually graded
        {
          bgcolor = bgcolor_yellow; 
        }
      
      div_body = '<div style="width:610px;margin-left:10px;padding-left:15px;padding-right:15px;padding-top:10px;padding-bottom:20px;\
                  -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 20px;\
                  -webkit-box-shadow: #B3B3B3 10px 10px 10px;-moz-box-shadow: #B3B3B3 10px 10px 10px; box-shadow: #B3B3B3 10px 10px 10px;'
      div_body += 'background-color:' + bgcolor + ';">';
      
      div_body += '<span style="width:180px;float:right;padding-right:20px;">';
      div_body += '<div style="width:100%;font-size:xx-large;text-align:right;">' + grade_status + '</div>';
      div_body += '<div style="width:100%;padding-left:5px;text-align:right;">' + grade_points_str + '</div>';
      div_body += '</span>';
    
      div_body += '<p style="width:400px;font-size:large;">';
      div_body += '<b>' + graded_ques.getFullQuestionText() + '</b>';
      div_body += '</p>';
      
      // Echo back the student's own response?
      if (show_student_response)
        {
          div_body += '<p style="width:400px;font-size:medium;">';
          div_body += '<b>' + langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_YOUR_ANSWER_HEADER") + ': </b>' + graded_ques.getFullSubmissionText() + '</p>'; 
        }
      
      var ak_has_formula = false;
      if (typeof ak_value === 'string' && ak_value.substring(0,2) == "%=")
        {
          // don't show formulas in the answer key when sharing grades.
          // unwiedly, long, and not necessarily fully decipherable by the student anyway.
          ak_has_formula = true;
        }
      
      if ( (isNormallyGraded(gopt) && (grade_status === langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_INCORRECT"))
              || (isManuallyGraded(gopt) && show_anskey_for_mgr_ques))
            && !ak_has_formula && show_answers === 'true')
        {
          div_body += '<p style="width:400px;font-size:medium;">'
          div_body += '<b>' + langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_CORRECT_ANSWER_HEADER") + ': </b>' + ak_value;
        }
    
      if (graded_ques.getHelpTip() !== "")
        {
          div_body += '<br><hr><b>' + langstr("FLB_STR_EMAIL_GRADES_SCORE_TABLE_HELP_TIP_HEADER")  + ':</b>';
          div_body += '<p style="width:400px;padding-left:25px;padding-top:8px;font-size:medium;">'
          div_body += '<i>' + graded_ques.getHelpTip() + '</i>';
          div_body += '</p>';
        }
      if (isManuallyGraded(gopt) && graded_ques.getGradedTeacherComment() != "")
        {
          Debug.info("graded_ques.getGradedTeacherComment(): " + graded_ques.getGradedTeacherComment());
          var comment_html = graded_ques.getGradedTeacherComment();
          if (typeof comment_html === 'string')
            {
              comment_html = comment_html.replace(/\n/g, "<br>");
            }
          div_body += '<br><hr><b>' + langstr("FLB_STR_EMAIL_GRADES_MANUALLY_GRADE_TEACHER_COMMENT_HEADER")  + ':</b>';
          div_body += '<p style="width:550px;padding-left:25px;padding-top:8px;font-size:medium;">'
          div_body += '<i>' + comment_html + '</i>';
          div_body += '</p>';
        }
      
      div_body += "</div><br><br>";
      
      return div_body;
      
    } // constructQuestionDiv()
        
  } // constructGradesEmailBody()
  
  function notifyNumberEmailsSent ()
  {  
    // No emails sent at all? Notify instructor.
    if (num_emails_sent == 0)
    {
      UI.msgBox(langstr("FLB_STR_NOTIFICATION"),
                langstr("FLB_STR_VIEW_EMAIL_GRADES_NO_EMAILS_SENT"),
                Browser.Buttons.OK);
      
      return;
    }

    // Else, some emails sent. Notify instructor of how many.
    email_notification = num_emails_sent + " " + langstr("FLB_STR_VIEW_EMAIL_GRADES_NUMBER_SENT") + ". "; 
        
    if (num_emails_unsent > 0) 
    { 
      email_notification += num_emails_unsent + " " + 
                           langstr("FLB_STR_VIEW_EMAIL_GRADES_NUMBER_UNSENT"); 
    } 
  
    UI.msgBox(langstr("FLB_STR_NOTIFICATION"), 
              email_notification, 
              Browser.Buttons.OK);  
  }

} // doShareGrades()



// menuShareGrades
// ---------------
//
// Menu event handler.

function menuShareGrades()
{
  Debug.info("menuShareGrades()");
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Housecleaning. Set this to false anytime a user explicitly chooses to grade
  // the assignment. It could be left set if a user quit prematurely while
  // setting autograde options, which could in turn mess up the UI flow for 
  // normal grading.
  Autograde.clearGatheringOptions();
  
  // Check there is a grades sheet.  
  var grades_sheet = getSheetWithGrades(ss);
  
  if (!grades_sheet)
    {
      UI.msgBox(langstr("FLB_STR_NOTIFICATION"),
                langstr("FLB_STR_CANNOT_FIND_GRADES_MSG") + 
                  langstr("FLB_STR_SHEETNAME_GRADES"),
                Browser.Buttons.OK);

      Debug.error("menuShareGrades() - no grades sheet");

      return;
    }

  var grades_sheet_is_valid = gwsGradesSheetIsValid(grades_sheet);
  
  // Check if the existing Grades sheet is valid.
  if (!grades_sheet_is_valid)
    {
      // Existing Grades sheet is invalid! Cannot continue with re-grading.
      UI.showInvalidGradesSheetMessage();
      return;
    }
  
  var quota_remaining = MailApp.getRemainingDailyQuota();
	
  Debug.info("email quota remaining: " + quota_remaining);
  if (quota_remaining <= 0)
    {
      UI.msgBox(langstr("FLB_STR_NOTIFICATION"),
                langstr("FLB_STR_EMAIL_DAILY_QUOTA_EXCEEDED"),
                Browser.Buttons.OK);
      return;
    }
  
  if (UI.isOff())
    {
      // UI is off. Just skip straight to emailing the grades.
      doShareGrades();
      return;
    }
  
  // Display the email grades UI.
  UI.showShareGrades(ss);
  //var app = UI.emailGrades(ss, false);
  //ss.show(app);
  
} // menuShareGrades()


// menuPrintGrades
// ---------------
//
// Menu event handler.
function menuPrintGrades()
{
  Debug.info("menuPrintGrades()");
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Check there is a grades sheet.  
  var grades_sheet = getSheetWithGrades(ss);
  
  if (!grades_sheet)
    {
      UI.msgBox(langstr("FLB_STR_NOTIFICATION"),
                langstr("FLB_STR_CANNOT_FIND_GRADES_MSG") + 
                  langstr("FLB_STR_SHEETNAME_GRADES"),
                Browser.Buttons.OK);

      Debug.error("menuPrintGrades() - no grades sheet");

      return;
    }

  var grades_sheet_is_valid = gwsGradesSheetIsValid(grades_sheet);
  
  // Check if the existing Grades sheet is valid.
  if (!grades_sheet_is_valid)
    {
      // Existing Grades sheet is invalid! Cannot continue with re-grading.
      UI.showMessageBox(langstr("FLB_STR_INVALID_GRADE_SHEET_TITLE"), langstr("FLB_STR_INVALID_GRADES_SHEET"));
      return;
    }
  
  // Display the print grades UI.
  UI.showPrintGrades(ss);

  //var app = UI.emailGrades(ss, true);
  //ss.show(app);
  
} // menuPrintGrades()


function doPrintGrades()
{
  Debug.info("doPrintGrades()");
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dp = PropertiesService.getDocumentProperties();
  var up = PropertiesService.getUserProperties();
    
  // The object representing the grades sheet.
  
  // The send emails ui.
  //var app = UiApp.getActiveApplication();
        
  // Whether to show answers in the student's 
  var show_answers = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_ANSWER_KEY);
    
  // The message from the instructor in the student's 
  var instructor_message = dp.getProperty(DOC_PROP_EMAIL_INSTRUCTOR_MESSAGE);
    
  // Include question scores in the 
  var show_questions = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_SCORES);
    
  // Include all questions, or just correct/incorrect ones?
  var show_questions_type = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_QUESTIONS_TYPE);
  if (show_questions_type)
    {
      show_questions_type = Number(show_questions_type);
    }
  
  // Include a copy of the student's own response?
  var show_student_response = dp.getProperty(DOC_PROP_EMAIL_INCLUDE_STUD_RESP);
  
  // The email address of the instructor.
  var user_email_addr = dp.getProperty(DOC_PROP_EMAIL_INSTRUCTOR_ADDRESS);
  Debug.assert(user_email_addr !== null, "doPrintGrades() - DOC_PROP_EMAIL_INSTRUCTOR_ADDRESS not set")

  var show_score_option = up.getProperty(USER_PROP_ADV_OPTION_SHARE_GRADE_SCORE_TYPE);
  
  var show_anskey_for_mgr_ques = up.getProperty(USER_PROP_ADV_OPTION_SHOW_ANSKEY_FOR_MGR_QUES);
  
  var sticker_file_id = dp.getProperty(DOC_PROP_STICKER_FILE_ID);
  var sticker_resource_key = dp.getProperty(DOC_PROP_STICKER_RESOURCE_KEY);

  var sticker_enabled = dp.getProperty(DOC_PROP_STICKER_ENABLED);
  var sticker_threshold_percent = dp.getProperty(DOC_PROP_STICKER_THRESHOLD1);
  var img_file = null;
  var sticker_blob_name = "";
  
  // ensure a valid file and percent are set before allowing stickers to be sent out.
  // should never happen given how UI works, but just as a safeguard.
  if (sticker_threshold_percent === "" || isNaN(sticker_threshold_percent)
      || !sticker_file_id || sticker_file_id === "")
    {
      sticker_enabled = false;
      img_file = null;
    }
  else if (sticker_enabled)
    {
      sticker_threshold_percent /= 100;
      sticker_blob_name = "stickerBlob-" + sticker_file_id;

      try
        {
          if (sticker_resource_key)
            {
              img_file = DriveApp.getFileByIdAndResourceKey(sticker_file_id, sticker_resource_key);
            }
          else
            {
              img_file = DriveApp.getFileById(sticker_file_id);
            }
          
          img_file.getBlob().setName(sticker_blob_name);
        }
      catch (e)
        {
          Debug.info("Unable to load sticker with id=" + sticker_file_id + ", e: " + e);
          img_file = null;
        }
    }
  
  var assignment_name = SpreadsheetApp.getActiveSpreadsheet().getName();
  
  // For English, remove "(Responses)" from the title, which is added by Google when
  // a new spreadsheet is created as the destination for form responses.
  assignment_name = assignment_name.replace(" (Responses)", "");  
  
  // Also remove any single-quotes from it, as this causes problems with the Drive API
  assignment_name = assignment_name.replace(/'/g, "");
  
  // create a folder for this assignment, and return a reference to that folder.
  var mydrive_folder = DriveApp.getRootFolder();

  var assignment_folder = createAssignmentFolder(mydrive_folder, assignment_name);
  if (assignment_folder === null)
    {
      Debug.info("unable to print Grades. user may have Drive permissions issue.");
      return;
    }
  
  // Initialise gws from the grades sheet.
  Debug.info("doPrintGrades(): generating new gws object from Grades sheet.");
  var gws = new GradesWorksheet(ss, INIT_TYPE_GRADED_FULL, -1);
  var points_possible =  gws.getPointsPossible();
  var has_manually_graded_question = gws.hasManuallyGradedQuestion();
  
  var instructor_message_doc = instructor_message.replace(/\n/g, "\r"); 
  
  var failed = false;    
  var exc_msg = "";
  var pr_doc = null;
  var pr_doc_id = null;
  var count = 0;
  
  for (var gs = gws.getFirstGradedSubmission(), count = 0; 
       gs != null; 
       gs = gws.getNextGradedSubmission(), count++)
    {
      if (count == 0)
        {
          // first time only, create the doc and record its ID.
          try
            {
              pr_doc = startPrintableGradesDocument(mydrive_folder, assignment_name, assignment_folder);
              pr_doc_id = pr_doc.getId()
            }
          catch (e)
            {
              Debug.info("Unable to create printable grades document. error: " + e);
              return;
            }
        }
      else if ((count % 10) == 0)
        {
          // close and repoen the doc after each tenth append. this is to help
          // flush out writes quicker, and also avoid having too much to flush.
          pr_doc.saveAndClose();     
      
          // re-open doc 
          pr_doc = DocumentApp.openById(pr_doc_id);
        }

      Debug.info("doPrintGrades(): appending next student's grades to printable document");
      
      try 
        {             
          writeContentsOfGradeDocument(pr_doc,
                                       assignment_name, instructor_message, show_questions, 
                                       show_questions_type, show_answers, show_student_response,
                                       points_possible, show_score_option,
                                       has_manually_graded_question, show_anskey_for_mgr_ques,
                                       gs, true, img_file, sticker_threshold_percent);
               
        }
      catch (exception)
        {
          Debug.error("doPrintGrades() - failed to create document with printed grades. Error: " + exception);
          failed = true;
          exc_msg = exception;
          break;
        }
    }
  
  //app.close();
  
  if (!failed)
    {
      pr_doc.saveAndClose();  

      var msg = langstr("FBL_STR_PRINT_GRADES_SUCCESS") + "<br><br>";
      msg += '<a target="_blank" href="' + pr_doc.getUrl() + '">' + pr_doc.getName() + '</a>';
    }
  else
    {
      var msg = "Sorry. An error occurred during printing: " + exc_msg;
    }
  
  Debug.writeToFieldLogSheet();

  logPrintedGrades();
  
  UI.showMessageBox(langstr("FLB_STR_NOTIFICATION"), msg);  
}

// makePrettyAnswerKeyValue:
// Takes an answer key value for a question and replaces any special '%' operators to make it 
// "pretty" for sending out to students.
// This is done in a symbolic fashion to avoid the need to localize. Examples:
//
//     Input:  red %or blue %or green
//     Output: red || blue || green
//
//     Input:  3.14 %to 3.15
//     Output: 3.14 → 3.15
//
//     Input:  %cs Michigan
//     Output: Michigan
//
//     Input: %cb A, B, C
//     Output: A, B, C
function makePrettyAnswerKeyValue(ak_val)
{
  var pattern = "";
  var re;
  
  if (typeof ak_val !== "string")
    {
      return ak_val;
    }
  
  pattern = ANSKEY_OPERATOR_OR;
  re = new RegExp(pattern, "gi");
  ak_val = ak_val.replace(re, " || ");
  
  pattern = ANSKEY_OPERATOR_CASE_SENSITIVE + " ";
  re = new RegExp(pattern, "gi");
  ak_val = ak_val.replace(re, "");
  
  pattern = ANSKEY_OPERATOR_NUMERIC_RANGE;
  re = new RegExp(pattern, "gi");
  ak_val = ak_val.replace(re, " → ");
  
  pattern = ANSKEY_OPERATOR_PLUSMINUS;
  re = new RegExp(pattern, "gi");
  ak_val = ak_val.replace(re, " ± ");
  
  //pattern = ANSKEY_OPERATOR_CHECKBOX;
  //re = new RegExp(pattern, "gi");
  //ak_val = ak_val.replace(re, "");

  // remove any %cb, including the optional number that can come after it
  if (ak_val.substring(0, 3).toLowerCase() === ANSKEY_OPERATOR_CHECKBOX)
    {
      var regex = /^%cb(\d+)?(\.\d+)? *(.*)/i;
      var found = ak_val.match(regex);
      ak_val = found[3];
    }
      
  return ak_val;
}
