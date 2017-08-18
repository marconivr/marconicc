/**
 * Created by matti on 12/07/2017.
 */


const _ = require("lodash");
const data = require("./data");

const settings = data.settings;
const alunni = data.alunni;
constB classi = data.classi;

const colors = require('colors').enabled = true;


function check104(classe) {
    let n_legge_104 = _(_.filter(this.alunni, function (item) {
        if (item.legge_104 !== "") {
            return item;
        }
    })).size();

    if (n_legge_104 === 0){
        return true;
    }
}


function inserisci104(alunno) {
    for
}


let legge_104 = _.filter(alunni, function (item) {
    if (item.legge_104 !== "") {
        return item;
    }
});


_.forEach(legge_104, function (alunno) {
    inserisci104(alunno);
});

console.log(classi);