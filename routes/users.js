/**
 * Created by matti on 10/11/2016.
 */

var middleware = require ('./middleware/middleware');


module.exports = function(app, passport) {

    /**
     * home page
     */
    app.get('/', function(req, res) {
        res.render('index.ejs', {
            pageTitle : "Composizione classi"
        }); // load the index.ejs file
    });


    /**
     * login page
     */
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage'), pageTitle : " login " });
    });


    /**
     * login post request
     */
    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/home',
            failureRedirect : '/login',
            failureFlash : true
        }),
        function(req, res) {;

            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });


    /**
     * registration page
     */
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });


    /**
     * registration post request
     */
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    /**
     * profile -> if is logged
     */
    app.get('/home', middleware.isLoggedIn, function(req, res) {
        res.render('home.ejs', {
            user : req.user ,
            pageTitle : " main "
        });
    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    app.get('/insert-from-csv',function (req, res) { // render the page and pass in any flash data if it exists
        res.render('insert-from-csv.ejs', {
            pageTitle : " main "
        });
    });

    app.get('/example-page', middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists
        res.render('example.ejs', {
            pageTitle : " example "
        });
    });


};