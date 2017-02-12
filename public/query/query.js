/**
 * Created by mattiacorradi on 11/02/2017.
 */

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);



module.exports = {

    getUsersInformations:function getUsersInformations(){

        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });

    }


};