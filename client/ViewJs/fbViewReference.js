Template.fbViewReference_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewReference_read.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewReference_create_update.helpers({
  currentItem: function(){
    return FormBuilder.controllers.fbControllerReference.getFormattedRef(this.currentValue);
  }
});

Template.fbViewReference_create_update.events({
  'click .button-qr':function(event,template) {
    FormBuilder.modals.addScan({title:'Scan reference document'}, {'fbScanComplete':function(event,info){
      console.log("Finished scanning " + info.data);
    }});
  },
  'click .button-list':function(event,template) {
    //Show a modal with a list to select the item to reference
    var collection = template.data.schemaObj.collection;
    FormBuilder.modals.addList({title:'Select an Item', collection:collection},{'fbListSelected':function(event, info){
      if(info && info.selected){
        var value = collection + ":" + info.selected;
        var controller = FormBuilder.controllers[template.data.schemaObj.controller];
        controller.setValue(template.data.fieldName, template.data.parentID, {value:template.data.position},value);
      }
    }});
  },
  'click .button-create':function(event,template) {
    //Show a modal with a list to select the item to reference
    var collection = template.data.schemaObj.collection;
    FormBuilder.modals.addCreateForm({title:'Create a new Item', collection:collection, filter:template.data.schemaObj.addFormFilter, title:template.data.schemaObj.addFormTitle},{'fbAfterCreate':function(event, info){
      if(info && info.doc && info.doc._id){
        var value = collection + ":" + info.doc._id;
        var controller = FormBuilder.controllers[template.data.schemaObj.controller];
        controller.setValue(template.data.fieldName, template.data.parentID, {value:template.data.position},value);
      }
    }});
  }
});