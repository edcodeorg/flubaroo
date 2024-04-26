// File: definitions.gas
// Description: 
// This file contains all constants and global variable definitions.

// TODO_AJR - These could all go in a global Flubaroo object (although
// probably only an issue is we start using libraries?? At least the
// constants could be enumed.

// TODO_AJR - A lot of these are constants and as such, and to be consistent
// should be in capitals.

// TODO_AJR - Use enums.

DEBUG_ON = false;
LOGGING_ON = false;

LOG_SHEET_NAME = "log";
FIELD_LOG_SHEET_NAME = "fieldlog";
FIELD_RESET_SHEET_NAME = "fieldreset";
FIELD_LOG_DEFAULT_RATE = 25;
FIELD_LOG_WRAP_AROUND = 20000;

// Current version. Shown in "About Flubaroo" dialogue.
gbl_version_str = "Version 75";
                  
// NOTE: Update version in README.gas                  

// Version update notice. Set this to true when a new version is made
// available (gbl_version_str is updated). A message will then be popped up during
// first install of the updated script (see FLB_STR_NEW_VERSION_NOTICE)
gbl_show_version_update_notice = true;

// gbl_invalidate_grades_on_update:
// Set to true only when a new version has changed the format of the Grades sheet,
// and so it cannot be read upon re-grade to check on things like Already Emailed status.
gbl_invalidate_grades_on_update = false;

// Global variables for naming things
gbl_menu_name = 'Flubaroo';

// Names of the sheets for submissions and grades in English language versions
// of Flubaroo. As of version 3.0, we now support other languages. But these
// names will always work to support backwards compatability.
gbl_subm_sheet_name = 'Student Submissions';
gbl_grades_sheet_name = 'Grades';

// Global variables that relate to row and column numbers or lengths.
gbl_grades_start_row_num = 8;
gbl_num_metrics_cols = 6; // score, percent, 
                          // times submitted, 
                          // already emailed, student feedback,
                          // subm copy row index

MAX_QUESTION_POINTS_DEFAULT = 10; // max number of points possible to assign to a question in Step 1.

PALE_YELLOW = "#ffffcc";
PALE_RED = "#e05252";

// ID's of the metrics columns, starting from 0. These are written out in 
// 'Grades' after the student identifiers.
METRIC_TOTAL_POINTS = 0;
METRIC_PERCENT = 1;
METRIC_TIMES_SUBMITTED = 2;
METRIC_EMAILED_GRADE = 3;
METRIC_STUDENT_FEEDBACK = 4; // not really a "metric", but hijack this logic.
METRIC_SUBM_COPY_ROW_INDEX = 5; // hidden column. points to row in Grades sheet

gbl_num_summary_rows = 4;  // number of rows at the top of 'Grades' that contain summary data.

GRADES_SUMMARY_PTS_POSSIBLE_ROW_NUM  = 3; // row where "Points Possible" appears at the top of the Grades sheet.
GRADES_SUMMARY_AVG_PTS_ROW_NUM       = 4; // row where "Average Points" appears at the top of the Grades sheet.
GRADES_SUMMARY_COUNTED_SUBM_ROW_NUM  = 5; // row where "Counted Submissions" appears at the top of the Grades sheet.
GRADES_SUMMARY_LOW_SCORE_ROW_NUM     = 6; // row where "Number of Low Scoring Questions" appears at the top of the Grades sheet.
GRADES_CATEGORY_NAMES_ROW_NUM        = 7; // row where (optional) category names are stored

FLUBAROO_WELCOME_IMG_URL =
  'https://scooper.gleeda.net/flubaroo/flubaroo_128x128_no_padding.png';
FLUBAROO_WORKING_IMG_BAR_URL =
  'https://scooper.gleeda.net/flubaroo/flubaroo_working.gif';
FLUBAROO_WORKING_IMG_SPIN_URL =
  'https://scooper.gleeda.net/flubaroo/loading-spinner.gif';
FLUBAROO_TIP_IMG_URL =
  'https://scooper.gleeda.net/flubaroo/tips.png';
FLUBAROO_CERT_IMG_URL =
  'https://scooper.gleeda.net/flubaroo/cert30x30.png';
FLUBAROO_MARQUEE_IMG_URL =
  'https://scooper.gleeda.net/flubaroo/flubaroo_marquee_280.png';

// DRIVE_EMBED_IMAGE_URL = 
//   'https://docs.google.com/uc?id=';

DRIVE_EMBED_IMAGE_URL = 
  'https://drive.google.com/thumbnail?id=';

FLUBAROO_SAMPLE_STICKER_ICON_URL = DRIVE_EMBED_IMAGE_URL + "0B3gmIDjKT36hdXl0c3ZvcWlTNW8";

FLB_AUTOGRADE_SELECT_MODE_URL = "http://www.flubaroo.com/hc/selecting-an-autograde-mode";

// Grading option identifiers
GRADING_OPT_STUD_ID = "Identifies Student";
GRADING_OPT_SKIP = "Skip Grading";
GRADING_OPT_NORMAL = "Normal Grading";
GRADING_OPT_MANUAL = "Manual Grading"; // aka Grade By Hand
GRADING_OPT_EXTRA_CREDIT = "+Extra Credit"; // appended onto NORMAL or MANUAL grading options (i.e. "Normal Grading+Extra Credit").
GRADING_OPT_NORMAL_EC = GRADING_OPT_NORMAL + GRADING_OPT_EXTRA_CREDIT;
GRADING_OPT_MANUAL_EC = GRADING_OPT_MANUAL + GRADING_OPT_EXTRA_CREDIT;
GRADING_OPT_IGNORE = "Ignore";
GRADING_OPT_COPY_FOR_REFERENCE = "Copy for Reference";

// Used to initialize GradesWorksheet
// TODO_AJR- Add else/default on type testing to catch illegal type throughout code.
INIT_TYPE_SUBM = 0;             // initialies from the Student Submissions worksheet.
INIT_TYPE_GRADED_FULL = 1;      // initializes from the Grades worksheet. Reads in everything.
INIT_TYPE_GRADED_META = 2;      // same as INIT_TYPE_GRADED_FULL, but only reads in meta info (headers, grading_opt), and 
                                // doesn't read-in all of the actual graded submissions, or original submisions.
INIT_TYPE_GRADED_PARTIAL = 3;   // same as INIT_TYPE_GRADED_FULL, but skips reading in all of the original submissions
                                // in the hidden rows. Used when reading in an existing Grades sheet when re-grading.
INIT_TYPE_SUBM_ONLY_LATEST = 4; // same as INIT_TYPE_SUBM, but only pulls in latest submissions that haven't been graded yet
                                // (for use with autograde).
INIT_TYPE_GRADED_ONLY_LATEST = 5; // same as INIT_TYPE_GRADED_FULL, but reads in only the most recently written rows to the Grades
                                  // sheet. For use with autograde when only grading most recent submissions. 

GRADES_SHEET_UPDATE_TYPE_REGEN = 1;  // Typical case of regenerating entire Grades sheet
GRADES_SHEET_UPDATE_TYPE_INSERT = 2; // Case sometimes used by Autograde that just inserts new graded rows into existing Grades sheet.

// Used for function createRowForGradesSheet (member of GradedSubmission)
GRADES_OUTPUT_ROW_TYPE_GRADED_VALS = 0;
GRADES_OUTPUT_ROW_TYPE_QUESTIONS_HEADER = 1;
GRADES_OUTPUT_ROW_TYPE_QUESTIONS_FULL = 2;
GRADES_OUTPUT_ROW_TYPE_ANSWER_KEY = 3;
GRADES_OUTPUT_ROW_TYPE_GRADING_OPT = 4;
GRADES_OUTPUT_ROW_TYPE_SUBMISSION_VALS = 5;
GRADES_OUTPUT_ROW_TYPE_HELP_TIPS = 6;
GRADES_OUTPUT_ROW_TYPE_MANUALLY_GRADED_COMMENTS = 7;
GRADES_OUTPUT_ROW_TYPE_CATEGORY_NAMES = 8;

gbl_num_hidden_rows = 4;       // number of hidden rows at the bottom of the Grades sheet,
                                // not including the copies of the original submissions or manually graded question comments.
gbl_num_space_before_hidden = 5;

// Indices into hidden rows in grades sheet
GRADES_HIDDEN_ROW_TYPE_GRADING_OPT = 0;
GRADES_HIDDEN_ROW_TYPE_HELP_TIPS = 1;
GRADES_HIDDEN_ROW_TYPE_ANSWER_KEY = 2;
GRADES_HIDDEN_ROW_TYPE_QUESTIONS_FULL = 3;
GRADES_HIDDEN_ROW_TYPE_SUBMISSION_VALS = 4;
GRADES_HIDDEN_ROW_TYPE_MANUALLY_GRADED_COMMENTS = 5;

// Fixed cells in the Grades sheet, which are referenced in sheet equations.
GRADES_POINTS_POSSIBLE_CELL = "$B$2";
GRADES_COUNTED_SUBMISSIONS_CELL = "$B$4";

// The constants below define the max submissions (in Stud Subm sheet) Flubaroo will process.
// The actual value used depends on the mode Flubaroo is running in.
/*
MAX_SUBMISSIONS_MENU_GRADING = 500;          // grading just from menu. so no sharing of grades.
MAX_SUBMISSIONS_AUTOGRADE_REGEN_MODE = 150;  // autograde recreating entire grades sheet.
MAX_SUBMISSIONS_AUTOGRADE_INSERT_MODE = 1E9; //autograde just inserting most recently graded submissions. no practical limit
*/

// Status codes for function return values
STATUS_OK = 0
STATUS_NOT_FOUND = 1
STATUS_NO_EFFECT = 2
STATUS_CANNOT_CONTINUE = 3
STATUS_FILE_ERROR = 4

// ENOUGH_SUBM_SOURCE definitions
ENOUGH_SUBM_SOURCE_USER_FROM_MENU         = 0   // user selects "Grade Assignment" from menu 
ENOUGH_SUBM_SOURCE_USER_AG_SETUP_OPTIONS  = 1   // user setting up or updating autograde options 
ENOUGH_SUBM_SOURCE_USER_AG_GRADE_RECENT   = 2   // user chooses to grade recent submissions at end of autograde setup
ENOUGH_SUBM_SOURCE_AG_SUBMISSION   = 3   // a student submission triggers grading (when autograde turned on)

// Definition of ways grades are shared
GRADE_SHARE_METHOD_EMAIL  = 0
GRADE_SHARE_METHOD_DRIVE  = 1
GRADE_SHARE_METHOD_BOTH   = 2

// Definition of if/how questions are shared
QUESTIONS_SHARE_ALL       = 0
QUESTIONS_SHARE_CORRECT   = 1
QUESTIONS_SHARE_INCORRECT = 2

// Definitions of if/how overall scores are shown when grades are shared
GRADE_SHARE_SHOW_POINTS_AND_PERCENT = 0 // default, typical behavior
GRADE_SHARE_SHOW_POINTS_ONLY = 1
GRADE_SCORE_SHOW_NEITHER = 2

// Defines which mode the Share Grades / Print Grades dialogue is being used in
UI_SHARE_DIALOGUE_MODE = "share";
UI_PRINT_DIALOGUE_MODE = "print";

// Script and user properties
DOC_PROP_HISTOGRAM_URL = "flubaroo_histogram_url";
DOC_PROP_NUM_GRADED_SUBM = "flubaroo_num_graded_subm";
DOC_PROP_UI_GRADING_OPT = "flubaroo_ui_grading_opt2"; // v28 changed _opt to _opt2 to handle changes in grading options.
DOC_PROP_UI_CATEGORY_NAMES = "flubaroo_ui_category_names";
DOC_PROP_ANSWER_KEY_ROW_NUM = "flubaroo_anskey_row_num";
DOC_PROP_STUDENT_FEEDBACK_HIDDEN = "flubaroo_student_feedback_hidden";
DOC_PROP_HELP_TIPS_HIDDEN = "flubaroo_help_tips_hidden";
DOC_PROP_NUM_STUDENT_IDENTIFIERS = "flubaroo_num_student_identifiers";
DOC_PROP_SHEET_INSTALLED_VERSION = "flubaroo_sheet_installed_version";
DOC_PROP_EMPTY_SUBM_ROW_PTR = "flubaroo_submission_empty_subm_row_ptr";
DOC_PROP_SKIP_EMAIL = "flubaroo_skip_email";
DOC_PROP_LAST_GRADED_ROW_COUNT = "flubaroo_auto_grade_last_row_count";
DOC_PROP_NUM_COLS_IN_GRADES = "flubaroo_num_cols_in_grades";

DOC_PROP_EMAIL_ADDRESS_QUESTION = "flubaroo_email_address_question";
DOC_PROP_EMAIL_SHARE_OPTION = "flubaroo_email_share_option";
DOC_PROP_EMAIL_INCLUDE_QUESTIONS_SCORES = "flubaroo_email_include_quesions_scores";
DOC_PROP_EMAIL_INCLUDE_QUESTIONS_TYPE = "flubaroo_email_include_questions_types"; // set to QUESTIONS_SHARE_*
DOC_PROP_EMAIL_INCLUDE_STUD_RESP = "flubaroo_email_include_student_responses";
DOC_PROP_EMAIL_INCLUDE_ANSWER_KEY = "flubaroo_email_include_answer_key";
DOC_PROP_EMAIL_INSTRUCTOR_MESSAGE = "flubaroo_email_instructor_message";
DOC_PROP_EMAIL_INSTRUCTOR_ADDRESS = "flubaroo_email_instructor_address";
DOC_PROP_EMAIL_FIRST_PROPERTIES_SET = "flubaroo_email_first_properties_set";

DOC_PROP_AUTOGRADE_SUBMIT_TRIGGER_ID = "flubaroo_auto_grade_submit_trigger_id";
DOC_PROP_AUTOGRADE_MONITOR_TRIGGER_ID = "flubaroo_auto_grade_monitor_trigger_id";
DOC_PROP_AUTOGRADE_ENABLED = "flubaroo_auto_grade_enabled";
DOC_PROP_AUTOGRADE_GATHERING_OPTIONS = "flubaroo_auto_grade_gathering_options";
DOC_PROP_AUTOGRADE_RUNNING = "flubaroo_auto_grade_running";
DOC_PROP_AUTOGRADE_DO_FULL_REGRADE = "flubaroo_auto_grade_do_full_regrade";
DOC_PROP_AUTOGRADE_ANSWER_VALUES = "flubaroo_auto_grade_anskey_values";
DOC_PROP_CLEAR_VS_DELETE_GRADES_SHEET = "flubaroo_clear_vs_delete_grades_sheet";

USER_PROP_NEXT_TIP_NUMBER = "flubaroo_next_tip_number";

DOC_PROP_MGR_STORED_METADATA = "flubaroo_mgr_stored_metadata";

DOC_PROP_UI_OFF = "flubaroo_ui_off"; // Default - if not set - is on.
DOC_PROP_UI_WAS_OFF = "flubaroo_ui_was_off"; // The UI state before the last autograde transition.

DOC_PROP_STICKER_ENABLED = "flubaroo_sticker_enabled";
DOC_PROP_STICKER_FILE_ID = "flubaroo_sticker_file_id";
DOC_PROP_STICKER_RESOURCE_KEY = "flubaroo_sticker_resource_key";

DOC_PROP_STICKER_THRESHOLD1 = "flubaroo_sticker_threshold1";

EMAIL_SEND_NAME_DEFAULT = "Flubaroo Grader"; // Used if noreply@ is off, and no name set by user.

// FLB_AUTOGRADE_AK_DELIMITER: Used to delimit answers to questions when we store the 
// entire answer key row as a property for autograding.
FLB_AUTOGRADE_AK_DELIMITER = "%%FLB_AG_AK_DELIMITER%%";

// FLB_GENERIC_DELIMETER: Used for generic delimitering, such as in property strings.
FLB_GENERIC_DELIMETER = "%%FLB_DELIM%%";

MY_FLUBAROO_STICKERS_FOLDER = "Flubaroo - Stickers";

/* Properties to store Advanced Options.
   For the true/false properties, they exist if true, and don't exist if false.
 */
DOC_PROP_ADV_OPTION_EMAIL_EDIT_LINK = "flubaroo_adv_option_email_edit_link";
DOC_PROP_ADV_OPTION_PASS_RATE = "flubaroo_adv_option_pass_rate";
USER_PROP_ADV_OPTION_NO_NOREPLY = "flubaroo_adv_option_no_noreply";
USER_PROP_ADV_OPTION_EXTRA_CREDIT = "flubaroo_adv_option_extra_credit";
USER_PROP_ADV_OPTION_SHOW_ADDITIONAL_GOPTS = "flubaroo_adv_option_show_additonal_gopts";
USER_PROP_ADV_OPTION_MGR_ADVANCE_BY_QUESTION = "flubaroo_adv_option_mgr_advance_by_question";
USER_PROP_ADV_OPTION_SHARE_GRADE_SCORE_TYPE = "flubaroo_adv_option_share_grade_score_type";
USER_PROP_ADV_OPTION_EMAIL_SEND_NAME = "flubaroo_adv_option_email_send_name";
USER_PROP_ADV_OPTION_SHOW_ANSKEY_FOR_MGR_QUES = "flubaroo_adv_option_show_anskey_for_mgr_ques";
USER_PROP_ADV_OPTION_MAX_QUESTION_POINTS = "flubaroo_adv_option_max_question_points";

DOC_PROP_FORM_SUBMIT_TRIGGER_ID = "flubaroo_form_submit_trigger_id";

USER_PROP_GRADE_MONTH = "flubaroo_grade_month";  // month that count corresponds to
USER_PROP_GRADE_MONTH_COUNT = "flubaroo_grade_month_count"; // # of times grading has occured (on any assignment) during this month
USER_PROP_GRADE_LIFETIME_COUNT = "flubaroo_grade_lifetime_count";

USER_PROP_LANGUAGE_ID = "flubaroo_language_id"; // only set if "Set Language" menu used.

USER_PROP_LATEST_VERSION_INSTALLED = "flubaroo_latest_version_installed";

USER_PROP_AUTOGRADE_ACTIVE_USES = "flubaroo_auto_grade_active_uses";

USER_PROP_UPDATE_NOTICE_DATE = "update_notice_date";

// Set when/if the welcome message is shown on first install.
USER_PROP_FIRST_TIME_WELCOME_SHOWN = "flubaroo_welcome_message_shown";

USER_PROP_LAST_DAILY_PING = "user_prop_last_daily_ping";

DOC_PROP_SHARE_OR_PRINT_GRADES = "flubaroo_share_or_print_grades";

USER_PROP_TIMEZONE = "flubaroo_user_timezone";
USER_PROP_LOCALE = "flubaroo_user_locale";

// Window height & width for UIs
UI_STEP1_WIDTH = 600;
UI_STEP1_HEIGHT = 525;
UI_STEP2_WIDTH = 700;
UI_STEP2_HEIGHT = 505;
UI_MGR_WIDTH = 820;
UI_MGR_HEIGHT = 570;
UI_SHARE_GRADES_WIDTH = 575;
UI_SHARE_GRADES_HEIGHT = 585;
UI_PRINT_GRADES_WIDTH = 575;
UI_PRINT_GRADES_HEIGHT = 585;
UI_ADV_OPT_WIDTH = 750;
UI_ADV_OPT_HEIGHT = 450;

// List of support Zip MIME types for unzipping stickers
ZIP_TYPES_ARRAY = ['application/zip', 'application/x-zip-compressed', 'application/x-zip', 'application/octet-stream'];

// special answer key operators
ANSKEY_OPERATOR_OR = " %or ";
ANSKEY_OPERATOR_NUMERIC_RANGE = " %to ";
ANSKEY_OPERATOR_CASE_SENSITIVE = "%cs";
ANSKEY_OPERATOR_CHECKBOX = "%cb"; // also hard-coded in a regex in gradedSubmssion.gs and email.gs
ANSKEY_OPERATOR_PLUSMINUS = "%pm";

// TODO_AJR - Make this optional.
// The certificate template. 
// Set to "" to disable feature.
DOC_TEMPLATE = "";
DOC_NAME = ""
  
// Default pass rates
LOWSCORE_QUESTION_PERCENTAGE = 0.60;
LOWSCORE_STUDENT_PERCENTAGE = 0.70;
CERTIFICATE_PASS_PERCENTAGE = 50.0;

// Used for specially formatting columns when writing Grades sheet
FLB_COLFORMAT_GREY_ITALIC_TEXT = "<<FLB_COLFORMAT_GREY_ITALIC_TEXT>>";
FLB_COLFORMAT_HIDDEN = "<<FLB_COLFORMAT_HIDDEN>>";
FLB_COLFORMAT_WRAP_TEXT = "<<FLB_COLFORMAT_WRAP_TEXT>>";

// EVENT NAMES FOR EVENT LOGGING:
FLB_EVENT_ASSIGNMENT_GRADED = 'FLB_EVENT_ASSIGNMENT_GRADED';
FLB_EVENT_FIRST_INSTALL = 'FLB_EVENT_FIRST_INSTALL';

// Flubaroo Updates:
// The next 3 lines control when an update message is shown to the user in Flubaroo.
// The message is shown only once, the first time a user opens a spreadsheet where Flubaroo
// is installed. Be sure to update the notice date when you want to show a new message,
// as Flubaroo will only show a message for that same date one time.
// TODO: How do we localize this for other languages? For now, we don't.
gbl_update_notice_date  = '4/25/24';
gbl_update_notice_title = 'Flubaroo Update Notice';
gbl_update_notice_msg   = '';

INCLUDED_STICKER_BASE_IMG_URL = 'https://flubaroo2.appspot.com/stickers/';
INCLUDED_STICKERS = [
  'Baseball.png',
  'ChocolateBar.png',
  'Notepad.png',
  'Robot-RedLight.png',
  'Star-SuperJob.png',
  'Basketball.png',
  'Flower.png',
  'Pizza.png',
  'Smiley-Awesome.png',
  'Sun.png',
  'Book.png',
  'Football.png',
  'Ribbon.png',
  'Smiley-NiceWork.png',
  'ThumbsUp.png',
  'Calculator.png',
  'Light Bulb.png',
  'Robot-GreenLight.png',
  'Star-AmazingWork.png',
  'Trophy.png',
  'ChemistryBeaker.png',
  'Ninja.png',
  'Robot-OrangeLight.png',
  'Star-Fabulous.png',
  'WeightLifter.png'
];