var express = require('express');
var con = require('../config/db.js');
var rp = require('request-promise');
var tokenGen = require('../config/tools.js');
var currentDate = require('../config/tools.js');
var router = express.Router();

router.post('/like', isLoggedIn, (req,res) =>{
  var postId = req.body.postId;
  var user = req.user.user_id;
  var query = "SELECT * FROM onedistin_likes WHERE user=? AND postId=?";
  con.query(query, [user,postId], function(err,result){
    if(result.length > 0){
      con.query("DELETE FROM onedistin_likes WHERE user=? AND postId=?;UPDATE onedistin_posts SET post_likes=(post_likes)-1 WHERE ID=?",[user,postId,postId], function(err,result){
        if(err)throw err;
        res.send("0");
      });
    }else{
      con.query("INSERT INTO onedistin_likes (user,postId)VALUES(?,?);UPDATE onedistin_posts SET post_likes=(post_likes)+1 WHERE ID=?",[user,postId,postId], function(err,result){
        if(err)throw err;
        res.send("1");
      });
    }
  });
});

router.post('/survey', (req,res) =>{
  var ans = req.body.ans;
  if(req.isAuthenticated()){
    var user = req.user.user_id;
    if(ans == "one"){
      var query = "UPDATE onedistin_survey SET ans_one_no=(ans_one_no + 1) WHERE dealTime='"+currentDate.currentDate()+"';UPDATE onedistin_users SET survey='"+currentDate.currentDate()+"' WHERE ID=?;SELECT * FROM onedistin_survey WHERE dealTime='"+currentDate.currentDate()+"'";
    }else if(ans == "two"){
      var query = "UPDATE onedistin_survey SET ans_two_no=(ans_two_no + 1) WHERE dealTime='"+currentDate.currentDate()+"';UPDATE onedistin_users SET survey='"+currentDate.currentDate()+"' WHERE ID=?;SELECT * FROM onedistin_survey WHERE dealTime='"+currentDate.currentDate()+"'";
    }else if(ans == "three"){
      var query = "UPDATE onedistin_survey SET ans_three_no=(ans_three_no + 1) WHERE dealTime='"+currentDate.currentDate()+"';UPDATE onedistin_users SET survey='"+currentDate.currentDate()+"' WHERE ID=?;SELECT * FROM onedistin_survey WHERE dealTime='"+currentDate.currentDate()+"'";
    }else if(ans == "four"){
      var query = "UPDATE onedistin_survey SET ans_four_no=(ans_four_no + 1) WHERE dealTime='"+currentDate.currentDate()+"';UPDATE onedistin_users SET survey='"+currentDate.currentDate()+"' WHERE ID=?;SELECT * FROM onedistin_survey WHERE dealTime='"+currentDate.currentDate()+"'";
    }else if(ans == "five"){
      var query = "UPDATE onedistin_survey SET ans_five_no=(ans_five_no + 1) WHERE dealTime='"+currentDate.currentDate()+"';UPDATE onedistin_users SET survey='"+currentDate.currentDate()+"' WHERE ID=?;SELECT * FROM onedistin_survey WHERE dealTime='"+currentDate.currentDate()+"'";
    }else if(ans == "six"){
      var query = "UPDATE onedistin_survey SET ans_six_no=(ans_six_no + 1) WHERE dealTime='"+currentDate.currentDate()+"';UPDATE onedistin_users SET survey='"+currentDate.currentDate()+"' WHERE ID=?;SELECT * FROM onedistin_survey WHERE dealTime='"+currentDate.currentDate()+"'";
    }

    con.query(query, [user], function(err,result,next){
      if(err)throw err;
      res.send(JSON.stringify(result[2][0]));
    });
  }else{
    res.send("0");
  }

});

router.post('/ipay', isLoggedIn, (req,res) =>{
  var user = req.user.user_id;
  var body = req.body;
  var title = body.dealTitle;
  var provider = body.provider;
  var invoiceId = "i"+tokenGen.getToken();
  var username = body.username;
  var phone = body.phone;
  var cat = body.cat;
  var item_det = body.ref.split("-");
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
    "merchant_key": process.env.IPAY_MERCHANT_KEY,
    "invoice_id": invoiceId,
    "total": total,
    "pymt_instrument": phone,
    "extra_wallet_issuer_hint": provider,
  }
  let options = {
    method: 'POST',
    uri: 'https://community.ipaygh.com/v1/mobile_agents_v2',
    body: data,
    json: true
  }
  rp(options).then(function(data){
    console.log(data);
    if(data.success == true){
      var query = "INSERT INTO onedistin_invoice (ID,user,dealTitle,dealTime,invoiceId,username,phone)VALUES(?,?,?,?,?,?,?)";
      con.query(query,[null,user,title,currentDate.currentDate(),invoiceId,username,phone],function(err){
        if(err)throw err;
        res.send(invoiceId);
      });
    }else{
      res.send("0");
    }
  });

});

router.post('/ipay/validate', isLoggedIn, (req,res) =>{
  var invoiceId = req.body.invoiceId;
  let options = {
    method: 'GET',
    uri: 'https://community.ipaygh.com/v1/gateway/json_status_chk?invoice_id='+invoiceId+'&merchant_key='+process.env.IPAY_MERCHANT_KEY,
    json: true
  }
  rp(options).then(function(data){
    var status = data[invoiceId].status;
    if(status == "paid"){
      var query = "UPDATE onedistin_invoice SET paid=? WHERE invoiceId=?";
      con.query(query,[0,invoiceId],function(err){
        if(err)throw err;
        res.send("1");
      });
    }else if(status == "awaiting_payment"){
      res.send("2");
    }else{
      res.send("0");
    }
  });
});

router.post('/coupon', isLoggedIn, (req,res) =>{
  var code = req.body.code;
  con.query("SELECT percentage FROM onedistin_coupons WHERE code=?",[code],function(err,result){
    console.log(result);
    if(result.length > 0){
      res.send(result[0].percentage);
    }else{
      res.send("0");
    }
  });
});

function isLoggedIn(req,res,next){
  if (req.isAuthenticated())
  return next();

  res.redirect('/login');
}

module.exports = router;
