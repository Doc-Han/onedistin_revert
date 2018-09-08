var express = require('express');
var router = express.Router();

router.get('/p_s', (req,res) =>{
  res.render("ipay/p_s");
});

router.get('/p_c', (req,res) =>{
  res.render("ipay/p_c");
});

router.get('/d_p', (req,res) =>{
  res.send("Please we are not here yet!");
});

router.get('/payment', (req,res) =>{
  console.log(req.query);
  res.send("payment done");
});


module.exports = router;
