module.exports = function(Certificate) {
  // register a certificate detail remote method
  Certificate.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'certificate details'
    }
  );

  Certificate.prototype.details = function(next){
    Certificate.findById(this.id, function(err,certificate){
      if(err) next(err);
      else next(null,certificate);
    });
  };

  // register a certificate search remote method
  Certificate.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: false},
        {arg: 'type', type: 'string', required: false},
        {arg: 'limit', type: 'number', required: false},
      ],
      returns: {root: true, type: 'object'},
      description: 'certificate search'
    }
  );

  Certificate.search = function(name,type,limit,next){
    var rule = {};
    if(name) rule['name'] = {'regexp': name};
    if(type) rule['type'] = type;

    Certificate.find({
      'where': rule,
      'limit': limit
    }, function(err,certificate){
      if(err) next(err);
      else next(null,certificate);
    });
  };

  Certificate.disableRemoteMethod("create", true);
  Certificate.disableRemoteMethod("upsert", true);
  Certificate.disableRemoteMethod("updateAll", true);
  Certificate.disableRemoteMethod("updateAttributes", false);
  Certificate.disableRemoteMethod("find", true);
  Certificate.disableRemoteMethod("findById", true);
  Certificate.disableRemoteMethod("findOne", true);
  Certificate.disableRemoteMethod("deleteById", true);
  Certificate.disableRemoteMethod("confirm", true);
  Certificate.disableRemoteMethod("count", true);
  Certificate.disableRemoteMethod("exists", true);
  Certificate.disableRemoteMethod('createChangeStream', true);
};
