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
        //hideDropDown if true -> dropdown not show
        res.render('insert-from-csv.ejs', {
            pageTitle: " main ",
            hideDropDown: true
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
        query.getStudentByCf(req.query.cf, req.user.id_scuola,function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        });
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
            pageTitle: "Creazione utente ",
            hideDropDown: true
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
                query.getNumberOfStudenti(req.user.id_scuola, "PRIMA", function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'studenti': results})
                });
            },

            femminePrima: function (callback) {
                query.getNumberGirl(req.user.id_scuola, "PRIMA", function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'femmine': results})
                });
            },
            mediaPrima: function (callback) {
                query.getAVGOfStudenti(req.user.id_scuola, "PRIMA", function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'media': results})
                });
            },
            stranieriPrima: function (callback) {
                query.getNumberStranieri(req.user.id_scuola, "PRIMA", function (err, results) {
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

        async.parallel({
            studentiTerza: function (callback) {
                query.getNumberOfStudenti(req.user.id_scuola, "TERZA", function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'studenti': results})
                });
            },

            femmineTerza: function (callback) {
                query.getNumberGirl(req.user.id_scuola, "TERZA", function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'femmine': results})
                });
            },
            mediaTerza: function (callback) {
                query.getAVGOfStudenti(req.user.id_scuola, "TERZA", function (err, results) {
                    if (err)
                        console.log(err);
                    else{
                        console.log(results[0].result);
                        if(results[0].result == null){
                            results[0].result = 0;
                        }
                        callback(null, {'media': results})
                    }

                });
            },
            stranieriTerza: function (callback) {
                query.getNumberStranieri(req.user.id_scuola, "TERZA", function (err, results) {
                    if (err)
                        console.log(err);
                    else
                        callback(null, {'stranieri': results})
                });
            },
            indirizziTerza: function (callback) {
                query.getIndirizziTerza(req.user.id_scuola, function (err, results) {
                    if (err)
                        console.log(err);
                    else{
                        console.log(results);
                        callback(null, {'indirizzi': results});
                    }

                });
            }
        }, function (err, results) {
            res.render('settings-terze.ejs', {
                user: req.user,
                pageTitle: " Settings terze ",
                studentiTerza: results.studentiTerza.studenti,
                femmineTerza: results.femmineTerza.femmine,
                mediaTerza: results.mediaTerza.media,
                stranieriTerza: results.stranieriTerza.stranieri,
                indirizziTerza: results.indirizziTerza.indirizzi
            });

        });
    });

    /**
     * inserisce le impostazioni delle prime
     */
    app.post(endpoint.alunni.insertSettingsPrime, function (req, res) {
        const scuola = req.user.id_scuola;
        query.insertSettingsPrime(function (err, results) {
            if (err)
                res.send({"error":err});
            else
                res.send("no-error");
        }, scuola, req.body.data, req.body.descrizione, req.body.alunniMin, req.body.alunniMax, req.body.femmine, req.body.residenza, req.body.nazionalita, req.body.naz_per_classe, req.body.max_al_104);

    });

    /**
     * inserisce le impostazioni delle prime
     */
    app.post(endpoint.alunni.setActiveConfiguration, function (req, res) {
        const scuola = req.user.id_scuola;
        query.insertSettingsPrime(scuola, "PRIMA", req.body.id, function (err, results) {
            if (err)
                res.send({"error":err});
            else
                res.send("no-error");
        });

    });

    /**
     * inserisce le impostazioni delle terze
     */
    app.get(endpoint.alunni.insertSettingsTerze, function (req, res) {
        const scuola = req.user.id_scuola;
        query.insertSettingsTerze(function (err, results) {
            if (err)
                res.send(err);
            else
                res.send(JSON.stringify(results));
        }, scuola, req.query.data, req.query.descrizione, req.query.alunniMin, req.query.alunniMax, req.query.femmine, req.query.residenza, req.query.nazionalita, req.query.naz_per_classe, req.query.max_al_104);

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
                if(obj.length === 0){
                    res.redirect(endpoint.alunni.uploadAlunniCsv);
                }else {
                    app.locals.dropDown = _.groupBy(obj, function (o) {
                        return o.classe_futura;
                    });



                    app.locals.sessioneIniziale = {
                        classeFutura: obj[0].classe_futura,
                        annoScolastico:obj[0].anno_scolastico
                    };

                    res.render('studenti.ejs', {
                        pageTitle: " Studenti "
                    });
                }

            }


        });


    });

    app.get(endpoint.alunni.generateClassi, middleware.isLoggedIn, function (req, res) {
        const scuola = req.user.id_scuola;
        const annoScolastico = "2017-2018";
        const classeFutura = "PRIMA";



        newAlg.generaClassiPrima(annoScolastico, scuola, classeFutura, function (classi) {

            var wrapper = {
                scuola:scuola,
                annoScolastico:annoScolastico,
                classeFutura:classeFutura,
                idUtente: req.user.id,
                dirittiUtente: req.user.diritti,
                classi:classi
            };

            res.send(wrapper);
        });

    });


    //HISTORY & MOVE STUDENT
    app.post(endpoint.alunni.moveStudent, middleware.isLoggedIn, middleware.restrictTo([0, 1]), function (req, res) {
        const scuola = req.user.id_scuola;
        const annoScolastico = "2017-2018";
        const classeFutura = "PRIMA";

        const cfALunno = req.body.cf;
        const nuovaClasse = req.body.toClass;
        const vecchiaClasse = req.body.fromClass;
        const idUtente = req.user.id;


        query.updateAlunnoClass(cfALunno, nuovaClasse ,annoScolastico, scuola, classeFutura, function (err) {
            if(err){
                res.send({
                    "error": err
                });
            }else{

                var saveHistory = (req.body.saveHistory === 'true');

                if (saveHistory && nuovaClasse !== vecchiaClasse) {
                    query.insertHistory(cfALunno, nuovaClasse, vecchiaClasse, idUtente, annoScolastico, scuola, classeFutura, function (err) {
                        if(err){
                            res.send({
                                "error": err
                            });
                        }
                        else {
                            res.send("no-error")
                        }
                    });
                }
                else {
                    res.send("no-error")
                }
            }
        });
    });

    app.get(endpoint.alunni.getHistory, middleware.isLoggedIn, function (req, res) {
        const scuola = req.user.id_scuola;
        const annoScolastico = "2017-2018";
        const classeFutura = "PRIMA";
        query.getHistory(scuola, function (err, results) {
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
                res.send({
                    "-1": err
                });
            else {
                res.send(results);
            }
        }, req.query.cf, req.query.id);
    });


    app.get(endpoint.alunni.getPastSettingsPrime, middleware.isLoggedIn, function (req, res) {
        const scuola = req.user.id_scuola;
        query.getSettingsPrime(scuola, function (err, results) {
            if (err)
                console.log(err);
            else {
                res.send(results);
            }
        });
    });

    app.get(endpoint.alunni.getPastSettingsTerze, middleware.isLoggedIn, function (req, res) {
        const scuola = req.user.id_scuola;
        query.getSettingsTerze(scuola, function (err, results) {
            if (err)
                console.log(err);
            else {
                res.send(results);
            }
        });
    });

    app.get(endpoint.alunni.exportSingleCsv, middleware.isLoggedIn, function (req, res) {
        query.getClassiComposteForExport(function (err, results) {
            if (err) {
                console.log(err);
                res.send("Errore nello scaricamento del file");
            }
            else {
                var objRes = JSON.stringify(results);
                var objRes = JSON.parse(objRes);
                var count = 1;
                var classe = ""
                for (var o in objRes){
                    if(classe === objRes[o].classe_futura){
                        count ++;
                    } else{
                        count = 1;
                        classe = objRes[o].classe_futura;
                    }
                    objRes[o]["posizione_in_classe"] = count;
                }
                results = objRes;
                csv.separator = ",";
                res.setHeader('Content-disposition', 'attachment; filename=exportCsv.csv');
                res.set('Content-Type', 'text/csv');
                res.csv(results);
            }
        })

    });

    app.get(endpoint.alunni.exportSingleExcel, middleware.isLoggedIn, function (req, res) {
        query.getClassiComposteForExport(function (err, results) {
            if (err) {
                console.log(err);
                res.send("Errore nello scaricamento del file");
            }
            else {
                var objRes = JSON.stringify(results);
                var objRes = JSON.parse(objRes);
                var count = 1;
                var classe = ""
                for (var o in objRes){
                    if(classe === objRes[o].classe_futura){
                        count ++;
                    } else{
                        count = 1;
                        classe = objRes[o].classe_futura;
                    }
                    objRes[o]["posizione_in_classe"] = count;
                }
                results = objRes;
                csv.separator = ";";
                res.setHeader('Content-disposition', 'attachment; filename=exportExcel.xls');
                res.set('Content-Type', 'text/csv');
                res.csv(results);
            }
        })

    });

};