/**
 * Created by mattiacorradi on 08/05/2017.
 */

const _ = require("lodash");
const functions = require("./functions");
const async = require('async');

const query = require('../../query/query.js');


let alunni = [];
let settings = [];
let classi = [];

function initVariabili(annoScolastico, scuola, classeFutura, callback){

    console.log("ok");

    async.parallel({
        alunni: function (callback) {
            query.getStudentiOfschool(scuola,annoScolastico,classeFutura, function (err, rows) {
                if (err) {
                    console.log(err)
                } else {
                    callback(err,  rows);
                }
            });
        },
        settings: function (callback) {
            query.scaricaSettings(annoScolastico, scuola, classeFutura, function (err, row) {
                if (err) {
                    console.log(err);
                } else {
                    callback(err, row[0]);
                }
            });
        }

    }, function (err, results) {
        alunni = results.alunni;
        settings = results.settings;

        alunni = functions.fixBocciati(alunni);

        classi = functions.generaClassi(alunni.length, settings);

        for(let i in classi){
            query.insertClassi(classi[i].nome, annoScolastico, classeFutura, scuola);
        }




        let legge104 = _.filter(alunni, function (item) {
            if (item.legge_104 !== "") {
                return item;
            }
        });

        let legge107 = _.filter(alunni, function (item) {
            if (item.legge_107 !== "") {
                return item;
            }
        });

        let femmine = _.filter(alunni, function (item) {
            if ((item.sesso).toLowerCase() === "f") {
                return item;
            }
        });


        let bocciati = _.omit(_.groupBy(alunni, function (item) {
            if (item.classe_precedente !== "") {
                return item.classe_precedente;
            }
        }), [undefined]); //uso l'omit per rimuovere la proprietà undefined che racchiude tutti gli studenti non bocciati

        let cap = _.groupBy(alunni, function (item){
            return item.cap;
        });

        let nazionalita = _.groupBy(alunni, function (item){
            return item.nazionalita;
        });

        let voto = _.groupBy(alunni, function (item){
            return item.voto;
        });


        let n107 = legge107.length;

        let n104 = legge104.length;

        let nFemmine = femmine.length;

        let nClassi = classi.length;

        exports.alunni = alunni;
        exports.settings = settings;
        exports.classi = classi;

        exports.legge104 = legge104;
        exports.legge107 = legge107;
        exports.femmine = femmine;
        exports.bocciati = bocciati;
        exports.cap = cap;
        exports.nazionalita = nazionalita;
        exports.voto = voto;

        exports.n107 = n107;
        exports.n104 = n104;
        exports.nFemmine = nFemmine;
        exports.nClassi = nClassi;

        callback();

    });
}

exports.initVariabili = initVariabili;