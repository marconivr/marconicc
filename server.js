// imposto vari moduli
const express  = require('express');
const session  = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const port = 8080;
const passport = require('passport');
const flash = require('connect-flash');
const https = require('https');
const fs = require('fs');
const middleware = require('./routes/middleware/middleware');
const endpoint = require('./routes/endpoint/endpoint');
const path = require('path');


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

app.locals.endpoint = endpoint;

middleware.setApp(app);

// routes ======================================================================
require('./routes/utenti.js')(app, passport);
require('./routes/alunni.js')(app);


// launch ======================================================================
app.listen(port, '127.0.0.1');


console.log('Magic on --> localhost:' + port);



