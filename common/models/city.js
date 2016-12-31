module.exports = function(City) {
  // register a city detail remote method
  City.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'city details'
    }
  );

  City.prototype.details = function(next){
    City.findById(this.id, function(err,city){
      if(err) next(err);
      else next(null,city);
    });
  };

  // register a city search remote method
  City.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: false},
        {arg: 'type', type: 'string', required: false},
        {arg: 'limit', type: 'number', required: false},
      ],
      returns: {root: true, type: 'object'},
      description: 'city search'
    }
  );

  City.search = function(name,type,limit,next){
    var rule = {};
    if(name) rule['name'] = {'regexp': name};
    if(type) rule['type'] = type;

    City.find({
      'where': rule,
      'limit': limit
    }, function(err,city){
      if(err) next(err);
      else next(null,city);
    });
  };

  City.disableRemoteMethod("create", true);
  City.disableRemoteMethod("upsert", true);
  City.disableRemoteMethod("updateAll", true);
  City.disableRemoteMethod("updateAttributes", false);
  City.disableRemoteMethod("find", true);
  City.disableRemoteMethod("findById", true);
  City.disableRemoteMethod("findOne", true);
  City.disableRemoteMethod("deleteById", true);
  City.disableRemoteMethod("confirm", true);
  City.disableRemoteMethod("count", true);
  City.disableRemoteMethod("exists", true);
  City.disableRemoteMethod('createChangeStream', true);
};
