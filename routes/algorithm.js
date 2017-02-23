/**
 * Created by michele on 2/13/17.
 */

var middleware = require('./middleware/middleware');
var query = require('./../query/query.js');

//settings var
var settings = {
    max_al: 28,
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
var listClassi = [] //esempio [{nome:"1AI", alunni:[{nome:"Mario", cognome:"Rossi"}]}]

module.exports = {
    loadListAlunni: function (classe) {
        if (classe.toLowerCase() == "prima") {
            query.getNumerOfStudentiPrima(function (err, results) {
                if (err)
                    throw err;
                else{
                    console.log('>> results: ', results );
                    var string = JSON.stringify(results);
                    console.log('>> string: ', string );
                    var json =  JSON.parse(string);
                    console.log('>> json: ', json);
                    console.log('>> user.name: ', json[0]);
                }
            });
        }
    }

}