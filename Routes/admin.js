var express = require('express');
var con = require('../config/db.js');
var currentDate = require('../config/tools.js').currentDate();
var currentTime = require('../config/tools.js').currentTime();
var tools = require('../config/tools.js');
var multer = require('multer');
var tokenGen = require('../config/tools.js');
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
    }else{
      const admin_pass = result[0].admin_pass;
      const admin_id = result[0].ID;
      if(pass == admin_pass){
        req.session.admin = true;
        req.session.admin_id = admin_id;
        res.redirect('/han/dashboard');
      }else {
        res.redirect('/han');
      }
    }

  });

});

router.get('/dashboard', isLoggedIn, (req,res) => {
  var query = "SELECT ID FROM onedistin_users;SELECT ID FROM onedistin_invoice;SELECT ID FROM onedistin_invoice WHERE paid='1';SELECT ID FROM onedistin_support";
  con.query(query, function(err,result){
    if(err)throw err;
    res.render('admin/home', {users: result[0].length,invoices:result[1].length,paid_invoices:result[2].length,support:result[3].length});
  });
});

router.get('/deal', isLoggedIn, (req,res) => {
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
  var share_txt = req.body.share_txt;
  var cat = req.body.categories.trim();
  var cat_price = req.body.cat_price.trim();
  var survey = req.body.survey.split(",");
  for(i=0;i<6;i++){
    if(!(survey[i])){
      survey[i] = null;
    }
  }


  var author = "onedistin";
  var body = "";
  var url = title.split(" ").join("-");
  var postDate = date + "000000";

  con.query("SELECT ID FROM onedistin_deals WHERE timestamp=?",[date],function(err,result){
    if(err)throw err;
    if(result.length < 1){
      var images = [];
      var s_images;
      var count = 0;
      req.files.forEach(function(item,index){
        var custom_id = tokenGen.getToken();
        cloudinary.v2.uploader.upload(item.path, {public_id: custom_id}, function(img_res){
          images[index] = custom_id;
          if(custom_id != null && custom_id.trim() != ""){
            count++;
          }

            if(req.files.length == count){
              s_images = images.join("-***-");
              var time = new Date(req.body.date);
              var query = "INSERT INTO onedistin_deals (ID,title,price,ac_price,thingGet,writeup,video,shoppy_txt,shoppy_link,timestamp,img_id,bg_color,share_txt,categories,cat_prices)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);INSERT INTO onedistin_posts (ID,post_author,post_title,post_content,post_url,post_likes,post_comments,timestamp,time)VALUES(?,?,?,?,?,?,?,?,?);INSERT INTO onedistin_survey (ID,dealTime,question,ans_one,ans_two,ans_three,ans_four,ans_five,ans_six)VALUES(?,?,?,?,?,?,?,?,?)";
              con.query(query,[null,title,price,ac_price,thingGet,writeup,vidlink,shoppy_txt,shoppy_link,date,s_images,bg_color,share_txt,cat,cat_price,null,author,title,body,url,0,0,postDate,time,null,date,survey[0],survey[1],survey[2],survey[3],survey[4],survey[5],survey[6]],function(err){
                if(err)throw err;
                  res.send("deal Inserted");
                });
            }

        });
      });



    }else{
      res.send("Deal for this day already exists!");
    }
  });
});

router.get('/users', isLoggedIn, (req,res) => {
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

router.get('/coupons', isLoggedIn, (req,res) =>{
  con.query("SELECT * FROM onedistin_coupons",function(err,result){
    if(err)throw err;
    if(result.length > 0){
      var hasCoupons = true;
    }else{
      var hasCoupons = false;
    }
    console.log(hasCoupons);
    var coupons = result;
    res.render('admin/coupons',{coupons:coupons,hasCoupons:hasCoupons});
  });
});

router.get('/coupons/:Id', isLoggedIn, (req,res) =>{
  var id = req.params.Id;
  con.query("DELETE FROM onedistin_coupons WHERE ID=?",[id],function(err){
    if(err)throw err;
    res.redirect('/han/coupons');
  });
});

router.post('/coupons', isLoggedIn, (req,res) =>{
  var body = req.body;
  var code = body.code;
  var percentage = body.percentage;
  var query = "INSERT INTO onedistin_coupons (ID,code,percentage)VALUES(?,?,?)";
  con.query(query,[null,code,percentage],function(err){
    if(err)throw err;
    res.redirect('/han/coupons');
  })
});

router.get('/orders', isLoggedIn, (req,res) =>{
  con.query("SELECT * FROM onedistin_invoice ORDER BY paid DESC,dealTime DESC",function(err,result){
    res.render('admin/orders',{orders:result});
  });
});

router.get('/orders/:option', isLoggedIn, (req,res,next) =>{
  var option = req.params.option;
  if(option == 'hubtel'){
    con.query("SELECT * FROM onedistin_invoice WHERE type='1' ORDER BY paid DESC",function(err,result){
      res.render('admin/orders',{orders:result});
    });
  }else if(option == 'ussd'){
    con.query("SELECT * FROM onedistin_invoice WHERE type='2' ORDER BY paid DESC",function(err,result){
      res.render('admin/orders',{orders:result});
    });
  }else if(option == 'ipay'){
    con.query("SELECT * FROM onedistin_invoice WHERE type='3' ORDER BY paid DESC",function(err,result){
      res.render('admin/orders',{orders:result});
    });
  }else{
    next();
  }
});

router.get('/edit', isLoggedIn, (req,res) =>{
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
  var share_txt = req.body.share_txt;
  var ac_date = req.body.actualDate;
  var time = new Date(req.body.date);
  var query = "UPDATE onedistin_deals SET title= ?,price= ?,ac_price=?,thingGet= ?,writeup= ?,video= ?,shoppy_txt= ?,shoppy_link= ?,timestamp= ?,bg_color= ?, share_txt= ? WHERE ID= ?;UPDATE onedistin_survey SET dealTime=? WHERE dealTime=?;UPDATE onedistin_posts SET timestamp=?, time=? WHERE post_author='onedistin' AND timestamp=?";
  con.query(query,[title,price,ac_price,thingGet,writeup,vidlink, shoppy_txt, shoppy_link, date, bg_color,share_txt, id,date,ac_date,date+'000000',time,ac_date+'000000'], function(err){
    if(err)throw err;
    res.redirect(referer);
  });
});

router.get('/edit/:id', isLoggedIn, (req,res) =>{
  var id = req.params.id;
  var query = "SELECT ID,title,timestamp FROM onedistin_deals ORDER BY timestamp DESC;SELECT * FROM onedistin_deals WHERE id=?";
  con.query(query,[id], function(err,result){
    if(err) throw err;
    con.query("SELECT * FROM onedistin_survey WHERE dealTime=?",[result[1][0].timestamp],function(err,s_result){
      if(err)throw err;
      if(result[1][0].categories){
        var cat = result[1][0].categories;
        cat = cat.split("-***-");
      }
        var images = result[1][0].img_id.split("-***-");
        res.render('admin/edit', {deal:result[1][0],dealDate: tools.dateToEdit(result[1][0].timestamp), deals:result[0],dealCats: cat, currentDate: currentDate,survey: s_result[0],images: images});
    });
  });
});

router.get('/story', isLoggedIn, (req,res) => {
  con.query("SELECT meta_op,meta_content FROM onedistin_meta WHERE meta_title='story' ",function(err,result){
    if(err)throw err;
    if(result.length > 0){
      var hasStory = true;
      var titles = result[0].meta_op.split("-***-");
      var content = result[0].meta_content.split("-***-");
      res.render('admin/story', {content: content,titles: titles,hasStory: hasStory});
    }else{
      var hasStory = false;
      res.render('admin/story', {hasStory: hasStory});
    }
  });
});

router.post('/story', (req,res) =>{
  console.log(req.body);
  var title = req.body.title;
  var _title = title.join("-***-");
  var story = req.body.story;
  var _story = story.join("-***-");
  console.log(_title);
  con.query("SELECT * FROM onedistin_meta WHERE meta_title=?",['story'],function(err,result){
    if(err)throw err;
    if(result.length > 0){
      var query = "UPDATE onedistin_meta SET meta_op=?,meta_content=? WHERE meta_title=?";
      var input = [_title,_story,'story'];
    }else{
      var query = "INSERT INTO onedistin_meta(ID,meta_title,meta_op,meta_content)VALUES(?,?,?,?)";
      var input = [null,'story',_title,_story];
    }

    con.query(query,input,function(err){
      if(err)throw err;
      res.send("Story Updated!");
    });
  });
});

router.get('/reports', isLoggedIn, (req,res) =>{
  res.render('admin/reports');
});

router.get('/logout', isLoggedIn, (req,res) => {
  req.session.destroy();
  res.redirect('/han');
});

function isLoggedIn(req,res,next){
  if (req.session.admin)
    return next();

  res.redirect('/han');
}

function isNotLoggenIn(req,res,next){
  if (req.session.admin)
    res.redirect('/han/dashboard');
  else
    return next();

}

module.exports = router;
