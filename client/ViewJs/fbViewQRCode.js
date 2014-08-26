navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

//Finds a forwards facing camera yo use (only on chrome)
var getSource = function(template){
  //Find a camera that is facing the environment or has no facing value
  var data = template.fbViewQRCode;
  data.videoSource = {error:true, id:'Didnt find any cameras'};
  if (MediaStreamTrack && MediaStreamTrack.getSources){
    MediaStreamTrack.getSources(function (sourceInfos) {
      for (var i = 0; i != sourceInfos.length; ++i) {
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
  var data = this.fbViewQRCode;
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
    var popup = template.$('.fbViewQRCode-popup');
    if(!popup.hasClass('in')){
      popup.modal('show');
      popup.find('.modal-dialog').css({'width':(video.videoWidth + 32) +"px"});
    }
    try{
      var value = qrcode.process(ctx);
      stopScan(null,template);
      var id = template.$('input').attr('id');
      FormBuilder.views.update({_id:id}, {$set:{currentValue:value}});
      var viewData = FormBuilder.views.findOne({_id:id});
      if(viewData.schemaObj.asYouType){
        var error = FormBuilder.controllers[viewData.schemaObj.controller].validate(viewData.fieldName, value, viewData.schemaObj, window[viewData.formObj.collection], viewData.formObj.document);
        FormBuilder.views.update({_id:viewData._id}, {$set:{error:error}});
      }
    } catch(e){
      //data.errorMsg = 'Failed - ' + e;
      //data.errorMsgDep.changed();
    }
  }
  clearTimeout(self.timer);
  self.timer = setTimeout($.proxy(nextScan, template), 1000);
}

//Sets up the scanning and schedules the scan interval
var startScan = function(event, template){
  var data = template.fbViewQRCode;
  if( typeof navigator.getUserMedia === 'function' && typeof window.requestAnimationFrame === 'function'){
    var errorCallback = function(e) {
      data.errorMsg = 'Cannot access video';
      data.errorMsgDep.changed();
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
    }
    //Set the max size of video
    var constraints = {video: {mandatory:{maxWidth:320,maxHeight:320}}};
    if(data.videoSource && !data.videoSource.error) constraints.video.optional = [{sourceId:data.videoSource.id}];
    navigator.getUserMedia(constraints, successCallback, errorCallback);
  }
  else{
    data.errorMsg = 'Video access not supported by this browser, get google chrome for best compatability';
    data.errorMsgDep.changed();
  }
};

//Stops the scanning
var stopScan = function(event, template){
  var data = template.fbViewQRCode;
  var video = template.$('.videoOutput')[0];
  template.$('.fbViewQRCode-popup').modal('hide');
  video.src = null;
  if(data.stream !== null) data.stream.stop();
  data.stream = null;
  data.timer = null;
  //Set the running property to true
  data.running = false;
  data.runningDep.changed();
};

Template.fbViewQRCode_create_update.created = function(){
  if(!this.fbViewQRCode) this.fbViewQRCode = {};
  this.fbViewQRCode.errorMsg = "";
  this.fbViewQRCode.errorMsgDep = new Deps.Dependency();
  this.fbViewQRCode.running = false;
  this.fbViewQRCode.runningDep = new Deps.Dependency();
  //Find the right camera to use, only works in chrome
  getSource(this);
};

Template.fbViewQRCode_create_update.events({
  'click .button-start' : function (event, template) {
    event.preventDefault();
    startScan(event, template);
  },
  'click .button-stop' : function (event, template) {
    event.preventDefault();
    stopScan(event, template);
  },
  'hidden.bs.modal' : function (event, template) {
    stopScan(event, template);
  }
});

Template.fbViewQRCode_create_update.helpers({
  source:null,
  errorMsg:function(){
    var template = UI._templateInstance();
    template.fbViewQRCode.errorMsgDep.depend();
    return template.fbViewQRCode.errorMsg;
  },
  running:function(){
    var template = UI._templateInstance();
    template.fbViewQRCode.runningDep.depend();
    return template.fbViewQRCode.running;
  }
});