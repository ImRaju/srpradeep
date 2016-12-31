module.exports = function(Permsbit) {
  //before save
  Permsbit.observe('before save', function(ctx,next){
    if(ctx.currentInstance){
      ctx.data.id = ctx.currentInstance.id;
    }
    next();
  });
};
