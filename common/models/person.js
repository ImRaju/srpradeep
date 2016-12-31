var pdf = require('html-pdf');
var fs = require('fs');
var path = require('path');

module.exports = function(Person) {
  //email verification after signup
  Person.afterRemote('signup', function(context, person, next) {
    var emailConfig = Person.app.get('emailConfig');
    var options = {
      type: emailConfig.type,
      to: person.user.email,
      from: emailConfig.from,
      subject: emailConfig.subject,
      template: path.resolve(__dirname, '../../server/emailviews/verify.ejs'),
      redirect: emailConfig.redirect,
      user: person.user,
      //todo: hardcoding
      verifyHref: Person.app.get('assetPath')+'/Users/confirm?uid='+person.user.id+'&redirect='+emailConfig.redirect
    };

    person.user.verify(options, function(err, response) {
      if (err) next(err);
      console.log('> verification email sent');
    });
    next();
  });

  // add contacts
  Person.remoteMethod(
    'setContacts',
    {
      http: {path: '/setContacts', verb: 'post'},
      accepts:[
        { arg: 'contacts', type: ['contactbit'], http: { source: 'body' }}
      ],
      isStatic: false,
      returns: {arg: "data", type: "contactbit", root: true},
      description: 'set contacts'
    }
  );

  Person.prototype.setContacts = function(contacts, next){
    Person.findById(this.id, function(err,person){
      if(err) next(err);
      else{
        if(contacts[0].contacts) //only for Front End response
          contacts = contacts[0].contacts;
        person.updateAttributes({
          'contacts': contacts
        }, function(err,contacts){
          if(err) next(err);
          else next(null,contacts);
        });
        /*var promises = contacts.map(function(contact){
          contact.unsetAttribute('id');
          return person.contact.create(contact).then(function(done){
            if(err) throw err;
            else return done;
          },function(err){
            throw err;
          });
        });
        Promise.all(promises).then(function(response){
          return next(null,response);
        },function(err){
          return next(err);
        });*/
      }
    });
  }

  // add permissions
  Person.remoteMethod(
    'setPermissions',
    {
      http: {path: '/setPermissions', verb: 'post'},
      accepts:[
        { arg: 'permissions', type: ['permsbit'], http: { source: 'body' }}
      ],
      isStatic: false,
      returns: {arg: "data", type: "permsbit", root: true},
      description: 'set permissions'
    }
  );

  Person.prototype.setPermissions = function(permissions, next){
    Person.findById(this.id, function(err,person){
      if(err) next(err);
      else{
        if(permissions[0].permissions) //only for Front End response
          permissions = permissions[0].permissions;
        person.updateAttributes({
          'permissions': permissions
        }, function(err,permissions){
          if(err) next(err);
          else next(null,permissions);
        });
      }
    });
  }

  // add verification
  Person.remoteMethod(
    'setVerifications',
    {
      http: {path: '/setVerifications', verb: 'post'},
      accepts:[
        { arg: 'verifications', type: ['veribit'], http: { source: 'body' }}
      ],
      isStatic: false,
      returns: {arg: "data", type: "veribit", root: true},
      description: 'set verifications'
    }
  );

  Person.prototype.setVerifications = function(verifications, next){
    Person.findById(this.id, function(err,person){
      if(err) next(err);
      else{
        if(verifications[0].verifications) //only for Front End response
          verifications = verifications[0].verifications;
        person.updateAttributes({
          'verifications': verifications
        }, function(err,verifications){
          if(err) next(err);
          else next(null,verifications);
        });
      }
    });
  }

  // user signup method
  Person.remoteMethod(
    'signup',
    {
      http: {path: '/signup', verb: 'post'},
      accepts: [
        {arg: 'fname', type: 'string', required: true},
        {arg: 'lname', type: 'string', required: true},
        {arg: 'email', type: 'string', required: true},
        {arg: 'password', type: 'string', required: true},
      ],
      returns: {root: true, type: 'object'},
      description: 'user signup'
    }
  );

  Person.signup = function(fname,lname,email,password,next){
    //first create a user
    Person.app.models.User.create({
      'username': email,
      'email': email,
      'password': password
    }, function(err,user){
      if(err) next(err);
      else if(user){
        //if user created then create person
        Person.create({
          'fname': fname,
          'lname': lname,
          'userId': user.id
        }, function(err,person){
          if(err) next(err);
          else {
            var res = {};
            res.person = person;
            res.user = user;
            next(null,res);
          }
        });
      }
    });
  }

  //signin method for  user
  Person.remoteMethod(
    'signin',
    {
      http: {path: '/signin', verb: 'post'},
      accepts: [
        {arg: 'email', type: 'string', required: true},
        {arg: 'password', type: 'string', required: true},
      ],
      returns: {root: true, type: 'object'},
      description: 'signin for user'
    }
  );

  Person.signin = function(email,password,next){
    var res = {};
    //signin user from user.login
    Person.app.models.User.login({
      'username': email,
      'email': email,
      'password': password
    }, function(err,loggedIn){
      if(err) next(err);
      else if(loggedIn){
        res = loggedIn;
        res['userType'] = 'people';
        //find people
        Person.findOne({
          'where': {'userId': loggedIn.userId },
        }, function(err,person){
          if(err) next(err);
          else if(person){
            res['profile'] = person;
            next(null,res);
          }else{
            var err = new Error('person not found');
            err.statusCode = 404;
            next(err);
          }
        })
      }
    })
  }

  // user signup method
  Person.remoteMethod(
    'linkedProfile',
    {
      http: {path: '/linkedProfile', verb: 'get'},
      accepts: [
        {arg: 'provider', type: 'string', required: true, description: 'google, facebook & linkedin'},
      ],
      returns: {root: true, type: 'object'},
      description: 'user linked profile'
    }
  );

  Person.linkedProfile = function(provider, next){
    var loopback = require('loopback');
    var userId = loopback.getCurrentContext().active.http.req.accessToken.userId;
    Person.app.models.UserCredential.findOne({
      'where':{'userId': userId, 'provider': provider}
    }, function(err,user){
      if(err) next(err);
      else if(user){
        if(user.provider == 'google'){
          Person.glink(user.profile._json, function(err,credential){
            if(err) next(err);
            else next(null,credential);
            
          })
        }else if(user.provider == 'facebook'){
          Person.fblink(user.profile._json, function(err,credential){
            if(err) next(err);
            else next(null,credential);
          })
        }else if(user.provider == 'linkedin'){
          Person.inlink(user.profile._json, function(err,credential){
            if(err) next(err);
            else next(null,credential);
          })
        }
      }else{
        var err = new Error('account not linked with '+provider);
        err.statusCode = 404;
        next(err)
      }
    })
  }

  var gProfileObj = {'name':'name','emails':'email','birthday':'dob','gender':'gender','image':'image','language':'language'};
  var gSchoolObj = {'name':'school','title':'title','startDate':'from','endDate': 'upto','primary':'primary'};
  var gExpObj = {'name':'company','title':'title','startDate':'from','endDate':'upto','primary':'primary'};
  var fbProfileObj = {'first_name':'fname','last_name':'lname','email':'email','gender':'gender','picture':'image'}
  var inProfileObj = {'firstName':'fname','lastName':'lname','emailAddress':'email','headline':'title','pictureUrl':'image','language':'language'};
  //var inExpObj = {'name':'company','title':'title','startDate':'from','endDate':'upto','primary':'primary'};
  Person.glink = function(rawdata,next){
    var profile = {};
    var schools = [];
    var companies = [];
    var credential = {};
    for(key in gProfileObj){
      if(rawdata[key] && typeof rawdata[key]!= 'object'){
        profile[gProfileObj[key]] = rawdata[key];
      }
      if(key == 'image' && rawdata[key])
        profile[gProfileObj[key]] = rawdata[key]['url'];
      if(key == 'emails' && rawdata[key])
        profile[gProfileObj[key]] = rawdata[key][0]['value'];
      if(key == 'name' && rawdata[key]){
        profile['fname'] = rawdata[key]['givenName'];
        profile['lname'] = rawdata[key]['familyName'];
      }
    }

    if(rawdata.organizations.length){
      rawdata.organizations.forEach(function(org){
        if(org.type == 'school'){
          var sObj = {};
          for(key in gSchoolObj){
            if(org[key]){
              sObj[gSchoolObj[key]] = org[key];
              //console.log(sObj);
            }
          }
          schools.push(sObj); 
        }
        if(org.type == 'work'){
          var eObj = {};
          for(key in gExpObj){
            if(org[key]){
              eObj[gExpObj[key]] = org[key];
              //console.log(eObj);
            }
          }
          companies.push(eObj);
        }
      })
    }
    //set credential object
    if(profile) credential['profile'] = profile;
    if(schools.length) credential['education'] = schools;
    if(companies.length) credential['experience'] = companies;
    if(rawdata.placesLived) credential['address'] = rawdata.placesLived;
    next(null,credential);
  }

  Person.fblink = function(rawdata,next){
    var profile = {};
    var credential = {};
    for(key in fbProfileObj){
      if(rawdata[key] && typeof rawdata[key]!= 'object'){
        profile[fbProfileObj[key]] = rawdata[key];
      }
      if(key == 'picture' && rawdata[key])
        profile[fbProfileObj[key]] = rawdata[key]['data']['url'];
    }
    //set credential object
    if(profile) credential['profile'] = profile;
    next(null,credential);
  }

  Person.inlink = function(rawdata,next){
    var profile = {};
    var companies = [];
    var credential = {};
    for(key in inProfileObj){
      if(rawdata[key] && typeof rawdata[key]!= 'object'){
        profile[inProfileObj[key]] = rawdata[key];
      }
    }
    if(rawdata.positions && rawdata.positions.values.length){
      rawdata.positions.values.forEach(function(exp){
        var eObj = {};
        if(exp.company && exp.company.name)
          eObj['name'] = exp.company.name;
        if(exp.title)
          eObj['title'] = exp.title;
        if(exp.startDate){
          var d = new Date(99,5,24)
          eObj['from'] = new Date(exp.startDate.year,exp.startDate.month);
        }
        if(exp.isCurrent)
          eObj['isCurrent'] = exp.isCurrent;
        companies.push(eObj);
      })
    }
    //set credential object
    if(profile) credential['profile'] = profile;
    if(companies.length) credential['experience'] = companies;
    if(rawdata.location){
      credential['address'] = [{'value': rawdata.location.name}];
    }
    next(null,credential);
  }

  //profile compare method
  Person.remoteMethod(
    'compareProfile',
    {
      http: {path: '/compareProfile', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'signin for user'
    }
  )

  Person.prototype.compareProfile = function(next){
    var profile = {};
    var cprofile = [];
    //TODO: add some logic to compare profile
    Person.findById(this.id,{'include':['education','experience','project']}, function(err,person){
      if(err) next(err);
      else {
        profile['education'] = {'higherEdu': 'Graduate', 'project': 5};
        profile['experience'] = {'higherExp': '5 years', 'salary': '10 lac per year', 'position': 'analyst'};
        cprofile.push(profile);
        next(null, cprofile);
      }
    })
  }

  //method for export resume
  Person.remoteMethod(
    'exportResume',
    {
      http: {path: '/exportResume', verb: 'get'},
      isStatic: false,
      accepts: [
        {arg: 'template', type: 'number', required: true},
        {arg: 'onlyPreview', type: 'boolean', required: true},
        {arg: 'email', type: 'string', required: false},
        {arg: 'res', type: 'object', 'http': {source: 'res'}}
      ],
      returns: {root: true, type: 'object'},
      description: 'export resume'
    }
  )

  Person.prototype.exportResume = function(tplnum,onlyPreview,email,res,next){
    var personId = this.id
    Person.findById(this.id,{
      'include': ['certificate','education','experience','profile','project','awards','user']
    }, function(err,person){
      if(err) next(err);
      else{
        var info ={};
        info['assetPath'] =  Person.app.get('assetPath');
        info['cvdir'] = Person.app.get('cvTempDirName')+tplnum;
        info['name'] = person.fname+" "+person.lname;
        info['pic'] = person.pic;

        if(person.contacts && person.contacts.length){
          var cObj = {};
          person.contacts.forEach(function(contact){
            if(contact.category == 'Phone') cObj['phone'] = contact.contact;
            if(contact.category == 'Email') cObj['email'] = contact.contact;
            if(contact.category == 'Skype') cObj['skype'] = contact.contact;
            if(contact.category == 'Twitter') cObj['tw'] = contact.contact;
            if(contact.category == 'Facebook') cObj['fb'] = contact.contact;
            if(contact.category == 'Github') cObj['git'] = contact.contact;
          });
          info['contacts'] = cObj;
        }
        
        person.profile().forEach(function(profile){
          if(profile.type == 'current'){
            if(profile.skills && profile.skills.length) info['skills'] = profile.skills;
            if(profile.language && profile.language.length) info['language'] = profile.language;
            if(profile.tagline && profile.tagline.length) info['tagline'] = profile.tagline;
            if(profile.summary && profile.summary.length) info['summary'] = profile.summary;
            if(profile.meta){
              var mObj = {};
              if(profile.meta.books && profile.meta.books.length)
                mObj['Books'] = profile.meta.books;
              if(profile.meta.passion && profile.meta.passion.length)
                mObj['Passion'] = profile.meta.passion;
              if(profile.meta.strength && profile.meta.strength.length)
                mObj['Strength'] = profile.meta.strength; 
              if(Object.keys(mObj).length != 0) 
                info['meta'] = mObj;            
            }
            if(profile.routine) info['routine'] = profile.routine;
          }
        });

        if(person.project().length) info['project'] = person.project();
        
        if(person.education().length) info['education'] = person.education();

        if(person.experience().length) {
          info['experience'] = person.experience();
          if(person.experience()[0].title)
            info['title'] = person.experience()[0].title;
        }

        var cvTempDirPath = Person.app.get('cvTempDirPath')+tplnum;
        res.render(cvTempDirPath, {
          info: info
        }, function (err, HTML) {
          if(err) next(err);
          var file; var path;
          if(onlyPreview){
            file=Person.app.datasources.storage.settings.root+'/rpreview/'+personId+'.png';
            path='http://'+Person.app.get('assetPath')+'/containers/rpreview/download/'+personId+'.png?ts='+Date.now();
          }else{
            file=Person.app.datasources.storage.settings.root+'/media'+personId+'/'+tplnum+'.pdf';
            path='http://'+Person.app.get('assetPath')+'/containers/media'+personId+'/download/'+tplnum+'.pdf';
          }
            //export options for pdf
            var options = {
              base: Person.app.get('cvTplBase')+tplnum+"/",
              filename: file,
              format: 'A4',
              "footer": {
                "height": "10mm"
              },
              "header": {
                "height": "0mm"
              }
            };
            //create pdf in storage directory
            pdf.create(HTML, options).toFile(function (err, result) {
              if (err) next(err);
              else{
                if(email){
                  //mail resume
                  console.log("email="+person.user.email);
                  Person.app.models.Email.send({
                    to: person.user().email,
                    subject: 'Your Resume',
                    text: 'Thanks for using skill register...',
                    from: 'SkillRegister <contact@skillregister.in>',
                    /*html: 'my <em>html</em>',*/
                    attachments: [
                      {
                        'filename': 'Resume.yoga.pdf',
                        'path': result.filename
                      }
                    ]
                  }, function(err) {
                    if(err) {
                      console.log('error sending email...! ',err);
                      next(err);
                    }
                    else console.log('email successfully sent! to:'+person.user.email);
                    next(null);
                  });
                }else{
                  //res.send(HTML);
                  var respath = path;
                  console.log("dispatching resumefile "+ path);
                  next(null,{"respath":respath})
                }
              }
            })
        })
      }
    })
  }

  //social linking from android app
  Person.remoteMethod(
    'linkFromApp',
    {
      http: {path: '/linkFromApp', verb: 'post'},
      accepts: [
        {arg: 'provider', type: 'string', required: true, description: 'google, facebook & linkedin'},
        {arg: 'authScheme', type: 'string', required: true},
        {arg: 'externalId', type: 'string', required: true},
        {arg: 'jsondata', type: 'object', required: true},
      ],
      returns: {root: true, type: 'object'},
      description: 'link social profile from app'
    }
  );

  Person.linkFromApp = function(provider,authScheme,externalId,jsondata,next){
    var loopback = require('loopback');
    var userId = loopback.getCurrentContext().active.http.req.accessToken.userId;
    var profile = {};
    profile['_json'] = jsondata;
    Person.app.models.UserCredential.findOrCreate(
    {
      'where': {'provider': provider, 'userId': userId}
    },
    {
      'provider': provider,
      'authScheme': authScheme,
      'externalId': externalId,
      'profile': profile,
      'userId': userId
    }, function(err,linked){
      if(err) next(err);
      else next(null,linked); 
    })
  }

  //person shared profile
  Person.remoteMethod(
    'sharedProfile',
    {
      http: {path: '/sharedProfile', verb: 'post'},
      accepts: [
        {arg: 'accessId', type: 'string', required: true},
        {arg: 'accessCode', type: 'string', required: false},
      ],
      returns: {root: true, type: 'object'},
      description: 'access shared profile'
    }
  );

  Person.sharedProfile = function(accessId,accessCode,next){
    //find person person using accessId
    Person.findOne({
      'where': {'account.accessId':accessId}
    }, function(err,person){
      if(err) next(err);
      else if(person){
        if(person.account.privacy == 'public'){
          Person.sharedProfileData(person.id,'public', function(err,response){
            if(err) next(err);
            else next(null,response)
          })
        }else if(person.account.privacy == 'protected'){
          if(accessCode && person.account.accessCode && accessCode == person.account.accessCode){
            Person.sharedProfileData(person.id,'protected', function(err,response){
              if(err) next(err);
              else next(null,response)
            })
          }else{
            var err = new Error('accessCode is not valid');
            err.statusCode = 400;
            next(err);
          }
        }else{
          var err = new Error("can't access private profile");
          err.statusCode = 404;
          next(err);
        }
      }else{
        var err = new Error('user not found');
        err.statusCode = 404;
        next(err);
      }
    })
  }

  Person.sharedProfileData = function(id,type,next){
    var fields = {'permissions':false,'verifications':false};
    var properties = "";
    var pubProperty = [];
    var proProperty = [];
    Person.findById(id,/*{'include': ['education','experience','profile','project','certificate','awards','publications']},*/function(err,person){
      if(err) next(err);
      else if(person.permissions){
        person.permissions.forEach(function(perms){
          if(perms.privacy =='public')
            pubProperty.push(perms.code);
          if(perms.privacy == 'protected'|| perms.privacy == 'public')
            proProperty.push(perms.code);
        })
        //set field on the basis of privacy
        if(type == 'public') properties = pubProperty;
        else if(type == 'protected') properties = proProperty;
        //NOTE: remove extra query

        var index = properties.indexOf('contacts');
        if(index!=-1){
          properties.splice(index, 1);
        }else{
          fields['contacts'] = false
        }
        console.log(index,properties)
        Person.findById(id,{'fields':fields,'include': properties}, function(err,response){
          if(err) next(err);
          else next(null, response);
        })
      }else{
        var err = new Error('permissions not defined')
        err.statusCode = 404;
        next(err);
      }
    })
  }

  // register a Person uploadmedia remote method
  Person.remoteMethod(
    'uploadMedia',
    {
      http: {path: '/uploadMedia', verb: 'post'},
      accepts: [
        {arg: 'req', type: 'object', http: {source: 'req'}, required: true},
      ],
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'upload media'
    }
  );

  Person.prototype.uploadMedia = function(req,next){
    var id = this.id;
    var baseUrl = 'http://'+Person.app.get('assetPath')+'/containers/';
    Person.findById(id, function(err,person){
      if(err) next(err);
      else if(person){
        // console.log(person)
        Person.upload(id,req, function(err,file){
          if(err) next(err);
          else if(file.files.pic){
            var pic = baseUrl+file.files.pic[0].container+'/download/'+file.files.pic[0].name
            //update gallery
            person.updateAttributes({
              'pic': pic
            }, function(err,done){
              if(err) next(err);
              else next(null,done);
            }) 
          }else{
            var err = new Error('image is not valid');
            next(null,err);
          }
        })
      }
    })
  }

  //method for media upload
  Person.upload = function(id,req,next){
    var Container = Person.app.models.container;
    //find container
    Container.getContainer('media'+id, function(err,container){
      if(err) {
        //not found
        Container.createContainer({
          'name': 'media'+id
        }, function(err,con){
          if(err) next(err);
          else{
            Container.upload(req,{},{container:'media'+id}, function(err,file){
              if(err) next(err);
              else next(null,file);
            })
          }
        })
      }
      else if(container){
        //upload media
        Container.upload(req, {},{container:'media'+id}, function(err,file){
          if(err) next(err);
          else next(null,file);
        })        
      }
    })
  }

  // register a Person privacy remote method
  Person.remoteMethod(
    'privacy',
    {
      http: {path: '/privacy', verb: 'get'},
      isStatic: false,
      returns: {root: true, type: 'object'},
      description: 'get person privacy type'
    }
  );

  Person.prototype.privacy = function(next){
    var id = this.id;
    var res = {'privacy':'private'};
    if(this.account && this.account.privacy)
      res['privacy'] = this.account.privacy
    next(null,res);
  }

  // register a Person resetPassword remote method
  Person.remoteMethod(
    'resetPassword',
    {
      http: {path: '/resetPassword', verb: 'post'},
      accepts: [
        {arg: 'password', type: 'string', required: true},
      ],
      returns: {root: true, type: 'object'},
      description: 'reset password'
    }
  );

  Person.resetPassword = function(password,next){
    var loopback = require('loopback');
    var userId = loopback.getCurrentContext().active.http.req.accessToken.userId;
    Person.app.models.User.findById(userId, function(err,user){
      if(err) next(err);
      else{
        user.updateAttributes({'password':password}, function(err,done){
          if(err) next(err);
          else next(null,{status:'success'})
        })
      }
    })  
  }

  Person.disableRemoteMethod('create',true);
  Person.disableRemoteMethod('upsert',true);
  Person.disableRemoteMethod('deleteById',true);
  Person.disableRemoteMethod("updateAll", true);
  //Person.disableRemoteMethod("updateAttributes", false);
  Person.disableRemoteMethod("find", true);
  Person.disableRemoteMethod("findOne", true);
  Person.disableRemoteMethod("confirm", true);
  Person.disableRemoteMethod("count", true);
  Person.disableRemoteMethod("exists", true);
  Person.disableRemoteMethod('createChangeStream', true);
  Person.disableRemoteMethod('__count__certificate', false);
  Person.disableRemoteMethod('__count__contact', false);
  Person.disableRemoteMethod('__count__education', false);
  Person.disableRemoteMethod('__count__experience', false);
  Person.disableRemoteMethod('__count__permission', false);
  Person.disableRemoteMethod('__count__profile', false);
  Person.disableRemoteMethod('__count__project', false);
  Person.disableRemoteMethod('__count__verification', false);
  Person.disableRemoteMethod('__count__awards', false);
  Person.disableRemoteMethod('__count__publications', false);
  Person.disableRemoteMethod('__count__volunteer', false);
};
