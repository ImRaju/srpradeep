module.exports = function(Job) {
// register a job detail remote method
  Job.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'job details'
    }
  );

  Job.prototype.details = function(next){
    Job.findById(this.id, function(err,job){
      if(err) next(err);
      else next(null,job);
    });
  };

  // register a job search remote method
  Job.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: true},
      ],
      returns: {root: true, type: 'object'},
      description: 'job search'
    }
  );

  Job.search = function(name,next){
    var scoreService = Job.app.dataSources.scoreService;
    scoreService.create('jobs/lookup',{'key':name},'',function(err,job){
      if(err) next(null,[]);
      else next(null,job);
    });
  };

  Job.disableRemoteMethod("create", true);
  Job.disableRemoteMethod("upsert", true);
  Job.disableRemoteMethod("updateAll", true);
  Job.disableRemoteMethod("updateAttributes", false);
  Job.disableRemoteMethod("find", true);
  Job.disableRemoteMethod("findById", true);
  Job.disableRemoteMethod("findOne", true);
  Job.disableRemoteMethod("deleteById", true);
  Job.disableRemoteMethod("confirm", true);
  Job.disableRemoteMethod("count", true);
  Job.disableRemoteMethod("exists", true);
  Job.disableRemoteMethod('createChangeStream', true);
};
