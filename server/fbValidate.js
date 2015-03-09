if((typeof FormBuilder) !== "object") FormBuilder = {};
//A temporary collection for previewing the results of an update
FormBuilder.temp = new Mongo.Collection(null);
//This object is passed to a Collection.deny function to enable data validation
FormBuilder.validate = function (collectionID) {
  var validate = function (userId, doc, docID, colID) {
    if (!doc)
      throw new Meteor.Error(403, "validate called without a valid document!");
    var errors = {};
    var collection = Mongo.Collection.get(colID);
    if (!collection)
      throw new Meteor.Error(403, "validate called without a valid collection! (" + colID + ")");
    _.each(_.without(_.keys(doc),"_id"), function (fieldName) {
      var schemaObj = collection.schema[fieldName] || {};
      var value = doc[fieldName];
      var controller = schemaObj.controller;
      if (((typeof controller) !== 'string') || !FormBuilder.controllers[controller])
        errors[fieldName] = colID + '.schema.' + fieldName + ' fieldBuilder ' + controller + ' not found.';
      else {
        var message = FormBuilder.controllers[controller].validate.call(this, fieldName, value, schemaObj, collection, docID);
        if (!!message)
          errors[fieldName] = message;
      }
    });
    if (!_.isEmpty(errors))
      throw new Meteor.Error(403, JSON.stringify(errors));
    return false;
  };
  return {
    insert: function (userId, doc) {
      return validate(userId, doc, null, collectionID);
    },
    update: function (userId, doc, fields, modifier) {
      FormBuilder.temp.remove({});
      FormBuilder.temp.insert(doc);
      FormBuilder.temp.update(doc._id, modifier);
      var updatedDoc = FormBuilder.temp.findOne(doc._id);
      var filteredDoc = _.pick(updatedDoc, fields);
      return validate(userId, filteredDoc, doc._id, collectionID);
      FormBuilder.temp.remove({});
    }
  };
};
