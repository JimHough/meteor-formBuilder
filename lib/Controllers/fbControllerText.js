if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerText) !== "object") FormBuilder.controllers.fbControllerText = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerText.getValue = function(fieldName, parentID, position){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})
    position.value++;
    return {visible:view.isVisible,  value:view.currentValue};
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerText.setValue = function(fieldName, parentID, position, value){
    var id = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})._id;
    var result = FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
    position.value++;
    return result;
  };
  
  FormBuilder.controllers.fbControllerText.setError = function(fieldName, parentID, position, message){
    message = message || false;
    FormBuilder.views.update({fieldName:fieldName, parentID:parentID, position:position.value}, {$set:{error:message}});
    position.value++;
  };

  //Add all of the required views for this controller
  FormBuilder.controllers.fbControllerText.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    schemaObj = _.pick(schemaObj, 'controller', 'view', 'labelText', 'unique', 'asYouType', 'optional', 'defaultValue', 'minLength', 'maxLength', 'filter');
    schemaObj = _.defaults(schemaObj, {view:'fbViewText', minLength:0, maxLength:30, filter:0xFFFF});
    var template = FormBuilder.helpers.findTemplate(schemaObj.view, formObj.type);
    var document = {
      //Common
      parentID:parentID,
      fieldName:fieldName,
      position:position.value,
      template:template,
      formObj:formObj,
      schemaObj:schemaObj,
      error:false,
      isVisible:((formObj.filter & schemaObj.filter) !== 0)
      };
    document.currentValue = schemaObj.defaultValue || '';
    position.value++;
    return FormBuilder.views.insert(document);
  };
}
//Validate the data for this database field, this can be called on the server or on the client
FormBuilder.controllers.fbControllerText.validate = function(fieldName, value, schemaObj, collection, docID){
  if((value === '') && (!schemaObj.optional))
    return "This is a required field";
  if((value === '') && schemaObj.optional)
    return false;
  if(schemaObj.maxLength && (value.length > schemaObj.maxLength))
    return value + " is " + (value.length - schemaObj.maxLength) +" too many letters long";
  if(schemaObj.minLength && (value.length < schemaObj.minLength))
    return value + " is " + (schemaObj.minLength - value.length) +" too few letters long";
  //Check for the value being unique
  if(schemaObj.unique){
    var findObj = {};
    findObj[fieldName]=value;
    var matches = collection.find(findObj).fetch();
    for(var i = 0; i < matches.length; i++){
      if(matches[i]._id != docID) return value + " already exists";
    }
  }
  return false;
};