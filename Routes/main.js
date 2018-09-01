var express = require('express');
var con = require('../config/db.js');
var bcrypt = require('bcrypt');
var passport = require('passport');
var currentDate = require('../config/tools.js');
var currentTime = require('../config/tools.js');
var localStrategy = require('passport-local').Strategy;
var tokenGen = require('../config/tools.js');
var cloudinary = require('cloudinary');
var router = express.Router();

passport.use(new localStrategy(
  function(username,password,done){
    var query = "SELECT ID,user_pass FROM onedistin_users WHERE display_name= ?";
    con.query(query,[username],function(err,result){
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
  if(req.isAuthenticated()){
    var user = req.user.user_id;
    var query = "SELECT * FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"';SELECT post_title,post_url FROM onedistin_posts WHERE timestamp < '"+currentTime.currentTime()+"' ORDER BY timestamp DESC LIMIT 10;SELECT * FROM onedistin_users WHERE ID = ?;SELECT offer_one,offer_two,offer_three FROM onedistin_points WHERE user_id=?";
    con.query(query,[user,user], function(err,result){
      if(err)throw err;
      var a = cloudinary.url(result[0][0].img_id, {effect: 'sharpen'});
      res.render('index',{currentPost: result[0][0], forumPosts: result[1],currentUser: result[2][0],offers: result[3][0],img:a, token: tokenGen.getToken()});
    });
  }else {
    console.log(currentDate.currentDate());
    var query = "SELECT * FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"';SELECT * FROM onedistin_posts WHERE timestamp < '"+currentTime.currentTime()+"' ORDER BY timestamp DESC LIMIT 10";
    con.query(query, function(err,result){
      if(err)throw err;
      var a = cloudinary.url(result[0][0].img_id, {effect: 'sharpen'});
      res.render('index',{currentPost: result[0][0], forumPosts: result[1],img:a});
    });
  }

});

router.get('/login', isNotLoggenIn, (req,res) => {
  res.render('login');
});

router.post('/login', isNotLoggenIn, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.get('/signup', isNotLoggenIn, (req,res) => {
  res.render('signup');
});

router.post('/signup', isNotLoggenIn, (req,res) => {
  var username = req.body.username;
  var fullname = req.body.fullname;
  var email = req.body.email;
  var phone = req.body.phone;
  var region = req.body.region;
  var password = req.body.password;
  bcrypt.hash(password,10,function(err,hash){
    if(err) throw err;
    var query = "INSERT INTO onedistin_users (ID, display_name,user_name,user_email,user_phone,user_loc,subscriptions,user_pass,user_registered,redeemed)VALUES(?,?,?,?,?,?,?,?,?,?)";
    con.query(query, [null,username,fullname,email,phone,region,'100',hash,currentDate.currentDate(),'000'] ,function(err){
      if(err) throw err;
      con.query("SELECT LAST_INSERT_ID() AS user_id", function(err,result){
        if(err) throw err;
        const user_id = result[0];
        var user = user_id.user_id;
        con.query("INSERT INTO onedistin_points (ID,user_id,active_points,total_points,last_activity) VALUES (?,?,?,?,?)",[null,user,0,0,'new user'],function(err){
          if(err)throw err;
          req.login(user_id,function(err){
            res.redirect('/');
          });
        });

      });
    });
  });
});

router.get('/checkout', isLoggedIn, (req,res) => {
  var user = req.user.user_id;
  var query = "SELECT * FROM onedistin_users WHERE ID = ?;SELECT * FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"'";
  con.query(query, [user], function(err,result){
    if(err)throw err;
    var a = cloudinary.url(result[1][0].img_id, {effect: 'sharpen'});
      res.render('checkout',{currentUser: result[0][0],currentPost: result[1][0],img: a, token: tokenGen.getToken()});
  });
});

router.get('/profile', isLoggedIn, (req,res) => {
  var user = req.user.user_id;
  var query = "SELECT * FROM onedistin_users WHERE ID = ?";
  con.query(query, [user], function(err,result){
    if (err)throw err;
    res.render('profile',{userData: result[0]});
  });
});

router.get('/profile/:type', (req,res,next) => {
  var user = req.user.user_id;
  var query = "SELECT * FROM onedistin_users WHERE ID = ?";
  con.query(query,[user],function(err,result){
    if(err)throw err;
    var type = req.params.type;
    if(type == "user-info"){
      res.render('user-info',{user:result[0]});
    }else if(type == "delivery-info"){
      res.render('delivery-info',{user:result[0]});
    }else if(type == "subscriptions"){
      res.render('subscriptions',{user:result[0]});
    }else {
      next();
    }
  });

});

router.post('/profile/:type', (req,res) => {
  var user = req.user.user_id;
  var type = req.params.type;
  if(type == "user-info"){
    var display_name = req.body.display_name;
    var password = req.body.password;
    var user_email = req.body.user_email;
    var user_phone = req.body.user_phone;
    if(password.trim() == ""){
      var query = "UPDATE onedistin_users SET display_name= ?,user_email= ?, user_phone= ? WHERE ID=?";
      con.query(query,[display_name,user_email,user_phone,user],function(err){
        if(err)throw err;
      });
    }else{
      var query = "UPDATE onedistin_users SET display_name= ?,user_email= ?, user_phone= ?,password= ? WHERE ID=?";
      bcrypt.hash(password, 10, function(err,hash){
        con.query(query,[display_name,user_email,user_phone,password,user],function(err){
          if(err)throw err;
        });
      });

    }
  }else if(type == "delivery-info"){
    var user_name = req.body.user_name;
    var address = req.body.address;
    var city = req.body.city;
    var region = req.body.region;
    var query = "UPDATE onedistin_users SET user_name= ?, user_address= ?, user_city= ?, user_loc= ? WHERE ID= ?";
    con.query(query,[user_name,address,city,region,user],function(err){
      if(err)throw err;
    });
  }else if(type == "subscriptions"){
    var one = req.body.one;
    var two = req.body.two;
    var three = req.body.three;
    var code = "";
    if(one == 'on'){
      code += '1';
    }else {
      code += '0';
    }
    if(two == 'on'){
      code += '1';
    }else {
      code += '0';
    }
    if(three == 'on'){
      code += '1';
    }else {
      code += '0';
    }
    var query = "UPDATE onedistin_users SET subscriptions= ? WHERE ID = ?";
    con.query(query,[code,user], function(err){
      if(err)throw err;
    });
  }
  res.redirect('/profile');
});

router.get('/rewards', (req,res) => {
  var user = req.user.user_id;
  con.query("SELECT * FROM onedistin_points WHERE user_id=?",[user],function(err,result){
    res.render('rewards',{pointData:result[0]});
  });
});

router.get('/pastdeals', (req,res) => {
  var query = "SELECT * FROM onedistin_posts WHERE post_author = ? && timestamp <= '"+currentTime.currentTime()+"' ";
  con.query(query,[0],function(err,result){
    res.render('pastdeals',{pastdeals:result});
  });
});

router.get('/redeem/:offer',function(req,res, next){
  var offer = req.params.offer;
  const user = req.user.user_id;
  con.query("SELECT active_points FROM onedistin_points WHERE user_id=?",[user],function(err,result){
    var points = result[0].active_points;

    if(offer == "free-delivery"){
      if(points >= 300){
        con.query("UPDATE onedistin_points SET last_activity='Purchase a free delivery(300pts)', offer_one=1, active_points=(active_points)-300 WHERE user_id=?",[user],function(err){
          if(err)throw err;
          res.send('Your free delivery has been activated');
        });
      }else {
        res.render('slow-down');
      }
    }else if(offer == "5-off"){
      if(points >= 600){
        con.query("UPDATE onedistin_points SET last_activity='Purchase a 5% off(600pts)', offer_two=1, active_points=(active_points)-600 WHERE user_id=?",[user],function(err){
          if(err)throw err;
          res.send('Your 5% off on deal has been activated');
        });
      }else {
        res.render('slow-down');
      }
    }else if(offer == "10-off"){
      if(points >= 1000){
        con.query("UPDATE onedistin_points SET last_activity='Purchase a 10% off(1000pts)', offer_three=1, active_points=(active_points)-1000 WHERE user_id=?",[user],function(err){
          if(err)throw err;
          res.send('Your 10% off on deal has been activated');
        });
      }else {
        res.render('slow-down');
      }
    }else{
      next();
    }
  });
});

router.get('/sell', (req,res) => {
  res.render('sell');
});

router.get('/our-story', (req,res) => {
  res.render('story');
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
