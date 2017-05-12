/**
 * Created by michele on 2/13/17.
 */

var middleware = require('./middleware/middleware');
var query = require('./../query/query.js');
var async = require('async');

//settings var
var settings = {}; //data, min_alunni, max_alunni, fem, max_str, stessa_pr, nazionalita, naz_per_classe, numero_alunni_con_104

var priority = ["alunni", "legge_104", "legge_107", "desiderata", "ripetenti", "femmine", "nazionalita", "cap", "voto"];

var listaAlunni = [];
var listaAlunniDeleted = [];
var insiemi = [];
var listaClassi = []; //esempio [{nome:"1AI", propAttuali:{alunni:23, femmine:2}, alunni:[{nome:"Mario", cognome:"Rossi"}]}]


var annoScolastico = undefined;
var scuola = undefined;
var classeFutura = undefined;

module.exports = {

    generaClassiPrima: function (a, s, c, callback) {
        //setto le variabili globali
        annoScolastico = a;
        scuola = s;
        classeFutura = c;


        query.getStudentiOfschool(scuola, annoScolastico, classeFutura, function (err, results) {
            if (err)
                console.log(err);
            else {
                async.waterfall(
                    [
                        function (callback) {
                            //pulisco gli array per chiamate successive
                            listaClassi = [];
                            listaAlunni = [];
                            listaAlunniDeleted = [];
                            insiemi = [];
                            module.exports.inizializzaSettings(annoScolastico, scuola, classeFutura);
                            callback();
                        },
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
                            listaAlunniDeleted = json;
                            callback();
                        },
                        function (callback) {
                            module.exports.creaInsiemi(function (err, result) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    module.exports.setInsiemi(result);
                                    callback();
                                }
                            });
                        },
                        function (callback) {
                            var ris = module.exports.generaListaClassi("prima");
                            //module.exports.saveClassiOnDb(ris);
                            callback(ris);
                        }
                    ],
                    function (succes) {
                        callback(succes);
                    }
                )
            }
        });
    },

    isAttributeInsideObject: function (obj, attr) {
        for (var o in obj) {
            if (o == attr) {
                return true;
            }
        }
        return false;
    },

    getInsieme: function (nomeInsieme) {
        for (var i = 0; i < insiemi.length; i++) {
            if (insiemi[i].nome == nomeInsieme) {
                return insiemi[i];
            }
        }
        return null;
    },

    inizializzaSettings: function (annoScolastico, scuola, classeFutura) {
        query.scaricaSettings(annoScolastico, scuola, classeFutura, function (err, results) {
            if (err)
                console.log(err);
            else {
                settings = results[0];
            }
        });
    }

    ,
    /**
     * creaInsiemi genera i possibili insiemi dati gli alunni
     */
    creaInsiemi: function (callback) {
        var insiemi = [];
        for (var i = 0; i < priority.length; i++) {
            if (priority[i] != "alunni" && priority[i] != "stranieri") {
                if (priority[i] == "femmine" || priority[i] == "ripetenti" || priority[i] == "legge_104" || priority[i] == "legge_107"
                    || priority[i] == "desiderata") {
                    insiemi.push({nome: priority[i], alunni: []});
                }
                else {
                    insiemi.push({nome: priority[i], alunni: {}});
                }
            }
        }

        query.getStudentiOfschool(scuola, annoScolastico, classeFutura, function (err, results) {
            if (err)
                console.log(err);
            else {
                listaAlunni = module.exports.shuffleArray(results);
                for (var i = 0; i < listaAlunni.length; i++) {
                    for (var j = 0; j < priority.length; j++) {
                        var ins = module.exports.findInsiemeFromString(priority[j], insiemi);
                        switch (priority[j]) {
                            case "femmine":
                                if (listaAlunni[i].sesso == "F") {
                                    ins.alunni.push(listaAlunni[i]);
                                }
                                break;
                            case "ripetenti":
                                if (listaAlunni[i].classe_precedente != "") {
                                    ins.alunni.push(listaAlunni[i]);
                                }
                                break;
                            case "nazionalita":
                                if (listaAlunni[i].nazionalita.toLowerCase() != "italiana") {
                                    if (!(module.exports.isAttributeInsideObject(ins.alunni, listaAlunni[i].nazionalita.toUpperCase()))) {
                                        ins.alunni[listaAlunni[i].nazionalita] = [];
                                    }
                                    ins.alunni[listaAlunni[i].nazionalita].push(listaAlunni[i]);
                                }
                                break;
                            case "cap":
                                if (!(module.exports.isAttributeInsideObject(ins.alunni, listaAlunni[i].cap))) {
                                    ins.alunni[listaAlunni[i].cap] = [];
                                }
                                ins.alunni[listaAlunni[i].cap].push(listaAlunni[i]);
                                break;
                            case "voto":
                                if (!(module.exports.isAttributeInsideObject(ins.alunni, listaAlunni[i].voto))) {
                                    ins.alunni[listaAlunni[i].voto] = [];
                                }
                                ins.alunni[listaAlunni[i].voto].push(listaAlunni[i]);
                                break;
                            case "desiderata":
                                if (listaAlunni[i].desiderata != "") {
                                    ins.alunni.push(listaAlunni[i]);
                                }
                                break;
                            case "legge_104":
                                if (listaAlunni[i].legge_104 != "") {
                                    ins.alunni.push(listaAlunni[i]);
                                }
                                break;
                            case "legge_107":
                                if (listaAlunni[i].legge_107 != "") {
                                    ins.alunni.push(listaAlunni[i]);
                                }
                                break;
                        }
                    }
                }
            }

            callback(err, insiemi);
        });
    },

    /**
     * generaListaClassi è una funzione che genera oggetti classe {nome: classe, propAttuali:{}, alunni: []}
     * in base agli alunni minimi
     * @param classe
     * @param callback
     */
    generaListaClassi: function () {
            var num = Math.round(listaAlunni.length / (settings.min_alunni));
            for (i = 0; i < num; i++) {
                var classe = "1" + String.fromCharCode(65 + i);
                listaClassi.push({
                    nome: classe, propAttuali: {}, propIdeali: {
                        legge_104: 0,
                        legge_107: 0
                    }, alunni: []
                });
            }
            return module.exports.generaPropIdeali(listaClassi);
    },

    sortProprietaIdeali: function (prop) {
        return function (a, b) {
            if (a.propIdeali[prop] < b.propIdeali[prop])
                return -1;
            else if (a.propIdeali[prop] > b.propIdeali[prop])
                return 1;
            return 0;
        }
    },

    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     */
    shuffleArray: function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    ,


    sortClassiOrdAlf: function () {
        return function (a, b) {
            if (a.nome < b.nome)
                return -1;
            else if (a.nome > b.nome)
                return 1;
            return 0;
        }
    },

    /**
     * Funzione che rimuove da tutti gli insiemi ed lista studenti uno studente partendo dal suo oggetto
     * @param objStudente
     */
    removeStudenteFromInsiemi: function (objStudente) {
        for (var item in insiemi) {
            if (insiemi[item].nome == "nazionalita" || insiemi[item].nome == "cap" || insiemi[item].nome == "voto") {
                for (var i in insiemi[item].alunni) {
                    var studenti = insiemi[item].alunni[i];
                    var posizione = studenti.indexOf(objStudente);
                    if (posizione != -1) {
                        studenti.splice(posizione, 1);
                    }
                }
            } else {
                var studenti = insiemi[item].alunni;
                var posizione = studenti.indexOf(objStudente)
                if (posizione != -1) {
                    studenti.splice(posizione, 1);
                }
            }
        }
        //rimuovo dalla lista studenti
        posizione = listaAlunniDeleted.indexOf(objStudente);
        if (posizione != -1) {
            listaAlunniDeleted.splice(posizione, 1);
        }
    }
    ,
    findAlunnoByCf: function (cf) {
        for (var i in listaAlunni) {
            if (listaAlunni[i].cf === cf) {
                return listaAlunni[i];
            }
        }
    }
    ,
    /**
     * Controllo se uno studente ha un desiderata reciproco. Se si torno l'oggetto dell'amico se no torno null
     * @param objStudente
     * @returns {*}
     */
    checkDesiderata: function (objStudente) {

        if (objStudente !== undefined) {
            if (objStudente.desiderata !== "") {


                var cf = objStudente.cf;
                var cfAmico = objStudente.desiderata;

                var objAmico = module.exports.findAlunnoByCf(cfAmico);

                if (objAmico === undefined){
                    console.log(undefined);
                }

                if(objAmico === undefined){
                    return null;
                }
                if (objAmico.desiderata === cf) {
                    return objAmico;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
        return null;
    }
    ,

    getRipetentiOfClass: function (nomeClasse) {
        var ripententi = [];
        for (var i in insiemi) {
            if (insiemi[i].nome == "ripetenti") {
                for (var j in insiemi[i].alunni) {
                    if (insiemi[i].alunni[j]["classe_precedente"] == nomeClasse) {
                        ripententi.push(insiemi[i].alunni[j]);
                    }
                }
            }
        }
        return ripententi;
    }
    ,

    /**
     * Funzione che trova l'alunno ideale date le proprietà ideali della classe e la propietà principale che può essere o legge_104 o legge_107 o femmine
     * @param propIdeali
     * @param prop
     * @returns {alunno}
     */
    findAlunnoIdeale: function (propIdeali, prop) {
        if (prop === "legge_104" || prop === "legge_107" || prop === "femmine" || prop === "ripetenti") {
            for (var ins in insiemi) {
                if (insiemi[ins].nome === prop) {
                    var insieme = insiemi[ins];
                    var studenti = insieme.alunni;
                    var ris = {alunno4: null, alunno3: null, alunno2: null, alunno1: null};
                    for (var i in studenti) {
                        if (propIdeali[studenti[i].nazionalita] !== undefined || studenti[i].nazionalita === "ITALIANA") {
                            ris.alunno2 = studenti[i];
                            if (propIdeali[studenti[i].cap] !== undefined) {
                                ris.alunno3 = studenti[i];
                                if (propIdeali[studenti[i].voto] !== undefined) {
                                    ris.alunno4 = studenti[i];
                                }
                            }
                        }
                        ris.alunno1 = studenti [i];
                    }

                    if (ris.alunno4 !== null) {
                        return ris.alunno3;
                    }
                    if (ris.alunno3 !== null) {
                        return ris.alunno3;
                    }
                    if (ris.alunno2 !== null) {
                        return ris.alunno2;
                    }
                    if (ris.alunno1 !== null) {
                        return ris.alunno1;
                    }

                }
            }

        }
    },

    /**
     * Funzione che popola le classi confrontando le proprietà ideali della classe con quelle che effettivamente ha
     */
    popolaClassi: function () {

        //aggiungo 104 se c'è ne bisogno
        for (var item in insiemi) {
            for (var i in listaClassi) {

                var classeInEsame = listaClassi[i];
                module.exports.createProprietaClasse(classeInEsame.nome); //genero le propietà attuali della classe

                var proprietaIdeali = classeInEsame.propIdeali;
                var proprietaAttuali = classeInEsame.propAttuali;

                var prop = insiemi[item].nome;
                //console.log(item + ", " + prop);
                if (prop == "legge_104") {
                    while (proprietaIdeali.legge_104 > proprietaAttuali.legge_104 && proprietaIdeali.alunni > proprietaAttuali.alunni) {
                        var studente = module.exports.findAlunnoIdeale(proprietaIdeali, prop);
                        if (studente === undefined) {
                            break
                        }
                        module.exports.removeStudenteFromInsiemi(studente);

                        classeInEsame.alunni.push(studente);//aggiungo lo studente alla classe

                        var amico = module.exports.checkDesiderata(studente);
                        amico = null;
                        if (amico) {
                            module.exports.removeStudenteFromInsiemi(amico);
                            classeInEsame.alunni.push(amico);
                        }

                        module.exports.createProprietaClasse(classeInEsame.nome);
                        proprietaAttuali = classeInEsame.propAttuali;
                    }
                }
                else if (prop == "legge_107") {
                    while (proprietaIdeali.legge_107 > proprietaAttuali.legge_107 && proprietaIdeali.alunni > proprietaAttuali.alunni) {

                        studente = module.exports.findAlunnoIdeale(proprietaIdeali, prop);

                        if (studente === undefined) {
                            break
                        }

                        module.exports.removeStudenteFromInsiemi(studente);
                        classeInEsame.alunni.push(studente); //aggiungo lo studente alla classe

                        amico = module.exports.checkDesiderata(studente);
                        amico = null;
                        if (amico) {
                            module.exports.removeStudenteFromInsiemi(amico);
                            classeInEsame.alunni.push(amico);
                        }

                        module.exports.createProprietaClasse(classeInEsame.nome);
                        proprietaAttuali = classeInEsame.propAttuali;
                    }
                }

                //TODO per i ripetenti non vado a mettere i loro desiderata nella classe! Questo è da chiedere e da definire
                else if (prop == "ripetentiNONO") {
                    var ripetenti = module.exports.getRipetentiOfClass(classeInEsame.nome);
                    for (i in ripetenti) {
                        module.exports.removeStudenteFromInsiemi(ripetenti[i]);
                        classeInEsame.alunni.push(ripetenti[i]);
                    }

                    module.exports.createProprietaClasse(classeInEsame.nome);
                    proprietaAttuali = classeInEsame.propAttuali;

                }

                else if (prop == "ripetenti") {
                    while (proprietaIdeali.ripetenti > proprietaAttuali.ripetenti && proprietaIdeali.alunni > proprietaAttuali.alunni) {
                        studente = module.exports.findAlunnoIdeale(proprietaIdeali, prop);

                        if (studente === undefined) {
                            break;
                        }
                        module.exports.removeStudenteFromInsiemi(studente);
                        classeInEsame.alunni.push(studente); //aggiungo lo studente alla classe

                        amico = module.exports.checkDesiderata(studente);
                        amico = null;
                        module.exports.createProprietaClasse(classeInEsame.nome);
                        proprietaAttuali = classeInEsame.propAttuali;
                    }
                }

                else if (prop == "femmine") {

                    while (proprietaIdeali.femmine > proprietaAttuali.femmine && proprietaIdeali.alunni > proprietaAttuali.alunni) {
                        studente = module.exports.findAlunnoIdeale(proprietaIdeali, prop);
                        if (studente === undefined) {
                            break
                        }
                        module.exports.removeStudenteFromInsiemi(studente);
                        classeInEsame.alunni.push(studente); //aggiungo lo studente alla classe

                        amico = module.exports.checkDesiderata(studente);
                        amico = null;
                        if (amico) {
                            module.exports.removeStudenteFromInsiemi(amico);
                            classeInEsame.alunni.push(amico);
                        }

                        module.exports.createProprietaClasse(classeInEsame.nome);
                        proprietaAttuali = classeInEsame.propAttuali;
                    }

                }

                else if (prop == "voto") {
                    for (var voto in proprietaIdeali.voto) {
                        while (proprietaIdeali.voto[voto] > proprietaAttuali.voto[voto] && proprietaIdeali.alunni > proprietaAttuali.alunni) {

                            studente = insiemi[item].alunni[voto][0];

                            if (studente === undefined) {
                                break
                            }

                            module.exports.removeStudenteFromInsiemi(studente);
                            classeInEsame.alunni.push(studente); //aggiungo lo studente alla classe

                            amico = module.exports.checkDesiderata(studente);
                            amico = null;
                            if (amico) {
                                module.exports.removeStudenteFromInsiemi(amico);
                                classeInEsame.alunni.push(amico);
                            }

                            module.exports.createProprietaClasse(listaClassi[i].nome);
                            proprietaAttuali = classeInEsame.propAttuali;
                        }
                    }
                }

                else if (prop == "nazionalita") {
                    for (var nazionalita in proprietaIdeali.nazionalita && proprietaIdeali.alunni > proprietaAttuali.alunni) {

                        while (proprietaIdeali.nazionalita[nazionalita] > proprietaAttuali.nazionalita[nazionalita]) {

                            studente = insiemi[item].alunni[nazionalita][0];

                            if (studente === undefined) {
                                break
                            }

                            module.exports.removeStudenteFromInsiemi(studente);
                            classeInEsame.alunni.push(studente); //aggiungo lo studente alla classe

                            amico = module.exports.checkDesiderata(studente);
                            amico = null;
                            if (amico) {
                                module.exports.removeStudenteFromInsiemi(amico);
                                classeInEsame.alunni.push(amico);
                            }

                            module.exports.createProprietaClasse(listaClassi[i].nome);
                            proprietaAttuali = classeInEsame.propAttuali;
                        }
                    }
                }

                else if (prop == "cap") {
                    for (var cap in proprietaIdeali.cap && proprietaIdeali.alunni > proprietaAttuali.alunni) {
                        while (proprietaIdeali.cap[cap] > proprietaAttuali.cap[cap]) {
                            studente = insiemi[item].alunni[cap][0];

                            if (studente === undefined) {
                                break
                            }
                            module.exports.removeStudenteFromInsiemi(studente);
                            classeInEsame.alunni.push(studente); //aggiungo lo studente alla classe

                            amico = module.exports.checkDesiderata(studente);

                            amico = null;
                            if (amico) {
                                module.exports.removeStudenteFromInsiemi(amico);
                                classeInEsame.alunni.push(amico);
                            }

                            module.exports.createProprietaClasse(listaClassi[i].nome);
                            proprietaAttuali = classeInEsame.propAttuali;
                        }
                    }
                }
            }
        }

        if (!module.exports.thereIsStundentiInInsiemi()) {
            //console.log("È true");
            var debuggerVoti = false;
            var debuggerNazionalita = false;
            var debuggetcap = false;

            if (debuggerVoti){
                for (var lista in listaClassi) {
                console.log("######################################");
                console.log(listaClassi[lista].nome + " alunni ideali: " + listaClassi[lista].propIdeali.alunni + " alunni attuali: " + listaClassi[lista].propAttuali.alunni);
                console.log("10 ideale : " + listaClassi[lista].propIdeali.voto['10'] + ", 10 attuale : " + listaClassi[lista].propAttuali.voto['10']);
                console.log("9  ideale : " + listaClassi[lista].propIdeali.voto['9'] + ", 9  attuale : " + listaClassi[lista].propAttuali.voto['9']);
                console.log("8  ideale : " + listaClassi[lista].propIdeali.voto['8'] + ", 8  attuale : " + listaClassi[lista].propAttuali.voto['8']);
                console.log("7  ideale : " + listaClassi[lista].propIdeali.voto['7'] + ", 7  attuale : " + listaClassi[lista].propAttuali.voto['7']);
                console.log("6  ideale : " + listaClassi[lista].propIdeali.voto['6'] + ", 6  attuale : " + listaClassi[lista].propAttuali.voto['6']);
                console.log("######################################");
                }
            }

            if (debuggerNazionalita){
                for (var classe in listaClassi){
                    console.log("######################################");
                    console.log(listaClassi[classe].nome + " alunni ideali: " + listaClassi[classe].propIdeali.alunni + " alunni attuali: " + listaClassi[classe].propAttuali.alunni);
                    var objNazIdeali = listaClassi[classe].propIdeali.nazionalita;
                    var objNazAttuali = listaClassi[classe].propAttuali.nazionalita;
                    for (var naz in objNazIdeali){
                        console.log(naz + "-->" + objNazIdeali[naz])
                    }
                }
            }

            if (debuggetcap){
                for (var classe in listaClassi){
                    console.log("######################################");
                    console.log(listaClassi[classe].nome + " alunni ideali: " + listaClassi[classe].propIdeali.alunni + " alunni attuali: " + listaClassi[classe].propAttuali.alunni);
                    var objcapIdeali = listaClassi[classe].propIdeali.cap;
                    var objcapAttuali = listaClassi[classe].propAttuali.cap;
                    for (var cap in objcapIdeali){
                        console.log(cap + "-->" + objcapIdeali[cap])
                    }
                }
            }

        }

    },

    thereIsStundentiInInsiemi: function () {
        for (var i in insiemi) {
            for (var k in insiemi[i].alunni) {
                if (Array.isArray(insiemi[i].alunni[k])) {
                    if (insiemi[i].alunni[k].length > 0) {
                        return true;
                    }
                } else {
                    if (insiemi[i].alunni.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    inizializzaPropIdeali: function () {
        for (var i = 0; i < listaClassi.length; i++) {
            listaClassi[i].propIdeali.alunni = settings.min_alunni;
            listaClassi[i].propIdeali.legge_104 = 0;
            listaClassi[i].propIdeali.legge_107 = 0;
            listaClassi[i].propIdeali.ripetenti = 0;
            listaClassi[i].propIdeali.femmine = 0;
            listaClassi[i].propIdeali.cap = {};
            listaClassi[i].propIdeali.voto = {};
            listaClassi[i].propIdeali.nazionalita = {};
        }
    },

    getClassiAlunniMin: function () {
        var ris = [];
        var min = settings.max_alunni;
        for (var i = 0; i < listaClassi.length; i++) {
            if (listaClassi[i].propIdeali.legge_104 == 0 && listaClassi[i].propIdeali.alunni < min) {
                ris = [];
                ris.push(listaClassi[i]);
                min = listaClassi[i].propIdeali.alunni;
            }
            else if (listaClassi[i].propIdeali.legge_104 == 0 && listaClassi[i].propIdeali.alunni == min) {
                ris.push(listaClassi[i]);
            }
        }
        return ris;
    },

    distribuisciSe104: function (numAlunniCl) {
        var num = numAlunniCl - settings.numero_alunni_con_104;
        var clMin = module.exports.getClassiAlunniMin();
        for (var i = 0; i < clMin.length; i++) {
            if (num > 0) {
                clMin[i].propIdeali.alunni += 1;
                num -= 1;
            } else {
                break;
            }
        }
    },

    validaPropIdeali: function (voti, cap) {

        var countInObject = function (obj) {
            var ris = 0;
            for (var v in obj) {
                ris += obj[v];
            }
            return ris;
        };

        for (var i in listaClassi) {
            var nvoti = 0;

            for (var k in listaClassi[i].propIdeali.voto) {
                nvoti += listaClassi[i].propIdeali.voto[k];
            }

            if (nvoti > listaClassi[i].propIdeali.alunni) {
                var diff = nvoti - listaClassi[i].propIdeali.alunni;
                var n = 6;
                while (n <= 10 || diff == 0){
                    listaClassi[i].propIdeali.voto[n] -= 1;
                    if (voti[n] === undefined){
                        voti[n] = 1;
                    }else{
                        voti[n] += 1;
                    }
                    n++;
                    diff--;
                }
            }
        }
        if (Object.keys(voti).length > 0) {
            for (var i = 0; i < listaClassi.length; i++) {

                for (var v = 0; v < Object.keys(voti).length; v++) {
                    var nVC = countInObject(listaClassi[i].propIdeali.voto);
                    if (listaClassi[i].propIdeali.alunni > nVC) {
                        if (voti[Object.keys(voti)[v]] > listaClassi[i].propIdeali.alunni - nVC) {
                            listaClassi[i].propIdeali.voto[Object.keys(voti)[v]] += listaClassi[i].propIdeali.alunni - nVC;
                            voti[Object.keys(voti)[v]] -= listaClassi[i].propIdeali.alunni - nVC;
                        } else {
                             listaClassi[i].propIdeali.voto[Object.keys(voti)[v]] += voti[Object.keys(voti)[v]];
                            delete voti[Object.keys(voti)[v]];
                        }
                    }
                }
            }
        }
        for (var i in listaClassi) {
            var ncap = 0;

            for (var k in listaClassi[i].propIdeali.cap) {
                ncap += listaClassi[i].propIdeali.cap[k];
            }

            if (ncap > listaClassi[i].propIdeali.alunni) {
                for (var k in listaClassi[i].propIdeali.cap) {
                    listaClassi[i].propIdeali.cap[k] -= 1;

                    if (cap[k] === undefined) cap[k] = 1;
                    else    cap[k] += 1;
                    ncap -= 1;
                    if (ncap == listaClassi[i].propIdeali.alunni) break;
                }
            }
        }

        if (Object.keys(cap).length > 0) {
            module.exports.sortProprietaIdeali("alunni");

            for (var i = listaClassi.length - 1; i >= 0; i--) {
                var ncap = countInObject(listaClassi[i].propIdeali.cap);
                if (listaClassi[i].propIdeali.alunni > ncap) {
                    for (var v = Object.keys(cap).length - 1; v >= 0; v--) {
                        if (listaClassi[i].propIdeali.cap[Object.keys(cap)[v]] === undefined) {
                            listaClassi[i].propIdeali.cap[Object.keys(cap)[v]] = 0;
                        }
                        if (cap[Object.keys(cap)[v]] > listaClassi[i].propIdeali.alunni - ncap) {
                            listaClassi[i].propIdeali.cap[Object.keys(cap)[v]] += listaClassi[i].propIdeali.alunni - ncap;
                            cap[Object.keys(cap)[v]] -= listaClassi[i].propIdeali.alunni - ncap;
                        } else {
                            listaClassi[i].propIdeali.cap[Object.keys(cap)[v]] += cap[Object.keys(cap)[v]];
                            delete cap[Object.keys(cap)[v]];
                        }
                    }
                }
            }
        }
        return voti, cap;
    },

    generaPropIdeali: function () {
        var insNaz = module.exports.getInsieme("nazionalita").alunni;
        var insVoti = module.exports.getInsieme("voto").alunni;
        var inscap = module.exports.getInsieme("cap").alunni;

        var totale104 = module.exports.count104(listaAlunni);
        var totale107 = module.exports.count107(listaAlunni);
        var totaleFem = module.exports.countFemmine(listaAlunni);
        var totaleRip = module.exports.countRipetenti(listaAlunni);

        var naz = {};
        var voti = {};
        var cap = {};

        for (var n in insNaz) {
            naz[n] = insNaz[n].length;
        }

        for (var n in insVoti) {
            voti[n] = insVoti[n].length;
        }

        for (var n in inscap) {
            cap[n] = inscap[n].length;
        }

        var flag = true;
        module.exports.inizializzaPropIdeali();

        while (flag) {
            var count = 0;
            for (var i = 0; i < listaClassi.length; i++) {
                count += settings.min_alunni;
                if (count < listaAlunni.length && i == listaClassi.length - 1) {
                    for (var k = listaClassi.length - 1; k >= 0; k--) {
                        if (count < listaAlunni.length) {
                            if (listaClassi[k].propIdeali.alunni < settings.max_alunni) {
                                listaClassi[k].propIdeali.alunni += 1;
                                count += 1;
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
            for (var i in listaClassi) {
                if (totale104 > 0) {
                    listaClassi[i].propIdeali.legge_104 += 1;
                    module.exports.distribuisciSe104(listaClassi[i].propIdeali.alunni);
                    listaClassi[i].propIdeali.alunni = settings.numero_alunni_con_104;
                    totale104 -= 1;
                }
                else {
                    break;
                }
            }
            listaClassi.sort(module.exports.sortProprietaIdeali("legge_104"));

            for (var i in listaClassi) {
                if (totale107 > 0) {
                    listaClassi[i].propIdeali.legge_107 += 1;
                    totale107 -= 1;
                } else {
                    break;
                }
            }

            var setRip = Math.round(totaleRip / listaClassi.length) > 0 ? Math.round(totaleRip / listaClassi.length) : 1;
            for (var i in listaClassi) {
                if (totaleRip > 0) {
                    if (totaleRip <= settings.gruppo_femmine) {
                        listaClassi[i].propIdeali.ripetenti += setRip;
                        totaleRip = 0;
                        break;
                    } else {
                        listaClassi[i].propIdeali.ripetenti += setRip;
                        totaleRip -= setRip;
                    }
                }
            }

            for (var i in listaClassi) {
                if (totaleFem > 0) {
                    if (totaleFem <= settings.gruppo_femmine) {
                        listaClassi[i].propIdeali.femmine += totaleFem;
                        totaleFem = 0;
                        break;
                    } else {
                        listaClassi[i].propIdeali.femmine += settings.gruppo_femmine;
                        totaleFem -= settings.gruppo_femmine;
                    }
                }
            }

            for (var i in listaClassi) {
                for (var k in naz) {
                    if (listaClassi[i].propIdeali.nazionalita[k] === undefined) {
                        listaClassi[i].propIdeali.nazionalita[k] = 0;
                    }

                    if (naz[k] <= settings.gruppo_nazionalita) {
                        listaClassi[i].propIdeali.nazionalita[k] += naz[k];
                        delete naz[k];
                    } else {
                        listaClassi[i].propIdeali.nazionalita[k] += settings.gruppo_nazionalita;
                        naz[k] -= settings.gruppo_nazionalita;
                    }

                    if (Object.keys(listaClassi[i].propIdeali.nazionalita).length == settings.gruppo_nazionalita_per_classe) {
                        break;
                    }
                }
            }

            for (var i in listaClassi) {
                var nAlcap = 0;
                var temp = 0;
                for (var k in cap) {
                    if (listaClassi[i].propIdeali.cap[k] === undefined) {
                        listaClassi[i].propIdeali.cap[k] = 0;
                    }

                    if (nAlcap + settings.gruppo_cap > listaClassi[i].propIdeali.alunni) {
                        temp = (listaClassi[i].propIdeali.alunni - nAlcap);
                    } else {
                        temp = settings.gruppo_cap;
                    }

                    if (cap[k] <= settings.gruppo_cap) {
                        listaClassi[i].propIdeali.cap[k] += cap[k];
                        nAlcap += cap[k];
                        delete cap[k];
                    } else {
                        listaClassi[i].propIdeali.cap[k] += temp;
                        cap[k] -= temp;
                        nAlcap += temp;

                        if (cap[k] == 1){
                            listaClassi[i].propIdeali.cap[k] += cap[k];
                            nAlcap += cap[k];
                            delete cap[k];
                        }
                    }

                    if (nAlcap >= listaClassi[i].propIdeali.alunni) {
                        break;
                    }
                }
            }

            for (var k in voti) {
                var distrVoto = Math.round(voti[k] / listaClassi.length) > 0 ? Math.round(voti[k] / listaClassi.length) : 1;

                for (var i in listaClassi) {
                    if (listaClassi[i].propIdeali.voto[k] === undefined) {
                        listaClassi[i].propIdeali.voto[k] = 0;
                    }

                    if (voti[k] <= distrVoto) {
                        listaClassi[i].propIdeali.voto[k] += voti[k];
                        delete voti[k];
                        break;
                    } else {
                        listaClassi[i].propIdeali.voto[k] += distrVoto;
                        voti[k] -= distrVoto;
                    }
                }

            }
            voti, cap = module.exports.validaPropIdeali(voti, cap);

            if (totale104 == 0 && totale107 == 0 && Object.keys(naz).length == 0 && Object.keys(voti).length == 0 &&
                totaleFem == 0 && Object.keys(cap).length == 0) {
                flag = false;
            }
        }

        listaClassi.sort(module.exports.sortClassiOrdAlf());

        module.exports.popolaClassi();

        //todo
        module.exports.fixEverithing();

        //console.log(listaAlunniDeleted);

        return listaClassi;
    },

    /**
     * Work in progess
     */
    fixEverithing: function () {
        for (i in listaClassi) {
            var classe = listaClassi[i];
            var propIdeali = classe.propIdeali;
            var propAttuali = classe.propAttuali;
            if (propAttuali.legge_104 == 0) {
            }
        }
    },


    /**
     * Torna lista alunni di  una classe
     * @param nomeClasse
     * @returns {}
     */
    getListaAlunniByClasse: function (nomeClasse) {
        for (var i in listaClassi) {
            if (listaClassi[i].nome == nomeClasse) {
                return listaClassi[i].alunni;
            }
        }
    },

    getDistribuzioneProvenienzaOfClasse: function (className) {
        var jsonProvenienza = {};
        var alunniOfClasse = module.exports.getListaAlunniByClasse(className);

        for (var studente = 0; studente < alunniOfClasse.length; studente++) {
            var cap = alunniOfClasse[studente].cap;
            if (jsonProvenienza[cap] === undefined) {
                jsonProvenienza[cap] = 1;
            }
            else jsonProvenienza[cap] = jsonProvenienza[cap] + 1;
        }


        return jsonProvenienza;
    }

    ,

    getDistribuzioneStranieriOfClasse: function (className) {
        var jsonStranieri = {};
        var alunniOfClasse = module.exports.getListaAlunniByClasse(className);

        for (var studente = 0; studente < alunniOfClasse.length; studente++) {
            var nazionalita = alunniOfClasse[studente].nazionalita;
            if (jsonStranieri[nazionalita] === undefined) {
                jsonStranieri[nazionalita] = 1;
            }
            else jsonStranieri[nazionalita] = jsonStranieri[nazionalita] + 1;
        }


        return jsonStranieri;
    }

    ,


    /**
     * Crea un oggetto che rappresenta la distribuzione dei voti della classe
     * @param nomeClasse
     * @returns {{}}
     */
    getDistribuzioneVotiOfClasse: function (className) {

        var jsonVoti = {};
        var alunniOfClasse = module.exports.getListaAlunniByClasse(className);

        for (var studente = 0; studente < alunniOfClasse.length; studente++) {
            var voto = alunniOfClasse[studente].voto;
            if (jsonVoti[voto] === undefined) jsonVoti[voto] = 1;
            else jsonVoti[voto] = jsonVoti[voto] + 1;
        }

        if (jsonVoti[6] === undefined) jsonVoti[6] = 0;
        if (jsonVoti[7] === undefined) jsonVoti[7] = 0;
        if (jsonVoti[8] === undefined) jsonVoti[8] = 0;
        if (jsonVoti[9] === undefined) jsonVoti[9] = 0;
        if (jsonVoti[10] === undefined) jsonVoti[10] = 0;

        return jsonVoti;
    }
    ,

    /**
     * createProprietaClasse crea le propAttuali di una classe
     * @param nomeClasse
     * @returns {{alunni: *, sesso: (*|Number), media: *, residenza: (*|Array), bocciati: (*|number), iniziale: *}}
     */
    createProprietaClasse: function (nomeClasse) {

        var listaAlunniClasse = module.exports.getListaAlunniByClasse(nomeClasse);

        var nAlunni = listaAlunniClasse.length;
        var nFemmine = module.exports.countFemmine(listaAlunniClasse);
        var voti = module.exports.getDistribuzioneVotiOfClasse(nomeClasse);
        var residenza = module.exports.getDistribuzioneProvenienzaOfClasse(nomeClasse);
        var ripetenti = module.exports.countRipetenti(listaAlunniClasse);
        var nazionalita = module.exports.getDistribuzioneStranieriOfClasse(nomeClasse);
        var legge_104 = module.exports.count104(listaAlunniClasse);
        var legge_107 = module.exports.count107(listaAlunniClasse);

        for (var classe in listaClassi) {
            if (listaClassi[classe].nome == nomeClasse) {
                listaClassi[classe].propAttuali = {
                    alunni: nAlunni,
                    femmine: nFemmine,
                    voto: voti,
                    cap: residenza,
                    ripetenti: ripetenti,
                    nazionalita: nazionalita,
                    legge_104: legge_104,
                    legge_107: legge_107
                }
            }
        }

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
    }
    
    ,

    /**
     * countRipetenti ritorna il numero di ripetenti della classe param
     * @param listaAlunniClasse
     * @returns {number}
     */
    countRipetenti: function (listaAlunniClasse) {
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].classe_precedente != "") {
                count++;
            }
        }

        return count;
    },
    
    
    
   

    count104: function (listaAlunniClasse) {
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].legge_104 != "") {
                count++;
            }
        }
        return count;
    },

    count107: function (listaAlunniClasse) {
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].legge_107 != "") {
                count++;
            }
        }
        return count;
    },


    
    

    setListaClassi: function (lC) {
        listaClassi = lC;
    },

    setInsiemi: function (ins) {
        insiemi = ins;
    },

    getListaClassi: function () {
        return listaClassi;
    },

    /**
     * findInsiemeFromString data una stringa ritorna l'oggetto insieme corrispondente
     * @param nomeInsieme,insiemi
     * @returns {*}
     */
    findInsiemeFromString: function (nomeInsieme, insiemi) {
        for (var k = 0; k < insiemi.length; k++) {
            if (insiemi[k].nome == nomeInsieme) {
                return insiemi[k];
            }
        }
        return null;
    },
    
   
    //##################################################################################################################
    /**------------------------------------------------FINE UTILITY---------------------------------------------------*/
    //##################################################################################################################

    saveClassiOnDb: function (listaClassi) {
      // listaClassi.forEach(function (classe) {
      //     classe.forEach(function (alunni) {
      //
      //     });
      // });

    }
};