navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

//Finds a forwards facing camera yo use (only on chrome)
var getSource = function(template){
  //Find a camera that is facing the environment or has no facing value
  var data = template.fbScan;
  data.videoSource = {error:true, id:'Didnt find any cameras'};
  if ((typeof MediaStreamTrack === 'function') && (typeof MediaStreamTrack.getSources === 'function')){
    MediaStreamTrack.getSources(function (sourceInfos) {
      for (var i = 0; i !== sourceInfos.length; ++i) {
        var source = sourceInfos[i];
        if ((sourceInfos[i].kind === 'video') && ((source.facing === '')||(source.facing === 'environment'))){
          data.videoSource = {error:false, id:source.id};
          if(data.errorMsg.get()==='Didnt find any cameras')
            data.errorMsg.set('');
        }
      }
    });
  }
};

//Takes a snapshot and checks it for codes
var nextScan = function(){
  var template = this;
  var data = this.fbScan;
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
    template.$('.popup-qrscan').find('.modal-dialog').css({'width':(video.videoWidth + 32) +"px"});
    var value = null;
    try
    { 
        value = qrcode.process(ctx);
        data.errorMsg.set('');
    } 
    catch(e)
    {
       data.errorMsg.set(''+e);
    }
    if(value){
      stopScan(null,template, value);
    }
  }
  clearTimeout(self.timer);
  self.timer = setTimeout($.proxy(nextScan, template), 1000);
};

//Sets up the scanning and schedules the scan interval
var startScan = function(event, template){
  var data = template.fbScan;
  if( typeof navigator.getUserMedia === 'function' && typeof window.requestAnimationFrame === 'function'){
    var errorCallback = function(e) {
      data.errorMsg.set('Cannot access video');
    };
    var successCallback = function(stream) {
      data.errorMsg.set('');
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
      data.running.set(true);
    };
    
    if(!data.videoSource || data.videoSource.error)
      data.errorMsg.set(data.videoSource.id);
    //Set the max size of video
    var constraints = {video: {mandatory:{maxWidth:320,maxHeight:320}}};
    if(data.videoSource && !data.videoSource.error) constraints.video.optional = [{sourceId:data.videoSource.id}];
    navigator.getUserMedia(constraints, successCallback, errorCallback);
  }
  else
    data.errorMsg.set('Video access not supported by this browser, get google chrome for best compatability');
};

//Stops the scanning
var stopScan = function(event, template, value){
  var data = template.fbScan;
  var video = template.$('.videoOutput')[0];
  if(video) video.src = null;
  if(data.stream) data.stream.stop();
  data.stream = null;
  data.timer = null;
  //Set the running property to true
  data.running.set(false);
  if(!template.eventTriggered)
    template.$("form[name='" + template.formID+ "']").trigger('fbScanComplete', [{data: value}]);
  template.eventTriggered=true;
};

Template.fbScan.created = function(){
  if(!this.fbScan) this.fbScan = {};
  this.fbScan.errorMsg = new ReactiveVar("");
  this.fbScan.running = new ReactiveVar(false);
  this.formID = this.data._id;
  this.eventTriggered = false;
  //Find the right camera to use, only works in chrome
  getSource(this);
};

Template.fbScan.events({
  //Events to allow external control
  'stopScan form' : function (event, template) {
    stopScan(event, template, "");
  },
  'startScan form' : function (event, template) {
    startScan(event, template);
  }
});

Template.fbScan.helpers({
  source:null,
  errorMsg:function(){
    var template = Template.instance();
    return template.fbScan.errorMsg.get();
  }
});