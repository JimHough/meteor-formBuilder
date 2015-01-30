Template.fbViewCheckbox_create_update.events({
  'input':function(event,context) {
    var value = event.target.value;
    var viewData = FormBuilder.views.findOne({_id:event.target.id});
    FormBuilder.views.update({_id:viewData._id}, {$set:{currentValue:value}});
    if(viewData.schemaObj.asYouType){
      var error = FormBuilder.controllers[viewData.schemaObj.controller].validate(viewData.fieldName, value, viewData.schemaObj, window[viewData.formObj.collection], viewData.formObj.document);
      FormBuilder.views.update({_id:viewData._id}, {$set:{error:error}});
    }
  }
});