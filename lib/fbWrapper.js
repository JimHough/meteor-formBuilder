if((typeof FormBuilder) !== "object") FormBuilder = {};
if(Meteor.isClient){
  FormBuilder.forms = new Mongo.Collection(null); //store the current form data in a client side collection
  FormBuilder.views = new Mongo.Collection(null); //store the current view data in a client side collection
  Template.fbWrapper.helpers({
    //Gets the array of views from the relevant data store for the form
    getViews: function () {
      var tmpl = Template.instance();
      return FormBuilder.views.find({parentID:tmpl.dataID}, {sort: {position : 1 }});
    },
    getTemplate: function(){
      return Template[this.template];
    },
    getForm: function(){
      var tmpl = Template.instance();
      return FormBuilder.forms.findOne({_id:tmpl.dataID});
    },
    getTable: function(){
      return FormBuilder.tables[this.collection];
    }
  });
  //When the template is created make an object that will store the view of the form
  Template.fbWrapper.created = function(){
    var template = this;
    //Create the form object and get the ID
    var formObj = _.pick(template.data, 'hookID','collection', 'type', 'document', 'labelWidth', 'inputWidth', 'filter');
    var defaultFilter = 0xFFFF;
    if(formObj.type === 'create') {
      formObj.isCreate = true;
      defaultFilter = 0x0001;
    }
    else if(formObj.type === 'update') {
      formObj.isUpdate = true;
      defaultFilter = 0x0002;
    }
    else if(formObj.type === 'read') {
      formObj.isRead = true;
      defaultFilter = 0x0004;
    }
    else if(formObj.type === 'list') {
      formObj.isList = true;
    }
    formObj = _.defaults(formObj, {type:'read', labelWidth:3, inputWidth:9, filter:defaultFilter});
    //Check that the collection is specified and is valid
    if(((typeof formObj.collection) !== 'string') ||  !Mongo.Collection.get(formObj.collection)){
        console.error('FormBuilder fbWrapper should be used with collection name as a string parameter.');
        return;
      }
    var collection = Mongo.Collection.get(formObj.collection);
    
    //Check that a schema has been specified
    if((typeof collection.schema) !== 'object'){
      console.error('FormBuilder fbWrapper should be used with a collection that has a schema object.');
      return;
    }
    template.dataID = FormBuilder.forms.insert(formObj);

    formObj = FormBuilder.forms.findOne(template.dataID);
    if(!formObj.isList)
    {
      //The position object is used for sorting the views, it is incremented internally inside the addViews method
      var position = {value:0};
      //Iterate over the schema object calling the add views method on each one 
      _.each(_.keys(collection.schema), function(fieldName){
        var schemaObj = collection.schema[fieldName];
        //Get the controller for this database field
        if(((typeof schemaObj.controller) !== 'string') || !FormBuilder.controllers[schemaObj.controller])
          console.warn(formObj.collection + '.schema.' + fieldName + ' controller ' + schemaObj.controller + ' not found.');
        else{
          FormBuilder.controllers[schemaObj.controller].addViews(fieldName, formObj, schemaObj, position, formObj._id);
        }
      });
      if(formObj.isRead || formObj.isUpdate)
        FormBuilder.helpers.loadCurrentValues(formObj._id);
    }
    else
    {
      //Check that a schema has been specified
      if((typeof collection.columns) !== 'object'){
        console.error('FormBuilder fbWrapper should be used with a collection that has a columns object.');
        return;
      }
      //Create a table if one doesnt already exist for this collection
      if(!FormBuilder.tables[formObj.collection]){
        console.error('FormBuilder fbWrapper list types should be used with a collection that has been added to the table views using FormBuilder.tables.AddCollection(collectionName).');
        return;
      }
    }
  };

  //When the template is destroyed remove the data store
  Template.fbWrapper.destroyed = function(){
    //Remove all views for this form
    FormBuilder.views.find({'formObj._id':this.dataID}).forEach(function(field){
      FormBuilder.views.remove({_id:field._id});
    });
    //Remove the form
    FormBuilder.forms.remove({_id:this.dataID});
  };

  Template.fbWrapper.events({
    //When submit is pressed try to insert, if an error is shown update the data store to show the error
    'submit form': function(event, template) {
      event.preventDefault();
      var formObj = FormBuilder.forms.findOne({_id:template.dataID});
      var collection = Mongo.Collection.get(formObj.collection);
      FormBuilder.helpers.getCurrentValues(formObj,function(doc){
        var databaseCallback = function(errors, id){
          var error = !!errors;
          if(error) {
            try{
              errors = JSON.parse(errors.reason);
            }catch(e){
              alert(errors.reason);
            }
          }
          else errors = {};

          //Iterate over the schema object calling the set error method on each one 
          var position = {value:0};
          _.each(_.keys(collection.schema), function(fieldName){
            var schemaObj = collection.schema[fieldName];
            FormBuilder.controllers[schemaObj.controller].setError(fieldName, formObj._id, position, errors, id);
          });      
          if(formObj.isCreate)
              $("form[name='"+formObj._id+"']").trigger('fbAfterCreate', [{doc:doc, error:error}]);
            else if(formObj.isUpdate)
              $("form[name='"+formObj._id+"']").trigger('fbAfterUpdate', [{doc:doc, error:error}]);
        };

        if(formObj.isCreate){
          var info = {doc:doc, continue:true};
          $("form[name='"+formObj._id+"']").trigger('fbBeforeCreate', [info]);
          if(info.continue)
            collection.insert(doc, databaseCallback);
        }
        else if(formObj.isUpdate){
          var info = {doc:doc, continue:true};
          $("form[name='"+formObj._id+"']").trigger('fbBeforeUpdate', [info]);
          if(info.continue)
            collection.update({_id:formObj.document}, {$set:doc}, databaseCallback);
        }
      });
    },
    'click .btn-form-select' : function(event, template){
      if(template.currentSelection){
        var formObj = FormBuilder.forms.findOne({_id:template.dataID});
        var info = {selected:template.currentSelection};
        template.$("form[name='"+formObj._id+"']").trigger('fbListSelected', [info]);
      }
    },
    'click tbody tr': function(event, template){
      if(template.$(event.currentTarget).hasClass('selected')){
        template.$(event.currentTarget).removeClass('selected');
        template.currentSelection = undefined;
        template.$('.btn-form-select').prop('disabled', true);
      }else{
        var dataTable = template.$(event.currentTarget).closest('table').DataTable();
        dataTable.$('tr.selected').removeClass('selected');
        template.$(event.currentTarget).addClass('selected');
        //Store the item that is highlighted on the template
        var rowData = dataTable.row(event.currentTarget).data();
        template.currentSelection = rowData._id;
        template.$('.btn-form-select').prop('disabled', false);
      }
    }
  });
  
  
}

if(Meteor.isServer){
  //A temporary collection for previewing the results of an update
  FormBuilder.temp = new Mongo.Collection(null);
  //This object is passed to a Collection.deny function to enable data validation
  FormBuilder.validate = function(collectionID){
    var validate = function(userId, doc, docID, colID){
      if(!doc)
        throw new Meteor.Error(403, "validate called without a valid document!");
      var errors = {};
      var collection = Mongo.Collection.get(colID);
      if(!collection)
        throw new Meteor.Error(403, "validate called without a valid collection! ("+ colID+")");
      _.each(_.keys(doc), function(fieldName){
        var schemaObj = collection.schema[fieldName] || {};
        var value = doc[fieldName];
        var controller = schemaObj.controller;
        if(((typeof controller) !== 'string') || !FormBuilder.controllers[controller])
          errors[fieldName] = colID + '.schema.' + fieldName + ' fieldBuilder ' + controller + ' not found.';
        else{
          var message = FormBuilder.controllers[controller].validate.call(this, fieldName, value, schemaObj, collection, docID);
          if (!!message) errors[fieldName] = message;
        }
      });
      if(!_.isEmpty(errors)) throw new Meteor.Error(403, JSON.stringify(errors));
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
}