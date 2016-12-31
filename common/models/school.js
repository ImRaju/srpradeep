module.exports = function(School) {
// register a school detail remote method
  School.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'school details'
    }
  );

  School.prototype.details = function(next){
    School.findById(this.id, function(err,school){
      if(err) next(err);
      else next(null,school);
    });
  };

  // register a school search remote method
  School.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'title', type: 'string', required: true},
      ],
      returns: {root: true, type: 'object'},
      description: 'school search'
    }
  );

  School.search = function(title,next){
    var sObj = [];
    var scoreService = School.app.dataSources.scoreService;
    scoreService.create('schools/lookup',{'key':title},'',function(err,school){
      if(err) next(null,[]);
      else {
        school.forEach(function(s){
          var title = s.split('|')[0].trim();
          var location = s.split('|')[1].trim();
          sObj.push({title,location});
        })
        next(null,sObj);
      }
    });
  };

  School.disableRemoteMethod("create", true);
  School.disableRemoteMethod("upsert", true);
  School.disableRemoteMethod("updateAll", true);
  School.disableRemoteMethod("updateAttributes", false);
  School.disableRemoteMethod("find", true);
  School.disableRemoteMethod("findById", true);
  School.disableRemoteMethod("findOne", true);
  School.disableRemoteMethod("deleteById", true);
  School.disableRemoteMethod("confirm", true);
  School.disableRemoteMethod("count", true);
  School.disableRemoteMethod("exists", true);
  School.disableRemoteMethod('createChangeStream', true);
};
