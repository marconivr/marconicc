/**
 * Created by michele on 2/13/17.
 */

var middleware = require('./middleware/middleware');
var query = require('./../query/query.js');

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


//
// {
//     "classi":[
//     {
//         "nome_classe":"1af",
//         "alunni":
//             [
//                 {
//                     "name":"luigi",
//                     "surname" : "verdi",
//                     "media_voti":7,
//                     "cf":"dfhsddg44f"
//                 },
//                 {
//                     "name":"mario",
//                     "surname" : "rossi",
//                     "media_voti":7,
//                     "cf":"dfhsddg44f"
//                 }
//
//             ]
//     },
//     {
//         "nome_classe":"1ad",
//         "alunni":
//             [
//                 {
//                     "name":"luigi",
//                     "surname" : "verdi",
//                     "media_voti":7,
//                     "cf":"dfhsddg44f"
//                 },
//                 {
//                     "name":"mario",
//                     "surname" : "rossi",
//                     "media_voti":7,
//                     "cf":"dfhsddg44f"
//                 }
//
//             ]
//     }
//
// ]
// }
module.exports = {
    loadListAlunni: function (classe) {
        if (classe.toLowerCase() == "prima") {
            query.getStudentiPrima(function (err, results) {
                if (err)
                    throw err;
                else{
                    var string = JSON.stringify(results);
                    var json =  JSON.parse(string);
                    module.exports.numberOfClassi("prima");
                    listAlunni.push(json);
                    module.exports.createListClassi("prima");

                }
            });
        }

    }
    ,

    numberOfClassi:function(classe){
        if (classe.toLowerCase() == "prima") {
            query.getNumerOfStudentiPrima(function (err, results) {
                if (err)
                    throw err;
                else{
                    var string = JSON.stringify(results);
                    var json =  JSON.parse(string);

                    var num = Math.round(json[0].result / (settings.min_al));

                    for(i = 0 ; i < num; i++){
                        //esempio di inserimento classi
                        try {
                            classe = "1" + CLASS[i] + "";
                        }
                        catch (err){
                            classe = "1a"  + "";
                        }
                        listClassi.push({nome:classe, alunni:[]});
                    }

                    console.log(listClassi);
                    console.log(num);
                }
            });
        }
    },

    createListClassi: function(classe){
        if (classe.toLowerCase() == "prima") {
            while (listAlunni.length != 0){
                for(var classe in listClassi){
                    for (i = 0; i < settings.max_al; i++){
                        var alunno = listAlunni[Math.floor(Math.random() * listAlunni.length)];
                        classe.alunni.push(alunno);
                        listAlunni.splice(listAlunni.indexOf(alunno), 1);
                        if (classe.alunni.length >= settings.min_al){
                            break;
                        }
                    }
                }
            }
            console.log(listClassi);
        }
    }

}
var findPriority = function (classe) {
    for (i=0;i<priority.length;i++){

        if (priority[i] == "alunni"){
            countAlunni(classe)
        }
        if (priority[i] == "femmine"){
            countFemmine(classe)
        }
        if (priority[i] == "stranieri"){
            countStranieri(classe)
        }
        if (priority[i] == "bocciati"){
            countBocciati(classe)
        }
        if (priority[i] == "stessa_provenienza"){
            countStessaProv(classe)
        }
        if (priority[i] == "media"){
            media(classe)
        }
    }
}

var countAlunni = function(classe){

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