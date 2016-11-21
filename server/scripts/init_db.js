/**
 * Created by barrett on 8/28/14.
 */

var mysql = require('mysql');
var dbconfig = require('../config/database');
var fs = require('fs');

var connection = mysql.createConnection(dbconfig.connection);

var Iconv = require('iconv').Iconv;

Buffer.prototype._$_toString = Buffer.prototype.toString;
Buffer.prototype.toString = function(charset) {
    if (typeof charset == 'undefined' || charset == 'utf8' || charset == 'utf16le'
        || charset == 'ascii' || charset == 'ucs2' || charset == 'binary'
        || charset == 'base64' || charset == 'hex') {
        return this._$_toString.apply(this, arguments);
    }
    var iconv = new Iconv(charset, 'UTF-8');
    var buffer = iconv.convert(this);
    var args = arguments;
    args[0] = 'utf8';
    return buffer.toString.apply(buffer, args);
}


// fs.readFile( __dirname + '/composizione_classi.sql', function (err, data) {
//     if (err) {
//         console.log(err)
//     }
//
//     connection.query(data);
//
//     console.log('Success: Database Created!')
//
//     connection.end();
// });




var sql = fs.readFileSync(__dirname,'users.sql', { encoding: 'utf8'}).toString();

connection.query(sql);

connection.end();