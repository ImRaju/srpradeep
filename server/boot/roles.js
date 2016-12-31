module.exports = function(app) {
  var User = app.models.User;
  var Person = app.models.Person;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;

  //Define a person role
  Role.registerResolver('user', function(role, context, cb) {
    function reject(err) {
      if(err) {
        return cb(err);
      }
      cb(null, false);
    }
    var userId = context.accessToken.userId;
    if (!userId) {
      return reject(); // do not allow anonymous users
    }
    // check if userId is in person table
    Person.findOne({'where': {'userId': userId}}, function(err, person) {
      if(err || !person) {
        reject(err);
      }
      else{
        cb(null, true);
      }
    });
  });
}