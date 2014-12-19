if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerFile) !== "object") FormBuilder.controllers.fbControllerFile = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerFile.getValue = function(fieldName, parentID, position, callback){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    position.value++;
    if(!FormBuilder.helpers.canAccess(view, "schemaObj.store", "currentValue.url", "currentValue.size"))
    {
      callback({visible:view.isVisible,  value:{error:'No file'}});
      return;
    }
    var fsCollection = FS._collections[view.schemaObj.store];
    var fsFile = new FS.File(view.currentValue.url);
    fsFile.size = view.currentValue.size;
    var currentValue = "Uploading";
    //listen for the uploaded event on this file
    fsFile.once("uploaded", function(){
        currentValue = {store:view.schemaObj.store, id:fsFile._id};
    });
    try{
      fsCollection.insert(fsFile, function (err) {
          if(err) currentValue = {error:err};
      });
    }
    catch(err){ currentValue = {error:err}; }
    
    function checkDone(timeout){
        if((currentValue === "Uploading")&&(timeout > 0))
        {
            timeout--;
            Meteor.setTimeout(function(){checkDone(timeout);}, 100);
            return;
        }
        if(timeout <= 0)
            callback({visible:view.isVisible,  value:{error:'Timeout'}});
        else
            callback({visible:view.isVisible,  value:currentValue});
    }
    //Doesn't allow anything that takes longer than a minute to upload
    checkDone(600);
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerFile.setValue = function(fieldName, parentID, position, value){
    var id = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})._id;
    var result = FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
    position.value++;
    return result;
  };
  
  FormBuilder.controllers.fbControllerFile.setError = function(fieldName, parentID, position, errors){
    var message = errors[fieldName];
    message = message || false;
    FormBuilder.views.update({fieldName:fieldName, parentID:parentID, position:position.value}, {$set:{error:message}});
    position.value++;
  };

  //Add all of the required views for this controller
  FormBuilder.controllers.fbControllerFile.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    schemaObj = _.pick(schemaObj, 'controller', 'view', 'labelText', 'optional', 'store', 'accept');
    schemaObj = _.defaults(schemaObj, {view:'fbViewFile'});
    var template = FormBuilder.helpers.findTemplate(schemaObj.view, formObj.type);
    var document = {
      //Common
      parentID:parentID,
      fieldName:fieldName,
      position:position.value,
      template:template,
      formObj:formObj,
      schemaObj:schemaObj,
      error:false,
      isVisible:true
      };
    document.currentValue = schemaObj.defaultValue || '';
    position.value++;
    return FormBuilder.views.insert(document);
  };
}
//Validate the data for this database field, this can be called on the server or on the client
FormBuilder.controllers.fbControllerFile.validate = function(fieldName, value, schemaObj, collection, docID){
  if((value === '') && (!schemaObj.optional))
    return "This is a required field";
  if((value === '') && schemaObj.optional)
    return false;
  return false;
};