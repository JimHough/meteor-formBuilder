if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerDob) !== "object") FormBuilder.controllers.fbControllerDob = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerDob.getValue = function(fieldName, parentID, position, callback){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})
    position.value++;
    callback({visible:view.isVisible,  value:view.currentValue});
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerDob.setValue = function(fieldName, parentID, position, value){
    var id = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})._id;
    var result = FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
    position.value++;
    return result;
  };
  
  FormBuilder.controllers.fbControllerDob.setError = function(fieldName, parentID, position, errors){
    var message = errors[fieldName];
    message = message || false;
    FormBuilder.views.update({fieldName:fieldName, parentID:parentID, position:position.value}, {$set:{error:message}});
    position.value++;
  };

  //Add all of the required views for this controller
  FormBuilder.controllers.fbControllerDob.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    schemaObj = _.pick(schemaObj, 'controller', 'view', 'labelText', 'unique', 'asYouType', 'optional', 'defaultValue', 'minAge', 'maxAge');
    schemaObj = _.defaults(schemaObj, {view:'fbViewDob'});
    //Compute the date if only the age was given
    if (FormBuilder.helpers.isInt(schemaObj.minAge)) schemaObj.maxValue = moment().subtract(schemaObj.minAge, 'years').format('YYYY-MM-DD');
    if (FormBuilder.helpers.isInt(schemaObj.maxAge)) schemaObj.minValue = moment().subtract(schemaObj.maxAge, 'years').format('YYYY-MM-DD');
   
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
FormBuilder.controllers.fbControllerDob.validate = function(fieldName, value, schemaObj, collection, docID){
  if((!value) && (!schemaObj.optional))
    return "This is a required value";
  if((!value) && schemaObj.optional)
    return false;
  value = moment(value);
  if(!value.isValid())
    return "Enter a valid date";
  var age = moment().diff(value, 'years');
  if(schemaObj.maxAge && (age > schemaObj.maxAge))
    return 'You are ' + age + ' years old? The maximum accepted is ' + schemaObj.maxAge + ' years old.';
  if(schemaObj.minAge && (age < schemaObj.minAge))
    return 'You are ' + age + ' years old? The minimum accepted is ' + schemaObj.minAge + ' years old.';
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