/**
 * Created by mattia on 05/05/17.
 */


const query = require('./../query/query.js');
const csv_post = require("csv");
const middleware = require('./middleware/middleware');

const algoritmo = require("./algoritmo/main.js");

const async = require('async');
const csv = require('express-csv');
const nodeExcel = require('excel-export');
const endpoint = require('./endpoint/endpoint.js');
const sessione = require('./../query/sessione.js');
const _ = require('lodash');
const logger = require("../logger");
const multer = require('multer');
const upload = multer({ dest: 'files/' });


module.exports = function (app) {


    app.get(endpoint.alunni.uploadAlunniCsv, function (req, res) {
        //hideDropDown if true -> dropdown not show
        res.render('insert-from-csv.ejs', {
            pageTitle: " Inserisci alunni ",
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

    app.post(endpoint.alunni.uploadAlunniRimandatiSettembre, upload.single('csv'), middleware.isLoggedIn, function (req, res) {

        // const data = req.file;
        // const pathFile = data.path;
        // const scuola = req.user.id_scuola;
        // const utente = req.user.id;
        //
        // csv_post().from.path(pathFile, {
        //     delimiter: ";",
        //     escape: ''
        //
        // }).on("record", function (row, index) {
        //
        //     query.insertRecordFromCSV(row,scuola,utente);
        //
        // }).on("end", function () {
        //
        //     console.log("LETTURA FILE RIUSCITA");
        //     res.redirect(endpoint.alunni.studenti);
        //
        // }).on("error", function (error) {
        //
        //     console.error(error);
        // });
        res.redirect(endpoint.alunni.studenti);
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

    app.get(endpoint.utenti.creaUtente, middleware.isLoggedIn, function (req, res) {

        res.render('crea-utente.ejs', {
            pageTitle: "Creazione utente ",
            hideDropDown: true
        })
    });

    app.get(endpoint.alunni.panoramicaClassi, middleware.isLoggedIn, function (req, res) {


        res.render('panoramica-classi.ejs', {
            pageTitle: "Panoramica classi   "
        })
    });

    app.get(endpoint.alunni.settings, middleware.isLoggedIn, function (req, res) {
        res.render('settings.ejs', {
            pageTitle: "Settings ",
            hideDropDown: true
        })
    });

    app.get(endpoint.alunni.tagAlunni, middleware.isLoggedIn, function (req, res) {

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
    app.get(endpoint.alunni.insertTag, middleware.isLoggedIn, middleware.restrictTo([0, 1]), function (req, res) {

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
            },
            centoQuattroPrima: function (callback) {
                var annoScolastico = "2017-2018";
                query.getNumberCentoQuattro("PRIMA", req.user.id_scuola, annoScolastico, function (err, results) {
                    callback(err, {'centoQuattro': results})
                });
            }
        }, function (err, results) {
            res.render('settings-prime.ejs', {
                user: req.user,
                pageTitle: " Settings prime ",
                studentiPrima: results.studentiPrima.studenti,
                femminePrima: results.femminePrima.femmine,
                mediaPrima: results.mediaPrima.media,
                stranieriPrima: results.stranieriPrima.stranieri,
                centoQuattro: results.centoQuattroPrima.centoQuattro,
                hideDropDown: true
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
    app.post(endpoint.alunni.insertSettingsPrime, middleware.isLoggedIn, middleware.restrictTo([0, 1]), function (req, res) {

        const scuola = req.user.id_scuola;
        const annoScolastico = "2017-2018";

        query.insertSettingsPrime(scuola, annoScolastico, req.body.data, req.body.descrizione, req.body.alunniMin, req.body.alunniMax, req.body.femmine, req.body.residenza, req.body.nazionalita, req.body.naz_per_classe, req.body.max_al_104, function (err, results) {
            if (err)
                res.send({"error":err});
            else
                res.send("no-error");
        });

    });

    /**
     * inserisce le impostazioni delle prime
     */
    app.post(endpoint.alunni.setActiveConfiguration, middleware.restrictTo([0, 1]), middleware.isLoggedIn, function (req, res) {
        const scuola = req.user.id_scuola;
        query.setActiveConfiguration(scuola, "PRIMA", req.body.id, function (err, results) {
            if (err)
                res.send({"error":err});
            else
                res.send("no-error");
        });

    });

    /**
     * inserisce le impostazioni delle terze
     */
    app.get(endpoint.alunni.insertSettingsTerze, middleware.isLoggedIn, function (req, res) {
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
            }else{
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
        const classeFutura = req.query.classeFutura;
        const annoScolastico = req.query.annoScolastico;

        algoritmo.generaClassiPrima(annoScolastico, scuola, classeFutura, function (classi) {

            //noinspection JSAnnotator
            let wrapper = {
                scuola: scuola,
                annoScolastico: annoScolastico,
                classeFutura: classeFutura,
                idUtente: req.user.id,
                dirittiUtente: req.user.diritti,
                classi: classi
            };

            res.send(wrapper);
        });

    });


    //HISTORY & MOVE STUDENT
    app.post(endpoint.alunni.moveStudent, middleware.isLoggedIn, middleware.restrictTo([0, 1]), function (req, res) {
        const scuola = req.user.id_scuola;
        const classeFutura = req.body.classeFutura;
        const annoScolastico = req.body.annoScolastico;

        const cfALunno = req.body.cf;
        const nuovaClasse = req.body.toClass;
        const vecchiaClasse = req.body.fromClass;
        const idUtente = req.user.id;

        query.updateAlunnoClass(cfALunno, nuovaClasse, annoScolastico, scuola, classeFutura, function (err) {
            if(err){
                logger.error("updateAlunnoClass - errore ", err);
                res.send({
                    "error": err
                });
            }else{

                var saveHistory = (req.body.saveHistory === 'true');

                if (saveHistory && nuovaClasse !== vecchiaClasse) {
                    query.insertHistory(cfALunno, nuovaClasse, vecchiaClasse, idUtente, annoScolastico, scuola, classeFutura, function (err) {
                        if(err){
                            logger.error("insertHistory - errore ", err);
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

    app.get(endpoint.alunni.eliminaClassiCreate, middleware.isLoggedIn, function (req, res) {
        const scuola = 0//req.user.id_scuola;
        const classeFutura = "PRIMA"//req.body.classeFutura;
        const annoScolastico = "2017-2018"//req.body.annoScolastico;

        query.deleteClassiComposte(scuola, classeFutura, annoScolastico, function (err, ris) {
            if(err){
                res.send(err);
            }else{
                res.send("ok");
            }
        });


    });

    app.get(endpoint.alunni.getHistory, middleware.isLoggedIn, function (req, res) {
        const scuola = req.user.id_scuola;
        const classeFutura = req.body.classeFutura;
        const annoScolastico = req.body.annoScolastico;

        query.getHistory(scuola, function (err, results) {
            if (err) { 
                console.log(err);
                logger.error("getHistory - errore ", err);
                res.send({
                    "error": err
                });
            }
            else {

                let history = _.groupBy(results, function (o) {
                    return o.timestamp.split(" ")[0];
                });

                res.send(history);
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
                var d = new Date();
                var data = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
                var objRes = JSON.stringify(results);
                var objRes = JSON.parse(objRes);
                var intestazione = [];
                for (var o in objRes[0]){
                    intestazione.push(o);
                }
                intestazione.push("posizione_in_classe");
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
                objRes.splice(0, 0, intestazione);
                results = objRes;
                csv.separator = ";";
                res.setHeader('Content-disposition', 'attachment; filename=classi_' + data + '.csv');
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
                var d = new Date();
                var data = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
                console.log(data);
                var objRes = JSON.stringify(results);
                var objRes = JSON.parse(objRes);
                var count = 1;
                var classe = "";
                var intestazione = [];
                var configuration = {};
                configuration.cols = [];
                configuration.rows = [];

                for (var o in objRes[0]){
                    intestazione.push(o);
                }

                intestazione.push("posizione_in_classe");

                for (var i in intestazione){
                    if (intestazione[i] == "voto" || intestazione[i] == "matricola" ||
                        intestazione[i] == "posizione_in_classe" || intestazione[i] == "CAP"){
                        configuration.cols.push({caption: intestazione[i], type:'number'});
                    } else{
                        configuration.cols.push({caption: intestazione[i], type:'string', width:255});
                    }

                }

                for (var o in objRes){
                    if(classe === objRes[o].classe_futura){
                        count ++;
                    } else{
                        count = 1;
                        classe = objRes[o].classe_futura;
                    }
                    objRes[o]["posizione_in_classe"] = count;
                }

                for (var k in objRes){
                    configuration.rows.push([]);
                    for (var i in objRes[k]){
                        if (intestazione[i] == "voto" || intestazione[i] == "matricola" ||
                            intestazione[i] == "posizione_in_classe" || intestazione[i] == "CAP"){
                            configuration.rows[configuration.rows.length - 1].push(objRes[k][i]);
                        } else{
                            configuration.rows[configuration.rows.length - 1].push("" + objRes[k][i]);
                        }
                    }
                }

                var result=nodeExcel.execute(configuration);
                res.setHeader('Content-Type','application/vnd.openxmlformates');
                res.setHeader("Content-Disposition","attachment;filename=classi_" + data + ".xlsx");
                res.end(result,'binary');
            }
        })

    });

    app.post(endpoint.alunni.deleteSetting, middleware.isLoggedIn, middleware.restrictTo([0, 1]), function (req, res) {

        const id = req.body.id;

        query.deleteConfiguration(id, function (err, ris) {
            if(err != null){
                res.send({
                    "error": err
                });
            } else{
                res.send("no-error");
            }
        });
    });


};