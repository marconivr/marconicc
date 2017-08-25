/**
 * Created by matti on 18/08/2017.
 * Raccolta di funzione statiche utili a manipolare i dati
 */

const _ = require("lodash");
const data = require("./data");

module.exports = {

    /**
     * Funzione che sistema la nomenclatura delle classi fornite in input dal file. Le nomenclature del nostro algoritmo consistono
     * in una cifra e una lettera (es. 1A, 1B) mentre quelle fornite nel file sono con 2 lettere. Questa funzione elimina la lettera
     * in più e inoltre toglie le classi con la Z che sono delle classi fittizie dove vengono inseriti i nuovi iscritti.
     */
    fixBocciati: function (alunni) {
        for (let i in alunni) {
            if (alunni[i].classe_precedente[1] === 'Z') {
                alunni[i].classe_precedente = '';
            }
            if (alunni[i].classe_precedente.length === 3) {
                alunni[i].classe_precedente = alunni[i].classe_precedente.substring(0, 2);
            }
        }
        return alunni;
    },

    /**
     * Funzione che data una classe torna un'oggetto contente le proprietà attuali di quella classe
     * @param classe
     * @returns {{nFemmine: femmine.length, nazionalita: (!Object.<*, number>|Dictionary<number>), cap: (!Object.<*, number>|Dictionary<number>), voto: (!Object.<*, number>|Dictionary<number>), nLegge107: *, nLegge104: *}}
     */
    generaProprieta: function (classe) {

        let nFemmine = _(_.filter(classe.alunni, function (o) {
            if (o.sesso.toLowerCase() === "f") {
                return o.sesso
            }

        })).size();

        let nazionalita = _.countBy(classe.alunni, function (o) {
            return o.nazionalita;
        });

        let cap = _.countBy(classe.alunni, function (o) {
            return o.cap;
        });

        let voto = _.countBy(classe.alunni, function (o) {
            return o.voto;
        });

        let nLegge107 = _(_.filter(classe.alunni, function (item) {
            if (item.legge_107 !== "") {
                return item;
            }
        })).size();

        let nLegge104 = _(_.filter(classe.alunni, function (item) {
            if (item.legge_104 !== "") {
                return item;
            }
        })).size();

        let nAlunni = classe.alunni.length;

        return {
            nAlunni: nAlunni,
            nFemmine: nFemmine,
            nazionalita: nazionalita,
            cap: cap,
            voto: voto,
            nLegge107: nLegge107,
            nLegge104: nLegge104
        };
    },

    /**
     * Funzione che preso in input un array di studenti li toglie dagli insiemi. Questo serve ad esempio quando inserisco
     * i bocciati per toglierli da altri insiemi. In questo modo non vengono inseriti 2 volte
     * Uso una variabile d'appoggio
     * @param app[]
     */
    deleteStudenti: function (app) {

        let studenti = app.slice(0);

        for (let i in studenti) {

            _.remove(data.alunni, studenti[i]);

            //eliminare da bocciati
            if (studenti[i].classe_precedente !== '') {
                let classePrecedente = studenti[i].classe_precedente;
                _.remove(data.bocciati[classePrecedente], studenti[i]);
            }

            //eliminare da cap
            let cap = studenti[i].cap;
            _.remove(data.cap[cap], studenti[i]);

            //eliminare da cap
            let nazionalita = studenti[i].nazionalita;
            _.remove(data.nazionalita[nazionalita], studenti[i]);


            //eliminare da voto
            let voto = studenti[i].voto;
            _.remove(data.voto[voto], studenti[i]);

            //eliminare da 104
            if (studenti[i].legge_104 !== '')
                _.remove(data.legge104, studenti[i]);

            //eliminare da 107
            if (studenti[i].legge_107 !== '')
                _.remove(data.legge107, studenti[i]);

            //eliminare da femmine
            if (studenti[i].sesso === 'F')
                _.remove(data.femmine, studenti[i]);
        }
    },

    /**
     * Funzione che dato l'oggetto di uno studente torna l'oggetto del suo amico se questo desiderata è reciproco. In caso
     * contrario o se non c'è nessun desiderata torna undefined
     * @param objStudente
     * @returns {*}
     */
    checkDesiderata: function (objStudente) {

        let amico = _.filter(data.alunni, function (obj) {
            if (objStudente.desiderata === obj.cf) {
                return obj;
            }
        });

        amico = amico[0];

        if (amico === undefined) return undefined;

        return amico.desiderata === objStudente.cf ? amico : undefined;
    },


    /**
     * Funzione che torna un array contenente le classi che hanno già femmine.
     * @param classi
     * @returns []
     */
    classiConFemmine : function (classi, femmine) {
        let arrayClassi = [];

        for(let i in classi){
            let prop = this.generaProprieta(classi[i]);
            if(prop.nFemmine > 0){
                arrayClassi.push(classi[i].nome);
            }
        }


        return arrayClassi;
    },


    groupBy : function (array, prop) {
        return _.groupBy(array, function (obj) {
            return obj[prop];
        });
    },


    countBy : function (array, prop) {
        return _.countBy(array, function (obj) {
            return obj[prop];
        });
    },

    countGroupAlunniClasse: function (alunni) {
        return {
            nazionalita: this.countBy(alunni, "nazionalita"),
            cap: this.countBy(alunni, "cap"),
            voti: this.countBy(alunni, "voto")
        }
    },


    /**
     * Funzione che printa nella console un resoconto delle classi
     * @param bool
     * @param classi
     */
    debugNumeriClasse: function (bool, classi, settings) {
        if (bool) {
            console.log("RESOCONTO####################################################################".black.bgBlue);
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
            console.log("############################################################################".black.bgBlue);
        }
    },

    /**
     * C'è il problema delle femmine con il desiderata. In pratica se una femmina ha come desiderata una femmina che non è ancora stata inserita il sistema si sballa.
     * Ordinando e mettendo all'inizio le femmine con il desiderata dovrebbe risolversi
     * @param femmine
     */
    findStudenteSenzaDesiderata: function (femmine) {

        let ris =  _.find( femmine, function (obj) {
            if(obj.desiderata === ""){
                return obj;
            }
        });

        //Se sono tutti con un desiderata
        if(ris === undefined){
            return femmine[0];
        }

        return ris;


    }
};