var express = require('express');
var passport = require('passport');
var facebookStrategy = require('passport-facebook').Strategy;
var router = express.Router();

passport.use(new facebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: 'https://onedistin.herokuapp.com/auth/facebook/callback',
    profileFields:['id','displayName','emails','gender']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var fb_user = {
      email: profile.emails[0].value,
      user_name: profile.displayName
    }
    var query = "SELECT * FROM onedistin_users WHERE user_email=?";
    con.query(query,[fb_user.email], function(err,result){
      if(err)throw err;
      if(result > 0){
        console.log("user already exists");
      }else{
        console.log("user is new here");
      }
    });

  }));

router.get('/facebook', passport.authenticate('facebook', {scope:'email'}));

router.get('/facebook/callback', passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login'}));

/*passport.serializeUser(function(user, done) {
	console.log(user);
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	user.findById(id, function(err, user) {
		done(err, user);
	});
});*/

module.exports = router;
