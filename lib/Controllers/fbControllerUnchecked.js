if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerUnchecked) !== "object") FormBuilder.controllers.fbControllerUnchecked = {};
if(Meteor.isClient){
  FormBuilder.controllers.fbControllerUnchecked.getValue = function(fieldName, parentID, position){
    return {visible:false,  value:null};
  };
  FormBuilder.controllers.fbControllerUnchecked.setValue = function(fieldName, parentID, position, value){
  };
  FormBuilder.controllers.fbControllerUnchecked.setError = function(fieldName, parentID, position, message){
  };
  FormBuilder.controllers.fbControllerUnchecked.addViews = function(fieldName, formObj, schemaObj, position, parentID, currentValue){
  };
}
FormBuilder.controllers.fbControllerUnchecked.validate = function(fieldName, value, schemaObj, collection, docID){
  return false;
};