if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.types) !== "object") FormBuilder.types = {};
if((typeof FormBuilder.types.fbArray) !== "object") FormBuilder.types.fbArray = {};
if(Meteor.isClient){
  //Private functions
  //Enables and disables the function buttons based on the views position and the maxCount and minCount values
  var updateButtons = function(viewDataID){
    var viewDataObj = FormBuilder.views.findOne({_id:viewDataID});
    var viewDataObjs = FormBuilder.views.find({parentID:viewDataObj.parentID});
    var arrayField = FormBuilder.views.findOne({_id:viewDataObj.parentID});
    var length = viewDataObjs.count();
    if (length < arrayField.schemaObj.maxCount) {
      $(event.target).find(".fbArray-add").removeAttr("disabled");
    } else {
      $(event.target).find(".fbArray-add").attr("disabled", true);
    }
    if (length > arrayField.schemaObj.minCount) {
      $(event.target).find(".fbArray-remove").removeAttr("disabled");
    } else {
      $(event.target).find(".fbArray-remove").attr("disabled", true);
    }
    if (viewDataObj.position > 0) {
      $(event.target).find(".fbArray-move-up").removeAttr("disabled");
    } else {
      $(event.target).find(".fbArray-move-up").attr("disabled", true);
    }
    if (viewDataObj.position < length-1) {
      $(event.target).find(".fbArray-move-down").removeAttr("disabled");
    } else {
      $(event.target).find(".fbArray-move-down").attr("disabled", true);
    }
  };
  
  var getController = function(arrayDataID){
    var arrayDataObj = FormBuilder.views.findOne({_id:arrayDataID});
    return FormBuilder.controllers[arrayDataObj.schemaObj.controller];
  };
  
  
  var helpers = {
    //Gets the array of fields from the relevant data store for the form
    getFields: function () {
      var tmpl = UI._templateInstance();
      return FormBuilder.views.find({parentID:this._id}, {sort: {position : 1 }});
    },
    getTemplate: function(){
      return Template[this.template];
    },
    isEmpty: function(){
      return FormBuilder.views.find({parentID:this._id}).count() === 0;
    }
  };
  //Template functions
  Template.fbViewArray_create_update.helpers(helpers);
  Template.fbViewArray_read.helpers(helpers);
  
  Template.fbViewArray_create_update.rendered = function(){
    this.$(".fbArray-buttons").hide();
  };
  
  Template.fbViewArray_create_update.events({
    'mouseleave .fbArray-item' : function (event, template) {
      $(event.target).find(".fbArray-buttons").hide();
    },
    'mouseenter .fbArray-item' : function (event, template) {
      $(event.target).find(".fbArray-buttons").show();
      updateButtons(event.target.id);
    },
    'click .fbArray-add' : function (event, template) {
      var viewDataID = $(event.target).parents(".fbArray-item")[0];
      viewDataID = viewDataID && viewDataID.id;
      var arrayDataID = $(event.target).parents(".fbArray-container")[0].id;
      getController(arrayDataID).addView(viewDataID, arrayDataID);
      event.preventDefault();
    },
    'click .fbArray-remove' : function (event, template) {
      var viewDataID = $(event.target).parents(".fbArray-item")[0].id;
      var arrayDataID = $(event.target).parents(".fbArray-container")[0].id;
      getController(arrayDataID).removeView(viewDataID);
      event.preventDefault();
    },
    'click .fbArray-move-up' : function (event, template) {
      var viewDataID = $(event.target).parents(".fbArray-item")[0].id;
      var arrayDataID = $(event.target).parents(".fbArray-container")[0].id;
      getController(arrayDataID).moveView(viewDataID, -1);
      event.preventDefault();
    },
    'click .fbArray-move-down' : function (event, template) {
      var viewDataID = $(event.target).parents(".fbArray-item")[0].id;
      var arrayDataID = $(event.target).parents(".fbArray-container")[0].id;
      getController(arrayDataID).moveView(viewDataID, +1);
      $(event.target).parents(".fbArray-buttons").hide();
      event.preventDefault();
    }
  });
}