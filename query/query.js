/**
 * Created by mattiacorradi on 11/02/2017.
 */


//ALL THE QUERY MUST BE INSERTED IN THIS CLASS!!!

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./../config/database');
var connection = mysql.createConnection(dbconfig.connection);
var async = require('async');

connection.query('USE ' + dbconfig.database);

//for select strudents of this year
var anno_sc = "SELECT CONCAT_WS('-', YEAR(CURDATE()), YEAR(DATE_ADD(CURDATE(), INTERVAL 1 YEAR))) AS anno_scolastico";


module.exports = {

    /*
     * Function for insert students into db having an array of data
     */
    insertRecordFromCSV: function (arrayRow, scuola, utente) {
        var cognome = arrayRow[0];
        var nome = arrayRow[1];
        var matricola = arrayRow[2];
        var cf = arrayRow[3];
        var desiderata = arrayRow[4];
        var sesso = arrayRow[5];
        var dataDiNascita = arrayRow[6];
        var cap = arrayRow[7];
        var nazionalita = arrayRow[8];
        var legge_107 = arrayRow[9];
        var legge_104 = arrayRow[10];
        var classe_precedente = arrayRow[11];
        var sceltaIndirizzo = arrayRow[12];
        var annoScolastico = arrayRow[13];
        var codiceCatastale = arrayRow[14];
        var voto = arrayRow[15];
        var classe_futura = arrayRow[16];
        var descrizione = arrayRow[17];

        var query = connection.query("INSERT INTO alunni VALUES (?,?,?,?,?,?,?,STR_TO_DATE(?,'%d/%m/%Y'),?,?,?,?,?,?,?,?,?,?,?,?,?);", ['', cognome, nome, matricola, cf, desiderata, sesso, dataDiNascita.split(" ")[0], cap, nazionalita, legge_107, legge_104, classe_precedente, sceltaIndirizzo, annoScolastico, codiceCatastale, voto, classe_futura, scuola, utente, descrizione], function (err) {
            if (err) {
                throw err;
            }

        });

    },


    getIdAlunnoByCf: function (cf, annoScolastico, classeFutura, callback) {
        connection.query("SELECT id FROM alunni WHERE cf = ? AND anno_scolastico = ? AND classe_futura = ?", [cf, annoScolastico, classeFutura], function (err, row) {
            callback(err, row);
        })
    },

    /*
     * Function for insert classi into db having an array of data
     */
    insertClassi: function (nomeClasse, annoScolastico, classeFutura, scuola) {
        connection.query("INSERT INTO classi VALUES ('',?,?,'',?,?)", [nomeClasse, annoScolastico, scuola, classeFutura], function (err, row) {
            if (err) {
                console.log(err);
            }
        });
    },


    getIdClasse: function (nomeClasse, anno_scolastico, scuola, classeFutura, callback) {
        connection.query("SELECT id from classi WHERE scuola = ? AND anno_scolastico = ? AND nome = ? AND classe_futura = ?;", [scuola, anno_scolastico, nomeClasse, classeFutura], function (err, row) {
            callback(err, row);
        })
    },

    insertAlunnoInClass: function (nomeClasse, annoScolastico, scuola, classeFutura, cf) {

        async.parallel({
            classe: function (callback) {
                module.exports.getIdClasse(nomeClasse, annoScolastico, scuola, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err)
                    } else {
                        callback(err,{id: row[0].id});
                    }
                });
            },
            settings: function (callback) {
                module.exports.scaricaSettings(annoScolastico, scuola, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(err, {id: row[0].id});
                    }
                });
            },
            alunno: function (callback) {
                module.exports.getIdAlunnoByCf(cf, annoScolastico, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(err,{id: row[0].id});
                    }
                });
            }


        }, function (err, results) {
            connection.query("INSERT INTO classi_composte VALUES (?, ?, ?)", [results.classe.id, results.alunno.id, results.settings.id], function (err, row) {
                if (err) {
                    console.error(err);
                }
            });


        });
    },


    /**
     *
     * @param cf
     * @param classe
     * @param annoScolastico
     * @param scuola
     * @param classeFutura (PRIMA o TERZA)
     * @param callback
     */
    updateAlunnoClass: function (cf, nomeClasse, annoScolastico, scuola, classeFutura, callback) {

        async.parallel({
            classe: function (callback) {
                module.exports.getIdClasse(nomeClasse, annoScolastico, scuola, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err)
                    } else {
                        callback(err,{id: row[0].id});
                    }
                });
            },
            settings: function (callback) {
                module.exports.scaricaSettings(annoScolastico, scuola, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(err, {id: row[0].id});
                    }
                });
            },
            alunno: function (callback) {
                module.exports.getIdAlunnoByCf(cf, annoScolastico, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(err,{id: row[0].id});
                    }
                });
            }


        }, function (err, results) {
            connection.query("UPDATE classi_composte SET classe = ? WHERE alunno = ? AND configurazione = ?", [results.classe.id, results.alunno.id, results.settings.id], function (err, row) {
               callback(err);
            });


        });

    },

    insertHistory: function (cf, nomeNuovaClasse, nomeVecchiaClasse, idUtente, annoScolastico, scuola, classeFutura, callback) {

        async.parallel({
            nuovaClasse: function (callback) {
                module.exports.getIdClasse(nomeNuovaClasse, annoScolastico, scuola, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err)
                    } else {
                        callback(err,{id: row[0].id});
                    }
                });
            },
            vecchiaClasse: function (callback) {
                module.exports.getIdClasse(nomeVecchiaClasse, annoScolastico, scuola, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err)
                    } else {
                        callback(err,{id: row[0].id});
                    }
                });
            },
            alunno: function (callback) {
                module.exports.getIdAlunnoByCf(cf, annoScolastico, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback(err,{id: row[0].id});
                    }
                });
            }
        }, function (err, results) {

            var query = connection.query("insert into history (alunno,classe_precedente,classe_successiva,scuola,utente) values (?,?,?,?,?)", [results.alunno.id, results.vecchiaClasse.id, results.nuovaClasse.id, scuola, idUtente], function (err, row) {
                callback(err);
            });

            console.log(query.sql);


        });
    },

    getHistory: function (scuola,callback) {
        var query = connection.query(
            "SELECT timestamp, alunni.cf as cf,classe_uno.nome as classe_precedente,classe_due.nome as classe_successiva FROM history" +
            " INNER JOIN scuole ON history.scuola = scuole.id" +
            " INNER JOIN  classi AS classe_uno on classe_uno.id = classe_precedente" +
            " INNER JOIN classi AS classe_due  on classe_due.id = classe_successiva" +
            " INNER JOIN alunni ON alunni.id = alunno" +
            " ORDER BY timestamp DESC",
            function (err, rows) {
                if (err) {
                    throw err;
                } else {
                    callback(err, rows);
                }
            });

        console.log(query.sql);
    },

    deleteStudentFromHistory: function (callback, cf) {
        connection.query(
            "DELETE FROM history WHERE cf = ?",
            [cf],
            function (err, rows) {
                if (err) {
                    throw err;
                } else {
                    callback(err, rows);
                }
            });
    },

    insertSettingsPrime: function (callback, scuola, data, descrizione, alunniMin, alunniMax, femmine, residenza, nazionalita, naz_per_classe, max_al_104) {
        var query = connection.query("INSERT INTO configurazione (scuola, data, nome, min_alunni, max_alunni, gruppo_femmine, gruppo_cap, gruppo_nazionalita, nazionalita_per_classe , numero_alunni_con_104, classe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [scuola, data, descrizione, alunniMin, alunniMax, femmine, residenza, nazionalita, naz_per_classe, max_al_104, "PRIMA"], function (err, row) {
            if (err) {
                console.log(err);
            } else {
                callback(err, row, scuola, data, descrizione, alunniMin, alunniMax, femmine, residenza, nazionalita, naz_per_classe, max_al_104);
            }
        });
    },

    getSettingsPrime: function (callback) {
        connection.query("select DATE_FORMAT(data, '%d-%m-%Y') as data, nome, min_alunni, max_alunni, gruppo_femmine, gruppo_cap, gruppo_nazionalita, nazionalita_per_classe, numero_alunni_con_104 from configurazione where classe = 'Prima';", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },


    insertPriorita: function (callback, priorita) {
        for (var i = 0; i < priorita.length; i++) {
            connection.query("INSERT INTO priorita (scelta) VALUES (?)", [priorita[i]], function (err, row) {
                if (err) {
                    console.log(err, row, priorita);
                }
            });
        }
    },

    getPriorita: function (callback) {
        connection.query("SELECT scelta from priorita", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },

    getClassi: function (callback) {
        connection.query("SELECT * from classi", function (err, rows) {
            if (err) {
                console.error(err);
            } else {
                callback(err, rows);
            }
        });
    },


    getAlunniFromClassSync: function (classe, count, callback) {
        connection.query("SELECT alunni.* from (comp_classi inner join classi on nome_classe = nome) inner join alunni on cf_alunno = cf where nome_classe = '" + classe + "' ORDER BY alunni.cognome, alunni.nome", function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                callback(err, rows, classe, count);
            }
        });
    },

    getNumberAlunniClassi: function (classe, callback) {
        var ncl = 1;
        if (classe.toLowerCase() == "prima") {
            ncl = 1;
        } else if (classe.toLowerCase() == "terza") {
            ncl = 3;
        }

        connection.query("SELECT count(*) as result from comp_classi WHERE nome_classe LIKE '" + ncl + "%'", function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                callback(err, rows);
            }
        });
    },

    /**
     * Torna tutti gli alunni di una scuola
     * @param callback
     * @param scuola
     * @param annoScolastico
     * @param classeFutura (opzionale, li torna tutti se non passata)
     */
    getStudentiOfschool: function (scuola, annoScolastico, classeFutura, callback) {

        var query = undefined;

        if (classeFutura === undefined) {
            query = "SELECT * from alunni WHERE scuola = ? AND anno_scolastico = ?";
        } else {
            query = "SELECT * from alunni WHERE scuola = ? AND anno_scolastico = ? AND classe_futura = ?";
        }

        var ris = connection.query(query, [scuola, annoScolastico, classeFutura], function (err, rows) {
            callback(err, rows);
        });

        console.log(ris.sql);
    },

    getNumberGirl: function (classe, callback) {

        connection.query("SELECT  DISTINCT count(classe_futura)  as result from alunni WHERE classe_futura = '" + classe + "' AND sesso = 'F' AND anno_scolastico = (" + anno_sc + ")", function (err, rows) {
            if (err) {
                console.log('MySQL error');
            } else {
                callback(err, rows);
            }
        });
    },

    getNumberStranieri: function (classe, callback) {

        connection.query("SELECT  DISTINCT count(classe_futura)  as result from alunni WHERE classe_futura = '" + classe + "' AND nazionalita != 'ITALIANA' AND anno_scolastico = (" + anno_sc + ")", function (err, rows) {
            if (err) {
                console.log('MySQL error');
            } else {
                callback(err, rows);
            }
        });
    },

    getNumberSameResidence: function (callback, classe, cap, catasto) {
        var qry = "SELECT count(*) residences from alunni WHERE classe_futura = '" + classe + "' AND cap_provenienza = " + cap;

        if (catasto != "*") {
            qry += " AND catasto = '" + catasto + "'";
        }
        qry += " AND anno_scolastico = (" + anno_sc + ")"
        connection.query(qry, function (err, rows) {
            if (err) {
                console.log('MySQL error');
            } else {
                callback(err, rows);
            }
        });
    },

    getNumberOfStudentiPrima: function (callback) {

        connection.query("SELECT  DISTINCT COUNT(classe_futura) as result from alunni WHERE classe_futura = 'PRIMA'", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },


    getAVGOfStudentiPrima: function (callback) {

        connection.query("SELECT ROUND( AVG(voto),2 ) as result FROM alunni WHERE classe_futura = 'PRIMA' ", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },


    /**
     * Cerca uno studente per nome o cognome data una stringa
     * @param identifier
     * @param scuola
     * @param annoScolastico
     * @param classeFutura
     * @param callback
     */
    getAllStudents: function (identifier, scuola, annoScolastico, classeFutura, callback) {
        var idtr, idtr2;
        //posso essere invertiti
        idtr = identifier.split(" ")[1];//presunto nome
        idtr2 = identifier.split(" ")[0];//presunto cognome

        connection.query(
            "SELECT * FROM alunni WHERE " +
            " scuola = ? AND anno_scolastico = ? AND classe_futura = ?" +
            " AND (cognome LIKE ?" +
            " OR nome LIKE ?" +
            " OR (CONCAT(cognome, nome) LIKE ?)" +
            " OR nome LIKE ? " +
            " OR cognome LIKE ?)",
            [scuola, annoScolastico, classeFutura, idtr2 + "%", idtr + "%", "%" + idtr2 + idtr + "%", idtr2 + "%", idtr + "%"],
            function (err, rows) {
                callback(err, rows);
            });
    },

    getStudentByCf: function (cf, scuola, callback) {

        connection.query("SELECT * from alunni  WHERE cf = ? and scuola = ? ", [cf, scuola], function (err, rows) {
            if (err) {
                throw err;
            } else {
                callback(err, rows);
            }
        });
    },

    /**
     *
     * @param callback
     * @param username
     * @param password
     * @param diritto
     * @param scuola
     */
    insertUtente: function (username, password, diritto, scuola, callback) {

        connection.query("INSERT INTO utenti(username, password,diritti , scuola) VALUES (?, ? ,? ,?)",
            [username, password, diritto, scuola],
            function (err, rows) {
                if (err) {
                    throw err;
                } else {
                    callback(err, rows);
                }
            });
    },

    getAllTag: function (scuola, callback) {

        connection.query("SELECT * FROM tag WHERE scuola = ?", [scuola], function (err, rows) {
            callback(err, rows);

        });
    },

    getAllTagName: function (scuola, callback) {

        connection.query("SELECT type as tag FROM tag WHERE scuola = ?", [scuola], function (err, rows) {
            callback(err, rows);

        });
    },

    insertTag: function (scuola, tag, callback) {
        console.log("insert tag" + tag + scuola);

        connection.query("INSERT INTO tag (type,scuola) VALUES (?, ?)", [tag, scuola], function (err, rows) {
            callback(err, rows);

        });
    },

    getStudentsFromSpecifiYear: function (scuola, classeFutura, annoScolastico, callback) {

        connection.query("SELECT cognome,nome,matricola,cf,sesso,data_di_nascita,cap,nazionalita,legge_107,legge_104, classe_precedente, scelta_indirizzo, voto FROM alunni where scuola = ? and classe_futura = ? and anno_scolastico = ?", [scuola, classeFutura, annoScolastico], function (err, rows) {
            callback(err, rows);
        });
    },

    updateTagFromCF: function (callback, tag, cf) {
        var query;
        if (tag === 'none') query = "UPDATE alunni set tag = NULL WHERE cf = '" + cf + "'";
        else  query = "UPDATE alunni set tag = '" + tag + "'  WHERE cf = '" + cf + "'";

        connection.query(query, function (err, rows) {
            if (err) {
                throw err;
            } else {
                callback(err, rows);
            }
        });
    },

    getClassiComposteForExport: function (callback) {
        var query = "SELECT alunni.matricola, alunni.cf, alunni.cognome, alunni.nome, alunni.data_di_nascita, alunni.sesso,alunni.CAP, alunni.nazionalita, " +
            "alunni.legge_107, alunni.legge_104, alunni.classe_precedente, alunni.anno_scolastico,alunni.voto,alunni.tag,alunni.desiderata from alunni " +
            "INNER JOIN comp_classi as m1 on alunni.cf = m1.cf_alunno";

        connection.query(query, function (err, rows) {
            callback(err, rows);
        });

    },

    /**
     * @param annoScolastico
     * @param scuola
     * @param classeFutura
     * @param callback
     */
    scaricaSettings: function (annoScolastico, scuola, classeFutura, callback) {
        var sql = "SELECT id,DATE_FORMAT(data, '%d-%m-%Y') as data,min_alunni, max_alunni, gruppo_femmine, gruppo_cap, gruppo_nazionalita, nazionalita_per_classe, numero_alunni_con_104 FROM configurazione " +
            "WHERE scuola = ? AND anno_scolastico = ? AND classe = ? LIMIT 1;";

        var query = connection.query(sql, [scuola, annoScolastico, classeFutura], function (err, row) {
            callback(err, row);
        });

        console.log(query.sql);
    }

};