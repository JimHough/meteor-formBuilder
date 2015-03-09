Template.fbViewNumber_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewNumber_read.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewNumber_create_update.events({
  'input':function(event,context) {
    //Check for an empty input box and force the value to null, otherwise an empty string means an invalid input
    var value = null;
    if(!event.target.validity.valid || (event.target.value !== ''))
      value = parseFloat(event.target.value);
    var controller = FormBuilder.controllers[context.data.schemaObj.controller];
    controller.setValue(context.data.fieldName, context.data.parentID, {value:context.data.position}, value);
  }
});