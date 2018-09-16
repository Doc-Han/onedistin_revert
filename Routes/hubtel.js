var express = require('express');
var tokenGen = require('../config/tools.js');
var con = require('../config/db.js');
var currentDate = require('../config/tools.js');
var rp = require('request-promise');
var router = express.Router();

router.get('/hubtel', (req,res) =>{


});

router.get('/ussd', (req,res) =>{
  res.render('ussd');
});

router.post('/payment', (req,res) => {
  var user = req.user.user_id;
  var token = tokenGen.getToken();
  token = token.substring(0,6);
  if(req.body.hubtel == "on"){
    var body = req.body;
    var item_det = body.item_no.split("-");
    var num = item_det[0]*1;
    var del = item_det[1]*1;
    var total = item_det[2]*1;
    if(del == 0){
      var delivery = 5;
    }else{
      var delivery = 10;
    }
    con.query("SELECT title,ac_price FROM onedistin_deals WHERE timestamp='"+currentDate.currentDate()+"'",function(err,result){
      if(err) throw err;
      var post = result[0];
      var data = {

      "items": [
        {
          "name": post.title,
          "quantity": num,
          "unitPrice": post.ac_price,
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
        con.query("INSERT INTO onedistin_invoice (ID,user,dealTime,invoiceId)VALUES(?,?,?,?)",[null,user,currentDate.currentDate(),clientReference],function(err,result){
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
    res.send("It was Ipay!");
  }
});

module.exports = router;
