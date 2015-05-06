var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBaseMulti;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);

if (Meteor.isClient) {
  //Data Type Functions
  obj.prototype.addViews = function(fieldName, formID, schemaObj, position, parentID) {
    schemaObj = this.normaliseSchema(schemaObj);
    var form = FormBuilder.forms.findOne(formID);
    var baseResult = objBase.prototype.addViews.call(this, fieldName, formID, schemaObj, position, parentID);
    var posn = {value: 0};
    //Iterate over the schema object calling the add views method on each one 
    _.each(schemaObj.subDocSchema, function(subSchemaObj, subFieldName) {
      subSchemaObj.schemaPath =  schemaObj.schemaPath + '.subDocSchema.' + subFieldName;
      //Get the controller for this database field
      if (((typeof subSchemaObj.controller) !== 'string') || !FormBuilder.controllers[subSchemaObj.controller])
        console.warn(form.collection + subSchemaObj.schemaPath + ' controller ' + subSchemaObj.controller + ' not found.');
      else {
        FormBuilder.controllers[subSchemaObj.controller].addViews(subFieldName, formID, subSchemaObj, posn, baseResult);
      }
    });
    return baseResult;
  };
}

//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the text controller
  baseObj.view = 'fbViewSubdocument';
  baseObj.subDocSchema = {};
  return baseObj;
};

obj.prototype.getDocument = function (parentID, fieldName, position, template, formID, schemaObj){
  var baseObj = objBase.prototype.getDocument.call(this, parentID, fieldName, position, template, formID, schemaObj);
  baseObj.arrayValue = false;
  return baseObj;
};

obj.prototype.validate = function(fieldName, value, schemaObj, collection, docID) {
  var result = {};
  var errorFound = false;
  schemaObj = this.normaliseSchema(schemaObj);
  _.each(schemaObj.subDocSchema, function(subSchemaObj, subFieldName) {
    //Get the controller for this database field
    if (((typeof subSchemaObj.controller) !== 'string') || !FormBuilder.controllers[subSchemaObj.controller])
      console.warn('controller ' + subSchemaObj.controller + ' not found.');
    else {
      result[subFieldName] = FormBuilder.controllers[subSchemaObj.controller].validate(subFieldName, value[subFieldName], subSchemaObj, collection, docID);
      if (result[subFieldName]) errorFound = true;
    }
  });
  return errorFound ? result : false;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerSubdocument) !== "object")
  FormBuilder.controllers.fbControllerSubdocument= new obj();