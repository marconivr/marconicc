/**
 * Created by matti on 12/07/2017.
 */


//Dipendenze
const _ = require("lodash");
const colors = require('colors').enabled = true;

//File
const data = require("./data");
const functions = require("./functions");

//Variabili e costanti
const settings = data.settings;

let alunni = data.alunni;
let classi = data.classi;
let bocciati = data.bocciati;
let legge104 = data.legge104;



//Funzioni

/**
 * Funzione che aggiunge i bocciati alla loro classe precedente.
 * @param classi
 * @param bocciati
 * @returns {*}
 */
function inserisciBocciati(classi, bocciati) {
    for(let i in classi){
        classi[i].alunni = _.merge(classi[i].alunni, bocciati[classi[i].nome]);
        functions.deleteStudenti(bocciati[classi[i].nome]);
    }
    return classi;
}

function inserisci104(classi, legge104) {
    for(let i in classi){
        let proprieta = functions.generaProprieta(classi[i]);

    }

}


//Main

/**
 * Come prima operazione aggiungo tutti i bocciati nelle loro classi precedenti.
 */
classi = inserisciBocciati(classi, bocciati);


classi = inserisci104(classi, 104);

console.log("FINE");

