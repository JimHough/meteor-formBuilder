Template.fbViewCheckbox_create_update.events({
  'change':function(event,context) {
    var value = [];
    context.$('input:checkbox').each(function(i){
      value[i] = (this.checked === true);
    });
    var controller = FormBuilder.controllers[context.data.schemaObj.controller];
    controller.setValue(context.data.fieldName, context.data.parentID, {value:context.data.position}, value);
    context.data.schemaObj.valueChanged(value);
  }
});

Template.fbViewCheckbox_create_update.helpers({
  getValue:function(){
    var template = Template.instance();
    var view = FormBuilder.views.findOne(template.data._id);
    return view && view.currentValue && view.currentValue[this.index];
  }
});