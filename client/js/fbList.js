Template.fbList.helpers({
  getTable: function () {
    return FormBuilder.tables[this.collection];
  }
});
//When the template is created make an object that will store the view of the form
Template.fbList.created = function () {
  this.formID = this.data._id;
  var form = FormBuilder.forms.findOne(this.formID);
  var collection = Mongo.Collection.get(form.collection);
  //Check that a schema has been specified
  if ((typeof collection.columns) !== 'object') {
    console.error('FormBuilder fbWrapper should be used with a collection that has a columns object.');
    return;
  }
  //Create a table if one doesnt already exist for this collection
  if (!FormBuilder.tables[form.collection]) {
    console.error('FormBuilder fbWrapper list types should be used with a collection that has been added to the table views using FormBuilder.tables.AddCollection(collectionName).');
    return;
  }
};

Template.fbList.events({
  'click .btn-form-select': function (event, template) {
    if (template.currentSelection) {
      var info = {selected: template.currentSelection};
      template.$("form[name='" + template.formID + "']").trigger('fbListSelected', [info]);
    }
  },
  'click tbody tr': function (event, template) {
    if (template.$(event.currentTarget).hasClass('selected')) {
      template.$(event.currentTarget).removeClass('selected');
      template.currentSelection = undefined;
      template.$('.btn-form-select').prop('disabled', true);
    } else {
      var dataTable = template.$(event.currentTarget).closest('table').DataTable();
      dataTable.$('tr.selected').removeClass('selected');
      template.$(event.currentTarget).addClass('selected');
      //Store the item that is highlighted on the template
      var rowData = dataTable.row(event.currentTarget).data();
      template.currentSelection = rowData._id;
      template.$('.btn-form-select').prop('disabled', false);
    }
  }
});


