object-validator
================

Sync/async object validator written with JavaScript

Example:

```
var validator = new ObjectValidator();

// Validators

validator.addValidator('notEmpty', function(propertyName, value, options) {
  if (! value) {
    this.addError(propertyName, "Property '"+propertyName+"' can't be empty.");
  }
});

validator.addValidator('contain', function(propertyName, value, options) {
  if (value.indexOf(options.value) === -1) {
    this.addError(propertyName, "Property '"+propertyName+"' should contain '"+options.value+"'.");
  }
});

validator.addValidator('checkOnServer', function(propertyName, value, options) {
  if (typeof options.callback !== 'function') {
    throw Error("This validator require option 'callback' with type 'function'.");
  }

  setTimeout((function() {
    this.addError('name', 'Not Valid!');
    options.callback();
  }).bind(this), 2000);
}, true);

// Conditions

validator.addCondition('name', 'notEmpty');
validator.addCondition('name', 'contain', { value: 'test' });
validator.addCondition('name', 'checkOnServer');

// Check with errors

console.log('validate sync: ', validator.validate({name: ''}));
console.log('errors sync: ', validator.getErrors());
console.log('property errors: ', validator.getErrorsOfProperty('name'));

// Check without errors

console.log('validate sync: ', validator.validate({name: 'testy'}));
console.log('errors sync: ', validator.getErrors());
console.log('property errors: ', validator.getErrorsOfProperty('name'));

// Async check with errors

validator.validate({name: 'test'}, function(state) {
  console.log('validate async: ', state);
  console.log('errors async: ', this.getErrors());
});
```
