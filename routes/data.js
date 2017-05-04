/**
 * Created by matti on 10/11/2016.
 */


var query = require('./../query/query.js');
var csv_post = require("csv");
var middleware = require('./middleware/middleware');
var newAlg = require("./new-algorithm.js");
var alg = require("./algorithm.js");
var async = require('async');
var csv = require('express-csv');

module.exports = function (app, passport, upload) {


    app.post('/upload-csv', upload.single('csv'), middleware.isLoggedIn, function (req, res) {

        var data = req.file; //information about data uploaded (post method)

        csv_post().from.path(data.path, {
            delimiter: ";",
            escape: ''
        })

            .on("record", function (row, index) {

                query.insertRecordFromCSV(row);

            }).on("error", function (error) {

            console.log(error);

        }).on("end", function () {

            console.log("Finita lettura file");
            res.redirect('/studenti');
        });


    });


    app.get('/studenti-prima-json', middleware.isLoggedIn, function (req, res) {

        query.getStudentiPrima(function (err, results) {
            if (err)
                console.log(err);
            else
                res.send(JSON.stringify(results));
        });
    });

    /**
     * Per visualizzare il numero di ragazze di prima
     */
    app.get('/numero-ragazze-prima', middleware.isLoggedIn, function (req, res) {

        query.getNumberGirl(function (err, results) {
            if (err)
                console.log(err);
            else
                res.send(JSON.stringify(results));
        }, "PRIMA");
    });

    /**
     * Per visualizzare il numero di ragazzi stesso cap con * altrimenti si specifica il codice catastale
     */
    app.get('/numero-stesso-cap', middleware.isLoggedIn, function (req, res) {

        query.getNumberSameResidence(function (err, results) {
            if (err)
                console.log(err);
            else
                res.send(JSON.stringify(results));
        }, "PRIMA", 37030, "*");
    });

    /**
     * Elenco studenti in tabella
     */
    app.get('/studenti', middleware.isLoggedIn, function (req, res) {

        async.parallel({
            studentiPrima: function (callback) {
                query.getStudentiPrima(function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'prima': results})
                });
            },

            studentiTerza: function (callback) {
                query.getStudentiTerza(function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'terza': results})
                });
            }
        }, function (err, results) {
            res.render('studenti.ejs', {
                user: req.user,
                pageTitle: " Studenti ",
                studentsPrima: results.studentiPrima.prima,
                studentsTerza: results.studentiTerza.terza
            });

        });
    });

    app.get('/get-classi-composte', middleware.isLoggedIn, function (req, res) {
        var classi;
        var nAlunniCompCl;
        var listaClassi = [];
        var listaNomiClassi = [];
        var listaAlunniClasse = [];

        var insiemi = null;

        alg.creaInsiemi(function (err, result) {
            if (err){
                console.log(err)
            }else {
                insiemi = result;
                alg.setInsiemi(insiemi);
                query.getNumberAlunniClassi("prima", function (err, results) {
                    if (err)
                        console.log(results);
                    else {
                        nAlunniCompCl = results[0].result;
                        if (nAlunniCompCl == 0) {
                            alg.firstGeneration("prima", function (err) {
                                if (err)
                                    console.log(err);
                                else {
                                    classi = alg.getListaClassi();
                                    query.insertClassi(alg.listaNomiClassi());
                                    for (var i = 0; i < classi.length; i++) {
                                        for (var k = 0; k < classi[i].alunni.length; k++) {
                                            if (classi[i].alunni[k] !== undefined) {
                                                query.insertAlunnoInClass(classi[i].nome, classi[i].alunni[k].cf);
                                            }
                                        }
                                    }
                                    alg.fixClassi();
                                    res.send(alg.getListaClassi());
                                }
                            });
                        } else {
                            query.getClassi(function (err, results) {
                                if (err)
                                    console.log(err);
                                else {

                                    listaNomiClassi = results;
                                    var counter = 0;
                                    for (var i = 0; i < listaNomiClassi.length; i++) {
                                        query.getAlunniFromClassSync(listaNomiClassi[i].nome, counter, function (err, results, nomeCl, counter) {
                                            if (err)
                                                console.log(err);
                                            else {
                                                listaAlunniClasse = results;
                                                listaClassi.push({nome: nomeCl, propAttuali:alg.createProprietaClasse(listaAlunniClasse),  alunni: listaAlunniClasse});
                                                if (counter  == listaNomiClassi.length - 1){
                                                    alg.setListaClassi(listaClassi);
                                                    alg.fixClassi();
                                                    alg.printProprieta();
                                                    res.send(alg.getListaClassi());
                                                }
                                            }
                                        });
                                        counter++;
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    });


    app.get('/generate-classi' ,middleware.isLoggedIn,function (req,res) {


        newAlg.generaClassiPrima(function (classi) {
                res.send(classi);
        });

    });

                                                                                    //TRY
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Dummy users
    var users = [
        { id: 0, name: 'tj', email: 'tj@vision-media.ca', role: 'member' }
        , { id: 1, name: 'ciaran', email: 'ciaranj@gmail.com', role: 'member' }
        , { id: 2, name: 'aaron', email: 'aaron.heckmann+github@gmail.com', role: 'admin' }
    ];

    function loadUser(req, res, next) {
        // You would fetch your user from the db
        var user = users[req.params.id];
        if (user) {
            req.user = user;
            next();
        } else {
            next(new Error('Failed to load user ' + req.params.id));
        }
    }



    function andRestrictToSelf(req, res, next) {
        // If our authenticated user is the user we are viewing
        // then everything is fine :)
        if (req.authenticatedUser.id == req.user.id) {
            next();
        } else {
            // You may want to implement specific exceptions
            // such as UnauthorizedError or similar so that you
            // can handle these can be special-cased in an error handler
            // (view ./examples/pages for this)
            next(new Error('Unauthorized'));
        }
    }

    function andRestrictTo(role) {
        return function(req, res, next) {
            res.locals.user = "aa";
            if (middleware.globalVar.id == role) {
                next();
            } else {
                next(new Error('Unauthorized'));
            }
        }
    }

// Middleware for faux authentication
// you would of course implement something real,
// but this illustrates how an authenticated user
// may interact with middleware

    app.use(function(req, res, next){
        req.authenticatedUser = users[0];
        next();
    });

    app.get('/', function(req, res){
        res.redirect('/user/0');
    });

    app.get('/user/:id', loadUser,  andRestrictTo('admin'),  function(req, res){
        res.send('Viewing user ' + req.user.name);
    });

    app.get('/user/:id/edit', loadUser, andRestrictToSelf, function(req, res){
        res.send('Editing user ' + req.user.name);
    });

    app.delete('/user/:id', loadUser, andRestrictTo('admin'), function(req, res){
        res.send('Deleted user ' + req.user.name);
    });



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    app.post('/move-student', middleware.isLoggedIn, function (req, res) {

        //update student class
        query.updateAlunnoClass(function (err, results) {
            if (err)
                res.send(err);
            else
                console.log("Salvo sul db");
        }, req.body.cf, req.body.toClass);

        //populate history
        var saveHistory = (req.body.saveHistory == 'true');
        if (saveHistory && req.body.toClass != req.body.fromClass) {
            query.insertHistory(function (err, results) {
            if (err)
                console.log(err);
            else
                res.send(err);
        }, req.body.cf, req.body.toClass, req.body.fromClass, req.body.id_utente, req.body.anno_scolastico);
        }
    });

    app.get('/get-past-settings-prime', middleware.isLoggedIn, function (req, res) {
        query.getSettingsPrime(function (err, results) {
            if (err)
                console.log(err);
            else {
                res.send(results);
            }
        });
    });

    app.get('/get-dati-prime', middleware.isLoggedIn, function (req, res) {
        var dati = {};

        query.getNumberOfStudentiPrima(function (err, results) {
            if (err)
                console.log(err);
            else {
                dati["alunni"] = results[0]["result"];
            }
        });

        query.getNumberGirl(function (err, results) {
            if (err)
                console.log(err);
            else {
                dati["femmine"] = results[0]["result"];
            }
        }, "PRIMA");

        query.getAVGOfStudentiPrima(function (err, results) {
            if (err)
                console.log(err);
            else {
                dati["media"] = results[0]["result"];
            }
        });

        res.send(dati);
    });

    app.get('/get-history', middleware.isLoggedIn, function (req, res) {
        query.getHistory(function (err, results) {
            if (err)
                err
            else {
                res.send(results);
            }
        });
    });

    app.get('/remove-student-from-history', middleware.isLoggedIn, function (req, res) {
        query.deleteStudentFromHistory(function (err, results) {
            if (err)
                err
            else {
                res.send(results);
            }
        }, req.query.cf);
    });
    
    

    app.get('/get-past-settings-terze', middleware.isLoggedIn, function (req, res) {
        query.getSettingsTerze(function (err, results) {
            if (err)
                console.log(err);
            else {
                res.send(results);
            }
        });
    });

    app.get('/export-single-csv',middleware.isLoggedIn,function (req,res){
        query.getClassiComposteForExport(function (err, results) {
            if(err){
                console.log(err);
                res.send("errore");
            }
            else{
                res.setHeader('Content-disposition', 'attachment; filename=export.csv');
                res.set('Content-Type', 'text/csv');
                res.csv(results);
            }
        })

    });
};




