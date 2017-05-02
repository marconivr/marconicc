/**
 * Created by matti on 10/11/2016.
 */

var middleware = require('./middleware/middleware');
var query = require('./../query/query.js');
var alg = require("./algorithm.js");
var dataInSettings = new Object();
var async = require('async');
module.exports = function (app, passport) {

    /**
     * home page
     */
    app.get('/', function (req, res) {
        res.render('index.ejs', {
            pageTitle: "Composizione classi"
        }); // load the index.ejs file
    });


    /**
     * login page
     */
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
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
            ;

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
    app.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage'), pageTitle:"signup"});
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


    app.get('/insert-from-csv', function (req, res) { // render the page and pass in any flash data if it exists
        res.render('insert-from-csv.ejs', {
            pageTitle: " main "
        });
    });

    app.get('/all-tag', function (req, res) {
        query.getAllTag(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        });
    });

    app.get('/update-tag', function (req, res) {

        query.updateTagFromCF(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        },req.query.tag, req.query.cf);
    });



    app.get('/all-students', function (req, res) {
        query.getAllStudents(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        },req.query.q);
    });


    app.get('/student-by-cf', function (req, res) {
        query.getStudentByCf(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        },req.query.cf);
    });

    app.get('/panoramica-classi', middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists
        query.getPriorita(function (err, results) {
            if (err)
                throw err;
            else
                alg.createArrayPriorita(results);
        })

        res.render('panoramica-classi.ejs',{
            pageTitle: "Panoramica classi   "
        })
    });

    app.get('/panoramica-classi', middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists
        res.render('panoramica-classi.ejs',{
            pageTitle: "Panoramica classi   "
        })
    });

    app.get('/settings', middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists
        res.render('settings.ejs',{
            pageTitle: "Settings   "
        })
    });
    
    app.get('/settings-prime', middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists

        async.parallel({
            studentiPrima: function (callback) {
                query.getNumberOfStudentiPrima(function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'studenti': results})
                });
            },

            femminePrima: function (callback) {
                query.getNumberGirl(function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'femmine': results})
                },"PRIMA");
            },
            mediaPrima: function (callback) {
                query.getAVGOfStudentiPrima(function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'media': results})
                });
            }
        }, function (err, results) {
            res.render('settings-prime.ejs', {
                user: req.user,
                pageTitle: " Settings prime ",
                studentiPrima: results.studentiPrima.studenti,
                femminePrima: results.femminePrima.femmine,
                mediaPrima: results.mediaPrima.media
            });

        });
    });

    app.get('/settings-terze', middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists

        res.render('settings-terze.ejs', {
            pageTitle: " Settings terze",
            data:JSON.stringify(dataInSettings)
        });
    });

    /**
     * inserisce le impostazioni delle prime
     */
    app.get('/insert-settings-prime', function (req, res) {
        query.insertSettingsPrime(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        }, req.query.data, req.query.descrizione, req.query.alunniMin, req.query.alunniMax, req.query.femmine, req.query.stranieri, req.query.residenza, req.query.nazionalita, req.query.naz_per_classe, req.query.max_al_104);
    });

    /**
     * inserisce le impostazioni delle prime
     */
    app.get('/insert-settings-terze', function (req, res) {
        query.insertSettingsTerze(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        }, req.query.data, req.query.descrizione, req.query.alunniMin, req.query.alunniMax, req.query.femmine, req.query.stranieri, req.query.residenza, req.query.iniziale, req.query.ripetenti);
    });

    /**
     * inserisce le priorita
     */
    app.get('/insert-priorita', function (req, res) {
        query.insertPriorita(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        }, req.query.priorita);
    });
};