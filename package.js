Package.describe({
    name: "jhough:formbuilder",
    version: "0.0.1",
    summary: "Generates forms and validates data from a schema"
});

Package.on_use(function (api) {
  //api.use(['handlebars', 'underscore', 'templating'], 'client');
  api.use(['livedata', 'underscore', 'deps', 'templating', 'ui', 'blaze', 'ejson', 'reactive-var'], 'client');
  api.use('raix:ui-dropped-event@0.0.7', 'client');
  api.use('mongo', ['client', 'server']);
    //CSS
  api.add_files('style.css', 'client');
  //HTML
  api.add_files('client/fbWrapper.html', 'client');
  api.add_files('client/ViewHtml/fbViewAddress.html', 'client');
  api.add_files('client/ViewHtml/fbViewArray.html', 'client');
  api.add_files('client/ViewHtml/fbViewDate.html', 'client');
  api.add_files('client/ViewHtml/fbViewDob.html', 'client');
  api.add_files('client/ViewHtml/fbViewFile.html', 'client');
  api.add_files('client/ViewHtml/fbViewNumber.html', 'client');
  api.add_files('client/ViewHtml/fbViewPersonName.html', 'client');
  api.add_files('client/ViewHtml/fbViewQRCode.html', 'client');
  api.add_files('client/ViewHtml/fbViewSelect.html', 'client');
  api.add_files('client/ViewHtml/fbViewText.html', 'client');
  api.add_files('client/ViewHtml/fbViewTypeahead.html', 'client');
  //(client and server in lib)
  api.add_files('lib/fbHelpers.js', ['client','server']);
  api.add_files('lib/fbWrapper.js', ['client','server']);
  //Controllers (client and server in lib)
  api.add_files('lib/Controllers/fbControllerAddress.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerArray.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerDate.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerDob.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerFile.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerNumber.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerPersonName.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerQRCode.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerSelect.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerText.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerTypeahead.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerUnchecked.js', ['client','server']);
  //Javascript
  api.add_files('client/ViewJs/fbViewAddress.js', 'client');
  api.add_files('client/ViewJs/fbViewArray.js', 'client');
  api.add_files('client/ViewJs/fbViewDate.js', 'client');
  api.add_files('client/ViewJs/fbViewDob.js', 'client');
  api.add_files('client/ViewJs/fbViewFile.js', 'client');
  api.add_files('client/ViewJs/fbViewNumber.js', 'client');
  api.add_files('client/ViewJs/fbViewPersonName.js', 'client');
  api.add_files('client/ViewJs/fbViewQRCode.js', 'client');
  api.add_files('client/ViewJs/fbViewSelect.js', 'client');
  api.add_files('client/ViewJs/fbViewText.js', 'client');
  api.add_files('client/ViewJs/fbViewTypeahead.js', 'client');
  //Images
  api.add_files('img/noImageThumb.png','client');
  api.add_files('img/dropHere.png','client');
  if (api.export)
    api.export('FormBuilder');
});
