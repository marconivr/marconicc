/**
 * Created by mattiacorradi on 26/05/2017.
 */


const _ = require("lodash");
const data = require("./data");

const settings = data.settings;
const alunni = data.alunni;
const classi = data.classi;

const colors = require('colors').enabled = true;


function debugNumeriClasse(bool, classi) {
    if (bool) {
        console.log("NUMERO NAZIONALITA' PER CLASSE".black.bgBlue);
        console.log("| cl | n_naz | n_boc | 104 | 107 | fem | n_cap | tot  | problemi");
        for (let i in classi) {
            let naz = _.countBy(classi[i].alunni, function (obj) {
                return obj.nazionalita;
            });

            let n_naz = Object.keys(naz).length;


            let cap = _.countBy(classi[i].alunni, function (obj) {
                return obj.cap;
            });

            let n_cap = Object.keys(cap).length;

            let n_femmine = (_.countBy(classi[i].alunni, function (obj) {
                return obj.sesso;
            })).F;

            if (n_femmine === undefined) {
                n_femmine = 0;
            }
            let n_bocciati = (_.filter(classi[i].alunni, function (obj) {
                if (obj.classe_precedente !== "") {
                    return obj;
                }
            })).length;

            let n_104 = (_.filter(classi[i].alunni, function (obj) {
                if (obj.legge_104 !== "") {
                    return obj;
                }
            })).length;

            let n_107 = (_.filter(classi[i].alunni, function (obj) {
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
                console.log(`| ${classi[i].nome} |   ${n_naz}   |   ${n_bocciati}   |  ${n_104}  |  ${n_107}  |  ${n_femmine}  |   ${n_cap}   |   ${classi[i].alunni.length}  | `.green);
            } else {
                console.log(`| ${classi[i].nome} |   ${n_naz}   |   ${n_bocciati}   |  ${n_104}  |  ${n_107}  |  ${n_femmine}  |   ${n_cap}   |   ${classi[i].alunni.length}  | ${ris} `.blue);
            }
        }
        console.log("##############################".black.bgBlue);
    }
}

class Classe {

    constructor(nome, arrayBocciati) {
        this.nome = nome;
        this.alunni = [];
        this.proprietaAttuali = {};
        this._setBocciati(arrayBocciati);
    }

    setAlunno(alunno, param) {

        if (alunno === undefined) {
            console.log(this.nome);
            return null;
        }

        if (this.push(alunno)) {
            this.proprietaAttuali = this.generaProprieta();

            let ris = this.checkProprieta(param);

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

    checkProprieta() {

        let ris = {};

        ris.limitiAlunni = !this.limitiAlunni();

        ris.legge_104 = !this.legge_104();

        ris.legge_107_and_104 = !this.legge_107_and_104();

        ris.femmine = !this.femmine();

        ris.nazionalita = !this.nazionalita();

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

    nazionalita() {
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


    legge_107_and_104() {
        if (this.proprietaAttuali.n_legge_104 > 0 && this.proprietaAttuali.n_legge_107 > 0) {
            let bocciati = _.filter(this.alunni, function (obj) {
               if(obj.legge_104 !== "" && obj.classe_precedente !== ""){
                   return obj;
               } else if (obj.legge_107 !== "" && obj.classe_precedente !== ""){
                   return obj;
               }
            });

            return bocciati.length >= 2;

        }
        return true;
    }

    legge_104() {

        if (this.proprietaAttuali.n_legge_104 > 0 && this.alunni.length > settings.numero_alunni_con_104) {
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


    _setBocciati(arrayBocciati) {
        for (let i in arrayBocciati) {
            if (arrayBocciati[i].classe_precedente !== this.nome) {
                throw new Error("Stai tentando di inserire un bocciato in una classe diversa!")
            } else {
                this.alunni.push(arrayBocciati[i]);
            }

        }
        this.proprietaAttuali = this.generaProprieta();
    }
}


function checkDesiderata(objStudente) {

    let amico = _.filter(alunni, function (obj) {
        if (objStudente.desiderata === obj.cf) {
            return obj;
        }
    });

    amico = amico[0];

    if (amico === undefined) return null;

    return amico.desiderata === objStudente.cf ? amico : null;
}


function trovaClasseIdeale(param, alunno, amico, arrayClassi) {
    let cap;
    let nazionalita;

    switch (param) {
        case "legge_104":

            let classe104 = _.filter(arrayClassi, function (obj) {
                let prop = obj.proprietaAttuali;
                if (obj.alunni.length > 0) {
                    if (prop.n_legge_104 === 0 && prop.n_legge_107 === 0) {
                        nazionalita = alunno.nazionalita;
                        if (prop.nazionalita[nazionalita] !== undefined) {
                            if (nazionalita.toLowerCase() === "italiana") {
                                return obj;
                            } else {
                                if (prop.nazionalita[nazionalita] + 1 <= settings.gruppo_nazionalita) {
                                    return obj;
                                }
                            }
                        } else if (Object.keys(prop.nazionalita).length < settings.nazionalita_per_classe) {
                            return obj;
                        }
                    }
                } else if (obj.alunni.length === 0) {
                    return obj;
                }
            });

            //cerco se c'è qualche classe che può accettare quel cap
            cap = alunno.cap;
            if(amico){
                for (let i in classe104) {
                    if (classe104[i].proprietaAttuali.cap[cap] !== undefined) {
                        if(classe104[i].proprietaAttuali.cap[amico.cap] !== undefined) {
                            return arrayClassi.indexOf(classe104[i]);
                        }
                    }
                }
            }


            for (let i in classe104) {
                if (classe104[i].proprietaAttuali.cap[cap] !== undefined) {
                    return arrayClassi.indexOf(classe104[i]);
                }
            }


            //se non trovo nessuno ritorno l'ultima classe. L'ultima classe perchè sono le classi più vuote e quindi riempio anche quelle
            if (arrayClassi.indexOf(classe104[classe104.length - 1]) !== -1) {
                return arrayClassi.indexOf(classe104[classe104.length - 1]);
            } else {
                for (let i in arrayClassi) {
                    if (arrayClassi[i].proprietaAttuali.n_legge_104 === 0) {
                        return i;
                    }
                }
            }


        case "legge_107":
            let classe107 = _.filter(arrayClassi, function (obj) {
                let prop = obj.proprietaAttuali;
                if (obj.alunni.length > 0) {
                    if (prop.n_legge_104 === 0 && prop.n_legge_107 === 0) {
                        nazionalita = alunno.nazionalita;
                        if (prop.nazionalita[nazionalita] !== undefined) {
                            if (nazionalita.toLowerCase() === "italiana") {
                                return obj;
                            } else {
                                if (prop.nazionalita[nazionalita] + 1 <= settings.gruppo_nazionalita) {
                                    return obj;
                                }
                            }
                        } else if (Object.keys(prop.nazionalita).length < settings.nazionalita_per_classe) {
                            return obj;
                        }
                    }
                } else if (obj.alunni.length === 0) {
                    return obj;
                }
            });
            //cerco se c'è qualche classe che può accettare quel cap
            cap = alunno.cap;
            if(amico){
                for (let i in classe107) {
                    if (classe107[i].proprietaAttuali.cap[cap] !== undefined) {
                        if(classe107[i].proprietaAttuali.cap[amico.cap] !== undefined) {
                            return arrayClassi.indexOf(classe107[i]);
                        }
                    }
                }
            }


            for (let i in classe107) {
                if (classe107[i].proprietaAttuali.cap[cap] !== undefined) {
                    return arrayClassi.indexOf(classe107[i]);
                }
            }
            //se non trovo nessuno ritorno l'ultima classe. L'ultima classe perchè sono le classi più vuote e quindi riempio anche quelle
            if (arrayClassi.indexOf(classe107[classe107.length - 1]) !== -1) {
                return arrayClassi.indexOf(classe107[classe107.length - 1]);
            } else {
                for (let i in arrayClassi) {
                    if (arrayClassi[i].proprietaAttuali.n_legge_104 === 0) {
                        return i;
                    }
                }
            }

        case "femmine":
            let femmine = _.filter(arrayClassi, function (obj) {
                let prop = obj.proprietaAttuali;
                if (prop.femmine > 0 && prop.femmine < settings.gruppo_femmine) {
                    return obj;
                }
            });
            //cerco se c'è qualche classe che può accettare quel cap
            cap = alunno.cap;
            for (let i in femmine) {
                if (femmine[i].proprietaAttuali.cap[cap] !== undefined) {
                    return arrayClassi.indexOf(femmine[i]);
                }

            }

            if (arrayClassi.indexOf(femmine[0]) === -1) {
                for(let i in arrayClassi){
                    prop = arrayClassi[i].proprietaAttuali;
                    if (prop.femmine === 0) {
                        nazionalita = alunno.nazionalita;
                        if (prop.nazionalita[nazionalita] !== undefined) {
                            if (nazionalita.toLowerCase() === "italiana") {
                                return i;
                            } else {
                                if (prop.nazionalita[nazionalita] + 1 <= settings.gruppo_nazionalita) {
                                    return i;
                                }
                            }
                        } else if (Object.keys(prop.nazionalita).length < settings.nazionalita_per_classe) {
                            return i;
                        }

                    }
                }


            }else{
                return arrayClassi.indexOf(femmine[0]);
            }


    }
}


let insiemeBocciati = _.omit(_.groupBy(alunni, function (item) {
    if (item.classe_precedente !== "") {
        return item.classe_precedente;
    }
}), [undefined]); //uso l'omit per rimuovere la proprietà undefined che racchiude tutti gli studenti non bocciati


let arrayClassi = [];

//creo le classi inserendo i bocciati di ogni classe
for (let i in classi) {
    let classe = new Classe(classi[i].nome, insiemeBocciati[classi[i].nome]);
    arrayClassi.push(classe);
}


let alunniRimanenti = _.filter(alunni, function (obj) {
    if (obj.classe_precedente === "") {
        return obj;
    }
});





for (let i in alunniRimanenti) {
    let alunno = alunniRimanenti[i];
    // inserisci 104
    if (alunno.legge_104 !== "") {
        let amico = checkDesiderata(alunno);
        let posizioneClasse = trovaClasseIdeale("legge_104", alunno, amico, arrayClassi);
        arrayClassi[posizioneClasse].setAlunno(alunno);
        if(amico){
            console.log("amico 104 trovato");
            let risAmico = arrayClassi[posizioneClasse].setAlunno(amico);
            if(Classe.checkValidazione(risAmico)){
                console.log("errore inserimento amico");
            }else{
                console.log("amico inserito");
            }
            delete alunniRimanenti[alunniRimanenti.indexOf(amico)];
        }


        delete alunniRimanenti[i];

    }

    //inserisci 107
    if (alunno.legge_107 !== "") {
        let amico = checkDesiderata(alunno);
        let posizioneClasse = trovaClasseIdeale("legge_107", alunno, amico, arrayClassi);
        arrayClassi[posizioneClasse].setAlunno(alunno);
        if(amico){
            console.log("amico 107 trovato");
            let risAmico = arrayClassi[posizioneClasse].setAlunno(amico);
            if(Classe.checkValidazione(risAmico)){
                console.log("errore inserimento amico");
            }else{
                console.log("amico inserito");
            }
            delete alunniRimanenti[alunniRimanenti.indexOf(amico)];
        }


        delete alunniRimanenti[i];
    }

    //inserisci femmine
    if (alunno.sesso.toLowerCase() === "f") {
        let posizioneClasse = trovaClasseIdeale("femmine", alunno,null, arrayClassi);
        arrayClassi[posizioneClasse].setAlunno(alunno);
        delete alunniRimanenti[i];
    }
}






debugNumeriClasse(true, arrayClassi);