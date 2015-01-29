if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerText) !== "object") FormBuilder.controllers.fbControllerText = function(){};

//Inherit from the base 'class'
var obj = FormBuilder.controllers.fbControllerText;
var objBase = FormBuilder.controllers.fbControllerBase;
obj.prototype = _.extend(obj.prototype, objBase.prototype);

if(Meteor.isClient){
  //Gets an object that defines the schema default values
  obj.prototype.getSchemaDefaults = function(){
    var baseObj = objBase.getSchemaDefaults();
    //Add additional fields specific to the text controller
    baseObj.view = 'fbViewText';
    baseObj.minLength = 0;
    baseObj.maxLength = 30;
    baseObj.textarea = false;
    return baseObj;
  };
  
  //Get the document object for inserting in the database
  obj.prototype.getDocument = function(parentID, fieldName, position, template, formObj, schemaObj){
    var document = objBase.getDocument(parentID, fieldName, position, template, formObj, schemaObj);
    //Add additional fields specific to the text controller
    document.textarea = schemaObj.textarea;
    return document;
  };
}
//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function(fieldName, value, schemaObj, collection, docID){
  var baseResult = objBase.validate(fieldName, value, schemaObj, collection, docID);
  if(baseResult) return baseResult;
  if(schemaObj.maxLength && (value.length > schemaObj.maxLength))
    return value + " is " + (value.length - schemaObj.maxLength) +" too many letters long";
  if(schemaObj.minLength && (value.length < schemaObj.minLength))
    return value + " is " + (schemaObj.minLength - value.length) +" too few letters long";
  return false;
};