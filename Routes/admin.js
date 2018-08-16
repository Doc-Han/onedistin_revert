var express = require('express');
var con = require('../config/db.js');
var currentDate = require('../config/tools.js').currentDate();
var currentTime = require('../config/tools.js').currentTime();

var router = express.Router();



router.get('/', isNotLoggenIn, (req,res) => {
  res.render('admin/login');
});

router.post('/', (req,res) => {
  var admin = req.body.admin;
  var pass = req.body.password;
  var query = "SELECT ID,admin_pass FROM admin WHERE admin_name=?";
  con.query(query,[admin],function(err,result){
    if(err) throw err;
    if(result.length < 1){
      console.log('Login failed!');
    }else{
      const admin_pass = result[0].admin_pass;
      const admin_id = result[0].ID;
      if(pass == admin_pass){
        req.session.admin = true;
        req.session.admin_id = admin_id;
        res.redirect('/admin/dashboard');
      }else {
        console.log('Details not match!');
      }
    }

  });

});

router.get('/dashboard', isNotLoggenIn, (req,res) => {
  res.render('admin/home');
});

router.get('/deal', (req,res) => {
  con.query("SELECT ID,title,timestamp FROM onedistin_deals ORDER BY timestamp DESC", function(err,result){
    if(err) throw err;

    res.render('admin/deal', {deals: result, currentDate: currentDate});
  });
});

router.post('/deal', (req,res) => {
  var title = req.body.dealTitle;
  var price = req.body.dealPrice;
  var thingGet = req.body.thingGet;
  if(Array.isArray(thingGet)){
    var _thingGet = thingGet.join("-***-");
  }else{
    var _thingGet = thingGet;
  }
  console.log(_thingGet);
  var writeup = req.body.marketingWriteUp;
  var vidlink = req.body.VideoLink;
  var date = req.body.date.split("-").join("");
  var shoppy_name = req.body.shopName;
  var shoppy_price = req.body.shopPrice;
  var shoppy_link = req.body.shopLink;
  var query = "INSERT INTO onedistin_deals (ID,title,price,thingGet,writeup,video,shoppy_name,shoppy_price,shoppy_link,timestamp)VALUES(?,?,?,?,?,?,?,?,?,?)";
  con.query("SELECT ID FROM onedistin_deals WHERE timestamp=?",[date],function(err,result){
    if(err)throw err;
    if(result.length < 1){
      con.query(query,[null,title,price,_thingGet,writeup,vidlink,shoppy_name,shoppy_price,shoppy_link,date],function(err){
        if(err)throw err;
        console.log('Deal Inserted!');

        var author = "Distin cat";
        var body = "";
        var url = title.split(" ").join("-");
        var postDate = currentDate + "000";
        var query = "INSERT INTO onedistin_posts (ID,post_author,post_title,post_content,post_url,timestamp)VALUES(?,?,?,?,?,?)";
        con.query(query,[null,author,title,body,url,postDate], function(err){
          if(err)throw err;
          console.log("post Inserted!");
        });

      });
    }else{
      console.log("Deal for this day already available");
    }
  });
  res.send("done");
});

router.get('/edit', (req,res) =>{
  res.send('page cannot be found!');
});

router.get('/edit/:id', (req,res) =>{
  var id = req.params.id;
  con.query("SELECT ID,title,timestamp FROM onedistin_deals ORDER BY timestamp DESC", function(err,d_result){
    if(err) throw err;
    con.query("SELECT * FROM onedistin_deals WHERE id=?",[id],function(err,result){
      if(err)throw err;
      var _thingGet = result[0].thingGet;
      if(_thingGet.indexOf('-***-') != -1){
        var thingGet = _thingGet.split('-***-');
      }else {
        var thingGet = [_thingGet];
      }
      res.render('admin/edit', {deal:result[0], thingGet:thingGet, deals:d_result, currentDate:currentDate});
    });
  });

});

router.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/admin');
});

function isLoggedIn(req,res,next){
  if (req.session.admin)
    return next();

  res.redirect('/admin');
}

function isNotLoggenIn(req,res,next){
  if (req.session.admin)
    res.redirect('/admin/dashboard');
  else
    return next();

}

module.exports = router;
