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
    fem: 3,
    max_str: 5,
    iniziale:3,
    stessa_pr: 4,
    nazionalita:4,
    media_min: 7.3,
    media_max: 8.0,
    boc: 2,
    an_scol: "2017-2018"
}
var priority = {}
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
                            /*
                             ,
                             function (callback) {

                             module.exports.fixClassi(function () {
                             callback();
                             });
                             }
                             */
                        ],
                        function (err, succes) {
                            if (err) {
                                console.log(err);
                            } else {
                                callback(err, listaClassi);
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
                listaClassi.push({nome: classe, proprieta:{}, alunni: []});
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
        var iniziale = module.exports.countInizialeCognome(listaAlunniClasse);
        return {alunni:nAlunni, femmine:nFemmine, media:media.toFixed(2), residenza:residenza, bocciati:bocciati, iniziale:iniziale};
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

    /*
     * for (var i = 0; i < priority.length; i++) {
     switch (priority[i]) {
     case "alunni":

     break;
     case "femmine":

     break;
     case "stranieri":

     break;
     case "bocciati":

     break;
     case "stessa_provenienza":

     break;
     case "media":

     break;
     }
     }
     */


    /**
     * fixClassi sistema le classi in base alle impostazioni e alle priorità
     */
    fixClassi: function () {
        for (var k = 0; k < listaClassi.length; k++) {
            var objproblem = module.exports.problemiClasse(listaClassi[k].alunni);
            for (var prop in objproblem){
                switch (prop) {
                    case "alunni":

                        break;
                    case "femmine":
                        module.exports.fixFemmine(listaClassi[k].nome);
                        break;
                    case "stranieri":

                        break;
                    case "bocciati":

                        break;
                    case "stessa_provenienza":

                        break;
                    case "media":

                        break;
                }
            }
        }
        module.exports.printProprieta();
        //callback();
    },

    printProprieta: function (){
        for(var k=0; k < listaClassi.length;k++){
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
    countFemmine : function (listaAlunniClasse) {
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
    mediaClasse : function (listaAlunniClasse) {
        var somma = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            somma += Number(listaAlunniClasse[i].media_voti);
        }
        return (somma / listaAlunniClasse.length);

    },

    /**
     * countStranieri ritorna una lista di oggetti come nell es. {nazionalita:"brasiliano", num:3}
     * se superano il valore max impostato in settings
     * @param listaAlunniClasse
     * @returns {Array}
     */
    countStranieri : function (listaAlunniClasse) {
        var listaNaz = [];
        var count = 0;
        var ris = [];

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].nazionalita.toLowerCase() != "italiana"){
                listaNaz.push(listaAlunniClasse[i].cap_provenienza);
            }
        }
        listaNaz.sort();

        for (var i = 0; i < listaNaz.length - 1; i++) {
            if (listaNaz[i] == listaNaz[i + 1]) {
                count++;
            } else {
                if (count > settings.nazionalita){
                    ris.push({nazionalita:listaNaz[i], num: count + 1});
                }
                count = 0;
            }
        }
        return ris;
    },

    /**
     * countBocciati ritorna il numeero di bocciati per classe
     * @param listaAlunniClasse
     * @returns {number}
     */
    countBocciati : function (listaAlunniClasse) {
        var count = 0;
        var data  = "";

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            data = listaAlunniClasse[i].data_di_nascita;

            if (typeof data === 'string' || data instanceof String) {
                data = new Date(Date.parse(data.split(" ")[0]));
            }

            if ((1900 + data.getYear()) < (new Date().getFullYear() - 14)) {
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
    countStessaResid : function (listaAlunniClasse) {
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
                if (count > settings.stessa_pr){
                    ris.push({cap:listaCap[i], num: count + 1});
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
    countInizialeCognome: function (listaAlunniClasse) {
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
                if (count > settings.iniziale){
                    ris.push({lettera:listaIniz[i], num: count + 1});
                }
                count = 0;
            }
        }
        return ris;
    },

    problemiClasse: function(listaAlunniClasse){
        var ris = {};
        var proprieta = module.exports.createProprietaClasse(listaAlunniClasse);
        for (var prop in proprieta){
            switch (prop) {
                case "femmine":
                    if (proprieta.femmine != 0 && proprieta.femmine < settings.fem){
                        ris["femmine"] = proprieta.femmine;
                    }
                    break;
                case "stranieri":
                    if (proprieta.nazionalita < settings.nazionalita){
                        ris["nazionalita"] = proprieta.nazionalita;
                    }
                    break;
                case "bocciati":
                    if (proprieta.bocciati > settings.boc){
                        ris["bocciati"] = proprieta.bocciati;
                    }
                    break;
                case "residenza":
                    if(proprieta.prop !== undefined) {
                        for (var k = 0; k < proprieta.prop.length; k++) {
                            if (proprieta.residenza > settings.stessa_pr) {
                                console.log()
                                ris["residenza"] = proprieta.residenza;
                            }
                        }
                    }
                    break;
                case "media":

                    break;
            }
        }

        return ris;
    },
    /**
     * fixFemmine inserisce nella classe param le femmine di altre classi che non rispettano i vincoli.
     * @param nomeClasse
     */
    fixFemmine: function(nomeClasse) {
        var classe = module.exports.findClasseFromString(nomeClasse);  //classe in esame
        for (var i = 0; i < listaClassi.length; i++){
            if (listaClassi[i].nome != nomeClasse){
                if (module.exports.countFemmine(classe.alunni) >= module.exports.countFemmine(listaClassi[i].alunni) &&  module.exports.countFemmine(listaClassi[i].alunni) != 0
                    && module.exports.countFemmine(listaClassi[i].alunni) < settings.fem){
                    var objfem = module.exports.searchAlunno("sesso", "F", listaClassi[i].alunni);
                    if (objfem != null) {
                        module.exports.addStundentInClss(objfem, listaClassi[i], classe, true);
                        console.log(objfem.nome + ", classe prov " + listaClassi[i].nome + ", classe fin " + classe.nome);
                    }
                }
            }
            //Esce dal ciclo se, nella classe passata come parametro, non ci sono più femmine
            if (module.exports.countFemmine(classe.alunni) == settings.fem){
                i = listaClassi.length;
            }
        }
    },

    searchAlunno: function(attr, valore, listaAlunniClasse) {
        for (var i = 0; i < listaAlunniClasse.length; i++){
            if (listaAlunniClasse[i][attr] == valore){
                return listaAlunniClasse[i];
            }
        }
        return null;
    },

    setListaClassi: function (lC){
        listaClassi = lC;
    },

    /**
     *
     * @param objAl
     * @param veccCl
     * @param nuovaCl
     * @param salvoDB flag che salva sul DB
     */
    addStundentInClss: function (objAl, veccCl, nuovaCl, salvoDB){
        veccCl = module.exports.classeIsObj(veccCl);
        nuovaCl = module.exports.classeIsObj(nuovaCl);
        veccCl.alunni.splice(veccCl.alunni.indexOf(objAl, 0), 1);
        nuovaCl.alunni.push(objAl);

        veccFem = module.exports.countFemmine(veccCl.alunni);
        nuovFem = module.exports.countFemmine(nuovaCl.alunni);

        if (salvoDB){
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
    findClasseFromString : function(nomeClasse) {
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
    removeUndefinedDaArray: function(array){
        return array.filter(function(n){ return n != undefined });
    },

    /**
     * removeNullFromArray rimuove un undefined da un array
     * @param array
     */
    removeNullFromArray: function(array){
        return array.filter(function(n){ return n != null });
    },

    removeNullFromListaClassi: function(){
        for (var i = 0; i < listaClassi; i++){
            listaClassi[i] = module.exports.removeNullFromArray(listaClassi[i]);
        }
    }
    //##################################################################################################################
    /**------------------------------------------------FINE UTILITY---------------------------------------------------*/
    //##################################################################################################################
}