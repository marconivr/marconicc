// imposto vari moduli
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var port = process.env.PORT || 8080;
var passport = require('passport');
var flash = require('connect-flash');
var multer = require('multer');
var upload = multer({ dest: 'files/' });



// configurazione passport
require('./config/passport')(passport);


// settaggi express
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public'));


// routes ======================================================================
require('./routes/main.js')(app, passport); // import routes users
require('./routes/data.js')(app, passport,upload);


// launch ======================================================================
app.listen(port);
console.log('Magic on --> localhost:' + port);



