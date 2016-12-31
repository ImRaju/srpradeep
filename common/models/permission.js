module.exports = function(Permission) {
// register a permission detail remote method
  Permission.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'permission details'
    }
  );

  Permission.prototype.details = function(next){
    Permission.findById(this.id, function(err,permission){
      if(err) next(err);
      else next(null,permission);
    });
  };

  // register a permission search remote method
  Permission.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: false},
        {arg: 'type', type: 'string', required: false},
        {arg: 'limit', type: 'number', required: false},
      ],
      returns: {root: true, type: 'object'},
      description: 'permission search'
    }
  );

  Permission.search = function(name,type,limit,next){
    var rule = {};
    if(name) rule['name'] = {'regexp': name};
    if(type) rule['type'] = type;

    Permission.find({
      'where': rule,
      'limit': limit
    }, function(err,permission){
      if(err) next(err);
      else next(null,permission);
    });
  };

  Permission.disableRemoteMethod("create", true);
  Permission.disableRemoteMethod("upsert", true);
  Permission.disableRemoteMethod("updateAll", true);
  Permission.disableRemoteMethod("updateAttributes", false);
  Permission.disableRemoteMethod("find", true);
  Permission.disableRemoteMethod("findById", true);
  Permission.disableRemoteMethod("findOne", true);
  Permission.disableRemoteMethod("deleteById", true);
  Permission.disableRemoteMethod("confirm", true);
  Permission.disableRemoteMethod("count", true);
  Permission.disableRemoteMethod("exists", true);
  Permission.disableRemoteMethod('createChangeStream', true);
};
