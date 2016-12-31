module.exports = function(Skill) {
// register a skill detail remote method
  Skill.remoteMethod(
    'details',
    {
      http: {path: '/details', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'skill details'
    }
  );

  Skill.prototype.details = function(next){
    Skill.findById(this.id, function(err,skill){
      if(err) next(err);
      else next(null,skill);
    });
  };

  // register a skill search remote method
  Skill.remoteMethod(
    'search',
    {
      http: {path: '/search', verb: 'get'},
      accepts: [
        {arg: 'name', type: 'string', required: true},
      ],
      returns: {root: true, type: 'object'},
      description: 'skill search'
    }
  );

  Skill.search = function(name,next){
    var scoreService = Skill.app.dataSources.scoreService;
    scoreService.create('skills/lookup',{'key':name},'',function(err,skill){
      if(err) next(null,[]);
      else next(null,skill);
    });
  };

  Skill.disableRemoteMethod("create", true);
  Skill.disableRemoteMethod("upsert", true);
  Skill.disableRemoteMethod("updateAll", true);
  Skill.disableRemoteMethod("updateAttributes", false);
  Skill.disableRemoteMethod("find", true);
  Skill.disableRemoteMethod("findById", true);
  Skill.disableRemoteMethod("findOne", true);
  Skill.disableRemoteMethod("deleteById", true);
  Skill.disableRemoteMethod("confirm", true);
  Skill.disableRemoteMethod("count", true);
  Skill.disableRemoteMethod("exists", true);
  Skill.disableRemoteMethod('createChangeStream', true);
};
