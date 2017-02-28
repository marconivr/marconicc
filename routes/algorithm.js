/**
 * Created by michele on 2/13/17..
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
var listaAlunni = [];
var listaClassi = [];  //esempio [{nome:"1AI", proprieta:{alunni:23, femmine:2}, alunni:[{nome:"Mario", cognome:"Rossi"}]}]

module.exports = {
    loadListAlunni: function (classe, callback) {
        if (classe.toLowerCase() == "prima") {
            query.getStudentiPrima(function (err, results) {
                if (err)
                    throw err;
                else {
                    async.waterfall(
                        [
                            function (callback) {
                                var string = JSON.stringify(results);
                                callback(null, string);
                            },
                            function (string, callback) {
                                var json = JSON.parse(string);
                                callback(null, json);
                            },
                            function (json, callback) {
                                listaAlunni = json;
                                callback();
                            },
                            function (callback) {
                                module.exports.numberOfClassi("prima", function () {
                                    callback();
                                });
                            },
                            function (callback) {
                                module.exports.createListClassi("prima", function () {
                                    callback();
                                });
                            }
                        ],
                        function (err, succes) {
                            if (err) {
                                console.log(err);
                            } else {
                                callback(err, listaClassi);
                            }
                        }
                    )
                }
            });
        }
    },

    numberOfClassi: function (classe, callback) {
        if (classe.toLowerCase() == "prima") {
            var num = Math.round(listaAlunni.length / (settings.min_al));
            for (i = 0; i < num; i++) {
                //assing class name
                var classe = "1" + String.fromCharCode(65 + i);
                listaClassi.push({nome: classe, proprieta:{}, alunni: []});
            }
        }
        callback();
    },

    createListClassi: function (classe, callback) {
        if (classe.toLowerCase() == "prima") {
            while (listaAlunni.length != 0) {
                for (k = 0; k < listaClassi.length; k++) {
                    for (var i = 0; i < settings.max_al; i++) {
                        var alunno = listaAlunni[Math.floor(Math.random() * listaAlunni.length)];
                        listaClassi[k].alunni.push(alunno);
                        listaAlunni.splice(listaAlunni.indexOf(alunno), 1);
                        if (listaClassi[k].alunni.length >= settings.min_al) {
                            break;
                        }
                    }
                }

            }
            callback();
        }
    },

    listaNomiClassi: function () {
        var listaNomi = [];
        for (var k = 0; k < listaClassi.length; k++) {
            listaNomi.push(listaClassi[k].nome);
        }
        return listaNomi;
    },

    countAlunni : function (listaAlunniClasse) {
        return listaAlunniClasse.length;
    },

    /**
     * countFemmine Data la classe ritorna il numero di femmine
     * @param classe
     * @returns {Number}
     */
    countFemmine : function (listaAlunniClasse) {
        var cont = 0;
        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].sesso == "F") {
                cont++;
            }
        }
        return cont;
    },

    mediaClasse : function (listaAlunniClasse) {
        var somma = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            somma += listaAlunniClasse[i].media_voti;
        }

        return (somma / listaAlunniClasse.length);

    },

    countStranieri : function (listaAlunniClasse) {

    },

    countBocciati : function (listaAlunniClasse) {

    },

    countStessaProv : function (listaAlunniClasse) {
        var cont = 0;
        var cont1 = 0;
        var prov;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            prov = classe.alunni[i].cap_provenienza;

            for (var j = i + 1; j < listaAlunniClasse.length; j++) {
                if (prov == listaAlunniClasse[j].cap_provenienza){
                    cont+=1;
                }
            }
            if (cont >= cont1){
                cont1 = cont;
            }
            cont = 0;
        }
        return cont1 + 1;
    }

}

/*
var findPriority = function (classe) {

    for (i = 0; i < priority.length; i++) {
        switch (priority[i]) {
            case "alunni":
                /countAlunni(classe);
                break;
            case "femmine":
                countFemmine(classe);
                break;
            case "stranieri":
                countStranieri(classe);
                break;
            case "bocciati":
                countBocciati(classe);
                break;
            case "stessa_provenienza":
                countStessaProv(classe);
                break;
            case "media":
                mediaClasse(classe);
                break;
        }
    }
}
*/

/**
 * findClasseFromString data una stringa ritorna l'oggetto classe dato il nome
 * @param nomeClasse stringa
 * @returns {object}
 */

var findClasseFromString = function (nomeClasse) {
    for (var k = 0; k < listaClassi.length; k++) {
        if (listaClassi[k].nome == nomeClasse) {
            return listaClassi[k];
        }
    }
    return null;
}

/**
 * classeIsObj controlla se l'oggetto passato è una string; se lo è ritorna l'oggetto classe con quel nome, se non lo è ritorna l'oggetto
 * @param classe
 * @returns {object}
 */
var classeIsObj = function (classe) {
    if (typeof classe === 'string' || classe instanceof String) {
        return findClasseFromString(classe);
    }

    else {
        return classe;
    }
}