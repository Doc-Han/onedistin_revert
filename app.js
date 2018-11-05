var express = require('express');
require('dotenv').config();
var con = require('./config/db.js');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var favicon = require('express-favicon');
var logger = require('morgan');
var compression = require('compression');
var currentDate = require('./config/tools.js');
var secure = require('express-force-https');
var cloudinary = require('cloudinary');



var port = process.env.PORT || 8080;
var app = express();
//app.use(logger('dev'));
app.use(favicon(__dirname + '/public/img/onedistin_head.png'));
app.use(secure);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(compression());
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
  if(req.isAuthenticated() != false || req.isAuthenticated() != true || typeof req.isAuthenticated() == 'undefined'){
    res.locals.isAuthenticated = false;
  }else{
    res.locals.isAuthenticated = req.isAuthenticated();
  }
  if(typeof res.locals.isAuthenticated == 'undefined'){
    res.locals.isAuthenticated = false;
  }
  next();
});

app.use(function(req,res,next){
  res.locals.admin = req.session.admin;
  next();
});

/*app.get('/*',(req,res) =>{

  res.render('soon');
});*/
app.use(function(req,res,next){
  if(typeof req.session.date == 'undefined'){
    req.session.date = currentDate.currentDate();
    next();
  }else{
    if(req.session.date != currentDate.currentDate()){
      req.session.date = currentDate.currentDate();
      res.redirect('/');
    }else{
      next();
    }
  }
});
//Including all the routes available in this app
app.use('/', require('./Routes/main.js'));
app.use('/', require('./Routes/hubtel.js'));
app.use('/other', require('./Routes/other.js'));
app.use('/auth', require('./Routes/auth.js'))
app.use('/community', require('./Routes/forum.js'));
app.use('/han', require('./Routes/admin.js'));
app.use('/ajax', require('./Routes/ajax.js'));

app.get('*', (req,res) => {
  res.sendFile(__dirname + '/config/'+req.url);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // render the error page
    //res.status(err.status || 500);
    res.render('error');
});

//listening to a specific port
app.listen(port, function(err){
  if(err) throw err;
  console.log('Running @ '+ port);
});
