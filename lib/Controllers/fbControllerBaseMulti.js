var obj = function () {
};
if (Meteor.isClient) {
  //Gets the value from the view on the form
  obj.prototype.getValue = function (fieldName, parentID, position, callback) {
    var result = [];
    var view = FormBuilder.views.findOne({parentID: parentID, fieldName: fieldName, position: position.value});
    var posn = {value: 0};
    var views = FormBuilder.views.find({parentID: view._id}, {sort: {position: 1}}).fetch();
    //Iterate over the sub-views calling the get value method on each one 
    var callbackAsync = _.after(views.length, callback.bind(this));
    _.each(views, function (viewDataObj) {
      FormBuilder.controllers[viewDataObj.schemaObj.controller].getValue(viewDataObj.fieldName, viewDataObj.parentID, posn, function (value) {
        result[this.position] = value.value;
        callbackAsync({visible: view.isVisible, value: result});
      }.bind(viewDataObj));
    });
    position.value++;
  };
  //Sets the value to the view on the form
  obj.prototype.setValue = function (fieldName, parentID, position, value) {
    var view = FormBuilder.views.findOne({parentID: parentID, fieldName: fieldName, position: position.value});
    var posn = {value: 0};
    FormBuilder.views.find({parentID: view._id}, {sort: {position: 1}}).forEach(function (viewDataObj) {
      FormBuilder.controllers[viewDataObj.schemaObj.controller].setValue(viewDataObj.fieldName, viewDataObj.parentID, posn, value[posn.value]);
    });
    position.value++;
  };
  //Sets the error text for the view on the form
  obj.prototype.setError = function (fieldName, parentID, position, errors) {
    var message = errors[fieldName];
    if (typeof message === 'string')
      message = [message];
    message = message || [];
    var view = FormBuilder.views.findOne({parentID: parentID, fieldName: fieldName, position: position.value});
    var posn = {value: 0};
    FormBuilder.views.find({parentID: view._id}, {sort: {position: 1}}).forEach(function (viewDataObj) {
      var errors = {};
      errors[viewDataObj.fieldName] = message[posn.value];
      FormBuilder.controllers[viewDataObj.schemaObj.controller].setError(viewDataObj.fieldName, viewDataObj.parentID, posn, errors);
    });
    position.value++;
  };
  //Data Type Functions
  obj.prototype.addViews = function (fieldName, formObj, schemaObj, position, parentID) {
    parentID = parentID || formObj._id;
    schemaObj = this.normaliseSchema(schemaObj);
    var template = FormBuilder.helpers.findTemplate(schemaObj.view, formObj.type);
    var document = this.getDocument(parentID, fieldName, position, template, formObj, schemaObj);
    position.value++;
    return FormBuilder.views.insert(document);
  };
}

//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  return {
    controller: "",
    view: "",
    labelText: "",
    defaultValue: [],
    unique: false,
    asYouType: false,
    optional: false,
    filter: 0xFFFF
  };
};
//Get the document object for inserting in the database
obj.prototype.getDocument = function (parentID, fieldName, position, template, formObj, schemaObj) {
  return {
    //Common
    parentID: parentID,
    fieldName: fieldName,
    position: position.value,
    template: template,
    formObj: formObj,
    schemaObj: schemaObj,
    error: false,
    isVisible: true,
    currentValue: schemaObj.defaultValue || []
  };
};
//Filters the schema object fields and sets default values for any missing fields
obj.prototype.normaliseSchema = function (schemaObj) {
  var defaults = this.getSchemaDefaults();
  var keysWhitelist = _.keys(defaults);
  var filteredSchema = _.pick(schemaObj, keysWhitelist);
  return _.defaults(filteredSchema, defaults);
};

obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  return false;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerBaseMulti) !== "object")
  FormBuilder.controllers.fbControllerBaseMulti = obj;