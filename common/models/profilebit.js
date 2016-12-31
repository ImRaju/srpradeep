module.exports = function(Profilebit) {
/*//before save
  Profilebit.observe('before save', function(ctx,next){
    if(ctx.isNewInstance && ctx.instance.type == 'current'){
      var meta = ctx.instance.meta || {};
      meta.accessId = ctx.instance.personId.toString();
      meta.privacy = 'private';
      ctx.instance['meta'] = meta;
    } 
    next();
  });*/
};
