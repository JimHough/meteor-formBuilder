Package.describe({
    name: "jhough:formbuilder",
    version: "0.0.1",
    summary: "Generates forms and validates data from a schema"
});

Package.on_use(function (api) {
  api.use('underscore', 'server');
  api.use(['livedata', 'underscore', 'deps', 'templating', 'ui', 'blaze', 'ejson', 'reactive-var'], 'client');
  api.use('raix:ui-dropped-event', 'client');
  api.use('sergeyt:typeahead', 'client')
  api.use('mongo', ['client', 'server']);
    //CSS
  api.add_files('style.css', 'client');
  //HTML
  api.add_files('client/spark-md5.js', 'client');
  api.add_files('client/fbWrapper.html', 'client');
  api.add_files('client/fbModals.html', 'client');
  api.add_files('client/ViewHtml/fbViewAddress.html', 'client');
  api.add_files('client/ViewHtml/fbViewArray.html', 'client');
  api.add_files('client/ViewHtml/fbViewCheckbox.html', 'client');
  api.add_files('client/ViewHtml/fbViewDate.html', 'client');
  api.add_files('client/ViewHtml/fbViewDob.html', 'client');
  api.add_files('client/ViewHtml/fbViewFile.html', 'client');
  api.add_files('client/ViewHtml/fbViewNumber.html', 'client');
  api.add_files('client/ViewHtml/fbViewPersonName.html', 'client');
  api.add_files('client/ViewHtml/fbViewQRCode.html', 'client');
  api.add_files('client/ViewHtml/fbViewReference.html', 'client');
  api.add_files('client/ViewHtml/fbViewSelect.html', 'client');
  api.add_files('client/ViewHtml/fbViewText.html', 'client');
  api.add_files('client/ViewHtml/fbViewTypeahead.html', 'client');
  //(client and server in lib)
  api.add_files('lib/fbHelpers.js', ['client','server']);
  api.add_files('lib/fbWrapper.js', ['client','server']);
  api.add_files('lib/fbModals.js', ['client','server']);
  //Controllers (client and server in lib)
  api.add_files('lib/Controllers/fbControllerBase.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerBaseMulti.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerAddress.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerArray.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerCheckbox.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerDate.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerDob.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerFile.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerNumber.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerPersonName.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerQRCode.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerReference.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerSelect.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerText.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerTypeahead.js', ['client','server']);
  api.add_files('lib/Controllers/fbControllerUnchecked.js', ['client','server']);
  //Javascript
  api.add_files('client/ViewJs/fbViewAddress.js', 'client');
  api.add_files('client/ViewJs/fbViewArray.js', 'client');
  api.add_files('client/ViewJs/fbViewCheckbox.js', 'client');
  api.add_files('client/ViewJs/fbViewDate.js', 'client');
  api.add_files('client/ViewJs/fbViewDob.js', 'client');
  api.add_files('client/ViewJs/fbViewFile.js', 'client');
  api.add_files('client/ViewJs/fbViewNumber.js', 'client');
  api.add_files('client/ViewJs/fbViewPersonName.js', 'client');
  api.add_files('client/ViewJs/fbViewQRCode.js', 'client');
  api.add_files('client/ViewJs/fbViewReference.js', 'client');
  api.add_files('client/ViewJs/fbViewSelect.js', 'client');
  api.add_files('client/ViewJs/fbViewText.js', 'client');
  api.add_files('client/ViewJs/fbViewTypeahead.js', 'client');
  //Images
  api.add_files('img/noImageThumb.png','client');
  api.add_files('img/dropHere.png','client');
  api.add_files('img/icons/bat.bmp','client');
  api.add_files('img/icons/bmp.bmp','client');
  api.add_files('img/icons/db.bmp','client');
  api.add_files('img/icons/default.bmp','client');
  api.add_files('img/icons/doc.bmp','client');
  api.add_files('img/icons/docx.bmp','client');
  api.add_files('img/icons/dot.bmp','client');
  api.add_files('img/icons/dwfx.bmp','client');
  api.add_files('img/icons/dwg.bmp','client');
  api.add_files('img/icons/dxf.bmp','client');
  api.add_files('img/icons/err.bmp','client');
  api.add_files('img/icons/zip.bmp','client');
  api.add_files('img/icons/gif.bmp','client');
  api.add_files('img/icons/htm.bmp','client');
  api.add_files('img/icons/iam.bmp','client');
  api.add_files('img/icons/idv.bmp','client');
  api.add_files('img/icons/idw.bmp','client');
  api.add_files('img/icons/imgres.bmp','client');
  api.add_files('img/icons/ini.bmp','client');
  api.add_files('img/icons/ipj.bmp','client');
  api.add_files('img/icons/ipn.bmp','client');
  api.add_files('img/icons/ipt.bmp','client');
  api.add_files('img/icons/jpg.bmp','client');
  api.add_files('img/icons/lck.bmp','client');
  api.add_files('img/icons/lnk.bmp','client');
  api.add_files('img/icons/log.bmp','client');
  api.add_files('img/icons/mdb.bmp','client');
  api.add_files('img/icons/mov.bmp','client');
  api.add_files('img/icons/mpp.bmp','client');
  api.add_files('img/icons/msg.bmp','client');
  api.add_files('img/icons/ods.bmp','client');
  api.add_files('img/icons/odt.bmp','client');
  api.add_files('img/icons/pdf.bmp','client');
  api.add_files('img/icons/png.bmp','client');
  api.add_files('img/icons/ppt.bmp','client');
  api.add_files('img/icons/pptx.bmp','client');
  api.add_files('img/icons/rar.bmp','client');
  api.add_files('img/icons/rtf.bmp','client');
  api.add_files('img/icons/tiff.bmp','client');
  api.add_files('img/icons/txt.bmp','client');
  api.add_files('img/icons/wbk.bmp','client');
  api.add_files('img/icons/xls.bmp','client');
  api.add_files('img/icons/xlsb.bmp','client');
  api.add_files('img/icons/xlsm.bmp','client');
  api.add_files('img/icons/xlsx.bmp','client');
  api.add_files('img/icons/xlt.bmp','client');
  api.add_files('img/icons/xltm.bmp','client');
  api.add_files('img/icons/xmcd.bmp','client');
  api.add_files('img/icons/xml.bmp','client');
  if (api.export)
    api.export('FormBuilder');
});
