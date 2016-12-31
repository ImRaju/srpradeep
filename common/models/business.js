module.exports = function(Business) {
  // register a business detail remote method
  Business.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'business details'
    }
  );

  Business.prototype.details = function(next){
    Business.findById(this.id, function(err,business){
      if(err) next(err);
      else next(null,business);
    });
  };

  // register a business search remote method
  Business.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: true}
      ],
      returns: {root: true, type: 'object'},
      description: 'business search'
    }
  );

  Business.search = function(name,next){
    var bObj = [];
    var scoreService = Business.app.dataSources.scoreService;
    scoreService.create('companies/lookup',{'key':name},'',function(err,business){
      if(err) next(null,[]);
      else {
        business.forEach(function(biz){
          var splittedObj = biz.split('|');
          var title = splittedObj[0].trim();
          var restObj = splittedObj[1].trim();
          var reSplitObj = restObj.split(';');
          var lasElem = reSplitObj[reSplitObj.length-1].trim();

          if(lasElem.indexOf('employees') !== -1){
            var size = lasElem;
            var industry = reSplitObj.slice(0,reSplitObj.length-1);
            bObj.push({title,industry,size});
          }else{
            var industry = reSplitObj;
            bObj.push({title,industry,size});
          }
        })
        next(null,bObj);
      }
    });
    /*var rule = {};
    if(name) rule['name'] = {'regexp': name};
    if(industry) rule['industry'] = {'regexp': industry};
    if(type) rule['type'] = type;

    Business.find({
      'where': rule,
      'limit': limit
    }, function(err,business){
      if(err) next(err);
      else next(null,business);
    });*/
  };

  Business.disableRemoteMethod("create", true);
  Business.disableRemoteMethod("upsert", true);
  Business.disableRemoteMethod("updateAll", true);
  Business.disableRemoteMethod("updateAttributes", false);
  Business.disableRemoteMethod("find", true);
  Business.disableRemoteMethod("findById", true);
  Business.disableRemoteMethod("findOne", true);
  Business.disableRemoteMethod("deleteById", true);
  Business.disableRemoteMethod("confirm", true);
  Business.disableRemoteMethod("count", true);
  Business.disableRemoteMethod("exists", true);
  Business.disableRemoteMethod('createChangeStream', true);
};
