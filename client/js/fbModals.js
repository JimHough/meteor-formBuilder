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

FormBuilder.modals.addReadForm = function(data, callbacks){
  data = _.pick(data, 'title', 'collection', 'filter', 'document');
  data = _.defaults(data, {title: 'Read', filter: 0xFFFF, type:'read'});
  var id = FormBuilder.modals.insert(data);
  //Immediately updates the DOM
  Tracker.flush();
  $('#' + id + '.modal')
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
    var $popup = $('#' + id + '.modal');
    $popup.on('fbScanComplete', function(event,info){
        $(this).modal('hide');
    });
    $popup.on('hidden.bs.modal', function(event,info){
        $('#' + id + '.modal form').trigger('stopScan');
        FormBuilder.modals.remove(id);
    });
    $popup.on(callbacks);
    if(Meteor.isCordova){
      cordova.plugins.barcodeScanner.scan(
        function(result) {
          $popup.trigger('fbScanComplete', [{data: result.text}]);
        },
        function(error) {
          alert("Scanning failed: " + error);
        }
      );
    }
    else{
      $('#' + id + '.modal form').trigger('startScan');
    }
    return id;
};

FormBuilder.modals.addSnapshot = function(data, callbacks){
  data = _.pick(data, 'title');
  data = _.defaults(data, {title: 'Take a Picture', type:'snapshot'});
  var id = FormBuilder.modals.insert(data);
  //Immediately updates the DOM
  Tracker.flush();
  $('#' + id + '.modal')
    .on('fbSnapshotComplete', function(event,info){
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