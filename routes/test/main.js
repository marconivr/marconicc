"use strict";

const _ = require("lodash");
const data = require("./data");

const settings = data.settings;
const alunni = data.alunni;
const classi = data.classi;


function mergeNazAndCapBySex(sesso, alunni) {
    alunni = _.filter(alunni, function (alunno) {
        if (alunno.sesso.toLowerCase() === sesso.toLowerCase()) return alunno;
    });

    alunni = _.groupBy(alunni, function (alunno) {
        return alunno.nazionalita;
    });

    _.forEach(alunni, function (value, key) {
        alunni[key] = _.groupBy(alunni[key],function (alunno) {
            return alunno.cap;
        });

        var cont = 0;
        for (var i in alunni[key]){
            cont += alunni[key][i].length;
        }
        alunni[key].alunniTotali = cont;
    });

    return alunni;
}

function mergeCapAndNazBySex(sesso, alunni) {
    alunni = _.filter(alunni, function (alunno) {
        if (alunno.sesso.toLowerCase() === sesso.toLowerCase()) return alunno;
    });

    alunni = _.groupBy(alunni, function (alunno) {
        return alunno.cap;
    });

    _.forEach(alunni, function (value, key) {
        alunni[key] = _.groupBy(alunni[key],function (alunno) {
            return alunno.nazionalita;
        });

        var cont = 0;
        for (var i in alunni[key]){
            cont += alunni[key][i].length;
        }
        alunni[key].alunniTotali = cont;
    });

    return alunni;
}




function aggiornaPropietaAttuali(alunni) {

    var n_femmine = _(_.filter(alunni, function (o) {
        if (o.sesso.toLowerCase() === "f") {
            return o.sesso
        }

    })).size();

    var nazionalita = _.countBy(alunni, function (o) {
        return o.nazionalita;
    });

    var cap = _.countBy(alunni, function (o) {
        return o.cap;
    });

    var voto = _.countBy(alunni, function (o) {
        return o.voto;
    });

    var n_legge_107 = _(_.filter(alunni, function (item) {
        if (item.legge_107 !== "") {
            return item;
        }
    })).size();

    var n_legge_104 = _(_.filter(alunni, function (item) {
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


function fixFemmine(alunni) {
    var femmineMerged = mergeNazAndCapBySex("f", alunni);
    //var ris = mergeCapAndNazBySex("f",alunni);

    var gruppo = settings.gruppo_femmine;

    var ris = [];

    while (gruppo !== 0){
        for (var i in femmineMerged){
            for (var k in femmineMerged[i]){
                if (femmineMerged[i][k].constructor === Array){
                    if (femmineMerged[i][k].length > 0){
                        var gruppoAlunni = femmineMerged[i][k];
                        if(gruppoAlunni.length <= gruppo){
                            //il gruppo che trovo lo posso inserire tutto
                            ris.concat(gruppoAlunni);
                            gruppo -= gruppoAlunni.length;
                            femmineMerged[i].alunniTotali -= gruppoAlunni.length;
                            delete femmineMerged[i][k];
                            if(gruppo === 0){
                                return ris;
                            }
                        }else{
                            //il gruppo che trovo è più grande dei setting max
                            var max = gruppo;
                            gruppoAlunni = gruppoAlunni.slice(0, max);

                            ris.concat(gruppoAlunni);
                            gruppo -= gruppoAlunni.length;
                            femmineMerged[i].alunniTotali -= gruppoAlunni.length;

                            femmineMerged[i][k].splice(0,max);
                            if(gruppo === 0){
                                return ris;
                            }
                        }

                    }
                }
            }
        }
    }

}

_.forEach(classi, function (classe) {
    var nomeClasse = classe.nome;
    var alunniClasse = classe.alunni;

    alunniClasse = fixFemmine(alunni);
    var b = 0;

});




var debug = true;


//
//
//
//
//
//
// //INIZIO POPOLAZIONE INSIEME
// var legge_104 = _.filter(app, function (item) {
//     if (item.legge_104 !== "") {
//         return item;
//     }
// });
//
// var legge_107 = _.filter(app, function (item) {
//     if (item.legge_107 !== "") {
//         return item;
//     }
// });
//
// var femmine = _.filter(app, function (item) {
//     if ((item.sesso).toLowerCase() === "f") {
//         return item;
//     }
// });
//
// var cap = _.groupBy(app, function (obj) {
//     return obj.cap;
// });
//
// var nazionalita = _.groupBy(app, function (obj) {
//     return obj.nazionalita;
// });
//
// var voto = _.groupBy(app, function (obj) {
//     return obj.voto;
// });
//
// //FINE POPOLAZIONE INSIEMI
//
// /**
//  * Aggiorna dato l'oggetto della classe le suw proprietà in base agli alunni che contiene
//  * @param classe
//  */

//
//
// function fixFemmine() {
//     const gruppo_femmine = settings.gruppo_femmine;
//
//     var array_gruppi_femmine = _.chunk(femmine, gruppo_femmine);
//
//     var i = 0;
//     var lenght = array_gruppi_femmine.length;
//     while (lenght !== 0) {
//         var alunni = listaClassi[i].alunni;
//         alunni = _.union(alunni, array_gruppi_femmine[i]);
//         listaClassi[i].alunni = alunni;
//         for (var i in alunni){
//             var amico = checkDesideta(alunni[i]);
//             if(amico !== null){
//                 listaClassi[i].alunni.push(amico);
//                 _.remove(femmine, function(obj) {
//                     return obj.cf = amico.cf ;
//                 });
//                 listaClassi[i].alunni.push(amico);
//                 aggiornaPropietaAttuali(listaClassi[i]);
//             }
//
//         }
//         aggiornaPropietaAttuali(listaClassi[i]);
//         i++;
//         lenght--;
//         if (i >= listaClassi.length) {
//             i = 0;
//         }
//     }
//
// }
//
// function popolaObjAiuto(alunno, obj) {
//     var flag = false;
//     for (var o in obj.CAP) {
//         if (alunno.CAP == obj.CAP[o]) {
//             obj.CAP[o] += 1;
//             flag = true;
//         }
//     }
//     if (!flag) obj.CAP[alunno.CAP] = 1;
//
//     flag = false;
//     for (var n in obj.nazionalita) {
//         if (alunno.nazionalita == obj.nazionalita[n]) {
//             obj.nazionalita[n] += 1;
//             flag = true;
//         }
//     }
//     if (!flag) obj.nazionalita[alunno.nazionalita] = 1;
//     return obj;
// }
//
// function removeFromObjAiuto(alunno, obj) {
//     if (obj.CAP[alunno.CAP] > 1) {
//         obj.CAP[alunno.CAP] -= 1;
//     } else {
//         delete obj.CAP[alunno.CAP];
//     }
//     if (obj.nazionalita[alunno.nazionalita] > 1) {
//         obj.nazionalita[alunno.nazionalita] -= 1;
//     } else {
//         delete obj.nazionalita[alunno.nazionalita];
//     }
//     return obj;
// }
//
//
// function validaPropietaAttuali(classe) {
//     var propAttuali = classe.propAttuali;
//
//     var valido = true;
//
//     //aggiungere il fatto se i 104 sono più delle classi
//     if (propAttuali.n_legge_104 > 1) {
//         valido = false;
//     }
//
//     if (propAttuali.n_legge_104 > 0 && propAttuali.n_legge_107 > 0) {
//         valido = false;
//     }
//
//     if (propAttuali.n_legge_104 > 0 && classe.alunni.length > settings.numero_alunni_con_104) {
//         valido = false;
//     }
//
//     if (classe.alunni.length > settings.max_alunni) {
//         valido = false;
//     }
//
//
//     //NAZIONALITA
//
//     _.forOwn(propAttuali.nazionalita, function (value, key) {
//         if (value > settings.gruppo_nazionalita && key.toLowerCase() !== "italiana") {
//             valido = false;
//         }
//     });
//
//     var num_nazionalita = Object.keys(propAttuali.nazionalita).length;
//     if (num_nazionalita > settings.nazionalita_per_classe) {
//         valido = false;
//     }
//     //FINE NAZIONALITA
//
//
//     //CAP
//
//     _.forOwn(propAttuali.cap, function (value, key) {
//         if (value > settings.gruppo_cap) {
//             valido = false;
//         }
//     });
//
//
//     //FINE CAP
//
//
//     return valido;
//
// }
//
// function validaPropietaAttualiConObj(classe, obj) {
//     var propAttuali = classe.propAttuali;
//
//     var valido = true;
//
//     //aggiungere il fatto se i 104 sono più delle classi
//     if (propAttuali.n_legge_104 > 1) {
//         valido = false;
//     }
//
//     if (propAttuali.n_legge_104 > 0 && propAttuali.n_legge_107 > 0) {
//         valido = false;
//     }
//
//     if (propAttuali.n_legge_104 > 0 && classe.alunni.length > settings.numero_alunni_con_104) {
//         valido = false;
//     }
//
//     if (classe.alunni.length > settings.max_alunni) {
//         valido = false;
//     }
//
//
//     //NAZIONALITA
//
//     _.forOwn(propAttuali.nazionalita, function (value, key) {
//         if (value > settings.gruppo_nazionalita && key.toLowerCase() !== "italiana") {
//             valido = false;
//         }
//     });
//
//
//     var cap = "37039";
//
//     var diz = _.countBy(propAttuali.cap, function (o) {
//         return o.cap;
//     });
//
//     console.log("a");
//
//
//     var num_nazionalita = Object.keys(propAttuali.nazionalita).length;
//     if (num_nazionalita > settings.nazionalita_per_classe) {
//         valido = false;
//     }
//     //FINE NAZIONALITA
//
//
//     //CAP
//
//     _.forOwn(propAttuali.cap, function (value, key) {
//         if (value > settings.gruppo_cap) {
//             valido = false;
//         }
//     });
//
//
//     //FINE CAP
//
//
//     return valido;
//
// }
//
// _.each(listaClassi, function (o) {
//     aggiornaPropietaAttuali(o);
// });
//
//
// alunni = _.union(legge_104, legge_107);
// //tolgo le femmini perchè verranno inserite dal fix
// alunni = _.filter(alunni, function (o) {
//     if (o.sesso.toLowerCase() === "m") {
//         return o;
//     }
// });
//
// var i = 0;
// fixFemmine();
//
//
// for (var o in alunni) {
//
//     while (i < listaClassi.length) {
//         var classe = listaClassi[i];
//         classe.alunni.push(alunni[o]);
//         aggiornaPropietaAttuali(classe);
//         if (!validaPropietaAttuali(classe)) {
//             classe.alunni.pop();
//             i++;
//         } else {
//             i++;
//             var amico = checkDesiderata(alunni[o]);
//             if(amico !== null){
//                 classe.alunni.push(amico);
//                 _.remove(alunni, function(obj) {
//                     return obj.cf = amico.cf ;
//                 });
//                 aggiornaPropietaAttuali(classe);
//             }
//
//             delete alunni[o];
//             break;
//         }
//     }
//     if (i === listaClassi.length) {
//         i = 0;
//     }
// }
//
//
// var alunniRimanenti = _.filter(app, function (obj) {
//     if(obj.sesso.toLowerCase() === "m" && obj.legge_107 === "" && obj.legge_104 === ""){
//         return obj;
//     }
// });
//
//
//
//
// var countNaz = _.countBy(alunniRimanenti,function (obj){
//     return obj.nazionalita;
// });
//
// var countCap = _.countBy(alunniRimanenti,function (obj){
//     return obj.cap;
// });
//
//
//
//
// function checkRimanenti(countObj,param) {
//     if (param === "naz"){
//         for (i in countObj){
//             if((countObj[i] - settings.gruppo_nazionalita) >= 0 && i.toLowerCase() !== "italiana"){
//                 return true
//             }
//         }
//         return false
//     }
//
//     if (param === "cap"){
//         for (i in countObj){
//             if((countObj[i] - settings.gruppo_cap) >= 0){
//                 return true
//             }
//         }
//         return false
//     }
//
//
// }
//
// var risNaz = {};
//
// while(true){
//     if(checkRimanenti(countNaz,"naz")){
//         for (var i in countNaz) {
//
//             if((countNaz[i] - settings.gruppo_nazionalita) >= 0 && i.toLowerCase() !== "italiana"){
//                 if(risNaz[i] === undefined){
//                     risNaz[i] = [];
//                     risNaz[i].push(settings.gruppo_nazionalita);
//                     countNaz[i] -= settings.gruppo_nazionalita;
//
//                 }else{
//                     risNaz[i].push(settings.gruppo_nazionalita);
//                     countNaz[i] -= settings.gruppo_nazionalita;
//                 }
//             }if(countNaz[i] === 1 && i.toLowerCase() !== "italiana"){
//
//                 if(risNaz[i] === undefined){
//                     risNaz[i] = [];
//                     risNaz[i].push(1);
//                     countNaz[i] -= 1;
//
//                 }else{
//                     risNaz[i][0]+= 1;
//                     countNaz[i] -= 1;
//                 }
//
//             }
//
//         }
//     }else{
//         break;
//     }
// }
//
//
// var risCap = {};
//
//
// while(true){
//     if(checkRimanenti(countCap,"cap")){
//         for (var i in countCap) {
//
//             if((countCap[i] - settings.gruppo_cap) >= 0){
//                 if(risCap[i] === undefined){
//                     risCap[i] = [];
//                     risCap[i].push(settings.gruppo_cap);
//                     countCap[i] -= settings.gruppo_cap;
//
//                 }else{
//                     risCap[i].push(settings.gruppo_cap);
//                     countCap[i] -= settings.gruppo_cap;
//                 }
//             }if(countCap[i] === 1 ){
//
//                 if(risCap[i] === undefined){
//                     risCap[i] = [];
//                     risCap[i].push(1);
//                     countCap[i] -= 1;
//
//                 }else{
//                     risCap[i][0]+= 1;
//                     countCap[i] -= 1;
//                 }
//
//             }
//
//         }
//     }else{
//         break;
//     }
// }
//
//
//
// function checkDesiderata(objStudente){
//     var amico = _.filter(app,function (obj) {
//         if (objStudente.desiderata === obj.cf){
//             return obj;
//         }
//     });
//
//     amico = amico[0];
//
//     if(amico == undefined){
//         return null;
//     }
//     if(amico.desiderata === objStudente.cf){
//         return amico;
//     }else{
//         return null;
//     }
// }
//
//
//
//
//
// for (i = 0; i < listaClassi.length; i++) {
//     var classe = listaClassi[i];
//     var alunni = listaClassi[i].alunni;
//
//     var limiteAlunni = 0;
//
//     if (classe.propAttuali.n_legge_104 > 0){
//         limiteAlunni = settings.numero_alunni_con_104 - alunni.length;
//     }else{
//         limiteAlunni = settings.max_alunni - alunni.length;
//     }
//
//     while (limiteAlunni !== 0){
//
//         var propAttualiNaz = classe.propAttuali.nazionalita;
//
//         var nNazClasse =  Object.keys(propAttualiNaz).length;
//
//         if(propAttualiNaz["ITALIANA"] !== undefined){
//             nNazClasse -= 1;
//         }
//
//         if(nNazClasse >= settings.nazionalita_per_classe){
//             //classi che superano il limite quindi devo popolarli con gente della stessa nazionalità
//             for(var naz in propAttualiNaz){
//                 if(naz.toLowerCase() !== "italiana" ){
//                     if(risNaz[naz] !== undefined){
//                         if(risNaz[naz].length > 0){
//                             var gruppetto = risNaz[naz][0];
//                             var somma = propAttualiNaz[naz] += gruppetto;
//                             if (somma  >= (settings.gruppo_nazionalita * 2)){
//                                 risNaz[naz].shift();
//                                 limiteAlunni -= gruppetto;
//                             }
//                         }
//                     }
//
//                 }
//             }
//
//             limiteAlunni = 0;
//
//         }else{
//             var rimantenti = settings.nazionalita_per_classe - nNazClasse;
//
//             while (rimantenti !== 0){
//                 for(var naz in risNaz){
//                     if (propAttualiNaz[naz] === undefined){
//                         if(risNaz[naz].length > 0){
//                             propAttualiNaz[naz] = risNaz[naz].shift();
//                             rimantenti--;
//                             break
//                         }
//
//                     }
//                 }
//                 limiteAlunni = 0;
//
//             }
//
//
//         }
//
//     }
//
// }
//
//
// var filtroFemmine = _.filter(listaClassi, function (classe) {
//     if (classe.propAttuali.femmine < 4 && classe.propAttuali.femmine !== 0) {
//         return classe
//     }
// });
//
// var filtro104Limite = _.filter(listaClassi, function (classe) {
//     if (classe.propAttuali.n_legge_104 === 1 && classe.propAttuali.n_alunni === 23) {
//         return classe
//     }
// });
//
//
// var filtro104MaxNum = _.filter(listaClassi, function (classe) {
//     if (classe.propAttuali.n_legge_104 > 1) {
//         return classe
//     }
// });
//
// if (_(_.union(filtroFemmine, filtro104Limite, filtro104MaxNum)).size() === 0) {
//     console.log("TUTTO OK");
// }
//
