if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.helpers) !== "object") FormBuilder.helpers = {};

if(Meteor.isClient){
  //Adds index to an #each caller, usage {{#each addIndex somearray}}....
  UI.registerHelper('addIndex', function(all){
    return _.map(all, function(value, index){
      return {index:index, value:value};
    });
  });
  //Helpers to be added to all view templates
  FormBuilder.helpers.viewBaseHelpers = {
    isVisible: function () {
      var form = FormBuilder.forms.findOne(this.formID);
      var view = FormBuilder.views.findOne(this._id);
      return !!(form.filter & view.schemaObj.filter);
    },
    getLabelWidth: function() {
      var form = FormBuilder.forms.findOne(this.formID);
      return form.labelWidth;
    },
    getInputWidth: function() {
      var form = FormBuilder.forms.findOne(this.formID);
      return form.inputWidth;
    }
  };
}

//gets the template instance with the given name
FormBuilder.helpers.findInstance = function(id, templateName){
  var element = document.getElementById(id);
  if(!element) return null;
  var view = Blaze.getView(element);
  while(1)
  {
    if(!view)return null;
    if(view.name === templateName)
      return view.templateInstance();
    else
      view = view.parentView;
  }
};

//checks if all fields specified are accessible
FormBuilder.helpers.canAccess = function test(obj) {
  for(var arg = 1; arg < arguments.length; ++ arg)
  {
    var objCheck = obj;
    var arr = arguments[arg];
    var parts = arr.split('.');
    for(var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];
      if(objCheck !== null && typeof objCheck === "object" && part in objCheck)
        objCheck = objCheck[part];
      else 
        return false;
    }
  }
  return true;
};

//checks if a value is an integer
FormBuilder.helpers.isInt = function(n){
    return typeof n==='number' && isFinite(n) && (n%1)===0;
};

//checks if a value is a number
FormBuilder.helpers.isNumber = function(n){
    return typeof n==='number' && isFinite(n);
};

//gets the number of decimal places that a number has
FormBuilder.helpers.getDecimalPlaces = function(n) {
  // Make sure it is a number and use the builtin number -> string.
  var s = "" + (+n);
  // Pull out the fraction and the exponent.
  var match = /(?:\.(\d+))?(?:[eE]([+\-]?\d+))?$/.exec(s);
  // NaN or Infinity or integer.
  // We arbitrarily decide that Infinity is integral.
  if (!match) { return 0; }
  // Count the number of digits in the fraction and subtract the
  // exponent to simulate moving the decimal point left by exponent places.
  // 1.234e+2 has 1 fraction digit and '234'.length -  2 == 1
  // 1.234e-2 has 5 fraction digit and '234'.length - -2 == 5
  return Math.max(
      0,  // lower limit.
      (match[1] === '0' ? 0 : (match[1] || '').length)  // fraction length
      - (match[2] || 0));  // exponent
};

//Gets the current value from the database and loads it into the forms views
FormBuilder.helpers.loadCurrentValues = function(formID){
  var form = FormBuilder.forms.findOne({_id:formID});
  if (!form.document) return;
  var collection = Mongo.Collection.get(form.collection);
  var currentValues =  collection.findOne({_id:form.document});
  var position = {value:0};
  _.each(_.keys(collection.schema), function(fieldName){
    var schemaObj = collection.schema[fieldName];
    if(((typeof schemaObj.controller) !== 'string') || !FormBuilder.controllers[schemaObj.controller] || !FormBuilder.controllers[schemaObj.controller].setValue)
      console.warn(form.collection + '.schema.' + fieldName + ' controller ' + schemaObj.controller + ' not found.');
    else
      FormBuilder.controllers[schemaObj.controller].setValue(fieldName, form._id, position, currentValues[fieldName]);
  });
};

//Gets an object containing all item names and values
FormBuilder.helpers.getCurrentValues= function(formID, callback){
  var result = {};
  var form = FormBuilder.forms.findOne(formID);
  var collection = Mongo.Collection.get(form.collection);
  //Iterate over the schema object calling the get value method on each one 
  var position = {value:0};
  var fields = _.keys(collection.schema);
  var callbackAsync = _.after(fields.length, callback.bind(this));
  _.each(fields, function(fieldName){
    var schemaObj = collection.schema[fieldName];
    FormBuilder.controllers[schemaObj.controller].getValue(fieldName, formID, position, function(value){
        result[fieldName] = value;
        callbackAsync(result);
    });
  });

};

//Find the correct template to use based on the type of form (create, read or update) and the type of field
FormBuilder.helpers.findTemplate = function(dataType, formType){
  return _.find(_.keys(Template), function(name){ 
    //check if the template name starts with the dataType name
    if((name.indexOf(dataType) === 0) && (name.indexOf(formType) > dataType.length)){
      return name;
    }
  });
};

//a regular expression to check the validity of a web address
FormBuilder.helpers.regexUrl =  
'/^(https?):\/\/'+                                         // protocol
'(([a-z0-9$_\.\+!\*\'\(\),;\?&=-]|%[0-9a-f]{2})+'+         // username
'(:([a-z0-9$_\.\+!\*\'\(\),;\?&=-]|%[0-9a-f]{2})+)?'+      // password
'@)?(?#'+                                                  // auth requires @
')((([a-z0-9]\.|[a-z0-9][a-z0-9-]*[a-z0-9]\.)*'+           // domain segments AND
'[a-z][a-z0-9-]*[a-z0-9]'+                                 // top level domain  OR
'|((\d|[1-9]\d|1\d{2}|2[0-4][0-9]|25[0-5])\.){3}'+
'(\d|[1-9]\d|1\d{2}|2[0-4][0-9]|25[0-5])'+                 // IP address
')(:\d+)?'+                                                // port
')(((\/+([a-z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)*'+ // path
'(\?([a-z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)'+      // query string
'?)?)?'+                                                   // path and query string optional
'(#([a-z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)?'+      // fragment
'$/i';

//adds file size to the number prototype
Object.defineProperty(Number.prototype,'fileSize',{value:function(a,b,c,d){
 return (a=a?[1e3,'k','B']:[1024,'K','iB'],b=Math,c=b.log,
 d=c(this)/c(a[0])|0,this/b.pow(a[0],d)).toFixed(2)
 +' '+(d?(a[1]+'MGTPEZY')[--d]+a[2]:'Bytes');
},writable:false,enumerable:false});

