Template.fbViewTypeahead_create_update.helpers(FormBuilder.helpers.viewBaseHelpers);
Template.fbViewTypeahead_read.helpers(FormBuilder.helpers.viewBaseHelpers);

var valueChanged = function(event,context){
  var controller = FormBuilder.controllers[context.data.schemaObj.controller];
  controller.setValue(context.data.fieldName, context.data.parentID, {value:context.data.position}, event.target.value);
};

Template.fbViewTypeahead_create_update.events({
  'typeahead:selected':valueChanged,
  'typeahead:autocompleted':valueChanged,
  'input':valueChanged
});

Template.fbViewTypeahead_create_update.rendered = function(){
  if(this.data.schemaObj.dataSource === null)
    throw new Error("TypeAhead control no datasource specified.");
  var dataFilter = this.data.schemaObj.dataFilter;
  var data = this.data.schemaObj.dataSource.split(".");
  var collection = Mongo.Collection.get(data[0]);
  var field = data[1] || 'name';
  var findMatches = function (q, cb) {
    q = q + "";
    q = q.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    var query = _.extend({},dataFilter);
    //regex used to determine if a string starts with the substring `q`
    query.$where = new RegExp('^' + q, 'i');
    query.$where += ".test(this." + field + ")";
    var matches = collection.find(query).map(function(item){return item[field];});
    //regex used to determine if a string contains the substring `q`
    query[field] = new RegExp(q, 'i');
    var matchesAnywhere = collection.find(query).map(function(item){return item[field];});
    matches = _.union(matches, matchesAnywhere);
    //Make the objects to be passed back with a value attribute
    for(var i=0; i<matches.length; i++)
      matches[i] = {value:matches[i]+""};
    cb(matches);
  };
  
  this.$('.typeahead').typeahead({hint: false, highlight: true, minLength: 1},{source: findMatches});
  this.$('.twitter-typeahead').css('display', '');
};
