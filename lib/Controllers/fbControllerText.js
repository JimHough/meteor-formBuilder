var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBase;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);

//Get the document object for inserting in the database
obj.prototype.getDocument = function (parentID, fieldName, position, template, formID, schemaObj) {
  var document = objBase.prototype.getDocument.call(this, parentID, fieldName, position, template, formID, schemaObj);
  //Add additional fields specific to the text controller
  document.textarea = schemaObj.textarea;
  return document;
};
//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the text controller
  baseObj.view = 'fbViewText';
  baseObj.minLength = 0;
  baseObj.maxLength = 30;
  baseObj.textarea = false;
  baseObj.regex = [];
  baseObj.regexHelp = [];
  return baseObj;
};

//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  var baseResult = objBase.prototype.validate.call(this, fieldName, value, schemaObj, collection, docID);
  if((value === undefined) || (baseResult === null)) //Invisible or optional check
    return false;
  if (baseResult) //Base check returned an error
    return baseResult;
  if (schemaObj.maxLength && (value.length > schemaObj.maxLength))
    return value + " is " + (value.length - schemaObj.maxLength) + " too many letters long";
  if (schemaObj.minLength && (value.length < schemaObj.minLength))
    return value + " is " + (schemaObj.minLength - value.length) + " too few letters long";
  if (schemaObj.regex){
    for (var i = 0; i < schemaObj.regex.length; i++){
      if(!schemaObj.regex[i].test(value)){
        if(i < schemaObj.regexHelp.length)
          return schemaObj.regexHelp[i];
        else
          return "The value entered failed validation";
      }
    }
  }
  return false;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerText) !== "object")
  FormBuilder.controllers.fbControllerText = new obj();

