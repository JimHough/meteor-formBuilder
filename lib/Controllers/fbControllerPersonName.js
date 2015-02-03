var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBaseMulti;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);

if (Meteor.isClient) {
  //Data Type Functions
  obj.prototype.addViews = function (fieldName, formObj, schemaObj, position, parentID) {
    schemaObj = this.normaliseSchema(schemaObj);
    var baseResult = objBase.prototype.addViews.call(this, fieldName, formObj, schemaObj, position, parentID);
    var forenameSchema = FormBuilder.controllers.fbControllerPersonName.generateForenameSchema(schemaObj);
    var middlenamesSchema = FormBuilder.controllers.fbControllerPersonName.generateMiddlenameSchema(schemaObj);
    var surnameSchema = FormBuilder.controllers.fbControllerPersonName.generateSurnameSchema(schemaObj);
    var posn = {value: 0};
    FormBuilder.controllers[schemaObj.controllerText].addViews(fieldName, formObj, forenameSchema, posn, baseResult);
    FormBuilder.controllers[schemaObj.controllerArray].addViews(fieldName, formObj, middlenamesSchema, posn, baseResult);
    FormBuilder.controllers[schemaObj.controllerText].addViews(fieldName, formObj, surnameSchema, posn, baseResult);
    return baseResult;
  };
}
//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the text controller
  baseObj.view = 'fbViewPersonName';
  baseObj.forenameTxt = 'Forename';
  baseObj.surnameTxt = 'Surname';
  baseObj.middleNamesTxt = 'Middle Names';
  baseObj.controllerText = 'fbControllerText';
  baseObj.viewText = 'fbViewText';
  baseObj.controllerArray = 'fbControllerArray';
  baseObj.viewArray = 'fbViewArray';
  return baseObj;
};
obj.prototype.generateForenameSchema = function (schemaObj) {
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.forenameTxt,
    asYouType: true,
    //Specific
    maxLength: 30
  };
};

obj.prototype.generateMiddlenameSchema = function (schemaObj) {
  return {
    controller: schemaObj.controllerArray,
    view: schemaObj.viewArray,
    labelText: schemaObj.middleNamesTxt,
    //Specific
    maxCount: 4,
    minCount: 0,
    dataSchema: {
      controller: schemaObj.controllerText,
      view: schemaObj.viewText,
      asYouType: true,
      //Specific
      maxLength: 30
    }
  };
};

obj.prototype.generateSurnameSchema = function (schemaObj) {
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.surnameTxt,
    asYouType: true,
    //Specific
    maxLength: 30
  };
};

obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  var nameSchemaObj = FormBuilder.controllers.fbControllerPersonName.normaliseSchema(schemaObj);
  var forenameSchema = FormBuilder.controllers.fbControllerPersonName.generateForenameSchema(nameSchemaObj);
  var middlenamesSchema = FormBuilder.controllers.fbControllerPersonName.generateMiddlenameSchema(nameSchemaObj);
  var surnameSchema = FormBuilder.controllers.fbControllerPersonName.generateSurnameSchema(nameSchemaObj);

  if (!value)
    return ['fbControllerPersonName.validate value passed is incorrect'];

  var msgForename = FormBuilder.controllers[nameSchemaObj.controllerText].validate(fieldName, value[0], forenameSchema, collection, docID);
  var msgMiddlenames = FormBuilder.controllers[nameSchemaObj.controllerArray].validate(fieldName, value[1], middlenamesSchema, collection, docID);
  var msgSurname = FormBuilder.controllers[nameSchemaObj.controllerText].validate(fieldName, value[2], surnameSchema, collection, docID);

  return (msgForename || msgMiddlenames || msgSurname) ? [msgForename, msgMiddlenames, msgSurname] : false;
};

//Gets the full name as a string
obj.prototype.getFullName = function (doc) {
  var result = doc[0];
  _.each(doc[1], function (name) {
    result += ' ' + name;
  });
  result += ' ' + doc[2];
  return result.trim();
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerPersonName) !== "object")
  FormBuilder.controllers.fbControllerPersonName = new obj();