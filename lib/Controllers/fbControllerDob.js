//Inherit from the base 'class'
var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBase;
obj.prototype = Object.create(objBase.prototype);

if (Meteor.isClient) {
  //Get the document object for inserting in the database
  obj.prototype.getDocument = function (parentID, fieldName, position, template, formObj, schemaObj) {
    var document = objBase.prototype.getDocument.call(this, parentID, fieldName, position, template, formObj, schemaObj);
    //Add additional fields specific to the DOB controller
    var defaultValue = moment(schemaObj.defaultValue, 'YYYY-MM-DD', true);
    document.currentValue = defaultValue.isValid() ? defaultValue : null;
    return document;
  };
}

//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the text controller
  baseObj.view = 'fbViewDob';
  baseObj.minAge = null;
  baseObj.maxAge = null;
  return baseObj;
};
//Filters the schema object fields and sets default values for any missing fields
obj.prototype.normaliseSchema = function (schemaObj) {
  var baseResult = objBase.prototype.normaliseSchema.call(this, schemaObj);
  //Compute the date if only the age was given
  if (FormBuilder.helpers.isInt(baseResult.minAge))
    baseResult.maxValue = moment().subtract(baseResult.minAge, 'years').format('YYYY-MM-DD');
  if (FormBuilder.helpers.isInt(baseResult.maxAge))
    baseResult.minValue = moment().subtract(baseResult.maxAge, 'years').format('YYYY-MM-DD');
  return baseResult;
};
//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  var baseResult = objBase.prototype.validate.call(this, fieldName, value, schemaObj, collection, docID);
  if((value === undefined) || (baseResult === null)) //Invisible or optional check
    return false;
  if (baseResult) //Base check returned an error
    return baseResult;
  value = moment(value);
  if (!value.isValid())
    return "Enter a valid date";
  var age = moment().diff(value, 'years');
  if (schemaObj.maxAge && (age > schemaObj.maxAge))
    return 'You are ' + age + ' years old? The maximum accepted is ' + schemaObj.maxAge + ' years old.';
  if (schemaObj.minAge && (age < schemaObj.minAge))
    return 'You are ' + age + ' years old? The minimum accepted is ' + schemaObj.minAge + ' years old.';
  return false;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerDob) !== "object")
  FormBuilder.controllers.fbControllerDob = new obj();
