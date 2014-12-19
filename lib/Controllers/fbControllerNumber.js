if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerNumber) !== "object") FormBuilder.controllers.fbControllerNumber = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerNumber.getValue = function(fieldName, parentID, position, callback){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})
    position.value++;
    callback({visible:view.isVisible,  value:view.currentValue});
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerNumber.setValue = function(fieldName, parentID, position, value){
    var id = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})._id;
    var result = FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
    position.value++;
    return result;
  };
  
  FormBuilder.controllers.fbControllerNumber.setError = function(fieldName, parentID, position, errors){
    var message = errors[fieldName];
    message = message || false;
    FormBuilder.views.update({fieldName:fieldName, parentID:parentID, position:position.value}, {$set:{error:message}});
    position.value++;
  };

  //Add all of the required views for this controller
  FormBuilder.controllers.fbControllerNumber.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    schemaObj = _.pick(schemaObj, 'controller', 'labelText', 'unique', 'asYouType', 'optional', 'defaultValue', 'view', 'minValue', 'maxValue', 'places', 'step', 'filter');
    schemaObj = _.defaults(schemaObj, {view:'fbViewNumber', minValue:0, maxValue:100, places:0, step:1, filter:0xFFFF});
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
    document.currentValue = FormBuilder.helpers.isNumber(schemaObj.defaultValue) ? schemaObj.defaultValue : null;
    position.value++;
    return FormBuilder.views.insert(document);
  };
}
//Validate the data for this database field, this can be called on the server or on the client
FormBuilder.controllers.fbControllerNumber.validate = function(fieldName, value, schemaObj, collection, docID){
  if((value === null) || (value === undefined)){
     return schemaObj.optional ? false : "This is a required field";
  }
  if(!FormBuilder.helpers.isNumber(value))
    return "Enter a valid number";
  if(schemaObj.maxValue && (value > schemaObj.maxValue))
    return value + " is above the maximum limit of " + schemaObj.maxValue;
  if(schemaObj.minValue && (value < schemaObj.minValue))
    return value + " is below the minimum limit of " + schemaObj.minValue;
  if(FormBuilder.helpers.getDecimalPlaces(value) > schemaObj.places){
    if(schemaObj.places === 0) return "The number should be an integer";
    else if (schemaObj.places === 1) return  "The number should only have 1 decimal place";
    return "The number should only have " + schemaObj.places + " decimal places";
  }
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