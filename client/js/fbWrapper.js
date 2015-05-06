if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
FormBuilder.forms = new Mongo.Collection(null); //store the current form data in a client side collection
FormBuilder.views = new Mongo.Collection(null); //store the current view data in a client side collection
Template.fbWrapper.helpers({
  getForm: function () {
    var tmpl = Template.instance();
    return FormBuilder.forms.findOne({_id: tmpl.formID});
  },
  isList: function () {
    var tmpl = Template.instance();
    var form = FormBuilder.forms.findOne({_id: tmpl.formID});
    return form.type === 'list';
  },
  isScan: function(){
    var tmpl = Template.instance();
    var form = FormBuilder.forms.findOne({_id: tmpl.formID});
    return form.type === 'scan';
  },
  isSnapshot: function(){
    var tmpl = Template.instance();
    var form = FormBuilder.forms.findOne({_id: tmpl.formID});
    return form.type === 'snapshot';
  }
});
//When the template is created make an object that will store the view of the form
Template.fbWrapper.created = function () {
  var template = this;
  //Create the form object and get the ID
  if(template.data.type === 'scan' || template.data.type === 'snapshot'){
    var form = _.pick(template.data, 'type');
    form = _.defaults(form, {type: 'scan'});
    template.formID = FormBuilder.forms.insert(form);
  }
  else{
    var form = _.pick(template.data, 'collection', 'type', 'document', 'labelWidth', 'inputWidth', 'filter');
    form = _.defaults(form, {type: 'read', labelWidth: 3, inputWidth: 9, filter: 0xFFFF});
    //Check that the collection is specified and is valid
    if (((typeof form.collection) !== 'string') || !Mongo.Collection.get(form.collection)) {
      console.error('FormBuilder fbWrapper should be used with collection name as a string parameter.');
      return;
    }
    var collection = Mongo.Collection.get(form.collection);

    //Check that a schema has been specified
    if ((typeof collection.schema) !== 'object') {
      console.error('FormBuilder fbWrapper should be used with a collection that has a schema object.');
      return;
    }
    template.formID = FormBuilder.forms.insert(form);
  }
};

//When the template is destroyed remove the data store
Template.fbWrapper.destroyed = function () {
  //Remove all views for this form
  FormBuilder.views.find({'formID': this.formID}).forEach(function (field) {
    FormBuilder.views.remove({_id: field._id});
  });
  //Remove the form
  FormBuilder.forms.remove({_id: this.formID});
};