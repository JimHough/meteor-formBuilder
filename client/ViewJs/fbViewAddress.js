Template.fbViewAddress_create_update.helpers({
  getTemplate:function(){
    return Template[this.template];
  },
  getOrganisationData:function(){
    return FormBuilder.views.findOne({parentID:this._id, position:0});
  },
  getBuildingData:function(){
    return FormBuilder.views.findOne({parentID:this._id, position:1});
  },
  getStreetData:function(){
    return FormBuilder.views.findOne({parentID:this._id, position:2});
  },
  getTownData:function(){
    return FormBuilder.views.findOne({parentID:this._id, position:3});
  },
  getPostCodeData:function(){
    return FormBuilder.views.findOne({parentID:this._id, position:4});
  },
  getCountryData:function(){
    return FormBuilder.views.findOne({parentID:this._id, position:5});
  }
});
  
Template.fbViewAddress_read.helpers({
  getFullAddress:function(){
    var result = "";
    for(var i=0;i<6;i++){
      var value = FormBuilder.views.findOne({parentID:this._id, position:i}).currentValue;
      if (value) {
        result += value;
        if (i<5) result += ", ";
      }
    }
    return result;
  }
});