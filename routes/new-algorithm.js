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
    stessa_pr: 3,
    nazionalita: 3,
    naz_per_classe: 3,
    max_al_104: 23,
    max_107: 2,
    max_104: 1,
    boc: 2,
    an_scol: "2017-2018"
};

var priority = ["alunni", "legge_104", "legge_107", "desiderata", "ripetenti", "femmine", "nazionalita", "CAP", "voto"];

var listaAlunni = [];
var listaAlunniDeleted = [];
var insiemi = [];
var listaClassi = []; //esempio [{nome:"1AI", propAttuali:{alunni:23, femmine:2}, alunni:[{nome:"Mario", cognome:"Rossi"}]}]

module.exports = {
    /**
     * GeneraClassi prima generazione con le operazioni che seguono
     * @param classe
     * @param callback
     */
    generaClassiPrima: function (callback) {
        query.getStudentiPrima(function (err, results) {
            if (err)
                throw err;
            else {
                async.waterfall(
                    [
                        function (callback) {
                            //pulisco gli array per chiamate successive
                            listaClassi = [];
                            listaAlunni = [];
                            listaAlunniDeleted = [];
                            insiemi = [];
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

        query.getStudentiPrima(function (err, results) {
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
                            case "CAP":
                                if (!(module.exports.isAttributeInsideObject(ins.alunni, listaAlunni[i].CAP))) {
                                    ins.alunni[listaAlunni[i].CAP] = [];
                                }
                                ins.alunni[listaAlunni[i].CAP].push(listaAlunni[i]);
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
    generaListaClassi: function (classe) {
        if (classe.toLowerCase() == "prima") {
            var num = Math.round(listaAlunni.length / (settings.min_al));
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
        }
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
    shuffleArray: function(array) {
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
            if (insiemi[item].nome == "nazionalita" || insiemi[item].nome == "CAP" || insiemi[item].nome == "voto") {
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
            if (listaAlunni[i].cf == cf) {
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

        if (objStudente != undefined) {
            if (objStudente.desiderata != "") {


                var cf = objStudente.cf;
                var cfAmico = objStudente.desiderata;

                var objAmico = module.exports.findAlunnoByCf(cfAmico);


                if (objAmico.desiderata == cf) {
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
        if (prop === "legge_104" || prop === "legge_107" || prop === "femmine" || prop === "ripetenti" ) {
            for (var ins in insiemi){
                if (insiemi[ins].nome === prop){
                    var insieme = insiemi[ins];
                    var studenti = insieme.alunni;
                    var ris = { alunno4 : null , alunno3 : null , alunno2 : null, alunno1 : null };
                    for (var i in studenti) {
                        if (propIdeali[studenti[i].nazionalita] !== undefined || studenti[i].nazionalita === "ITALIANA") {
                            ris.alunno2 = studenti[i];
                            if (propIdeali[studenti[i].CAP] !== undefined) {
                                ris.alunno3 = studenti[i];
                                if (propIdeali[studenti[i].voto] !== undefined) {
                                    ris.alunno4 = studenti[i];
                                }
                            }
                        }
                        ris.alunno1 = studenti [i];
                    }

                    if (ris.alunno4 !== null){
                        return ris.alunno3;
                    }
                    if (ris.alunno3 !== null){
                        return ris.alunno3;
                    }
                    if (ris.alunno2 !== null){
                        return ris.alunno2;
                    }
                    if (ris.alunno1 !== null){
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
        for (var i in listaClassi) {

            var classeInEsame = listaClassi[i];
            module.exports.createProprietaClasse(classeInEsame.nome); //genero le propietà attuali della classe

            var proprietaIdeali = classeInEsame.propIdeali;
            var proprietaAttuali = classeInEsame.propAttuali;

            //aggiungo 104 se c'è ne bisogno
            for (var item in insiemi) {
                var prop = insiemi[item].nome;
                console.log(item + ", " + prop);
                if (prop == "legge_104") {
                    while (proprietaIdeali.legge_104 > proprietaAttuali.legge_104 && proprietaIdeali.alunni > proprietaAttuali.alunni) {
                        var studente = module.exports.findAlunnoIdeale(proprietaIdeali, prop);
                        if (studente === undefined){
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
                    while (proprietaIdeali.legge_107 > proprietaAttuali.legge_107  && proprietaIdeali.alunni > proprietaAttuali.alunni) {

                        studente = module.exports.findAlunnoIdeale(proprietaIdeali,prop);

                        if (studente === undefined){
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

                    while (proprietaIdeali.femmine > proprietaAttuali.femmine  && proprietaIdeali.alunni > proprietaAttuali.alunni) {
                        studente = module.exports.findAlunnoIdeale(proprietaIdeali,prop);
                        if (studente === undefined){
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
                        while (proprietaIdeali.voto[voto] > proprietaAttuali.voto[voto]  && proprietaIdeali.alunni > proprietaAttuali.alunni) {

                            studente = insiemi[item].alunni[voto][0];

                            if (studente === undefined){
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
                    for (var nazionalita in proprietaIdeali.nazionalita  && proprietaIdeali.alunni > proprietaAttuali.alunni) {

                        while (proprietaIdeali.nazionalita[nazionalita] > proprietaAttuali.nazionalita[nazionalita]) {

                            studente = insiemi[item].alunni[nazionalita][0];

                            if (studente === undefined){
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

                else if (prop == "CAP") {
                    for (var CAP in proprietaIdeali.CAP  && proprietaIdeali.alunni > proprietaAttuali.alunni) {
                        while (proprietaIdeali.CAP[CAP] > proprietaAttuali.CAP[CAP]) {
                            studente = insiemi[item].alunni[CAP][0];

                            if (studente === undefined){
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

        if (module.exports.thereIsStundentiInInsiemi()){
            //console.log("È true");
            for (var lista in listaClassi){
                //console.log(listaClassi[lista].nome + ": ideale --> " + listaClassi[lista].propIdeali.voto['10'] + " attuale--> " + listaClassi[lista].propAttuali.voto['10']);
                //console.log(listaClassi[lista].propIdeali.alunni)
            }
            //module.exports.popolaClassiRimanente();
        }
        //console.log(insiemi);
    },

    thereIsStundentiInInsiemi: function () {
        for (var i in insiemi){
            for (var k in insiemi[i].alunni){
                if (Array.isArray(insiemi[i].alunni[k])){
                    if (insiemi[i].alunni[k].length > 0){
                        return true;
                    }
                } else{
                    if (insiemi[i].alunni.length > 0){
                        return true;
                    }
                }
            }
        }
        return false;
    },

    inizializzaPropIdeali: function(){
        var count = 0;
        for (var i = 0; i < listaClassi.length; i++){
            listaClassi[i].propIdeali.alunni = settings.min_al;
            count += settings.min_al;
            listaClassi[i].propIdeali.legge_104 = 0;
            listaClassi[i].propIdeali.legge_107 = 0;
            listaClassi[i].propIdeali.ripetenti = 0;
            listaClassi[i].propIdeali.femmine = 0;
            listaClassi[i].propIdeali.CAP = {};
            listaClassi[i].propIdeali.voto = {};
            listaClassi[i].propIdeali.nazionalita = {};
            if (count < listaAlunni.length){
                listaClassi[listaClassi.length - 1].propIdeali.alunni += listaAlunni.length - count;
            }
        }
    },

    distribuisciSe104: function (numAlunniCl) {
        var num = numAlunniCl - settings.max_al_104;
        for (var i = 0; i < listaClassi.length; i++){
            if (num > 0){
                if (listaClassi[i].propIdeali["legge_104"] == 0){
                    listaClassi[i].propIdeali["alunni"] += 1;
                    num -= 1;
                }
            } else{
                break;
            }
        }
    },

    validaPropIdeali: function (voti, cap) {

        var countInObject = function(obj) {
            var ris = 0;
            for (var v in obj){
                ris += obj[v];
            }
            return ris;
        }

        for (var i in listaClassi){
            var nvoti = 0;

            for (var k in listaClassi[i].propIdeali.voto){
                nvoti +=  listaClassi[i].propIdeali.voto[k];
            }

            if (nvoti > listaClassi[i].propIdeali.alunni){
                listaClassi[i].propIdeali.voto['7'] = nvoti - listaClassi[i].propIdeali.alunni;
                voti['7'] += nvoti - listaClassi[i].propIdeali.alunni;
            }
        }
        if (Object.keys(voti).length > 0){
            module.exports.sortProprietaIdeali("alunni");

            for (var i = listaClassi.length - 1; i >= 0; i--){

                for (var v = Object.keys(voti).length - 1; v >= 0; v--){
                    var nVC = countInObject(listaClassi[i].propIdeali.voto);
                    if (listaClassi[i].propIdeali.alunni > nVC){
                        if (voti[Object.keys(voti)[v]] > listaClassi[i].propIdeali.alunni - nVC){
                            listaClassi[i].propIdeali.voto[Object.keys(voti)[v]] += listaClassi[i].propIdeali.alunni - nVC;
                            voti[Object.keys(voti)[v]] -= listaClassi[i].propIdeali.alunni - nVC;
                        } else{
                            listaClassi[i].propIdeali.voto[Object.keys(voti)[v]] += voti[Object.keys(voti)[v]];
                            delete voti[Object.keys(voti)[v]];
                        }
                    }
                }
            }
        }
        //#########################################################################################################
        for (var i in listaClassi){
            var ncap = 0;

            for (var k in listaClassi[i].propIdeali.CAP){
                ncap +=  listaClassi[i].propIdeali.CAP[k];
            }

            if (ncap > listaClassi[i].propIdeali.alunni){
                for (var k in listaClassi[i].propIdeali.CAP){
                    listaClassi[i].propIdeali.CAP[k] -= 1;

                    if (cap[k] === undefined)   cap[k] = 1;
                    else    cap[k] += 1;
                    ncap -= 1;
                    if (ncap == listaClassi[i].propIdeali.alunni) break;
                }
            }
        }

        if (Object.keys(cap).length > 0){
            module.exports.sortProprietaIdeali("alunni");

            for (var i = listaClassi.length - 1; i >= 0; i--){
                var nCAP = countInObject(listaClassi[i].propIdeali.CAP);
                if (listaClassi[i].propIdeali.alunni > nCAP){
                    for (var v = Object.keys(cap).length - 1; v >= 0; v--){
                        if (listaClassi[i].propIdeali.CAP[Object.keys(cap)[v]] === undefined){
                            listaClassi[i].propIdeali.CAP[Object.keys(cap)[v]] = 0;
                        }
                        if (cap[Object.keys(cap)[v]] > listaClassi[i].propIdeali.alunni - nCAP){
                            listaClassi[i].propIdeali.CAP[Object.keys(cap)[v]] += listaClassi[i].propIdeali.alunni - nCAP;
                            cap[Object.keys(cap)[v]] -= listaClassi[i].propIdeali.alunni - nCAP;
                        } else{
                            listaClassi[i].propIdeali.CAP[Object.keys(cap)[v]] += cap[Object.keys(cap)[v]];
                            delete cap[Object.keys(cap)[v]];
                        }
                    }
                }
            }
        }
        //#########################################################################################################
        console.log(insiemi);
        return voti, cap;
    },

    generaPropIdeali: function () {
        var insNaz = module.exports.getInsieme("nazionalita").alunni;
        var insVoti = module.exports.getInsieme("voto").alunni;
        var insCAP = module.exports.getInsieme("CAP").alunni;

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

        for (var n in insCAP) {
            cap[n] = insCAP[n].length;
        }

        var flag = true;
        module.exports.inizializzaPropIdeali();

        while (flag) {
            for (var i in listaClassi) {
                var flag104 = true;
                if (totale104 > 0) {
                    listaClassi[i].propIdeali.legge_104 += 1;
                    if (flag104){
                        module.exports.distribuisciSe104(listaClassi[i].propIdeali.alunni);
                        listaClassi[i].propIdeali.alunni = settings.max_al_104;
                        flag104 = false;
                    }
                    totale104 -= 1;
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
                    if (totaleRip <= settings.fem) {
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
                    if (totaleFem <= settings.fem) {
                        listaClassi[i].propIdeali.femmine += totaleFem;
                        totaleFem = 0;
                        break;
                    } else {
                        listaClassi[i].propIdeali.femmine  += settings.fem;
                        totaleFem -= settings.fem;
                    }
                }
            }

            for (var i in listaClassi) {
                for (var k in naz) {
                    if (listaClassi[i].propIdeali.nazionalita[k] === undefined) {
                        listaClassi[i].propIdeali.nazionalita[k] = 0;
                    }

                    if (naz[k] <= settings.nazionalita) {
                        listaClassi[i].propIdeali.nazionalita[k] += naz[k];
                        delete naz[k];
                    } else {
                        listaClassi[i].propIdeali.nazionalita[k] += settings.nazionalita;
                        naz[k] -= settings.nazionalita;
                    }

                    if (Object.keys(listaClassi[i].propIdeali.nazionalita).length == settings.naz_per_classe) {
                        break;
                    }
                }
            }

            for (var i in listaClassi) {
                var nAlCAP = 0;
                var temp = 0;
                for (var k in cap) {
                    if (listaClassi[i].propIdeali.CAP[k] === undefined) {
                        listaClassi[i].propIdeali.CAP[k] = 0;
                    }

                    if (nAlCAP + settings.stessa_pr > listaClassi[i].propIdeali.alunni) {
                        temp = (listaClassi[i].propIdeali.alunni - nAlCAP);
                    } else {
                        temp = settings.stessa_pr;
                    }

                    if (cap[k] <= settings.stessa_pr) {
                        listaClassi[i].propIdeali.CAP[k] += cap[k];
                        nAlCAP += cap[k];
                        delete cap[k];
                    } else {
                        listaClassi[i].propIdeali.CAP[k] += temp;
                        cap[k] -= temp;
                        nAlCAP += temp;
                    }

                    if (nAlCAP >= listaClassi[i].propIdeali.alunni) {
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
            //voti, cap, ... =  module.exports.validaPropIdeali(voti, cap, ...);
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
    fixEverithing : function () {
        for (i in listaClassi){
            var classe = listaClassi[i];
            var propIdeali = classe.propIdeali;
            var propAttuali = classe.propAttuali;
            if (propAttuali.legge_104 == 0){}
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
            var cap = alunniOfClasse[studente].CAP;
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
                    CAP: residenza,
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
    },

    /**
     * mediaClasse calcola la media di una classe
     * @param listaAlunniClasse
     * @returns {number}
     */
    mediaClasse: function (listaAlunniClasse) {
        var somma = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            somma += Number(listaAlunniClasse[i].voto);
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

    countDesiderata: function (listaAlunniClasse) {
        var count = 0;

        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].desiderata.toLowerCase() != "") {
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
            if (listaAlunniClasse[i].classe_precedente != "") {
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
        for (var k = 0; k < listaClassi.length; k++) {
            for (var i = 0; i < listaClassi[k].alunni.length; i++) {
                if (listaClassi[k].alunni[i].classe_precedente[0] == "1") {
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
                    var objal = module.exports.searchAlunno("voto", module.exports.determinaVoto(classe), listaClassi[i].alunni);
                    if (objal != null) {
                        module.exports.addStundentInClss(objal, listaClassi[i], classe, true);
                    }
                }
            }
            if (classe.alunni.media > settings.media_min) {
                break;
            }
        }
    },

    fixDesiderata: function (nomeClasse) {
        var classe = module.exports.findClasseFromString(nomeClasse);
        var elencoDesiderataClasse = module.exports.elencoDesiderataInClass(classe.alunni);
        for (var cf in elencoDesiderataClasse) {
            for (var i = 0; i < listaClassi.length; i++) {
                var objal = module.exports.searchAlunno("cf", elencoDesiderataClasse[cf], listaClassi[i].alunni);

                if (objal != null) {
                    if (objal.desiderata == cf) {
                        module.exports.addStundentInClss(objal, listaClassi[i], classe, true);
                    }
                }
            }
        }
    },

    /**
     * delCerry
     * @param nomeClasse
     */
    fixStranieri: function (nomeClasse) {
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
    diverseNazionalita: function (listaAlunniClasse) {
        var ris = [];
        for (var i = 0; i < listaAlunniClasse.length; i++) {
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
        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i]["desiderata"].toLowerCase() != "") {
                ris[listaAlunniClasse[i]["cf"]] = listaAlunniClasse[i]["desiderata"];
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
            for (var naz in objNaz) {
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
     * fixRipetenti
     * @param nomeClasse
     */
    fixRipetenti: function (nomeClasse) {
        var num_ripetenti = Math.round(module.exports.countRipetentiTot() / listaClassi.length);
        var classe = module.exports.findClasseFromString(nomeClasse);  //classe in esame
        for (var i = 0; i < listaClassi.length; i++) {
            if (listaClassi[i].nome != nomeClasse) {
                if (module.exports.countRipetenti(classe.alunni) > num_ripetenti
                    && module.exports.countRipetenti(classe.alunni) > module.exports.countRipetenti(listaClassi[i].alunni)) {
                    var objal = module.exports.searchRipetente(classe.alunni);
                    if (objal != null) {
                        module.exports.addStundentInClss(objal, classe, listaClassi[i], true);
                    }
                }
            }
            if (module.exports.countRipetenti(classe.alunni) == num_ripetenti) {
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

    get104Classe: function (listaAlunniClasse) {
        var ris = [];
        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].legge_104 != "") {
                ris.push(listaAlunniClasse[i]);
            }
        }
        return ris;
    },

    fix104: function (nomeClasse) {
        var classe = module.exports.findClasseFromString(nomeClasse);
        while (classe.alunni.length > settings.max_al_104) {
            for (var i = 0; i < listaClassi.length; i++) {
                if (listaClassi[i].nome != nomeClasse) {
                    var objal = module.exports.searchAlunno("legge_104", "", classe.alunni);
                    if (objal != null) {
                        module.exports.addStundentInClss(objal, classe, listaClassi[i], true);
                    }
                }
                if (classe.alunni.length == settings.max_al_104) {
                    break;
                }
            }
        }
        /*
         var al104 = module.exports.get104Classe(classe.alunni);

         for (var k = 0; k < listaClassi.length; k++){
         for (var i = 0; i < al104.length; i++){
         if (al104.length > settings.max_104 && module.exports.count104(listaClassi[k].alunni) == 0){
         module.exports.addStundentInClss(al104[i], classe, listaClassi[k], true);
         }
         if (al104.length == settings.max_107)   break;
         }
         }
         */
    },

    get107Classe: function (listaAlunniClasse) {
        var ris = [];
        for (var i = 0; i < listaAlunniClasse.length; i++) {
            if (listaAlunniClasse[i].legge_107 != "") {
                ris.push(listaAlunniClasse[i]);
            }
        }
        return ris;
    },

    fix107: function (nomeClasse) {
        var classe = module.exports.findClasseFromString(nomeClasse);
        var al107 = module.exports.get107Classe(classe.alunni);
        var i = 0;
        for (var k = 0; k < listaClassi.length; k++) {
            for (var i = 0; i < al107.length; i++) {
                if (al107.length > settings.max_107 && (module.exports.count107(listaClassi[k].alunni) - 1) < settings.max_107
                    && module.exports.count104(listaClassi[k].alunni) == 0) {
                    module.exports.addStundentInClss(al107[i], classe, listaClassi[k], true);
                }
                if (al107.length == settings.max_107)   break;
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
            eN += objclasse.alunni[i].voto;
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
                console.log(listaAlunniClasse[i]["classe_precedente"]);
                return listaAlunniClasse[i];
            }
        }
        return null;
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
     * findClasseFromString data una stringa ritorna l'oggetto classe corrispondente
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