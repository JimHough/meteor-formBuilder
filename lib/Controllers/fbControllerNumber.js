var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBase;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);

//Get the document object for inserting in the database
obj.prototype.getDocument = function (parentID, fieldName, position, template, formObj, schemaObj) {
  var document = objBase.prototype.getDocument.call(this, parentID, fieldName, position, template, formObj, schemaObj);
  //Add additional fields specific to the number controller
  document.currentValue = FormBuilder.helpers.isNumber(schemaObj.defaultValue) ? schemaObj.defaultValue : null;
  return document;
};
//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the number controller
  baseObj.view = 'fbViewNumber';
  baseObj.minValue = 0;
  baseObj.maxValue = 100;
  baseObj.places = 0;
  baseObj.step = 1;
  return baseObj;
};
//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  if(value === undefined) return false;
  var baseResult = objBase.prototype.validate.call(this, fieldName, value, schemaObj, collection, docID);
  if (baseResult)
    return baseResult;
  if (!FormBuilder.helpers.isNumber(value))
    return "Enter a valid number";
  if (schemaObj.maxValue && (value > schemaObj.maxValue))
    return value + " is above the maximum limit of " + schemaObj.maxValue;
  if (schemaObj.minValue && (value < schemaObj.minValue))
    return value + " is below the minimum limit of " + schemaObj.minValue;
  if (FormBuilder.helpers.getDecimalPlaces(value) > schemaObj.places) {
    if (schemaObj.places === 0)
      return "The number should be an integer";
    else if (schemaObj.places === 1)
      return  "The number should only have 1 decimal place";
    return "The number should only have " + schemaObj.places + " decimal places";
  }
  return false;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerNumber) !== "object")
  FormBuilder.controllers.fbControllerNumber = new obj();