/**
 * Created by michele on 2/13/17.
 */

var middleware = require('./middleware/middleware');
var query = require('./../query/query.js');
var async = require('async');

//settings var
var settings = {
    max_al: 28,
    min_al: 25,
    fem: 4,
    max_str: 7,
    iniziale: 3,
    stessa_pr: 4,
    nazionalita: 4,
    media_min: 7.7,
    media_max: 8.0,
    boc: 2,
    an_scol: "2017-2018"
}
var priority = ["alunni", "104", "107", "desiderata", "ripetenti", "femmine", "nazionalita", "CAP", "voto"];
var listaAlunni = [];
var listaClassi = []; //esempio [{nome:"1AI", proprieta:{alunni:23, femmine:2}, alunni:[{nome:"Mario", cognome:"Rossi"}]}]

module.exports = {
    /**
     * main dell'algoritmo
     * @param classe
     * @param callback
     */
    main: function (classe, callback) {
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
                                module.exports.generaListaClassi("prima", function () {
                                    callback();
                                });
                            },
                            function (callback) {
                                module.exports.popolaListaClassiRandom("prima", function () {
                                    callback();
                                });
                            }
                        ],
                        function (err, succes) {
                            if (err) {
                                console.log(err);
                            } else {
                                callback(err);
                            }
                        }
                    )
                }
            });
        }
    },

    /**
     * generaListaClassi è una funzione che genera oggetti classe {nome: classe, proprieta:{}, alunni: []}
     * in base agli alunni minimi
     * @param classe
     * @param callback
     */
    generaListaClassi: function (classe, callback) {
        if (classe.toLowerCase() == "prima") {
            var num = Math.round(listaAlunni.length / (settings.min_al));
            for (i = 0; i < num; i++) {
                //assing class name
                var classe = "1" + String.fromCharCode(65 + i);
                listaClassi.push({nome: classe, proprieta: {}, alunni: []});
            }
        }
        callback();
    },

    /**
     * popolaListaClassiRandom crea una le classi in maniera random
     * @param classe
     * @param callback
     */
    popolaListaClassiRandom: function (classe, callback) {
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
                    listaClassi[k].alunni = module.exports.removeUndefinedDaArray(listaClassi[k].alunni);
                    listaClassi[k].proprieta = module.exports.createProprietaClasse(listaClassi[k].alunni);
                }
            }
            callback();
        }
    },

    /**
     * createProprietaClasse crea le proprieta di una lista di alunni
     * @param listaAlunniClasse
     * @returns {{alunni: *, femmine: (*|Number), media: *, residenza: (*|Array), bocciati: (*|number), iniziale: *}}
     */
    createProprietaClasse: function (listaAlunniClasse) {
        var nAlunni = listaAlunniClasse.length;
        var nFemmine = module.exports.countFemmine(listaAlunniClasse);
        var media = module.exports.mediaClasse(listaAlunniClasse);
        var residenza = module.exports.countStessaResid(listaAlunniClasse);
        var bocciati = module.exports.countBocciati(listaAlunniClasse);
        var iniziale = module.exports.countTutteInizialiCognome(listaAlunniClasse);
        var stranieri = module.exports.countStranieri(listaAlunniClasse);
        return {
            alunni: nAlunni,
            femmine: nFemmine,
            media: media.toFixed(2),
            residenza: residenza,
            bocciati: bocciati,
            iniziale: iniziale,
            stranieri: stranieri
        };
    },

    /**
     * listaNomiClassi è una funzione che ritorna la lista di nomi delle classi
     * @returns {Array}
     */
    listaNomiClassi: function () {
        var listaNomi = [];
        for (var k = 0; k < listaClassi.length; k++) {
            listaNomi.push(listaClassi[k].nome);
        }
        return listaNomi;
    },

    /**
     * fixClassi sistema le classi in base alle impostazioni e alle priorità
     */
    fixClassi: function () {
        for (var k = 0; k < listaClassi.length; k++) {
            var objproblem = module.exports.problemiClasse(listaClassi[k].alunni);
            for (var j = priority.length; j >= 0; j--) {
                if (module.exports.isInsideProblemiClasse(objproblem, priority[j])) {
                    switch (priority[j]) {
                        case "alunni":
                            module.exports.fixAlunni(listaClassi[k].nome);
                            break;
                        case "femmine":
                            module.exports.fixFemmine(listaClassi[k].nome);
                            break;
                        case "stranieri":
                            module.exports.fixStranieri(listaClassi[k].nome);
                            break;
                        case "bocciati":

                            break;
                        case "stessa_provenienza":

                            break;
                        case "media":
                            module.exports.fixMedia(listaClassi[k].nome);
                            break;
                        case "iniziale":
                            break;
                    }
                }
                listaClassi[k].proprieta = module.exports.createProprietaClasse(listaClassi[k].alunni);
            }
            module.exports.printProprieta();
        }
    },

    /**
     * isInsideProblemiClasse funzione che determina se un problema è dentro ad un oggetto problema
     * @param objProblema
     * @param strProblema
     * @returns {boolean}
     */
    isInsideProblemiClasse: function(objProblema, strProblema){
        for (var prop in objProblema){
            if (prop == strProblema){
                return true;
            }
        }
        return false;
    },

    printProprieta: function () {
        for (var k = 0; k < listaClassi.length; k++) {
            console.log("Proprieta");
            console.log(listaClassi[k].proprieta);
        }
    },

    //##################################################################################################################
    /**--------------------------------------FUNZIONI PER COMPORRE CLASSI---------------------------------------------*/
    //##################################################################################################################

    /**
     * countFemmine Data la classe ritorna il numero di femmine
     * @param classe
     * @returns {Number}
     */
    countFemmine: function (listaAlunniClasse) {
        var cont = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].sesso.toUpperCase() == "F") {
                cont++;
            }
        }
        return cont;
    },

    /**
     * mediaClasse calcola la media di una classe
     * @param listaAlunniClasse
     * @returns {number}
     */
    mediaClasse: function (listaAlunniClasse) {
        var somma = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            somma += Number(listaAlunniClasse[i].media_voti);
        }
        return (somma / listaAlunniClasse.length);

    },

    /**
     * countStranieri ritorna il numero di stranieri
     * se superano il valore max impostato in settings
     * @param listaAlunniClasse
     * @returns {Array}
     */
    countStranieri: function (listaAlunniClasse) {
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].nazionalita.toLowerCase() != "italiana") {
                count++;
            }
        }
        return count;
    },

    /**
     * countBocciati ritorna il numeero di bocciati per classe
     * @param listaAlunniClasse
     * @returns {number}
     */
    countBocciati: function (listaAlunniClasse) {
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
           if (listaAlunniClasse[i].classe_precedente != null){
               count++;
           }
        }

        return count;
    },

    /**
     * countStessaProv ritorna una lista di cap se superano il valore max impostato in settings
     * @param classe oggetto classe
     * @returns {Array}
     */
    countStessaResid: function (listaAlunniClasse) {
        var listaCap = [];
        var count = 0;
        var ris = [];
        for (var i = 0; i < listaAlunniClasse.length; i++) {
            listaCap.push(listaAlunniClasse[i].cap_provenienza);
        }
        listaCap.sort();

        for (var i = 0; i < listaCap.length - 1; i++) {
            if (listaCap[i] == listaCap[i + 1]) {
                count++;
            } else {
                if (count > settings.stessa_pr) {
                    ris.push({cap: listaCap[i], num: count + 1});
                }
                count = 0;
            }
        }
        return ris;
    },

    /**
     * countInizialeCognome ritorna una lista di oggetti {lettera:'a', num: 5}
     * se superano il valore max impostato in settings
     * @param listaAlunniClasse
     * @returns {Array}
     */
    countTutteInizialiCognome: function (listaAlunniClasse) {
        var listaIniz = [];
        var count = 0;
        var ris = [];
        for (var i = 0; i < listaAlunniClasse.length; i++) {
            listaIniz.push(listaAlunniClasse[i].cognome[0]);
        }
        listaIniz.sort();

        for (var i = 0; i < listaIniz.length - 1; i++) {
            if (listaIniz[i] == listaIniz[i + 1]) {
                count++;
            } else {
                if (count > settings.iniziale) {
                    ris.push({lettera: listaIniz[i], num: count + 1});
                }
                count = 0;
            }
        }
        return ris;
    },

    countStessaInizialeCognome: function (listaAlunniClasse, carattere) {
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].cognome[0] == carattere) {
                count++;
            }
        }
        return ris;
    },

    problemiClasse: function (listaAlunniClasse) {
        var ris = {};
        var proprieta = module.exports.createProprietaClasse(listaAlunniClasse);
        for (var prop in proprieta) {
            switch (prop) {
                case "alunni":
                    if (proprieta.alunni < settings.min_al || proprieta.alunni > settings.max_al) {
                        ris["alunni"] = proprieta.alunni;
                    }
                case "femmine":
                    if (proprieta.femmine != 0 && proprieta.femmine < settings.fem) {
                        ris["femmine"] = proprieta.femmine;
                    }
                    break;
                case "stranieri":
                    if (proprieta.stranieri > settings.max_str) {
                        ris["stranieri"] = proprieta.stranieri;
                    }
                    break;
                case "bocciati":
                    if (proprieta.bocciati > settings.boc) {
                        ris["bocciati"] = proprieta.bocciati;
                    }
                    break;
                case "residenza":
                    if (proprieta.residenza.length != 0) {
                        for (var k = 0; k < proprieta.residenza.length; k++) {
                            if (proprieta.residenza > settings.stessa_pr) {
                                ris["residenza"] = proprieta.residenza;
                            }
                        }
                    }
                    break;
                case "media":
                    if (proprieta.media < settings.media_min) {
                        ris["media"] = proprieta.media;
                    }
                    break;
                case "iniziale":
                /*
                 if (proprieta.iniziale.length != 0) {
                 ris["iniziale"] = [];
                 for (var k = 0; k < proprieta.iniziale.length; k++) {
                 if (proprieta.iniziale[k].num > settings.iniziale) {
                 ris["iniziale"] = ris["iniziale"].push(proprieta.iniziale[k].lettera);
                 }
                 }
                 }
                 break;
                 */

            }
        }
        return ris;
    },

    /**
     * fixFemmine inserisce nella classe param le femmine di altre classi che non rispettano i vincoli.
     * @param nomeClasse
     */
    fixFemmine: function (nomeClasse) {
        var classe = module.exports.findClasseFromString(nomeClasse);  //classe in esame
        for (var i = 0; i < listaClassi.length; i++) {
            if (listaClassi[i].nome != nomeClasse) {
                if (module.exports.countFemmine(classe.alunni) >= module.exports.countFemmine(listaClassi[i].alunni) && module.exports.countFemmine(listaClassi[i].alunni) != 0
                    && module.exports.countFemmine(listaClassi[i].alunni) <= settings.fem) {
                    var objfem = module.exports.searchAlunno("sesso", "F", listaClassi[i].alunni);
                    if (objfem != null) {
                        module.exports.addStundentInClss(objfem, listaClassi[i], classe, true);
                    }
                }
            }
            //Esce dal ciclo se, nella classe passata come parametro, non ci sono più femmine
            if (module.exports.countFemmine(classe.alunni) == settings.fem) {
                break;
            }
        }
    },

    /**
     * fixAlunni inserisce nella classe param gli alunni di altre classi che non rispettano i vincoli.
     * @param nomeClasse
     */
    fixAlunni: function (nomeClasse) {
        var classe = module.exports.findClasseFromString(nomeClasse);  //classe in esame
        for (var i = 0; i < listaClassi.length; i++) {
            if (listaClassi[i].nome != nomeClasse) {
                if (classe.alunni.length < settings.min_al && listaClassi[i].alunni.length > settings.min_al) {
                    var objal = module.exports.searchAlunno("sesso", "M", listaClassi[i].alunni);
                    if (objal != null) {
                        module.exports.addStundentInClss(objal, listaClassi[i], classe, true);
                    }
                }
            }
            if (classe.alunni.length == settings.min_al) {
                break;
            }
        }
    },

    fixMedia: function (nomeClasse) {
        var classe = module.exports.findClasseFromString(nomeClasse);
        for (var i = 0; i < listaClassi.length; i++) {
            if (listaClassi[i].nome != nomeClasse) {
                var mCl = module.exports.mediaClasse(listaClassi[i].alunni);
                if (mCl >= settings.media_max || (mCl < listaClassi[i].media_max && mCl > settings.media_min)) {
                    var objal = module.exports.searchAlunno("media_voti", module.exports.determinaVoto(classe), listaClassi[i].alunni);
                    if (objal != null) {
                        console.log(objal.nome + ", " + objal.cognome);
                        module.exports.addStundentInClss(objal, listaClassi[i], classe, true);
                    }
                }
            }
            if (classe.alunni.media >= settings.media_min) {
                break;
            }
        }
    },

    fixStranieri: function(nomeClasse){
        var classe = module.exports.findClasseFromString(nomeClasse);  //classe in esame
        for (var i = 0; i < listaClassi.length; i++) {
            if (listaClassi[i].nome != nomeClasse) {
                if (module.exports.countStranieri(classe.alunni) > settings.max_str
                    && module.exports.countStranieri(listaClassi[i].alunni) < settings.max_str) {
                    var objal = module.exports.searchStraniero(classe.alunni);
                    console.log("Alunno " + objal.nome + " Da " + classe.nome + " a " + listaClassi[i].nome);
                    if (objal != null) {
                        module.exports.addStundentInClss(objal, classe, listaClassi[i], true);
                    }
                }
            }
            if (module.exports.countStranieri(classe.alunni) == settings.max_str) {
                break;
            }
        }
    },

    fixIniziale: function (nomeClasse, caratteri) {
        var classe = module.exports.findClasseFromString(nomeClasse);
        for (var i = 0; i < listaClassi.length; i++) {
            if (listaClassi[i].nome != nomeClasse) {
                for (var k = 0; k < caratteri.length; k++) {
                    if (module.exports.countStessaInizialeCognome(classe.alunni, caratteri[k]) > settings.iniziale) {

                    }
                }

            }
            if (classe.alunni.media >= settings.media_min) {
                break;
            }
        }
    },

    /**
     * determinaVoto determina il voto della media di un alunno necessario al raggiungimento della media in settings
     * @param objclasse
     * @returns {number}
     */
    determinaVoto: function (objclasse) {
        var eN = 0;
        for (i = 0; i < objclasse.alunni.length; i++) {
            eN += objclasse.alunni[i].media_voti;
        }
        var voto = Math.round((settings.media_min * (objclasse.alunni.length + 1)) - eN);
        if (voto > 10) {
            return 10;
        }
        return voto;
    },


    searchAlunno: function (attr, valore, listaAlunniClasse) {
        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i][attr] == valore) {
                return listaAlunniClasse[i];
            }
        }
        return null;
    },

    searchStraniero: function (listaAlunniClasse) {
        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i]["nazionalita"].toLowerCase() != "italiana") {
                console.log("Nazionalita " + listaAlunniClasse[i]["nazionalita"])
                return listaAlunniClasse[i];
            }
        }
        return null;
    },

    setListaClassi: function (lC) {
        listaClassi = lC;
    },

    getListaClassi: function () {
        return listaClassi;
    },

    /**
     *
     * @param objAl
     * @param veccCl
     * @param nuovaCl
     * @param salvoDB flag che salva sul DB
     */
    addStundentInClss: function (objAl, veccCl, nuovaCl, salvoDB) {
        veccCl = module.exports.classeIsObj(veccCl);
        nuovaCl = module.exports.classeIsObj(nuovaCl);
        veccCl.alunni.splice(veccCl.alunni.indexOf(objAl, 0), 1);
        nuovaCl.alunni.push(objAl);

        if (salvoDB) {
            query.removeAlunnoInClass(veccCl.nome, objAl.cf);
            query.insertAlunnoInClass(nuovaCl.nome, objAl.cf);
        }
    },

    //##################################################################################################################
    /**--------------------------------------FINE FUNZIONI PER COMPORRE CLASSI----------------------------------------*/
    //##################################################################################################################

    //##################################################################################################################
    /**----------------------------------------------------UTILITY----------------------------------------------------*/
    //##################################################################################################################
    /**
     * findClasseFromString data una stringa ritorna l'oggetto classe dato il nome
     * @param nomeClasse stringa
     * @returns {object}
     */
    findClasseFromString: function (nomeClasse) {
        for (var k = 0; k < listaClassi.length; k++) {
            if (listaClassi[k].nome == nomeClasse) {
                return listaClassi[k];
            }
        }
        return null;
    },

    /**
     * classeIsObj controlla se l'oggetto passato è una string;
     * se lo è ritorna l'oggetto classe con quel nome, se non lo è ritorna l'oggetto
     * @param classe
     * @returns {object}
     */
    classeIsObj: function (classe) {
        if (typeof classe === 'string' || classe instanceof String) {
            return module.exports.findClasseFromString(classe);
        }

        else {
            return classe;
        }
    },

    /**
     * removeUndefinedDaArray rimuove un undefined da un array
     * @param array
     */
    removeUndefinedDaArray: function (array) {
        return array.filter(function (n) {
            return n != undefined
        });
    },

    /**
     * removeNullFromArray rimuove un undefined da un array
     * @param array
     */
    removeNullFromArray: function (array) {
        return array.filter(function (n) {
            return n != null
        });
    },

    removeNullFromListaClassi: function () {
        for (var i = 0; i < listaClassi; i++) {
            listaClassi[i] = module.exports.removeNullFromArray(listaClassi[i]);
        }
    }
    //##################################################################################################################
    /**------------------------------------------------FINE UTILITY---------------------------------------------------*/
    //##################################################################################################################
}