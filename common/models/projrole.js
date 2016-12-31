module.exports = function(Projrole) {
// register a projrole detail remote method
  Projrole.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'project role details'
    }
  );

  Projrole.prototype.details = function(next){
    Projrole.findById(this.id, function(err,projrole){
      if(err) next(err);
      else next(null,projrole);
    });
  };

  // register a projrole search remote method
  Projrole.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: false},
        {arg: 'type', type: 'string', required: false},
        {arg: 'limit', type: 'number', required: false},
      ],
      returns: {root: true, type: 'object'},
      description: 'project role search'
    }
  );

  Projrole.search = function(name,type,limit,next){
    var rule = {};
    if(name) rule['name'] = {'regexp': name};
    if(type) rule['type'] = type;

    Projrole.find({
      'where': rule,
      'limit': limit
    }, function(err,projrole){
      if(err) next(err);
      else next(null,projrole);
    });
  };

  Projrole.disableRemoteMethod("create", true);
  Projrole.disableRemoteMethod("upsert", true);
  Projrole.disableRemoteMethod("updateAll", true);
  Projrole.disableRemoteMethod("updateAttributes", false);
  Projrole.disableRemoteMethod("find", true);
  Projrole.disableRemoteMethod("findById", true);
  Projrole.disableRemoteMethod("findOne", true);
  Projrole.disableRemoteMethod("deleteById", true);
  Projrole.disableRemoteMethod("confirm", true);
  Projrole.disableRemoteMethod("count", true);
  Projrole.disableRemoteMethod("exists", true);
  Projrole.disableRemoteMethod('createChangeStream', true);
};
