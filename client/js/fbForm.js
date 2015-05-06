Template.fbForm.helpers({
  //Gets the array of views from the relevant data store for the form
  getViews: function () {
    var tmpl = Template.instance();
    return FormBuilder.views.find({parentID: tmpl.formID}, {sort: {position: 1}});
  },
  getTemplate: function () {
    return Template[this.template];
  },
  getForm: function () {
    var tmpl = Template.instance();
    return FormBuilder.forms.findOne({_id: tmpl.formID});
  },
  isCreate: function () {
    var tmpl = Template.instance();
    var form = FormBuilder.forms.findOne({_id: tmpl.formID});
    return form.type === 'create';
  },
  isUpdate: function () {
    var tmpl = Template.instance();
    var form = FormBuilder.forms.findOne({_id: tmpl.formID});
    return form.type === 'update';
  },
  isRead: function () {
    var tmpl = Template.instance();
    var form = FormBuilder.forms.findOne({_id: tmpl.formID});
    return form.type === 'read';
  }
});
//When the template is created make an object that will store the view of the form
Template.fbForm.created = function () {
  this.formID = this.data._id;
  this.success = false;
  var form = FormBuilder.forms.findOne(this.formID);
  var collection = Mongo.Collection.get(form.collection);
  //The position object is used for sorting the views, it is incremented internally inside the addViews method
  var position = {value: 0};
  collection.schema.schemaPath = 'schema';
  //Iterate over the schema object calling the add views method on each one 
  _.each(collection.schema, function (schemaObj, fieldName) {
    if(fieldName === 'schemaPath') return;
    schemaObj.schemaPath = collection.schema.schemaPath + "." + fieldName;
    //Get the controller for this database field
    if (((typeof schemaObj.controller) !== 'string') || !FormBuilder.controllers[schemaObj.controller])
      console.warn(form.collection + schemaObj.schemaPath + ' controller ' + schemaObj.controller + ' not found.');
    else {
      FormBuilder.controllers[schemaObj.controller].addViews(fieldName, form._id, schemaObj, position, form._id);
    }
  });
  if (form.type === 'read' || form.type === 'update')
    FormBuilder.helpers.loadCurrentValues(form._id);
};

Template.fbForm.destroyed = function(){
  if(!this.success)
    $("form[name='" + this.formId + "']").trigger('fbDestroyed');
};

Template.fbForm.events({
  //When submit is pressed try to insert, if an error is shown update the data store to show the error
  'submit form': function (event, template) {
    event.preventDefault();
    var form = FormBuilder.forms.findOne(template.formID);
    var collection = Mongo.Collection.get(form.collection);
    FormBuilder.helpers.getCurrentValues(form._id, function (doc) {
      //Remove undefined fields
      Object.deleteUndefined(doc,true);
      
      var databaseCallback = function (errors, id) {
        //id comes through as number of affected documents with update correct this here
        if(form.type === 'update')
          id = form.document;
        var error = !!errors;
        if (error) {
          try {
            errors = JSON.parse(errors.reason);
          } catch (e) {
            alert(errors.reason);
          }
        }
        else
          errors = {};

        //Iterate over the schema object calling the set error method on each one 
        var position = {value: 0};
        _.each(collection.schema, function (schemaObj, fieldName) {
          if(fieldName === 'schemaPath')return;
          FormBuilder.controllers[schemaObj.controller].setError(fieldName, form._id, position, errors, id);
        });
        if (!error){
          doc = collection.findOne(id);
          template.success = true;
        }
        if (form.type === 'create')
          $("form[name='" + form._id + "']").trigger('fbAfterCreate', [{doc: doc, error: error}]);
        else if (form.type === 'update')
          $("form[name='" + form._id + "']").trigger('fbAfterUpdate', [{doc: doc, error: error}]);
      };

      if (form.type === 'create') {
        var info = {doc: doc, continue: true};
        $("form[name='" + form._id + "']").trigger('fbBeforeCreate', [info]);
        if (info.continue)
          collection.insert(doc, databaseCallback);
      }
      else if (form.type === 'update') {
        var info = {doc: doc, continue: true};
        $("form[name='" + form._id + "']").trigger('fbBeforeUpdate', [info]);
        if (info.continue)
          collection.update({_id: form.document}, {$set: doc}, databaseCallback);
      }
    });
  }
});


