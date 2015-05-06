Template.fbViewSubdocument_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewSubdocument_read.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewSubdocument_create_update.helpers({
  //Gets the array of views from the relevant data store for the form
  getViews: function () {
    var tmpl = Template.instance();
    return FormBuilder.views.find({parentID: this._id}, {sort: {position: 1}});
  },
  getTemplate: function () {
    return Template[this.template];
  }
});