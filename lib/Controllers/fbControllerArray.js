var obj = function () {
};
var objBase = FormBuilder.controllers.fbControllerBaseMulti;
//Inherit from the base 'class'
obj.prototype = Object.create(objBase.prototype);

if (Meteor.isClient) {
  //Sets the value to the view on the form
  obj.prototype.setValue = function (fieldName, parentID, position, value) {
    if(_.isArray(value)){
      var view = FormBuilder.views.findOne({parentID: parentID, fieldName: fieldName, position: position.value});
      var posn = {value: 0};
      FormBuilder.views.find({parentID: view._id}, {sort: {position: 1}}).forEach(function (viewDataObj) {
        FormBuilder.controllers[viewDataObj.schemaObj.controller].setValue(viewDataObj.fieldName, viewDataObj.parentID, posn, value[posn.value]);
      });
      var addPosn = {value: posn.value};
      for(var i = posn.value; i < value.length; i++)
      {
        FormBuilder.controllers[view.schemaObj.dataSchema.controller].addViews(fieldName, view.formID, view.schemaObj.dataSchema, addPosn, view._id);
        FormBuilder.controllers[view.schemaObj.dataSchema.controller].setValue(fieldName, view._id, posn, value[posn.value]);
      }
    }
    position.value++;
  };
  
  //Data Type Functions
  obj.prototype.addViews = function (fieldName, formID, schemaObj, position, parentID) {
    schemaObj = this.normaliseSchema(schemaObj);
    var baseResult = objBase.prototype.addViews.call(this, fieldName, formID, schemaObj, position, parentID);
    //Add view data for each of the array elements
    var childrenToAdd = (schemaObj.defaultValue && schemaObj.defaultValue.length) || schemaObj.minCount;
    var arrayPosn = {value: 0};
    for (var i = 0; i < childrenToAdd; i++) {
      schemaObj.dataSchema.schemaPath = schemaObj.schemaPath + ".dataSchema";
      FormBuilder.controllers[schemaObj.dataSchema.controller].addViews(fieldName, formID, schemaObj.dataSchema, arrayPosn, baseResult);
    }
    return baseResult;
  };

  //Moves the field specified by finding the parent of element with class fbArray-item, direction should be +1 or -1
  obj.prototype.moveView = function (viewDataID, direction) {
    var viewDataObj = FormBuilder.views.findOne({_id: viewDataID});
    var neighbourView = FormBuilder.views.findOne({position: viewDataObj.position + direction, parentID: viewDataObj.parentID});
    if (neighbourView) {
      //Swap the positions
      FormBuilder.views.update({_id: viewDataObj._id}, {$set: {position: neighbourView.position}});
      FormBuilder.views.update({_id: neighbourView._id}, {$set: {position: viewDataObj.position}});
    }
  };

  //Adds a field at the specified position
  obj.prototype.addView = function (viewDataID, arrayDataID) {
    var viewDataObj = FormBuilder.views.findOne({_id: viewDataID});
    var arrayDataObj = FormBuilder.views.findOne({_id: arrayDataID});
    //If there are items in the array put the new field in above the one selected otherwise start at zero
    var newPosition = viewDataObj ? viewDataObj.position - 0.5 : 0;
    arrayDataObj.schemaObj.dataSchema.schemaPath = arrayDataObj.schemaObj.schemaPath + ".dataSchema";
    FormBuilder.controllers[arrayDataObj.schemaObj.dataSchema.controller].addViews(arrayDataObj.fieldName, arrayDataObj.formID, arrayDataObj.schemaObj.dataSchema, newPosition, arrayDataObj._id, null);
    //Update the existing field positions
    var position = 0;
    FormBuilder.views.find({parentID: arrayDataObj._id}, {sort: {position: 1}}).forEach(function (field) {
      FormBuilder.views.update({_id: field._id}, {$set: {position: position}});
      position++;
    });
  };

  //Removes the field specified by finding the parent of element with class fbArray-item
  obj.prototype.removeView = function (viewDataID) {
    var viewDataObj = FormBuilder.views.findOne({_id: viewDataID});
    var arrayDataObj = FormBuilder.views.findOne({_id: viewDataObj.parentID});
    FormBuilder.views.remove({_id: viewDataID});
    //Update the existing field positions
    var position = 0;
    FormBuilder.views.find({parentID: arrayDataObj._id}, {sort: {position: 1}}).forEach(function (field) {
      FormBuilder.views.update({_id: field._id}, {$set: {position: position}});
      position++;
    });
  };
}

//Gets an object that defines the schema default values
obj.prototype.getSchemaDefaults = function () {
  var baseObj = objBase.prototype.getSchemaDefaults.call(this);
  //Add additional fields specific to the text controller
  baseObj.view = 'fbViewArray';
  baseObj.minCount = 0;
  baseObj.maxCount = 50;
  baseObj.dataSchema = {};
  return baseObj;
};

obj.prototype.getDocument = function (parentID, fieldName, position, template, formID, schemaObj){
  var baseObj = objBase.prototype.getDocument.call(this, parentID, fieldName, position, template, formID, schemaObj);
  baseObj.arrayValue = true;
  return baseObj;
};

obj.prototype.validate = function (fieldName, value, schemaObj, collection, docID) {
  var result = [];
  var errorFound = false;
  for (var i = 0; i < value.length; i++) {
    var msg = FormBuilder.controllers[schemaObj.dataSchema.controller].validate(fieldName, value[i], schemaObj.dataSchema, collection, docID);
    if (msg !== false)
      errorFound = true;
    result[i] = msg;
  }
  return errorFound ? result : false;
};

if ((typeof FormBuilder) !== "object")
  FormBuilder = {};
if ((typeof FormBuilder.controllers) !== "object")
  FormBuilder.controllers = {};
if ((typeof FormBuilder.controllers.fbControllerArray) !== "object")
  FormBuilder.controllers.fbControllerArray = new obj();
