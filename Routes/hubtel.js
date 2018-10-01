var express = require('express');
var tokenGen = require('../config/tools.js');
var con = require('../config/db.js');
var currentDate = require('../config/tools.js');
var rp = require('request-promise');
var router = express.Router();

router.get('/p_s', isLoggedIn, (req,res) =>{
  res.render("payment/payment_sent");
});

router.get('/p_c', isLoggedIn, (req,res) =>{
  if(req.query){
    var checkoutid = req.query.checkoutid;
    con.query("DELETE FROM onedistin_invoice WHERE checkoutid=?",[checkoutid],function(err,result){
      if(err)throw err;
    });
  }
  res.render("payment/payment_cancelled");
});

router.get('/d_p', isLoggedIn, (req,res) =>{
  res.send("Please we are not here yet!");
});

router.post('/hubtel/callback', (req,res) =>{
  var body = req.body;
  for(i=0;i<10;i++){
    console.log("HUBTEL CALLBACK HERE!");
  }
  console.log(body);
  var checkoutId = body.Data.CheckoutId;
  if(body.Status == "Success"){
    con.query("UPDATE onedistin_invoice SET paid=? WHERE checkoutid=?",[1,checkoutid],function(err,result){
      if(err)throw err;
      res.redirect('/p_s');
    });
  }
  res.send("Thanks You!");
});

router.get('/hubtel/validate', (req,res,next) =>{
  if(req.query.checkoutid){
    var checkoutid = req.query.checkoutid;
    con.query("UPDATE onedistin_invoice SET paid=? WHERE checkoutid=?",[1,checkoutid],function(err,result){
      if(err)throw err;
      res.redirect('/p_s');
    });
  }else{
    next();
  }
});

router.get('/ipay', isLoggedIn, (req,res,next) =>{
  if(req.query.ref_f_i_d){
    var user = req.user.user_id;
    con.query("SELECT user_name FROM onedistin_users WHERE ID=?",[user], function(err,result){
      if(err)throw err;
      var user_name = result[0].user_name;

      var category = req.query.cat;
      var item_det = req.query.ref_f_i_d.split("-");
      var num = item_det[0]*1;
      var del = item_det[1]*1;
      var ttl = item_det[2]*1;
      if(del == 0){
        var delivery = 5;
      }else if(del == 1){
        var delivery = 10;
      }else{
        var delivery = 0;
      }
      var total = (ttl*num)+delivery;
      var data = {
        item_det: req.query.ref_f_i_d,
        item_title: req.query.p_t,
        item_cat: category,
        total: total,
        user_name: user_name
      }
      res.render('payment/ipay',{data: data});
    });
  }else{
    next();
  }
});

router.get('/ussd', isLoggedIn, (req,res) =>{
  if(req.query.ref_f_i_d){
    var user = req.user.user_id;
    con.query("SELECT user_name FROM onedistin_users WHERE ID=?",[user], function(err,result){
      if(err)throw err;
      var user_name = result[0].user_name;

      var item_det = req.query.ref_f_i_d.split("-");
      var num = item_det[0]*1;
      var del = item_det[1]*1;
      var ttl = item_det[2]*1;
      if(del == 0){
        var delivery = 5;
      }else if(del == 1){
        var delivery = 10;
      }else{
        var delivery = 0;
      }
      var total = ((ttl)*num)+delivery;
      var data = {
        item_det: req.query.ref_f_i_d,
        item_title: req.query.p_t,
        item_cat: req.query.cat,
        total: total,
        user_name: user_name
      }
      res.render('ussd',{data: data});
    });
  }else{
    next();
  }

});

router.post('/ussd', isLoggedIn, (req,res) =>{
  user = req.user.user_id;
  var token = tokenGen.getToken();
  token = "ussd"+token.substring(0,6);
  var body = req.body;
  var title = body.p_t;
  var item_ref = body.ref_f_i_d;
  var cat = body.cat;
  var user_name = body.order_user_name;
  var order_phone = body.order_phone;
  var date = currentDate.currentDate();
  var item_det = item_ref.split("-");
  var num = item_det[0]*1;
  var del = item_det[1]*1;
  var ttl = item_det[2]*1;
  if(del == 0){
    var delivery = 5;
  }else if(del == 1){
    var delivery = 10;
  }else{
    var delivery = 0;
  }
  var amt = (ttl*num) + delivery;
  console.log(amt);
  con.query("SELECT * FROM onedistin_users WHERE ID=?",[user],function(err,u_result){
    if(err)throw err;
    var ruser = u_result[0];
    var uaddress = ruser.user_address;
    var ucity = ruser.user_city;
    var uregion = ruser.user_loc;
    con.query("INSERT INTO onedistin_invoice (ID,user,dealTitle,dealTime,invoiceId,checkoutId,username,phone,categories,address,city,region,item_ref,type,paid) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[null,user,title,date,token,0,user_name,order_phone,cat,uaddress,ucity,uregion,item_ref,'2','0'],function(err,result){
      if(err)throw err;
      res.render('ussd-done',{amt:amt});
    });
  });
});

router.post('/payment', isLoggedIn, (req,res) => {
  var user = req.user.user_id;
  var token = tokenGen.getToken();
  token = token.substring(0,6);
  var body = req.body;
  var user_name = body.user_name;
  var region = body.user_region;
  var phone = body.user_phone;
  var address = body.user_address;
  var city = body.user_city;
  var category = body.category;
  if(Array.isArray(category)){
    var _category = category.join("-***-");
  }else if(category == "" || category == null || category == 'undefined' || category == 'Empty'){
    var _category = "no category";
  }else{
    var _category = category;
  }
  var item_det = body.item_no.split("-");
  var num = item_det[0]*1;
  var del = item_det[1]*1;
  var ttl = item_det[2]*1;
  if(del == 0){
    var delivery = 5;
  }else if(del == 1){
    var delivery = 10;
  }else {
    var delivery = 0;
  }
  var total = (ttl*num)+delivery;
  con.query("UPDATE onedistin_users SET user_address=?, user_city=?, user_name=?,user_phone=?,user_loc=? WHERE ID=?",[address,city,user_name,phone,region,user],function(err){
    if(err)throw err;
  });
  if(req.body.hubtel == "on"){
    con.query("SELECT title,ac_price FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"'",function(err,result){
      if(err) throw err;
      var post = result[0];
      var data = {

      "items": [
        {
          "name": post.title,
          "quantity": num,
          "unitPrice": ttl,
        },
        {
          "name": "Delivery fee",
          "quantity": 1,
          "unitPrice": delivery,
        }
      ],
      "totalAmount": total,
      "Description": "Getting a cheap deal from Onedistin",
      "callbackUrl": "https://onedistin.com/hubtel/callback",
      "returnUrl": "https://onedistin.com/hubtel/validate/",
      "merchantBusinessLogoUrl": "https://onedistin.com/img/onedistin_logo.png",
      "merchantAccountNumber": "HM2012170017",
      "cancellationUrl": "https://onedistin.com/p_c",
      "clientReference": "inv"+token,
    }

    let options = {
      method: 'POST',
      uri:'https://api.hubtel.com/v2/pos/onlinecheckout/items/initiate',
      headers: {
        'Host': 'api.hubtel.com',
        'Authorization': 'Basic '+process.env.HUBTEL_AUTH,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: data,
      json: true
    }

    rp(options).then(function(data){
      if(data.status === 'Success'){
        var clientReference = data.data.clientReference;
        var checkoutId = data.data.checkoutId;
        con.query("INSERT INTO onedistin_invoice (ID,user,dealTitle,dealTime,invoiceId,checkoutId,username,categories,address,city,region,item_ref,type)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",[null,user,post.title,currentDate.currentDate(),clientReference,checkoutId,user_name,_category,address,city,region,body.item_no,1],function(err){
          if(err)throw err;
        });
        res.redirect(data.data.checkoutUrl);
      }else{
        res.send("An error occured!");
      }
    });

    });
  }else if(req.body.ipay == "on"){
    con.query("SELECT title FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"'", function(err,d_result){
      if(err)throw err;
      res.redirect("/ipay?p_t="+d_result[0].title+"&j_wsdfk_sdkjfsah23452sdfe34532s43324dsf=fsa8df76adyfafd8adfysiuas7f8adsaifuag&ref_f_i_d="+body.item_no+"&cat="+_category);
    });
  }else if(req.body.ussd == "on"){
    con.query("SELECT title FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"'", function(err,d_result){
      if(err)throw err;
      res.redirect("/ussd?p_t="+d_result[0].title+"&j_wsdfk_sdkjfsah23452sdfe34532s43324dsf=fsa8df76adyfafd8adfysiuas7f8adsaifuag&ref_f_i_d="+body.item_no+"&cat="+_category);
    });
  }
});

function isLoggedIn(req,res,next){
  if (req.isAuthenticated())
  return next();

  res.redirect('/login');
}

module.exports = router;
