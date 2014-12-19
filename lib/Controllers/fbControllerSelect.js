if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerSelect) !== "object") FormBuilder.controllers.fbControllerSelect = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerSelect.getValue = function(fieldName, parentID, position, callback){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    position.value++;
    callback({visible:view.isVisible,  value:view.currentValue});
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerSelect.setValue = function(fieldName, parentID, position, value){
    var id = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})._id;
    var result = FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
    position.value++;
    return result;
  };
  
  FormBuilder.controllers.fbControllerSelect.setError = function(fieldName, parentID, position, errors){
    var message = errors[fieldName];
    message = message || false;
    FormBuilder.views.update({fieldName:fieldName, parentID:parentID, position:position.value}, {$set:{error:message}});
    position.value++;
  };

  //Add all of the required views for this controller
  FormBuilder.controllers.fbControllerSelect.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    schemaObj = _.pick(schemaObj, 'controller', 'view', 'labelText', 'unique', 'asYouType', 'optional', 'defaultValue', 'dataSource', 'placeholder', 'filter');
    schemaObj = _.defaults(schemaObj, {view:'fbViewSelect', filter:0xFFFF});
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
FormBuilder.controllers.fbControllerSelect.validate = function(fieldName, value, schemaObj, collection, docID){
    if((value === '') && (!schemaObj.optional))
    return "This is a required field";
  if((value === '') && schemaObj.optional)
    return false;
  value = schemaObj.isNumber ? parseFloat(value) : value;
  //Check if the value exists in the collection
  var data = schemaObj.dataSource.split(".");
  var collection = Meteor.isClient ? window[data[0]] : this[data[0]];
  var field = data[1] || 'name';
  var query = {};
  query[field] = value;
  if(!collection.findOne(query))
      return value + " does not exist in collection " + data;
  //Check for the value being unique
  if(schemaObj.unique){
    var findObj = {};
    findObj[fieldName]=value;
    var matches = collection.find(findObj).fetch();
    for(var i = 0; i < matches.length; i++){
      if(matches[i]._id !== docID) return value + " already exists";
    }
  }
  return false;
};