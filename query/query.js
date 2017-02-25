
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
    insertRecordFromCSV:function (arrayRow) {

        var tableName = 'alunni';

        var cognome = arrayRow[0];
        var nome = arrayRow[1];
        var cf = arrayRow[2];
        var sesso = arrayRow[3];
        var dataDiNascita = arrayRow[4];
        var statoRichiesta = arrayRow[5];
        var cap = arrayRow[6];
        var indirizzo = arrayRow[7];
        var annoScolastico = arrayRow[8];
        var anno = arrayRow[9];
        var codice_cat = arrayRow[10];
        var media_voto = arrayRow[11];
        var classe_futura = arrayRow[12];

        connection.query("INSERT INTO alunni VALUES (?,?,?,?,STR_TO_DATE(?,'%d/%m/%Y'),?,?,?,?,?,?,?,?)",[cognome,nome,cf,sesso,dataDiNascita.split(" ")[0],statoRichiesta,cap,indirizzo,annoScolastico,anno,codice_cat,media_voto,classe_futura],function (err, row) {
            if (err){
                console.log(err);
            }
        });
    },

    //insertSettings:function

    getStudentiPrima:function (callback) {

        connection.query("SELECT * from alunni WHERE classe_futura = 'PRIMA' AND anno_scolastico = (" + anno_sc + ")",function (err, rows) {
            if (err){
                console.log('error');
            }else {
               callback(err,rows);
            }
        });
    },

    getNumberGirl: function (callback, classe) {

        connection.query("SELECT  DISTINCT count(classe_futura)  as result from alunni WHERE classe_futura = '" + classe + "' AND sesso = 'F' AND anno_scolastico = (" + anno_sc + ")",function (err, rows) {
            if (err){
                console.log('MySQL error');
            }else {
                callback(err,rows);
            }
        });
    }

    ,

    getNumberSameResidence: function (callback, classe, cap, catasto){
        var qry = "SELECT count(*) residences from alunni WHERE classe_futura = '" + classe + "' AND cap_provenienza = " + cap;

        if (catasto != "*") {
            qry += " AND catasto = '" + catasto +"'";
        }
        qry +=  " AND anno_scolastico = (" + anno_sc + ")"
        connection.query(qry, function (err, rows) {
            if (err){
                console.log('MySQL error');
            }else {
                callback(err,rows);
            }
        });
    },

    getNumerOfStudentiPrima:function (callback) {

        connection.query("SELECT  DISTINCT COUNT(classe_futura) as result from alunni WHERE classe_futura = 'PRIMA'",function (err, rows) {
            if (err){
                console.log('error');
            }else {
                callback(err,rows);
            }
        });
    },

    getNumerOfStudentiTerza:function (callback) {

        connection.query("SELECT  DISTINCT COUNT(classe_futura) as result from alunni WHERE classe_futura = 'TERZA'",function (err, rows) {
            if (err){
                console.log('error');
            }else {
                callback(err,rows);
            }
        });
    },
    //
    getAVGOfStudentiPrima:function (callback) {

        connection.query("SELECT ROUND( AVG(media_voti),2 ) as result FROM alunni WHERE classe_futura = 'PRIMA' ",function (err, rows) {
            if (err){
                console.log('error');
            }else {
                callback(err,rows);
            }
        });
    },

    getNumberOfGirlTerza:function (callback) {

        connection.query("SELECT COUNT(classe_futura) as result from alunni where classe_futura = 'TERZA' and sesso = 'F' ",function (err, rows) {
            if (err){
                console.log('error');
            }else {
                callback(err,rows);
            }
        });
    },

    getAVGOfStudentiTerza:function (callback) {

        connection.query("SELECT ROUND( AVG(media_voti),2 ) as result FROM alunni WHERE classe_futura = 'TERZA' ",function (err, rows) {
            if (err){
                console.log('error');
            }else {
                callback(err,rows);
            }
        });
    },
};