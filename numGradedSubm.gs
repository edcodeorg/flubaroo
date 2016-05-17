// num_graded_subm.gas.gs
// ======================
//
// Manage a local copy of the number of graded submissions.

// Unit Tests
// ==========

// testNumGradedSubm()
// -------------------

function testNumGradedSubm()
{
  var old_value = NumGradedSubm.get();
  
  NumGradedSubm.set(9999);
  Debug.assert(NumGradedSubm.get() === 9999, "testNumGradedSubm() - FAILED");
  
  NumGradedSubm.set(old_value);
  
  return true;
  
} // testNumGradedSubm()

// Number Graded Submissions Service
// =================================

NumGradedSubm = new NumGradedSubmClass();

// NumGradedSubmClass()
// ====================
//
// Keep a local copy of the number of graded submissions. This 
// speeds things up a bit but is also to overcome possible caching 
// issues with retrieving the script property during the context
// of a single thread, ie. if the value is set and then got quickly 
// the value returned isn't always the new one.

function NumGradedSubmClass()
{
  var num_graded_subm;
 
  // NumGradedSubmClass.get()
  // ------------------------
  //
  // return number of graded submissions or -1.
  
  this.get = function()
  {   
    var dp = PropertiesService.getDocumentProperties();
 
    if (typeof num_graded_subm === 'undefined')
      {
        var num_string = dp.getProperty(DOC_PROP_NUM_GRADED_SUBM);
        
        if (num_string !== null)
          {
            num_graded_subm = Number(num_string);

            if (num_graded_subm === NaN)
              {
                Debug.error("NumGradedSubmClass.get() - non-numeric value");
                num_graded_subm = -1;
              }
          }
        else
          {
            Debug.warning("NumGradedSubmClass.get() - value not stored yet");
            num_graded_subm = -1;            
          }
      }
    else if (typeof num_graded_subm !== 'number')
      {
        Debug.error("NumGradedSubmClass.get() - unexpected type");
        num_graded_subm = -1;
      }

    Debug.info("NumGradedSubmClass.get() - " + 
               "num_graded_subm: " + num_graded_subm);

    return num_graded_subm;
    
  } // NumGradedSubmClass.get()
  
  // NumGradedSubmClass.set()
  // ------------------------
  
  this.set = function(value)
  {
    var dp = PropertiesService.getDocumentProperties();
    
    Debug.assert(typeof value === 'number',
                 "NumGradedSubmClass.set() - non-number parameter");
  
    num_graded_subm = value;
  
    dp.setProperty(DOC_PROP_NUM_GRADED_SUBM, value);
    
    Debug.info("NumGradedSubmClass.set() - " + 
               "num_graded_subm: " + value);
    
  } // NumGradedSubmClass.set()
    
} // NumGradedSubmClass()

