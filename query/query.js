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
    insertRecordFromCSV: function (arrayRow) {
        var cognome = arrayRow[0];
        var nome = arrayRow[1];
        var matricola = arrayRow[2];
        var cf = arrayRow[3];
        var sesso = arrayRow[4];
        var dataDiNascita = arrayRow[5];
        var statoRichiesta = arrayRow[6];
        var cap = arrayRow[7];
        var nazionalita = arrayRow[8];
        var legge_107 = arrayRow[9];
        var legge_104 = arrayRow[10];
        var classe_precedente = arrayRow[11];
        var indirizzo = arrayRow[12];
        var annoScolastico = arrayRow[13];
        var anno = arrayRow[14];
        var codice_cat = arrayRow[15];
        var media_voto = arrayRow[16];
        var condotta = arrayRow[17];
        var classe_futura = arrayRow[18];
        var tag = arrayRow[19];
        connection.query("INSERT INTO alunni VALUES (?,?,?,?,?,STR_TO_DATE(?,'%d/%m/%Y'),?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [cognome, nome, matricola, cf, sesso, dataDiNascita.split(" ")[0], statoRichiesta, cap, nazionalita, legge_107, legge_104, classe_precedente,indirizzo , annoScolastico, anno, codice_cat, media_voto, condotta, classe_futura,tag], function (err, row) {
            if (err) {
                console.log(err);
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

    insertTag: function (callback, tag, descrizione) {
        connection.query("INSERT INTO tag VALUES (?, ?)", [tag, descrizione], function (err, row) {
            if (err) {
                console.log(err);
            }else {
                callback(err, row, tag, descrizione);
            }
        });
    },

    insertSettings: function (callback, alunniMin, alunniMax, femmine, stranieri, residenza, iniziale, mediaMin, mediaMax, bocciati) {
        connection.query("INSERT INTO impostazioni VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [1, alunniMin, alunniMax, femmine, stranieri, residenza, iniziale, mediaMin, mediaMax, bocciati], function (err, row) {
            if (err) {
                console.log(err);
            }else {
                callback(err, row, alunniMin, alunniMax, femmine, stranieri, residenza, iniziale, mediaMin, mediaMax, bocciati);
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

    getNumerOfStudentiPrima: function (callback) {

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

        connection.query("SELECT ROUND( AVG(media_voti),2 ) as result FROM alunni WHERE classe_futura = 'PRIMA' ", function (err, rows) {
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
};