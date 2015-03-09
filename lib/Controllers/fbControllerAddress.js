var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBaseMulti;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);

if (Meteor.isClient) {
  //Data Type Functions
  obj.prototype.addViews = function (fieldName, formID, schemaObj, position, parentID) {
    schemaObj = this.normaliseSchema(schemaObj);
    var baseResult = objBase.prototype.addViews.call(this, fieldName, formID, schemaObj, position, parentID);
    var organisationSchema = FormBuilder.controllers.fbControllerAddress.generateOrganisationSchema(schemaObj);
    var buildingSchema = FormBuilder.controllers.fbControllerAddress.generateBuildingSchema(schemaObj);
    var streetSchema = FormBuilder.controllers.fbControllerAddress.generateStreetSchema(schemaObj);
    var townSchema = FormBuilder.controllers.fbControllerAddress.generateTownSchema(schemaObj);
    var postCodeSchema = FormBuilder.controllers.fbControllerAddress.generatePostCodeSchema(schemaObj);
    var countrySchema = FormBuilder.controllers.fbControllerAddress.generateCountrySchema(schemaObj);
    var posn = {value: 0};
    var organisationID = FormBuilder.controllers[schemaObj.controllerText].addViews(fieldName, formID, organisationSchema, posn, baseResult);
    FormBuilder.controllers[schemaObj.controllerText].addViews(fieldName, formID, buildingSchema, posn, baseResult);
    FormBuilder.controllers[schemaObj.controllerText].addViews(fieldName, formID, streetSchema, posn, baseResult);
    FormBuilder.controllers[schemaObj.controllerText].addViews(fieldName, formID, townSchema, posn, baseResult);
    FormBuilder.controllers[schemaObj.controllerText].addViews(fieldName, formID, postCodeSchema, posn, baseResult);
    FormBuilder.controllers[schemaObj.controllerTypeahead].addViews(fieldName, formID, countrySchema, posn, baseResult);
    if(!schemaObj.showOrganisation)
      FormBuilder.views.update({_id: organisationID}, {$set: {'schemaObj.filter': 0x0000}});
    return baseResult;
  };
}

//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the text controller
  baseObj.view = 'fbViewAddress';
  baseObj.showOrganisation = true;
  baseObj.countriesDataSource = null;
  baseObj.organisationTxt = 'Company/Organisation';
  baseObj.buildingTxt = 'Building Name/Number';
  baseObj.streetTxt = 'Street Name';
  baseObj.townTxt = 'City/Town';
  baseObj.postCodeTxt = 'Post Code';
  baseObj.countryTxt = 'Country';
  baseObj.controllerText = 'fbControllerText';
  baseObj.viewText = 'fbViewText';
  baseObj.controllerTypeahead = 'fbControllerTypeahead';
  baseObj.viewTypeahead = 'fbViewTypeahead';
  baseObj.countriesPlaceholder = 'Select Country';
  return baseObj;
};

obj.prototype.generateOrganisationSchema = function (schemaObj) {
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.organisationTxt,
    asYouType: true,
    optional: true,
    //Specific
    maxLength: 60
  };
};

obj.prototype.generateBuildingSchema = function (schemaObj) {
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.buildingTxt,
    asYouType: true,
    //Specific
    maxLength: 60
  };
};

obj.prototype.generateStreetSchema = function (schemaObj) {
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.streetTxt,
    asYouType: true,
    //Specific
    maxLength: 60
  };
};

obj.prototype.generateTownSchema = function (schemaObj) {
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.townTxt,
    asYouType: true,
    //Specific
    maxLength: 30
  };
};

obj.prototype.generatePostCodeSchema = function (schemaObj) {
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.postCodeTxt,
    asYouType: true,
    //Specific
    maxLength: 7
  };
};

obj.prototype.generateCountrySchema = function (schemaObj) {
  return {
    controller: schemaObj.controllerTypeahead,
    view: schemaObj.viewTypeahead,
    labelText: schemaObj.countryTxt,
    //Specific
    maxLength: 50,
    dataSource: schemaObj.countriesDataSource,
    placeholder: schemaObj.countriesPlaceholder
  };
};

obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  var addressSchemaObj = FormBuilder.controllers.fbControllerAddress.normaliseSchema(schemaObj);
  var organisationSchema = FormBuilder.controllers.fbControllerAddress.generateOrganisationSchema(addressSchemaObj);
  var buildingSchema = FormBuilder.controllers.fbControllerAddress.generateBuildingSchema(addressSchemaObj);
  var streetSchema = FormBuilder.controllers.fbControllerAddress.generateStreetSchema(addressSchemaObj);
  var townSchema = FormBuilder.controllers.fbControllerAddress.generateTownSchema(addressSchemaObj);
  var postCodeSchema = FormBuilder.controllers.fbControllerAddress.generatePostCodeSchema(addressSchemaObj);
  var countrySchema = FormBuilder.controllers.fbControllerAddress.generateCountrySchema(addressSchemaObj);

  if (!value)
    return ['fbControllerAddress.validate value passed is incorrect'];

  var msgOrganisation = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[0], organisationSchema, collection, docID);
  var msgBuilding = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[1], buildingSchema, collection, docID);
  var msgStreet = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[2], streetSchema, collection, docID);
  var msgTown = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[3], townSchema, collection, docID);
  var msgPostCode = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[4], postCodeSchema, collection, docID);
  var msgCountry = FormBuilder.controllers[addressSchemaObj.controllerTypeahead].validate(fieldName, value[5], countrySchema, collection, docID);

  return (msgOrganisation || msgBuilding || msgStreet || msgTown || msgPostCode || msgCountry) ? [msgOrganisation, msgBuilding, msgStreet, msgTown, msgPostCode, msgCountry] : false;
};

//Gets the full address as a string
obj.prototype.getFullAddress = function(doc){
  if(!doc) return "";
  var result  = "";
  for (var i = 0; i < 6; i++) {
    if (doc[i]) {
      result += doc[i];
      if (i < 5)
        result += ", ";
    }
  }
  return result;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerAddress) !== "object")
  FormBuilder.controllers.fbControllerAddress = new obj();