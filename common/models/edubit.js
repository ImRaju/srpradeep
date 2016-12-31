module.exports = function(Edubit) {
  //before save
  Edubit.observe('before save', function(ctx,next){
    if(ctx.currentInstance){
      ctx.data.id = ctx.currentInstance.id;
    }
    next();
  });
  
  //after save
  Edubit.observe('after save', function(ctx,next){
    var ci = ctx.instance;
    //find school is exist or not
    Edubit.app.models.school.findOne({
      'where': {
        'name': ci.school,
        'type': ci.type
      }}, function(err,found){
        if(err) console.log('> err in school findOne ',err);
        if(!found){
          //not found so create it
          console.log('> creating school %s',ci.school);
          Edubit.app.models.school.create({
            'name': ci.school,
            'type': 'default'
          }, function(err,school){
            if(err) console.log('> err in triggering school ',err);
          })
        }
      }
    )
    //find course is exist or not
    Edubit.app.models.course.findOne({
      'where': {
        'name': ci.course,
        'type': ci.type
      }}, function(err,found){
        if(err) console.log('> err in course findOne ',err);
        if(!found){
          //not found so create it
          console.log('> creating course %s',ci.course);
          Edubit.app.models.course.create({
            'name': ci.course,
            'type': ci.type
          }, function(err,course){
            if(err) console.log('> err in triggering course ',err);
          })
        }
      }
    )
    next();
  })
};
