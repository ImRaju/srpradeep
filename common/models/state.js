module.exports = function(State) {
// register a state detail remote method
  State.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'state details'
    }
  );

  State.prototype.details = function(next){
    State.findById(this.id, function(err,state){
      if(err) next(err);
      else next(null,state);
    });
  };

  // register a state search remote method
  State.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: false},
        {arg: 'type', type: 'string', required: false},
        {arg: 'limit', type: 'number', required: false},
      ],
      returns: {root: true, type: 'object'},
      description: 'state search'
    }
  );

  State.search = function(name,type,limit,next){
    var rule = {};
    if(name) rule['name'] = {'regexp': name};
    if(type) rule['type'] = type;

    State.find({
      'where': rule,
      'limit': limit
    }, function(err,state){
      if(err) next(err);
      else next(null,state);
    });
  };

  State.disableRemoteMethod("create", true);
  State.disableRemoteMethod("upsert", true);
  State.disableRemoteMethod("updateAll", true);
  State.disableRemoteMethod("updateAttributes", false);
  State.disableRemoteMethod("find", true);
  State.disableRemoteMethod("findById", true);
  State.disableRemoteMethod("findOne", true);
  State.disableRemoteMethod("deleteById", true);
  State.disableRemoteMethod("confirm", true);
  State.disableRemoteMethod("count", true);
  State.disableRemoteMethod("exists", true);
  State.disableRemoteMethod('createChangeStream', true);
};
