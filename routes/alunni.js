/**
 * Created by mattia on 05/05/17.
 */


const query = require('./../query/query.js');
const csv_post = require("csv");
const middleware = require('./middleware/middleware');
const newAlg = require("./new-algorithm.js");
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

        let classiTest = [
            {
                "nome": "1A",
                "alunni": [
                    {
                        "cognome": "BARBANOUA",
                        "nome": "DUMITRU",
                        "matricola": "18150",
                        "cf": "BRBDTR00P23Z129I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2000-09-23",
                        "cap": "37069",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1A",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "TRIBOLI",
                        "nome": "NICOLA ALESSANDRO",
                        "matricola": "18433",
                        "cf": "TRBNLL02A01B107D",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-01-01",
                        "cap": "37059",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1A",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "HARKA",
                        "nome": "DANIEL",
                        "matricola": "18660",
                        "cf": "HRKDNL03A11D662B",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-11",
                        "cap": "37020",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "EH1 - Motoria",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "SABAINI",
                        "nome": "CHIARA",
                        "matricola": "18762",
                        "cf": "SBNCHR04B65L781Z",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2004-02-25",
                        "cap": "37011",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "SPAGNOLO",
                        "nome": "GIGLIOLA",
                        "matricola": "18786",
                        "cf": "SPGGLL02M61L424R",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2002-08-21",
                        "cap": "37124",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "VERONESI",
                        "nome": "ELISA",
                        "matricola": "18805",
                        "cf": "VRNLSE03H46L781U",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2003-06-06",
                        "cap": "37023",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "ZORZI",
                        "nome": "IRENE",
                        "matricola": "18825",
                        "cf": "ZRZRNI03E47B296Q",
                        "desiderata": "FRNCLD03S02L781M",
                        "sesso": "F",
                        "data_di_nascita": "2003-05-07",
                        "cap": "37068",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "FORONCELLI",
                        "nome": "CLAUDIO",
                        "matricola": "18632",
                        "cf": "FRNCLD03S02L781M",
                        "desiderata": "ZRZRNI03E47B296Q",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-02",
                        "cap": "37068",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 10
                    },
                    {
                        "cognome": "ILIEVSKI",
                        "nome": "ANDREJ",
                        "matricola": "18664",
                        "cf": "LVSNRJ03R14F861P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-14",
                        "cap": "37023",
                        "nazionalita": "MACEDONE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "TRAJANOVSKI",
                        "nome": "ALEKSANDAR",
                        "matricola": "18799",
                        "cf": "TRJLSN03P19L781X",
                        "desiderata": "BRTMTT03A24B296S",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-19",
                        "cap": "37023",
                        "nazionalita": "MACEDONE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "BERTAIOLA",
                        "nome": "MATTEO",
                        "matricola": "400001126",
                        "cf": "BRTMTT03A24B296S",
                        "desiderata": "TRJLSN03P19L781X",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-24",
                        "cap": "37023",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "LAVARINI",
                        "nome": "DAVIDE",
                        "matricola": "18673",
                        "cf": "LVRDVD03M12F861D",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-12",
                        "cap": "37020",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "MIRANDOLA",
                        "nome": "MICHAEL",
                        "matricola": "18703",
                        "cf": "MRNMHL03T11I775D",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-11",
                        "cap": "37059",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BATTISTONI",
                        "nome": "MARCO",
                        "matricola": "18530",
                        "cf": "BTTMRC03T09E349A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-09",
                        "cap": "37068",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "MASSELLA",
                        "nome": "KEVIN",
                        "matricola": "18694",
                        "cf": "MSSKVN03B25L949B",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-25",
                        "cap": "37069",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 9
                    },
                    {
                        "cognome": "CASTELLANI",
                        "nome": "DAVIDE",
                        "matricola": "100001439",
                        "cf": "CSTDVD03M05F861O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-05",
                        "cap": "37124",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "VIRGILI",
                        "nome": "ZENO",
                        "matricola": "",
                        "cf": "VRGZNE02R14L781S",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-10-14",
                        "cap": "37059",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 0
                    },
                    {
                        "cognome": "ZANETTI",
                        "nome": "DAVIDE",
                        "matricola": "18815",
                        "cf": "ZNTDVD03S03D284K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-03",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 0
                    },
                    {
                        "cognome": "SANDON",
                        "nome": "OLIVER THOMAS",
                        "matricola": "18768",
                        "cf": "SNDLRT03H30G489J",
                        "desiderata": "PRLNCL03P10G489C",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-30",
                        "cap": "37019",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "PAROLINI",
                        "nome": "NICOLO'",
                        "matricola": "18728",
                        "cf": "PRLNCL03P10G489C",
                        "desiderata": "SNDLRT03H30G489J",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-10",
                        "cap": "37019",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 9
                    },
                    {
                        "cognome": "SCAMPERLE",
                        "nome": "MATTIA",
                        "matricola": "18774",
                        "cf": "SCMMTT03C13L781A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-13",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "SCHINO",
                        "nome": "ROMOLO GABRIELE",
                        "matricola": "18776",
                        "cf": "SCHRLG03A07L781M",
                        "desiderata": "ZNZLSN03L05B296Q",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-07",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "SOFFIATI",
                        "nome": "LORENZO",
                        "matricola": "18782",
                        "cf": "SFFLNZ03P24L781K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-24",
                        "cap": "37134",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    }
                ]
            },
            {
                "nome": "1F",
                "alunni": [
                    {
                        "cognome": "PERBELLINI",
                        "nome": "MATTEO",
                        "matricola": "18365",
                        "cf": "PRBMTT01S13L781T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-11-13",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1F",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BRUTTI",
                        "nome": "RICCARDO ANTONIO",
                        "matricola": "18558",
                        "cf": "BRTRCR02D03L781T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-04-03",
                        "cap": "37123",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "POIATA",
                        "nome": "ANDRIAN",
                        "matricola": "18742",
                        "cf": "PTONRN02H23Z140W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-06-23",
                        "cap": "37135",
                        "nazionalita": "ROMENA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "DIZDAREVIC",
                        "nome": "EDIJAN",
                        "matricola": "18832",
                        "cf": "DZDDJN02S11Z153Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-11-11",
                        "cap": "37131",
                        "nazionalita": "BOSNIACA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "JIN",
                        "nome": "JIACHENG",
                        "matricola": "18666",
                        "cf": "JNIJHN02P10L949B",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-09-10",
                        "cap": "37060",
                        "nazionalita": "CINESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "LIAO",
                        "nome": "EMILIANO",
                        "matricola": "18674",
                        "cf": "LIAMLN03A27I838L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-27",
                        "cap": "37136",
                        "nazionalita": "CINESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "BALLA",
                        "nome": "FILIPPO",
                        "matricola": "18527",
                        "cf": "BLLFPP03L10B296A",
                        "desiderata": "LVRMHL03S08B296I",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-10",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    },
                    {
                        "cognome": "PAOLINI",
                        "nome": "SIMONE",
                        "matricola": "18727",
                        "cf": "PLNSMN03D16L781Q",
                        "desiderata": "SCLLNZ03L14L781Y",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-16",
                        "cap": "37062",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 10
                    },
                    {
                        "cognome": "SCALFO",
                        "nome": "LORENZO",
                        "matricola": "18773",
                        "cf": "SCLLNZ03L14L781Y",
                        "desiderata": "PLNSMN03D16L781Q",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-14",
                        "cap": "37062",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "EZZEBDI",
                        "nome": "ZAKARIA",
                        "matricola": "",
                        "cf": "ZZBZKR02L18G489H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-07-18",
                        "cap": "37067",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 0
                    },
                    {
                        "cognome": "GIRIMONDO",
                        "nome": "ENRICO",
                        "matricola": "18651",
                        "cf": "GRMNRC03B01F861D",
                        "desiderata": "CSLGLI03T22F861W",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-01",
                        "cap": "37022",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "BUSSINELLO",
                        "nome": "FILIPPO",
                        "matricola": "18559",
                        "cf": "BSSFPP03T20I775P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-20",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "CAVALIERE",
                        "nome": "LUIGI",
                        "matricola": "18833",
                        "cf": "CVLLGU03H14C129C",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-14",
                        "cap": "16172",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "ANTONELLI",
                        "nome": "DAVIDE",
                        "matricola": "18518",
                        "cf": "NTNDVD03P29L781L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-29",
                        "cap": "37142",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "ARMANI",
                        "nome": "MARCO",
                        "matricola": "18521",
                        "cf": "RMNMRC03B14L949D",
                        "desiderata": "GRMSMN03P15B296U",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-14",
                        "cap": "37067",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "GERMINIANI",
                        "nome": "SIMONE",
                        "matricola": "18644",
                        "cf": "GRMSMN03P15B296U",
                        "desiderata": "RMNMRC03B14L949D",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-15",
                        "cap": "37067",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "BERBEGLIA",
                        "nome": "WALTER",
                        "matricola": "18536",
                        "cf": "BRBWTR03M05A176X",
                        "desiderata": "SNTTMS03A19L781B",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-05",
                        "cap": "37068",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "SANTARPIA",
                        "nome": "THOMAS",
                        "matricola": "18770",
                        "cf": "SNTTMS03A19L781B",
                        "desiderata": "BRBWTR03M05A176X",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-19",
                        "cap": "37068",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "BERTOLO",
                        "nome": "MATTEO",
                        "matricola": "18542",
                        "cf": "BRTMTT03L20L781T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-20",
                        "cap": "37141",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "BOGONI",
                        "nome": "ANDREA",
                        "matricola": "18547",
                        "cf": "BGNNDR03B19L781V",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-19",
                        "cap": "37142",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "BONFANTE",
                        "nome": "LORENZO",
                        "matricola": "18550",
                        "cf": "BNFLNZ03B07E349J",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-07",
                        "cap": "37063",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "CAMBIOLI",
                        "nome": "DAVIDE",
                        "matricola": "18563",
                        "cf": "CMBDVD03H09L781H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-09",
                        "cap": "37141",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "CANTERI",
                        "nome": "SAMUELE",
                        "matricola": "18564",
                        "cf": "CNTSML03B28L781K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-28",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "MACIOCIA",
                        "nome": "GIACOMO",
                        "matricola": "18681",
                        "cf": "MCCGCM04A30E335H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2004-01-30",
                        "cap": "86093",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "CUGILDI",
                        "nome": "CHRISTIAN",
                        "matricola": "18600",
                        "cf": "CGLCRS03M30L781B",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-30",
                        "cap": "37023",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1I",
                "alunni": [
                    {
                        "cognome": "DIA",
                        "nome": "FALLOU GALASS",
                        "matricola": "18232",
                        "cf": "DIAFLG02R06Z343W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-10-06",
                        "cap": "37133",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1I",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "TOPALA",
                        "nome": "CRISTIN",
                        "matricola": "18428",
                        "cf": "TPLCST01R20Z140F",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-10-20",
                        "cap": "37134",
                        "nazionalita": "MOLDAVA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1I",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "WERAGODA VITHANA ARACHCH",
                        "nome": "MALINDA ODAVICO",
                        "matricola": "18495",
                        "cf": "WRGMND01A18L781S",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-01-18",
                        "cap": "37131",
                        "nazionalita": "CINGALESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1I",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 0
                    },
                    {
                        "cognome": "FRACCA",
                        "nome": "ALBERTO",
                        "matricola": "18633",
                        "cf": "FRCLRT03P20L781P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-20",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "SINGH",
                        "nome": "AMRITPAL",
                        "matricola": "18781",
                        "cf": "SNGMTP03P04I775M",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-04",
                        "cap": "37135",
                        "nazionalita": "INDIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "WU",
                        "nome": "LUIGI",
                        "matricola": "18809",
                        "cf": "WUXLGU02P30H223O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-09-30",
                        "cap": "37123",
                        "nazionalita": "CINESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "ABOU EL KHIR",
                        "nome": "SOUFIAN",
                        "matricola": "18514",
                        "cf": "BLKSFN02S29L781B",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-11-29",
                        "cap": "37142",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BERTOLDO",
                        "nome": "MATTEO",
                        "matricola": "18541",
                        "cf": "BRTMTT03H19I775I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-19",
                        "cap": "37047",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    },
                    {
                        "cognome": "BRUTTI",
                        "nome": "ELIA",
                        "matricola": "18557",
                        "cf": "BRTLEI03A26B107V",
                        "desiderata": "MRLPTR03L27E349S",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-26",
                        "cap": "37063",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "MORELLATO",
                        "nome": "PIETRO",
                        "matricola": "18709",
                        "cf": "MRLPTR03L27E349S",
                        "desiderata": "BRTLEI03A26B107V",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-27",
                        "cap": "37063",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "GIURIATO",
                        "nome": "ANDREA",
                        "matricola": "18652",
                        "cf": "GRTNDR03E01I775L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-01",
                        "cap": "37042",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 10
                    },
                    {
                        "cognome": "MUSCHELLA",
                        "nome": "ANTONIO",
                        "matricola": "18712",
                        "cf": "MSCNTN04A22F537C",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2004-01-22",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 0
                    },
                    {
                        "cognome": "EDEGBE",
                        "nome": "OSAGIE MILTON",
                        "matricola": "18614",
                        "cf": "DGBSML03L19F861Q",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-19",
                        "cap": "37036",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "FUGATTI",
                        "nome": "SAMUELE",
                        "matricola": "18639",
                        "cf": "FGTSML03S17B296O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-17",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "GUERNIERI",
                        "nome": "GIULIO",
                        "matricola": "18659",
                        "cf": "GRNGLI02B28G914B",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-02-28",
                        "cap": "37121",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "LORENZINI",
                        "nome": "MATTEO",
                        "matricola": "18677",
                        "cf": "LRNMTT03P08E34VH",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-08",
                        "cap": "37068",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "MORANDO",
                        "nome": "DAVIDE",
                        "matricola": "18708",
                        "cf": "MRNDVD03M19I775E",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-19",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "KOCI",
                        "nome": "AMARILDO",
                        "matricola": "18670",
                        "cf": "KCOMLD03E13Z100D",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-13",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "LORENZINI",
                        "nome": "EDOARDO",
                        "matricola": "18676",
                        "cf": "LRNDRD03M10F861F",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-10",
                        "cap": "37031",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "MARCONI",
                        "nome": "GABRIELE",
                        "matricola": "18690",
                        "cf": "MRCGRL03D16B296S",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-16",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "MECCHI",
                        "nome": "LORENZO",
                        "matricola": "18322",
                        "cf": "MCCLNZ02B02F861P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-02-02",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "CASTAGNEDI",
                        "nome": "DAVIDE",
                        "matricola": "18575",
                        "cf": "CSTDVD03L05F861A",
                        "desiderata": "ZMBMHL03S07L781O",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-05",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    },
                    {
                        "cognome": "ZAMBALDO",
                        "nome": "MICHELE",
                        "matricola": "18810",
                        "cf": "ZMBMHL03S07L781O",
                        "desiderata": "CSTDVD03L05F861A",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-07",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "MALVEZZI",
                        "nome": "NICHOLAS",
                        "matricola": "18683",
                        "cf": "MLVNHL03C20G489G",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-20",
                        "cap": "37013",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "FAKRI",
                        "nome": "HAMZA",
                        "matricola": "18616",
                        "cf": "FKRHMZ03B26L781I",
                        "desiderata": "LTTMTT03H07L781A",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-26",
                        "cap": "37134",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1P",
                "alunni": [
                    {
                        "cognome": "MAMMANO",
                        "nome": "GIOVANNI",
                        "matricola": "18307",
                        "cf": "MMMGNN02D15F861L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-04-15",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1P",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "MUTISHOVSKI",
                        "nome": "MUTIS",
                        "matricola": "18343",
                        "cf": "MTSMTS01S20F861K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-11-20",
                        "cap": "37066",
                        "nazionalita": "MACEDONE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1P",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "MARTIGNONI",
                        "nome": "NICOLO'",
                        "matricola": "18693",
                        "cf": "MRTNCL03B14F861S",
                        "desiderata": "CMRFNC03T07B296N",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-14",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "COMERLATI",
                        "nome": "FRANCESCO ANGELO",
                        "matricola": "18593",
                        "cf": "CMRFNC03T07B296N",
                        "desiderata": "MRTNCL03B14F861S",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-07",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    },
                    {
                        "cognome": "BAZGU",
                        "nome": "CLAUDIO",
                        "matricola": "18531",
                        "cf": "BZGCLD03D11I775C",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-11",
                        "cap": "37060",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "BISCA",
                        "nome": "ROBERTO MARIAN",
                        "matricola": "18544",
                        "cf": "BSCRRT02M20Z129J",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-08-20",
                        "cap": "37066",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "BUTNARU",
                        "nome": "RODION",
                        "matricola": "18561",
                        "cf": "BTNRDN02M18Z140R",
                        "desiderata": "BNTDGI03A09I775U",
                        "sesso": "M",
                        "data_di_nascita": "2002-08-18",
                        "cap": "37030",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "BENETTON",
                        "nome": "DIEGO",
                        "matricola": "18535",
                        "cf": "BNTDGI03A09I775U",
                        "desiderata": "BTNRDN02M18Z140R",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-09",
                        "cap": "37038",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "STA ANA",
                        "nome": "DAVE JEZRELLE",
                        "matricola": "18789",
                        "cf": "STNDJZ02S23Z216O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-11-23",
                        "cap": "37129",
                        "nazionalita": "FILIPPINA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "BOSCO",
                        "nome": "MARCO",
                        "matricola": "18554",
                        "cf": "BSCMRC03H07B296J",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-07",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "AIT EL HAJ",
                        "nome": "REDA",
                        "matricola": "",
                        "cf": "TLHRDE01R18Z330G",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-10-18",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "TINAZZI",
                        "nome": "PATRICK",
                        "matricola": "18794",
                        "cf": "TNZPRC02D17F382Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-04-17",
                        "cap": "37038",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "CARCERERI",
                        "nome": "NICOLA",
                        "matricola": "18568",
                        "cf": "CRCNCL03C03L781E",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-03",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "FRAZZA",
                        "nome": "GIOVANNI",
                        "matricola": "18638",
                        "cf": "FRZGNN03M28L781P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-28",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "COASSIN",
                        "nome": "DOMINIC",
                        "matricola": "18591",
                        "cf": "CSSDNC03R30G888Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-30",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "RONCA",
                        "nome": "EDOARDO",
                        "matricola": "18759",
                        "cf": "RNCDRD03D03L781Q",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-03",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 0
                    },
                    {
                        "cognome": "SABRI",
                        "nome": "OMAR",
                        "matricola": "18763",
                        "cf": "SBRMRO03P08F861H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-08",
                        "cap": "37015",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "NOGARA",
                        "nome": "LUCA",
                        "matricola": "18716",
                        "cf": "NGRLCU03L02I775Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-02",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "PANIZZI",
                        "nome": "SIMONE",
                        "matricola": "18725",
                        "cf": "PNZSMN03M16L781G",
                        "desiderata": "TRCMTT03P05F861B",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-16",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "TAROCCO",
                        "nome": "MATTEO",
                        "matricola": "18793",
                        "cf": "TRCMTT03P05F861B",
                        "desiderata": "PNZSMN03M16L781G",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-05",
                        "cap": "37029",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "MENEGAZZI",
                        "nome": "THOMAS",
                        "matricola": "18697",
                        "cf": "MNGTMS03L12L781V",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-12",
                        "cap": "37020",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "CERESER",
                        "nome": "MATTEO",
                        "matricola": "18582",
                        "cf": "CRSMTT03T11F861Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-11",
                        "cap": "37015",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "FAGNANI",
                        "nome": "EDOARDO",
                        "matricola": "18615",
                        "cf": "FGNDRD03C20L781X",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-20",
                        "cap": "37122",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "MARCOLINI",
                        "nome": "MATTIA",
                        "matricola": "18689",
                        "cf": "MRCMTT03B05L781I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-05",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "FERRARI",
                        "nome": "FILIPPO",
                        "matricola": "18622",
                        "cf": "FRRFPP03C21L949Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-21",
                        "cap": "37067",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1B",
                "alunni": [
                    {
                        "cognome": "AARIFI",
                        "nome": "BADER",
                        "matricola": "18513",
                        "cf": "RFABDR03R05E349W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-05",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "MODESTI",
                        "nome": "DAVIDE",
                        "matricola": "18705",
                        "cf": "MDSDVD03R03L781A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-03",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BAISEL",
                        "nome": "JAMES OBED",
                        "matricola": "18525",
                        "cf": "BSLJSB03A29L781E",
                        "desiderata": "MRCFNC02H01L781T",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-29",
                        "cap": "37138",
                        "nazionalita": "GHANESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BOADU",
                        "nome": "ISACCO",
                        "matricola": "18546",
                        "cf": "BDOSCC03A18F861Q",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-18",
                        "cap": "37024",
                        "nazionalita": "GHANESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BAKALOV",
                        "nome": "ALEKSANDAR TSONEV",
                        "matricola": "18526",
                        "cf": "BKLLSN02D05Z104D",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-04-05",
                        "cap": "37139",
                        "nazionalita": "BULGARA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "CARAJOV",
                        "nome": "SERGIU",
                        "matricola": "18566",
                        "cf": "CRJSRG03M11Z140Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-11",
                        "cap": "37138",
                        "nazionalita": "BULGARA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "MOREIRA",
                        "nome": "THIAGO",
                        "matricola": "",
                        "cf": "MRRTHG01D19Z602F",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-04-19",
                        "cap": "37135",
                        "nazionalita": "BRASILIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "SACCHETTO",
                        "nome": "RICCARDO",
                        "matricola": "18764",
                        "cf": "SCCRCR03C11F861U",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-11",
                        "cap": "37024",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "BEVERARI",
                        "nome": "MICHELE",
                        "matricola": "18543",
                        "cf": "BVRMHL03L11L781K",
                        "desiderata": "SCSMTT03H27B296L",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-11",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 9
                    },
                    {
                        "cognome": "SCASSERLE",
                        "nome": "MATTIA",
                        "matricola": "18775",
                        "cf": "SCSMTT03H27B296L",
                        "desiderata": "BVRMHL03L11L781K",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-27",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 10
                    },
                    {
                        "cognome": "BELLAMOLI",
                        "nome": "RICCARDO",
                        "matricola": "18532",
                        "cf": "BLLRCR03H24G489A",
                        "desiderata": "CRCNCL03C03L781E",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-24",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "BUSSOLA",
                        "nome": "FILIPPO",
                        "matricola": "18560",
                        "cf": "BSSFPP03S25L781Q",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-25",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "D'ANIELLO",
                        "nome": "GIOSUE' PETRIT",
                        "matricola": "18602",
                        "cf": "DNLGPT03T26L781T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-26",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "GALLI",
                        "nome": "MARCO",
                        "matricola": "18640",
                        "cf": "GLLMRC03C26L781K",
                        "desiderata": "SCCDGI03M03L781G",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-26",
                        "cap": "37139",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "SACCO",
                        "nome": "DIEGO",
                        "matricola": "18765",
                        "cf": "SCCDGI03M03L781G",
                        "desiderata": "GLLMRC03C26L781K",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-03",
                        "cap": "37139",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "CALIARI",
                        "nome": "FEDERICO",
                        "matricola": "18562",
                        "cf": "CLRFRC03C06G489D",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-06",
                        "cap": "37012",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "SCAGLIA",
                        "nome": "TOMMASO",
                        "matricola": "18772",
                        "cf": "SCGTMS03B10F861Q",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-10",
                        "cap": "37015",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "SPERI",
                        "nome": "ROBERTO",
                        "matricola": "18788",
                        "cf": "SPRRRT03T30F861B",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-30",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "TERRANOVA",
                        "nome": "JOSHUA",
                        "matricola": "",
                        "cf": "TRRJSH02P17Z114W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-09-17",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "MIHINDUKULASURIYA PINTO",
                        "nome": "LAHIRU RENATO",
                        "matricola": "",
                        "cf": "MHNLRR03A11F839F",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-11",
                        "cap": "37139",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "MILLI",
                        "nome": "MANUEL",
                        "matricola": "18701",
                        "cf": "MLLMNL03P12A459U",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-12",
                        "cap": "37036",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "MIRANDOLA",
                        "nome": "MATTIA",
                        "matricola": "18702",
                        "cf": "MRNMTT03E28E349O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-28",
                        "cap": "37068",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "FONTANABONA",
                        "nome": "LEONARDO",
                        "matricola": "18631",
                        "cf": "FNTLRD03H28L781K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-28",
                        "cap": "37012",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "MISIANO",
                        "nome": "ANDREA",
                        "matricola": "18704",
                        "cf": "MSNNDR03D07F861V",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-07",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "GALLUCCI",
                        "nome": "ARMANDO",
                        "matricola": "18641",
                        "cf": "GLLRND03S27L781L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-27",
                        "cap": "37057",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1M",
                "alunni": [
                    {
                        "cognome": "BROCCA",
                        "nome": "DIEGO",
                        "matricola": "18178",
                        "cf": "BRCDGI03A18I119Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-18",
                        "cap": "37012",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1M",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    },
                    {
                        "cognome": "MARCAZZAN",
                        "nome": "ELIA",
                        "matricola": "18311",
                        "cf": "MRCLEI02M01L781V",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-08-01",
                        "cap": "37100",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1M",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "ZAMPERINI",
                        "nome": "THOMAS",
                        "matricola": "18449",
                        "cf": "ZMPTMS02P24F861K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-09-24",
                        "cap": "37012",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1M",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "GLIBA",
                        "nome": "BADEREDDINE",
                        "matricola": "18654",
                        "cf": "GLBBRD03L09L781Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-09",
                        "cap": "37135",
                        "nazionalita": "MAROCCHINA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "MARCU",
                        "nome": "JIMMY MIHAITA",
                        "matricola": "18691",
                        "cf": "VRTF03000V077338",
                        "desiderata": "GRRNCL03T30B296R",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-20",
                        "cap": "37026",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "MUNTEAN",
                        "nome": "CORNELLU",
                        "matricola": "",
                        "cf": "MNTCNL01S22Z140Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-11-22",
                        "cap": "37135",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "MUNTEANU",
                        "nome": "ROBERTO ANDREI",
                        "matricola": "18711",
                        "cf": "MNTRRT03L24G489W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-24",
                        "cap": "37015",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "NAPA",
                        "nome": "LIFE ALESSANDRO",
                        "matricola": "18714",
                        "cf": "NPALLS04A23Z404X",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2004-01-23",
                        "cap": "37057",
                        "nazionalita": "STATUNITENSE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BARBI",
                        "nome": "PIETRO",
                        "matricola": "18528",
                        "cf": "BRBPTR03T03B296O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-03",
                        "cap": "37012",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "CAPUZZO",
                        "nome": "FILIPPO",
                        "matricola": "18565",
                        "cf": "CPZFPP03C24F861M",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-24",
                        "cap": "37015",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "CHINOTTI",
                        "nome": "GABRIELE",
                        "matricola": "18585",
                        "cf": "CHNGRL03D15B296I",
                        "desiderata": "RGIDNL03L09L781C",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-15",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "RIGO",
                        "nome": "DANIEL",
                        "matricola": "18755",
                        "cf": "RGIDNL03L09L781C",
                        "desiderata": "CHNGRL03D15B296I",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-09",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    },
                    {
                        "cognome": "COLATO",
                        "nome": "ZENO",
                        "matricola": "18592",
                        "cf": "CLTZNE03P26L781J",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-26",
                        "cap": "37057",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 10
                    },
                    {
                        "cognome": "ROSSI",
                        "nome": "MATTIA ANDREA",
                        "matricola": "18760",
                        "cf": "RSSMTN03S29L781W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-29",
                        "cap": "37100",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "CASAROTTI",
                        "nome": "ALESSANDRO",
                        "matricola": "18571",
                        "cf": "CSRLSN03E15L781A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-15",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "CASTELLO",
                        "nome": "ANDREA",
                        "matricola": "18577",
                        "cf": "CSTNDR03E07E897X",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-07",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "TODESCHINI",
                        "nome": "RICCARDO",
                        "matricola": "18795",
                        "cf": "TDSRCR03T16L781I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-16",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "MORI",
                        "nome": "MATTIA",
                        "matricola": "18710",
                        "cf": "MROMTT03L24L781Q",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-24",
                        "cap": "37059",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "MUSSATI",
                        "nome": "FRANCESCO",
                        "matricola": "",
                        "cf": "MSSFNC03A08L781F",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-08",
                        "cap": "37139",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "NEGRETTO",
                        "nome": "GABRIELE",
                        "matricola": "18345",
                        "cf": "NGRGRL02P20L781A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-09-20",
                        "cap": "37057",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "PANAR8",
                        "nome": "ALEX",
                        "matricola": "18723",
                        "cf": "PNRLXA03R30I775R",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-30",
                        "cap": "37035",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "PAS8",
                        "nome": "GIOELE",
                        "matricola": "18729",
                        "cf": "PSTGLI03P27G224X",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-27",
                        "cap": "37058",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "PRINCIPE",
                        "nome": "GABRIELE",
                        "matricola": "18747",
                        "cf": "PRNGRL03R06B296S",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-06",
                        "cap": "37012",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "MUTAWAKIL",
                        "nome": "ABDUL SALLIM",
                        "matricola": "18713",
                        "cf": "MTWBLS03T13B296I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-13",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "GIRELLA",
                        "nome": "CHRISTIAN",
                        "matricola": "18649",
                        "cf": "GRLCRS03M21B296O",
                        "desiderata": "PSQMRC03H22G489R",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-21",
                        "cap": "37064",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "PASQUETTO",
                        "nome": "MARCO",
                        "matricola": "18731",
                        "cf": "PSQMRC03H22G489R",
                        "desiderata": "GRLCRS03M21B296O",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-22",
                        "cap": "37064",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    }
                ]
            },
            {
                "nome": "1L",
                "alunni": [
                    {
                        "cognome": "BORSATTO",
                        "nome": "RICCARDO",
                        "matricola": "18176",
                        "cf": "BRSRCR02A22L781L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-01-22",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1L",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "BUONCRISTIANI",
                        "nome": "MICHELE",
                        "matricola": "18181",
                        "cf": "BNCMHL02E10L781E",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-05-10",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1L",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "POLI",
                        "nome": "DAVIDE",
                        "matricola": "18378",
                        "cf": "PLODVD02C15L781V",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-03-15",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1L",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "FRANZINI",
                        "nome": "DAVIDE",
                        "matricola": "18636",
                        "cf": "FRNDVD03S17L781G",
                        "desiderata": "FRNMRC03S17L781M",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-17",
                        "cap": "37050",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "FRANZINI",
                        "nome": "MARCO",
                        "matricola": "18637",
                        "cf": "FRNMRC03S17L781M",
                        "desiderata": "FRNDVD03S17L781G",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-17",
                        "cap": "37050",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "OJOG",
                        "nome": "MARIO STELIAN",
                        "matricola": "18717",
                        "cf": "JGOMST03D26L781P",
                        "desiderata": "CSRNDR03C06L781Y",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-26",
                        "cap": "37136",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "CESARO",
                        "nome": "ANDREA",
                        "matricola": "18584",
                        "cf": "CSRNDR03C06L781Y",
                        "desiderata": "JGOMST03D26L781P",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-06",
                        "cap": "37136",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "POPA",
                        "nome": "IONUT-CIPRIAN",
                        "matricola": "18744",
                        "cf": "PPONCP03D13Z129Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-13",
                        "cap": "37013",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "STRUGARU",
                        "nome": "IOAN CRISTIAN",
                        "matricola": "18790",
                        "cf": "STRNRS03R07B296H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-07",
                        "cap": "37062",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "FERNANDO",
                        "nome": "RICHARD JUNIOR",
                        "matricola": "18621",
                        "cf": "FRNRHR03A14L949R",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-14",
                        "cap": "37138",
                        "nazionalita": "POLACCA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "FAVETTA",
                        "nome": "MIKAEL",
                        "matricola": "18620",
                        "cf": "FVTMKL03M06G489Y",
                        "desiderata": "MRNNDR03A14B296H",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-06",
                        "cap": "37013",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "MARINI",
                        "nome": "ANDREA",
                        "matricola": "18692",
                        "cf": "MRNNDR03A14B296H",
                        "desiderata": "FVTMKL03M06G489Y",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-14",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "CASTAGNA",
                        "nome": "FILIPPO",
                        "matricola": "18573",
                        "cf": "CSTFPP03P10E512O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-10",
                        "cap": "37050",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "MARCHESINI",
                        "nome": "FRANCESCO",
                        "matricola": "18686",
                        "cf": "MRCFNC03L09L781C",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-09",
                        "cap": "37062",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 10
                    },
                    {
                        "cognome": "FIORILLO",
                        "nome": "MATTIA",
                        "matricola": "18628",
                        "cf": "FRLMTT03M26B296S",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-26",
                        "cap": "37136",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "DI BERARDINO",
                        "nome": "LORENZO",
                        "matricola": "18610",
                        "cf": "DBRLNZ03C16L781D",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-16",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 10
                    },
                    {
                        "cognome": "SEGALA",
                        "nome": "GABRIELE",
                        "matricola": "",
                        "cf": "SGLGRL02E20F861O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-05-20",
                        "cap": "37069",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "SORIO",
                        "nome": "STEFANO",
                        "matricola": "18784",
                        "cf": "SROSFN03P12F861X",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-12",
                        "cap": "37124",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 0
                    },
                    {
                        "cognome": "TRUSCIGLIO",
                        "nome": "SALVATORE",
                        "matricola": "18800",
                        "cf": "TRSSVT03A10L781D",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-10",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "VILLARDI",
                        "nome": "ALESSANDRO",
                        "matricola": "18806",
                        "cf": "VLLLSN03E11I775Q",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-11",
                        "cap": "37062",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "PULLIA",
                        "nome": "DOMENICO GABRIELE",
                        "matricola": "18749",
                        "cf": "PLLDNC03D08L781F",
                        "desiderata": "BRNGCM03L08F861N",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-08",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "RASITI",
                        "nome": "SENDIN",
                        "matricola": "18752",
                        "cf": "RSTSDN03H21L781H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-21",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "ROLLI",
                        "nome": "ELIA",
                        "matricola": "18757",
                        "cf": "RLLLEI03B26B107M",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-26",
                        "cap": "37050",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "OTTAVIANI",
                        "nome": "MATTIA",
                        "matricola": "18720",
                        "cf": "TTVMTT03D02L781K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-02",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "JIT",
                        "nome": "BANSU",
                        "matricola": "18667",
                        "cf": "JTIBNS03A12Z222Q",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-12",
                        "cap": "37068",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1C",
                "alunni": [
                    {
                        "cognome": "OKUONGHAE",
                        "nome": "DIVINE FAVOUR",
                        "matricola": "18348",
                        "cf": "KNGDNF01T09L781B",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-12-09",
                        "cap": "37024",
                        "nazionalita": "NIGERIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1C",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BACCO",
                        "nome": "MICHELE",
                        "matricola": "18524",
                        "cf": "BCCMHL02M16F861K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-08-16",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "MOKTADER",
                        "nome": "WALID",
                        "matricola": "18706",
                        "cf": "MKTWLD03S02L781Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-02",
                        "cap": "37142",
                        "nazionalita": "TUNISINA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "NDOKAJ",
                        "nome": "ELVIS",
                        "matricola": "18715",
                        "cf": "NDKLVS03T03L781V",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-03",
                        "cap": "37059",
                        "nazionalita": "ALBANESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "LORENTINO",
                        "nome": "PIETRO",
                        "matricola": "18675",
                        "cf": "LRNPTR03S04F861M",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-04",
                        "cap": "37024",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "GARMACIA",
                        "nome": "MARCO-ANDREI",
                        "matricola": "18642",
                        "cf": "GRMMCN03R10L781A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-10",
                        "cap": "37059",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "ALDRIGHETTI",
                        "nome": "MAXIMO",
                        "matricola": "18515",
                        "cf": "LDRMXM03L04L781N",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-04",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "BORTOLASI",
                        "nome": "TOMMASO",
                        "matricola": "18553",
                        "cf": "BRTTMS03B17F861I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-17",
                        "cap": "37141",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "BERTAGNIN",
                        "nome": "RICCARDO",
                        "matricola": "18537",
                        "cf": "BRTRCR03C20I775X",
                        "desiderata": "SNGMTP03P04I775M",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-20",
                        "cap": "37032",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "CRISTANELLI",
                        "nome": "ALESSANDRO",
                        "matricola": "18598",
                        "cf": "CRSLSN03R21B296K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-21",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 10
                    },
                    {
                        "cognome": "MARCHETTO",
                        "nome": "ALESSANDRO",
                        "matricola": "",
                        "cf": "MRCLSN02R26I775T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-10-26",
                        "cap": "37047",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 0
                    },
                    {
                        "cognome": "MEL8",
                        "nome": "NICOLA",
                        "matricola": "",
                        "cf": "MLTNCL02C13F861O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-03-13",
                        "cap": "37029",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "DANZI",
                        "nome": "FRANCESCO WAHL",
                        "matricola": "18603",
                        "cf": "DNZFNC02T30D284M",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-12-30",
                        "cap": "37019",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "DE SILVESTRI",
                        "nome": "THOMAS",
                        "matricola": "18607",
                        "cf": "DSLTMS03P24F861C",
                        "desiderata": "LVSNRJ03R14F861P",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-24",
                        "cap": "37023",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "DE BATTISTI",
                        "nome": "TOMMASO",
                        "matricola": "18605",
                        "cf": "DBTTMS03R01L781V",
                        "desiderata": "SPTNDR03S17G791O",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-01",
                        "cap": "37063",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "SPATARO",
                        "nome": "ANDREA",
                        "matricola": "18787",
                        "cf": "SPTNDR03S17G791O",
                        "desiderata": "DBTTMS03R01L781V",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-17",
                        "cap": "37063",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "DEL FAVERO",
                        "nome": "MASSIMO",
                        "matricola": "18608",
                        "cf": "DLFMSM03R27F241I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-27",
                        "cap": "31030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "FALSAROLO",
                        "nome": "LEONARDO",
                        "matricola": "18617",
                        "cf": "FLSLRD03E19L781Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-19",
                        "cap": "37121",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "FRANCHI",
                        "nome": "ALESSIO",
                        "matricola": "18635",
                        "cf": "FRNLSS03C17I775H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-17",
                        "cap": "37031",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "GHELLERE",
                        "nome": "NICOLO'",
                        "matricola": "18645",
                        "cf": "GHLNCL03R16I775Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-16",
                        "cap": "37055",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "GIRARDI",
                        "nome": "NICCOLO'",
                        "matricola": "18648",
                        "cf": "GRRNCL03T30B296R",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-30",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "GIRELLI",
                        "nome": "ALESSANDRO",
                        "matricola": "18650",
                        "cf": "GRLLSN03B25G489F",
                        "desiderata": "TTRPLC03D22G489U",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-25",
                        "cap": "37013",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "TOTARO",
                        "nome": "PIERLUCA",
                        "matricola": "18797",
                        "cf": "TTRPLC03D22G489U",
                        "desiderata": "GRLLSN03B25G489F",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-22",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "PAVONI",
                        "nome": "ALBERTO",
                        "matricola": "18732",
                        "cf": "PVNLRT03L07F861H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-07",
                        "cap": "37012",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "OLIVIERI",
                        "nome": "MICHELE",
                        "matricola": "18718",
                        "cf": "LVRMHL03S08B296I",
                        "desiderata": "CRDSMN03C10F861P",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-08",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1N",
                "alunni": [
                    {
                        "cognome": "CEOLONI",
                        "nome": "MATTIA",
                        "matricola": "18198",
                        "cf": "CLNMTT02E24L781K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-05-24",
                        "cap": "37020",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1N",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    },
                    {
                        "cognome": "KIRAI",
                        "nome": "ANGELO CLAUDIO",
                        "matricola": "18291",
                        "cf": "KRINLC02P25L781K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-09-25",
                        "cap": "37066",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1N",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "LE FOSSE",
                        "nome": "XAVIER GABRIEL",
                        "matricola": "18295",
                        "cf": "LFSXRG02M04L781U",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-08-04",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1N",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "SQUARANTI",
                        "nome": "MATTEO",
                        "matricola": "18417",
                        "cf": "SQRMTT02P03B296U",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-09-03",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1N",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "GROSSELLI",
                        "nome": "RICCARDO",
                        "matricola": "18657",
                        "cf": "GRSRCR03D04L781J",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-04",
                        "cap": "37029",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "GRIGOR",
                        "nome": "CORNEL",
                        "matricola": "18656",
                        "cf": "GRGCNL03H26L781Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-26",
                        "cap": "37137",
                        "nazionalita": "MOLDAVA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "KPOTOSU ENGUIX",
                        "nome": "CARLOS ANGEL",
                        "matricola": "18671",
                        "cf": "KPTCLS02L06Z131B",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-07-06",
                        "cap": "37138",
                        "nazionalita": "SPAGNOLA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "ANASTASOV",
                        "nome": "KONSTANTIN",
                        "matricola": "18517",
                        "cf": "NSTKST03T18L781L",
                        "desiderata": "MLTSNM03S23F861S",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-18",
                        "cap": "37020",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "MELOTTI",
                        "nome": "SIMONE MARIO",
                        "matricola": "18695",
                        "cf": "MLTSNM03S23F861S",
                        "desiderata": "NSTKST03T18L781L",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-23",
                        "cap": "37020",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "MANTOVAN",
                        "nome": "ENRICO",
                        "matricola": "18684",
                        "cf": "MNTNRC03M25L781L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-25",
                        "cap": "37029",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "BARONE",
                        "nome": "NICOLAS",
                        "matricola": "18529",
                        "cf": "BRNNLS03B15L949R",
                        "desiderata": "FRRNDR03E10B296Q",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-15",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "FERRO",
                        "nome": "ANDREA",
                        "matricola": "18626",
                        "cf": "FRRNDR03E10B296Q",
                        "desiderata": "BRNNLS03B15L949R",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-10",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "BOR8",
                        "nome": "LORENZO",
                        "matricola": "18552",
                        "cf": "BRTLNZ03S11L781K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-11",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "ALIOTTA",
                        "nome": "MATTEO",
                        "matricola": "18516",
                        "cf": "LTTMTT03H07L781A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-07",
                        "cap": "37137",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "AGNELLO",
                        "nome": "ALESSANDRO",
                        "matricola": "",
                        "cf": "GNLLSN01E21L781N",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-05-21",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "CARCERERI",
                        "nome": "MASSIMO",
                        "matricola": "18567",
                        "cf": "CRCMSM03M13B296T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-13",
                        "cap": "37017",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "TOFFALINI",
                        "nome": "FEDERICO",
                        "matricola": "18796",
                        "cf": "TFFFRC03H01L781A",
                        "desiderata": "VNNLSN03D21E349Y",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-01",
                        "cap": "37069",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 10
                    },
                    {
                        "cognome": "VANONI",
                        "nome": "ALESSANDRO",
                        "matricola": "18802",
                        "cf": "VNNLSN03D21E349Y",
                        "desiderata": "TFFFRC03H01L781A",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-21",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 10
                    },
                    {
                        "cognome": "ZANETTI",
                        "nome": "ENRICO",
                        "matricola": "18816",
                        "cf": "ZNTNRC03L06F861W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-06",
                        "cap": "37141",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "ZENTI",
                        "nome": "IVAN",
                        "matricola": "18823",
                        "cf": "ZNTVNI03T21L781Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-21",
                        "cap": "37134",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 0
                    },
                    {
                        "cognome": "SONNANTE",
                        "nome": "DAVIDE",
                        "matricola": "18783",
                        "cf": "SNNDVD02P01G489H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-09-01",
                        "cap": "37013",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "TAMASSIA",
                        "nome": "FEDERICO",
                        "matricola": "18792",
                        "cf": "TMSFRC03E07G633K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-07",
                        "cap": "37054",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "TRAINA",
                        "nome": "NICOLO'",
                        "matricola": "18798",
                        "cf": "TRNNCL03P19F861J",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-19",
                        "cap": "37139",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "PERINA",
                        "nome": "EDOARDO",
                        "matricola": "18733",
                        "cf": "PRNDRD03L09L781P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-09",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    },
                    {
                        "cognome": "PANTALENA",
                        "nome": "LEONARDO",
                        "matricola": "18726",
                        "cf": "PNTLRD03P20L781U",
                        "desiderata": "MGGMRC03D01L781E",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-20",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1D",
                "alunni": [
                    {
                        "cognome": "CALOSI",
                        "nome": "LEONARDO",
                        "matricola": "18186",
                        "cf": "CLSLRD02H20I775O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-06-20",
                        "cap": "37059",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1D",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "KAUR",
                        "nome": "HARASHPREET",
                        "matricola": "18289",
                        "cf": "KRAHSH01R45Z222G",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2001-10-05",
                        "cap": "37039",
                        "nazionalita": "INDIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1D",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BERTANI",
                        "nome": "PIERLORENZO",
                        "matricola": "18539",
                        "cf": "BRTPLR03M15F861D",
                        "desiderata": "ZRZLXA03A02G489X",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-15",
                        "cap": "37011",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "ZORZI",
                        "nome": "ALEX",
                        "matricola": "18824",
                        "cf": "ZRZLXA03A02G489X",
                        "desiderata": "BRTPLR03M15F861D",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-02",
                        "cap": "37011",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "PERONI",
                        "nome": "ENRICO",
                        "matricola": "18735",
                        "cf": "PRNNRC03C05L781R",
                        "desiderata": "CNQTMS03S01L781B",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-05",
                        "cap": "37133",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "CINQUETTI",
                        "nome": "THOMAS",
                        "matricola": "18588",
                        "cf": "CNQTMS03S01L781B",
                        "desiderata": "PRNNRC03C05L781R",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-01",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "KAUR",
                        "nome": "RITIKA",
                        "matricola": "18669",
                        "cf": "KRARTK03L41Z222G",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2003-07-01",
                        "cap": "37051",
                        "nazionalita": "INDIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "FATTAH",
                        "nome": "HASSNA",
                        "matricola": "18619",
                        "cf": "FTTHSN03E49Z330W",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2003-05-09",
                        "cap": "37059",
                        "nazionalita": "MAROCCHINA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "BONAFINI",
                        "nome": "NICOLE",
                        "matricola": "18548",
                        "cf": "BNFNCL03R64L781O",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2003-10-24",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "CONTI",
                        "nome": "ILARIA",
                        "matricola": "18595",
                        "cf": "CNTLRI03D59L781C",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2003-04-19",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 8
                    },
                    {
                        "cognome": "CIANCETTA",
                        "nome": "THOMAS",
                        "matricola": "18586",
                        "cf": "CNCTMS03R10G489G",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-10",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "UEBERBACHER",
                        "nome": "RICCARDO",
                        "matricola": "18801",
                        "cf": "BRBRCR03R22A952C",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-22",
                        "cap": "37011",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "MENDES DE QUEIROZ",
                        "nome": "PEDRO OLIMPIO",
                        "matricola": "18696",
                        "cf": "MNDPRL03A13Z602A",
                        "desiderata": "PRLDVD03T09I775U",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-13",
                        "cap": "37039",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "PERLATO",
                        "nome": "DAVIDE",
                        "matricola": "18734",
                        "cf": "PRLDVD03T09I775U",
                        "desiderata": "MNDPRL03A13Z602A",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-09",
                        "cap": "37039",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "BORINI",
                        "nome": "SEBASTIANO",
                        "matricola": "18551",
                        "cf": "BRNSST03S26L781Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-26",
                        "cap": "37051",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "MARCHI",
                        "nome": "NICOLAS",
                        "matricola": "18687",
                        "cf": "MRCNLS03E01E512H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-01",
                        "cap": "37059",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "CORDIOLI",
                        "nome": "SIMONE",
                        "matricola": "18597",
                        "cf": "CRDSMN03C10F861P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-10",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 9
                    },
                    {
                        "cognome": "CIVADDA",
                        "nome": "GABRIELE",
                        "matricola": "18590",
                        "cf": "CVDGRL03H10L781N",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-10",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "ZANETTI",
                        "nome": "NICOLO'",
                        "matricola": "18817",
                        "cf": "ZNTNCL03C28G489X",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-28",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "ZANIN",
                        "nome": "DAVIDE",
                        "matricola": "18818",
                        "cf": "ZNNDVD03S02L781Z",
                        "desiderata": "MLNFPP03R01L781Q",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-02",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "ZANONI",
                        "nome": "FABIO",
                        "matricola": "18819",
                        "cf": "ZNNFBA02P07B296K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-09-07",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "ZARDINI",
                        "nome": "DENIS",
                        "matricola": "18820",
                        "cf": "ZRDDNS03R05F861N",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-05",
                        "cap": "37012",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "ZOUHRI",
                        "nome": "MOAAD",
                        "matricola": "18826",
                        "cf": "ZHRMDO03D09I775S",
                        "desiderata": "GRTNDR03E01I775L",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-09",
                        "cap": "37050",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "PEZZO",
                        "nome": "MICHELE",
                        "matricola": "18737",
                        "cf": "PZZMHL03B24F861G",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-24",
                        "cap": "37023",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "PAS8",
                        "nome": "MATTIA",
                        "matricola": "18730",
                        "cf": "PSTMTT03T15L781S",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-15",
                        "cap": "37059",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1E",
                "alunni": [
                    {
                        "cognome": "BIZZARRI",
                        "nome": "DAVIDE",
                        "matricola": "18545",
                        "cf": "BZZDVD03A29D284N",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-29",
                        "cap": "37014",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "PERONI",
                        "nome": "ENRICO",
                        "matricola": "18735",
                        "cf": "PRNNRC03C05L781R",
                        "desiderata": "CSTNCL03T08L781J",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-05",
                        "cap": "37133",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "AHMAD",
                        "nome": "HAMMAD",
                        "matricola": "",
                        "cf": "HMDHMD01A01Z236L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-01-01",
                        "cap": "37069",
                        "nazionalita": "PAKISTANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "RAZA",
                        "nome": "ABDULLAH",
                        "matricola": "18753",
                        "cf": "RZABLL02M03Z236W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-08-03",
                        "cap": "37131",
                        "nazionalita": "PAKISTANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "RAZA",
                        "nome": "ALI",
                        "matricola": "18754",
                        "cf": "RZALAI02M19Z236P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-08-19",
                        "cap": "37132",
                        "nazionalita": "PAKISTANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "AYARI",
                        "nome": "AHMED",
                        "matricola": "18144",
                        "cf": "YRAHMD02S22L949T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-11-22",
                        "cap": "37066",
                        "nazionalita": "TUNISINA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "BEN AMMAR",
                        "nome": "SABRI",
                        "matricola": "18534",
                        "cf": "BNMSBR02R25L781Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-10-25",
                        "cap": "37135",
                        "nazionalita": "TUNISINA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "PANDZA",
                        "nome": "MATEO",
                        "matricola": "18724",
                        "cf": "VRTF03000V078104",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-26",
                        "cap": "37050",
                        "nazionalita": "CROATA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BABIC",
                        "nome": "STEFAN",
                        "matricola": "18523",
                        "cf": "BBCSFN03E08L174F",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-08",
                        "cap": "37014",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "BERTASSELLO",
                        "nome": "DAVIDE",
                        "matricola": "18540",
                        "cf": "BRTDVD03D21I775B",
                        "desiderata": "SLGFNC03A02L781H",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-21",
                        "cap": "37050",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "SALGARI",
                        "nome": "FRANCESCO",
                        "matricola": "18766",
                        "cf": "SLGFNC03A02L781H",
                        "desiderata": "BRTDVD03D21I775B",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-02",
                        "cap": "37059",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "CARLUCCIO",
                        "nome": "GABRIELE",
                        "matricola": "18569",
                        "cf": "CRLGRL03A20L781R",
                        "desiderata": "FSLJCP03M01L781S",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-20",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "FASOLI",
                        "nome": "JACOPO",
                        "matricola": "18618",
                        "cf": "FSLJCP03M01L781S",
                        "desiderata": "CRLGRL03A20L781R",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-01",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "COMPARIN",
                        "nome": "DAVIDE",
                        "matricola": "18594",
                        "cf": "CMPDVD03P19B296R",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-19",
                        "cap": "37069",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 0
                    },
                    {
                        "cognome": "CASALI",
                        "nome": "ELIA",
                        "matricola": "18570",
                        "cf": "CSLLEI03B24D611L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-24",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 9
                    },
                    {
                        "cognome": "BRUNO",
                        "nome": "GIACOMO",
                        "matricola": "18555",
                        "cf": "BRNGCM03L08F861N",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-08",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "ORTOLANI",
                        "nome": "ANDREA",
                        "matricola": "18719",
                        "cf": "RTLNDR03A02L781K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-02",
                        "cap": "37133",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "CERIANI",
                        "nome": "LUCA",
                        "matricola": "18583",
                        "cf": "CRNLCU03P12L781X",
                        "desiderata": "SNDMHL03D01L781P",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-12",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "SANDRI",
                        "nome": "MICHELE",
                        "matricola": "18769",
                        "cf": "SNDMHL03D01L781P",
                        "desiderata": "CRNLCU03P12L781X",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-01",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "FRACCAROLI",
                        "nome": "LUCA",
                        "matricola": "18634",
                        "cf": "FRCLCU03R14L781Z",
                        "desiderata": "ZTTMTT03D16F861C",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-14",
                        "cap": "37122",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "ZATTONI",
                        "nome": "MATTIA",
                        "matricola": "18821",
                        "cf": "ZTTMTT03D16F861C",
                        "desiderata": "FRCLCU03R14L781Z",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-16",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "GIACOMI",
                        "nome": "FRANCESCO MARIA",
                        "matricola": "18647",
                        "cf": "GCMFNC03S12B296K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-12",
                        "cap": "37139",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "GIUZIO",
                        "nome": "MATTIA",
                        "matricola": "18653",
                        "cf": "GZIMTT03L05B296Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-05",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "PICOTTINI",
                        "nome": "FILIPPO",
                        "matricola": "18738",
                        "cf": "PCTFPP03B25L781T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-25",
                        "cap": "37017",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "RIGONI",
                        "nome": "NICOLO'",
                        "matricola": "18756",
                        "cf": "RGNNCL03S15E349Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-15",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1G",
                "alunni": [
                    {
                        "cognome": "FRANCESCHETTI",
                        "nome": "MIRCO",
                        "matricola": "18255",
                        "cf": "FRNMRC02H06L781N",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-06-06",
                        "cap": "37015",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1G",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "CICCHELLERO",
                        "nome": "ALESSANDRO",
                        "matricola": "18587",
                        "cf": "CCCLSN03E10L781V",
                        "desiderata": "DMRFNC03R21L781A",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-10",
                        "cap": "37125",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "DE MARTINI DI VALLE APERTA",
                        "nome": "FRANCESCO",
                        "matricola": "18606",
                        "cf": "DMRFNC03R21L781A",
                        "desiderata": "CCCLSN03E10L781V",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-21",
                        "cap": "37124",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "ZAMPIERI",
                        "nome": "DAVIDE",
                        "matricola": "18812",
                        "cf": "ZMPDVD03L10L781W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-10",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "CIOT",
                        "nome": "ANDREI",
                        "matricola": "18589",
                        "cf": "CTINDR02S23Z129W",
                        "desiderata": "VTLDNL03T03L781Y",
                        "sesso": "M",
                        "data_di_nascita": "2002-11-23",
                        "cap": "37135",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "VITALE",
                        "nome": "DANIELE",
                        "matricola": "18808",
                        "cf": "VTLDNL03T03L781Y",
                        "desiderata": "CTINDR02S23Z129W",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-03",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "GHERMANSCHI",
                        "nome": "SERGIU",
                        "matricola": "18646",
                        "cf": "GHRSRG02D14Z140I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-04-14",
                        "cap": "37134",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 10
                    },
                    {
                        "cognome": "HODEA",
                        "nome": "VASILE",
                        "matricola": "18661",
                        "cf": "VRTF03000V069138",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-04",
                        "cap": "37020",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "OUBELKACEM",
                        "nome": "AHMED",
                        "matricola": "18721",
                        "cf": "BLKHMD01S17Z330F",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-11-17",
                        "cap": "37138",
                        "nazionalita": "MAROCCHINA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "SENHAJ",
                        "nome": "MEHDI",
                        "matricola": "18778",
                        "cf": "SNHMHD03L17E349G",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-17",
                        "cap": "37060",
                        "nazionalita": "MAROCCHINA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "VERDEFLOR",
                        "nome": "JONAS JAMES MENDAZA",
                        "matricola": "18804",
                        "cf": "VRDJSJ03T13L781W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-13",
                        "cap": "37132",
                        "nazionalita": "FILIPPINA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "CECCHINI",
                        "nome": "NICOLA",
                        "matricola": "18580",
                        "cf": "CCCNCL03M09F861K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-09",
                        "cap": "37015",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "BONFANTE",
                        "nome": "ALESSANDRO",
                        "matricola": "18549",
                        "cf": "BNFLSN03H28L781K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-28",
                        "cap": "37020",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "DELLA MORTE",
                        "nome": "ALESSANDRO",
                        "matricola": "18609",
                        "cf": "DLLLSN03S09B296V",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-09",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "LUPO",
                        "nome": "ALESSANDRO",
                        "matricola": "18679",
                        "cf": "LPULSN03D12L781U",
                        "desiderata": "PRTSLL03M29L781S",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-12",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "PRETTO",
                        "nome": "SAMUELE LUIGI",
                        "matricola": "18746",
                        "cf": "PRTSLL03M29L781S",
                        "desiderata": "LPULSN03D12L781U",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-29",
                        "cap": "37066",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "ANTONELLO",
                        "nome": "MATTIA",
                        "matricola": "18519",
                        "cf": "NTNMTT03H20L781I",
                        "desiderata": "FNITMS03D10L781T",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-20",
                        "cap": "37124",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "FINI",
                        "nome": "TOMMASO",
                        "matricola": "18627",
                        "cf": "FNITMS03D10L781T",
                        "desiderata": "NTNMTT03H20L781I",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-10",
                        "cap": "37124",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "CASTAGNA",
                        "nome": "NICOLO'",
                        "matricola": "18574",
                        "cf": "CSTNCL03T08L781J",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-08",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "ATZERI",
                        "nome": "ANDREA",
                        "matricola": "18522",
                        "cf": "TZRNDR03R28L781X",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-28",
                        "cap": "37134",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "EDDAOUDI",
                        "nome": "MAROUANE",
                        "matricola": "18613",
                        "cf": "DDDMRN04A28L781J",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2004-01-28",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "DI CESARE",
                        "nome": "DANIELE",
                        "matricola": "18611",
                        "cf": "DCSDNL03L12B296V",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-12",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "GRANZ8",
                        "nome": "LUDOVICO",
                        "matricola": "18655",
                        "cf": "GRNLVC03B12F443G",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-02-12",
                        "cap": "37026",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "RAMADANI",
                        "nome": "BLEND",
                        "matricola": "18751",
                        "cf": "RMDBND03D28E349P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-28",
                        "cap": "37063",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "SIGNORATO",
                        "nome": "FILIPPO",
                        "matricola": "18779",
                        "cf": "SGNFPP03M12F861P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-12",
                        "cap": "37036",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    }
                ]
            },
            {
                "nome": "1H",
                "alunni": [
                    {
                        "cognome": "DEBONI",
                        "nome": "FRANCESCO",
                        "matricola": "18227",
                        "cf": "DBNFNC02R21E349A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-10-21",
                        "cap": "37014",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1H",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "GHEZZER",
                        "nome": "ENRICO",
                        "matricola": "18270",
                        "cf": "GHZNRC02T26L781I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-12-26",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1H",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "KAUR",
                        "nome": "MUSKAN",
                        "matricola": "18290",
                        "cf": "KRAMKN01L70Z222U",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2001-07-30",
                        "cap": "37051",
                        "nazionalita": "INDIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1H",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "MARTELLA",
                        "nome": "IVAN",
                        "matricola": "18318",
                        "cf": "MRTVNI02E29B296H",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-05-29",
                        "cap": "37011",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1H",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "NECHYTAILO",
                        "nome": "LEONARDO",
                        "matricola": "18344",
                        "cf": "NCHLRD01E11B157S",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-05-11",
                        "cap": "46040",
                        "nazionalita": "UCRAINA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1H",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "RIZZA",
                        "nome": "LEONARDO",
                        "matricola": "18393",
                        "cf": "RZZLRD02H22L781L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-06-22",
                        "cap": "37014",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1H",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 6
                    },
                    {
                        "cognome": "ROSSETTI",
                        "nome": "ELIA",
                        "matricola": "18397",
                        "cf": "RSSLEI02R15L949S",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-10-15",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1H",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "DAL POZZO",
                        "nome": "RICCARDO",
                        "matricola": "18601",
                        "cf": "DLPRCR03A17L781P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-17",
                        "cap": "37136",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "CRISTANELLI",
                        "nome": "CAMILLA",
                        "matricola": "18599",
                        "cf": "CRSCLL03R58L781T",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2003-10-18",
                        "cap": "37057",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "DI STEFANO",
                        "nome": "CARLOTTA",
                        "matricola": "18612",
                        "cf": "DSTCLT03M57D284D",
                        "desiderata": "GRNNNA03T63F861Q",
                        "sesso": "F",
                        "data_di_nascita": "2003-08-17",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "GUARINON",
                        "nome": "ANNIE",
                        "matricola": "18658",
                        "cf": "GRNNNA03T63F861Q",
                        "desiderata": "DSTCLT03M57D284D",
                        "sesso": "F",
                        "data_di_nascita": "2003-12-23",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "FIORIO",
                        "nome": "ASIA",
                        "matricola": "18629",
                        "cf": "FRISAI03E50E512O",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2003-05-10",
                        "cap": "37050",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "CELLA",
                        "nome": "RAFFAELE",
                        "matricola": "18581",
                        "cf": "CLLRFL03T20I775X",
                        "desiderata": "PZZLRD03C17L781G",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-20",
                        "cap": "37014",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 9
                    },
                    {
                        "cognome": "PIZZINI",
                        "nome": "LEONARDO",
                        "matricola": "18741",
                        "cf": "PZZLRD03C17L781G",
                        "desiderata": "CLLRFL03T20I775X",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-17",
                        "cap": "37014",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 10
                    },
                    {
                        "cognome": "ARCARI",
                        "nome": "MATTEO",
                        "matricola": "18520",
                        "cf": "RCRMTT03E30L781M",
                        "desiderata": "PLTDMN03P04L781K",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-30",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "PIL8",
                        "nome": "DAMIANO",
                        "matricola": "18739",
                        "cf": "PLTDMN03P04L781K",
                        "desiderata": "RCRMTT03E30L781M",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-04",
                        "cap": "37030",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "GENTILE",
                        "nome": "DANIELE",
                        "matricola": "18643",
                        "cf": "GNTDNL03D24L781E",
                        "desiderata": "SSSNDR03E03L781F",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-24",
                        "cap": "37050",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "SOSSELLA",
                        "nome": "ANDREA",
                        "matricola": "18785",
                        "cf": "SSSNDR03E03L781F",
                        "desiderata": "GNTDNL03D24L781E",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-03",
                        "cap": "37050",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "DATTOLA",
                        "nome": "DOMENICO",
                        "matricola": "18604",
                        "cf": "DTTDNC04A16H224G",
                        "desiderata": "SLZLCU03H20L781M",
                        "sesso": "M",
                        "data_di_nascita": "2004-01-16",
                        "cap": "37057",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "SALZANI",
                        "nome": "LUCA",
                        "matricola": "18767",
                        "cf": "SLZLCU03H20L781M",
                        "desiderata": "DTTDNC04A16H224G",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-20",
                        "cap": "37057",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "FERRARI",
                        "nome": "FRANCESCO",
                        "matricola": "18623",
                        "cf": "FRRFNC03E15F861S",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-05-15",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "MILANI",
                        "nome": "FILIPPO",
                        "matricola": "18699",
                        "cf": "MLNFPP03R01L781Q",
                        "desiderata": "VNTGRL03H29L781M",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-01",
                        "cap": "37131",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "PAMPALONE",
                        "nome": "FEDERICO",
                        "matricola": "18722",
                        "cf": "PMPFRC03R31F861A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-31",
                        "cap": "37136",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "ZANELLA",
                        "nome": "ALESSIO",
                        "matricola": "18814",
                        "cf": "ZNLLSS03T28L781A",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-28",
                        "cap": "46040",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "CASIELLO",
                        "nome": "GIOELE",
                        "matricola": "18572",
                        "cf": "CSLGLI03T22F861W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-22",
                        "cap": "37022",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 0
                    },
                    {
                        "cognome": "RUBINO",
                        "nome": "NICOLO'",
                        "matricola": "18761",
                        "cf": "RBNNCL03M28L781H",
                        "desiderata": "PLLDNC03D08L781F",
                        "sesso": "M",
                        "data_di_nascita": "2003-08-28",
                        "cap": "37132",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "VINCO",
                        "nome": "JACOPO",
                        "matricola": "18807",
                        "cf": "VNCJCP03C28F861N",
                        "desiderata": "ZMBMTT03P20F861Q",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-28",
                        "cap": "37021",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "ZAMBELLI",
                        "nome": "MATTEO",
                        "matricola": "18811",
                        "cf": "ZMBMTT03P20F861Q",
                        "desiderata": "VNCJCP03C28F861N",
                        "sesso": "M",
                        "data_di_nascita": "2003-09-20",
                        "cap": "37020",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    }
                ]
            },
            {
                "nome": "1O",
                "alunni": [
                    {
                        "cognome": "EZECHIELE",
                        "nome": "LUCA",
                        "matricola": "18469",
                        "cf": "ZCHLCU01S27D142T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-11-27",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1O",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 0
                    },
                    {
                        "cognome": "FINATO",
                        "nome": "RICCARDO",
                        "matricola": "18251",
                        "cf": "FNTRCR02D19F861L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-04-19",
                        "cap": "37134",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1O",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "ZUCCONELLI",
                        "nome": "TOMMASO",
                        "matricola": "18459",
                        "cf": "ZCCTMS02S28I775K",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-11-28",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "1O",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 7
                    },
                    {
                        "cognome": "LUZENTI",
                        "nome": "SILVIA",
                        "matricola": "18680",
                        "cf": "LZNSLV03B43F861H",
                        "desiderata": "BRSRRA03T48G489J",
                        "sesso": "F",
                        "data_di_nascita": "2003-02-03",
                        "cap": "37014",
                        "nazionalita": "ITALIANA",
                        "legge_107": "SI",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "BRUSCO",
                        "nome": "AURORA",
                        "matricola": "18556",
                        "cf": "BRSRRA03T48G489J",
                        "desiderata": "LZNSLV03B43F861H",
                        "sesso": "F",
                        "data_di_nascita": "2003-12-08",
                        "cap": "37014",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "KAUR",
                        "nome": "JASMEEN",
                        "matricola": "18668",
                        "cf": "KRAJMN02S46Z222B",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2002-11-06",
                        "cap": "37042",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "MERLO",
                        "nome": "SARA",
                        "matricola": "18698",
                        "cf": "MRLSRA03T64F861Y",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2003-12-24",
                        "cap": "37124",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "POLICANTE",
                        "nome": "FRANCESCA",
                        "matricola": "18743",
                        "cf": "PLCFNC03A64L781Y",
                        "desiderata": "",
                        "sesso": "F",
                        "data_di_nascita": "2003-01-24",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "TABARCEA",
                        "nome": "ALEXANDRU",
                        "matricola": "18791",
                        "cf": "TBRLND03A18Z140I",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-18",
                        "cap": "37137",
                        "nazionalita": "ROMENA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "JACE",
                        "nome": "ARDIT",
                        "matricola": "18665",
                        "cf": "JCARDT03R18G489N",
                        "desiderata": "PRTCRS03A14G489R",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-18",
                        "cap": "37010",
                        "nazionalita": "ALBANESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "PEROTTI",
                        "nome": "CHRISTIAN",
                        "matricola": "18736",
                        "cf": "PRTCRS03A14G489R",
                        "desiderata": "JCARDT03R18G489N",
                        "sesso": "M",
                        "data_di_nascita": "2003-01-14",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "LALA",
                        "nome": "ENRICO",
                        "matricola": "18672",
                        "cf": "LLANRC02H13L781Z",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-06-13",
                        "cap": "37057",
                        "nazionalita": "ALBANESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "MILE",
                        "nome": "KLEI",
                        "matricola": "18700",
                        "cf": "MLIKLE03C15Z100L",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-03-15",
                        "cap": "37135",
                        "nazionalita": "ALBANESE",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 0
                    },
                    {
                        "cognome": "FONTANA",
                        "nome": "SAMUELE",
                        "matricola": "18630",
                        "cf": "FNTSML03R09B296U",
                        "desiderata": "MNDDNL03H15B296H",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-09",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "MONDIA",
                        "nome": "DANILO",
                        "matricola": "18707",
                        "cf": "MNDDNL03H15B296H",
                        "desiderata": "FNTSML03R09B296U",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-15",
                        "cap": "37010",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 8
                    },
                    {
                        "cognome": "DE LUME'",
                        "nome": "EMANUELE",
                        "matricola": "",
                        "cf": "DLMMNL02S20L781D",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-11-20",
                        "cap": "37014",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 0
                    },
                    {
                        "cognome": "CONTRI",
                        "nome": "EMANUELE",
                        "matricola": "18596",
                        "cf": "CNTMNL03S03L781E",
                        "desiderata": "PRTNCL03H02I775E",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-03",
                        "cap": "37042",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "PORTA",
                        "nome": "NICCOLO'",
                        "matricola": "18745",
                        "cf": "PRTNCL03H02I775E",
                        "desiderata": "CNTMNL03S03L781E",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-02",
                        "cap": "37042",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    },
                    {
                        "cognome": "FERRARI",
                        "nome": "RICCARDO",
                        "matricola": "18625",
                        "cf": "FRRRCR03L16E349H",
                        "desiderata": "BNIMTT03S13D810V",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-16",
                        "cap": "37057",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "IABONI",
                        "nome": "MATTEO",
                        "matricola": "18662",
                        "cf": "BNIMTT03S13D810V",
                        "desiderata": "FRRRCR03L16E349H",
                        "sesso": "M",
                        "data_di_nascita": "2003-11-13",
                        "cap": "37057",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "MAGGIO",
                        "nome": "MARCO",
                        "matricola": "18682",
                        "cf": "MGGMRC03D01L781E",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-04-01",
                        "cap": "37060",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "CASTENEDOLI",
                        "nome": "MARCO",
                        "matricola": "18578",
                        "cf": "CSTMRC03L29L781W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-07-29",
                        "cap": "37124",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "ELETTRONICA ED ELETTROTECNICA",
                        "voto": 6
                    },
                    {
                        "cognome": "BELLE'",
                        "nome": "TOMMASO",
                        "matricola": "18533",
                        "cf": "BLLTMS03T10L781W",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-10",
                        "cap": "37134",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 7
                    },
                    {
                        "cognome": "KASSE",
                        "nome": "MOUHAMED",
                        "matricola": "",
                        "cf": "KSSMMD01A13Z343P",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2001-01-13",
                        "cap": "37135",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 0
                    },
                    {
                        "cognome": "MARCHIO",
                        "nome": "FRANCESCO",
                        "matricola": "18688",
                        "cf": "MRCFNC02H01L781T",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2002-06-01",
                        "cap": "37137",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 6
                    },
                    {
                        "cognome": "FERRARI",
                        "nome": "MARIO",
                        "matricola": "18624",
                        "cf": "FRRMRA03T16L781Y",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-12-16",
                        "cap": "37138",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 7
                    },
                    {
                        "cognome": "SCOGNAMIGLIO",
                        "nome": "STEFANO",
                        "matricola": "18777",
                        "cf": "SCGSFN03R06L781G",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-10-06",
                        "cap": "37068",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "TRASPORTI E LOGISTICA",
                        "voto": 8
                    },
                    {
                        "cognome": "ZEGGIOTTI",
                        "nome": "ETTORE",
                        "matricola": "18822",
                        "cf": "ZGGTTR03H14I775O",
                        "desiderata": "",
                        "sesso": "M",
                        "data_di_nascita": "2003-06-14",
                        "cap": "37038",
                        "nazionalita": "ITALIANA",
                        "legge_107": "",
                        "legge_104": "",
                        "classe_precedente": "",
                        "scelta_indirizzo": "INFORMATICA E TELECOMUNICAZIONI",
                        "voto": 9
                    }
                ]
            }
        ];

        newAlg.generaClassiPrima(annoScolastico, scuola, classeFutura, function (classi) {

            //noinspection JSAnnotator
            let wrapper = {
                scuola: scuola,
                annoScolastico: annoScolastico,
                classeFutura: classeFutura,
                idUtente: req.user.id,
                dirittiUtente: req.user.diritti,
                classi: classiTest
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

                var history = _.groupBy(results, function (o) {
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