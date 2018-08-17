var express = require('express');
var con = require('../config/db.js');
var currentTime = require('../config/tools.js').currentTime();

var router = express.Router();

router.get('/', (req,res) => {
  var query = "SELECT * FROM onedistin_posts WHERE timestamp < '"+currentTime+"'";
  con.query(query,function(err,result){
    if (err) throw err;
    res.render('forum', {posts: result});
  });
});

router.get('/add', isLoggedIn, (req,res) => {
  res.render('add');
});

router.post('/add', (req,res) => {
  var title = req.body.title;
  var body = req.body.body;
  var url = title.split(" ").join("-");

  var date = new Date();
  var year = date.getFullYear();
  var _month = parseInt(date.getMonth())+1;
  var month = "0"+_month;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var currentDate = year+month+day+hour+minute+second;

  var author = req.user.user_id;
  var query = "INSERT INTO onedistin_posts (ID,post_author,post_title,post_content,post_url,timestamp)VALUES(?,?,?,?,?,?)";
  con.query(query,[null,author,title,body,url,currentDate], function(err){
    if(err)throw err;
    console.log("post Inserted!");
  });
  res.render('add');
});

router.post('/comment', (req,res) => {
  var comment = req.body.comment;
  var post_id = req.body.postId;
  var author = req.user.user_id;
  var date = new Date();
  con.query("SELECT display_name FROM onedistin_users WHERE ID=?",[author],function(err,result){
    if(err) throw err;
    const author_name = result[0].display_name;
    var query = "INSERT INTO onedistin_comments (ID,comment_post_ID,comment_author,comment_author_name,comment_content,comment_parent,timestamp)VALUES(?,?,?,?,?,?,?)";
    con.query(query,[null,post_id,author,author_name,comment,0,date],function(err){
      if(err)throw err;
      console.log("Comment Inserted!");
    });
    con.query("UPDATE onedistin_posts SET post_comments=(post_comments)+1 WHERE ID=?",[post_id],function(err){
      if(err) throw err;
    });
  });

  res.redirect('/');
});

router.get('/:title', (req,res) => {
  var url = req.params.title;
  var query = "SELECT * FROM onedistin_posts WHERE post_url= ?";
  con.query(query,[url],function(err,p_result){
    if (err)throw err;
    const postId = p_result[0].ID;
    con.query("SELECT * FROM onedistin_comments WHERE comment_post_ID=?",[postId],function(err,c_result){
      if(err)throw err;
      res.render('post', {post: p_result[0], comment: c_result});
    });

  });
});


function isLoggedIn(req,res,next){
  if (req.isAuthenticated())
  return next();

  res.redirect('/login');
}

module.exports = router;
