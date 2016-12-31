module.exports = function(Country) {
  // register a country detail remote method
  Country.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'country details'
    }
  );

  Country.prototype.details = function(next){
    Country.findById(this.id, function(err,country){
      if(err) next(err);
      else next(null,country);
    });
  };

  // register a country search remote method
  Country.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: false},
        {arg: 'code', type: 'string', required: false},
        {arg: 'type', type: 'string', required: false},
        {arg: 'limit', type: 'number', required: false},
      ],
      returns: {root: true, type: 'object'},
      description: 'country search'
    }
  );

  Country.search = function(name,code,type,limit,next){
    var rule = {};
    if(name) rule['name'] = {'regexp': name};
    if(code) rule['code'] = {'regexp': code};
    if(type) rule['type'] = type;

    Country.find({
      'where': rule,
      'limit': limit
    }, function(err,country){
      if(err) next(err);
      else next(null,country);
    });
  };

  Country.disableRemoteMethod("create", true);
  Country.disableRemoteMethod("upsert", true);
  Country.disableRemoteMethod("updateAll", true);
  Country.disableRemoteMethod("updateAttributes", false);
  Country.disableRemoteMethod("find", true);
  Country.disableRemoteMethod("findById", true);
  Country.disableRemoteMethod("findOne", true);
  Country.disableRemoteMethod("deleteById", true);
  Country.disableRemoteMethod("confirm", true);
  Country.disableRemoteMethod("count", true);
  Country.disableRemoteMethod("exists", true);
  Country.disableRemoteMethod('createChangeStream', true);
};
