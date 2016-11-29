<!DOCTYPE html>

<?!= HtmlService.createHtmlOutputFromFile('uiStyle').getContent(); ?>

<div id="shgr_mw">
    <div id="shgr_mw_instr">
        <table border="0">
        <tr>
        <td><img src="<?= FLUBAROO_WELCOME_IMG_URL ?>"
                     style="padding-right:15px;">
        </td>
        <td>
        
        <!-- show either the share or print instructions -->
        <span <?!= uiPrintOrShareScriplet_includeIfShareMode('style="display:none"')?> >
            <?= langstr("FLB_STR_PRINT_GRADES_INSTR") ?>
        </span>
        <span <?!= uiPrintOrShareScriplet_includeIfPrintMode('style="display:none"')?> >
            <?= langstr("FLB_STR_SHARE_GRADES_INSTR") ?>
        </span>
       
        <br><br>
        <span id="show_adv_options"><a id="show_adv_options_link" onClick="handleShowAdvancedOptClick();"><?=langstr('FLB_STR_EMAIL_GRADES_SHOW_ADVANCED')?></a></span>
        </td>
        </tr>
        </table>
    </div>
    
    <div id="shgr_mw_alert" class="error" style="display:none;"></div>

    <!-- <div class="vspacer_half"></div> -->
        
    <div id="shgr_mw_sel">
    <form id="share_selections" action ="">
  
    <!-- Hide the options to pick an email question and sharing method if we're just printing grades -->
    <span <?!= uiPrintOrShareScriplet_includeIfPrintMode('style="display:none"')?> >
    
    <table border=0>
    <tr><td valign="middle"><?= langstr("FLB_STR_EMAIL_GRADES_IDENTIFY_EMAIL") ?></td>
    <td>&nbsp;&nbsp;&nbsp;</td>
    <td valign="middle">
      <select name="email_ques" id="email_ques">
      <option value=""><?= langstr("FLB_STR_LOADING") ?></option>
      </select>
    </td>
    </tr>
    </table>
    
    <div class="vspacer_half"></div>

    <table border=0>
    <tr><td valign="middle"><?= langstr("FLB_STR_GRADES_SHARE_LABEL") ?></td>
    <td>&nbsp;&nbsp;&nbsp;</td>
    <td valign="middle">
      <select name="sharing_method" id="sharing_method">
         <option value="<?=GRADE_SHARE_METHOD_EMAIL?>"><?= langstr("FLB_STR_GRADES_SHARE_EMAIL") ?></option>
         <option value="<?=GRADE_SHARE_METHOD_DRIVE?>"><?= langstr("FLB_STR_GRADES_SHARE_DRIVE") ?></option>
         <option value="<?=GRADE_SHARE_METHOD_BOTH?>"><?= langstr("FLB_STR_GRADES_SHARE_BOTH") ?></option>      
      </select>
    </td>
    </tr>
    </table>
    </span>

    <table border=0>
    <tr><td valign="middle"><?= langstr("FLB_STR_EMAIL_GRADES_QUESTIONS_AND_SCORES") ?></td>
    <td>&nbsp;&nbsp;&nbsp;</td>
    <td valign="middle">
        <input type="checkbox" id="include_ques" name="include_ques" onclick="handleIncludeQuesBoxClick(this.checked);">
    </td>
    <td>&nbsp;&nbsp;&nbsp;</td>
    <td>
      <select name="include_ques_type" id="include_ques_type" style="display:none;">
         <option value="<?=QUESTIONS_SHARE_ALL?>"><?=langstr('FLB_STR_EMAIL_GRADES_INCLUDE_ALL_QUESTIONS')?></option>
         <option value="<?=QUESTIONS_SHARE_CORRECT?>"><?=langstr('FLB_STR_EMAIL_GRADES_INCLUDE_CORRECT_QUESTIONS')?></option>
         <option value="<?=QUESTIONS_SHARE_INCORRECT?>"><?=langstr('FLB_STR_EMAIL_GRADES_INCLUDE_INCORRECT_QUESTIONS')?></option>      
      </select>
    </td>
    </tr></table>

    <div id="include_stud_response_div" style="display:none;">
    <table border=0>
    <tr><td valign="middle"><?= langstr("FLB_STR_EMAIL_GRADES_INCLUDE_STUDENT_RESPONSES") ?></td>
    <td>&nbsp;&nbsp;&nbsp;</td>
    <td valign="middle">
        <input type="checkbox" id="include_stud_response" name="include_stud_response" checked>
    </td>
    </tr></table>
    </div>

    <div id="include_anskey_div">
    <table border=0>
    <tr><td valign="middle"><?= langstr("FLB_STR_EMAIL_GRADES_ANSWER_KEY") ?></td>
    <td>&nbsp;&nbsp;&nbsp;</td>
    <td valign="middle">
        <input type="checkbox" id="include_anskey" name="include_anskey">
    </td>
    </tr></table>
    </div>
    
    <div id = "cert_and_sticker" style="display:none;">
    <table width="350px" border="0" cellpadding="0" cellspacing="0">
    <tr>
        <!-- <td align="center" valign="middle" width="40px"><img src="<?=FLUBAROO_CERT_IMG_URL?>"></td><td align="left" valign="middle">&nbsp;<a href="javascript:void(0)" onclick = "openCertPicker()"><?= langstr("FLB_STR_GRADE_SHARE_INCLUDE_CERTIFICATE") ?></a></td> -->       
        <td align="center" valign="middle" width="75px"><img height="40px" id="chosen_sticker_icon" src="<?=FLUBAROO_SAMPLE_STICKER_ICON_URL?>"></td><td align="left" valign="middle">&nbsp;<a href="javascript:void(0)" onclick = "openStickerPicker()"><?= langstr("FLB_STR_GRADE_SHARE_SETUP_STICKER") ?></a><div id="no_sticker_enabled"></div></td>
    </tr>
    </table>
    </div>

    <div class="vspacer_half"></div>

    <?= langstr("FLB_STR_EMAIL_GRADES_INSTRUCTOR_MESSAGE") ?>
    <br>
    <textarea name="instr_message" id = "instr_message" type="textarea" cols="50" rows="4"></textarea>
    
    <div style="position: absolute;right:0;bottom:0;margin-top:20px;">
    <table border="0" id="shgr_mw_continue"><tr>
    <td valign="middle"><img id="shgr_mw_working" src="<?= FLUBAROO_WORKING_IMG_SPIN_URL ?>" style="display:none;"></td>
    <td width="35px"></td>
    <td valign="middle"><input type="button" id="submit_button" class="action" value="Continue" onclick="printOrShareSubmit();" disabled /></td>
    </tr></table>
    </div>

    </form>
    </div>

    <!-- Sticker Picker overlay -->
    <div id="light-sticker" class="share_grades_picker_white_content">
    <p><?= langstr("FLB_STR_GRADE_SHARE_INCLUDE_STICKER_INSTR") ?></p>
    <?= langstr("FLB_STR_GRADE_SHARE_STICKER_ENABLE") ?>:&nbsp;&nbsp;<input name="sticker_enable" type="checkbox" id="sticker_enable">
    
    <br><br>
    <div id="min_sticker_percent_div">
    <?= langstr("FLB_STR_GRADE_SHARE_MIN_STICKER_PERCENT") ?>: <input type="text" id="min_sticker_percent" name="min_sticker_percent" value="" size=3 maxlength=3>%
    <br><br>
    </div>
    
    <?= langstr("FLB_STR_GRADE_SHARE_PICK_STICKER") ?>:
    <br>
    <div id="sticker_picker_div" style="text-align:center;vertical-align:middle;line-height:110px;height:110px;border:1px;border-style:dotted;overflow-x:auto;overflow-y:hidden;white-space:nowrap;">
    <b><?= langstr("FLB_STR_LOADING") ?></b>
    </div>
    <div style="position: absolute;right:0;bottom:0;margin-top:20px;margin-bottom:10px;margin-right:10px;">
      <input type="button" id="sticker_picker_button" class="action" value="<?= langstr("FLB_STR_GRADE_SHARE_STICKER_DONE_BUTTON") ?>" onclick="stickerPickerSubmit();" />    
    </div>
    
    <div style="position: absolute;left:0;bottom:0;margin-top:20px;margin-bottom:15px;margin-left:10px;">
      <a href="https://sites.google.com/a/flubaroo.com/welcome-to-flubaroo/hc/add-more-stickers" target="_blank"><b><?= langstr("FLB_STR_GRADE_SHARE_STICKER_ADD_MORE") ?></b></a>
    </div>
    </div>
    
    <div id="fade-sticker" class="share_grades_picker_black_overlay"></div>
    
    <!-- Cert Picker overlay -->
    <div id="light-cert" class="share_grades_picker_white_content">Pick a certificate!</div>
    <div id="fade-cert" class="share_grades_picker_black_overlay"></div>
</div>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>

<script>

adv_options_hidden = true;
mode_is_share = true; // if false, then printing
include_questions_checked = true;

sticker_list_loaded = false;
drive_file_id = "";

function handleShowAdvancedOptClick()
{
  if (adv_options_hidden)
    {
      // Show the advanced options.
      $('#show_adv_options_link').text("<?=langstr('FLB_STR_EMAIL_GRADES_HIDE_ADVANCED')?>");
      
      // If "Include Questions & Scores" is checked, show all related questions.
      if (include_questions_checked)
        {
          $('#include_ques_type').show(200);
          $('#include_stud_response_div').show(200);
          $('#include_anskey_div').show(200);
        }
      
      // Show option for certificate and sticker
      $('#cert_and_sticker').show(200);
      adv_options_hidden = false;
    }
  else
    {
      // Hide the advanced options
      $('#show_adv_options_link').text("<?=langstr('FLB_STR_EMAIL_GRADES_SHOW_ADVANCED')?>");
      
      // Hide the all advanced checkboxes.
      $('#include_ques_type').hide(200);
      $('#include_stud_response_div').hide(200);
      
       // Hide option for certificate and sticker
      $('#cert_and_sticker').hide(200);
      adv_options_hidden = true;
    }
  
  return false;
}

function handleIncludeQuesBoxClick(cb_checked)
{
  if (cb_checked)
    {
      // user wants to include questions. 
      // enable checkboxes for answer key & include student response. 
      // also unhide select menu for type of questions to include.
      //document.getElementById('include_stud_response').disabled = false;
      //document.getElementById('include_anskey').disabled = false; 
      
      // If "Include Questions & Scores" checked, then show related advanced
      // options for that, assuming advanced options are being shown.
      if (!adv_options_hidden)
        {
          $('#include_ques_type').show(200);
          $('#include_stud_response_div').show(200);
        }
        
      // Show checkbox to include answer key
      $('#include_anskey_div').show(200);
        
      include_questions_checked = true;
    }
  else
    {
      // user doesn't want to include questions. none of these apply.
      // hide them (regardless of whether advanced options are showing or not)
      $('#include_ques_type').hide(200);
      $('#include_stud_response_div').hide(200);
      $('#include_anskey_div').hide(200);
      
      include_questions_checked = false;
    }

  return false;
}

function populateShareGradesFormData(data)
{
  if (data.mode === <?=UI_PRINT_DIALOGUE_MODE?>)
    {
      mode_is_share = false;  
    }

  if (mode_is_share)
    {
      // Populate the drop-down that selects which question was used
      // to collect email addresses.
      var email_select = document.getElementById('email_ques');
      email_select.remove(0); // remove generic "Loading..." item
  
      for (var i=0; i < data.stud_ident_ques_trunc.length; i++)
        {
          var opt = document.createElement("option");
          opt.value = data.stud_ident_ques_full[i];
          opt.innerHTML = data.stud_ident_ques_trunc[i];
      
          // then append it to the select element
          email_select.appendChild(opt);
        }
        
        email_select.selectedIndex = data.selected_stud_ident_index;
        
        document.getElementById('sharing_method').value = data.selected_share_option;
    }
    
  document.getElementById('include_ques').checked = data.include_questions_checked;
  document.getElementById('include_ques_type').value = data.selected_include_ques_type;
  document.getElementById('include_anskey').checked = data.include_anskey_checked;
  document.getElementById('include_stud_response').checked = data.include_student_resp_checked
  document.getElementById('instr_message').value = data.teacher_message;
  
  updateStickerIcon(data.sticker_enabled, data.chosen_sticker_fid);
    
  handleIncludeQuesBoxClick(data.include_questions_checked);    
       
  // enable Submit button
  document.getElementById('submit_button').disabled = false;
}

function printOrShareSubmit(form_obj)
{
  document.getElementById('submit_button').disabled = true;

  var form_obj = document.getElementById('share_selections');
  
  if (mode_is_share)
    {
      google.script.run.withSuccessHandler(showShareResult).processShareorPrintSubmit(form_obj);
    }
  else
    {
      google.script.run.withSuccessHandler(showPrintResult).processShareorPrintSubmit(form_obj);
    }
    
  document.getElementById('shgr_mw_working').style.display = "block";
    
  return false;
}

function showShareResult()
{
  google.script.host.close(); 
}

function showPrintResult()
{
  google.script.host.close(); 
}

function openStickerPicker()
{
  if (!sticker_list_loaded)
    {
      loadListOfStickers1();
    }
    
  $('#light-sticker').show(200);
  $('#fade-sticker').show(200);
}

function closeStickerPicker()
{
  $('#light-sticker').hide(200);
  $('#fade-sticker').hide(200);
}

function openCertPicker()
{
  $('#light-cert').show(200);
  $('#fade-cert').show(200);
}

function closeCertPicker()
{
  $('#light-cert').hide(200);
  $('#fade-cert').hide(200);
}

function loadListOfStickers1()
{
  // make sure "Done" button starts out disabled.
  document.getElementById('sticker_picker_button').disabled = true;

  google.script.run.withSuccessHandler(loadListOfStickers2)
                   .checkIfZipFilePresent();
}

function loadListOfStickers2(zip_present)
{
  if (zip_present)
    {
      // let the user know that this might take a little big.
      var picker_div = document.getElementById('sticker_picker_div');
      picker_div.innerHTML = '<?=langstr("FLB_STR_GRADE_SHARE_UNZIPPING")?>&nbsp;&nbsp;<img height=20 src="<?!=FLUBAROO_WORKING_IMG_SPIN_URL?>">';
    }

  google.script.run.withSuccessHandler(loadListOfStickersPost)
                   .withFailureHandler(loadListOfStickersError)
                   .uiShareGradesLoadStickerList();
}

function loadListOfStickersError()
{
  var picker_div = document.getElementById('sticker_picker_div');
  picker_div.innerHTML = "<b><?=langstr("FLB_STR_GRADE_SHARE_STICKER_PICKER_ERROR") ?></b>";
  return;
}

function loadListOfStickersPost(data)
{              
  document.getElementById('sticker_enable').checked = data.sticker_enabled;
  $('#min_sticker_percent').val(data.sticker_percent);
  
  drive_file_id = data.sticker_file_id;
  
  var picker_div = document.getElementById('sticker_picker_div');
  picker_div.innerHTML = '<table border=0><tr>';
  for (var i=0; i < data.ids.length; i++)
    {
      if (data.ids[i] !== "0")
        {
          picker_div.innerHTML += '<td><img id="' + data.ids[i] + '" src="<?!=DRIVE_EMBED_IMAGE_URL?>' + data.ids[i] + '" height=90 onclick="handleStickerSelect(\'' + data.ids[i] + '\')"></td>';
        }
    }
  picker_div.innerHTML += '</tr></table>';

  var s = document.getElementById(data.sticker_file_id);
  if (s)
    {
      s.style.border='1px solid #E8272C';
    }

  document.getElementById('sticker_picker_button').disabled = false;

  sticker_list_loaded = true;        
}

function handleStickerSelect(img_id)
{
  // remove the red border around the previously selected image
  if (drive_file_id !== "")
    {
      var last_sticker = document.getElementById(drive_file_id);
      if (last_sticker)
        {
          last_sticker.style.border='';
        }
    }
    
  // add a red border to the new selected image
  document.getElementById(img_id).style.border='1px solid #E8272C';
  
  drive_file_id = img_id;
}

function stickerPickerSubmit()
{
  var sticker_enabled = document.getElementById('sticker_enable').checked;
  var sticker_percent_box = document.getElementById('min_sticker_percent');
  var sticker_percent = sticker_percent_box.value;
  
  google.script.run.withSuccessHandler(stickerPickerSubmitPost)
                   .uiShareGradesSaveSticker(sticker_enabled, drive_file_id, sticker_percent);
                   
}

function stickerPickerSubmitPost()
{
  var sticker_enabled = document.getElementById('sticker_enable').checked;

  updateStickerIcon(sticker_enabled, drive_file_id);
  closeStickerPicker();
}

function updateStickerIcon(sticker_enabled, sticker_file_id)
{
  // update the icon on the main Share Grades window to match
  if (sticker_file_id !== "")
    {
      document.getElementById('chosen_sticker_icon').src = "<?!=DRIVE_EMBED_IMAGE_URL?>" + sticker_file_id;
    }
    
  if (!sticker_enabled)
    {
      document.getElementById('no_sticker_enabled').innerHTML = "&nbsp;<?=langstr('FLB_STR_GRADE_SHARE_STICKER_NOT_ENABLED')?>";
    }
  else
    {
      document.getElementById('no_sticker_enabled').innerHTML = "";    
    }
}


// run on load (for share grades mode only)
$(function() {
    google.script.run.withSuccessHandler(populateShareGradesFormData)
                     .uiShareGradesGetFormData();
});


</script>
