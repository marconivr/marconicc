/**
 * Created by mattiacorradi on 26/05/2017.
 */
"use strict";

const _ = require("lodash");
const data = require("./data");

const settings = data.settings;
const alunni = data.alunni;
const classi = data.classi;

const colors = require('colors').enabled = true;


//INIZIO POPOLAZIONE INSIEME
let legge_104 = _.filter(alunni, function (item) {
    if (item.legge_104 !== "") {
        return item;
    }
});

let legge_107 = _.filter(alunni, function (item) {
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

let n_107 = legge_107.length;

let n_104 = legge_104.length;

let n_femmine = femmine.length;

let n_classi = classi.length;


function generaProprietaIdeali104(n_classi, n_104, ris) {
    //104
    let div_104 = n_104 / n_classi;
    let gruppo_104 = [];
    if (div_104 < 1) {
        gruppo_104 = new Array(n_104).fill(1);
        for (let i = 0; i < gruppo_104.length; i++) {
            ris[i].n_104 = gruppo_104[i];
        }

    } else {
        console.log("ECCEZIONE NON GESTITA CI SONO TROPPI 104 - SE LA VEDI CONTATTA CORRADI E PREGA") //TODO
    }

    return ris;
}

function generateProprietaIdeale(n_classi, n_104, n_107, n_femmine) {

    let ris = Array.apply(null, new Array(n_classi)).map(function () {
        return {n_104: null, n_107: null, n_femmine: null, n_bocciati: null}
    });


    ris = generaProprietaIdeali104(n_classi, n_104, ris);

    //107
    let countClassiCon104 = _(_.filter(ris, function (obj) {
        if (obj.n_104 > 0) {
            return obj;
        }
    })).size();

    let classiDisponibili = n_classi - countClassiCon104; //perchè non posso inserire 107 dove ci sono già 104

    let gruppo_107 = [];

    if (n_107 < classiDisponibili) { //ce ne sta uno per classe
        gruppo_107 = new Array(n_107).fill(1);

        for (let i = 0; i < gruppo_107.length; i++) {
            let app = gruppo_107[i];

            for (let j = 0; j < ris.length; j++) {
                if (ris[j].n_104 === null && ris[j].n_107 === null) {
                    ris[j].n_107 = app;
                    break;
                }
            }
        }
    } else {
          console.log("ECCEZIONE NON GESTITA CI SONO TROPPI 107 - SE LA VEDI CONTATTA CORRADI E PREGA") //TODO
    }

    //FINE 107


    //FEMMINE
    let div_femmine = n_femmine / settings.gruppo_femmine;
    let gruppi_femmine = [];
    if (n_femmine % settings.gruppo_femmine === 0) {
        gruppi_femmine = new Array(div_femmine).fill(settings.gruppo_femmine);
        ris.reverse();
        for (let i = 0; i < gruppi_femmine.length; i++) {
            ris[i].n_femmine = gruppi_femmine[i];
        }
        ris.reverse();
    } else {
        console.log("ECCEZIONE NON GESTITA LE FEMMINE NON SONO DIVISIBILI PER LA CLASSE - SE LA VEDI CONTATTA CORRADI E PREGA") //TODO
    }
    //FINE FEMMINE


    return ris;
}


class Classe {
    constructor(nome, proprietaIdeali) {
        this.nome = nome;
        this.alunni = [];
        this.proprietaAttuali = {};
        this.proprietaIdeali = proprietaIdeali;
    }

    setAlunno(alunno, param) {

        if (alunno === undefined) {
            console.log(this.nome);
            return null;
        }

        if (this.push(alunno)) {
            this.proprietaAttuali = this.generaProprieta();

            let ris = this.checkAlunno(param);

            if (Classe.checkValidazione(ris)) {
                this.alunni.pop();
                this.proprietaAttuali = this.generaProprieta();
            }
            return ris;
        } else {
            return null;
        }

    }


    push(alunno) {
        if (this.alunni.indexOf(alunno) === -1) {
            this.alunni.push(alunno);
            return true;
        } else {
            return false;
        }

    }

    static checkValidazione(ris) {
        for (let property in ris) {
            if (ris.hasOwnProperty(property)) {
                if (ris[property] === true) {
                    return true;
                }
            }
        }

        return false;
    }

    checkAlunno(param) {

        let ris = {};

        ris.limitiAlunni = !this.limitiAlunni();

        ris.legge_104_107 = !this.legge_104_107();

        ris.femmine = !this.femmine();

        ris.nazionalita = !this.nazionalita(param);

        ris.cap = !this.cap;

        return ris;
    }


    limitiAlunni() {
        if (this.alunni.length > settings.max_alunni) {
            return false;
        }

        return true;
    }


    cap() {
        let n_cap = Object.keys(this.proprietaAttuali.cap).length;

        if (n_cap > settings.nazionalita_per_classe) {
            return false;
        }

        _.forEach(this.proprietaAttuali.nazionalita, function (key, value) {
            if (value > settings.gruppo_cap) {
                return false;
            }
        });

        return true;
    }

    nazionalita(param) {
        let n_naz = Object.keys(this.proprietaAttuali.nazionalita).length;

        if (_.has(this.proprietaAttuali.nazionalita, "ITALIANA")) {
            n_naz--;
        }


        if (n_naz > settings.nazionalita_per_classe) {
            return false;
        }


        _.forEach(this.proprietaAttuali.nazionalita, function (key, value) {
            if (value > settings.gruppo_nazionalita) {
                return false;
            }
        });

        return true;
    }

    femmine() {
        if (this.proprietaAttuali.femmine > settings.gruppo_femmine) {
            return false;
        }
        return true;
    }

    legge_104_107() {
        if (this.proprietaAttuali.n_legge_104 > 0 && this.proprietaAttuali.n_legge_107 > 0) {
            return false;
        }

        if (this.proprietaAttuali.n_legge_104 > 0 && this.alunni.length > settings.numero_alunni_con_104) {
            return false;
        }

        if (this.proprietaAttuali.n_legge_107 > this.proprietaIdeali.n_107) {
            return false;
        }

        return true;
    }

    generaProprieta() {

        let n_femmine = _(_.filter(this.alunni, function (o) {
            if (o.sesso.toLowerCase() === "f") {
                return o.sesso
            }

        })).size();

        let nazionalita = _.countBy(this.alunni, function (o) {
            return o.nazionalita;
        });

        let cap = _.countBy(this.alunni, function (o) {
            return o.cap;
        });

        let voto = _.countBy(this.alunni, function (o) {
            return o.voto;
        });

        let n_legge_107 = _(_.filter(this.alunni, function (item) {
            if (item.legge_107 !== "") {
                return item;
            }
        })).size();

        let n_legge_104 = _(_.filter(this.alunni, function (item) {
            if (item.legge_104 !== "") {
                return item;
            }
        })).size();

        return {
            femmine: n_femmine,
            nazionalita: nazionalita,
            cap: cap,
            voto: voto,
            n_legge_107: n_legge_107,
            n_legge_104: n_legge_104
        };
    }

    set bocciati(n_bocciati) {
        this.proprietaIdeali.n_bocciati = n_bocciati;
    }


}


let propIdeali = generateProprietaIdeale(n_classi, n_104, n_107, n_femmine);





function inserisci104(classe) {
    if (classe.proprietaIdeali.n_104 !== classe.proprietaAttuali.n_legge_104 && classe.proprietaIdeali.n_104 !== null) {

        let condizione = classe.proprietaIdeali.n_104;

        while (condizione !== 0) {
            let alunno = _.filter(legge_104, function (alunno) {
                if (alunno.classe_precedente === classe.nome) {
                    return alunno;
                }
            });

            if (alunno[0] !== undefined) {
                alunno = alunno[0]
            } else {
                alunno = legge_104[0];
            }

            if (alunno === undefined) {
                console.log(classe.nome + " errore inserisci 104");
                break;
            }

            let amico = checkDesiderata(alunno);

            if (amico !== null) {
                console.log(amico.cognome);
                let ris = classe.setAlunno(amico);
            }

            let ris = classe.setAlunno(alunno);

            legge_104 = _.reject(legge_104, function (obj) {
                return obj.id === alunno.id;
            });

            condizione--;
        }


    }
}

function inserisci107(classe) {
    if (classe.proprietaIdeali.n_107 > 0) {

        let condizione = classe.proprietaIdeali.n_107;

        while (condizione !== 0) {
            let alunno = _.filter(legge_107, function (alunno) {
                if (alunno.classe_precedente === classe.nome) {
                    return alunno;
                }
            });

            if (alunno[0] !== undefined) {
                alunno = alunno[0]
            } else {
                alunno = legge_107[0];
            }

            let amico = checkDesiderata(alunno);

            if (amico !== null) {
                console.log(amico.cognome);
                let ris = classe.setAlunno(amico);
            }

            let ris = classe.setAlunno(alunno);


            legge_107 = _.reject(legge_107, function (obj) {
                return obj.id === alunno.id;
            });

            condizione--;
        }
    }
}


function inserisciFemmine(classe) {
    if (classe.proprietaAttuali.femmine > 0) {

        let condizione = classe.proprietaIdeali.n_femmine - classe.proprietaAttuali.femmine;

        while (condizione !== 0) {

            let alunno = _.filter(femmine, function (alunno) {
                if (alunno.classe_precedente === classe.nome) {
                    return alunno;
                }
            });

            if (alunno[0] !== undefined) {
                alunno = alunno[0]
            } else {
                alunno = femmine[0];
            }

            let amico = checkDesiderata(alunno);

            if (amico !== null) {
                let ris = classe.setAlunno(amico);
            }

            let ris = classe.setAlunno(alunno);

            condizione--;
        }
    }

}

function inserisciBocciati(classe) {

    try {
        let bocciati_local = bocciati[classe.nome];
        classe.bocciati = bocciati_local.length;
        for (let i in bocciati_local) {
            let ris = classe.setAlunno(bocciati_local[i]);
        }
        delete bocciati[classe.nome];
    } catch (e) {
        //Qui entra quando la classe non ha bocciati
    }

}


function debugNumeroNazPerClasse(bool, classi_composte) {
    if (bool) {
        console.log("NUMERO NAZIONALITA' PER CLASSE".black.bgBlue);
        console.log("| cl | n_naz | n_boc | 104 | 107 | fem | n_cap | tot  | problemi");
        for (let i in classi_composte) {
            let naz = _.countBy(classi_composte[i].alunni, function (obj) {
                return obj.nazionalita;
            });

            let n_naz = Object.keys(naz).length;


            let cap = _.countBy(classi_composte[i].alunni, function (obj) {
                return obj.cap;
            });

            let n_cap = Object.keys(cap).length;

            let n_femmine = (_.countBy(classi_composte[i].alunni, function (obj) {
                return obj.sesso;
            })).F;

            if (n_femmine === undefined) {
                n_femmine = 0;
            }
            let n_bocciati = (_.filter(classi_composte[i].alunni, function (obj) {
                if (obj.classe_precedente !== "") {
                    return obj;
                }
            })).length;

            let n_104 = (_.filter(classi_composte[i].alunni, function (obj) {
                if (obj.legge_104 !== "") {
                    return obj;
                }
            })).length;

            let n_107 = (_.filter(classi_composte[i].alunni, function (obj) {
                if (obj.legge_107 !== "") {
                    return obj;
                }
            })).length;

            let ris = "";

            if (n_naz > settings.nazionalita_per_classe) {
                ris += " n_naz ";
            }

            if (n_femmine > settings.gruppo_femmine) {
                ris += " fem ";
            }

            if (n_104 > 1) {
                ris += " 104";
            }

            if (n_104 > 1 && n_107 > 1) {
                ris += " 107";
            }


            if (n_naz <= settings.nazionalita_per_classe && n_femmine <= settings.gruppo_femmine && n_104 <= 1) {
                console.log(`| ${classi_composte[i].nome} |   ${n_naz}   |   ${n_bocciati}   |  ${n_104}  |  ${n_107}  |  ${n_femmine}  |   ${n_cap}   |   ${classi_composte[i].alunni.length}  | `.green);
            } else {
                console.log(`| ${classi_composte[i].nome} |   ${n_naz}   |   ${n_bocciati}   |  ${n_104}  |  ${n_107}  |  ${n_femmine}  |   ${n_cap}   |   ${classi_composte[i].alunni.length}  | ${ris} `.blue);
            }
        }
        console.log("##############################".black.bgBlue);
    }
}


function debugInsiemiVuoti(bool) {
    if (bool) {

        if (_.isEmpty(bocciati) && _.isEmpty(femmine) && _.isEmpty(legge_104) && _.isEmpty(legge_107)) {
            console.log("1)Sono stati inseriti correttamente. Insiemi vuoti".yellow.bold);
        } else {
            console.log("1)Qualuno non è stato inserito. Insiemi ancora pieni".red.underline)
        }

    }
}


function inserisciAlunniRimanenti(alunni, classiComposte) {

    let nazionalita = _.groupBy(alunni, function (o) {
        return o.nazionalita;
    });

    let cap = _.groupBy(alunni, function (o) {
        return o.cap;
    });

    let voto = _.groupBy(alunni, function (o) {
        return o.voto;
    });

    let n_femmine = _.groupBy(alunni, function (obj) {
        return obj.sesso;
    });


    return classiComposte;


}

function generaClassiComposte(classi) {
    let classiComposte = [];


    for (let i in classi) {
        let classe = new Classe(classi[i].nome, propIdeali[i]);

        inserisciBocciati(classe);

        classiComposte.push(classe);
    }

    for (let i in classiComposte) {
        inserisciFemmine(classiComposte[i]);
    }


    for (let i in classiComposte) {
        //inserisci104(classiComposte[i]);
    }

    for (let i in classiComposte) {
        //inserisci107(classiComposte[i]);
    }



    let alunniRimanenti = [];

    for (let i in classiComposte) {
        let alunni = classiComposte[i].alunni;
        alunniRimanenti = alunniRimanenti.concat(alunni);
    }

    alunniRimanenti = _.difference(alunni, alunniRimanenti);

    classiComposte = inserisciAlunniRimanenti(alunniRimanenti, classiComposte);

    return classiComposte;
}

let ris = generaClassiComposte(classi);


debugInsiemiVuoti(true);
debugNumeroNazPerClasse(true, ris);

console.log("FINE GENERAZIONE");
