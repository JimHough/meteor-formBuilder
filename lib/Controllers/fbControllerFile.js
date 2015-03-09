var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBase;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);

if (Meteor.isClient) {
  //Gets the value from the view on the form
  obj.prototype.getValue = function (fieldName, parentID, position, callback) {
    var view = FormBuilder.views.findOne({parentID: parentID, fieldName: fieldName, position: position.value});
    var form = FormBuilder.forms.findOne(view.formID);
    position.value++;
    var result = !!(view.schemaObj.filter & form.filter) ? _.omit(view.currentValue, 'url') : undefined;
    callback(result);
  };
  //Sets the error text for the view on the form
  obj.prototype.setError = function (fieldName, parentID, position, errors, docId) {
    var view = FormBuilder.views.findOne({parentID: parentID, fieldName: fieldName, position: position.value});
    var form = FormBuilder.forms.findOne(view.formID);
    var message = errors[fieldName];
    message = message || false;
    FormBuilder.views.update(view._id, {$set: {error: message}});
    position.value++;
    if (_.keys(errors).length > 0)
      return;
    //If no errors were found upload the data
    var template = FormBuilder.helpers.findInstance(view._id, "Template.fbViewFile_create_update");
    if (!FormBuilder.helpers.canAccess(template, "fbViewFile.file", "fbViewFile.thumbnail")) {
      FormBuilder.views.update(view._id, {$set: {error: "Error accessing the template instance"}});
      return;
    }
    var fsCollection = FS._collections[view.schemaObj.store];
    var data = template.fbViewFile.file || template.fbViewFile.thumbnail;
    if (!data)
    {
      FormBuilder.views.update(view._id, {$set: {error: "Error nothing to upload"}});
      return;
    }
    var fsFile = new FS.File(data);
    fsFile.references = [];
    fsFile.md5Hash = template.fbViewFile.md5;
    //listen for the uploaded event on this file
    fsFile.once("uploaded", function () {
      //add the reference from the file to the database entry
      var fileReference = form.collection + ":" + docId;
      var objReference = view.schemaObj.store + ":" + fsFile._id;
      fsCollection.update(fsFile._id, {$addToSet: {references: fileReference}});
      //add the reference from the database entry to the file entry
      var modifier = {};
      modifier[fieldName + ".reference"] = objReference;
      Mongo.Collection.get(form.collection).update(docId, {$set: modifier});
    });
    try {
      fsCollection.insert(fsFile, function (err) {
        if (err)
          FormBuilder.views.update(view._id, {$set: {error: err}});
      });
    }
    catch (err) {
      FormBuilder.views.update(view._id, {$set: {error: err}});
    }
  };
}
//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the text controller
  baseObj.view = 'fbViewFile';
  baseObj.store = '';
  baseObj.accept = '.jpg';
  baseObj.maxSize = null;
  baseObj.unique = true;
  return baseObj;
};
//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  if(value === undefined) return false;
  if (!FormBuilder.helpers.canAccess(value, "type", "name", "size", "reference") && (!schemaObj.optional))
    return "This is a required field";
  if (!FormBuilder.helpers.canAccess(value, "type", "name", "size", "reference") && schemaObj.optional)
    return false;
  if (schemaObj.maxSize < value.size)
    return "The file size (" + value.size.fileSize(1) + ") is bigger than the limit (" + schemaObj.maxSize.fileSize(1) + ")";
  var validExtensions = schemaObj.accept.split(",");
  if (!_.contains(validExtensions, "." + value.extension.toLowerCase()))
    return "The file type (" + value.extension + ") does not pass the filter (" + schemaObj.accept + ")";
  if (value.md5)
    //Check for the file being unique
    if (schemaObj.unique) {
      var findObj = {};
      findObj[fieldName + ".md5"] = value.md5;
      var matches = collection.find(findObj).fetch();
      for (var i = 0; i < matches.length; i++) {
        if (matches[i]._id !== docID)
          return "This file already exists";
      }
    }
  return false;
};
//Get the html to display a thubnail
obj.prototype.getThumbnail = function(ref, alt){
  if(_.isString(ref)){
      var refData = ref.split(":");
      if(refData.length === 2){
        var fsCollection = FS._collections[refData[0]];
        if(fsCollection){
          var fsFile = fsCollection.findOne(refData[1]);
          if(fsFile && fsFile.url)
            return '<img src="'+fsFile.url()+'" alt="thumbnail" style="max-width: 80px; max-height: 60px;">';
        }
      }
    }
    return '<img src="'+ alt +'" alt="thumbnail" style="max-width: 80px; max-height: 60px;">';
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerFile) !== "object")
  FormBuilder.controllers.fbControllerFile = new obj();