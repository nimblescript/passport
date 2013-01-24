var actions = require('./actions')

module.exports = function authenticate(name, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  
  
  return function authenticate(request) {
    console.log('hapi authenticate');
    console.log('*** request');
    console.dir(request);
    console.log('*** reply');
    console.dir(request.reply);
    
    var passport = this;
    
    var delegate = {};
    delegate.success = function(user, info) {
      console.log('hapi delegate success');
    }
    
    delegate.fail = function(challenge, status) {
      console.log('hapi delegate fail');
    }
    
    delegate.redirect = function(url, status) {
      console.log('hapi delegate redirect');
      
      request.reply.redirect(url).send();
    }
    
    delegate.pass = function() {
      console.log('hapi delegate pass');
    }
    
    delegate.error = function(err) {
      console.log('hapi delegate error');
    }
    
    
    // Get the strategy, which will be used as prototype from which to create
    // a new instance.  Action functions will then be bound to the strategy
    // within the context of the HTTP request/response pair.  Action functions
    // simply delegate back here, so that they can be processed in a manner
    // compatible with hapi.
    var prototype = passport._strategy(name);
    if (!prototype) { return next(new Error('no strategy registered under name: ' + layer)); }
    
    var strategy = Object.create(prototype);
    augment(strategy, actions, delegate);
    
    strategy.authenticate(request, options);
  }
}


function augment(strategy, actions, ctx) {
  for (var method in actions) {
    strategy[method] = actions[method].bind(ctx);
  }
}
