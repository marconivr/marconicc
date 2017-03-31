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
    nazionalita: 3,
    media_min: 7.7,
    media_max: 8.0,
    max_al_104: 23,
    boc: 2,
    an_scol: "2017-2018"
};
var priority = ["alunni", "104", "107", "desiderata", "ripetenti", "femmine", "nazionalita", "CAP", "voto"];
var listaAlunni = [];
var listaClassi = []; //esempio [{nome:"1AI", proprieta:{alunni:23, femmine:2}, alunni:[{nome:"Mario", cognome:"Rossi"}]}]

module.exports = {
    /**
     * firstGeneration prima generazione con le operazioni che seguono
     * @param classe
     * @param callback
     */
    firstGeneration: function (classe, callback) {
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
        var ripetenti = module.exports.countRipetenti(listaAlunniClasse);
        var iniziale = module.exports.countTutteInizialiCognome(listaAlunniClasse);
        var stranieri = module.exports.countStranieri(listaAlunniClasse);
        var desiderata = module.exports.countDesiderata(listaAlunniClasse);
        return {
            alunni: nAlunni,
            femmine: nFemmine,
            media: media.toFixed(2),
            residenza: residenza,
            ripetenti: ripetenti,
            iniziale: iniziale,
            stranieri: stranieri,
            desiderata: desiderata,
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
                        case "nazionalita":
                            //module.exports.fixStranieri(listaClassi[k].nome);
                            module.exports.fixStranieriPerNaz(listaClassi[k].nome, objproblem["nazionalita"]);
                            break;
                        case "stessa_provenienza":

                            break;
                        case "media":
                            module.exports.fixMedia(listaClassi[k].nome);
                            break;
                        case "iniziale":

                            break;
                        case "desiderata":
                            module.exports.fixDesiderata(listaClassi[k].nome);
                            break;
                    }
                }
                listaClassi[k].proprieta = module.exports.createProprietaClasse(listaClassi[k].alunni);
            }
            //module.exports.fixRipetenti(listaClassi[k].nome);
            //console.log("Proprietà classe: " + listaClassi[k].nome);
            //module.exports.printProprieta();
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

    countDesiderata: function(listaAlunniClasse){
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].cf_amico.toLowerCase() != "") {
                count++;
            }
        }
        return count;
    },

    countStranieriStessaNaz: function (listaAlunniClasse, nazionalita) {
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].nazionalita.toLowerCase() == nazionalita) {
                count++;
            }
        }
        return count;
    },

    /**
     * countRipetenti ritorna il numero di ripetenti della classe param
     * @param listaAlunniClasse
     * @returns {number}
     */
    countRipetenti: function (listaAlunniClasse) {
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
           if (listaAlunniClasse[i].classe_precedente[0] == "1"){
               count++;
           }
        }

        return count;
    },

    /**
     * countRipetentiTot ritorna il numero di ripetenti totali
     * @param listaAlunniClasse
     * @returns {number}
     */
    countRipetentiTot: function () {
        var count = 0;
        for (var k = 0; k < listaClassi.length; k++){
            for (var i = 0; i < listaClassi[k].alunni.length; i++) {
                if (listaClassi[k].alunni[i].classe_precedente[0] == "1"){
                    count++;
                }
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
                    /*if (proprieta.stranieri > settings.max_str) {
                        ris["stranieri"] = proprieta.stranieri;
                    }*/
                    var probl = {};
                    var divNaz = module.exports.diverseNazionalita(listaAlunniClasse);

                    for (var i = 0; i < divNaz.length; i++){
                        var countStr = module.exports.countStranieriStessaNaz(listaAlunniClasse, divNaz[i]);
                        if (countStr > settings.nazionalita){
                            probl[divNaz[i]] = countStr;
                        }
                    }
                    if (probl != {}){
                        ris["nazionalita"] = probl;
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
                    break;
                case "desiderata":
                    if (proprieta.desiderata != 0) {
                        ris["desiderata"] = proprieta.desiderata;
                    }
                    break;
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
                        module.exports.addStundentInClss(objal, listaClassi[i], classe, true);
                    }
                }
            }
            if (classe.alunni.media >= settings.media_min) {
                break;
            }
        }
    },

    fixDesiderata: function (nomeClasse) {
        var classe = module.exports.findClasseFromString(nomeClasse);
        var elencoDesiderataClasse = module.exports.elencoDesiderataInClass(classe.alunni);
        for (var cf in elencoDesiderataClasse ){
            for (var i = 0; i < listaClassi.length; i++){
                var objal = module.exports.searchAlunno("cf", elencoDesiderataClasse[cf], listaClassi[i].alunni);

                if (objal != null) {
                    if (objal.cf_amico == cf){
                        module.exports.addStundentInClss(objal,listaClassi[i], classe, true);
                    }
                }
            }
        }
    },

    /**
     * delCerry
     * @param nomeClasse
     */
    fixStranieri: function(nomeClasse){
        var classe = module.exports.findClasseFromString(nomeClasse);  //classe in esame
        for (var i = 0; i < listaClassi.length; i++) {
            if (listaClassi[i].nome != nomeClasse) {
                if (module.exports.countStranieri(classe.alunni) >= settings.max_str
                    && module.exports.countStranieri(listaClassi[i].alunni) < settings.max_str) {
                    var objal = module.exports.searchStraniero(classe.alunni);
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

    /**
     * diverseNazionalita crea una lista con tutte le diverse nazionalità in classe
     * @param listaAlunniClasse
     * @returns {*}
     */
    diverseNazionalita: function(listaAlunniClasse){
        var ris = [];
        for(var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i]["nazionalita"].toLowerCase() != "italiana" &&
                (ris.indexOf(listaAlunniClasse[i]["nazionalita"].toLowerCase()) == -1)) {
                ris.push(listaAlunniClasse[i]["nazionalita"].toLowerCase());
            }
        }
        return ris;
    },

    /**
     *
     * @param listaAlunniClasse
     * @returns {{}}
     */
    elencoDesiderataInClass: function (listaAlunniClasse) {
        var ris = {};
        for(var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i]["cf_amico"].toLowerCase() != "") {
                ris[listaAlunniClasse[i]["cf"]] = listaAlunniClasse[i]["cf_amico"];
            }
        }
        return ris;
    },

    /**
     * fixStranieriPerNaz fixa per nazionalita se rispettano quelle prestabilite
     * @param nomeClasse
     * @param objNaz
     */
    fixStranieriPerNaz: function (nomeClasse, objNaz) {
        var classe = module.exports.findClasseFromString(nomeClasse);  //classe in esame
        for (var i = 0; i < listaClassi.length; i++) {
            for (var naz in objNaz){
                if (listaClassi[i].nome != nomeClasse) {
                    if (module.exports.countStranieriStessaNaz(listaClassi[i].alunni, naz) < (objNaz[naz] - 1)) {
                        var objal = module.exports.searchAlunno("nazionalita", naz.toUpperCase(), classe.alunni);
                        if (objal != null) {
                            module.exports.addStundentInClss(objal, classe, listaClassi[i], true);
                        }
                    }
                }
            }
            if (module.exports.countStranieri(classe.alunni) == settings.max_str) {
                break;
            }
        }
    },

    /**
     * fixRipetenti inserisce nella classe param le femmine di altre classi che non rispettano i vincoli.
     * @param nomeClasse
     */
    fixRipetenti: function (nomeClasse) {
        var num_ripetenti = Math.round(module.exports.countRipetentiTot()/listaClassi.length);   //numero ripetenti per classe
        var classe = module.exports.findClasseFromString(nomeClasse);  //classe in esame
        for (var i = 0; i < listaClassi.length; i++) {
            if (listaClassi[i].nome != nomeClasse) {
                if (module.exports.countRipetenti(classe.alunni) > num_ripetenti
                    && module.exports.countRipetenti(listaClassi[i].alunni) < num_ripetenti) {
                    var objal = module.exports.searchRipetente(classe.alunni);
                    if (objal != null) {
                        module.exports.addStundentInClss(objal, classe, listaClassi[i], true);
                    }
                }
                if (module.exports.countRipetenti(classe.alunni) < num_ripetenti
                    && module.exports.countRipetenti(listaClassi[i].alunni) > num_ripetenti) {
                    var objal = module.exports.searchRipetente(classe.alunni);
                    if (objal != null) {
                        module.exports.addStundentInClss(objal, classe, listaClassi[i], true);
                    }
                }
            }

            if (module.exports.countRipetenti(listaClassi[i].alunni) == num_ripetenti) {
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

    /**
     * searchAlunno cerca un alunno data un attributo, un valore e la lista di alunni di una classe
     * @param attr
     * @param valore
     * @param listaAlunniClasse
     * @returns {*}
     */
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
                return listaAlunniClasse[i];
            }
        }
        return null;
    },

    searchRipetente: function (listaAlunniClasse) {
        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i]["classe_precedente"] != "") {
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