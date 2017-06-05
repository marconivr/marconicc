/**
 * Created by composizioneClassi on 6/5/2017.
 */
var mysqlDump = require('mysqldump');

mysqlDump({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test',
    tables:['players'], // only these tables
    where: {'players': 'id < 1000'}, // Only test players with id < 1000
    ifNotExist:true, // Create table if not exist
    dest:'./data.sql' // destination file
},function(err){
    // create data.sql file;
})