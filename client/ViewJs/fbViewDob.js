Template.fbViewDob_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewDob_read.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewDob_create_update.events({
  'input':function(event,context) {
    var controller = FormBuilder.controllers[context.data.schemaObj.controller];
    controller.setValue(context.data.fieldName, context.data.parentID, {value:context.data.position}, event.target.value);
  }
});

Template.fbViewDob_read.helpers({
  getAge:function() {
    return moment().diff(this.currentValue, 'years');
  }
});