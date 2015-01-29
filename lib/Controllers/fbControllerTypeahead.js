if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerTypeahead) !== "object") FormBuilder.controllers.fbControllerTypeahead = function(){};

//Inherit from the base 'class'
var obj = FormBuilder.controllers.fbControllerTypeahead;
var objBase = FormBuilder.controllers.fbControllerBase;
obj.prototype = _.extend(obj.prototype, objBase.prototype);

if(Meteor.isClient){
  //Gets an object that defines the schema default values
  obj.prototype.getSchemaDefaults = function(){
    var baseObj = objBase.getSchemaDefaults();
    //Add additional fields specific to the text controller
    baseObj.view = 'fbViewTypeahead';
    baseObj.isNumber = false;
    baseObj.placeholder = "";
    return baseObj;
  };
}
//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function(fieldName, value, schemaObj, collection, docID){
  var baseResult = objBase.validate(fieldName, value, schemaObj, collection, docID);
  if(baseResult) return baseResult;
  value = schemaObj.isNumber ? parseFloat(value) : value;
  //Check if the value exists in the collection
  var data = schemaObj.dataSource.split(".");
  console.log(data);
  var colSelections = Meteor.isClient ? window[data[0]] : global[data[0]];
  var field = data[1] || 'name';
  var query = {};
  query[field] = value;
  if(!colSelections.findOne(query))
      return value + " does not exist in collection " + data;
  return false;
};