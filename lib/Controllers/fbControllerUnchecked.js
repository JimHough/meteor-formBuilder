var obj = function(){};
if(Meteor.isClient){
  obj.prototype.getValue = function(fieldName, parentID, position, callback){
    callback(undefined);
  };
  obj.prototype.setValue = function(fieldName, parentID, position, value){
  };
  obj.prototype.setError = function(fieldName, parentID, position, errors){
  };
  obj.prototype.addViews = function(fieldName, formObj, schemaObj, position, parentID, currentValue){
  };
}
obj.prototype.validate = function(fieldName, value, schemaObj, collection, docID){
  return false;
};

if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerUnchecked) !== "object") FormBuilder.controllers.fbControllerUnchecked = new obj();