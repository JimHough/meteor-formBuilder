//Inherit from the base 'class'
var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBase;
obj.prototype = Object.create(objBase.prototype);

//Get the document object for inserting in the database
obj.prototype.getDocument = function (parentID, fieldName, position, template, formObj, schemaObj) {
  var document = objBase.prototype.getDocument.call(this, parentID, fieldName, position, template, formObj, schemaObj);
  //Add additional fields specific to the date controller
  var defaultValue = moment(schemaObj.defaultValue, 'YYYY-MM-DD', true);
  document.currentValue = defaultValue.isValid() ? defaultValue : null;
  return document;
};
//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the date controller
  baseObj.view = 'fbViewDate';
  baseObj.minValue = null;
  baseObj.maxValue = null;
  baseObj.textarea = false;
  return baseObj;
};
//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  var baseResult = objBase.prototype.validate.call(this, fieldName, value, schemaObj, collection, docID);
  if (baseResult)
    return baseResult;
  value = moment(value);
  if (!value.isValid())
    return "Enter a valid date";
  var minValue = moment(schemaObj.minValue, 'YYYY-MM-DD', true);
  var maxValue = moment(schemaObj.maxValue, 'YYYY-MM-DD', true);
  if (maxValue.isValid() && (value.isAfter(maxValue)))
    return 'The latest allowed date is ' + maxValue.format('DD/MM/YYYY');
  if (minValue.isValid() && (value.isBefore(minValue)))
    return 'The earliest allowed date is ' + minValue.format('DD/MM/YYYY');
  return false;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerDate) !== "object")
  FormBuilder.controllers.fbControllerDate = new obj();
