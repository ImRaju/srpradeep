module.exports = function(Veribit) {
  //before save
  Veribit.observe('before save', function(ctx,next){
    if(ctx.currentInstance){
      ctx.data.id = ctx.currentInstance.id;
    }
    next();
  });
};
