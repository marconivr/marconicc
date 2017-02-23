/**
 * Created by michele on 2/13/17.
 */

var middleware = require('./middleware/middleware');
var query = require('./../query/query.js');

//settings var
var settings = {
    max_al: 28,
    min_al: 28,
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
                    listAlunni.push(json);
                    console.log(listAlunni);
                }
            });
        }
    }

    ,

    createListClassi: function(classe){
        if (classe.toLowerCase() == "prima") {

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

                    var num = json[0].result / (settings.)
                }
            });
        }
    }

}