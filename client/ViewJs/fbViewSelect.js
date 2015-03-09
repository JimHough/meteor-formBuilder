Template.fbViewSelect_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewSelect_read.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewSelect_create_update.events({
  'input': function (event, context) {
    var controller = FormBuilder.controllers[context.data.schemaObj.controller];
    controller.setValue(context.data.fieldName, context.data.parentID, {value: context.data.position}, event.target.value);
  }
});

Template.fbViewSelect_create_update.rendered = function () {
    var template = this;
    var source = template.data.schemaObj.dataSource;
    if(typeof source === "string")
    {
      var data = source.split(".");
      var collection = Mongo.Collection.get(data[0]);
      var field = data[1] || 'name';
      template.autorun(function(){
          var select = template.$('select')[0];
          if(select){
            select.add(document.createElement("option"));
            collection.find().forEach(
                function (myDoc) {
                    var option = document.createElement("option");
                    option.text = myDoc[field] + "";
                    if(option.text === template.data.currentValue)option.selected = "selected";
                    select.add(option);
                }
            );
          }
      });
    }
    else if(typeof source === 'object' && source.length){
      var select = template.$('select')[0];
      if(select){
        select.add(document.createElement("option"));
        _.each(source, function(myDoc) {
          var option = document.createElement("option");
          option.text = myDoc + "";
          if(option.text === template.data.currentValue)option.selected = "selected";
          select.add(option);
        });
      }
    }
};