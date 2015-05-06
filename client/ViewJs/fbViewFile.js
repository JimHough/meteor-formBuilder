Template.fbViewFile_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewFile_read.helpers(FormBuilder.helpers.viewBaseHelpers);

//<editor-fold desc="methods">

//Sets the current value of the form field
var setValue = function(template, value){
  var fileData={reference:"", md5:""};
  var controller = FormBuilder.controllers[template.data.schemaObj.controller];
  if(value instanceof File){
    _.extend(fileData, _.pick(value, "name", "size", "type", "lastModified"));
    fileData.extension = fileData.name.split(".").pop().toLowerCase();
    fileData.name = fileData.name.substring(0,fileData.name.length-fileData.extension.length-1);
    if(fileData.type.lastIndexOf('image',0) === 0){//If the file is an image create a preview
      var reader = new FileReader();
      reader.onloadend = function () {
        this.fbViewFile.thumbnail = reader.result;
      }.bind(template);
      reader.readAsDataURL(value);
    }
    else{//If the file is not an image get the icon to use from the icons library
      template.fbViewFile.thumbnail = '/packages/jhough_formbuilder/img/icons/'+ fileData.extension +'.bmp';
      template.fbViewFile.thumbnailDep.changed();
    }
    template.fbViewFile.file = value;
    template.fbViewFile.fileDep.changed();
    //Calculate the MD5 checksum
    SparkMD5.GetFileMD5(value, function(hash){
      fileData.md5 = hash;
      controller.setValue(template.data.fieldName, template.data.parentID, {value:template.data.position}, fileData);
      template.fbViewFile.md5 = hash;
      template.fbViewFile.md5Dep.changed();
    });
  }
  else if((typeof value === "string")&&(value.lastIndexOf('data:image')===0)){
    fileData.lastModified = Date.now();
    fileData.type = "image/png";
    fileData.name = "snapshot";
    fileData.extension = "png";
    fileData.size = value.split(",")[1].length * 0.75;
    template.fbViewFile.md5 = "";
    template.fbViewFile.md5Dep.changed();
    template.fbViewFile.file = null;
    template.fbViewFile.fileDep.changed();
    template.fbViewFile.thumbnail = value;
    template.fbViewFile.thumbnailDep.changed();
  }
  controller.setValue(template.data.fieldName, template.data.parentID, {value:template.data.position}, fileData);
};

//Gets the url to show for the preview
var getFileUrl = function(template){
  if(!FormBuilder.helpers.canAccess(template, "data._id", "data.formID")) return;
  var form = FormBuilder.forms.findOne(template.data.formID);
  var view = FormBuilder.views.findOne(template.data._id);
  var result = {id:template.data._id, url:'/packages/jhough_formbuilder/img/noImageThumb.png'};
  if(FormBuilder.helpers.canAccess(view, "currentValue.reference", "currentValue.type", "currentValue.extension") && view.currentValue.reference !== "")
  {
    if(view.currentValue.type.lastIndexOf('image',0) === 0){
      var refData = view.currentValue.reference.split(":");
      if(refData.length === 2){
        var fsCollection = FS._collections[refData[0]];
        if(fsCollection){
          var fsFile = fsCollection.findOne(refData[1]);
          if (fsFile) result.url = fsFile.url();
        }
      }
    }
    else{
      result.url = '/packages/jhough_formbuilder/img/icons/'+ view.currentValue.extension +'.bmp';
    }
  }
  else if(template.fbViewFile.thumbnail !== "")
  {
    result.url = template.fbViewFile.thumbnail;
  }
  else if((form.type === "create") || (form.type === "update"))
    result.url = '/packages/jhough_formbuilder/img/dropHere.png';
  return result;
};

var init = function(template, readonly){
  if(!template.fbViewFile) template.fbViewFile = {};
  template.fbViewFile.file = {name:"",extension:"",size:0,type:"",lastModified:0};
  template.fbViewFile.fileDep = new Deps.Dependency();
  template.fbViewFile.md5 = "";
  template.fbViewFile.md5Dep = new Deps.Dependency();
  if(readonly)
    template.fbViewFile.thumbnail = '/packages/jhough_formbuilder/img/noImageThumb.png';
  else 
    template.fbViewFile.thumbnail = '/packages/jhough_formbuilder/img/dropHere.png';
  template.fbViewFile.thumbnailDep = new Deps.Dependency();
};
//</editor-fold>

//<editor-fold desc="create/update Template">
Template.fbViewFile_create_update.created = function(){
  init(this);
};

Template.fbViewFile_create_update.events({
  'click .button-takePicture' : function (event, template) {
    event.preventDefault();
    event.stopPropagation();
    FormBuilder.modals.addSnapshot({title:'Take a Picture'}, {'fbSnapshotComplete':function(event,info){
      setValue(template, info.data);
    }});
  },
  'click .button-browse' : function (event, template) {
    event.preventDefault();
    event.stopPropagation();
    template.$('.input-browse').click();
  },
  'change .input-browse' : function (event, template){
      event.preventDefault();
      setValue(template, event.target.files[0]);
  },
  'dropped .dropzone':function(event, template)
  {
    if(FormBuilder.helpers.canAccess(event, "originalEvent.dataTransfer.files.length"))
      setValue(template, event.originalEvent.dataTransfer.files[0]);
  }
});

Template.fbViewFile_create_update.helpers({
  source:null,
  fileUrl:function(){
    return getFileUrl(Template.instance());
  },
  pngAllowed:function(){
    var template = Template.instance();
    return template.data.schemaObj.accept.indexOf(".png")>=0;
  },
  fileText:function(){
    var template = Template.instance();
    return template.data.currentValue.name;
  }
});
//</editor-fold>

//<editor-fold desc="read Template">
Template.fbViewFile_read.created = function(){init(this);};

Template.fbViewFile_read.helpers({
  fileUrl:function(){
    return getFileUrl(Template.instance());
  },
  fileText:function(){
    var template = Template.instance();
    return template.data.currentValue.name;
  }
});
//</editor-fold>
