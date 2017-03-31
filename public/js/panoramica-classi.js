var debug = true;
var saveRealTimeOnDb = false;


var barChartArray = [];//reference to barChart
var pieChartArray = [];//reference to pieChart

var informationArray = [];//reference to information
var cfArray = []; //serve per i desiderata e per non rompere i coglioni
var arrayClassi = null;
var iconJson = {
    'media': {
        'color': 'floating ui green label',
        'icon': 'write icon'
    },
    'bocciati': {
        'color': 'floating ui red label',
        'icon': 'configure icon'
    },
    'alunni': {
        'color': 'floating ui blue  label',
        'icon': 'student icon'
    }

};

var flagJson = {
    'ITALIANA' : 'it',
    'CINGALESE' : 'lk',
    'BANGLADESE': 'bd',
    'ROMENA' : 'ro',
    'CINESE' : 'cn',
    'MAROCCHINA' : 'ma',
    'PARAGUAIANA' : 'py',
    'TUNISINA' : 'tn',
    'FILIPPINA' : 'ph',
    'ALBANESE' : 'al',
    'MOLDAVA' : 'md',
    'LETTONE' : 'lv',
    'BRASILIANA' : 'br',
    'NIGERIANA' : 'ne',
    'GHANESE' : 'gh',
    'PERUVIANA' : 'pe',
    'CUBANA' : 'cu',
    'CROATA' : 'hr',
    'SENEGALESE' : 'sn'
};

function populate(listaClassi) {
    arrayClassi = listaClassi;
}

/**
 * @param nomeClasse
 * @returns {{}} oggetto che rappresenta la situazione stranieri nella classe
 */
function getNationalityOfClass(nomeClasse) {
    var alunni = getStudentsOfClass(nomeClasse);

    var nazionalita = {};
    for (var i=0; i < alunni.length; i++){
        nazionalita[alunni[i].nazionalita] = 0;
    }

    for(var prop in nazionalita){
        for (i=0; i < alunni.length; i++){
            if (alunni[i].nazionalita == prop){
                nazionalita[prop] += 1;
            }
        }
    }
    return nazionalita;
}

/**
 *
 * @param nomeClasse
 * @returns {Array|*} Studenti della classe
 */
function getStudentsOfClass(nomeClasse){
    for (var i=0; i < arrayClassi.length; i++){
        if(arrayClassi[i].nome == nomeClasse){
            return arrayClassi[i].alunni;
        }
    }
}

/**
 * ritorna un json con il numero dei voti di una classe
 * {
 *  6:3,
 *  7:8,
 *  8:2....}
 * @param className
 */
function numerOfVotiOfClass(className) {
    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == className) {
            var jsonVoti = {};
            for (var studenti = 0; studenti < arrayClassi[i].alunni.length; studenti++) {
                var voto = arrayClassi[i].alunni[studenti].media_voti;
                if (jsonVoti[voto] === undefined)jsonVoti[voto] = 1;
                else jsonVoti[voto] = jsonVoti[voto] + 1;
            }
        }
    }
    if (debug) {
        console.log(className + "json voti->");
        console.log(jsonVoti);
    }

    if (jsonVoti[6] === undefined)jsonVoti[6] = 0;
    if (jsonVoti[7] === undefined)jsonVoti[7] = 0;
    if (jsonVoti[8] === undefined)jsonVoti[8] = 0;
    if (jsonVoti[9] === undefined)jsonVoti[9] = 0;
    if (jsonVoti[10] === undefined)jsonVoti[10] = 0;

    return jsonVoti;
}


/**
 * ritorna un json con il numero dei voti di tutte le prime
 * {
 *  6:3,
 *  7:8,
 *  8:2....}
 */
function totalVotiOfAllClass() {
    var jsonVoti = {};
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studenti = 0; studenti < arrayClassi[i].alunni.length; studenti++) {
            var voto = arrayClassi[i].alunni[studenti].media_voti;
            if (jsonVoti[voto] === undefined)jsonVoti[voto] = 1;
            else jsonVoti[voto] = jsonVoti[voto] + 1;
        }

    }
    return jsonVoti;
}


/**
 * return the number of student of one class
 * @param className
 */
function totalNumberOfStudent(className) {
    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == className) {
            return arrayClassi[i].alunni.length;
        }
    }
}

/**
 * return the number of student of all class
 */
function totalNumberOfStudentOfAllClass() {
    var number = 0;
    for (var i = 0; i < arrayClassi.length; i++) {
        number += arrayClassi[i].alunni.length;
    }
    return number;
}

function approxNum(num){
    return num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
}

/**
 * update a chart for a specific chart
 * @param newClassName
 */
function updateChart(newClassName) {
    //json voti di questa classe
    var jsonVoti = numerOfVotiOfClass(newClassName);
    var position = newClassName[1].charCodeAt(0) - 65;//65 is the first ASCII letter
    var barChart = barChartArray[position];
    var numerOfStudent = totalNumberOfStudent(newClassName);
    barChart.data.datasets[0].data[0] = approxNum((jsonVoti[6] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[1] = approxNum((jsonVoti[7] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[2] = approxNum((jsonVoti[8] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[3] = approxNum((jsonVoti[9] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[4] = approxNum((jsonVoti[10] / numerOfStudent) * 100);
    barChart.update();
}

/**
 * refresh the data in the old chart
 * @param oldClassName
 */
function refreshChart(oldClassName) {
    //json voti di questa classe
    var jsonVoti = numerOfVotiOfClass(oldClassName);
    var position = oldClassName[1].charCodeAt(0) - 65;//65 is the first ASCII letter
    var barChart = barChartArray[position];
    var numerOfStudent = totalNumberOfStudent(oldClassName);
    barChart.data.datasets[0].data[0] = approxNum((jsonVoti[6] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[1] = approxNum((jsonVoti[7] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[2] = approxNum((jsonVoti[8] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[3] = approxNum((jsonVoti[9] / numerOfStudent) * 100);
    barChart.data.datasets[0].data[4] = approxNum((jsonVoti[10] / numerOfStudent) * 100);
    barChart.update();
}

/**
 * count bocciati of one class
 * @param className
 * @returns {number}
 */
function countBocciatiOfClass(className) {
    var bocciati = 0;
    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == className) {
            for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
                if (arrayClassi[i].alunni[studente].classe_precedente != "") bocciati += 1;
            }
        }
    }
    return bocciati;
}

/**
 * ritorna un json con le proprietà
 * @param nomeClasse
 * @returns {{}}
 */
function createProprietaForASpecificClass(className) {
    var prop = {};
    for (var i = 0; i < arrayClassi.length; i++) {
        if (arrayClassi[i].nome == className) {
            prop['alunni'] = arrayClassi[i].alunni.length;
            prop['media'] = getMediaOfClass(arrayClassi[i].nome);
            prop['bocciati'] = countBocciatiOfClass(className);
            return prop;
        }
    }

}
/**
 *
 * @param nomeClasse
 * @returns {number} Media voti della classe
 */
function getMediaOfClass(nomeClasse){
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    var somma = 0;
    for (var i=0; i < studentiOfClass.length; i++){
        somma = somma + studentiOfClass[i].media_voti;
    }
    var result =  somma/studentiOfClass.length;
    var approx = approxNum(result);
    return approx;
}


function getNumberOfDifferentNationalityOfClass(nomeClasse){
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    //todo manca nel db il campo nazionalità
}

function getVotesDistributionOfClass(nomeClasse){
    var jsonVoti = null;

    var alunni = getStudentsOfClass(nomeClasse);

    for (var i=0; i < alunni.length; i++){
        var voto = alunni[i].media_voti;

        if (jsonVoti[voto] === undefined){
            jsonVoti[voto] = 1;

        } else {
            jsonVoti[voto] = jsonVoti[voto] + 1;
        }
    }

    return jsonVoti;
}

/**
 *
 * @param nomeClasse
 * @returns {number}
 */
function getNumberOfFemmineOfClass(nomeClasse) {
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    var count = 0;
    for (var i=0; i < studentiOfClass.length; i++){
        if (studentiOfClass[i].sesso == "F"){
            count += 1;
        }
    }
    return count;
}

/**
 *
 * @param nomeClasse
 * @returns {Number}
 */
function getStudentsNumber(nomeClasse) {
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    return studentiOfClass.length;
}

function displayAllClass() {
    //visualizzo tutto lasciando in selezione gli altri item
    $('.wrapperClasse').show();
    //attivo il doppio scroll che non funziona bisognerà indagare
    $('#wrapper').doubleScroll()
}

/**
 * crea il box delle informazioni per ogni classe
 */
function createBoxInformazioni(wrapperClasse, nomeClasse) {

    var proprieta = createProprietaForASpecificClass(nomeClasse);
    var array = [];
    for (var prop in proprieta) {

        var menu = $('<div/>')
            .addClass('ui compact menu')
            .appendTo(wrapperClasse);

        var item = $('<a/>')
            .addClass('item')
            .appendTo(menu);

        var studentIcon = $('<i/>')
            .addClass(iconJson[prop].icon)
            .appendTo(item);

        var floatingMenu = $('<div/>')
            .addClass(iconJson[prop].color)
            .appendTo(item);

        var reference = prop;
        var value = $('<p/>',
            {
                'id': prop + '-' + nomeClasse
            })
            .html(proprieta[prop])
            .appendTo(floatingMenu);

        array.push(value);
    }
    informationArray.push(array);
}

/**
 * update the information of a specific class
 * @param className
 */
function updateInformation(className) {
    var proprieta = createProprietaForASpecificClass(className);
    for (var i = 0; i < arrayClassi.length; i++)

        if (arrayClassi[i].nome == className) {
            informationArray[i][0].html(proprieta["alunni"]);
            informationArray[i][1].html(proprieta["media"]);
            informationArray[i][2].html(proprieta["bocciati"]);
        }
}

/**
 * ritorna il cf di uno studente
 * @param cf : cf da controllare
 */
function getAlunnoDesiderataByCF(cf) {
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
            if (arrayClassi[i].alunni[studente].cf_amico == cf)
                return arrayClassi[i].alunni[studente].cf;
        }

    }
}

/**
 * ritorna uno studente da un cf
 * @param cf
 * @returns {string}
 */
function getStudentByCF(cf) {
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
            if (arrayClassi[i].alunni[studente].cf == cf)
                return arrayClassi[i].alunni[studente].nome + " " + arrayClassi[i].alunni[studente].cognome;
        }
    }
}

/**
 * return classname of the student
 * @param stundentCf
 */
function getClassNameFromStudent(stundentCf) {
    for (var i = 0; i < arrayClassi.length; i++) {
        for (var studente = 0; studente < arrayClassi[i].alunni.length; studente++) {
            if (arrayClassi[i].alunni[studente].cf == stundentCf)
                return arrayClassi[i].nome;
        }
    }
}

function saveStudentMovementOnDb(cf, fromClass, toClass) {

    var jsonToSend = {
        cf : cf,
        fromClass : fromClass,
        toClass : toClass
    }

    if(saveRealTimeOnDb){
        $.ajax({
            type: "POST",
            url: "/move-student",

            data: jsonToSend,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                console.log(data);
            },
            failure: function(errMsg) {
                alert(errMsg);
            }
        });
    }

}

/**
 *
 * @param cf
 * @param fromClass
 * @param toClass
 */
function moveStudent(cf,fromClass,toClass){

    var removedStudent = null;

    for (var i=0; i < arrayClassi.length; i++){
        if (arrayClassi[i].nome == fromClass){
            var alunni = arrayClassi[i].alunni;
            for (var j=0; i < alunni.length; j++ ){
                if (alunni[j].cf == cf){
                    removedStudent = alunni.splice( alunni.indexOf(alunni[j]) , 1 )[0];
                    if(debug){
                        console.log(fromClass);
                        console.log(getNumberOfFemmineOfClass(fromClass));
                        console.log(arrayClassi[i].alunni);
                    }

                    break;
                }
            }
            break;
        }
    }

    for (var i=0; i < arrayClassi.length; i++){
        if (arrayClassi[i].nome == toClass){
            arrayClassi[i].alunni.push(removedStudent);

            if(debug) {
                console.log(toClass);
                console.log(getNumberOfFemmineOfClass(toClass));
                console.log(arrayClassi[i].alunni);
            }

            break;
        }
    }

    saveStudentMovementOnDb(cf,fromClass,toClass);
    updateChart(toClass);//refresh the new chart
    refreshChart(fromClass); //refresh the old chart
    updateInformation(toClass);
    updateInformation(fromClass);

}

function flagTag(nazionalita) {
    return flagJson[nazionalita];

}

////////////////////////////////////////////////////
//AJAX CALL//
////////////////////////////////////////////////////
// - SCARICAMENTE JSON
// - CREAZIONE BOX INFORMAZIONI
// - CREAZIONE CHART
// - INIZIALIZZAZIONE DRAG AND DROP STUDENTI
$(document).ready(function() {
    /**
     * Richiesta ajax che compone la pagina con le classi. Inizialmente sono settate nascoste
     */
    $.ajax({
        url: '/get-classi-composte',
        data: {
            format: 'json'
        },
        error: function () {
            alert('Errore di scaricamento dei dati /get-classi-composte');
        },
        dataType: 'json',

        success: function (listaClassi) {

            populate(listaClassi);



            for (var i = 0; i < listaClassi.length; i++) {

                var nomeClasse = listaClassi[i].nome;
                var proprieta = listaClassi[i].proprieta;
                var arrayStudenti = listaClassi[i].alunni;

                var wrapperClasse = $('<div/>', {
                    'id': nomeClasse,
                    'class': 'wrapperClasse',
                }).appendTo('#rowForInsertClasses').hide();

                $('<a/>', {
                    'class': 'item',
                    'text': nomeClasse
                }).appendTo($('#selezioneClassi'));


                var settingClasse = $('<div/>', {
                    'class': 'ui raised segment wrapperSettingClasse',
                    'html': '<a class="ui red ribbon label">' + nomeClasse + '</a> <div class="ui icon buttons mini"><button id=' + nomeClasse + 'bar' + ' class="ui button"><i class="bar chart icon"></i></button><button id=' + nomeClasse + 'chart' + ' class="ui button"><i class="pie chart icon"></i></button></div> <h4 class="title">Distribuzione Voti</h4> '
                }).appendTo(wrapperClasse);

                var div = $('<ul/>', {
                    'class': 'contenitoreClasse ui vertical menu'
                }).appendTo(wrapperClasse);

                jsonVoti = {};
                for (var j = 0; j < arrayStudenti.length; j++) {
                    if (arrayStudenti[j] !== undefined) {
                        var cognomeStudente = arrayStudenti[j].cognome;
                        var nomeStudente = arrayStudenti[j].nome;
                        var cf = arrayStudenti[j].cf;
                        var nazionalita = arrayStudenti[j].nazionalita;
                        var desiderata = arrayStudenti[j].cf_amico;


                        var iconFlagElement = "";
                        if (nazionalita != "ITALIANA"){
                            iconFlagElement = "<i class='" + flagTag(nazionalita) + " flag'></i>";
                        }

                        /////////////////////STUDENTI//////////////////
                        //CREAZIONE TAG
                        //ES : CIECO
                        //ES : DSA-> DISGRAFICO

                        //CONTROLLO ANAGRAFICA
                        //CONTROLLO DESIDERATA
                        var tag;
                        var anagrafica = $('<p/>')
                            .addClass('roboto')
                            .html(iconFlagElement + " " +cognomeStudente + " " + nomeStudente );


                        if (arrayStudenti[j].sesso == "M") {
                            var container = $('<div/>',
                                {
                                    'width': $('.contenitoreClasse ').width(),
                                    'height': 40
                                })
                                .addClass('ui segment tooltip guys ')
                                .attr('id', cf)
                                .html(anagrafica)
                        }
                        else {
                            var container = $('<div/>',
                                {
                                    'width': $('.contenitoreClasse ').width(),
                                    'height': 40
                                })
                                .addClass('ui segment tooltip girl ')
                                .attr('id', cf)
                                .html(anagrafica)
                        }

                        //aggiungo la classe desiderata se presente
                        if (desiderata != "")container.addClass('desiderata');

                        var tooltipValue = "";
                        if ((arrayStudenti[j].legge_104) != "") {
                            tooltipValue = "104"
                        }else if(arrayStudenti[j].legge_107 != ""){
                            tooltipValue = "107";
                        }

                        if (tooltipValue != ""){
                            //contiene il tag studente
                            tag = $('<div/>')
                                .addClass('floating ui grey label tiny')
                                .html(tooltipValue)
                                .appendTo(container)
                        }

                        //tooltip
                        var handicapTooltip = "";
                        if ((arrayStudenti[j])['legge_'+tooltipValue] !== undefined){
                            handicapTooltip = '<br>'+tooltipValue+': '+(arrayStudenti[j])['legge_'+tooltipValue];
                        }

                        var tooltip = $('<span/>')
                            .addClass('tooltiptext')
                            .html('media : ' + arrayStudenti[j].media_voti + '<br>naz : ' + nazionalita + handicapTooltip)
                            .appendTo(container);

                        var li = $('<li/>')
                            .html(container)
                            .appendTo(div);
                    }
                }

                var jsonVotiPrima = totalVotiOfAllClass();
                var jsonVoti = numerOfVotiOfClass(nomeClasse);
                var numerOfStudent = totalNumberOfStudent(nomeClasse);
                var totalNumberOfAllClass = totalNumberOfStudentOfAllClass();

                // CHART BAR //
                var canvasBarChart = $('<canvas/>',
                    {
                        'class': 'barChart',
                        'width': 200,
                        'height': 200
                    }).appendTo(settingClasse);

                var br = $('<br>').appendTo(settingClasse);
                var barChart = new Chart(canvasBarChart, {
                    type: 'bar',
                    data: {
                        labels: ["6", "7", "8", "9", "10"],
                        datasets: [{
                            label: 'classe' + nomeClasse,
                            data: [
                                approxNum((jsonVoti[6] / numerOfStudent) * 100),
                                approxNum((jsonVoti[7] / numerOfStudent) * 100),
                                approxNum((jsonVoti[8] / numerOfStudent) * 100),
                                approxNum((jsonVoti[9] / numerOfStudent) * 100),
                                approxNum((jsonVoti[10] / numerOfStudent) * 100)
                            ],
                            backgroundColor: [
                                '#FFCDD2',
                                '#F0F4C3',
                                '#D4E157',
                                '#AED581',
                                '#2E7D32'
                            ],
                            borderColor: [
                                '#EF5350',
                                '#E6EE9C',
                                '#CDDC39',
                                '#8BC34A',
                                '#2E7D32'
                            ],
                            borderWidth: 1,
                            stack: 1
                        },
                            {
                                label: 'Totali',
                                data: [
                                    approxNum((jsonVotiPrima[6] / totalNumberOfAllClass) * 100),
                                    approxNum((jsonVotiPrima[7] / totalNumberOfAllClass) * 100),
                                    approxNum((jsonVotiPrima[8] / totalNumberOfAllClass) * 100),
                                    approxNum((jsonVotiPrima[9] / totalNumberOfAllClass) * 100),
                                    approxNum((jsonVotiPrima[10] / totalNumberOfAllClass) * 100)
                                ],
                                backgroundColor: [
                                    '#E0E0E0',
                                    '#E0E0E0',
                                    '#E0E0E0',
                                    '#E0E0E0',
                                    '#E0E0E0'
                                ],
                                borderColor: [
                                    '#BDBDBD',
                                    '#BDBDBD',
                                    '#BDBDBD',
                                    '#BDBDBD',
                                    '#BDBDBD'
                                ],
                                borderWidth: 1,
                                stack: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    steps: 10,
                                    stepValue: 6,
                                    max: 60,
                                    callback: function(value){return value+ "%"   //mettendo questa per la percentuale il voto viene messo orizzontale
                                    }
                                }
                            }]
                        }
                    }
                });

                barChartArray.push(barChart);


                // // PIE CHART//
                // var canvasPieChart = $('<canvas/>',
                //     {
                //         'class': 'pieChart',
                //         'width': 200,
                //         'height': 200
                //     });
                //
                // // For a pie chart
                // var pieChart = new Chart(canvasPieChart,{
                //     type: 'pie',
                //     data: {
                //         labels: [
                //             "Red",
                //             "Blue",
                //             "Yellow"
                //         ],
                //         datasets: [
                //             {
                //                 data: [300, 50, 100],
                //                 backgroundColor: [
                //                     "#FF6384",
                //                     "#36A2EB",
                //                     "#FFCE56"
                //                 ],
                //                 hoverBackgroundColor: [
                //                     "#FF6384",
                //                     "#36A2EB",
                //                     "#FFCE56"
                //                 ]
                //             }]
                //     },
                //     options: {
                //         responsive: true
                //     }
                // });
                //
                // pieChartArray.push(pieChart);

                //box informazioni
                createBoxInformazioni(settingClasse, nomeClasse);


            }
            var oldList, newList, item, desiderata, cfAmico;
            $(".contenitoreClasse").sortable({
                connectWith: ".contenitoreClasse",
                start: function (event, ui) {

                    item = ui.item;
                    var currentPos = $(this).position();
                    desiderata = item.children().hasClass('desiderata');
                    cf = item.children()[0].id; //cf dell'alunno selezionato
                    cfAmico = getAlunnoDesiderataByCF(cf);


                    if (desiderata) {
                        //check if i've already this cf
                        if (jQuery.inArray(cf, cfArray) == -1) {
                            cfArray.push(cf);
                            if (confirm("Questo alunno vuole stare con un amico: " + getStudentByCF(cfAmico) + " della " + getClassNameFromStudent(cfAmico) + ", continuare?")) {
                                newList = oldList = ui.item.parent().parent();
                            }
                            else {
                                newList = oldList = ui.item.parent().parent();
                            }
                        }
                        else {
                            newList = oldList = ui.item.parent().parent();
                        }

                    }
                    else {
                        newList = oldList = ui.item.parent().parent();
                    }
                    // cfAmico = getAlunnoDesiderataByCF(cf);
                    // if(desiderata)
                    // {
                    //     if(jQuery.inArray(cf, cfArray) == 0 )
                    //     {
                    //         var index = cfArray.indexOf(cf);
                    //         cfArray.splice(index, 1);
                    //         if(confirm("Questo alunno vuole stare con un amico: "  + getStudentByCF(cfAmico) + ", continuare?"))
                    //         {
                    //             ;
                    //         }
                    //         else
                    //         {
                    //             newList = oldList = ui.item.parent().parent();
                    //         }
                    //     }
                    //
                    //
                    // }
                    // else {
                    //     newList = oldList = ui.item.parent().parent();
                    // }



                },
                stop: function (event, ui) {
                    var cf_studente_spostato = item[0].childNodes[0].id;
                    var classFrom = oldList.attr('id');
                    var classTo = newList.attr('id');

                    moveStudent(cf_studente_spostato,classFrom,classTo);

                    console.log("Moved " + cf_studente_spostato + " from " + oldList.attr('id') + " to " + newList.attr('id'));


                },
                change: function (event, ui) {
                    if (ui.sender) newList = ui.placeholder.parent().parent();
                }
            }).disableSelection();

            displayAllClass();
        },
        type: 'GET'
    });

    //TODO:FIX WHEN SELECTION WIDTH


    /**
     * Osservatore per gestire la visualizzazione delle classi
     */
    $('#selezioneClassi')
        .on('click', '.item', function () {

            if ($(this)[0].id != "contenitoreCheckBox") { //faccio questo controllo per evitare che venga considerato click anche lo switch per mostrare le classi(ho dovuto dargli classe item se no non era in linea)
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');

                    if($('#check').prop("checked") == false){
                        var classe = $(this).text();
                        $('#' + classe).hide();
                    }


                } else {
                    $(this).addClass('active');

                    if($('#check').prop("checked") == false){
                        var classe = $(this).text();
                        $('#' + classe).show();
                    }
                }
            }
        });

    /**
     * Osservatore per gestire il visualizzza tutto
     */
    $('#checkBox').checkbox({
        onChecked: function () {
            displayAllClass();
        },
        onUnchecked: function () {
            //prima di pulire tutto controllo gli item già attivi per portare alla situazione precendente le visualizzazioni
            $('#selezioneClassi > .item').each(function (i, obj) {
                if (!$(this).hasClass('active')) {
                    try {
                        var id = $(this).text();
                        $('#' + id).hide();
                    } catch (e) {
                        //mi serviva per fare il controllo perchè il riquadro attorno allo switch viene considerato active allora passa l'id ma va in eccezione perchè non si riferisce a nessuna classe
                    }
                }
            });
        }
    });
});