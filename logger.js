/**
 * Created by Francesco-Taioli on 09/06/2017.
 */
// logger.js
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            filename: 'exception/' + new Date().toDateString() + '.log',
            handleExceptions: true,
            prettyPrint: true,
            level: 'error',
            colorize: true,
            timestamp: true
        })

    ], exitOnError: false
});

module.exports = logger;