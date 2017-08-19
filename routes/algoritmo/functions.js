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
     * @param studenti[]
     */
    deleteStudenti: function (studenti) {
        for(let i in studenti){

            //eliminare da bocciati
            if(studenti[i].classe_precedente !== ''){
                let classePrecedente = studenti[i].classe_precedente;
                _.remove(data.bocciati[classePrecedente], studenti[i]);
            }

            //eliminare da cap
            let cap = studenti[i].cap;
            _.remove(data.cap[cap], studenti[i]);

            //eliminare da voto
            let voto = studenti[i].voto;
            _.remove(data.voto[voto], studenti[i]);

            //eliminare da 104
            if(studenti[i].legge_104 !== '')
                _.remove(data.legge104, studenti[i]);

            //eliminare da 107
            if(studenti[i].legge_107 !== '')
                _.remove(data.legge107, studenti[i]);

            //eliminare da femmine
            if(studenti[i].sesso === 'F')
                _.remove(data.femmine, studenti[i]);
        }
    }

};