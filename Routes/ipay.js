var express = require('express');
var router = express.Router();

router.get('/p_s', (req,res) =>{
  res.send("Your payment is now being approved!");
});

router.get('/p_c', (req,res) =>{
  res.send("Please do you have any reason for cancelling our payment. Please let us know. call: 02444444444");
});

router.get('/d_p', (req,res) =>{
  res.send("Please we are not here yet!");
});

router.get('/payment', (req,res) =>{
  console.log(req.query);
  res.send("payment done");
});


module.exports = router;
