var express = require('express');
var tokenGen = require('../config/tools.js');
var con = require('../config/db.js');
var currentDate = require('../config/tools.js');
var rp = require('request-promise');
var router = express.Router();

router.get('/p_s', (req,res) =>{
  res.render("payment/payment_sent");
});

router.get('/p_c', (req,res) =>{
  if(req.query){
    var checkoutid = req.query.checkoutid;
    con.query("DELETE FROM onedistin_invoice WHERE checkoutid=?",[checkoutid],function(err,result){
      if(err)throw err;
    });
  }
  res.render("payment/payment_cancelled");
});

router.get('/d_p', (req,res) =>{
  res.send("Please we are not here yet!");
});

router.get('/hubtel/callback', (req,res) =>{
  var body = req.body;
  console.log(body);
  res.send("Thanks You!");
});

router.get('/ipay', (req,res) =>{
  var user = req.user.user_id;
  con.query("SELECT user_name FROM onedistin_users WHERE ID=?",[user], function(err,result){
    if(err)throw err;
    var user_name = result[0].user_name;

    var item_det = req.query.ref_f_i_d.split("-");
    var num = item_det[0]*1;
    var del = item_det[1]*1;
    if(del == 0){
      var delivery = 5;
    }else{
      var delivery = 10;
    }
    var total = ((item_det[2]*1)*num)+delivery;
    var data = {
      item_det: req.query.ref_f_i_d,
      item_title: req.query.p_t,
      total: total,
      user_name: user_name
    }
    res.render('payment/ipay',{data: data});
  });
});

router.get('/ussd', (req,res) =>{
  var user = req.user.user_id;
  con.query("SELECT user_name FROM onedistin_users WHERE ID=?",[user], function(err,result){
    if(err)throw err;
    var user_name = result[0].user_name;

    var item_det = req.query.ref_f_i_d.split("-");
    var num = item_det[0]*1;
    var del = item_det[1]*1;
    if(del == 0){
      var delivery = 5;
    }else{
      var delivery = 10;
    }
    var total = ((item_det[2]*1)*num)+delivery;
    var data = {
      item_det: req.query.ref_f_i_d,
      item_title: req.query.p_t,
      total: total,
      user_name: user_name
    }
    res.render('ussd',{data: data});
  });
});

router.post('/ussd', (req,res) =>{
  user = req.user.user_id;
  var token = tokenGen.getToken();
  token = "ussd"+token.substring(0,6);
  var body = req.body;
  var title = body.p_t;
  var user_name = body.order_user_name;
  var order_phone = body.order_phone;
  var date = currentDate.currentDate();
  con.query("INSERT INTO onedistin_invoice (ID,user,dealTitle,dealTime,invoiceId,checkoutId,username,phone) VALUES (?,?,?,?,?,?,?,?)",[null,user,title,date,token,0,user_name,order_phone],function(err,result){
    if(err)throw err;
    res.render('ussd-done');
  });
});

router.post('/payment', (req,res) => {
  var user = req.user.user_id;
  var token = tokenGen.getToken();
  token = token.substring(0,6);
  var body = req.body;
  var item_det = body.item_no.split("-");
  var num = item_det[0]*1;
  var del = item_det[1]*1;
  var ttl = item_det[2]*1;
  if(del == 0){
    var delivery = 5;
  }else{
    var delivery = 10;
  }
  var total = (ttl*num)+delivery;
  if(req.body.hubtel == "on"){
    con.query("SELECT title,ac_price FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"'",function(err,result){
      if(err) throw err;
      var post = result[0];
      var data = {

      "items": [
        {
          "name": post.title,
          "quantity": num,
          "unitPrice": ttl*num,
        },
        {
          "name": "Delivery fee",
          "quantity": 1,
          "unitPrice": delivery,
        }
      ],
      "totalAmount": total,
      "Description": "Getting a cheap deal from Onedistin",
      "callbackUrl": "https://onedsitin.herokuapp.com/hubtel/callback",
      "returnUrl": "http://hubtel.com/online",
      "merchantBusinessLogoUrl": "http://hubtel.com/online",
      "merchantAccountNumber": "HM2012170017",
      "cancellationUrl": "http://onedistin.herokuapp.com/p_c",
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
        var checkoutId =data.data.checkoutId;
        con.query("INSERT INTO onedistin_invoice (ID,user,dealTitle,dealTime,invoiceId,checkoutId)VALUES(?,?,?,?,?,?)",[null,user,post.title,currentDate.currentDate(),clientReference,checkoutId],function(err,result){
          if(err)throw err;
        });
        res.redirect(data.data.checkoutUrl);
      }else{
        res.send("An error occured!");
      }
      console.log(data);
    });

    });
  }else if(req.body.ipay == "on"){
    con.query("SELECT title FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"'", function(err,d_result){
      if(err)throw err;
      res.redirect("/ipay?p_t="+d_result[0].title+"&ref_f_i_d="+body.item_no);
    });
  }else if(req.body.ussd == "on"){
    con.query("SELECT title FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"'", function(err,d_result){
      if(err)throw err;
      res.redirect("/ussd?p_t="+d_result[0].title+"&ref_f_i_d="+body.item_no);
    });
  }
});

module.exports = router;
