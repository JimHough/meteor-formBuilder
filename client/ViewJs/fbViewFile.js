navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

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

//Sets the current value of the form field
var setValue = function(template, value){
    var id = template.$('.image-preview').attr('id');
    FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
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

Template.fbViewFile_create_update.created = function(){
  if(!this.fbViewFile) this.fbViewFile = {};
  this.fbViewFile.errorMsg = "";
  this.fbViewFile.errorMsgDep = new Deps.Dependency();
  this.fbViewFile.running = false;
  this.fbViewFile.runningDep = new Deps.Dependency();
  //Find the right camera to use, only works in chrome
  getSource(this);
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
    var fileData={type:"image/png", lastModified:Date.now()};
    fileData.url = canvas.toDataURL("image/png");
    fileData.name = "snapshot";
    fileData.size = fileData.url.split(",")[1].length * 0.75;
    setValue(template, fileData);
    stopScan(event, template);
  },
  'hidden.bs.modal' : function (event, template) {
    stopScan(event, template);
  },
  'change .input-browse' : function (event, template){
      event.preventDefault();
      var input = template.$('.input-browse')[0];
      if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onloadend = function () {
          var fileData=_.extend({url:reader.result}, _.pick(this, "name", "size", "type", "lastModified"));
          setValue(template, fileData);
        }.bind(input.files[0]);
        reader.readAsDataURL(input.files[0]);
    }
  },
  'dropped .dropzone':function(event, template)
  {
    if(FormBuilder.helpers.canAccess(event, "originalEvent.dataTransfer.files.length"))
    {
      var reader = new FileReader();
      reader.onloadend = function () {
        var fileData=_.extend({url:reader.result}, _.pick(this, "name", "size", "type", "lastModified"));
        setValue(template, fileData);
      }.bind(event.originalEvent.dataTransfer.files[0]);
      reader.readAsDataURL(event.originalEvent.dataTransfer.files[0]);
    }
  }
});

var getFileUrl = function(template){
  if(!FormBuilder.helpers.canAccess(template, "data._id", "data.formObj")) return;
  var result = {id:template.data._id, url:'/packages/jhough_formbuilder/img/noImageThumb.png'};
  var view = FormBuilder.views.findOne(result.id);
  if(FormBuilder.helpers.canAccess(view, "currentValue.store", "currentValue.id"))
  {
    var store = view.currentValue.store;
    var fsCollection = FS._collections[store];
    if(fsCollection){
      var fsFile = fsCollection.findOne(view.currentValue.id);
      if (fsFile) result.url = fsFile.url();
    }
  }
  else if(FormBuilder.helpers.canAccess(view, "currentValue.url"))
  {
    result.url = view.currentValue.url;
  }
  else if((template.data.formObj.type === "create") || (template.data.formObj.type === "update"))
    result.url = '/packages/jhough_formbuilder/img/dropHere.png';
  return result;
};

Template.fbViewFile_create_update.helpers({
  source:null,
  errorMsg:function(){
    var template = UI._templateInstance();
    template.fbViewFile.errorMsgDep.depend();
    return template.fbViewFile.errorMsg;
  },
  running:function(){
    var template = UI._templateInstance();
    template.fbViewFile.runningDep.depend();
    return template.fbViewFile.running;
  },
  fileUrl:function(){
    return getFileUrl(UI._templateInstance());
  }
});

Template.fbViewFile_read.helpers({
  fileUrl:function(){
    return getFileUrl(UI._templateInstance());
  }
});