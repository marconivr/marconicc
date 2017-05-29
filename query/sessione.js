/**
 * In questo file ci saranno le query che troveranno dati utili alla sessione
 */

const mysql = require('mysql');
const dbconfig = require('./../config/database');
const connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);


module.exports = {

    /**
     * Torna un oggetto {PRIME:2017-2018} che rappresenta il settaggio di default che poi verrà salvato globalmente.
     * @param username
     * @param callback
     */
    classiSettaggiDefault: function (scuola,callback) {
        connection.query("SELECT DISTINCT classe_futura,anno_scolastico FROM alunni WHERE scuola = ? ORDER BY anno_scolastico DESC", [scuola], function (err, row) {
            callback(err, row);
        });
    }

};



