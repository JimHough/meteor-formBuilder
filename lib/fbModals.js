if((typeof FormBuilder) !== "object") FormBuilder = {};
if(Meteor.isClient){
  FormBuilder.modals = new Mongo.Collection(null); //a collection of all the modal pop-ups being displayed
  Template.fbModals.helpers({
    getModals: function () {
      return FormBuilder.modals.find();
    }
  });
  
  Template.fbModals.rendered = function(){
    this.$('.fbModals').on('fbAfterCreate', function(event, info){
      if(info && !info.error)
        $(event.target).closest('.modal').modal('hide');
    })
    .on('fbAfterUpdate', function(event, info){
      if(info && !info.error)
        $(event.target).closest('.modal').modal('hide');
    })
    .on('fbListSelected', function(event, info){
      if(info && info.selected)
      {
        $(event.target).closest('.modal').modal('hide');
      }
    });
  };
  
  Template.fbModal.rendered = function(){
    this.$("#"+this.data._id).modal('show');
  };
  
  Template.fbModal.events({
    'hidden.bs.modal':function(event, template){
      if(event.target.id === this._id)
        FormBuilder.modals.remove(this._id);
    }
  });
  
}
