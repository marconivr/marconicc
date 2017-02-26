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
        query.getStudentiPrima(function (err, results) {
            if (err)
                console.log(err);
            else
                res.render('studenti.ejs', {
                    user: req.user,
                    pageTitle: " Studenti ",
                    studentsData: results
                });
        });
    });


    app.get('/get-classi-composte', middleware.isLoggedIn, function (req, res) {
        var classi;
        var nAlunniCompCl;
        var listaClassi = [];
        var listaNomiClassi = [];
        var listaAlunniClasse = [];


        query.getNumberAlunniClassi("prima", function (err, results) {
            if (err)
                console.log(results);
            else {
                nAlunniCompCl = results[0].result;
                if (nAlunniCompCl == 0) {
                    alg.loadListAlunni("prima", function (err, results) {
                        if (err)
                            console.log(err);
                        else {
                            classi = results;
                            query.insertClassi(alg.listaNomiClassi());
                            for (var i = 0; i < classi.length; i++) {
                                for (var k = 0; k < classi[i].alunni.length; k++) {
                                    if (classi[i].alunni[k] !== undefined) {
                                        query.insertAlunnoInClass(classi[i].nome, classi[i].alunni[k].cf);
                                    }
                                }
                            }
                        }
                    });

                    console.log(classi);
                    res.send(classi);

                } else {
                    query.getClassi(function (err, results) {
                        if (err)
                            console.log(err);
                        else {
                            listaNomiClassi = results;
                            for (var i = 0; i < listaNomiClassi.length; i++) {
                                query.getAlunniFromClass(listaNomiClassi[i].nome, function (err, results, nomeCl) {
                                    if (err)
                                        console.log(err);
                                    else {
                                        listaAlunniClasse = results;
                                        listaClassi.push({nome: nomeCl, alunni: listaAlunniClasse});
                                        console.log(listaClassi);
                                    }
                                });
                            }
                            classi = listaClassi;
                            console.log(classi);
                            res.send(classi);
                        }
                    });
                }
            }
        });
    });



};




