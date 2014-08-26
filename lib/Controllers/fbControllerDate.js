if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerDate) !== "object") FormBuilder.controllers.fbControllerDate = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerDate.getValue = function(fieldName, parentID, position){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})
    position.value++;
    return {visible:view.isVisible,  value:view.currentValue};
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerDate.setValue = function(fieldName, parentID, position, value){
    var id = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})._id;
    var result = FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
    position.value++;
    return result;
  };
  
  FormBuilder.controllers.fbControllerDate.setError = function(fieldName, parentID, position, message){
    message = message || false;
    FormBuilder.views.update({fieldName:fieldName, parentID:parentID, position:position.value}, {$set:{error:message}});
    position.value++;
  };

  //Add all of the required views for this controller
  FormBuilder.controllers.fbControllerDate.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    schemaObj = _.pick(schemaObj, 'controller', 'view', 'labelText', 'unique', 'asYouType', 'optional', 'defaultValue', 'minValue', 'maxValue');
    schemaObj = _.defaults(schemaObj, {view:'fbViewDate'});
   
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
      isVisible:true
      };
    var defaultValue = moment(schemaObj.defaultValue, 'YYYY-MM-DD', true);
    document.currentValue = defaultValue.isValid() ? defaultValue : null;
    position.value++;
    return FormBuilder.views.insert(document);
  };
}
//Validate the data for this database field, this can be called on the server or on the client
FormBuilder.controllers.fbControllerDate.validate = function(fieldName, value, schemaObj, collection, docID){
  if((!value) && (!schemaObj.optional))
    return "This is a required value";
  if((!value) && schemaObj.optional)
    return false;
  value = moment(value);
  if(!value.isValid())
    return "Enter a valid date";
  var minValue = moment(schemaObj.minValue, 'YYYY-MM-DD', true);
  var maxValue = moment(schemaObj.maxValue, 'YYYY-MM-DD', true);
  if(maxValue.isValid() && (value.isAfter(maxValue)))
    return 'The latest allowed date is ' + maxValue.format('DD/MM/YYYY');
  if(minValue.isValid() && (value.isBefore(minValue)))
    return 'The earliest allowed date is ' + minValue.format('DD/MM/YYYY');
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