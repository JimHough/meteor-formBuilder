//Use obj to shorten following lines
var obj = function(){};
//Code only run on the client
if(Meteor.isClient){
  //Gets the value from the view on the form
  obj.prototype.getValue = function(fieldName, parentID, position, callback){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var form = FormBuilder.forms.findOne(view.formID);
    position.value++;
    var result = !!(view.schemaObj.filter & form.filter) ? view.currentValue : undefined;
    callback(result);
  };
  //Sets the value to the view on the form
  obj.prototype.setValue = function(fieldName, parentID, position, value){
    if(value !== undefined){
      var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
      var form = FormBuilder.forms.findOne(view.formID);
      var result = FormBuilder.views.update({_id:view._id}, {$set:{currentValue:value}});
      if(view.schemaObj.asYouType){
        var error = FormBuilder.controllers[view.schemaObj.controller].validate(view.fieldName, value, view.schemaObj, Mongo.Collection.get(form.collection), form.document);
        FormBuilder.views.update({_id:view._id}, {$set:{error:error}});
      }
      position.value++;
      //Call the valueChange function if defined
      var collection = Mongo.Collection.get(form.collection);
      //TODO Get paths for nested items
      var obj = Object.resolve(view.schemaObj.schemaPath, collection, true);
      if(obj && obj.valueChange) obj.valueChange(value, view);
      return result;
    }
    else
      position.value++;
  };
  //Sets the error text for the view on the form
  obj.prototype.setError = function(fieldName, parentID, position, errors){
    var message = errors[fieldName];
    message = message || false;
    FormBuilder.views.update({fieldName:fieldName, parentID:parentID, position:position.value}, {$set:{error:message}});
    position.value++;
  };
  //Add all of the required views for this controller
  obj.prototype.addViews = function(fieldName, formID, schemaObj, position, parentID){
    parentID = parentID || formID;
    schemaObj = this.normaliseSchema(schemaObj);
    var form = FormBuilder.forms.findOne(formID);
    var template = FormBuilder.helpers.findTemplate(schemaObj.view, form.type);
    var document = this.getDocument(parentID, fieldName, position.value, template, formID, schemaObj);
    position.value++;
    return FormBuilder.views.insert(document);
  };
}

//Gets an object that defines the schema default values
  obj.prototype.getSchemaDefaults = function(){
    return {
      schemaPath:"",
      controller:"",
      view:"",
      labelText:"",
      defaultValue:null,
      unique:false,
      asYouType:false,
      optional:false,
      filter:0xFFFF,
      title:undefined
    };
  };
  //Get the document object for inserting in the database
  obj.prototype.getDocument = function(parentID, fieldName, position, template, formID, schemaObj){
    return {
      //Common
      parentID:parentID,
      formID:formID,
      fieldName:fieldName,
      position:position,
      template:template,
      schemaObj:_.omit(schemaObj, ['valueChange']),
      error:false,
      textarea:schemaObj.textarea,
      currentValue:schemaObj.defaultValue || ''
      };
  };
  //Filters the schema object fields and sets default values for any missing fields
  obj.prototype.normaliseSchema = function(schemaObj){
    var defaults = this.getSchemaDefaults();
    var keysWhitelist = _.keys(defaults);
    var filteredSchema = _.pick(schemaObj, keysWhitelist);
    return _.defaults(filteredSchema, defaults);
  };
//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function(fieldName, value, schemaObj, collection, docID){
  if(value === undefined) return undefined;
  if((value === null) || (value === "")){
     return schemaObj.optional ? null : "This is a required field";
  }
  //Check for the value being unique
  if(schemaObj.unique){
    var findObj = {};
    findObj[fieldName]=value;
    var matches = collection.find(findObj).fetch();
    for(var i = 0; i < matches.length; i++){
      if(matches[i]._id !== docID) return value + " already exists";
    }
  }
  return false;
};

if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerBase) !== "object") FormBuilder.controllers.fbControllerBase = obj;