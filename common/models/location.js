module.exports = function(Location) {
// register a location detail remote method
  Location.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'location details'
    }
  );

  Location.prototype.details = function(next){
    Location.findById(this.id, function(err,location){
      if(err) next(err);
      else next(null,location);
    });
  };

  // register a location search remote method
  Location.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'state', type: 'string', required: false},
        {arg: 'city', type: 'string', required: false},
        {arg: 'country', type: 'string', required: false},
        {arg: 'limit', type: 'number', required: false},
      ],
      returns: {root: true, type: 'object'},
      description: 'location search'
    }
  );

  Location.search = function(state,city,country,limit,next){
    var rule = {};
    if(state) rule['state'] = {'regexp': state};
    if(city) rule['city'] = {'regexp': city};
    if(country) rule['country'] = {'regexp': country};
    
    Location.find({
      'where': rule,
      'limit': limit
    }, function(err,location){
      if(err) next(err);
      else next(null,location);
    });
  };

  Location.disableRemoteMethod("create", true);
  Location.disableRemoteMethod("upsert", true);
  Location.disableRemoteMethod("updateAll", true);
  Location.disableRemoteMethod("updateAttributes", false);
  Location.disableRemoteMethod("find", true);
  Location.disableRemoteMethod("findById", true);
  Location.disableRemoteMethod("findOne", true);
  Location.disableRemoteMethod("deleteById", true);
  Location.disableRemoteMethod("confirm", true);
  Location.disableRemoteMethod("count", true);
  Location.disableRemoteMethod("exists", true);
  Location.disableRemoteMethod('createChangeStream', true);
};
