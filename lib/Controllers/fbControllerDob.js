if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerDob) !== "object") FormBuilder.controllers.fbControllerDob = function(){};

//Inherit from the base 'class'
var obj = FormBuilder.controllers.fbControllerDob;
var objBase = FormBuilder.controllers.fbControllerBase;
obj.prototype = _.extend(obj.prototype, objBase.prototype);

if(Meteor.isClient){
  //Gets an object that defines the schema default values
  obj.prototype.getSchemaDefaults = function(){
    var baseObj = objBase.getSchemaDefaults();
    //Add additional fields specific to the text controller
    baseObj.view = 'fbViewDob';
    baseObj.minAge = null;
    baseObj.maxAge = null;
    return baseObj;
  };
  
  //Get the document object for inserting in the database
  obj.prototype.getDocument = function(parentID, fieldName, position, template, formObj, schemaObj){
    var document = objBase.getDocument(parentID, fieldName, position, template, formObj, schemaObj);
    //Add additional fields specific to the DOB controller
    var defaultValue = moment(schemaObj.defaultValue, 'YYYY-MM-DD', true);
    document.currentValue = defaultValue.isValid() ? defaultValue : null;
    return document;
  };
  
  //Filters the schema object fields and sets default values for any missing fields
  obj.prototype.normaliseSchema = function(schemaObj){
    var baseResult = objBase.normaliseSchema(schemaObj);
    //Compute the date if only the age was given
    if (FormBuilder.helpers.isInt(baseResult.minAge)) baseResult.maxValue = moment().subtract(baseResult.minAge, 'years').format('YYYY-MM-DD');
    if (FormBuilder.helpers.isInt(baseResult.maxAge)) baseResult.minValue = moment().subtract(baseResult.maxAge, 'years').format('YYYY-MM-DD');
    return baseResult;
  };
}
//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function(fieldName, value, schemaObj, collection, docID){
  var baseResult = objBase.validate(fieldName, value, schemaObj, collection, docID);
  if(baseResult) return baseResult;
  value = moment(value);
  if(!value.isValid())
    return "Enter a valid date";
  var age = moment().diff(value, 'years');
  if(schemaObj.maxAge && (age > schemaObj.maxAge))
    return 'You are ' + age + ' years old? The maximum accepted is ' + schemaObj.maxAge + ' years old.';
  if(schemaObj.minAge && (age < schemaObj.minAge))
    return 'You are ' + age + ' years old? The minimum accepted is ' + schemaObj.minAge + ' years old.';
  return false;
};