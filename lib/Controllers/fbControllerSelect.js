var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBase;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);
//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the number controller
  baseObj.view = 'fbViewSelect';
  baseObj.dataSource = null;
  baseObj.placeholder = "";
  return baseObj;
};
//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  if(value === undefined) return false;
  var baseResult = objBase.prototype.validate.call(this, fieldName, value, schemaObj, collection, docID);
  if (baseResult)
    return baseResult;
  value = schemaObj.isNumber ? parseFloat(value) : value;
  //Check if the value exists in the collection
  var data = schemaObj.dataSource.split(".");
  var collection = Meteor.isClient ? window[data[0]] : this[data[0]];
  var field = data[1] || 'name';
  var query = {};
  query[field] = value;
  if (!collection.findOne(query))
    return value + " does not exist in collection " + data;
  return false;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerSelect) !== "object")
  FormBuilder.controllers.fbControllerSelect = new obj();

