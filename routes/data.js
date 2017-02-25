/**
 * Created by matti on 10/11/2016.
 */


var query = require('./../query/query.js');
var csv = require("csv");
var middleware = require ('./middleware/middleware');
var alg = require("./algorithm.js");

module.exports = function (app,passport,upload) {


    app.post('/upload-csv', upload.single('csv') , middleware.isLoggedIn ,function(req, res){

        var data = req.file; //information about data uploaded (post method)

        csv().from.path(data.path,{
            delimiter: ";",
            escape: ''
        })

        .on("record",function (row,index) {

            query.insertRecordFromCSV(row);

        }).on("error",function (error) {

            console.log(error);

        }).on("end",function () {

            console.log("Finita lettura file");
        });


    });



    app.get('/studenti-prima-json', middleware.isLoggedIn ,function(req, res){

        query.getStudentiPrima(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        });
    });

    /**
     * Per visualizzare il numero di ragazze di prima
    */
    app.get('/numero-ragazze-prima', middleware.isLoggedIn ,function(req, res){

        query.getNumberGirl(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        }, "PRIMA");
    });

    /**
     * Per visualizzare il numero di ragazzi stesso cap con * altrimenti si specifica il codice catastale
     */
    app.get('/numero-stesso-cap', middleware.isLoggedIn ,function(req, res){

        query.getNumberSameResidence(function (err, results) {
            if (err)
                throw err;
            else
                res.send(JSON.stringify(results));
        }, "PRIMA", 37030, "*");
    });

    /**
     * Elenco studenti in tabella
     */
    app.get('/studenti', middleware.isLoggedIn, function (req, res) {
        query.getStudentiPrima(function (err, results) {
            if (err)
                throw err;
            else
                res.render('studenti.ejs', {
                    user: req.user,
                    pageTitle: " Studenti ",
                    studentsData: results
                });
        });
    });

    app.get('/get-classi-composte', middleware.isLoggedIn, function (req,res) {
        var classi;
        alg.loadListAlunni("prima",function (err, results) {
            if (err)
                console.log(err);
            else {
                res.send(results);
            }
        });

    })


}


