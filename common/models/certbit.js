module.exports = function(Certbit) {
  //before save
  Certbit.observe('before save', function(ctx,next){
    if(ctx.currentInstance){
      ctx.data.id = ctx.currentInstance.id;
    }
    next();
  });

  //after save
  Certbit.observe('after save', function(ctx,next){
    var ci = ctx.instance;
    //find certificate is exist or not
    Certbit.app.models.certificate.findOne({
      'where': {
        'name': ci.name,
        'type': ci.type
      }}, function(err,found){
        if(err) console.log('> err in certificates findOne ',err);
        if(!found){
          //not found so create it
          console.log('> creating certificate %s',ci.name);
          Certbit.app.models.certificate.create({
            'name': ci.name,
            'type': ci.type
          }, function(err,certificate){
            if(err) console.log('> err in triggering certificates',err);
          })
        }
      }
    )
    next();
  });
};
