var express = require('express');
var con = require('../config/db.js');
var currentDate = require('../config/tools.js').currentDate();
var currentTime = require('../config/tools.js').currentTime();
var tools = require('../config/tools.js');
var multer = require('multer');
var upload = require('../config/upload.js');
var cloudinary = require('cloudinary');

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
  var query = "SELECT ID FROM onedistin_users";
  con.query(query, function(err,result){
    if(err)throw err;
    res.render('admin/home', {users: result.length});
  });
});

router.get('/deal', (req,res) => {
  con.query("SELECT ID,title,timestamp FROM onedistin_deals ORDER BY timestamp DESC", function(err,result){
    if(err) throw err;

    res.render('admin/deal', {deals: result, currentDate: currentDate});
  });
});

router.post('/deal', upload.array('image'), (req,res) => {
  var title = req.body.dealTitle;
  var price = req.body.dealPrice;
  var ac_price = req.body.ac_price;
  var thingGet = req.body.thingGet;
  var writeup = req.body.marketingWriteUp;
  var vidlink = req.body.VideoLink;
  var date = req.body.date.split("-").join("");
  var shoppy_txt = req.body.shoppy_txt;
  var shoppy_link = req.body.shopLink;
  var bg_color = req.body.bg_color;
  var footer_color = req.body.footer_color;

  var author = "onedistin";
  var body = "";
  var url = title.split(" ").join("-");
  var postDate = date + "000000";

  con.query("SELECT ID FROM onedistin_deals WHERE timestamp=?",[date],function(err,result){
    if(err)throw err;
    if(result.length < 1){
      var images = "";
      req.files.forEach(function(item,index){
        cloudinary.uploader.upload(item.path, function(img_res){
          console.log(img_res);
            var img_id = img_res.public_id;
            images += img_id+"-***-";
            if(index == req.files.length -1){
              var query = "INSERT INTO onedistin_deals (ID,title,price,ac_price,thingGet,writeup,video,shoppy_txt,shoppy_link,timestamp,img_id,bg_color,footer_color)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?);INSERT INTO onedistin_posts (ID,post_author,post_title,post_content,post_url,post_likes,post_comments,timestamp)VALUES(?,?,?,?,?,?,?,?)";
              con.query(query,[null,title,price,ac_price,thingGet,writeup,vidlink,shoppy_txt,shoppy_link,date,images,bg_color,footer_color,null,author,title,body,url,0,0,postDate],function(err){
                if(err)throw err;
                  res.send("deal Inserted");
                });
            }

        });
      });



    }else{
      console.log("Deal for this day already available");
    }
  });
});

router.get('/users', (req,res) => {
  var query = "SELECT * FROM onedistin_users";
  con.query(query, function(err, result){
    if(err)throw err;
    var query = req.query;
    var all=[]
    if(query.fullname == 'on'){
      all.push("user_name");
    }
    if(query.username == 'on'){
      all.push("display_name");
    }
    if(query.gender == 'on'){
      all.push("gender");
    }
    if(query.email == 'on'){
      all.push("user_email");
    }
    if(query.phone == 'on'){
      all.push("user_phone");
    }
    if(query.address == 'on'){
      all.push("user_address");
    }
    if(query.city == 'on'){
      all.push("city");
    }
    if(query.region == 'on'){
      all.push("user_loc");
    }
    console.log(all);
    res.render('admin/users', {users:result, options: all});
  });
});

router.get('/edit', (req,res) =>{
  res.send('page cannot be found!');
});

router.post('/edit', (req,res) =>{
  var referer = req.headers.referer;
  var id = req.body.id;
  var title = req.body.dealTitle;
  var price = req.body.dealPrice;
  var ac_price = req.body.ac_price;
  var thingGet = req.body.thingGet;
  var writeup = req.body.marketingWriteUp;
  var vidlink = req.body.VideoLink;
  var date = req.body.date.split("-").join("");
  var shoppy_txt = req.body.shoppy_txt;
  var shoppy_link = req.body.shopLink;
  var bg_color = req.body.bg_color;
  var footer_color = req.body.footer_color;
  var query = "UPDATE onedistin_deals SET title= ?,price= ?,ac_price=?,thingGet= ?,writeup= ?,video= ?,shoppy_txt= ?,shoppy_link= ?,timestamp= ?,bg_color= ?,footer_color= ? WHERE ID= ?";
  con.query(query,[title,price,ac_price,thingGet,writeup,vidlink, shoppy_txt, shoppy_link, date, bg_color,footer_color, id], function(err){
    if(err)throw err;
    res.redirect(referer);
  });
});

router.get('/edit/:id', (req,res) =>{
  var id = req.params.id;
  var query = "SELECT ID,title,timestamp FROM onedistin_deals ORDER BY timestamp DESC;SELECT * FROM onedistin_deals WHERE id=?";
  con.query(query,[id], function(err,result){
    if(err) throw err;
      res.render('admin/edit', {deal:result[1][0],dealDate: tools.dateToEdit(result[1][0].timestamp), deals:result[0], currentDate: currentDate});
  });
});

router.get('/story', (req,res) => {
  res.render('admin/story');
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
