Template.fbViewDate_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewDate_read.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewDate_create_update.events({
  'input':function(event,context) {
    var controller = FormBuilder.controllers[context.data.schemaObj.controller];
    controller.setValue(context.data.fieldName, context.data.parentID, {value:context.data.position}, event.target.value);
  }
});
