//Use obj to shorten following lines
var obj = function(){};
//Code only run on the client
if(Meteor.isClient){
  //Gets the value from the view on the form
  obj.prototype.getValue = function(fieldName, parentID, position, callback){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    position.value++;
    var result = view.isVisible ? view.currentValue : undefined;
    callback(result);
  };
  //Sets the value to the view on the form
  obj.prototype.setValue = function(fieldName, parentID, position, value){
    var id = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})._id;
    var result = FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
    position.value++;
    return result;
  };
  //Sets the error text for the view on the form
  obj.prototype.setError = function(fieldName, parentID, position, errors){
    var message = errors[fieldName];
    message = message || false;
    FormBuilder.views.update({fieldName:fieldName, parentID:parentID, position:position.value}, {$set:{error:message}});
    position.value++;
  };
  //Add all of the required views for this controller
  obj.prototype.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    schemaObj = this.normaliseSchema(schemaObj);
    var template = FormBuilder.helpers.findTemplate(schemaObj.view, formObj.type);
    var document = this.getDocument(parentID, fieldName, position.value, template, formObj, schemaObj);
    position.value++;
    return FormBuilder.views.insert(document);
  };
}

//Gets an object that defines the schema default values
  obj.prototype.getSchemaDefaults = function(){
    return {
      controller:"",
      view:"",
      labelText:"",
      defaultValue:null,
      unique:false,
      asYouType:false,
      optional:false,
      filter:0xFFFF
    };
  };
  //Get the document object for inserting in the database
  obj.prototype.getDocument = function(parentID, fieldName, position, template, formObj, schemaObj){
    return {
      //Common
      parentID:parentID,
      fieldName:fieldName,
      position:position,
      template:template,
      formObj:formObj,
      schemaObj:schemaObj,
      error:false,
      textarea:schemaObj.textarea,
      isVisible:((formObj.filter & schemaObj.filter) !== 0),
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
  if(value === undefined) return false;
  if((value === null) || (value === "")){
     return schemaObj.optional ? false : "This is a required field";
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