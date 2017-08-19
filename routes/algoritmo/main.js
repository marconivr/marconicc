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
let legge107 = data.legge107;


//Funzioni


/**
 * Funzione che ritorna l'array di studenti di una classe con l'aggiunta dell'amico dell'alunno passato
 * @param alunniClasse
 * @param alunno
 * @returns {*}
 */
function inserisciAmico(alunniClasse, alunno) {

    let amico = functions.checkDesiderata(alunno);

    if (amico !== undefined) {
        alunniClasse.push(amico);
        functions.deleteStudenti([amico]);
    }

    return alunniClasse
}

/**
 * Funzione che aggiunge i bocciati alla loro classe precedente.
 * @param classi
 * @param bocciati
 * @returns {*}
 */
function inserisciBocciati(classi, bocciati) {
    for (let i in classi) {
        if (bocciati[classi[i].nome] !== undefined) {
            classi[i].alunni = _.merge(classi[i].alunni, bocciati[classi[i].nome]);
            functions.deleteStudenti(bocciati[classi[i].nome]);
        }
    }
    return classi;
}

/**
 * Funzione che inserisce i 104. Inserisce anche gli amici dei 104
 * @param classi
 * @param legge104
 * @returns {*}
 */
function inserisci104(classi, legge104) {
    let n104 = legge104.length;
    while (n104 !== 0) {
        for (let i in classi) {
            let proprieta = functions.generaProprieta(classi[i]);
            if (proprieta.nLegge104 === 0) {
                classi[i].alunni.push(legge104[0]);
                classi[i].alunni = inserisciAmico(classi[i].alunni, legge104[0]);
                n104--;
                break;
            }
        }
    }
    functions.deleteStudenti(legge104);
    return classi;
}

/**
 * Funzione che inserisce i 107. Inserisce anche gli amici dei 107
 * @param classi
 * @param legge107
 * @returns {*}
 */
function inserisci107(classi, legge107) {
    let n107 = legge107.length;

    let i = 0;
    while (n107 !== 0) {
        let proprieta = functions.generaProprieta(classi[i]);
            classi[i].alunni.push(legge107[0]);
            classi[i].alunni = inserisciAmico(classi[i].alunni, legge107[0]);
            n107--;
            i++;
            if(i >= classi.length){
                i = 0;
            }
    }
    functions.deleteStudenti(legge104);
    return classi;
}


//Main

/**
 * Come prima operazione aggiungo tutti i bocciati nelle loro classi precedenti.
 */

classi = inserisciBocciati(classi, bocciati);

classi = inserisci104(classi, legge104);

classi = inserisci107(classi, legge107);

console.log("FINE");

