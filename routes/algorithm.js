/**
 * Created by michele on 2/13/17.
 */

var middleware = require('./middleware/middleware');
var query = require('./../query/query.js');
var async = require('async');

//settings var
var settings = {
    max_al: 28,
    min_al: 25,
    max_fem: 3,
    max_str: 5,
    stessa_pr: 4,
    media_min: 7.3,
    media_max: 8.0,
    boc: 2,
    an_scol: "2017-2018"
}
var priority = {}
var listAlunni = [];
var listClassi = []  //esempio [{nome:"1AI", alunni:[{nome:"Mario", cognome:"Rossi"}]}]
var CLASS = ["a","b","c","d","f","g","h","i","l","m","n","o","p","q","r","s","t","u","v","z"];


module.exports = {
    loadListAlunni: function (classe,callback) {
        if (classe.toLowerCase() == "prima") {
            query.getStudentiPrima(function (err, results) {
                if (err)
                    throw err;
                else{

                    async.waterfall(
                        [
                            function (callback) {
                                var string = JSON.stringify(results);
                                callback(null,string);

                            },
                            function (string,callback) {
                                var json =  JSON.parse(string);
                                callback(null,json);
                            },
                            function (json,callback) {
                                listAlunni = json;
                                callback();
                            },
                            function (callback) {
                                module.exports.numberOfClassi("prima",function () {
                                    callback();
                                });
                            },
                            function (callback) {
                                module.exports.createListClassi("prima",function () {
                                    callback();
                                });
                            }
                        ],
                        function (err,succes) {
                            if (err){
                                console.log(err);

                            }else{
                                callback(err,listClassi);
                            }

                        }

                    )
                }
            });

        }

    },

    numberOfClassi: function (classe,callback) {
        if (classe.toLowerCase() == "prima") {
            var num = Math.round(listAlunni.length / (settings.min_al));
            for (i = 0; i < num; i++) {
                try {
                    classe = "1" + CLASS[i] + "";
                }
                catch (err) {
                    classe = "1a" + "";
                }
                listClassi.push({nome: classe, alunni: []});
            }
        }
        callback();
    }
    ,

    createListClassi: function (classe,callback) {
        if (classe.toLowerCase() == "prima") {
            while (listAlunni.length != 0){
                for(k = 0; k < listClassi.length; k++){
                    for (i = 0; i < settings.max_al; i++){
                        var alunno = listAlunni[Math.floor(Math.random() * listAlunni.length)];
                        listClassi[k].alunni.push(alunno);
                        listAlunni.splice(listAlunni.indexOf(alunno), 1);
                        if (listClassi[k].alunni.length >= settings.min_al){
                            break;
                        }
                    }
                    findPriority(listClassi[k]);
                }
            }
            console.log(listClassi);
            callback();
        }
    }

}

var findPriority = function (classe) {

    for (i = 0;i < priority.length;i++){
        switch (priority[i]){
            case "alunni":
                countAlunni(classe);
                break;
            case "femmine":
                countFemmine(classe);
                break;
            case "stranieri":
                countStranieri(classe);
                break;
            case "bocciati":
                countBocciati(classe)
                break;
            case "stessa_provenienza":
                countStessaProv(classe)
                break;
            case "media":
                media(classe);
                break;
        }
    }
}

var countAlunni = function(classe){
    console.log(classe.alunni.length) ;
}

var countFemmine = function(classe){

}

var countStranieri = function(classe){

}

var countBocciati = function(classe){

}

var countStessaProv = function(classe){

}

var media = function(classe){

}