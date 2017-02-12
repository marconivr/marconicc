
/**
 * Created by mattiacorradi on 11/02/2017.
 */


//ALL THE QUERY MUST BE INSERTED IN THIS CLASS!!!

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);


module.exports = {


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

        connection.query("INSERT INTO alunni VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[cognome,nome,cf,sesso,dataDiNascita,statoRichiesta,cap,indirizzo,annoScolastico,anno,codice_cat,media_voto],function (err, row) {
            if (err){
                console.log(err);
            }else {
                console.log("INSERITO CORRETTAMENTE");
            }
        });
    }


};