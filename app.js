var express = require('express');
require('dotenv').config();
var con = require('./config/db.js');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var logger = require('morgan');
var cloudinary = require('cloudinary');


var port = process.env.PORT || 8080;
var app = express();

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(express.static('./public'));
var options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}


var sessionStore = new MySQLStore(options);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: Date.now()+(7889400000),
  }
}));
app.use(passport.initialize());
app.use(passport.session());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_USERNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
app.use('/', require('./Routes/ipay.js'));
app.use('/forum', require('./Routes/forum.js'));
app.use('/admin', require('./Routes/admin.js'));
app.use('/ajax', require('./Routes/ajax.js'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//listening to a specific port
app.listen(port, function(err){
  if(err) throw err;
  console.log('Running @ '+ port);
});
