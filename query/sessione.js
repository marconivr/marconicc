/**
 * In questo file ci saranno le query che troveranno dati utili alla sessione
 */

const mysql = require('mysql');
const dbconfig = require('./../config/database');
const connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);


module.exports = {

    /**
     * Passato lo username torna un oggetto che contiene (username,diritti,id_scuola,nome_scuola)
     * @param username
     * @param callback
     */
    sessioneDati: function (username,callback) {
        connection.query("select username,diritti,scuole.id as id_scuola,scuole.nome as nome_scuola from utenti INNER JOIN scuole ON utenti.scuola = scuole.id where username = '?' ", [username], function (err, row) {
                if (err) {
                    console.log(err);
                } else{
                    callback(JSON.stringify(row));
                }
            });
        }
};



