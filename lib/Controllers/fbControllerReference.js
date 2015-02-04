var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBase;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);
//Get the document object for inserting in the database
obj.prototype.getDocument = function (parentID, fieldName, position, template, formObj, schemaObj) {
  var document = objBase.prototype.getDocument.call(this, parentID, fieldName, position, template, formObj, schemaObj);
  return document;
};
//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the text controller
  baseObj.view = 'fbViewReference';
  return baseObj;
};

//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  if(value === undefined) return false;
  var baseResult = objBase.prototype.validate.call(this, fieldName, value, schemaObj, collection, docID);
  if (baseResult)
    return baseResult;
  return false;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerReference) !== "object")
  FormBuilder.controllers.fbControllerReference = new obj();

