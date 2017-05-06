/**
 * Created by mattiacorradi on 11/02/2017.
 */


//ALL THE QUERY MUST BE INSERTED IN THIS CLASS!!!

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

//for select strudents of this year
var anno_sc = "SELECT CONCAT_WS('-', YEAR(CURDATE()), YEAR(DATE_ADD(CURDATE(), INTERVAL 1 YEAR))) AS anno_scolastico";


module.exports = {

    /*
     * Function for insert students into db having an array of data
     */
    insertRecordFromCSV: function (arrayRow,scuola,utente) {
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

        var query = connection.query("INSERT INTO alunni VALUES (?,?,?,?,?,?,?,STR_TO_DATE(?,'%d/%m/%Y'),?,?,?,?,?,?,?,?,?,?,?,?,?);", ['', cognome, nome, matricola, cf, desiderata, sesso, dataDiNascita.split(" ")[0], cap, nazionalita, legge_107, legge_104, classe_precedente,sceltaIndirizzo , annoScolastico, codiceCatastale, voto, classe_futura,scuola,utente,descrizione], function (err) {
            if (err) {
                throw err;
            }

        });

    },

    /*
     * Function for insert classi into db having an array of data
     */
    insertClassi: function (listaNomiClassi) {
        for (var k = 0; k < listaNomiClassi.length; k++) {
            connection.query("INSERT INTO classi VALUES (?)", [listaNomiClassi[k]], function (err, row) {
                if (err) {
                    console.log(err);
                }
            });
        }
    },

    insertAlunnoInClass: function (classe, cf) {
        connection.query("INSERT INTO comp_classi VALUES (?, ?)", [classe, cf], function (err, row) {
            if (err) {
                console.error(err);
            }
        });
    },

    removeAlunnoInClass: function (classe, cf) {
        connection.query("DELETE FROM comp_classi WHERE nome_classe = '" + classe + "' AND cf_alunno = '" + cf +  "'", function (err, row) {
            if (err) {
                console.error(err);
            }
        });
    },

    /**
     * aggiorna la classe di uno studente, serve per salvare su db
     * @param cf
     * @param classe
     */
    updateAlunnoClass: function (callback, cf, classe) {
        connection.query("UPDATE comp_classi SET nome_classe = '" + classe + "' WHERE cf_alunno = '" + cf + "'", function (err, row) {
            if (err) {
                console.error(err);
            }
        });
    },

    insertHistory: function (callback, cf, toClass, fromClass, idUtente, anno_scolastico) {
        connection.query(
            "INSERT INTO history (cf, classe_precedente, classe_successiva, id_utente, anno_scolastico) VALUES (?,?,?,?,?)",
            [cf, fromClass, toClass, idUtente,anno_scolastico],
            function (err, rows) {
                if (err) {
                    throw err;
                } else {
                    callback(err, rows);
                }
            });
    },

    getHistory: function (callback) {
        connection.query(
            "SELECT * FROM `history` order by timestamp DESC",
            function (err, rows) {
                if (err) {
                    throw err;
                } else {
                    callback(err, rows);
                }
            });
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
    

    insertSettingsPrime: function (callback, data, descrizione, alunniMin, alunniMax, femmine, stranieri, residenza, nazionalita, naz_per_classe, max_al_104) {
        connection.query("INSERT INTO impostazioni_prime (data, descrizione, min_alunni, max_alunni, max_femmine, max_stranieri, stessa_provenienza, nazionalita, naz_per_classe , max_al_104) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [data, descrizione, alunniMin, alunniMax, femmine, stranieri, residenza, nazionalita, naz_per_classe , max_al_104], function (err, row) {
            if (err) {
                console.log(err);
            }else {
                callback(err, row, data, descrizione, alunniMin, alunniMax, femmine, stranieri, residenza, nazionalita, naz_per_classe, max_al_104);
            }
        });
    },

    getSettingsPrime: function (callback) {
        connection.query("select DATE_FORMAT(data, '%d-%m-%Y') as data, descrizione, min_alunni, max_alunni, max_femmine, max_stranieri, stessa_provenienza, nazionalita, naz_per_classe, max_al_104 from impostazioni_prime", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },

    getSettingsPrimeForAlgorithm: function (callback) {
        connection.query("select id, DATE_FORMAT(data, '%d-%m-%Y') as data, min_alunni as min_al, max_alunni as max_al, max_femmine as fem, max_stranieri as max_str, stessa_provenienza as stessa_pr, nazionalita, naz_per_classe, max_al_104 from impostazioni_prime order by id desc limit 1", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },

    insertSettingsTerze: function (callback, data, descrizione, alunniMin, alunniMax, femmine, stranieri, residenza, iniziale, ripetenti) {
        connection.query("INSERT INTO impostazioni_terze(data, descrizione, min_alunni, max_alunni, max_femmine, max_stranieri, stessa_provenienza, stessa_iniziale, ripetenti) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [data, descrizione, alunniMin, alunniMax, femmine, stranieri, residenza, iniziale, ripetenti], function (err, row) {
            if (err) {
                console.log(err);
            }else {
                callback(err, row, data, descrizione, alunniMin, alunniMax, femmine, stranieri, residenza, iniziale, ripetenti);
            }
        });
    },

    getSettingsTerze: function (callback) {
        connection.query("select DATE_FORMAT(data, '%d-%m-%Y') as data, descrizione, min_alunni, max_alunni, max_femmine, max_stranieri, stessa_provenienza, stessa_iniziale, ripetenti from impostazioni_terze", function (err, rows) {
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

    getAlunniFromClass: function(classe, callback){
        connection.query("SELECT alunni.* from (comp_classi inner join classi on nome_classe = nome) inner join alunni on cf_alunno = cf where nome_classe = '" + classe + "'", function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                callback(err, rows);
            }
        });
    },

    getAlunniFromClassSync: function(classe, count, callback) {
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
        if (classe.toLowerCase() == "prima"){
            ncl = 1;
        } else if(classe.toLowerCase() == "terza"){
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

    getStudentiPrima: function (callback) {
        connection.query("SELECT * from alunni WHERE classe_futura = 'PRIMA' AND anno_scolastico = (" + anno_sc + ")", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },

    getStudentiTerza: function (callback) {

        connection.query("SELECT * from alunni WHERE classe_futura = 'TERZA' AND anno_scolastico = (" + anno_sc + ")", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },

    getNumberGirl: function (callback, classe) {

        connection.query("SELECT  DISTINCT count(classe_futura)  as result from alunni WHERE classe_futura = '" + classe + "' AND sesso = 'F' AND anno_scolastico = (" + anno_sc + ")", function (err, rows) {
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

    getNumerOfStudentiTerza: function (callback) {

        connection.query("SELECT  DISTINCT COUNT(classe_futura) as result from alunni WHERE classe_futura = 'TERZA'", function (err, rows) {
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

    getNumberOfGirlTerza: function (callback) {

        connection.query("SELECT COUNT(classe_futura) as result from alunni where classe_futura = 'TERZA' and sesso = 'F' ", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },

    getAVGOfStudentiTerza: function (callback) {

        connection.query("SELECT ROUND( AVG(media_voti),2 ) as result FROM alunni WHERE classe_futura = 'TERZA' ", function (err, rows) {
            if (err) {
                console.log('error');
            } else {
                callback(err, rows);
            }
        });
    },

    /**
     * return students from the search service
     * @param callback
     * @param identifier
     */
    getAllStudents: function (callback,identifier) {
        var nome, cognome;
        nome = identifier.split(" ")[1];
        cognome = identifier.split(" ")[0];

        connection.query(
            "SELECT * FROM alunni WHERE cognome LIKE ? or nome LIKE ? OR (CONCAT(cognome, nome) LIKE ?)",
            ["%" + identifier + "%", "%" + identifier + "%", "%" + cognome + nome + "%"],
            function (err, rows) {
            if (err) {
                throw err;
            } else {
                callback(err, rows);
            }
        });
    },

    getStudentByCf: function (callback,cf) {

        connection.query("SELECT * FROM alunni WHERE cf = '" + cf + "'", function (err, rows) {
            if (err) {
                throw err;
            } else {
                callback(err, rows);
            }
        });
    },

    getAllTag: function (callback,cf) {

        connection.query("SELECT * FROM tag", function (err, rows) {
            if (err) {
                throw err;
            } else {
                callback(err, rows);
            }
        });
    },

    updateTagFromCF: function (callback, tag, cf) {
        var query;
        if(tag == 'none')  query = "UPDATE alunni set tag = NULL WHERE cf = '" + cf + "'";
        else  query = "UPDATE alunni set tag = '" + tag + "'  WHERE cf = '" + cf + "'";

        connection.query(query, function (err, rows) {
            if (err) {
                throw err;
            } else {
                callback(err, rows);
            }
        });
    }
    ,

    getClassiComposteForExport: function (callback) {
        var query = "SELECT alunni.matricola, alunni.cf, alunni.cognome, alunni.nome, alunni.data_di_nascita, alunni.sesso,alunni.CAP, alunni.nazionalita, " +
            "alunni.legge_107, alunni.legge_104, alunni.classe_precedente, alunni.anno_scolastico,alunni.voto,alunni.tag,alunni.desiderata from alunni " +
            "INNER JOIN comp_classi as m1 on alunni.cf = m1.cf_alunno";

        connection.query(query, function (err, rows) {
            if (err) {
                throw err;
            } else {
                callback(err, rows);
            }
        });

    }
    ,

    generazioneAvvenuta: function (callback) {
        var query = "SELECT alunni.matricola FROM c"
    }

};