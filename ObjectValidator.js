'use strict';

var ObjectValidator = function(validators, conditions) {
  this.errors = [];
  this.conditions = [];
  this.validators = [];

  if (typeof validators !== 'undefined') {
    this.addValidators(validators);
  }

  if (typeof conditions !== 'undefined') {
    this.addConditions(conditions);
  }
};

ObjectValidator.prototype.errors = [];
ObjectValidator.prototype.conditions = [];
ObjectValidator.prototype.validators = [];

ObjectValidator.prototype.addValidator = function(name, validate, async) {
  if (typeof name !== 'string') {
    throw new Error("Can't add validator. Attribute 'name' is not a string.");
  }
  
  if (typeof validate !== 'function') {
    throw new Error("Can't add validator. Attribute 'validate' is not a function.");
  }

  async = async || false;
  
  this.validators.push({
    name: name,
    validate: validate,
    async: async
  });
};

ObjectValidator.prototype.addValidators = function(validators) {
  if (validators instanceof Array === false) {
    throw new Error("Can't add validators. Attribute 'validators' is not an array.");
  }

  for (var i=0,len=validators.length; i<len; i++) {
    this.addValidator(validators[i].name, validators[i].validate, validators[i].async);
  }
};

ObjectValidator.prototype.addError = function(propertyName, message) {
  if (typeof propertyName !== 'string') {
    throw new Error("Can't add error. Attribute 'propertyName' is not a string.");
  }
  
  if (typeof message !== 'string') {
    throw new Error("Can't add error. Attribute 'message' is not a string.");
  }
  
  this.errors.push({
    propertyName: propertyName,
    message: message
  });
};

ObjectValidator.prototype.getErrors = function() {
  return this.errors;
};

ObjectValidator.prototype.getErrorsOfProperty = function(propertyName) {
  if (typeof propertyName !== 'string') {
    throw new Error("Can't get errors of property. Attribute 'propertyName' is not a string.");
  }

  var errors = [];
  for (var i=0,len=this.errors.length; i<len; i++) {
    if (this.errors[i].propertyName === propertyName) {
      errors.push(this.errors[i]);
    }
  }
  return errors;
};

ObjectValidator.prototype.addCondition = function(propertyName, validatorName, options) {
  if (typeof propertyName !== 'string') {
    throw new Error("Can't add condition. Attribute 'propertyName' is not a string.");
  }
  
  if (typeof validatorName !== 'string') {
    throw new Error("Can't add condition. Attribute 'validatorName' is not a string.");
  }
  
  options = options || {};
  
  this.conditions.push({
    propertyName: propertyName,
    validatorName: validatorName,
    options: options
  });
};

ObjectValidator.prototype.addConditions = function(conditions) {
  if (conditions instanceof Array === false) {
    throw new Error("Can't add conditions. Attribute 'conditions' is not an array.");
  }

  var condition;

  for (var i=0,len=conditions.length; i<len; i++) {
    condition = conditions[i];
    this.addCondition(condition.propertyName, condition.validatorName, condition.options);
  }
};

ObjectValidator.prototype.getConditionsForProperty = function(propertyName) {
  if (typeof propertyName !== 'string') {
    throw new Error("Can't get conditions for property. Attribute 'propertyName' is not a string.");
  }
  
  var conditions = [];
  for (var i=0,len=this.conditions.length; i<len; i++) {
    if (this.conditions[i].propertyName == propertyName) {
      conditions.push(this.conditions[i]);
    }
  }
  return conditions;
};

ObjectValidator.prototype.getValidator = function(name) {
  if (typeof name !== 'string') {
    throw new Error("Can't get validator. Attribute 'name' is not a string.");
  }
  
  for (var i=0,len=this.validators.length; i<len; i++) {
    if (this.validators[i].name === name) {
      return this.validators[i];
    }
  }
  
  return null;
};

ObjectValidator.prototype.validateProperty = function(propertyName, value, callback) {
  if (typeof propertyName !== 'string') {
    throw new Error("Can't validate property. Attribute 'propertyName' is not a string.");
  }
  
  var conditions = this.getConditionsForProperty(propertyName);
  var validator;
  var validated = 0;
  var validateCalls = 0;
  
  if (conditions.length === 0) {
    return true;
  }

  for (var i=0,len=conditions.length; i<len; i++) {
    validator = this.getValidator(conditions[i].validatorName);
    
    if (validator === null) {
      throw new Error("Can't validate. Validator with name '"+conditions[i].validatorName+"' not found.");
    }

    if (validator.async === true) {
      conditions[i].options.callback = (function() {
        validated++;

        if (validated === validateCalls) {
          typeof callback === 'function' && callback.call(this, this.getErrorsOfProperty(propertyName).length === 0);
        }
      }).bind(this);
      
      validateCalls++;
    }

    validator.validate.call(this, propertyName, value, conditions[i].options);
  }
  
  return this.getErrorsOfProperty(propertyName).length === 0;
};

ObjectValidator.prototype.validate = function(obj, callback) {
  if (typeof obj !== 'object') {
    throw new Error("Can't validate. Attribute 'obj' is not an object.");
  }

  callback = callback || null;
  
  this.errors = [];

  var validateCalls = 0;
  var validated = 0;
  
  for (var propertyName in obj) {
    if (! obj.hasOwnProperty(propertyName)) {
      continue;
    }
    
    validateCalls++;
    this.validateProperty(propertyName, obj[propertyName], function() {
      validated++;

      if (validated === validateCalls) {
        typeof callback === 'function' && callback.call(this, this.getErrors().length === 0);
      }
    });
  }
  
  return this.getErrors().length === 0;
};


// Exports

typeof module !== 'undefined' && module.exports = ObjectValidator;
