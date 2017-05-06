
/**
 *  Utenti.js
 *  In questo file ci saranno tutte le api relative agli utenti della piattaforma
 *  5/5/2017
 */

const middleware = require('./middleware/middleware');
const query = require('./../query/query.js');
const async = require('async');

module.exports = function (app, passport) {

    /**
     * home page
     */
    app.get('/', function (req, res) {
        res.render('index.ejs', {
            pageTitle: "marconiCC"
        });
    });


    /**
     * login page
     */
    app.get('/login', function (req, res) {
        res.render('login.ejs', {message: req.flash('loginMessage'), pageTitle: " login "});
    });


    /**
     * login post request
     */
    app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/studenti',
            failureRedirect: '/login',
            failureFlash: true
        }),
        function (req, res) {
            res.redirect('/');
        });


    /**
     * registration page
     */
    app.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage'), pageTitle: "signup"});
    });


    /**
     * registration post request
     */
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/studenti', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};



