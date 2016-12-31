module.exports = function(Contactbit) {
  //before save
  Contactbit.observe('before save', function(ctx,next){
    if(ctx.currentInstance){
      ctx.data.id = ctx.currentInstance.id;
    }
    next();
  });
};
