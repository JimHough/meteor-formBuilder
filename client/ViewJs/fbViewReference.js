Template.fbViewReference_create_update.helpers({
  currentItem: function(){
    if(this && this.currentValue && this.currentValue.split){
      var data = this.currentValue.split(':');
      if(data.length === 2){
        var collection = Mongo.Collection.get(data[0]);
        if(!collection)
          return '('+this.currentValue+') collection not found.';
        if(collection.format)
          return collection.format(data[1]);
        else
          return '('+this.currentValue+') format function not defined';
      }
    }
    return "No Reference Set";
  }
});

Template.fbViewReference_create_update.events({
  'click .button-qr':function(event,template) {
    
  },
  'click .button-list':function(event,template) {
    //Show a modal with a list to select the item to reference
    var collection = template.data.schemaObj.collection;
    var id = FormBuilder.modals.insert(
            {
              title:'Select an Item', 
              collection:collection,
              type:'list'
            });
    var modals = $(".fbModals");
    //A handler that is called when an item has been selected
    var handlerSelected = function(event, info){
      if(info && info.selected){
        var value = collection + ":" + info.selected;
        var controller = FormBuilder.controllers[template.data.schemaObj.controller];
        controller.setValue(template.data.fieldName, template.data.parentID, {value:template.data.position},value);
        template.data.schemaObj.valueChanged(value);
      }
    };
    //A handler that is called when a modal is hidden
    var handlerHidden = function(event){
      if(event.target.id === id){
        modals.off('fbListSelected', handlerSelected);
        modals.off('hidden.bs.modal', handlerHidden);
      }
    };
    //Turn on the two event handlers
    modals.on('fbListSelected', handlerSelected);
    modals.on('hidden.bs.modal', handlerHidden);
  }
});