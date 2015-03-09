Template.fbViewPersonName_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewPersonName_read.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewPersonName_create_update.helpers({
  getTemplate:function(){
    return Template[this.template];
  },
  getForenameData:function(){
    return FormBuilder.views.findOne({parentID:this._id, position:0});
  },
  getSurnameData:function(){
    return FormBuilder.views.findOne({parentID:this._id, position:2});
  },
  getMiddlenamesData:function(){
    return FormBuilder.views.findOne({parentID:this._id, position:1});
  }
});
  
Template.fbViewPersonName_read.helpers({
  getFullName:function(){
    var result = FormBuilder.views.findOne({parentID:this._id, position:0}).currentValue;
    var arrayDataObj = FormBuilder.views.findOne({parentID:this._id, position:1});
    FormBuilder.views.find({parentID:arrayDataObj._id}, {sort: {position : 1 }}).forEach(function(name){
      if(typeof name.currentValue === 'string')
        result += ' ' + name.currentValue;
    });
    result += ' ' + FormBuilder.views.findOne({parentID:this._id, position:2}).currentValue;
    return result.trim();
  }
});