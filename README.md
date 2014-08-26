FormBuilder
===========
This is my working directory, not so much 'work in progress' as in 'work just begun'. I'm just keeping on github so I dont loose it.<br />
Build and validate forms on meteor<br />
<br />
This is just a test of a concept similar to autoform to build forms and validate data following a schema.<br />
The idea is for a core package to facilitate the wrapper for the forms then other packages add data types.<br />
Each data type handles its own view and validation.<br />
A global object 'FormBuilder' is created on the client and on the server.<br />
<br />
On the client 'FormBuilder' holds two 'client only' collections, forms and fields.<br />
The forms collection holds all of the data for the forms currently being rendered.<br />
The fields collection holds all of the data for the fields currently being rendered.<br />
<br />
Each dataType has a html file holding the templates for create, read & update.<br />
Each dataType also has a javascript file, this file adds two methods to FormBuilder.<br />
<br />
`FormBuilder.types.{{dataTypeName}}.buildField(name, schemaData, form, position)`<br />
This builds a document that will be used to store all data for this field, this is what the template binds to.<br />
It must include the following:<br />
position        - An Integer that determines the field's position on the form, zero is the top.<br />
createTemplate  - The name of the template to use for the create form.<br />
readTemplate    - The name of the template to use for the read form.<br />
updateTemplate  - The name of the template to use for the update form.<br />
labelText       - The text to show in the label for the field.<br />
name            - The name of the field, this comes from the schema<br />
parentID        - The id of the parent (form or array) this field belongs to<br />
error           - The text for the error, false if no error is present<br />
isVisible       - This is set true if the field is visible, the template needs to use this to prevent rendering if false<br />
<br />
Optional<br />
labelWidth      - The bootstrap column size to use for the label field<br />
inputWidth      - The bootstrap column size to use for the input field<br />
optional        - This specifies if the field is optional, the default is not optional<br />
<br />
`FormBuilder.types.{{dataTypeName}}.validate(doc)`<br />
This validates the form data supplied in doc, if there is no error an empty string is returned.<br />
If an error occurs a message is returned that will appear under the relavant field.<br />
