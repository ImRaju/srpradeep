module.exports = function(Expbit) {
  //before save
  Expbit.observe('before save', function(ctx,next){
    if(ctx.currentInstance){
      ctx.data.id = ctx.currentInstance.id;
    }
    next();
  });
  
  //after save
  Expbit.observe('after save', function(ctx,next){
    var ci = ctx.instance;
    //find business is exist or not
    Expbit.app.models.business.findOne({
      'where': {
        'name': ci.company,
        'type': 'default'
      }}, function(err,found){
        if(err) console.log('> err in business findOne ',err);
        if(!found){
          //not found so create it
          console.log('> creating business %s',ci.company);
          Expbit.app.models.business.create({
            'name': ci.company,
            'type': 'default'
          }, function(err,business){
            if(err) console.log('> err in triggering business ',err);
          })
        }
      }
    )
    //find job is exist or not
    Expbit.app.models.job.findOne({
      'where': {
        'name': ci.job,
        'type': ci.type
      }}, function(err,found){
        if(err) console.log('> err in job findOne ',err);
        if(!found){
          //not found so create it
          console.log('> creating job %s',ci.job);
          Expbit.app.models.job.create({
            'name': ci.job,
            'type': ci.type
          }, function(err,job){
            if(err) console.log('> err in triggering job ',err);
          })
        }
      }
    )
    next();
  })
};
