
/**
 * Created by matti on 10/11/2016.
 */


var query = require('./../query/query.js');

var csv = require("csv");
var middleware = require ('./middleware/middleware');

module.exports = function (app,passport,upload) {


    app.post('/upload-csv', upload.single('csv') , middleware.isLoggedIn ,function(req, res){

        var data = req.file; //information about data uploaded (post method)

        csv().from.path(data.path,{
            delimiter: ";",
            escape: ''
        })

        .on("record",function (row,index) {

            query.insertRecordFromCSV(row);

        }).on("end",function () {

            res.send('ok');

        }).on("error",function (error) {

            console.log(error.message);

        })
    });



}


