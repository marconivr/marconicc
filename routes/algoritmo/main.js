/**
 * Created by matti on 12/07/2017.
 */

//Dipendenze
const _ = require("lodash");
const colors = require('colors').enabled = true;
const async = require('async');

//File

let functions = undefined;
let data = undefined;
const query = require('../../query/query.js');

const debug = true;

//Funzioni

/**
 * Funzione che ritorna l'array di studenti di una classe con l'aggiunta dell'amico dell'alunno passato
 * @param alunniClasse
 * @param alunno
 * @returns {*}
 */
function getAmico(alunno) {

    let amico = functions.checkDesiderata(alunno);

    if (amico !== undefined) {
        functions.deleteStudenti([amico]);
        return amico;
    }

    return undefined;



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
 * TODO: Sarebbe bello riuscire a mettere i 104 guardando la provenienza e il numero delle nazionalità, visto che con questo ordine i bocciati sono già inseriti
 */
function inserisci104(classi, legge104) {
    let n104 = legge104.length;
    while (n104 !== 0) {
        for (let i in classi) {
            let proprieta = functions.generaProprieta(classi[i]);
            if (proprieta.nLegge104 === 0) {

                classi[i].alunni.push(legge104[0]);


                let amico = getAmico(legge104[0]);


                if(amico !== undefined){
                    classi[i].alunni.push(amico);
                    if(amico.legge_104 !== ""){
                        n104--;
                    }
                }

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
 *
 * TODO: Sarebbe bello riuscire a mettere i 107 in più del secondo giro non nelle prime classi ma guardando la provenienza e il numero delle nazionalità.
 */
function inserisci107(classi, legge107) {
    let n107 = legge107.length;

    let app107 = legge107.slice();

    let i = 0;
    while (n107 !== 0) {
        let proprieta = functions.generaProprieta(classi[i]);
        if(proprieta.nLegge104 === 0){
            classi[i].alunni.push(legge107[0]);

            n107--;

            let amico = getAmico(legge107[0]);

            legge107.splice(0,1);

            if(amico !== undefined){
                classi[i].alunni.push(amico);
                if(amico.legge_107 !== ""){
                    n107--;
                }
            }

        }
        i++;
        if (i >= classi.length) {
            i = 0;
        }

    }
    functions.deleteStudenti(app107);
    return classi;
}

function inserisciFemmine(classi, femmine){

    let nFemmine = femmine.length;

    let nFemminePerClasse = data.settings.gruppo_femmine;

    let classiConFemmine = functions.classiConFemmine(classi, femmine);

    let groupFemmine = functions.groupBy(femmine, "nazionalita");

    //STEP 1, inserisco le femmine nelle classi che ne hanno già
    for(let i in classiConFemmine){
        let classe = classiConFemmine[i];
        for(let j in classi){
            if(classi[j].nome === classe){

                let countGroupClasse = functions.countGroupAlunniClasse(classi[j].alunni);
                let propClasse = functions.generaProprieta(classi[j]);

                let femmineRimanenti = nFemminePerClasse - propClasse.nFemmine;


                    //Inserisco studenti con una nuova nazionalità nella classe
                    for(let i in countGroupClasse.nazionalita){
                        if(countGroupClasse.nazionalita[i] < data.settings.gruppo_nazionalita){
                            if(groupFemmine[i] !== undefined){
                                let arrayRis = groupFemmine[i];

                                //TODO se ce ne sono di più sarebbe bello poter prendere qualcuno che ha anche il cap in comune
                                if(arrayRis.length > 0){
                                    classi[j].alunni.push(arrayRis[0]);

                                    let amico = getAmico(arrayRis[0]);
                                    if(amico !== undefined){
                                        classi[j].alunni.push(amico);
                                        if(amico.sesso === "F"){
                                            femmineRimanenti--;
                                        }
                                    }

                                    functions.deleteStudenti(arrayRis);
                                    delete groupFemmine[i];
                                    nFemmine--;
                                    femmineRimanenti--;
                                }
                            }
                        }
                    }

                    //Inserisco studenti che hanno una nazionalità già presente in quella classe
                    if(_.size(countGroupClasse.nazionalita) < data.settings.nazionalita_per_classe){
                        let arrayRis = _.filter(femmine, function (o){
                            if(countGroupClasse.nazionalita[o.nazionalita] === undefined){
                                return o;
                            }
                        });

                        //TODO se ce ne sono di più sarebbe bello poter prendere qualcuno che ha anche il cap in comune
                        if(arrayRis.length > 0){
                            classi[j].alunni.push(arrayRis[0]);
                            let amico = getAmico(arrayRis[0]);
                            if(amico !== undefined){
                                classi[j].alunni.push(amico);
                                if(amico.sesso === "F"){
                                    femmineRimanenti--;
                                }
                            }
                            functions.deleteStudenti(arrayRis);
                            delete groupFemmine[arrayRis[0].nazionalita];
                            nFemmine--;
                            femmineRimanenti--;
                        }

                    }

                    //Se arrivo qui significa che in quella classe posso aggiungere solo femmine rimanenti
                    //TODO al posto di inserire quella in posizione 0 potrei guardare cap e voti
                    while(femmineRimanenti !== 0){

                        if(femmineRimanenti >= femmine.length){
                            femmineRimanenti = femmine.length;
                        }

                        let studente = femmine[0];

                        if(femmineRimanenti === 1){
                            studente = functions.findStudenteSenzaDesiderata(femmine);
                        }

                        classi[j].alunni.push(studente);

                        functions.deleteStudenti([studente]);
                        femmineRimanenti--;

                        let amico = getAmico(studente);
                        if(amico !== undefined){
                            classi[j].alunni.push(amico);
                            if(amico.sesso === "F"){
                                femmineRimanenti--;
                                //qua va a meno uno perchè l'ultima femmina ha una amica e quindi diventano 5, devo quindi rimuovere una femmina che non ha amici dalla classe e ripusharlo nell'insieme delle femmine
                                if(femmineRimanenti <= 0){
                                    break;
                                }

                            }
                        }

                    }
            }
        }
    }

    //Ora devo inserire le femmine rimanenti nelle altre classi.

   //Questo metodo è altamente instabile. Non ho tempo per farlo meglio

    let femmineRimanenti = femmine.length;


    if(femmineRimanenti !== 0){
        for(let i in classi){
            if(!classiConFemmine.includes(classi[i].nome)){
                let j = 0;

                while (j < data.settings.gruppo_femmine && j < femmine.length){
                    classi[i].alunni.push(femmine[0]);

                    let amico = getAmico(femmine[0]);

                    functions.deleteStudenti([femmine[0]]);

                    if(amico !== undefined){
                        classi[i].alunni.push(amico);
                        if(amico.sesso === "F"){
                            femmineRimanenti--;
                            //qua va a meno uno perchè l'ultima femmina ha una amica e quindi diventano 5, devo quindi rimuovere una femmina che non ha amici dalla classe e ripusharlo nell'insieme delle femmine
                            if(femmineRimanenti <= 0){
                                break;
                            }

                        }
                    }

                    j++;
                    femmineRimanenti--;
                }

                if(femmineRimanenti === 0){
                    break;
                }
            }
        }
    }




    return classi;
}

function inserisciRimanenti(classi, nazionalita, cap, voto, copyVotoIniziale){

    //ordino le classi per numero di alunni ascendenti
    classi.sort(function(a, b) {
        return (a.alunni.length) - parseFloat(b.alunni.length);
    });


    //In questo modo porto ad avere tutte le classi con un nnumero di nazionalità che sia minore a quello dei settaggi
    for(let i in classi){

        let propClasse = functions.generaProprieta(classi[i]);
        let countGroupClasse = functions.countGroupAlunniClasse(classi[i].alunni);


        let bool104 = false;

        if(propClasse.nLegge104 === 1){
            bool104 = true;
        }

        if(_.size(countGroupClasse.nazionalita) < data.settings.nazionalita_per_classe){
            for(let i in nazionalita){
                if(nazionalita[i].length === 0){
                    delete nazionalita[i];
                }
            }

            for(let j in nazionalita){

                if(countGroupClasse.nazionalita[j] === undefined){
                    let countGroupClasse = functions.countGroupAlunniClasse(classi[i].alunni);

                    if(bool104 && classi[i].alunni.length === data.settings.numero_alunni_con_104) {
                        break;
                    }

                    if(_.size(countGroupClasse.nazionalita) < data.settings.nazionalita_per_classe ){

                        //Vuol dire che questa nazionalità manca alla classe e la posso pusharee
                        let alunniInseribili = nazionalita[j].length;

                        if((alunniInseribili - data.settings.gruppo_nazionalita) < 0){
                            alunniInseribili = nazionalita[j].length;
                        }if((alunniInseribili - data.settings.gruppo_nazionalita) === 0){
                            alunniInseribili = nazionalita[j].length;
                        }if((alunniInseribili - data.settings.gruppo_nazionalita) > 0){
                            alunniInseribili = data.settings.gruppo_nazionalita;
                        }

                        let k = 0;

                        while(k < alunniInseribili){

                            classi[i].alunni.push(nazionalita[j][0]);

                            let amico = getAmico(nazionalita[j][0]);

                            functions.deleteStudenti([nazionalita[j][0]]);

                            if(amico !== undefined){
                                classi[i].alunni.push(amico);
                            }

                            k++;

                            for(let i in nazionalita){
                                if(nazionalita[i].length === 0){
                                    delete nazionalita[i];
                                }
                            }

                        }
                    }
                }
            }



        }
    }

    classi.sort(function(a, b) {
        return (a.alunni.length) - parseFloat(b.alunni.length);
    });


    for(let i in nazionalita){
        if(nazionalita[i].length === 0){
            delete nazionalita[i];
        }
    }

    for(let i in classi){
        for(let j in nazionalita){
            if(j !== "ITALIANA"){
                for(let k in nazionalita[j]){
                    classi[i].alunni.push(nazionalita[j][0]);

                    let amico = getAmico(nazionalita[j][0]);

                    functions.deleteStudenti([nazionalita[j][0]]);

                    if(amico !== undefined){
                        classi[i].alunni.push(amico);
                    }
                }
                i++;
            }
        }

    }

    for(let i in nazionalita){
        if(nazionalita[i].length === 0){
            delete nazionalita[i];
        }
    }

    //A questo punto dovrebbero essere rimasti solo italiani
    //Lì inserisco in base al cap.

    classi.sort(function(a, b) {
        return (a.alunni.length) - parseFloat(b.alunni.length);
    });

    for(let i in classi){
        let propClassi = functions.generaProprieta(classi[i]);
        let countClassi = functions.countGroupAlunniClasse(classi[i].alunni);

        for(let j in cap){

            if(cap[j].length === 0){
                delete cap[j];
                break;
            }

            if(propClassi.cap[j] !== undefined && countClassi.cap[j] < data.settings.gruppo_cap){

                classi[i].alunni.push(cap[j][0]);

                let amico = getAmico(cap[j][0]);

                functions.deleteStudenti([cap[j][0]]);

                if(amico !== undefined){
                    classi[i].alunni.push(amico);
                }

                if(cap[j].length === 0){
                    delete cap[j];
                }
            }
        }
    }

    //Faccio arrivare tutte le classi al minimo numero di studenti

    for(let i in classi){
        let votiClasse = functions.countGroupAlunniClasse(classi[i].alunni).voti;
        for(let j in voto){

            if(votiClasse[j] === undefined){

                classi[i].alunni.push(voto[j][0]);

                let amico = getAmico(voto[j][0]);

                functions.deleteStudenti([voto[j][0]]);

                if(amico !== undefined){
                    classi[i].alunni.push(amico);
                }

                if(voto[j].length === 0){
                    delete voto[j];
                }

            }
        }
    }

    classi.sort(function(a, b) {
        return (a.alunni.length) - parseFloat(b.alunni.length);
    });

    for(let i in classi) {
        let votiClasse = functions.countGroupAlunniClasse(classi[i].alunni).voti;

        let bool104 = false;

        if (functions.countGroupAlunniClasse(classi[i].alunni).nLegge104 === 1) {
            bool104 = true;
        }

        for (let j in voto) {
            let exit = 0;
            while (classi[i].alunni.length < data.settings.min_alunni) {
                votiClasse = functions.countGroupAlunniClasse(classi[i].alunni).voti;
                if (votiClasse[j] < (copyVotoIniziale[j] / classi.length)) {
                    classi[i].alunni.push(voto[j][0]);

                    let amico = getAmico(voto[j][0]);

                    functions.deleteStudenti([voto[j][0]]);

                    if (amico !== undefined) {
                        classi[i].alunni.push(amico);
                    }

                    if (voto[j].length === 0) {
                        delete voto[j];
                        break;
                    }
                } else {
                    exit++;
                    //Vuol dire che ha tentato di inserire dei voti ma non è riuscito a raggiungere il limite quindi devo fermarlo se no cerca all'infinito
                    if (exit > 6) {
                        break;
                    }
                }
            }
        }
    }


    classi.sort(function(a, b) {
        return (a.alunni.length) - parseFloat(b.alunni.length);
    });


    for(let i in classi){
        if(functions.generaProprieta(classi[i]).nLegge104 === 0){

            for(let j in voto){

                classi[i].alunni.push(voto[j][0]);

                let amico = getAmico(voto[j][0]);

                functions.deleteStudenti([voto[j][0]]);

                if (amico !== undefined) {
                    classi[i].alunni.push(amico);
                }

                if (voto[j].length === 0) {
                    delete voto[j];
                    break;
                }
            }
        }
    }


    return classi;

}


function generaClassiPrima(annoScolastico, scuola, classeFutura, callback){

    query.getClassiComposte(scuola, classeFutura, annoScolastico, function (err, rows) {
        if (err) {
            console.log(err);
        } else {
            if(rows.length === 0){
                data = require("./data.js");

                data.initVariabili(annoScolastico, scuola, classeFutura, function(){
                    functions = require("./functions.js");

                    let alunni = data.alunni;
                    let classi = data.classi;
                    let bocciati = data.bocciati;
                    let legge104 = data.legge104;
                    let legge107 = data.legge107;
                    let femmine = data.femmine;

                    let cap = data.cap;
                    let nazionalita = data.nazionalita;
                    let voto = data.voto;

                    let copyVotoIniziale = functions.countGroupAlunniClasse(alunni).voti;

                    classi = inserisciBocciati(classi, bocciati);

                    classi = inserisci104(classi, legge104);

                    classi = inserisci107(classi, legge107);

                    classi = inserisciFemmine(classi, femmine);

                    classi = inserisciRimanenti(classi, nazionalita, cap, voto, copyVotoIniziale);

                    //functions.debugNumeriClasse(debug, classi, settings);

                    for (let i = 0; i < classi.length; i++) {
                        let alunniClasse = classi[i].alunni;
                        let nomeClasse = classi[i].nome;

                        for (let j = 0; j < alunniClasse.length; j++) {
                            let cfAlunno = alunniClasse[j].cf;
                            query.insertAlunnoInClass(nomeClasse, annoScolastico, scuola, classeFutura, cfAlunno);
                        }
                    }



                    callback(_.orderBy(classi, [classe => classe.nome], ['asc']));
                });

            }else{

                let listaClassiObj = _.groupBy(rows, function (obj) {
                    return obj.classe_attuale;
                });

                let array = [];
                for (let classe in listaClassiObj) {
                    var app = {
                        'nome': classe,
                        'alunni': listaClassiObj[classe]
                    };

                    array.push(app);
                }

                 callback(array);
            }
        }
    });





}


exports.generaClassiPrima = generaClassiPrima;


