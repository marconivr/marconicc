
/**
 * Created by matti on 10/11/2016.
 */



var csv = require("csv");
var middleware = require ('./middleware/middleware');

module.exports = function (app,passport,upload) {


    app.post('/upload-csv', upload.single('csv') , middleware.isLoggedIn ,function(req, res){
        var data = req.file;

        //information about data uploaded
        console.log(data);


        csv().from.path(data.path,{
            delimiter: ";",
            escape: ''
        })

        .on("record",function (row,index) {

            console.log(row);

        }).on("end",function () {

            res.send('ok');

        }).on("error",function (error) {

            console.log(error.message);

        })
    });



}


