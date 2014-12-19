Template.fbViewSelect_create_update.events({
    /*'input': function (event, context) {
        var value = event.target.value;
        var viewData = FormBuilder.views.findOne({_id: event.target.id});
        FormBuilder.views.update({_id: viewData._id}, {$set: {currentValue: value}});
        if (viewData.schemaObj.asYouType) {
            var error = FormBuilder.controllers[viewData.schemaObj.controller].validate(viewData.fieldName, value, viewData.schemaObj, window[viewData.formObj.collection], viewData.formObj.document);
            FormBuilder.views.update({_id: viewData._id}, {$set: {error: error}});
        }
    }*/
});

Template.fbViewSelect_create_update.rendered = function () {
    var template = this;
    var data = template.data.schemaObj.dataSource.split(".");
    var collection = window[data[0]];
    var field = data[1] || 'name';
    template.autorun(function(){
        var select = template.$('select')[0];
        collection.find().forEach(
            function (myDoc) {
                var option = document.createElement("option");
                option.text = myDoc[field] + "";
                select.add(option);
            }
        );
    });
};