if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.controllers) !== "object") FormBuilder.controllers = {};
if((typeof FormBuilder.controllers.fbControllerFile) !== "object") FormBuilder.controllers.fbControllerFile = {};
if(Meteor.isClient){
  //Gets the value from the view on the form
  FormBuilder.controllers.fbControllerFile.getValue = function(fieldName, parentID, position, callback){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    position.value++;
    callback({visible:view.isVisible,  value:_.omit(view.currentValue, 'url')});
  };
  
  //Sets the value to the view on the form
  FormBuilder.controllers.fbControllerFile.setValue = function(fieldName, parentID, position, value){
    var id = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value})._id;
    var result = FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
    position.value++;
    return result;
  };
  
  FormBuilder.controllers.fbControllerFile.setError = function(fieldName, parentID, position, errors, docId){
    var view = FormBuilder.views.findOne({parentID:parentID, fieldName:fieldName, position:position.value});
    var message = errors[fieldName];
    message = message || false;
    FormBuilder.views.update(view._id, {$set:{error:message}});
    position.value++;
    if(_.keys(errors).length > 0) return;
    //If no errors were found upload the data
    var template = FormBuilder.helpers.findInstance(view._id, "Template.fbViewFile_create_update");
    if(!FormBuilder.helpers.canAccess(template, "fbViewFile.file", "fbViewFile.thumbnail")){ 
      FormBuilder.views.update(view._id, {$set:{error:"Error accessing the template instance"}});
      return;
    }
    var fsCollection = FS._collections[view.schemaObj.store];
    var data = template.fbViewFile.file || template.fbViewFile.thumbnail;
    if(!data)
    {
      FormBuilder.views.update(view._id, {$set:{error:"Error nothing to upload"}});
      return;
    }
    var fsFile = new FS.File(data);
    fsFile.references = [];
    fsFile.md5Hash = template.fbViewFile.md5;
    //listen for the uploaded event on this file
    fsFile.once("uploaded", function(){
        //add the reference from the file to the database entry
        var fileReference =  view.formObj.collection+":"+docId;
        var objReference = view.schemaObj.store+":"+fsFile._id;
        fsCollection.update(fsFile._id, {$addToSet:{references:fileReference}});
        //add the reference from the database entry to the file entry
        var modifier = {};
        modifier[fieldName+".reference"] = objReference;
        window[view.formObj.collection].update(docId, {$set:modifier});
    });
    try{
      fsCollection.insert(fsFile, function (err) {
          if(err)
          FormBuilder.views.update(view._id, {$set:{error:err}});
      });
    }
    catch(err){ FormBuilder.views.update(view._id, {$set:{error:err}}); }
  };

  //Add all of the required views for this controller
  FormBuilder.controllers.fbControllerFile.addViews = function(fieldName, formObj, schemaObj, position, parentID){
    parentID = parentID || formObj._id;
    schemaObj = _.pick(schemaObj, 'controller', 'view', 'labelText', 'optional', 'store', 'accept', 'maxSize');
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
  if(!FormBuilder.helpers.canAccess(value, "type", "name", "size", "reference") && (!schemaObj.optional))
    return "This is a required field";
  if(!FormBuilder.helpers.canAccess(value, "type", "name", "size", "reference") && schemaObj.optional)
    return false;
  if(schemaObj.maxSize < value.size)
    return "The file size ("+value.size.fileSize(1)+") is bigger than the limit ("+schemaObj.maxSize.fileSize(1)+")";
  var validExtensions = schemaObj.accept.split(",");
  if(!_.contains(validExtensions,"." + value.extension.toLowerCase()))
    return "The file type (" + value.extension + ") does not pass the filter (" + schemaObj.accept + ")";
  if(value.md5)
  //Check for the file being unique
  //if(schemaObj.unique){
    var findObj = {};
    findObj[fieldName+".md5"]=value.md5;
    var matches = collection.find(findObj).fetch();
    for(var i = 0; i < matches.length; i++){
      if(matches[i]._id != docID) return "This file already exists";
    }
  //}
  return false;
};