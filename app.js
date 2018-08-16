var express = require('express');
var con = require('./config/db.js');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var bcrypt = require('bcrypt');

var port = process.env.PORT || 8080;
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));
var options = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'onedistin.db'
}

var sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'onedistin-session',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use(function(req,res,next){
  res.locals.admin = req.session.admin;
  next();
});


//Including all the routes available in this app
app.use('/', require('./Routes/main.js'));
app.use('/forum', require('./Routes/forum.js'));
app.use('/admin', require('./Routes/admin.js'));


//listening to a specific port
app.listen(port, function(err){
  if(err) throw err;
  console.log('Running @ '+ port);
});
