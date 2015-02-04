if((typeof FormBuilder) !== "object") FormBuilder = {};
if((typeof FormBuilder.helpers) !== "object") FormBuilder.helpers = {};

FormBuilder.helpers.findInstance = function(id, templateName)
{
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

FormBuilder.helpers.isInt = function(n){
    return typeof n==='number' && isFinite(n) && (n%1)===0;
};

FormBuilder.helpers.isNumber = function(n){
    return typeof n==='number' && isFinite(n);
};

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

FormBuilder.helpers.arraysEqual = function(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }
    return true;
};

FormBuilder.helpers.valuesEqual = function(val1, val2){
  if(typeof val1 !== typeof val2) return false;
  if(typeof val1 === 'object'){
    FormBuilder.helpers.arraysEqual(val1, val2);
  }else{
    return val1 === val2;
  }
};

//Sets the document that the form is linked to
FormBuilder.helpers.setDocument = function(formID, documentID){
  FormBuilder.forms.update({_id:formID}, {$set:{document:documentID}});
  FormBuilder.helpers.loadCurrentValues(formID);
};

//Gets the current value from the database and loads it into the forms views
FormBuilder.helpers.loadCurrentValues = function(formID){
  var formObj = FormBuilder.forms.findOne({_id:formID});
  if (!formObj.document) return;
  var collection = window[formObj.collection];
  var currentValues =  collection.findOne({_id:formObj.document});
  var position = {value:0};
  _.each(_.keys(collection.schema), function(fieldName){
    var schemaObj = collection.schema[fieldName];
    if(((typeof schemaObj.controller) !== 'string') || !FormBuilder.controllers[schemaObj.controller] || !FormBuilder.controllers[schemaObj.controller].setValue)
      console.warn(formObj.collection + '.schema.' + fieldName + ' controller ' + schemaObj.controller + ' not found.');
    else
      FormBuilder.controllers[schemaObj.controller].setValue(fieldName, formObj._id, position, currentValues[fieldName]);
  });
};

//Gets an object containing all item names and values
FormBuilder.helpers.getCurrentValues= function(formObj, callback){
  var result = {};
  var collection = window[formObj.collection];
  //Iterate over the schema object calling the get value method on each one 
  var position = {value:0};
  var fields = _.keys(collection.schema);
  var callbackAsync = _.after(fields.length, callback.bind(this));
  _.each(fields, function(fieldName){
    var schemaObj = collection.schema[fieldName];
    FormBuilder.controllers[schemaObj.controller].getValue(fieldName, formObj._id, position, function(value){
        result[fieldName] = value;
        callbackAsync(result);
    });
  });

};

//Gets an object containing all item IDs
FormBuilder.helpers.getIDs= function(formObj){
  var result = {
    normal:[],
    arrays:[]
  };
  FormBuilder.views.find({'formObj._id':formObj._id}).forEach(function(field){
    if(field.isArrayContainer)
      result.arrays.push(field._id);
    else
      result.normal.push(field._id);
  });
  return result;
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

Object.defineProperty(Number.prototype,'fileSize',{value:function(a,b,c,d){
 return (a=a?[1e3,'k','B']:[1024,'K','iB'],b=Math,c=b.log,
 d=c(this)/c(a[0])|0,this/b.pow(a[0],d)).toFixed(2)
 +' '+(d?(a[1]+'MGTPEZY')[--d]+a[2]:'Bytes');
},writable:false,enumerable:false});