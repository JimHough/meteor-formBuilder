Template.fbViewQRCode_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewQRCode_read.helpers(FormBuilder.helpers.viewBaseHelpers);

Template.fbViewQRCode_create_update.events({
  'click .button-start' : function (event, template) {
    event.preventDefault();
    var controller = FormBuilder.controllers[template.data.schemaObj.controller];
    FormBuilder.modals.addScan({title:'Scan a QR code'}, {'fbScanComplete':function(event,info){
      controller.setValue(template.data.fieldName, template.data.parentID, {value:template.data.position}, info.data);
    }});
  }
});
