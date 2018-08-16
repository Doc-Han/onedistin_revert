var mysql = require('mysql');

var con = mysql.createConnection({
  host: 'db4free.net',
  user: 'farhano123',
  password: 'allahuakbar1',
  database: 'onedistin',
});

module.exports = con;
