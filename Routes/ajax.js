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

module.exports = router;
