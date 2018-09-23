var express = require('express');
var passport = require('passport');
var facebookStrategy = require('passport-facebook').Strategy;
var con = require('../config/db.js');
var currentDate = require('../config/tools.js');
var tokenGen = require('../config/tools.js');
var nodemailer = require('../config/nodemailer.js');
var router = express.Router();

passport.use(new facebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: 'https://onedistin.herokuapp.com/auth/facebook/callback',
    profileFields:['id','displayName','emails','gender','hometown','location']
  },
  function(accessToken, refreshToken, profile, done) {
    //console.log(profile);
    var data = profile._json;
    var fb_user = {
      email: profile.emails[0].value,
      user_name: data.name,
      gender: data.gender,
      user_city: data.location.name.split(",")[0],
    }
    console.log(fb_user);
    var query = "SELECT * FROM onedistin_users WHERE user_email='"+fb_user.email+"'";
    con.query(query, function(err,result){
      if(err)throw err;
      if(result.length > 0){
        done(null, false);
      }else{
        var refId = fb_user.user_name[0]+fb_user.user_name[1]+tokenGen.getToken();
        var query = "INSERT INTO onedistin_users (ID,user_name,gender,user_email,user_city,user_registered,refId)VALUES(?,?,?,?,?,?,?)";
        con.query(query,[null,fb_user.user_name,fb_user.gender,fb_user.email,fb_user.user_city,currentDate.currentDate(),refId], function(err){
          if(err)throw err;
          con.query("SELECT LAST_INSERT_ID() AS user_id", function(err,result){
            if(err) throw err;
            const user_id = result[0];
            var user = user_id.user_id;
            con.query("INSERT INTO onedistin_points (ID,user_id,active_points,total_points,last_activity) VALUES (?,?,?,?,?,?,?,?)",[null,user,0,0,'new user'],function(err){
              if(err)throw err;
              //nodemailer.throwMail(fb_user.email,"Welcome to Onedistin","<p>Thank you for creating an account with Onedistin</p><br><p>Visit our site daily to uncover the mystery of cheap items. See ya</p><br><br><p>Your Login info</p><br><p>Email: "+fb_user.email+"</p><br><p>Username: "+fb_user.user_name+"</p><br><p>Password: <a href='onedistin.herokuapp.com/profile/user-info'>Set it up</a></p>");
              done(null,user_id);
            });

          });
        });
      }
    });

  }));
// ,'user_gender','user_hometown','user_location'
router.get('/facebook', passport.authenticate('facebook', {scope:['email']}));

router.get('/facebook/callback', passport.authenticate('facebook', {successRedirect: '/facebookinfo', failureRedirect: '/signup'}));

passport.serializeUser(function(user_id,done){
  return done(null, user_id);
});
passport.deserializeUser(function(user_id,done){
  return done(null, user_id);
});

module.exports = router;
