Template.fbViewNumber_create_update.events({
  'input':function(event,context) {
    //Check for an empty input box and force the value to null, otherwise an empty string means an invalid input
    var value = null;
    if(!event.target.validity.valid || (event.target.value !== ''))
      value = parseFloat(event.target.value);
    var viewData = FormBuilder.views.findOne({_id:event.target.id});
    FormBuilder.views.update({_id:viewData._id}, {$set:{currentValue:value}});
    if(viewData.schemaObj.asYouType){
      var error = FormBuilder.controllers[viewData.schemaObj.controller].validate(viewData.fieldName, value, viewData.schemaObj, window[viewData.formObj.collection], viewData.formObj.document);
      FormBuilder.views.update({_id:viewData._id}, {$set:{error:error}});
    }
  }
});