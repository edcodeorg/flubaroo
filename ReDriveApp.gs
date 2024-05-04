/*
  ReDriveApp (short for "Recommended" or "Replacement" DriveApp)
  https://github.com/googleworkspace/redriveapp

  Provides equivalent methods offered by the built-in DriveApp, but that only require use of 
  '/drive.file' Drive OAuth scope (a "Recommended" OAuth scope). Requires use of Apps Script
  Advanced Services (Drive) defined with identifier 'Drive' in your Apps Script manifest file.

  Created in light of the new Google OAuth changes that make full '/drive' scope a 'Restricted'
  scope for existing apps. Apps which use Restricted scopes have more requirements for public 
  (non-internal) apps, such as a CASA security review. Further, many apps don't really need
  the full '/drive' scope, but are forced to request it as a result of using the convenient
  DriveApp service.
  
  ReDriveApp also replaces built-in, related Apps Script classes with equivalents:
    File             --> ReFile
    Folder           --> ReFolder
    User             --> ReUser
    FileIterator     --> ReFileIterator
    FolderIterator   --> ReFolderIterator
     
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except 
  in compliance with the License. You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software distributed under the License
  is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express 
  or implied. See the License for the specific language governing permissions and limitations under 
  the License.
*/

////////////////////////////////////////// ReDriveApp //////////////////////////////////////////////

// Static class methods for ReDriveApp
// noinspection JSUnusedGlobalSymbols, ThisExpressionReferencesGlobalObjectJS
this['ReDriveApp'] = {
  // Add local alias to run the library as normal code\
  createFile: createFile,
  getFileById: getFileById,
  getFolderById: getFolderById,
  createFolder: createFolder,
  getFoldersByName: getFoldersByName,
  getFilesByName: getFilesByName,
  searchFiles: searchFiles,
  searchFolders: searchFolders,
  setDriveApiVersion: setDriveApiVersion
};

// Global DriveApiVersion_ must be set to 2 or 3 before anything
// else can be used. 
// Note: For now only v2 is supported and tested.
DriveApiVersion_ = undefined; 

DOC_PROP_REDRIVEAPP_DRIVE_API_VERSION = 'DOC_PROP_REDRIVEAPP_DRIVE_API_VERSION';
DEFAULT_DRIVE_API_VERSION_NUMBER = 2; // 2 is default since 3 wasn't even supported until Dec 2023.

function getDriveApiVersion_() {

  // was version previously set? if so, return it immediately.
  if (DriveApiVersion_) {
    return DriveApiVersion_;
  }

  // not yet set. check if sticky value.
  var ps = PropertiesService.getDocumentProperties();
  if (!ps) {
    // not running in context of Document
    ps = PropertiesService.getScriptProperties();
  }
  var stickyVersion = ps.getProperty(DOC_PROP_REDRIVEAPP_DRIVE_API_VERSION);
  if (stickyVersion) {
    DriveApiVersion_ = Number(stickyVersion);
  }

  // not yet set, and no sticky value. use default.
  else {
    DriveApiVersion_ = DEFAULT_DRIVE_API_VERSION_NUMBER;
  }

  return DriveApiVersion_;
}

function setDriveApiVersion(versionNumber, sticky) {
  DriveApiVersion_ = versionNumber;

  if (sticky) {
    var ps = PropertiesService.getDocumentProperties();
    if (!ps) {
    // not running in context of Document
    ps = PropertiesService.getScriptProperties();
   }

    ps.setProperty(DOC_PROP_REDRIVEAPP_DRIVE_API_VERSION, DriveApiVersion_);
  }

}

function getFileById(fileId) {

  var driveFilesResource = Drive.Files.get(fileId, {supportsAllDrives: true});

  return new ReFile_.Base({
    driveFilesResource: driveFilesResource, // 'Files' recourse from Drive API
  });
}

/* 
  Replicate 3 different calls to DriveApp.createFile():
    - DriveApp.createFile(blob) // 1 arg
    - DriveApp.createFile(name, content) // 2 args
    - DriveApp.createFile(name, content, mimeType) // 3 args
 */
CREATE_FILE_SIG_BLOB = 1;
CREATE_FILE_SIG_NC = 2;
CREATE_FILE_SIG_NCM = 3;

function createFile(a1, a2, a3) {

  var signature;
  var newFile;

  if (a1 === undefined) {
    throw new Error("Invalid number or arguments to createFile()")
  } else if (a2 === undefined && a3 === undefined) {
    signature = CREATE_FILE_SIG_BLOB;
  } else if (a2 !== undefined && a3 === undefined) {
    signature = CREATE_FILE_SIG_NC;
  } else {
    signature = CREATE_FILE_SIG_NCM;
  }

  if (signature === CREATE_FILE_SIG_BLOB) {
    newFile = createFileFromBlob_(a1);
  } else if (signature === CREATE_FILE_SIG_NC ) {
    newFile = createFileFromContentAndMimetype_(a1, a2, 'text/plain');
  } else if (signature === CREATE_FILE_SIG_NCM ) {
    newFile = createFileFromContentAndMimetype_(a1, a2, a3);
  }

  return newFile;  
}

function createFileFromBlob_(blob) {

  if (getDriveApiVersion_() === 3) {
    throw new Error('createFile() not yet supported by ReDriveApp for Drive API v3')
  } else {
    var newFile = {
      title: blob.getName(),
      mimeType: blob.getContentType()
    };
    
    var driveFilesResource = Drive.Files.insert(newFile, blob); 
    
    return new ReFile_.Base({
      driveFilesResource: driveFilesResource, // 'Files' recourse from Drive API
    });
  }
}

function createFileFromContentAndMimetype_(name, content, mimeType) {
  if (getDriveApiVersion_() === 3) {
    throw new Error('createFile() not yet supported by ReDriveApp for Drive API v3')
  } else {
    var mimeTypeStr = mimeType.toString(); // convert from Apps Script MimeType enum

    var newFile = {
      title: name,
      mimeType: mimeTypeStr
    };

    var blob = Utilities.newBlob(content, mimeType);

    var driveFilesResource = Drive.Files.insert(newFile, blob);

    return new ReFile_.Base({
      driveFilesResource: driveFilesResource, // 'Files' recourse from Drive API
    });
  }
}

function getFolderById(folderId) {
 
  var reFile = ReDriveApp.getFileById(folderId,  {supportsAllDrives: true});

  return new ReFolder_.Base({
    reFile: reFile
  });
}

function getFilesOrFoldersByName_(name, isFolders, optParentId) {
  var queryString;

  // perform proper qutoe escaping of strings passed in query(in this case, file/folder name)
  name = name.replace(/'/g, "\\'");

  if (getDriveApiVersion_() === 2) {
    queryString = "title = '" + name + "'";
  } else {
    queryString = "name = '" + name + "'";
  }

  return searchFilesOrFolders_(queryString, isFolders, optParentId);
}

// Note on query from Google's Drive API documentation:
// The params argument is a query string that can contain string values, so take care to escape
// quotation marks correctly (for example "title contains 'Gulliver\\'s Travels'"
//  or 'title contains "Gulliver\'s Travels"').
function searchFilesOrFolders_(queryString, isFolders, optParentId) {
  if (isFolders) {
    queryString += " and mimeType = 'application/vnd.google-apps.folder'";
  } else {
    queryString += " and not mimeType = 'application/vnd.google-apps.folder'";
  }

  // for saerching within a folder
  if (optParentId) {
    queryString += " and parents in '" + optParentId + "'";
  }

  var options = {
    corpora: 'default',  // 'user' gives "Invalid Value" error
    //maxResults: 10, // for testing pagination
    q: queryString,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  };

  // Note: Due to only having drive.file scope, the following list() call will only
  // return files/folders that the app using this library was used to create or select.
  var results = Drive.Files.list(options);
  
  // console.log('results.items.length = ' + results.items.length)
  var nextPageToken;
  if (results.hasOwnProperty('nextPageToken') && results.nextPageToken) {
    nextPageToken = results.nextPageToken;
  } else {
    nextPageToken = null;
  }

  var files;

  if (getDriveApiVersion_() === 2) {
    files = results.items;
  } else {
    files = results.files;
  }

  // console.log('files length: ' + files.length)
  var fi = new ReFileIterator_.Base({
    nextPageToken: nextPageToken,
    queryString: queryString,
    files: files,
    filesIndex: 0,
  });

  if (isFolders) {
    return new ReFolderIterator_.Base({
      fileIterator: fi
    });
  } else {
    return fi;
  }
}

function getFilesByName(name) {
  return getFilesOrFoldersByName_(name, false);
}

function getFoldersByName(name) { 
  return getFilesOrFoldersByName_(name, true);
}

function searchFiles(queryString) {
  return searchFilesOrFolders_(queryString, false);
}

function searchFolders(queryString) { 
  return searchFilesOrFolders_(queryString, true);
}

function createFolder(name) {
  if (getDriveApiVersion_() === 3) {
    throw new Error('createFolder() not yet supported by ReDriveApp for Drive API v3')
  } else {
    var mimeTypeStr = 'application/vnd.google-apps.folder';

    var newFolder = {
      title: name,
      mimeType: mimeTypeStr
    };

    var driveFilesResource = Drive.Files.insert(newFolder);

    var reFile = new ReFile_.Base({
      driveFilesResource: driveFilesResource, // 'Files' resource from Drive API
    });

    return new ReFolder_.Base({
      reFile: reFile
    });
  }
}

/*
// note: Removing as I learned this call only works if have the full /drive scope.
function getRootFolder() {
  return ReDriveApp.getFolderById('root'); 
} 
*/


////////////////////////////////////////// ReFile //////////////////////////////////////////////////
// Define ReFile class. This is an equivalent to the 'File' class returned by different DriveApp 
// methods (i.e. getFileById).
//
// See:
//   Apps Script: https://developers.google.com/apps-script/reference/drive/file
//   Drive API v2: https://developers.google.com/drive/api/v2/reference/files
//   Drive API v3: https://developers.google.com/drive/api/v3/reference/files


var ReFile_ = {};
ReFile_.Base = function (base) {
  this.base = base;
};

var reFileBaseClass_ = ReFile_.Base.prototype;

reFileBaseClass_.getName = function getName() {
  if (getDriveApiVersion_() === 2) {
    return this.base.driveFilesResource.title;
  } else {
    return this.base.driveFilesResource.name;
  }
}

reFileBaseClass_.getDateCreated = function getDateCreated() {
  if (getDriveApiVersion_() === 2) {
    return new Date(this.base.driveFilesResource.createdDate);
  } else {
    return new Date(this.base.driveFilesResource.createdTime);
  }
}


reFileBaseClass_.getLastUpdated = function getLastUpdated() {
  if (getDriveApiVersion_() === 2) {
    return new Date(this.base.driveFilesResource.modifiedDate);
  } else {
    return new Date(this.base.driveFilesResource.modifiedTime);
  }
}

reFileBaseClass_.getSize = function getSize() {
  if (getDriveApiVersion_() === 2) {
    return this.base.driveFilesResource.fileSize;
  } else {
    return this.base.driveFilesResource.size;
  }
}

reFileBaseClass_.getId = function getId() {
  return this.base.driveFilesResource.id;
}

reFileBaseClass_.getResourceKey = function getResourceKey() {
  return this.base.driveFilesResource.resourceKey;
}


reFileBaseClass_.getDescription = function getDescription() {
  return this.base.driveFilesResource.description;
}

reFileBaseClass_.getUrl = function getUrl() {
  if (getDriveApiVersion_() === 2) {
    return this.base.driveFilesResource.alternateLink;
  } else {
    return this.base.driveFilesResource.webViewLink;
  }
}

reFileBaseClass_.getOwner = function getOwner() {

  var owners = this.base.driveFilesResource.owners;

  if (!owners) {
    return null; // This is what DriveApp does for file in Shared Drive (no owner)
  }

  var owner = owners[0];

  var photoUrl;

  if (getDriveApiVersion_() === 2) {
    photoUrl = owner.picture.url;
  } else {
    photoUrl = owner.photoLink;
  }

  var domain = owner.emailAddress.split('@')[1];

  return new ReUser_.Base({
    name: owner.displayName,
    email: owner.emailAddress,
    domain: domain, // not present in File object of Drive API 
    photoUrl: photoUrl
  });
}

reFileBaseClass_.getContentType = function getContentType() {
  return this.base.driveFilesResource.mimeType;
}

reFileBaseClass_.getAs = function getAs(mimeType) {
  // should work the same for v2 and v3
  if (isConvertibleFileType_(this.getContentType())) {
    // Using HTTP endpoint rather than Drive.Files.export() b/c the latter seems to have 
    // a bug. It throws an error that alt=media must be specified (even though this is only
    // supposed to be used for Drive.Files.get() for non-Google file types). And if it is
    // provided, an exception is thrown. See: http://bit.ly/40r4V0z

    var url;
    if (getDriveApiVersion_() === 2) {
      url = 'https://www.googleapis.com/drive/v2/files/'
        + this.base.driveFilesResource.id+"/export?mimeType="+ mimeType;
    } else {
      url = 'https://www.googleapis.com/drive/v3/files/'
        + this.base.driveFilesResource.id+"/export?mimeType="+ mimeType;
    }

    var response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
      }
    });

    if (response.getResponseCode() !== 200) {
      throw new Error('ReFile.getAs(): Drive API returned error ' + response.getResponseCode() 
        + ': ' + response.getContentText());
    }

    var blobContent = response.getContent();
    return Utilities.newBlob(blobContent, mimeType);

  } else {
    // Trying to convert from non Google file type (i.e. png --> jpg). Native DriveApp does
    // support this, but I'm not sure how as files.export() can only convert native Google 
    // Workspace types, and files.get() does not do conversions.
    // See: https://developers.google.com/drive/api/guides/manage-downloads
    throw new Error('ReFile.getAs() does not support non Google Workspace types: ' + mimeType);
  }

}

MAKE_COPY_SIG_NO_ARGS = 1;
MAKE_COPY_SIG_DEST = 2;
MAKE_COPY_SIG_NAME = 3;
MAKE_COPY_SIG_NAME_DEST = 4;

reFileBaseClass_.makeCopy = function makeCopy(a1, a2) {
  var signature;

  if (a1 === undefined) {
    // non arguments
    signature = MAKE_COPY_SIG_NO_ARGS;
  } else if (a2 === undefined) {
    // 1 argumemt
    if (typeof a1 === 'string') {
      signature = MAKE_COPY_SIG_NAME;
    } else {
      signature = MAKE_COPY_SIG_DEST; // Folder
    }
  } else {
    signature = MAKE_COPY_SIG_NAME_DEST;
  }

  // defaults
  var name = this.getName();
  var parents = undefined; // = this.base.driveFilesResource.parents;
  
  if (signature === MAKE_COPY_SIG_NAME) {
    name = a1;
  } else if (signature === MAKE_COPY_SIG_DEST) {
    // single argument is of type ReDriveFolder
    if (getDriveApiVersion_() === 2) {
      parents = [{"kind": "drive#parentReference", "id": a1.getId()}];
    } else {
      parents = [a1.getId()];
    }
  } else if (signature === MAKE_COPY_SIG_NAME_DEST) {
    name = a1;
    if (getDriveApiVersion_() === 2) {
      parents = [{"kind": "drive#parentReference", "id": a2.getId()}];
    } else {
      parents = [a2.getId()];
    }
  }

  var newFile = {
    title: name
  };

  if (parents) {
    newFile['parents'] = parents;     
  } 
  else {
    if (getDriveApiVersion_ === 2) {
      parents = [{"kind": "drive#parentReference", "id": "root"}];
    } else {
      parents = ["root"];
    }
    newFile['parents'] = parents;
  }

  var copiedFile = Drive.Files.copy(newFile, this.getId(), {supportsAllDrives: true});

  return new ReFile_.Base({
    driveFilesResource: copiedFile, // 'Files' recourse from Drive API
  });
}

reFileBaseClass_.moveTo = function moveTo(destFolder) {
  var parents = undefined; // = this.base.driveFilesResource.parents;
    
  if (getDriveApiVersion_() === 2) {
    parents = [{"kind": "drive#parentReference", "id": destFolder.getId()}];
  } else {
    parents = [destFolder.getId()];
  }
  
  var fileOpts = {
    parents: parents
  };

  var movedFile = Drive.Files.patch(fileOpts, this.getId(), {supportsAllDrives: true});

  return new ReFile_.Base({
    driveFilesResource: movedFile, // 'Files' recourse from Drive API
  });
}

reFileBaseClass_.setName = function setName(name) {
  var options = {};

  if (getDriveApiVersion_() === 2) {
    options.title = name;
    this.base.driveFilesResource.title = name;
  } else {
    options.name = name;
    this.base.driveFilesResource.name = name;
  }

  Drive.Files.update(options, this.base.driveFilesResource.id);

  return this;
}

reFileBaseClass_.setDescription = function setDescription(description) {
  var options = {
    description: description
  };

  this.base.driveFilesResource.description = description;

  Drive.Files.update(options, this.base.driveFilesResource.id);

  return this;
}

reFileBaseClass_.setTrashed = function setTrashed(trashed) {

  if (getDriveApiVersion_() === 2) {
    var options = {
      supportsAllDrives: true
    }

    if (trashed) {
      Drive.Files.trash(this.base.driveFilesResource.id, options);
    } else {
      Drive.Files.untrash(this.base.driveFilesResource.id, options);
    }
  } else {

    var updateFields = {
      trashed: trashed
    }
    var options = {
      supportsAllDrives: true
    }

    Drive.Files.update(updateFields, this.base.driveFilesResource.id, options);
  }

  return this;
}


reFileBaseClass_.isTrashed = function isTrashed() {
  var trashed = false;

  if (getDriveApiVersion_() === 2) {
    trashed = this.base.driveFilesResource.labels.trashed;
  }
  else {
    trashed = this.base.driveFilesResource.trashed;
  }

  return trashed;
}

reFileBaseClass_.addViewer = function addViewer(emailAddress) {
  
  var resource = {
    value: emailAddress,
    type: 'user',               
    role: 'reader'
  };

  if (getDriveApiVersion_() === 2) {
    Drive.Permissions.insert(resource, this.base.driveFilesResource.id);
  } else {
    Drive.Permissions.create(resource, this.base.driveFilesResource.id);
  }

  return this;
}

reFileBaseClass_.setSharing = function setSharing(accessType, permissionType) {
  var type = 'user';
  var role = 'writer';

  var owner_email = Session.getEffectiveUser().getEmail();
  var domain = owner_email.split('@')[1];

  var permissions = {
    kind: 'drive#permission',
    type: type,
    role: role,
  }

  switch (accessType) {
    case DriveApp.Access.ANYONE:
      permissions.type = 'anyone';
      if (getDriveApiVersion_() === 2) {
        permissions.withLink = false;
      } else {
        permissions.allowFileDiscovery = true;
      }
      break;
    case DriveApp.Access.ANYONE_WITH_LINK:
      permissions.type = 'anyone';
      if (getDriveApiVersion_() === 2) {
        permissions.withLink = true;
      } else {
        permissions.allowFileDiscovery = false;
      }
      break;
    case DriveApp.Access.DOMAIN:
      permissions.type = 'domain';
      permissions.value = domain;
      if (getDriveApiVersion_() === 2) {
        permissions.withLink = false;
      } else {
        permissions.allowFileDiscovery = true;
      }
      break;
    case DriveApp.Access.DOMAIN_WITH_LINK:
      if (getDriveApiVersion_() === 2) {
        permissions.withLink = true;
      } else {
        permissions.allowFileDiscovery = false;
      }
      permissions.type = 'domain';
      permissions.value = domain;
      break;
    case DriveApp.Access.PRIVATE:
      permissions.type = 'user';
      permissions.value = owner_email;
      break;
  }

  switch (permissionType) {
    case DriveApp.Permission.VIEW:
      permissions.role = 'reader';
      break;
    case DriveApp.Permission.EDIT:
      permissions.role = 'writer';
      break;
    case DriveApp.Permission.COMMENT:
      if (getDriveApiVersion_() === 2) {
        permissions.role = 'reader';
        permissions.additionalRoles = ['commenter'];
      } else {
        permissions.role = 'commenter'
      }
      break;
    case DriveApp.Permission.OWNER:
      permissions.role = 'owner';
      break;
    case DriveApp.Permission.ORGANIZER:
      // Google documentations says this is not supported and will throw an exception.
      throw new Error('Invalid permissionType DriveApp.Permission.ORGANIZER');
    case DriveApp.Permission.FILE_ORGANIZER:
      // Google documentations says this is not supported and will throw an exception.
      throw new Error('Invalid permissionType DriveApp.Permission.FILE_ORGANIZER')
    case DriveApp.Permission.NONE:
      if (accessType !== DriveApp.Access.ANYONE) {
        // Google documentations says this is not supported and will throw an exception
        // unless paired with DriveApp.Access.ANYONE.
        throw new Error('Invalid permissionType DriveApp.Permission.NONE');
      }
      break;

  }
  
  if (getDriveApiVersion_() === 2) {
    Drive.Permissions.insert(permissions, this.base.driveFilesResource.id);
  } else {
    Drive.Permissions.create(permissions, this.base.driveFilesResource.id);
  }
  
  return this;
}

reFileBaseClass_.getAccess = function getAccess(entity, muteInconclusiveException) {
  var driveAppPermission = DriveApp.Permission.NONE;
  var entityPermissionRank = 0;
  var permissions = [];
  var result;
  var nextPageToken = undefined;
  var email = '';
  var inconclusive = false;
  var foundDomainMatch = false;

  if (typeof entity === "string") {
    email = entity;
  }
  else {
    email = entity.getEmail(); // Apps Script User
  }

  email = email.toLocaleLowerCase();
  var entityDomain = email.split('@')[1];

  try {
    do {
      var options = {supportsAllDrives: true};

      if (nextPageToken)  {
        options['nextPageToken'] = nextPageToken;
      }
      result = Drive.Permissions.list(this.base.driveFilesResource.id, options);
      nextPageToken = result.nextPageToken;
      permissions = permissions.concat(result.items);

    } while (nextPageToken)

  } catch (e) {
    return DriveApp.Permission.NONE;
  }

  // Iterate through all listed permissions, look for any that apply to this user,
  // and return the most permissive one (i.e. if user has both 'reader' and 'writer'
  // permissions due to 2 separate ACLs, return 'writer' (DriveApp.Permission.EDIT))
  // 
  // Note: This method cannot check group membership for 'group' type ACLs, so unfortunately
  // those ACLs are not considered (skipped). 
  
  // It can also not check with certainty if a user is in a particular Workspace domain/org 
  // Drive "Target Audience" for 'domain' type ACLs. It *will* check if the
  // passed user's email domain matches the domain specified in the URL, and if so
  // consider that ACL. But otherwise it will skip considering that that ACL.
  
  for (var i=0; i < permissions.length; i++) {

   var p = permissions[i];

    if (p.type === 'user') {
      if (p.hasOwnProperty('emailAddress') && (p.emailAddress.toLocaleLowerCase() === email)) {
        if (entityPermissionToPermissionRank_(p.role) > entityPermissionRank) {
          // found a more permissive rank. record it.
          entityPermissionRank = entityPermissionToPermissionRank_(p.role);
          driveAppPermission = entityPermissionToDriveAppPermission_(p.role);
        }
      }
    }

    else if (p.type === 'domain') {      
      // same domain name? note: even w/o domain name match, user could still very well be part
      // of this Workspace domain/org.
      if (entityDomain === (p.domain.toLocaleLowerCase())) {
        foundDomainMatch = true;
        inconclusive = false; // reset if needed

        if (entityPermissionToPermissionRank_(p.role) > entityPermissionRank) {
          // found a more permissive rank. record it.
          entityPermissionRank = entityPermissionToPermissionRank_(p.role);
          driveAppPermission = entityPermissionToDriveAppPermission_(p.role);
          continue;
        }
      } else {
        // mark as inconclusive, but only if didn't already match this user to a different domain
        if (!foundDomainMatch) {
          inconclusive = true;
        }
      }
    }

    else if (p.type === 'group') {
      inconclusive = true;
      continue;
    }

    else if (p.type === 'anyone') {
      if (entityPermissionToPermissionRank_(p.role) > entityPermissionRank) {
        // found a more permissive rank. record it.
        entityPermissionRank = entityPermissionToPermissionRank_(p.role);
        driveAppPermission = entityPermissionToDriveAppPermission_(p.role);
      }
    }
  }

  // throw exception if inconclusive check, unless caller asked us not to.
  if (inconclusive) {
    if (!muteInconclusiveException) {
      throw new Error('ReDriveApp: getAccess(): inconclusive access check')
    }
  }

  return driveAppPermission;
}

function entityPermissionToDriveAppPermission_(entityPermission) {
  var DriveAppPermission = DriveApp.Permission.NONE;

  switch (entityPermission) {
    case 'reader':
      DriveAppPermission = DriveApp.Permission.VIEW;
      break;
    case 'writer':
      DriveAppPermission = DriveApp.Permission.EDIT;
      break;
    case 'commenter':
      DriveAppPermission = DriveApp.Permission.COMMENT;
      break;
    case 'owner':
      DriveAppPermission = DriveApp.Permission.OWNER;
      break;
    case 'fileOrganizer':
      DriveAppPermission = DriveApp.Permission.FILE_ORGANIZER;
      break;
    case 'organizer':
      DriveAppPermission = DriveApp.Permission.ORGANIZER;
      break;
  }

  return DriveAppPermission;
}

function entityPermissionToPermissionRank_(entityPermission) {
  var rank = 0; // NONE

  switch (entityPermission) {
    case 'reader':
      rank = 1;
      break;
    case 'commenter':
      rank = 2;
      break;
    case 'writer':
      DriveAppPermission = DriveApp.Permission.EDIT;
      rank = 3;
      break;
    case 'owner':
      rank = 4;
      break;
    case 'fileOrganizer':
      rank = 5;
      break;
    case 'organizer':
      rank = 6;
      break;
  }

  return rank;
}

function isConvertibleFileType_(mimeType) {
  switch (mimeType) {
    case 'application/vnd.google-apps.document':
    case 'application/vnd.google-apps.drawing':
    case 'application/vnd.google-apps.presentation':
    case 'application/vnd.google-apps.spreadsheet':
      return true;
    default:
      return false;
  }

}

/////////////////////////////////////// ReFileIterator /////////////////////////////////////////////
// Define ReFileIterator class. This is an equivalent to the 'FileIterator' class returned by 
// methods like DriveApp.getFilesByName()
// https://developers.google.com/apps-script/reference/drive/file-iterator
//
var ReFileIterator_ = {};
ReFileIterator_.Base = function (base) {
  this.base = base;
};
var reFileIteratorBaseClass_ = ReFileIterator_.Base.prototype;

reFileIteratorBaseClass_.getContinuationToken = function getContinuationToken() {
  return this.base.nextPageToken;
}

reFileIteratorBaseClass_.hasNext = function hasNext() {
  //console.log('hasNext(): filesIndex = ' + this.base.filesIndex);
  //console.log('hasNext(): files.length = ' + this.base.files.length);

  if ((this.base.filesIndex < this.base.files.length) || (this.base.nextPageToken)) {
    return true;
  }

  return false;
}

reFileIteratorBaseClass_.next = function next() {
  if (!this.hasNext()) {
    throw new Error("reFileIterator has no next file to return");
  }

  if (this.base.filesIndex < this.base.files.length) {
    var file = this.base.files[this.base.filesIndex];
    this.base.filesIndex++;

    var file = new ReFile_.Base({
      driveFilesResource: file, // 'Files' recourse from Drive API
    });

    return file;

  } else if (this.base.nextPageToken) {
    //console.log('nextPageToken: ' + this.base.nextPageToken);
  
    var options = {
      corpora: 'default', // 'user' gives "Invalid Value" error
      //maxResults: 10, // for testing pagination
      pageToken: this.base.nextPageToken,
      q: this.base.queryString
    };

    var results = Drive.Files.list(options);

    var nextPageToken;
    if (results.hasOwnProperty('nextPageToken') && results.nextPageToken) {
      nextPageToken = results.nextPageToken;
    } else {
      nextPageToken = null;
    }
    var files;

    if (getDriveApiVersion_() === 2) {
      files = results.items;
    } else {
      files = results.files;
    }

    this.base.nextPageToken = nextPageToken;
    this.base.files = files;
    this.base.filesIndex = 1;

    var file = new ReFile_.Base({
      driveFilesResource:  this.base.files[0] // 'Files' resource from Drive API
    });

    return file;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////// ReFolderIterator /////////////////////////////////////////////
// Define ReFolderIterator class. This is an equivalent to the 'FolderIterator' class returned by 
// methods like DriveApp.getFoldersByName()
// https://developers.google.com/apps-script/reference/drive/folder-iterator
//
var ReFolderIterator_ = {};
ReFolderIterator_.Base = function (base) {
  this.base = base;
};
var reFolderIteratorBaseClass_ = ReFolderIterator_.Base.prototype;

reFolderIteratorBaseClass_.getContinuationToken = function getContinuationToken() {
  return this.base.fileIterator.nextPageToken;
}

reFolderIteratorBaseClass_.hasNext = function hasNext() {
  return this.base.fileIterator.hasNext();
}

reFolderIteratorBaseClass_.next = function next() {
  var nextReFile = this.base.fileIterator.next();

  return new ReFolder_.Base({
    reFile: nextReFile
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////// ReFolder /////////////////////////////////////////////////
// Define ReFolder class. This is an equivalent to the 'Folder' class returned by
// different DriveApp methods (i.e. getFolderById).
var ReFolder_ = {};
ReFolder_.Base = function (base) {
  this.base = base;
};
var reFolderBaseClass_ = ReFolder_.Base.prototype;

reFolderBaseClass_.getId = function getId() {
  return this.base.reFile.getId();
}

reFolderBaseClass_.getResourceKey = function getResourceKey() {
  return this.base.reFile.getResourceKey();
}

reFolderBaseClass_.getName = function getName() {
  return this.base.reFile.getName();
}

reFolderBaseClass_.setTrashed = function setTrashed(trashed) {
  return this.base.reFile.setTrashed(trashed);
}

reFolderBaseClass_.setSharing = function setSharing(accessType, permissionType) {
  return this.base.reFile.setSharing(accessType, permissionType);
}

reFolderBaseClass_.getAccess = function getAccess(entity) {
  return this.base.reFile.getAccess(entity);
}

reFolderBaseClass_.moveTo = function moveTo(destFolder) {
  return this.base.reFile.moveTo(destFolder);
}

reFolderBaseClass_.getFilesByName = function getFilesByName(name) {
  return getFilesOrFoldersByName_(name, false, this.getId());
}

reFolderBaseClass_.getFoldersByName = function getFoldersByName(name) {
  return getFilesOrFoldersByName_(name, true, this.getId());
}

reFolderBaseClass_.searchFiles = function searchFiles(params) {
  return searchFilesOrFolders_(params, false, this.getId());
}

reFolderBaseClass_.searchFolders = function searchFolders(params) {
  return searchFilesOrFolders_(params, true, this.getId());
}

////////////////////////////////////////// ReUser //////////////////////////////////////////////////
// Define ReUser class. This is an equivalent to the 'User' class returned by
// different DriveApp methods (i.e. File.getOwner)
var ReUser_ = {};
ReUser_.Base = function (base) {
  this.base = base;
};
var reUserBaseClass_ = ReUser_.Base.prototype;


reUserBaseClass_.getName = function getName() {
  return this.base.name;
}

reUserBaseClass_.getEmail = function getEmail() {
  return this.base.email;
}

reUserBaseClass_.getPhotoUrl = function getPhotoUrl() {
  return this.base.photoUrl;
}

reUserBaseClass_.getDomain = function getDomain() {
  return this.base.domain;
}