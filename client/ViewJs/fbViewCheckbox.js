Template.fbViewCheckbox_create_update.events({
  'change':function(event,context) {
    var value = [];
    context.$('input:checkbox').each(function(i){
      value[i] = (this.checked === true);
    });
    var viewData = FormBuilder.views.findOne({_id:event.target.name});
    FormBuilder.views.update({_id:viewData._id}, {$set:{currentValue:value}});
    if(viewData.schemaObj.asYouType){
      var error = FormBuilder.controllers[viewData.schemaObj.controller].validate(viewData.fieldName, value, viewData.schemaObj, window[viewData.formObj.collection], viewData.formObj.document);
      FormBuilder.views.update({_id:viewData._id}, {$set:{error:error}});
    }
  }
});