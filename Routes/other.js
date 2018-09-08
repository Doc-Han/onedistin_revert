var express = require('express');
var con = require('../config/db.js');
var router = express.Router();

router.post('/like', (req,res) =>{
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

module.exports = router;
