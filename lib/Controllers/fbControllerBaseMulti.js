var obj = function () {
};
if (Meteor.isClient) {
  //Gets the value from the view on the form
  obj.prototype.getValue = function (fieldName, parentID, position, callback) {
    var view = FormBuilder.views.findOne({parentID: parentID, fieldName: fieldName, position: position.value});
    var form = FormBuilder.forms.findOne(view.formID);
    var views = FormBuilder.views.find({parentID: view._id}, {sort: {position: 1}}).fetch();
    var result = view.arrayValue === false ? {} : [];
    var posn = {value: 0};
    //If this control isn't visible return undefined
    if (!(view.schemaObj.filter & form.filter)){
      callback(undefined);
      position.value++;
      return;
    }
    //If there are no child views just return an empty array
    if(views.length <= 0){
      callback(result);
      position.value++;
      return;
    }
    //Iterate over the sub-views calling the get value method on each one 
    var callbackAsync = _.after(views.length, callback.bind(this));
    _.each(views, function (viewDataObj) {
      FormBuilder.controllers[viewDataObj.schemaObj.controller].getValue(viewDataObj.fieldName, viewDataObj.parentID, posn, function (value) {
        if (view.arrayValue === false)
          result[viewDataObj.fieldName] =  value;
        else
          result[this.position] =  value;
        callbackAsync(result);
      }.bind(viewDataObj));
    });
    position.value++;
  };
  //Sets the value to the view on the form
  obj.prototype.setValue = function (fieldName, parentID, position, value) {
    var view = FormBuilder.views.findOne({parentID: parentID, fieldName: fieldName, position: position.value});
    var posn = {value: 0};
    if(_.isArray(value)){
      FormBuilder.views.find({parentID: view._id}, {sort: {position: 1}}).forEach(function (viewDataObj) {
        FormBuilder.controllers[viewDataObj.schemaObj.controller].setValue(viewDataObj.fieldName, viewDataObj.parentID, posn, value[posn.value]);
      });
    }
    else if(_.isObject(value)){
      FormBuilder.views.find({parentID: view._id}, {sort: {position: 1}}).forEach(function (viewDataObj) {
        FormBuilder.controllers[viewDataObj.schemaObj.controller].setValue(viewDataObj.fieldName, viewDataObj.parentID, posn, value[viewDataObj.fieldName]);
      });
    }
    position.value++;
  };
  //Sets the error text for the view on the form
  obj.prototype.setError = function (fieldName, parentID, position, errors) {
    var view = FormBuilder.views.findOne({parentID: parentID, fieldName: fieldName, position: position.value});
    var posn = {value: 0};
    var message = errors[fieldName];
    //Normalise the message value
    if (typeof message === 'string')
      message = [message];
    else if(view.arrayValue)
      message = message || [];
    else
      message = message || {};
    
    FormBuilder.views.find({parentID: view._id}, {sort: {position: 1}}).forEach(function (viewDataObj) {
      var errors = {};
      if(view.arrayValue)
        errors[viewDataObj.fieldName] = message[posn.value];
      else
        errors = message;
      FormBuilder.controllers[viewDataObj.schemaObj.controller].setError(viewDataObj.fieldName, viewDataObj.parentID, posn, errors);
    });
    position.value++;
  };
  //Data Type Functions
  obj.prototype.addViews = function (fieldName, formID, schemaObj, position, parentID) {
    parentID = parentID || formID;
    schemaObj = this.normaliseSchema(schemaObj);
    var form = FormBuilder.forms.findOne(formID);
    var template = FormBuilder.helpers.findTemplate(schemaObj.view, form.type);
    var document = this.getDocument(parentID, fieldName, position, template, formID, schemaObj);
    position.value++;
    return FormBuilder.views.insert(document);
  };
}

//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  return {
    schemaPath:"",
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
obj.prototype.getDocument = function (parentID, fieldName, position, template, formID, schemaObj) {
  return {
    //Common
    parentID: parentID,
    formID: formID,
    fieldName: fieldName,
    position: position.value,
    template: template,
    schemaObj: _.omit(schemaObj, ['valueChange', 'schemaPath']),
    error: false,
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