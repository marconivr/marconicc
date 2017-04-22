/**
 * Created by matti on 10/11/2016.
 */


var query = require('./../query/query.js');
var csv = require("csv");
var middleware = require('./middleware/middleware');
var alg = require("./algorithm.js");
var async = require('async');

module.exports = function (app, passport, upload) {


    app.post('/upload-csv', upload.single('csv'), middleware.isLoggedIn, function (req, res) {

        var data = req.file; //information about data uploaded (post method)

        csv().from.path(data.path, {
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
        alg.creaInsiemi(); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
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
                                        listaClassi.push({nome: nomeCl, proprieta:alg.createProprietaClasse(listaAlunniClasse),  alunni: listaAlunniClasse});
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
    });


    app.post('/move-student', middleware.isLoggedIn, function (req, res) {
        console.log(req);
        alg.addStundentInClss(req.cf, req.fromClass, req.toClass, true);
        console.log("Salvo sul db");
        res.send("ok arrivato al db");
    });

    app.get('/get-past-settings-prime', middleware.isLoggedIn, function (req, res) {
        query.getSettingsPrime(function (err, results) {
            if (err)
                err
            else {
                res.send(results);
            }
        });
    });

    app.get('/get-past-settings-terze', middleware.isLoggedIn, function (req, res) {
        query.getSettingsTerze(function (err, results) {
            if (err)
                err
            else {
                res.send(results);
            }
        });
    });
};




