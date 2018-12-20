var express = require('express');
var router = express.Router();

router.get('/', (req,res) => {
  res.render('new/index');
});

module.exports = router;
