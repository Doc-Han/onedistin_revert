var express = require('express');
var con = require('../config/db.js');
var bcrypt = require('bcrypt');
var passport = require('passport');
var currentDate = require('../config/tools.js').currentDate();
var currentTime = require('../config/tools.js').currentTime();
var localStrategy = require('passport-local').Strategy;
var router = express.Router();

passport.use(new localStrategy(
  function(username,password,done){
    var query = "SELECT ID,user_pass FROM onedistin_users WHERE display_name= ?";
    con.query(query,[username],function(err,result){
      console.log(result);
      if(result.length < 1){
        return done(null, false);
      }else{
        const userId = result[0].ID;
        const hash = result[0].user_pass.toString();
        bcrypt.compare(password,hash,function(err,response){
          if(err) throw err;
          if(response === true){
            return done(null, {user_id: userId});
          }else{
            return done(null,false);
          }
        });
      }
    });
  }
));

router.get('/', (req,res) => {
  var query = "SELECT * FROM onedistin_deals WHERE timestamp=?";
  console.log(currentDate);
  con.query(query,[currentDate], function(err,result){
    if(err)throw err;
    var _thingGet = result[0].thingGet;
    if(_thingGet.indexOf('-***-') != -1){
      var thingGet = _thingGet.split('-***-');
    }else {
      var thingGet = [_thingGet];
    }
    con.query("SELECT * FROM onedistin_posts WHERE timestamp <= '"+currentTime+"' ORDER BY timestamp DESC LIMIT 10", function(err,p_result){
      if(err)throw err;
      res.render('index',{currentPost: result[0],thingGet: thingGet, forumPosts: p_result});
    });
  });
});

router.get('/login', isNotLoggenIn, (req,res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.get('/signup', isNotLoggenIn, (req,res) => {
  res.render('signup');
});

router.post('/signup', (req,res) => {
  var username = req.body.username;
  var fullname = req.body.fullname;
  var email = req.body.email;
  var phone = req.body.phone;
  var location = req.body.location;
  var password = req.body.password;
  bcrypt.hash(password,10,function(err,hash){
    if(err) throw err;
    var query = "INSERT INTO onedistin_users (ID, display_name,user_name,user_email,user_phone,user_loc,user_pass,user_registered)VALUES(?,?,?,?,?,?,?,?)";
    con.query(query, [null,username,fullname,email,phone,location,hash,currentDate] ,function(err){
      if(err) throw err;
      con.query("SELECT LAST_INSERT_ID() AS user_id", function(err,result){
        if(err) throw err;
        const user_id = result[0];
        req.login(user_id,function(err){
          res.redirect('/');
        });
      });
    });
  });
});

router.get('/checkout', (req,res) => {
  res.render('checkout');
});

router.get('/profile', (req,res) => {
  res.render('profile');
});

router.get('/rewards', (req,res) => {
  res.render('rewards');
});

router.get('/pastdeals', (req,res) => {
  var query = "SELECT * FROM onedistin_posts WHERE post_author = ? && timestamp <= '"+currentTime+"' ";
  console.log(currentTime);
  con.query(query,[0],function(err,result){
    res.render('pastdeals',{pastdeals:result});
  });
});

router.get('/logout', isLoggedIn, (req,res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/login');
});

passport.serializeUser(function(user_id,done){
  return done(null, user_id);
});
passport.deserializeUser(function(user_id,done){
  return done(null, user_id);
});

function isLoggedIn(req,res,next){
  if (req.isAuthenticated())
  return next();

  res.redirect('/login');
}

function isNotLoggenIn(req,res,next){
  if (req.isAuthenticated())
    res.redirect('/');
  else
    return next();

}

module.exports = router;
