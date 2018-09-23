var express = require('express');
var con = require('../config/db.js');

var router = express.Router();

router.post('/validate/:field', (req,res) => {
  var field = req.params.field;
  if(field == "username"){
    var username = req.body.username;
    con.query("SELECT display_name FROM onedistin_users WHERE display_name=?",[username],function(err,result){
      if(err)throw err;
      if(result.length > 0){
        res.send("1");
      }else{
        res.send("0");
      }
    });
  }else if(field == "email"){
    var email = req.body.email;
    con.query("SELECT user_email FROM onedistin_users WHERE user_email=?",[email],function(err,result){
      if(err)throw err;
      if(result.length > 0){
        res.send("1");
      }else{
        res.send("0");
      }
    });
  }

});

router.post('/forgot', (req,res) =>{
  //console.log(req.body);
  if(req.body.username && !(req.body.phone)){
    var name = req.body.username;
    var query = "SELECT user_phone FROM onedistin_users WHERE display_name=?";
    con.query(query,[name.trim()],function(err,result){
      if(err)throw err;
      if(result.length > 0){
        res.send(result[0].user_phone);
      }else{
        res.send("0");
      }
    });
  }else if(req.body.phone){
    var phone = req.body.phone;
    var username = req.body.username;
    var query = "SELECT ID FROM onedistin_users WHERE user_phone=? AND display_name=?";
    con.query(query,[phone.trim(),username],function(err,result){
      if(err)throw err;
      console.log(result);
      if(result.length > 0){
        res.send('/reset/'+phone+'/'+result[0].ID);
      }else{
        res.send("0");
      }
    });
  }


});

module.exports = router;
