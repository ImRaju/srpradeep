module.exports = function(Verification) {
// register a verification detail remote method
  Verification.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'verification details'
    }
  );

  Verification.prototype.details = function(next){
    Verification.findById(this.id, function(err,verification){
      if(err) next(err);
      else next(null,verification);
    });
  };

  // register a verification search remote method
  Verification.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: false},
        {arg: 'type', type: 'string', required: false},
        {arg: 'limit', type: 'number', required: false},
      ],
      returns: {root: true, type: 'object'},
      description: 'verification search'
    }
  );

  Verification.search = function(name,type,limit,next){
    var rule = {};
    if(name) rule['name'] = {'regexp': name};
    if(type) rule['type'] = type;

    Verification.find({
      'where': rule,
      'limit': limit
    }, function(err,verification){
      if(err) next(err);
      else next(null,verification);
    });
  };

  Verification.disableRemoteMethod("create", true);
  Verification.disableRemoteMethod("upsert", true);
  Verification.disableRemoteMethod("updateAll", true);
  Verification.disableRemoteMethod("updateAttributes", false);
  Verification.disableRemoteMethod("find", true);
  Verification.disableRemoteMethod("findById", true);
  Verification.disableRemoteMethod("findOne", true);
  Verification.disableRemoteMethod("deleteById", true);
  Verification.disableRemoteMethod("confirm", true);
  Verification.disableRemoteMethod("count", true);
  Verification.disableRemoteMethod("exists", true);
  Verification.disableRemoteMethod('createChangeStream', true);
};
