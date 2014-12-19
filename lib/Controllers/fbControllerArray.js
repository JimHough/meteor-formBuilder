if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerArray) !== "object") FormBuilder.controllers.fbControllerArray = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerArray.getValue = function(fieldName, parentID, position, callback){
    var result = [];
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var arrayPosn = {value:0};
    FormBuilder.views.find({parentID:view._id}, {sort: {position : 1 }}).forEach(function(viewDataObj){
      result.push(FormBuilder.controllers[viewDataObj.schemaObj.controller].getValue(viewDataObj.fieldName, viewDataObj.parentID, arrayPosn).value);
    });
    position.value++;
    callback({visible:view.isVisible,  value:result});
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerArray.setValue = function(fieldName, parentID, position, value){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var namePosn = {value:0};
    FormBuilder.views.find({parentID:view._id}, {sort: {position : 1 }}).forEach(function(viewDataObj){
      FormBuilder.controllers[viewDataObj.schemaObj.controller].setValue(viewDataObj.fieldName, viewDataObj.parentID, namePosn, value[namePosn.value]);
    });
    position.value++;
  };
  
  FormBuilder.controllers.fbControllerArray.setError = function(fieldName, parentID, position, errors){ 
    var message = errors[fieldName];
    if(typeof message === 'string') message = [message];
    message = message || [];
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var arrayPosn = {value:0};
    FormBuilder.views.find({parentID:view._id}, {sort: {position : 1 }}).forEach(function(viewDataObj){
      var errors = {};
      errors[viewDataObj.fieldName] = message[arrayPosn.value];
      FormBuilder.controllers[viewDataObj.schemaObj.controller].setError(viewDataObj.fieldName, viewDataObj.parentID, arrayPosn, errors);
    });
    position.value++;
  };
  
  //Data Type Functions
  FormBuilder.controllers.fbControllerArray.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    var arraySchemaObj = _.pick(schemaObj, 'controller', 'labelText', 'defaultValue', 'view', 'minCount', 'maxCount', 'dataSchema');
    arraySchemaObj = _.defaults(arraySchemaObj, {view:'fbViewArray', minCount:0});
    var template = FormBuilder.helpers.findTemplate(arraySchemaObj.view, formObj.type);
    var document = {
      //Common
      parentID:parentID,
      fieldName:fieldName,
      position:position.value,
      template:template,
      formObj:formObj,
      schemaObj:arraySchemaObj,
      error:false,
      isVisible:true
    };
    currentValue = document.defaultValue || [];
    position.value++;
    var arrayID = FormBuilder.views.insert(document);
    //Add view data for each of the array elements
    var childrenToAdd = currentValue.length || schemaObj.minCount;
    var arrayPosn = {value:0};
    for(var i = 0; i < childrenToAdd; i++){
        FormBuilder.controllers[schemaObj.dataSchema.controller].addViews(fieldName, formObj, schemaObj.dataSchema, arrayPosn, arrayID);
    }
    return arrayID;
  };
  
  //Moves the field specified by finding the parent of element with class fbArray-item, direction should be +1 or -1
  FormBuilder.controllers.fbControllerArray.moveView = function(viewDataID, direction){
    var viewDataObj = FormBuilder.views.findOne({_id:viewDataID});
    var neighbourView = FormBuilder.views.findOne({position:viewDataObj.position+direction, parentID:viewDataObj.parentID});
    if(neighbourView){
      //Swap the positions
      FormBuilder.views.update({_id:viewDataObj._id}, {$set:{position:neighbourView.position}});
      FormBuilder.views.update({_id:neighbourView._id}, {$set:{position:viewDataObj.position}});
    }
  };
  
  //Adds a field at the specified position
  FormBuilder.controllers.fbControllerArray.addView = function(viewDataID, arrayDataID){
    var viewDataObj = FormBuilder.views.findOne({_id:viewDataID});
    var arrayDataObj = FormBuilder.views.findOne({_id:arrayDataID});
    var formObj = FormBuilder.forms.findOne({_id:arrayDataObj.parentID});
    //If there are items in the array put the new field in above the one selected otherwise start at zero
    var newPosition = viewDataObj ? viewDataObj.position-0.5 : 0; 
    FormBuilder.controllers[arrayDataObj.schemaObj.dataSchema.controller].addViews(arrayDataObj.fieldName, arrayDataObj.formObj, arrayDataObj.schemaObj.dataSchema, newPosition, arrayDataObj._id, null);
    //Update the existing field positions
    var position = 0;
    FormBuilder.views.find({parentID:arrayDataObj._id}, {sort: {position : 1 }}).forEach(function(field){
      FormBuilder.views.update({_id:field._id}, {$set:{position:position}});
      position++;
    });
  };
  
  //Removes the field specified by finding the parent of element with class fbArray-item
  FormBuilder.controllers.fbControllerArray.removeView = function(viewDataID){
    var viewDataObj = FormBuilder.views.findOne({_id:viewDataID});
    var arrayDataObj = FormBuilder.views.findOne({_id:viewDataObj.parentID});
    FormBuilder.views.remove({_id:viewDataID});
    //Update the existing field positions
    var position = 0;
    FormBuilder.views.find({parentID:arrayDataObj._id}, {sort: {position : 1 }}).forEach(function(field){
      FormBuilder.views.update({_id:field._id}, {$set:{position:position}});
      position++;
    });
  };
}

FormBuilder.controllers.fbControllerArray.validate = function(fieldName, value, schemaObj, collection, docID){
  var result = [];
  var errorFound = false;
  for(var i = 0; i < value.length; i++){
    var msg = FormBuilder.controllers[schemaObj.dataSchema.controller].validate(fieldName, value[i], schemaObj.dataSchema, collection, docID);
    if(msg !== false) errorFound = true;
    result[i] = msg;
  }
  return errorFound ? result : false;
};