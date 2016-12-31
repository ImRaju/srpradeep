module.exports = function (app) {
  //send password reset link when requested
  app.models.User.on('resetPasswordRequest', function (info) {
    var emailConfig = app.get('emailConfig');
    var userId;
    info.accessToken.user(function (err, user) {
      if (err) next(err);
      userId = user.id;
      var html = '<h1>Reset Your Password</h1></h1>Click <a href="' + app.get('webResetPassPath') + '?access_token=' +
        info.accessToken.id + '&userId=' + userId + '">here</a> to reset your password';

      app.models.Email.send({
        to: info.email,
        subject: 'Password reset',
        from: emailConfig.from,
        html: html
      }, function (err) {
        if (err) return console.log('> error sending password reset email');
        else console.log('> sending password reset email to:', info.email);
      });
    });
  });
};
