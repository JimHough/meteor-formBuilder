var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBase;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);
//Get the document object for inserting in the database
obj.prototype.getDocument = function (parentID, fieldName, position, template, formID, schemaObj) {
  var document = objBase.prototype.getDocument.call(this, parentID, fieldName, position, template, formID, schemaObj);
  return document;
};
//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the text controller
  baseObj.view = 'fbViewReference';
  baseObj.collection = '';
  return baseObj;
};

//Validate the data for this database field, this can be called on the server or on the client
obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  var baseResult = objBase.prototype.validate.call(this, fieldName, value, schemaObj, collection, docID);
  if((value === undefined) || (baseResult === null)) //Invisible or optional check
    return false;
  if (baseResult) //Base check returned an error
    return baseResult;
  return false;
};

//Tries to get the referenced document using a string in the format collectionName:documentID
obj.prototype.getDocumentRef = function(ref){
  if(_.isString(ref)){
    var data = ref.split(':');
    if(data.length === 2){
      var collection = Mongo.Collection.get(data[0]);
      if(!collection) return null;
      return collection.findOne(data[1]);
    }
  }
  return null;
};

//Tries to get the string representation of a document using a string in the format collectionName:documentID
obj.prototype.getFormattedRef = function(ref){
  var doc = FormBuilder.controllers.fbControllerReference.getDocumentRef(ref);
  return (doc && doc.summary) ? doc.summary : ref;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerReference) !== "object")
  FormBuilder.controllers.fbControllerReference = new obj();

