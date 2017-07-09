/**
 * In questo file ci saranno le query che troveranno dati utili alla sessione
 */

const mysql = require('mysql');
const dbconfig = require('./../config/database');
//const connection = mysql.createConnection(dbconfig.connection);

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



