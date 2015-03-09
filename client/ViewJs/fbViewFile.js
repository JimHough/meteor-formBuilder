Template.fbViewFile_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewFile_read.helpers(FormBuilder.helpers.viewBaseHelpers);
navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;
//<editor-fold desc="methods">
//Finds a forwards facing camera yo use (only on chrome)
var getSource = function(template){
  //Find a camera that is facing the environment or has no facing value
  var data = template.fbViewFile;
  data.videoSource = {error:true, id:'Didnt find any cameras'};
  if ((typeof MediaStreamTrack === 'function') && (typeof MediaStreamTrack.getSources === 'function')){
    MediaStreamTrack.getSources(function (sourceInfos) {
      for (var i = 0; i !== sourceInfos.length; ++i) {
        var source = sourceInfos[i];
        if ((sourceInfos[i].kind === 'video') && ((source.facing === '')||(source.facing === 'environment')))
          data.videoSource = {error:false, id:source.id};
      }
      if (data.videoSource === null) data.videoSource = {error:true, id:'No suitable camera found'};
    });
  }
};

//Takes a snapshot and checks it for codes
var nextScan = function(){
  var template = this;
  var data = this.fbViewFile;
  if(!data.stream) return;
  var video = template.$('.videoOutput')[0];
  var canvas = template.$('.canvasOutput')[0];
  if(video && canvas && video.videoWidth && video.videoHeight){
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    qrcode.imagedata = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
    qrcode.width = video.videoWidth;
    qrcode.height = video.videoHeight;
    var popup = template.$('.fbViewFile-popup');
    if(!popup.hasClass('in')){
      popup.modal('show');
      popup.find('.modal-dialog').css({'width':(video.videoWidth + 32) +"px"});
    }
  }
  clearTimeout(self.timer);
  self.timer = setTimeout($.proxy(nextScan, template), 1000);
};

//Sets up the scanning and schedules the scan interval
var startScan = function(event, template){
  var data = template.fbViewFile;
  var id = template.$('input').attr('id');
  if( typeof navigator.getUserMedia === 'function' && typeof window.requestAnimationFrame === 'function'){
    var errorCallback = function(e) {
      data.errorMsg = 'Cannot access video';
      data.errorMsgDep.changed();
      FormBuilder.views.update({_id:id}, {$set:{error:data.errorMsg}});
    };
    var successCallback = function(stream) {
      
      var video = template.$('.videoOutput')[0];
      //Hook the video element up to the camera stream
      video.src = window.URL.createObjectURL(stream);
      video.play();
      //Store the stream so we can stop it later
      data.stream = stream;
      //Start a timer for the next scan
      clearTimeout(data.timer);
      data.timer = setTimeout($.proxy(nextScan, template), 1000);
      //Set the running property to true
      data.running = true;
      data.runningDep.changed();
    };
    
    if(!data.videoSource || data.videoSource.error){
      data.errorMsg = data.videoSource.id;
      data.errorMsgDep.changed();
      FormBuilder.views.update({_id:id}, {$set:{error:data.errorMsg}});
    }
    //Set the max size of video
    var constraints = {video: {mandatory:{maxWidth:320,maxHeight:320}}};
    if(data.videoSource && !data.videoSource.error) constraints.video.optional = [{sourceId:data.videoSource.id}];
    navigator.getUserMedia(constraints, successCallback, errorCallback);
  }
  else{
    data.errorMsg = 'Video access not supported by this browser, get google chrome for best compatability';
    data.errorMsgDep.changed();
    FormBuilder.views.update({_id:id}, {$set:{error:data.errorMsg}});
  }
};

//Stops the scanning
var stopScan = function(event, template){
  var data = template.fbViewFile;
  var video = template.$('.videoOutput')[0];
  template.$('.fbViewFile-popup').modal('hide');
  if(video)video.src = null;
  if(data.stream) data.stream.stop();
  data.stream = null;
  data.timer = null;
  //Set the running property to true
  data.running = false;
  data.runningDep.changed();
};

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
  template.fbViewFile.errorMsg = "";
  template.fbViewFile.errorMsgDep = new Deps.Dependency();
  template.fbViewFile.running = false;
  template.fbViewFile.runningDep = new Deps.Dependency();
  template.fbViewFile.file = {name:"",extension:"",size:0,type:"",lastModified:0};
  template.fbViewFile.fileDep = new Deps.Dependency();
  template.fbViewFile.md5 = "";
  template.fbViewFile.md5Dep = new Deps.Dependency();
  if(readonly)
    template.fbViewFile.thumbnail = '/packages/jhough_formbuilder/img/noImageThumb.png';
  else 
    template.fbViewFile.thumbnail = '/packages/jhough_formbuilder/img/dropHere.png';
  template.fbViewFile.thumbnailDep = new Deps.Dependency();
  //Find the right camera to use, only works in chrome
  getSource(template);
};
//</editor-fold>

//<editor-fold desc="create/update Template">
Template.fbViewFile_create_update.created = function(){
  init(this);
};

Template.fbViewFile_create_update.events({
  'click .button-start' : function (event, template) {
    event.preventDefault();
    startScan(event, template);
  },
  'click .button-browse' : function (event, template) {
    event.preventDefault();
    template.$('.input-browse').click();
  },
  'click .button-stop' : function (event, template) {
    event.preventDefault();
    stopScan(event, template);
  },
  'click .button-takePicture' : function (event, template) {
    event.preventDefault();
    var canvas = template.$('.canvasOutput')[0];
    setValue(template, canvas.toDataURL("image/png"));
    stopScan(event, template);
  },
  'hidden.bs.modal' : function (event, template) {
    stopScan(event, template);
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
  running:function(){
    var template = Template.instance();
    template.fbViewFile.runningDep.depend();
    return template.fbViewFile.running;
  },
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
