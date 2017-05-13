/**
 * Created by mattia on 05/05/17.
 */


const query = require('./../query/query.js');
const csv_post = require("csv");
const middleware = require('./middleware/middleware');
const newAlg = require("./new-algorithm.js");
const async = require('async');
const csv = require('express-csv');
const endpoint = require('./endpoint/endpoint.js');
const sessione = require('./../query/sessione.js');
const _ = require('lodash');

const multer = require('multer');
const upload = multer({ dest: 'files/' });


module.exports = function (app) {



    app.get(endpoint.alunni.uploadAlunniCsv, function (req, res) {
        res.render('insert-from-csv.ejs', {
            pageTitle: " main "
        });
    });

    app.post(endpoint.alunni.uploadAlunniCsv, upload.single('csv'), middleware.isLoggedIn, function (req, res) {

        const data = req.file;
        const pathFile = data.path;
        const scuola = req.user.id_scuola;
        const utente = req.user.id;

        csv_post().from.path(pathFile, {
            delimiter: ";",
            escape: ''

        }).on("record", function (row, index) {

                query.insertRecordFromCSV(row,scuola,utente);

        }).on("end", function () {

            console.log("LETTURA FILE RIUSCITA");
            res.redirect(endpoint.alunni.studenti);

        }).on("error", function (error) {

            console.error(error);
        });
    });

    app.get(endpoint.alunni.allTag, middleware.isLoggedIn, function (req, res) {
        const scuola = req.user.id_scuola;

        query.getAllTag(scuola, function (err, results) {
            if (err)
                console.log(err);
            else
                res.send(JSON.stringify(results));
        });
    });

    app.get(endpoint.alunni.updateTag, middleware.isLoggedIn, middleware.restrictTo([0, 1]), function (req, res) {
        
            query.updateTagFromCF(function (err, results) {
                if (err)
                    throw err;
                else
                    res.send(JSON.stringify(results));
            }, req.query.tag, req.query.cf);

    });

    app.get(endpoint.alunni.getStudentsFromSpecifiCYear, middleware.isLoggedIn, function (req, res) {


        query.getStudentsFromSpecifiYear(req.user.id_scuola, req.query.classe_futura, req.query.anno_scolastico, function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        });

    });
    

    app.get(endpoint.alunni.allStudents, middleware.isLoggedIn, function (req, res) {
        const scuola = req.user.id_scuola;
        const annoScolastico = req.query.annoScolastico;
        const classeFutura = req.query.classeFutura;

        const param = req.query.q;
        query.getAllStudents(param, scuola, annoScolastico, classeFutura, function (err, results) {
            if (err)
                console.log(err);
            else
                res.send(JSON.stringify(results));
        });
    });


    app.get(endpoint.alunni.studentByCf, middleware.isLoggedIn, function (req, res) {
        query.getStudentByCf(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        },req.query.cf, req.user.id_scuola);
    });

    app.get(endpoint.alunni.panoramicaClassi, middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists
        query.getPriorita(function (err, results) {
            if (err)
                throw err;
            else
                alg.createArrayPriorita(results);
        })

        res.render('panoramica-classi.ejs', {
            pageTitle: "Panoramica classi   "
        })
    });

    app.get(endpoint.utenti.creaUtente, middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists

        res.render('crea-utente.ejs', {
            pageTitle: "Creazione utente "
        })
    });

    app.get(endpoint.alunni.panoramicaClassi, middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists
        res.render('panoramica-classi.ejs', {
            pageTitle: "Panoramica classi   "
        })
    });

    app.get(endpoint.alunni.settings, middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists
        res.render('settings.ejs', {
            pageTitle: "Settings   "
        })
    });

    app.get(endpoint.alunni.tagAlunni, middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists

        async.parallel({
            tagAlunni: function (callback) {
                const scuola = req.user.id_scuola;
                query.getAllTagName(scuola, function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'tag': results})
                });
            }
        }, function (err, results) {
            res.render('tag-alunni.ejs', {
                user: req.user,
                pageTitle: " Tag alunni ",
                tagAlunni: results.tagAlunni.tag
            });

        });
    });

    /**
     * inserisce i tag
     */
    app.get(endpoint.alunni.insertTag, function (req, res) {
        const scuola = req.user.id_scuola;
        query.insertTag(scuola, req.query.tag, function (err, results) {
            if (err)
                res.send(err);
            else
                res.send(JSON.stringify(results));
        });

    });

    app.get(endpoint.alunni.settingsPrime, middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists

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
                query.getNumberGirl("PRIMA", function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'femmine': results})
                });
            },
            mediaPrima: function (callback) {
                query.getAVGOfStudentiPrima(function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'media': results})
                });
            },
            stranieriPrima: function (callback) {
                query.getNumberStranieri("PRIMA", function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'stranieri': results})
                });
            }
        }, function (err, results) {
            res.render('settings-prime.ejs', {
                user: req.user,
                pageTitle: " Settings prime ",
                studentiPrima: results.studentiPrima.studenti,
                femminePrima: results.femminePrima.femmine,
                mediaPrima: results.mediaPrima.media,
                stranieriPrima: results.stranieriPrima.stranieri
            });

        });
    });

    app.get(endpoint.alunni.settingsTerze, middleware.isLoggedIn, function (req, res) { // render the page and pass in any flash data if it exists

        res.render('settings-terze.ejs', {
            pageTitle: " Settings terze",
            data: JSON.stringify(dataInSettings)
        });
    });

    /**
     * inserisce le impostazioni delle prime
     */
    app.get(endpoint.alunni.insertSettingsPrime, function (req, res) {
        const scuola = req.user.id_scuola;
        query.insertSettingsPrime(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        }, scuola, req.query.data, req.query.descrizione, req.query.alunniMin, req.query.alunniMax, req.query.femmine, req.query.residenza, req.query.nazionalita, req.query.naz_per_classe, req.query.max_al_104);

    });

    /**
     * inserisce le impostazioni delle prime
     */
    app.get(endpoint.alunni.insertSettingsTerze, function (req, res) {
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
    app.get(endpoint.alunni.numeroRagazzePrima, middleware.isLoggedIn, function (req, res) {

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
    app.get(endpoint.alunni.numeroStessoCap, middleware.isLoggedIn, function (req, res) {

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
    app.get(endpoint.alunni.studenti, middleware.isLoggedIn, function (req, res) {

        const scuola = req.user.id_scuola;

        sessione.classiSettaggiDefault(scuola, function (err, obj) {
            if (err) {
                console.log(err);
            } else {
                //raggruppo per classe futura(es: PRIMA o TERZA)
                app.locals.dropDown = _.groupBy(obj, function (o) {
                    return o.classe_futura;
                });

                app.locals.sessioneIniziale = {
                    classeFutura: obj[0].classe_futura,
                    annoScolastico:obj[0].anno_scolastico
                }

                res.render('studenti.ejs', {
                    pageTitle: " Studenti "
                });
            }


        });


    });

    app.get(endpoint.alunni.getClassiComposte, middleware.isLoggedIn, function (req, res) {
        var classi;
        var nAlunniCompCl;
        var listaClassi = [];
        var listaNomiClassi = [];
        var listaAlunniClasse = [];

        var insiemi = null;

        alg.creaInsiemi(function (err, result) {
            if (err) {
                console.log(err)
            } else {
                insiemi = result;
                alg.setInsiemi(insiemi);
                query.getNumberAlunniClassi("prima", function (err, results) {
                    if (err)
                        console.log(results);
                    else {
                        nAlunniCompCl = results[0].result;
                        if (nAlunniCompCl === 0) {
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
                                                listaClassi.push({
                                                    nome: nomeCl,
                                                    propAttuali: alg.createProprietaClasse(listaAlunniClasse),
                                                    alunni: listaAlunniClasse
                                                });
                                                if (counter === listaNomiClassi.length - 1) {
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


    app.get(endpoint.alunni.generateClassi, middleware.isLoggedIn, function (req, res) {
        const scuola = req.user.id_scuola;
        const annoScolastico = "2017-2018";
        const classeFutura = "PRIMA"; //todo:dipende dal dropdown

        newAlg.generaClassiPrima(annoScolastico, scuola, classeFutura, function (classi) {
            res.send(classi);
        });

    });


    app.post(endpoint.alunni.moveStudent, middleware.isLoggedIn, middleware.restrictTo([0, 1]), function (req, res) {
        //update student class
        query.updateAlunnoClass(req.body.cf, req.body.toClass, function (err, results) {
            if (err)
                res.send(err);
            else
                console.log("Salvo sul db");
        });

        //populate history
        var saveHistory = (req.body.saveHistory === 'true');
        if (saveHistory && req.body.toClass !== req.body.fromClass) {
            query.insertHistory(function (err, results) {
                if (err)
                    console.log(err);
                else
                    res.send(err);
            }, req.body.cf, req.body.toClass, req.body.fromClass, req.body.id_utente, req.body.annoScolastico);
        }
    });


    app.get(endpoint.alunni.getPastSettingsPrime, middleware.isLoggedIn, function (req, res) {
        query.getSettingsPrime(function (err, results) {
            if (err)
                console.log(err);
            else {
                res.send(results);
            }
        });
    });

    app.get(endpoint.alunni.getHistory, middleware.isLoggedIn, function (req, res) {
        query.getHistory(function (err, results) {
            if (err)
                console.log(err);
            else {
                res.send(results);
            }
        });
    });

    app.get(endpoint.alunni.removeStudentFromHistory, middleware.isLoggedIn, function (req, res) {
        query.deleteStudentFromHistory(function (err, results) {
            if (err)
                console.log(err);
            else {
                res.send(results);
            }
        }, req.query.cf);
    });


    app.get(endpoint.alunni.getPastSettingsTerze, middleware.isLoggedIn, function (req, res) {
        query.getSettingsTerze(function (err, results) {
            if (err)
                console.log(err);
            else {
                res.send(results);
            }
        });
    });

    app.get(endpoint.utenti.exportSingleCsv, middleware.isLoggedIn, function (req, res) {
        query.getClassiComposteForExport(function (err, results) {
            if (err) {
                console.log(err);
                res.send("errore");
            }
            else {
                res.setHeader('Content-disposition', 'attachment; filename=export.csv');
                res.set('Content-Type', 'text/csv');
                res.csv(results);
            }
        })

    });

};