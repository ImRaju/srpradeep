module.exports = function(Course) {
  // register a course detail remote method
  Course.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'course details'
    }
  );

  Course.prototype.details = function(next){
    Course.findById(this.id, function(err,course){
      if(err) next(err);
      else next(null,course);
    });
  };

  // register a course search remote method
  Course.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: true},
      ],
      returns: {root: true, type: 'object'},
      description: 'course search'
    }
  );

  Course.search = function(name,next){
    var scoreService = Course.app.dataSources.scoreService;
    scoreService.create('courses/lookup',{'key':name},'',function(err,course){
      if(err) next(null,[]);
      else next(null,course);
    });
  };

  Course.disableRemoteMethod("create", true);
  Course.disableRemoteMethod("upsert", true);
  Course.disableRemoteMethod("updateAll", true);
  Course.disableRemoteMethod("updateAttributes", false);
  Course.disableRemoteMethod("find", true);
  Course.disableRemoteMethod("findById", true);
  Course.disableRemoteMethod("findOne", true);
  Course.disableRemoteMethod("deleteById", true);
  Course.disableRemoteMethod("confirm", true);
  Course.disableRemoteMethod("count", true);
  Course.disableRemoteMethod("exists", true);
  Course.disableRemoteMethod('createChangeStream', true);
};
