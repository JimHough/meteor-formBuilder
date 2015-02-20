Template.fbViewText_create_update.events({
  'input':function(event,context) {
    var controller = FormBuilder.controllers[context.data.schemaObj.controller];
    controller.setValue(context.data.fieldName, context.data.parentID, {value:context.data.position}, event.target.value);
    context.data.schemaObj.valueChanged(event.target.value);
  }
});