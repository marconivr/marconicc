/**
 * Created by composizioneClassi on 6/5/2017.
 */
var mysqlDump = require('mysqldump');
var mysqlConnection = require('./config/database');


mysqlDump({
    host: mysqlConnection.connection.host,
    user: mysqlConnection.connection.user,
    password: mysqlConnection.connection.password,
    database: mysqlConnection.database,
    dest: './backup/' + new Date().toDateString() + ' data.sql'
},function(err){
    // create data.sql file;
});