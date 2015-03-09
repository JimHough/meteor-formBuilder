if ((typeof FormBuilder) !== "object")  FormBuilder = {};
FormBuilder.modals = new Mongo.Collection(null); //a collection of all the modal pop-ups being displayed

Template.fbModals.helpers({
  getModals: function () {
    return FormBuilder.modals.find();
  }
});

Template.fbModal.rendered = function () {
  this.$("#" + this.data._id).modal('show');
};

FormBuilder.modals.addCreateForm = function(data, callbacks){
  data = _.pick(data, 'title', 'collection', 'filter');
  data = _.defaults(data, {title: 'Create', filter: 0xFFFF, type:'create'});
  var id = FormBuilder.modals.insert(data);
  //Immediately updates the DOM
  Tracker.flush();
  $('#' + id + '.modal')
    .on('fbAfterCreate', function(event,info){
      if (info && !info.error)
        $(this).modal('hide');
  })
    .on('hidden.bs.modal', function(event,info){
      FormBuilder.modals.remove(id);
  }).on(callbacks);
  return id;
};

FormBuilder.modals.addUpdateForm = function(data, callbacks){
  data = _.pick(data, 'title', 'collection', 'filter', 'document');
  data = _.defaults(data, {title: 'Update', filter: 0xFFFF, type:'update'});
  var id = FormBuilder.modals.insert(data);
  //Immediately updates the DOM
  Tracker.flush();
  $('#' + id + '.modal')
    .on('fbAfterUpdate', function(event,info){
      if (info && !info.error)
        $(this).modal('hide');
  })
    .on('hidden.bs.modal', function(event,info){
      FormBuilder.modals.remove(id);
  }).on(callbacks);
  return id;
};

FormBuilder.modals.addList = function(data, callbacks){
  data = _.pick(data, 'title', 'collection', 'filter');
  data = _.defaults(data, {title: 'Create', filter: 0xFFFF, type:'list'});
  var id = FormBuilder.modals.insert(data);
  //Immediately updates the DOM
  Tracker.flush();
  $('#' + id + '.modal')
    .on('fbListSelected', function(event,info){
      if (info && info.selected)
        $(this).modal('hide');
  })
    .on('hidden.bs.modal', function(event,info){
      FormBuilder.modals.remove(id);
  }).on(callbacks);
  return id;
};

FormBuilder.modals.addScan = function(data, callbacks){
  data = _.pick(data, 'title');
  data = _.defaults(data, {title: 'Scan a QR Code', type:'scan'});
  var id = FormBuilder.modals.insert(data);
  //Immediately updates the DOM
  Tracker.flush();
  $('#' + id + '.modal')
    .on('fbScanComplete', function(event,info){
      $(this).modal('hide');
  })
    .on('hidden.bs.modal', function(event,info){
      $('#' + id + '.modal form').trigger('stopScan');
      FormBuilder.modals.remove(id);
  })
    .on(callbacks);
  $('#' + id + '.modal form').trigger('startScan');
  return id;
};