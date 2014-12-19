if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerPersonName) !== "object") FormBuilder.controllers.fbControllerPersonName = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerPersonName.getValue = function(fieldName, parentID, position, callback){
    var result = [];
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var namePosn = {value:0};
    FormBuilder.views.find({parentID:view._id}, {sort: {position : 1 }}).forEach(function(viewDataObj){
      result.push(FormBuilder.controllers[viewDataObj.schemaObj.controller].getValue(viewDataObj.fieldName, viewDataObj.parentID, namePosn).value);
    });
    position.value++;
    callback({visible:view.isVisible,  value:result});
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerPersonName.setValue = function(fieldName, parentID, position, value){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var namePosn = {value:0};
    FormBuilder.views.find({parentID:view._id}, {sort: {position : 1 }}).forEach(function(viewDataObj){
      FormBuilder.controllers[viewDataObj.schemaObj.controller].setValue(viewDataObj.fieldName, viewDataObj.parentID, namePosn, value[namePosn.value]);
    });
    position.value++;
  };
  
  FormBuilder.controllers.fbControllerPersonName.setError = function(fieldName, parentID, position, errors){
    var message = errors[fieldName];
    if(typeof message === 'string') message = [message];
    message = message || [];
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var namePosn = {value:0};
    FormBuilder.views.find({parentID:view._id}, {sort: {position : 1 }}).forEach(function(viewDataObj){
      var errors = {};
      errors[viewDataObj.fieldName] = message[namePosn.value];
      FormBuilder.controllers[viewDataObj.schemaObj.controller].setError(viewDataObj.fieldName, viewDataObj.parentID, namePosn, errors);
    });
    position.value++;
  };
  
  //Data Type Functions
  FormBuilder.controllers.fbControllerPersonName.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    var nameSchemaObj = FormBuilder.controllers.fbControllerPersonName.normaliseSchema(schemaObj);
    var template = FormBuilder.helpers.findTemplate(nameSchemaObj.view, formObj.type);
    var document = {
      //Common
      parentID:parentID,
      fieldName:fieldName,
      position:position.value,
      template:template,
      formObj:formObj,
      schemaObj:nameSchemaObj,
      error:false,
      isVisible:true
    };
    currentValue = document.defaultValue || [];
    position.value++;
    var nameID = FormBuilder.views.insert(document);
    var forenameSchema = FormBuilder.controllers.fbControllerPersonName.generateForenameSchema(nameSchemaObj);
    var middlenamesSchema = FormBuilder.controllers.fbControllerPersonName.generateMiddlenameSchema(nameSchemaObj);
    var surnameSchema = FormBuilder.controllers.fbControllerPersonName.generateSurnameSchema(nameSchemaObj);
    var namePosn = {value:0};
    FormBuilder.controllers[nameSchemaObj.controllerText].addViews(fieldName, formObj, forenameSchema, namePosn, nameID);
    FormBuilder.controllers[nameSchemaObj.controllerArray].addViews(fieldName, formObj, middlenamesSchema, namePosn, nameID);
    FormBuilder.controllers[nameSchemaObj.controllerText].addViews(fieldName, formObj, surnameSchema, namePosn, nameID);
    return nameID;
  };
}

FormBuilder.controllers.fbControllerPersonName.generateForenameSchema = function(schemaObj){
  return {
      controller: schemaObj.controllerText,
      view: schemaObj.viewText,
      labelText: schemaObj.forenameTxt,
      asYouType: true,
      //Specific
      maxLength: 30
    };
};

FormBuilder.controllers.fbControllerPersonName.generateMiddlenameSchema = function(schemaObj){
  return {
      controller: schemaObj.controllerArray,
      view: schemaObj.viewArray,
      labelText: schemaObj.middlenamesTxt,
      //Specific
      maxCount: 4,
      minCount: 0,
      dataSchema:{
        controller: schemaObj.controllerText,
        view: schemaObj.viewText,
        asYouType: true,
        //Specific
        maxLength: 30
      }
    };
};

FormBuilder.controllers.fbControllerPersonName.generateSurnameSchema = function(schemaObj){
  return {
      controller: schemaObj.controllerText,
      view: schemaObj.viewText,
      labelText: schemaObj.surnameTxt,
      asYouType: true,
      //Specific
      maxLength: 30
    };
};

FormBuilder.controllers.fbControllerPersonName.normaliseSchema = function(schemaObj){
  var nameSchemaObj = _.pick(schemaObj, 'controller','view','labelText','forenameTxt','surnameTxt','middleNameTxt','controllerText','viewText','controllerArray','viewArray');
  return _.defaults(nameSchemaObj, {view:'fbViewPersonName',forenameTxt:'Forename',surnameTxt:'Surname',middlenamesTxt:'Middle Names',controllerText:'fbControllerText',viewText:'fbViewText',controllerArray:'fbControllerArray',viewArray:'fbViewArray'});
};

FormBuilder.controllers.fbControllerPersonName.validate = function(fieldName, value, schemaObj, collection, docID){
  var nameSchemaObj = FormBuilder.controllers.fbControllerPersonName.normaliseSchema(schemaObj);
  var forenameSchema = FormBuilder.controllers.fbControllerPersonName.generateForenameSchema(nameSchemaObj);
  var middlenamesSchema = FormBuilder.controllers.fbControllerPersonName.generateMiddlenameSchema(nameSchemaObj);
  var surnameSchema = FormBuilder.controllers.fbControllerPersonName.generateSurnameSchema(nameSchemaObj);
  
  if(!value) return ['fbControllerPersonName.validate value passed is incorrect'];
  
  var msgForename = FormBuilder.controllers[nameSchemaObj.controllerText].validate(fieldName, value[0], forenameSchema, collection, docID);
  var msgMiddlenames = FormBuilder.controllers[nameSchemaObj.controllerArray].validate(fieldName, value[1], middlenamesSchema, collection, docID);
  var msgSurname = FormBuilder.controllers[nameSchemaObj.controllerText].validate(fieldName, value[2], surnameSchema, collection, docID);

  return (msgForename || msgMiddlenames || msgSurname) ? [msgForename, msgMiddlenames, msgSurname] : false;
};