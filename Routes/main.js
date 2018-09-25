var express = require('express');
var con = require('../config/db.js');
var bcrypt = require('bcrypt');
var passport = require('passport');
var currentDate = require('../config/tools.js');
var currentTime = require('../config/tools.js');
var localStrategy = require('passport-local').Strategy;
var tokenGen = require('../config/tools.js');
var cloudinary = require('cloudinary');
var mailer = require('../config/nodemailer.js');
var rp = require('request-promise');
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

router.get('/', (req,res,next) => {
  if(req.isAuthenticated()){
    var user = req.user.user_id;
    var query = "SELECT * FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"';SELECT post_title,post_url,post_likes,post_comments FROM onedistin_posts WHERE timestamp <> '"+currentDate.currentDate()+"000000"+"' ORDER BY ID DESC LIMIT 10;SELECT * FROM onedistin_users WHERE ID = ?;SELECT offer_one,offer_two,offer_three FROM onedistin_points WHERE user_id=?;SELECT * FROM onedistin_survey WHERE dealTime='"+currentDate.currentDate()+"';SELECT post_title,post_url,post_likes,post_comments FROM onedistin_posts WHERE post_author='onedistin' AND timestamp = '"+currentDate.currentDate()+"000000"+"'";
    con.query(query,[user,user], function(err,result){
      if(err)throw err;
      if(result[0].length > 0 && result[2].length > 0 && result[3].length > 0){
        var combined_img_string = result[0][0].img_id;
        var img_ids = combined_img_string.split("-***-");
        var images = [];
        img_ids.forEach(function(item,index){
          if(index == 0){
            var a = cloudinary.url(item,{transformation:[
              {effect: "colorize:80", color: result[0][0].bg_color},
              {width: 900, height: 900, crop: "scale"}
            ]});
          }else{
            var a = cloudinary.url(item,{effect: "sharpen"});
          }
          images.push(a);
          if(index == img_ids.length -1){
            if(result[0][0].categories){
              var one = [];
              var len = result[0][0].categories.split("-***-");
              for(i=0;i<len.length-1;i++){
                one[i] = len[i].split(",");
              }
              result[0][0].categories = one;
              var two = [];
              var _len = result[0][0].cat_prices.split("-***-");
              for(i=0;i<len.length-1;i++){
                two[i] = _len[i].split(",");
              }
              result[0][0].cat_prices = two;
            }

            var survey = result[4][0];
            console.log(result);
            res.render('index',{currentPost: result[0][0], forumPosts: result[1],currentUser: result[2][0],offers: result[3][0],survey: result[4][0],topPost: result[5][0],img:images, token: tokenGen.getToken(),today: currentDate.currentDate()});
          }
        });


      }else{
        next();
      }
    });
  }else {
    var query = "SELECT * FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"';SELECT * FROM onedistin_posts WHERE timestamp <> '"+currentDate.currentDate()+"000000"+"' ORDER BY ID DESC LIMIT 10;SELECT * FROM onedistin_survey WHERE dealTime='"+currentDate.currentDate()+"';SELECT post_title,post_url,post_likes,post_comments FROM onedistin_posts WHERE post_author='onedistin' AND timestamp = '"+currentDate.currentDate()+"000000"+"'";
    con.query(query, function(err,result){
      if(err)throw err;
      if(result[0].length > 0){
        var combined_img_string = result[0][0].img_id;
        var img_ids = combined_img_string.split("-***-");
        var images = [];
        img_ids.forEach(function(item,index){
          if(index == 0){
            var a = cloudinary.url(item,{transformation:[
              {effect: "colorize:80", color: result[0][0].bg_color},
              {width: 900, height: 900, crop: "scale"}
            ]});
          }else{
            var a = cloudinary.url(item,{effect: "sharpen"});
          }

          images.push(a);
          if(index == img_ids.length -1){
            console.log(result);
            res.render('index',{currentPost: result[0][0], forumPosts: result[1],survey: result[2][0],topPost: result[3][0],img:images,today: currentDate.currentDate()});
          }
        });
      }else{
        next();
      }
    });
  }

});

router.get('/login', isNotLoggenIn, (req,res) => {
  if(req.query.msg){
    var msg = req.query.msg
  }else{
    var msg = "";
  }
  res.render('login',{msg: msg});
});

router.post('/login', isNotLoggenIn, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?msg=Invalid username or password!'
}));

router.get('/signup', isNotLoggenIn, (req,res) => {
  if(req.query.referer){
    var referer = req.query.referer;
  }else{
    var referer = 0;
  }
  res.render('signup',{referer: referer});
});

router.post('/signup', isNotLoggenIn, (req,res) => {
  var username = req.body.username;
  var fullname = req.body.fullname;
  var gender = req.body.gender;
  var email = req.body.email;
  var phone = req.body.phone;
  var region = req.body.region;
  var password = req.body.password;
  var refId = username[0]+username[1]+tokenGen.getToken();
  if(req.body.referer){
    var referer = req.body.referer;
  }else{
    var referer = 0;
  }

  bcrypt.hash(password,10,function(err,hash){
    if(err) throw err;
    var query = "INSERT INTO onedistin_users (ID, display_name,user_name,gender,user_email,user_phone,user_loc,subscriptions,user_pass,user_registered,refId)VALUES(?,?,?,?,?,?,?,?,?,?,?)";
    con.query(query, [null,username,fullname,gender,email,phone,region,'100',hash,currentDate.currentDate(),refId] ,function(err){
      if(err) throw err;
      con.query("SELECT LAST_INSERT_ID() AS user_id", function(err,result){
        if(err) throw err;
        const user_id = result[0];
        var user = user_id.user_id;
        if(referer != 0){
          var nQuery = "INSERT INTO onedistin_points (ID,user_id,active_points,total_points,offer_one,offer_two,offer_three,last_activity) VALUES (?,?,?,?,?,?,?,?);UPDATE onedistin_points SET active_points=(active_points)+100, total_points=(total_points)+100, last_activity=concat(last_activity,',SignUp through Invite') WHERE user_id=?";
          var vals = [null,user,0,0,0,0,0,'new user',user];
        }else{
          var nQuery = "INSERT INTO onedistin_points (ID,user_id,active_points,total_points,offer_one,offer_two,offer_three,last_activity) VALUES (?,?,?,?,?,?,?,?)";
          var vals = [null,user,0,0,0,0,0,'new user'];
        }
        con.query(nQuery,vals,function(err){
          if(err)throw err;
          //mailer.throwMail(email,"Welcome to Onedistin","<p>Thank you for creating an account with Onedistin</p><p>Visit our site daily to uncover the mystery of cheap items. See ya</p><br><p>Your Login info</p><p>Email: "+email+"</p><p>Username: "+username+"</p><p>Password: "+password+"</p>");
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
  var query = "SELECT * FROM onedistin_users WHERE ID = ?;SELECT * FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"';SELECT offer_one,offer_two,offer_three FROM onedistin_points WHERE user_id=?";
  con.query(query, [user,user], function(err,result){
    if(err)throw err;
    var combined_img_string = result[1][0].img_id;
    var img_ids = combined_img_string.split("-***-");
    var a = cloudinary.url(img_ids[1], {effect: 'sharpen'});

    if(result[1][0].categories){
      var one = [];
      var len = result[1][0].categories.split("-***-");
      for(i=0;i<len.length-1;i++){
        one[i] = len[i].split(",");
      }
      result[1][0].categories = one;
      var two = [];
      var _len = result[1][0].cat_prices.split("-***-");
      for(i=0;i<len.length-1;i++){
        two[i] = _len[i].split(",");
      }
      result[1][0].cat_prices = two;
    }

      res.render('checkout',{currentUser: result[0][0],currentPost: result[1][0],offers: result[2][0],img: a, token: tokenGen.getToken()});
  });
});

router.get('/profile', isLoggedIn, (req,res) => {
  var user = req.user.user_id;
  var query = "SELECT * FROM onedistin_users WHERE ID = ?;SELECT * FROM onedistin_invoice WHERE user=? AND paid='1'";
  con.query(query, [user,user], function(err,result){
    if (err)throw err;
    console.log(result[1]);
    res.render('profile',{userData: result[0][0],orders: result[1]});
  });
});

router.get('/profile/:type', isLoggedIn, (req,res,next) => {
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

router.post('/profile/:type', isLoggedIn, (req,res) => {
  var user = req.user.user_id;
  var type = req.params.type;
  if(type == "user-info"){
    var display_name = req.body.display_name;
    var user_email = req.body.user_email;
    var user_phone = req.body.user_phone;
      var query = "UPDATE onedistin_users SET display_name= ?,user_email= ?, user_phone= ? WHERE ID=?";

        con.query(query,[display_name,user_email,user_phone,user],function(err){
          if(err)throw err;
        });

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

router.get('/rewards', isLoggedIn, (req,res) => {
  var user = req.user.user_id;
  con.query("SELECT * FROM onedistin_points WHERE user_id=?",[user],function(err,result){
    res.render('rewards',{pointData:result[0]});
  });
});

router.get('/introduce', isLoggedIn, (req,res) => {
  var user = req.user.user_id;
  con.query("SELECT refId FROM onedistin_users WHERE ID=?",[user],function(err,result){
    if(err)throw err;
    res.render('introduce',{refId: result[0].refId});
  });
});

router.get('/facebookinfo', isLoggedIn, (req,res) => {
  res.render('facebook_next');
});

router.post('/facebookinfo', isLoggedIn, (req,res) => {
  var user = req.user.user_id;
  var display_name = req.body.username;
  var region = req.body.region;
  var password = req.body.password;
  var query = "UPDATE onedistin_users SET display_name=?, user_loc=?, user_pass=? WHERE ID=?";
  bcrypt.hash(password, 10, function(err,hash){
    con.query(query, [display_name, region, password, user], function(err,result){
      if(err)throw err;
      res.redirect('/');
    });
  });

});

router.get('/pastdeals', (req,res) => {
  var query = "SELECT * FROM onedistin_posts WHERE post_author = ? && timestamp < ? ORDER BY timestamp DESC";
  var cTime = currentDate.currentDate()+'000000';
  console.log(cTime);
  con.query(query,['onedistin',cTime],function(err,result){
    if(err)throw err;
    if(result.length > 0){
      result.forEach(function(item,index){
        var dealDate = item.timestamp;
        var _dealDate = dealDate[0] + dealDate[1] + dealDate[2] + dealDate[3] + dealDate[4] + dealDate[5] + dealDate[6] + dealDate[7];
        con.query("SELECT img_id FROM onedistin_deals WHERE timestamp='"+_dealDate+"'",function(err,s_result){
          if(err)throw err;
          if(s_result.length > 0){
            var pastdeal_img = s_result[0].img_id.split("-***-")[2];
            //console.log(pastdeal_img);
            item.pastdeal_img = cloudinary.url(pastdeal_img,{transformation:[{effect: "sharpen"},{crop:'scale'}]});
            var hasPastDeal = true;
          }else{
            var hasPastDeal = false;
          }
          if(index == result.length-1){
            console.log(result);
            res.render('pastdeals',{pastdeals:result, hasPastDeal: hasPastDeal});
          }
        });
      });
    }else{
      var hasPastDeal = false;
      res.render('pastdeals',{hasPastDeal: hasPastDeal});
    }
  });
});

router.get('/pastdeal/:id', (req,res) => {
  var dealDate = req.params.id.trim();
  var _dealDate = dealDate[0] + dealDate[1] + dealDate[2] + dealDate[3] + dealDate[4] + dealDate[5] + dealDate[6] + dealDate[7];
  var query = "SELECT * FROM onedistin_deals WHERE timestamp='"+_dealDate+"';SELECT post_title,post_url,post_likes,post_comments FROM onedistin_posts WHERE timestamp < '"+currentTime.currentTime()+"' ORDER BY timestamp DESC LIMIT 10";
  con.query(query, function(err,result){
    if(err)throw err;
    con.query("SELECT * FROM onedistin_survey WHERE dealTime='"+result[0][0].timestamp+"'", function(err,s_result){
      if(err)throw err;

      var combined_img_string = result[0][0].img_id;
      var img_ids = combined_img_string.split("-***-");
      var images = [];
      img_ids.forEach(function(item,index){
        if(index == 0){
          var a = cloudinary.url(item,{transformation:[
            {effect: "colorize:80", color: result[0][0].bg_color},
            {width: 900, height: 900, crop: "scale"}
          ]});
        }else{
          var a = cloudinary.url(item,{effect: "sharpen"});
        }
        images.push(a);
        if(index == img_ids.length -1){
          res.render('past-deal',{currentPost: result[0][0], forumPosts: result[1], img:images,survey: s_result[0]});
        }
      });

    });


  });
});

router.get('/redeem/:offer', isLoggedIn, function(req,res, next){
  var offer = req.params.offer;
  const user = req.user.user_id;
  con.query("SELECT active_points FROM onedistin_points WHERE user_id=?",[user],function(err,result){
    var points = result[0].active_points;

    if(offer == "free-delivery"){
      if(points >= 300){
        con.query("UPDATE onedistin_points SET last_activity='Purchase a free delivery(300pts)', offer_one=1, active_points=(active_points)-300 WHERE user_id=?",[user],function(err){
          if(err)throw err;
          res.render('redeem-success');
        });
      }else {
        res.render('slow-down');
      }
    }else if(offer == "5-off"){
      if(points >= 600){
        con.query("UPDATE onedistin_points SET last_activity='Purchase a 5% off(600pts)', offer_two=1, active_points=(active_points)-600 WHERE user_id=?",[user],function(err){
          if(err)throw err;
          res.render('redeem-success');
        });
      }else {
        res.render('slow-down');
      }
    }else if(offer == "10-off"){
      if(points >= 1000){
        con.query("UPDATE onedistin_points SET last_activity='Purchase a 10% off(1000pts)', offer_three=1, active_points=(active_points)-1000 WHERE user_id=?",[user],function(err){
          if(err)throw err;
          res.render('redeem-success');
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

router.post('/sell', (req,res) =>{
  var body = req.body;
  var fullname = body.fullname;
  var profession = body.profession;
  var email = body.email;
  var phone = body.phone;
  var location = body.location;
  var product_name = body.product_name;
  var category = body.category;
  var brand = body.brand;
  var price = body.price;
  var desc = body.description;
  var custom_id = tokenGen.getToken();
  console.log(body);

  var query = "INSERT INTO onedistin_sell(ID,custom_ID,fullname,profession,email,phone,product_name,category,brand,price,description,location,timestamp)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";
  con.query(query,[null,custom_id,fullname,profession,email,phone,product_name,category,brand,price,desc,location,new Date()],function(err){
    if(err)throw err;
    res.render('sell-success');
  });
});

router.get('/our-story', (req,res) => {
  con.query("SELECT meta_op,meta_content FROM onedistin_meta WHERE meta_title='story' ",function(err,result){
    if(err)throw err;
    if(result.length > 0){
      var hasStory = true;
      var titles = result[0].meta_op.split("-***-");
      var content = result[0].meta_content.split("-***-");
      res.render('story', {content: content,titles: titles,hasStory: hasStory});
    }else{
      var hasStory = false;
      res.render('story', {hasStory: hasStory});
    }
  });
});

router.get('/support', (req,res) => {
  if(req.isAuthenticated()){
    var user = req.user.user_id;
    var query = "SELECT * FROM onedistin_users WHERE ID = ?";
    con.query(query,[user], function(err,result){
      if(err)throw err;
      if(result.length > 0){
          res.render('support',{currentUser: result[0]});
      }
    });
  }else{
    res.render('support');
  }


});

router.get('/privacy', (req,res) => {
  res.render('p_n_p');
});

router.post('/support', (req,res) => {
  if(req.isAuthenticated()){
    var user = req.user.user_id;
    var body = req.body;
    var type = body.complaint;
    var issue = body.issue;
    var email = body.user_email;
    var phone = body.user_phone;
    var query = "INSERT INTO onedistin_support (ID,userId,type,issue,email,phone)VALUES(?,?,?,?,?,?);SELECT user_name FROM onedistin_users WHERE ID=?";
    con.query(query,[null,user,type,issue,email,phone,user],function(err,result){
      if(err)throw err;
      var user_name = result[1][0].user_name;
      res.render("support-done",{user_name: user_name});
    });
  }else{
    var user = 0;
    var body = req.body;
    var type = body.complaint;
    var issue = body.issue;
    var email = body.user_email;
    var phone = body.user_phone;
    var query = "INSERT INTO onedistin_support (ID,userId,type,issue,email,phone)VALUES(?,?,?,?,?,?)";
    con.query(query,[null,user,type,issue,email,phone],function(err,result){
      if(err)throw err;
      var user_name = "Nameless"
      res.render("support-done",{user_name: user_name});
    });
  }
});

router.get('/forgot',isNotLoggenIn, (req,res) => {
  res.render('forgot');
});

router.get('/reset/:phone/:id', (req,res,next) =>{
  var phone = req.params.phone;
  var id = req.params.id;
  var data = {
    phone: phone,
    id: id
  }
  con.query("SELECT ID FROM onedistin_users WHERE user_phone=? AND ID=?",[phone,id],function(err,result){
    if(err)throw err;
    if(result.length > 0){
      res.render('reset',{data:data});
    }else{
      next();
    }
  });
});

router.post('/reset', (req,res) =>{
  var body = req.body;
  var phone = body.phone;
  var id = body.id;
  var password = body.password;
  var c_password = body.confirm_password;
  bcrypt.hash(password,10,function(err,hash){
    if(err)throw err;
    var query = "UPDATE onedistin_users SET user_pass=? WHERE ID=? AND user_phone=?";
    con.query(query,[hash,id,phone],function(err){
      if(err)throw err;
      res.redirect('/login?msg=login with your new password');
    });
  });
});

router.get('/logout', isLoggedIn, (req,res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/login');
});

router.get('/alertme', (req,res) =>{
  res.render('subs');
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
