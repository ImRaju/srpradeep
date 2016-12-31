module.exports = function(Projbit) {
  //before save
  Projbit.observe('before save', function(ctx,next){
    if(ctx.currentInstance){
      ctx.data.id = ctx.currentInstance.id;
    }
    next();
  });

  //after save
  Projbit.observe('after save', function(ctx,next){
    var ci = ctx.instance;
    //find project role is exist or not
    Projbit.app.models.projrole.findOne({
      'where': {
        'name': ci.role,
        'type': 'default'
      }}, function(err,found){
        if(err) console.log('> err in projrole findOne ',err);
        if(!found){
          //not found so create it
          console.log('> creating projrole %s',ci.role);
          Projbit.app.models.projrole.create({
            'name': ci.role,
            'type': 'default'
          }, function(err,projrole){
            if(err) console.log('> err in triggering projrole ',err);
          })
        }
      }
    )
    next();
  })
};
