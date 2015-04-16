if((typeof FormBuilder) !== "object") FormBuilder = {};
FormBuilder.tables = {};
Meteor.isClient && Template.registerHelper('fbTables', FormBuilder.tables);

FormBuilder.tables.AddCollection = function(collectionName){
  var collection = Mongo.Collection.get(collectionName);
  if(!(collection instanceof Meteor.Collection)){
    console.error('FormBuilder.tables.AddCollection called with an invalid collectionName.');
    return;
  }
  //Check that a schema has been specified
  if((typeof collection.columns) !== 'object'){
    console.error('FormBuilder.tables.AddCollection should be called with a collection that has a columns object.');
    return;
  }
  //Create a table if one doesnt already exist for this collection
  if (!FormBuilder.tables[collectionName]) {
    var options = {
      autoWidth: false,
      scrollX: true, //messes up alignment of headers
      name: collectionName + "List",
      collection: collection,
      columns: collection.columns
    };
    FormBuilder.tables[collectionName] = new Tabular.Table(options);
  }
};
