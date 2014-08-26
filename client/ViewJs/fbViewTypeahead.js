var valueChanged = function(event,context){
  var value = event.target.value;
  var viewData = FormBuilder.views.findOne({_id:event.target.id});
  FormBuilder.views.update({_id:viewData._id}, {$set:{currentValue:value}});
  if(viewData.schemaObj.asYouType){
    var error = FormBuilder.controllers[viewData.schemaObj.controller].validate(viewData.fieldName, value, viewData.schemaObj, window[viewData.formObj.collection], viewData.formObj.document);
    FormBuilder.views.update({_id:viewData._id}, {$set:{error:error}});
  }
};

Template.fbViewTypeahead_create_update.events({
  'typeahead:selected':valueChanged,
  'typeahead:autocompleted':valueChanged,
  'input':valueChanged
});

Template.fbViewTypeahead_create_update.rendered = function(){
  var data = this.data.schemaObj.dataSource.split(".");
  var collection = window[data[0]];
  var field = data[1] || 'name';
  var findMatches = function (q, cb) {
    q = q.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    var query = {};
    //regex used to determine if a string starts with the substring `q`
    query[field] = new RegExp('^' + q, 'i');
    var matches = collection.find(query).map(function(item){return item[field];});
    //regex used to determine if a string contains the substring `q`
    query[field] = new RegExp(q, 'i');
    var matchesAnywhere = collection.find(query).map(function(item){return item[field];});
    matches = _.union(matches, matchesAnywhere);
    //Make the objects to be passed back with a value attribute
    for(var i=0; i<matches.length; i++)
      matches[i] = {value:matches[i]};
    cb(matches);
  };
  
  $('.typeahead').typeahead({hint: false, highlight: true, minLength: 1},{source: findMatches});
  $('.twitter-typeahead').css('display', '');
};
