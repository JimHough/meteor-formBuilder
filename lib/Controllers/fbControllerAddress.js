if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerAddress) !== "object") FormBuilder.controllers.fbControllerAddress = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerAddress.getValue = function(fieldName, parentID, position, callback){
    var result = [];
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var addressPosn = {value:0};
    FormBuilder.views.find({parentID:view._id}, {sort: {position : 1 }}).forEach(function(viewDataObj){
      result.push(FormBuilder.controllers[viewDataObj.schemaObj.controller].getValue(viewDataObj.fieldName, viewDataObj.parentID, addressPosn).value);
    });
    position.value++;
    callback({visible:view.isVisible,  value:result});
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerAddress.setValue = function(fieldName, parentID, position, value){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var namePosn = {value:0};
    FormBuilder.views.find({parentID:view._id}, {sort: {position : 1 }}).forEach(function(viewDataObj){
      FormBuilder.controllers[viewDataObj.schemaObj.controller].setValue(viewDataObj.fieldName, viewDataObj.parentID, namePosn, value[namePosn.value]);
    });
    position.value++;
  };
  
  FormBuilder.controllers.fbControllerAddress.setError = function(fieldName, parentID, position, errors){
    var message = errors[fieldName];
    if(typeof message === 'string') message = [message];
    message = message || [];
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var addressPosn = {value:0};
    FormBuilder.views.find({parentID:view._id}, {sort: {position : 1 }}).forEach(function(viewDataObj){
      var errors = {};
      errors[viewDataObj.fieldName] = message[addressPosn.value];
      FormBuilder.controllers[viewDataObj.schemaObj.controller].setError(viewDataObj.fieldName, viewDataObj.parentID, addressPosn, errors);
    });
    position.value++;
  };
  
  //Data Type Functions
  FormBuilder.controllers.fbControllerAddress.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    var addressSchemaObj = FormBuilder.controllers.fbControllerAddress.normaliseSchema(schemaObj);
    var template = FormBuilder.helpers.findTemplate(addressSchemaObj.view, formObj.type);
    var document = {
      //Common
      parentID:parentID,
      fieldName:fieldName,
      position:position.value,
      template:template,
      formObj:formObj,
      schemaObj:addressSchemaObj,
      error:false,
      isVisible:true
    };
    currentValue = document.defaultValue || [];
    position.value++;
    var addressID = FormBuilder.views.insert(document);
    var organisationSchema = FormBuilder.controllers.fbControllerAddress.generateOrganisationSchema(addressSchemaObj);
    var buildingSchema = FormBuilder.controllers.fbControllerAddress.generateBuildingSchema(addressSchemaObj);
    var streetSchema = FormBuilder.controllers.fbControllerAddress.generateStreetSchema(addressSchemaObj);
    var townSchema = FormBuilder.controllers.fbControllerAddress.generateTownSchema(addressSchemaObj);
    var postCodeSchema = FormBuilder.controllers.fbControllerAddress.generatePostCodeSchema(addressSchemaObj);
    var countrySchema = FormBuilder.controllers.fbControllerAddress.generateCountrySchema(addressSchemaObj);
    var addressPosn = {value:0};
    var organisationID = FormBuilder.controllers[addressSchemaObj.controllerText].addViews(fieldName, formObj, organisationSchema, addressPosn, addressID);
    FormBuilder.controllers[addressSchemaObj.controllerText].addViews(fieldName, formObj, buildingSchema, addressPosn, addressID);
    FormBuilder.controllers[addressSchemaObj.controllerText].addViews(fieldName, formObj, streetSchema, addressPosn, addressID);
    FormBuilder.controllers[addressSchemaObj.controllerText].addViews(fieldName, formObj, townSchema, addressPosn, addressID);
    FormBuilder.controllers[addressSchemaObj.controllerText].addViews(fieldName, formObj, postCodeSchema, addressPosn, addressID);
    FormBuilder.controllers[addressSchemaObj.controllerTypeahead].addViews(fieldName, formObj, countrySchema, addressPosn, addressID);
    FormBuilder.views.update({_id:organisationID}, {$set:{isVisible:addressSchemaObj.showOrganisation}});
    return addressID;
  };
}

FormBuilder.controllers.fbControllerAddress.generateOrganisationSchema = function(schemaObj){
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.organisationTxt,
    asYouType: true,
    optional:true,
    //Specific
    maxLength: 60
  };
};

FormBuilder.controllers.fbControllerAddress.generateBuildingSchema = function(schemaObj){
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.buildingTxt,
    asYouType: true,
    //Specific
    maxLength: 60
  };
}

FormBuilder.controllers.fbControllerAddress.generateStreetSchema = function(schemaObj){
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.streetTxt,
    asYouType: true,
    //Specific
    maxLength: 60
  };
}

FormBuilder.controllers.fbControllerAddress.generateTownSchema = function(schemaObj){
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.townTxt,
    asYouType: true,
    //Specific
    maxLength: 30
  };
}

FormBuilder.controllers.fbControllerAddress.generatePostCodeSchema = function(schemaObj){
  return {
    controller: schemaObj.controllerText,
    view: schemaObj.viewText,
    labelText: schemaObj.postCodeTxt,
    asYouType: true,
    //Specific
    maxLength: 7
  };
}

FormBuilder.controllers.fbControllerAddress.generateCountrySchema = function(schemaObj){
  return {
    controller: schemaObj.controllerTypeahead,
    view: schemaObj.viewTypeahead,
    labelText: schemaObj.countryTxt,
    //Specific
    maxLength: 50,
    dataSource: schemaObj.countriesDataSource,
    placeholder: schemaObj.countriesPlaceholder
  };
}

FormBuilder.controllers.fbControllerAddress.normaliseSchema = function(schemaObj){
  var addressSchemaObj = _.pick(schemaObj, 'controller','view','labelText','showOrganisation','organisationTxt','buildingTxt','streetTxt','townTxt','postCodeTxt','countryTxt','controllerText','viewText','controllerTypeahead','viewTypeahead','countriesDataSource','countriesPlaceholder');
  return _.defaults(addressSchemaObj, {view:'fbViewAddress',organisationTxt:'Company/Organisation',buildingTxt:'Building Name/Number',streetTxt:'Street Name',townTxt:'City/Town',postCodeTxt:'Post Code',countryTxt:'Country',controllerText:'fbControllerText',viewText:'fbViewText',controllerTypeahead:'fbControllerTypeahead',viewTypeahead:'fbViewTypeahead',countriesPlaceholder:'Select Country'});
};

FormBuilder.controllers.fbControllerAddress.validate = function(fieldName, value, schemaObj, collection, docID){
  var addressSchemaObj = FormBuilder.controllers.fbControllerAddress.normaliseSchema(schemaObj);
  var organisationSchema = FormBuilder.controllers.fbControllerAddress.generateOrganisationSchema(addressSchemaObj);
  var buildingSchema = FormBuilder.controllers.fbControllerAddress.generateBuildingSchema(addressSchemaObj);
  var streetSchema = FormBuilder.controllers.fbControllerAddress.generateStreetSchema(addressSchemaObj);
  var townSchema = FormBuilder.controllers.fbControllerAddress.generateTownSchema(addressSchemaObj);
  var postCodeSchema = FormBuilder.controllers.fbControllerAddress.generatePostCodeSchema(addressSchemaObj);
  var countrySchema = FormBuilder.controllers.fbControllerAddress.generateCountrySchema(addressSchemaObj);
  
  if(!value) return ['fbControllerAddress.validate value passed is incorrect'];
  
  var msgOrganisation = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[0], organisationSchema, collection, docID);
  var msgBuilding = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[1], buildingSchema, collection, docID);
  var msgStreet = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[2], streetSchema, collection, docID);
  var msgTown = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[3], townSchema, collection, docID);
  var msgPostCode = FormBuilder.controllers[addressSchemaObj.controllerText].validate(fieldName, value[4], postCodeSchema, collection, docID);
  var msgCountry = FormBuilder.controllers[addressSchemaObj.controllerTypeahead].validate(fieldName, value[5], countrySchema, collection, docID);

  return (msgOrganisation || msgBuilding || msgStreet || msgTown || msgPostCode || msgCountry) ? [msgOrganisation, msgBuilding, msgStreet, msgTown, msgPostCode, msgCountry] : false;
};