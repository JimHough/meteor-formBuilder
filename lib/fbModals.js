if((typeof FormBuilder) !== "object") FormBuilder = {};
if(Meteor.isClient){
  FormBuilder.modals = new Mongo.Collection(null); //a collection of all the modal pop-ups being displayed
  Template.fbModals.helpers({
    getModals: function () {
      return FormBuilder.modals.find();
    }
  });
  
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
