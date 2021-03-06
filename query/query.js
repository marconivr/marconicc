/**
 * Created by mattiacorradi on 11/02/2017.
 */


//ALL THE QUERY MUST BE INSERTED IN THIS CLASS!!!

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./../config/database');
//var connection = mysql.createConnection(dbconfig.connection);
var async = require('async');

function startConnection() {
    console.error('CONNECTING');
    connection = mysql.createConnection(dbconfig.connection);

    connection.connect(function(err) {
        if (err) {
            console.error('CONNECT FAILED', err.code);
            startConnection();
        }
        else
            console.error('CONNECTED');
            connection.query('USE ' + dbconfig.database);
    });
    connection.on('error', function(err) {
        if (err.fatal)
            startConnection();
    });
}

startConnection();



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

        var query = connection.query("INSERT INTO alunni VALUES (?,?,?,?,?,?,?,STR_TO_DATE(?,'%d/%m/%Y'),?,?,?,?,?,?,?,?,?,?,?,?,?,?);", [null, cognome, nome, matricola, cf, desiderata, sesso, dataDiNascita.split(" ")[0], cap, nazionalita, legge_107, legge_104, classe_precedente, sceltaIndirizzo, annoScolastico, codiceCatastale, voto, classe_futura, scuola, utente, descrizione, null], function (err) {
            if (err) {
                console.log(err);
            }

        });

        console.log(query.sql);

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
        connection.query("INSERT INTO classi VALUES (null,?,?,'',?,?)", [nomeClasse, annoScolastico, scuola, classeFutura], function (err, row) {
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
                        callback(err, {id: row[0].id});
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
                        callback(err, {id: row[0].id});
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

    cleanClassi: function (scuola, annoScolastico, callback) {
        async.waterfall([
                function(callback){
                    connection.query("delete from classi_composte WHERE classi_composte.classe IN " +
                        "(SELECT c.id FROM classi AS c WHERE c.anno_scolastico = ? AND c.scuola = ?)", [annoScolastico, scuola], function (err, row) {
                        if (err){
                            console.error(err);
                        }
                    });
                    callback();
                },
                function(callback){
                    connection.query("delete FROM classi WHERE anno_scolastico = ? AND scuola = ?", [annoScolastico, scuola], function (err, row) {
                        if (err){
                            console.error(err);
                        }
                    });
                    callback();
                }
            ],
            function (succes) {

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
                        callback(err, {id: row[0].id});
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
                        callback(err, {id: row[0].id});
                    }
                });
            }


        }, function (err, results) {
            connection.query("UPDATE classi_composte SET classe = ? WHERE alunno = ? AND configurazione = ?", [results.classe.id, results.alunno.id, results.settings.id], function (err, row) {
                callback(err);
            });


        });

    },

    deleteConfiguration: function (id, callback) {
        async.waterfall([
                function (callback) {
                    connection.query("DELETE FROM configurazione WHERE id = ?;",[id], function (err, row) {
                        if (err){callback(null, err, null)}
                        else {callback(null, null, "Success")}
                    })
                }, function (err, ris, callback) {
                    connection.query("UPDATE configurazione SET attiva = 1 WHERE id = (SELECT * FROM(SELECT MAX(id) FROM configurazione)AS p);", function (err, row) {
                        if (err){callback(err, null)}
                        else {callback(null,"Success")}
                    });
                }],
            function (err, ris) {
                callback(err, ris);
            });
    },

    /**
     *
     * @param cf
     * @param nomeNuovaClasse
     * @param nomeVecchiaClasse
     * @param idUtente
     * @param annoScolastico
     * @param scuola
     * @param classeFutura
     * @param callback
     */

    insertHistory: function (cf, nomeNuovaClasse, nomeVecchiaClasse, idUtente, annoScolastico, scuola, classeFutura, callback) {

        async.parallel({
            nuovaClasse: function (callback) {
                module.exports.getIdClasse(nomeNuovaClasse, annoScolastico, scuola, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err)
                    } else {
                        callback(err, {id: row[0].id});
                    }
                });
            },
            vecchiaClasse: function (callback) {
                module.exports.getIdClasse(nomeVecchiaClasse, annoScolastico, scuola, classeFutura, function (err, row) {
                    if (err) {
                        console.log(err)
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
                        callback(err, {id: row[0].id});
                    }
                });
            }
        }, function (err, results) {

            var query = connection.query("insert into history (alunno,classe_precedente,classe_successiva,scuola,utente) values (?,?,?,?,?)", [results.alunno.id, results.vecchiaClasse.id, results.nuovaClasse.id, scuola, idUtente], function (err, row) {
                callback(err);
            });
        });
    },

    getHistory: function (scuola, callback) {
        var query = connection.query(
            "SELECT timestamp, alunni.cf as cf,history.id as id, classe_uno.nome as classe_precedente,classe_due.nome as classe_successiva, utenti.username  FROM history" +
            " INNER JOIN scuole ON history.scuola = scuole.id" +
            " INNER JOIN  classi AS classe_uno on classe_uno.id = classe_precedente" +
            " INNER JOIN classi AS classe_due  on classe_due.id = classe_successiva" +
            " INNER JOIN alunni ON alunni.id = alunno" +
            " INNER JOIN utenti on utenti.id = history.utente"+
            " ORDER BY timestamp DESC",
            function (err, rows) {
                callback(err, rows);
            });
    },

    deleteStudentFromHistory: function (callback, cf, id) {
        connection.query(
            "DELETE hst.* FROM history hst" +
            " INNER JOIN alunni aln ON aln.id = hst.alunno" +
            " WHERE (aln.cf = ? ) AND  hst.id = ? ;",
            [cf, id],
            function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    callback(err, rows);
                }
            });
    },

    insertSettingsPrime: function (scuola, annoScolastico, data, descrizione, alunniMin, alunniMax, femmine, residenza, nazionalita, naz_per_classe, max_al_104, callback) {
        async.series
        ([
                function (callback) {
                    connection.query("UPDATE configurazione SET attiva = 0 WHERE attiva = 1 AND scuola = ? AND classe = ?", [scuola, "PRIMA"], function (err, row) {
                        callback(err, {id: "1"});
                    });
                },
                function (callback) {
                    connection.query("INSERT INTO configurazione (attiva, scuola, anno_scolastico, data, nome, min_alunni, max_alunni, gruppo_femmine, gruppo_cap, gruppo_nazionalita, nazionalita_per_classe , numero_alunni_con_104, classe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [1, scuola, annoScolastico, data, descrizione, alunniMin, alunniMax, femmine, residenza, nazionalita, naz_per_classe, max_al_104, "PRIMA"], function (err, row) {
                        callback(err, {id: "1"});
                    });
                }
            ],
            function (err, results) {
                callback(err, results)
            });
    },

    setActiveConfiguration: function (scuola, classe, index, callback) {
        async.series
        ([
                function (callback) {
                    connection.query("UPDATE configurazione SET attiva = 0 WHERE attiva = 1 AND scuola = ? AND classe = ?", [scuola, classe], function (err, row) {
                        callback(err, {id: "1"});
                    });
                },
                function (callback) {
                    connection.query("UPDATE configurazione SET attiva = 1 WHERE scuola = ? AND classe = ? AND id = ?", [scuola, classe, index], function (err, row) {
                        callback(err, {id: "1"});
                    });
                }
            ],
            function (err, results) {
                callback(err, results)
            });
    },

    insertSettingsTerze: function (callback, scuola, data, descrizione, alunniMin, alunniMax, femmine, residenza, nazionalita, naz_per_classe, max_al_104) {
        var query = connection.query("INSERT INTO configurazione (scuola, data, nome, min_alunni, max_alunni, gruppo_femmine, gruppo_cap, gruppo_nazionalita, nazionalita_per_classe , numero_alunni_con_104, classe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [scuola, data, descrizione, alunniMin, alunniMax, femmine, residenza, nazionalita, naz_per_classe, max_al_104, "TERZA"], function (err, row) {
            if (err) {
                console.log(err);
            } else {
                callback(err, row, scuola, data, descrizione, alunniMin, alunniMax, femmine, residenza, nazionalita, naz_per_classe, max_al_104);
            }
        });
    },


    getSettingsPrime: function (scuola, callback) {
        connection.query("select id, attiva , DATE_FORMAT(data, '%d-%m-%Y') as data, nome, min_alunni, max_alunni, gruppo_femmine, gruppo_cap, gruppo_nazionalita, nazionalita_per_classe, numero_alunni_con_104 from configurazione where classe = 'PRIMA' and scuola = ?;", [scuola], function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },

    getSettingsTerze: function (scuola, callback) {
        connection.query("select DATE_FORMAT(data, '%d-%m-%Y') as data, nome, min_alunni, max_alunni, gruppo_femmine, gruppo_cap, gruppo_nazionalita, nazionalita_per_classe, numero_alunni_con_104 from configurazione where classe = 'TERZA' and scuola = ?;", [scuola], function (err, rows) {
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

    },

    getNumberGirl: function (scuola, classe, callback) {

        connection.query("SELECT  DISTINCT count(classe_futura)  as result from alunni WHERE classe_futura = '" + classe + "' AND sesso = 'F' AND scuola = ?", [scuola], function (err, rows) {
            if (err) {
                console.log('MySQL error');
            } else {
                callback(err, rows);
            }
        });
    },

    getNumberStranieri: function (scuola, classe, callback) {

        connection.query("SELECT  DISTINCT count(classe_futura)  as result from alunni WHERE classe_futura = '" + classe + "' AND nazionalita != 'ITALIANA' AND scuola = ?", [scuola], function (err, rows) {
            if (err) {
                console.log('MySQL error');
            } else {
                callback(err, rows);
            }
        });
    },

    getNumberCentoQuattro: function (classeFutura, scuola, annoScolastico, callback) {
        connection.query("SELECT  DISTINCT count(legge_104)  as result from alunni WHERE classe_futura = ? AND SCUOLA = ? and anno_scolastico = ? and legge_104 <> ''",
            [classeFutura, scuola, annoScolastico], function (err, rows) {
                callback(err, rows);

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

    getNumberOfStudenti: function (scuola, classe, callback) {

        connection.query("SELECT  DISTINCT COUNT(classe_futura) as result from alunni WHERE classe_futura = ? and scuola = ?", [classe, scuola], function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },


    getAVGOfStudenti: function (scuola, classe, callback) {

        connection.query("SELECT ROUND( AVG(voto),2 ) as result FROM alunni WHERE classe_futura = ? AND scuola = ?", [classe, scuola], function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },

    getIndirizziTerza: function (scuola, callback) {

        connection.query("SELECT i.indirizzo as result FROM configurazione as c, indirizzi as i, indirizzi_configurazione as ic WHERE  ic.configurazione = c.id AND ic.indirizzo = i.id AND c.classe = 'TERZA' AND c.scuola = ?", [scuola], function (err, rows) {
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
            callback(err, rows);
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
                    console.log(err);
                }
                callback(err, rows);
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

        connection.query("SELECT cognome,nome,matricola,cf, desiderata, sesso,data_di_nascita,cap,nazionalita,legge_107,legge_104, classe_precedente, scelta_indirizzo, voto FROM alunni where scuola = ? and classe_futura = ? and anno_scolastico = ?", [scuola, classeFutura, annoScolastico], function (err, rows) {
            callback(err, rows);
        });
    },

    updateTagFromCF: function (callback, tag, cf) {
        var query;
        if (tag === 'none') query = "UPDATE alunni set tag = NULL WHERE cf = '" + cf + "'";
        else  query = "UPDATE alunni set tag = '" + tag + "'  WHERE cf = '" + cf + "'";

        connection.query(query, function (err, rows) {
            callback(err, rows);
        });
    },

    getClassiComposteForExport: function (callback) {

        var query = "SELECT alunni.matricola, alunni.cf, alunni.cognome, alunni.nome, alunni.data_di_nascita, alunni.sesso,alunni.CAP, alunni.nazionalita, " +
            "alunni.legge_107, alunni.legge_104, alunni.classe_precedente,classi.nome AS classe_futura, alunni.anno_scolastico,alunni.voto,alunni.tag,alunni.desiderata " +
            "FROM alunni INNER JOIN classi_composte as m1 on alunni.id = m1.alunno INNER JOIN classi ON m1.classe = classi.id ORDER BY classe_futura, alunni.cognome, alunni.nome";

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
            "WHERE attiva = 1 AND scuola = ? AND anno_scolastico = ? AND classe = ?;";

        var query = connection.query(sql, [scuola, annoScolastico, classeFutura], function (err, row) {
            callback(err, row);
        });
    },

    /**
     *
     */
    getClassiComposte: function (scuola, classeFutura, annoScolastico, callback) {

        var sql = "SELECT classi.nome as classe_attuale, alunni.id, alunni.cognome, alunni.nome, alunni.matricola, alunni.cf,alunni.desiderata, " +
            "alunni.sesso, alunni.data_di_nascita, alunni.cap, alunni.nazionalita, alunni.legge_107, " +
            "alunni.legge_104, alunni.classe_precedente,alunni.scelta_indirizzo, alunni.anno_scolastico, " +
            "alunni.cod_cat, alunni.voto, alunni.classe_futura, alunni.descrizione, tag.type, classi_composte.configurazione as configurazione FROM classi_composte " +
            "INNER JOIN classi on classe = classi.id INNER JOIN alunni on alunni.id = alunno " +
            "LEFT JOIN tag on tag.id = alunni.tag WHERE classi.anno_scolastico = ? " +
            "and classi.classe_futura = ? and classi.scuola = ?";

        var query = connection.query(sql, [annoScolastico, classeFutura, scuola], function (err, rows) {
            callback(err, rows);
        });
    }




};