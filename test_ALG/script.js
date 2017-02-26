/**
 * listAlunni: lista di tutti gli alunni
 * listClass: lista di tutte le classi, ogni classe ha un nome e una lista di alunni.
 */
var listAlunni = [
    new Alunno('mario','rossi', 7, 'italiana', 'Bussolengo', '000'),
    new Alunno('sergio','franzogna',9, 'italiana', 'Verona', '001'),
    new Alunno('luigi','verdi', 6, 'tedesco', 'Belfiore', '002'),
    new Alunno('andrea','kniv', 6, 'Russo', 'Erbezzo', '003'),
    new Alunno('marco','sbel', 8, 'italiana', 'Belfiore', '004'),
    new Alunno('silvio','della riva', 8, 'italiana', 'Bussolengo', '005'),
    new Alunno('antonio','virgolis', 7, 'italiana', 'Verona', '006'),
    new Alunno('giovanni','piccoli', 6, 'italiana', 'Bosco', '007'),
    new Alunno('gianni','benji', 6, 'italiana', 'Velo', '008'),
    new Alunno('pierluigi','olly', 9, 'italiana', 'Erbezzo', '009')
];

var listClass = [{nome:"1AI", alunni:[]}, {nome:"1BI", alunni:[]}, {nome:"1VI", alunni:[]}];
//var impostazioni = {media:0, stranieri:0, studXClMin: 25, studXClMax:29, cognomiUg:3, cognomiSim:5, residUg:5}; // da settare da parte dell'utente (non tutti [stranieri, media])
var impostazioni = {media:0, stranieri:0, studXClMin: 3, studXClMax:5, cognomiUg:2, cognomiSim:4, residUg:3};
var clEsaurite = false;

/**
 * Costruttore di Alunno
 */

function Alunno(nome, cognome, media, nazionalita, residenza, cf){
    this.nome = nome;
    this.cognome = cognome;
    this.media = media;
    this.nazionalita = nazionalita;
    this.residenza = residenza;
    this.cf = cf;
}

/**
 * Dopo aver reperito tutti gli alunni, setta la media totale di tutti gli alunni e determina gli stranieri in totale.
 */
function setImpostazioni(){
    var mediaT = 0;
    var i ;
    var numStranieriT = 0;
    if (listAlunni.length > 0){
        for(i = 0; i < listAlunni.length; i++){
            mediaT += listAlunni[i].media;
            if (listAlunni[i].nazionalita.toLowerCase() != "italiana" && listAlunni[i].nazionalita.toLowerCase() != "italiano"){
                numStranieriT += 1;
            }
            impostazioni.media = (mediaT / listAlunni.length).toFixed(1);
            impostazioni.stranieri = (((impostazioni.studXClMin + impostazioni.studXClMax) / 2) / (Math.round(listAlunni.length / numStranieriT))).toFixed(); //0 niente decimali
        }
    }
    else {
        alert("Non ci sono alunni disponibili");
    }
    
}

function creaClassi(){
    setImpostazioni();
    popolamentoInClassi();
}

/**
 * insertAlunno inserisce l'alunno in lista alunni
 */
function insertAlunno(objalunno){
    listAlunni.push(objalunno);
}

/**
 * insertAlunnoInClass inserisce l'alunno in una classe
 */
function insertAlunnoInClass(objalunno, objclasse){
    objclasse.alunni.push(objalunno);
}

/**
 * createClass una classe
 */
function createClass(nomeClasse){
    listClass.push({nome:nomeClasse, alunni:[]});
}

/**
 * deleteAlunnoFromClass cancella un alunno da una classe 
 */
function deleteAlunnoFromClass(objalunno, objclasse){
    objclasse.alunni.splice(objclasse.alunni.indexOf(objalunno), 1);
}

/**
 * searchAlunnoInClass cerca un alunno tramite il codice fiscale in una classe
 */
function searchAlunnoInClass(cfAlunno, objclasse){
    for (i=0; i < objclasse.alunni.length; i++){
        if (objclasse.alunni[i].cf == cfAlunno){
            return objclasse.alunni[i];
        }
    }
    return null;
}

/**
 * searchClass cerca una classe in listClass
 */
function searchClass(nomeClasse){
    for (i=0; i < listClass.length; i++){
        if (listClass[i].nome == nomeClasse)    return listClass[i];
    }
    return null;
}

/**
 * searchAlunno cerca un alunno in listaAlunni
 */
function searchAlunno(cf){
    for (i=0; i < listAlunni.length; i++){
        if (listAlunni[i].cf == cf)    return listAlunni[i];
    }
    return null;
}

/**
 * printClassi fa qualcosa
 */
function printClassi(){
    var text = "";
    //alert("indice:" + listClass.length);
    var i,k;
    for (i = 0; i < listClass.length; i++){
        //alert(listClass[i].nome + " ," + i);
        console.log(i);
        text += "<h3>" + listClass[i].nome + "</h3><br/>";
        for (k = 0; k < listClass[i].alunni.length; k++){
            text += listClass[i].alunni[k].nome + " ," +  listClass[i].alunni[k].cognome + " ,cf" + listClass[i].alunni[k].cf + "<br/>";
        }
        //alert("Io di qui ci esco");
        text += "media classe: " + mediaClasse(listClass[i]) + "<br/>";
    }
    document.getElementById("print").innerHTML = text;
}

// ################################################################ //

/**
 * mediaClasse fa la media degli alunni in una classe
 */
function mediaClasse (objclasse){
    var sum = 0.0;
    var i ;
    for (i = 0; i < objclasse.alunni.length; i++){
        sum += objclasse.alunni[i].media;
    }
    return sum / objclasse.alunni.length;
}

/**
 * stranieriClasse conta gli alunni extra-italiani
 */
function stranieriClasse (objclasse){
    var sum = 0;
    for (i = 0; i < objclasse.alunni.length; i++){
        if (objclasse.alunni[i].nazionalita.toLowerCase() != "italiana" && 
            objclasse.alunni[i].nazionalita.toLowerCase() != "italiano"){
                sum += 1;
            }
    }

    return sum;
}

/**
 * stranieriSimiliInClasse conta gli alunni della stessa nazionalita
 */
function stranieriSimiliInClasse (objclasse, nazionalita){
    var sum = 0;
    for (i = 0; i < objclasse.alunni.length; i++){
        if (objclasse.alunni[i].nazionalita.toLowerCase() == nazionalita.toLowerCase()){
                sum += 1;
            }
    }
    return sum;
}

/**
 * residenzeUgualiInClasse conta gli alunni della stessa residenza (es. Verona, Erbezzo)
 */
function residenzeUgualiInClasse (objclasse, nomeResidenza){
    var sum = 0;
    for (i = 0; i < objclasse.alunni.length; i++){
        if (objclasse.alunni[i].residenza.toLowerCase() == nomeResidenza.toLowerCase()){
                sum += 1;
            }
    }
    return sum;
}

/**
 * cognomiUgualiInClass conta gli alunni con lo stesso cognome
 */
function cognomiUgualiInClass (cognome, objclasse){
    var sum = 0;
    for (i = 0; i < objclasse.alunni.length; i++){
        if (objclasse.alunni[i].cognome.toLowerCase() == cognome.toLowerCase()){
                sum += 1;
            }
    }
    return sum;
}

/**
 * cognomiSimiliInClass conta gli alunni che hanno un cognome simile a quello passato come parametro.
 */
function cognomiStessaInizialeInClass (cognome, objclasse){
    var sum = 0;
    var car = cognome[0].toLowerCase();
    for (i = 0; i < objclasse.alunni.length; i++){
        if (objclasse.alunni[i].cognome[0].toLowerCase() == car){
            sum += 1;
        }
    }
    return sum;
}

/**
 * cognomiSimiliInClass conta gli alunni che hanno un cognome simile a quello passato come parametro.
 */
function cognomiSimiliInClass (cognome, objclasse){
    var sum = 0;
    cognome = cognome.toLowerCase();
    for (i = 0; i < objclasse.alunni.length; i++){
        if (objclasse.alunni[i].cognome[0].toLowerCase() == cognome[0]){
            var countCar = 0;
            var cognAlCl = objclasse.alunni[i].cognome.toLowerCase();
            for (k = 0; k < cognAlCl.length; k++){
                if (cognome.indexOf(cognAlCl[k]) >= 0)  countCar += 1;   
            }
            if (countCar >= cognAlCl.length)    sum += 1;
        }
    }
    return sum;
}

function varianza (objclasse){
    var tmp = 0;
    for (i = 0; i < objclasse.alunni.length; i++){
        tmp += Math.pow(objclasse.alunni[i].media, 2);
    }
    return (tmp / objclasse.alunni.length) - mediaClasse(objclasse);
}

function derivazioneStandard (objclasse){
    return Math.sqrt(varianza(objclasse));
}

/**
 * determinaVoto determina il voto della media di un alunno necessario al raggiungimento di una media stabilita tramite paramentro
 * 
 */
function determinaVoto(objclasse, media){
    var eN = 0;
    for (i = 0; i < objclasse.alunni.length; i++){
        eN += objclasse.alunni[i].media; 
    }
    return Math.round((media * (objclasse.alunni.length + 1)) - eN);
}

function subControlloIdoneita(objalunno, objclasse){
    if (cognomiUgualiInClass(objalunno.cognome, objclasse) <= impostazioni.cognomiUg){
        if (stranieriSimiliInClasse(objclasse, objalunno.nazionalita) <= impostazioni.stranieri && 
            cognomiSimiliInClass(objalunno.cognome, objclasse) <= impostazioni.cognomiSim){
            if (residenzeUgualiInClasse(objclasse, objalunno.residenza) <= impostazioni.residUg){
                insertAlunnoInClass(objalunno, objclasse);
                listAlunni.splice(listAlunni.indexOf(objalunno),1);
            }
            else if (clEsaurite){
                insertAlunnoInClass(objalunno, objclasse);
                listAlunni.splice(listAlunni.indexOf(objalunno),1);
            }
        }

        else if (clEsaurite){
            insertAlunnoInClass(objalunno, objclasse);
            listAlunni.splice(listAlunni.indexOf(objalunno),1);
        }
    }
    else if (clEsaurite){
        insertAlunnoInClass(objalunno, objclasse);
        listAlunni.splice(listAlunni.indexOf(objalunno),1);
    }
}

function controlloIdoneità(objalunno, objclasse){
    var detMed = 0;
    if (objclasse.alunni.length > (impostazioni.studXClMax / 2)){
        detMed = determinaVoto(objclasse, impostazioni.media);
        if (detMed <= (objalunno.media + 1) && detMed >= (objalunno.media - 1) ){
            subControlloIdoneita(objalunno, objclasse);
        }
        else{
            return;
        }
    }
    subControlloIdoneita(objalunno, objclasse);
}

/**
 * sort
 */

function sortListAlunni(){
    listAlunni.sort(function(a, b){
        var x = a.cognome.toLowerCase() + a.nome.toLowerCase();
        var y = b.cognome.toLowerCase() + b.nome.toLowerCase();
        if (x < y)  return -1;
        if (x > y)  return 1;
        return 0;
    });
}

/**
 * popolamentoInClassi si occupa di popolare le classi
 */
function popolamentoInClassi(){
    sortListAlunni();
    var ind = 0;
    for (  i = 0; i < listClass.length; i++){
       // alert("Indice: " + i);
        //alert(listClass[i].nome);
        console.log(i);
        while (listClass[i].alunni.length <= impostazioni.studXClMax){
            ind = Math.floor(Math.random() * listAlunni.length);
            controlloIdoneità(listAlunni[ind], listClass[i]);
            if (listClass[i].alunni.length >= impostazioni.studXClMin){
                alert("Ho fatto il break");
                break;
            }
        }
    }
    clEsaurite = true;
    if (listAlunni.length > 0 ){
        popolamentoInClassi();
    }
}

/**
 * L'idea è quella di creare un insieme di alunni. ||| A = {1, 2, 3, 4, 5} |||
 * In maniera incrementale (di volta in volta) trovare l'alunno da aggiungere e se sbagliato tornare indietro.
 * Determino un sottoinsieme di A che rispetti dei vincoli. ||| A = {1, 2, 3, 4, 5}, subA = {3, 4, 5} |||
 * 
 *                 ? __ __ __ __ {media:8, residenza:"Bussolengo", nazionalita:"Ital"}
 *                / \ corretto
 *               /   \
 * fallimento   /     \ fallimento
 * {7,"Ver", "Franc"}   {6, residenza:"", nazionalita:""}
 */