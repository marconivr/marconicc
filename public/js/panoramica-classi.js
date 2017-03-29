var debug = true;
var chartArray = [];
var arrayClassi = null;


function populate(listaClassi) {
    arrayClassi = listaClassi;
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
    //TODO:APPROSIAMRE LE PERCENTUALI
    //json voti di questa classe
    var jsonVoti = numerOfVotiOfClass(newClassName);
    var position = newClassName[1].charCodeAt(0) - 65;//65 is the first ASCII letter
    var myChart = chartArray[position];
    var numerOfStudent = totalNumberOfStudent(newClassName);
    myChart.data.datasets[0].data[0] = approxNum((jsonVoti[6] / numerOfStudent) * 100);
    myChart.data.datasets[0].data[1] = approxNum((jsonVoti[7] / numerOfStudent) * 100);
    myChart.data.datasets[0].data[2] = approxNum((jsonVoti[8] / numerOfStudent) * 100);
    myChart.data.datasets[0].data[3] = approxNum((jsonVoti[9] / numerOfStudent) * 100);
    myChart.data.datasets[0].data[4] = approxNum((jsonVoti[10] / numerOfStudent) * 100);
    myChart.update();
}

/**
 * refresh the data in the old chart
 * @param oldClassName
 */
function refreshChart(oldClassName) {
    //json voti di questa classe
    var jsonVoti = numerOfVotiOfClass(oldClassName);
    var position = oldClassName[1].charCodeAt(0) - 65;//65 is the first ASCII letter
    var myChart = chartArray[position];
    var numerOfStudent = totalNumberOfStudent(oldClassName);
    myChart.data.datasets[0].data[0] = approxNum((jsonVoti[6] / numerOfStudent) * 100);
    myChart.data.datasets[0].data[1] = approxNum((jsonVoti[7] / numerOfStudent) * 100);
    myChart.data.datasets[0].data[2] = approxNum((jsonVoti[8] / numerOfStudent) * 100);
    myChart.data.datasets[0].data[3] = approxNum((jsonVoti[9] / numerOfStudent) * 100);
    myChart.data.datasets[0].data[4] = approxNum((jsonVoti[10] / numerOfStudent) * 100);
    myChart.update();
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

function getStudentsNumber(nomeClasse) {
    var studentiOfClass = getStudentsOfClass(nomeClasse);
    return studentiOfClass.length;
}

//
// function updateStatistiche(classe){
//
//     $('#femmine'+classe).text("femmine: " + getNumberOfFemmineOfClass(classe));
//     $('#media'+classe).text("media: " + getMediaOfClass(classe));
//     $('#alunni'+classe).text("alunni: " + getStudentsNumber(classe));
//
// }

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

    //updateStatistiche(fromClass);
    //updateStatistiche(toClass);
    updateChart(toClass);//refresh the new chart
    refreshChart(fromClass); //refresh the old chart

}

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
                    'html': '<a class="ui red ribbon label">' + nomeClasse + '</a> <h4 class="title">Distribuzione Voti</h4> '
                }).appendTo(wrapperClasse);



                for (var prop in proprieta) {
                    if (prop != "residenza" && prop != "iniziale" && prop != "bocciati") {
                        // var li = $('<div/>')
                        //     .addClass("ui info message")
                        //     .text(prop + ": " + proprieta[prop])
                        //     .appendTo(settingClasse);
                        //<canvas id="myChart" width="400" height="400"></canvas>
                    }
                }


                var div = $('<ul/>', {
                    'class': 'contenitoreClasse ui vertical menu'
                }).appendTo(wrapperClasse);

                jsonVoti = {};
                for (var j = 0; j < arrayStudenti.length; j++) {
                    if (arrayStudenti[j] !== undefined) {
                        var cognomeStudente = arrayStudenti[j].cognome;
                        var nomeStudente = arrayStudenti[j].nome;
                        var cf = arrayStudenti[j].cf;

                        // //sezione per sapere quanti studenti hanno un determinato voto
                        // var voto = arrayStudenti[j].media_voti;
                        // if (jsonVoti[voto] === undefined)jsonVoti[voto] = 1;
                        // else jsonVoti[voto] = jsonVoti[voto] + 1;


                        var tag;
                        var anagrafica = $('<p/>')
                            .addClass('roboto')
                            .html(cognomeStudente + " " + nomeStudente);

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
                        if (arrayStudenti[j].tag != null) {
                            //contiene il tag studente
                            tag = $('<div/>')
                                .addClass('floating ui grey  label')
                                .html(arrayStudenti[j].tag)
                                .appendTo(container)
                        }
                        //tooltip
                        var tooltip = $('<span/>')
                            .addClass('tooltiptext')
                            .html('Media : ' + arrayStudenti[j].media_voti)
                            .appendTo(container);

                        var li = $('<li/>')
                            .html(container)
                            .appendTo(div);

                        //menu

                    }
                }

                var jsonVotiPrima = totalVotiOfAllClass();
                var jsonVoti = numerOfVotiOfClass(nomeClasse);
                var numerOfStudent = totalNumberOfStudent(nomeClasse);
                var totalNumberOfAllClass = totalNumberOfStudentOfAllClass();

                // CHART DATA //
                var chart = $('<canvas/>',
                    {
                        'id': nomeClasse,
                        'width': 200,
                        'height': 200
                    }).appendTo(settingClasse);

                var ctx = chart;
                var myChart = new Chart(ctx, {
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
                chartArray.push(myChart);

            }
            var oldList, newList, item;
            $(".contenitoreClasse").sortable({
                connectWith: ".contenitoreClasse",
                start: function (event, ui) {
                    item = ui.item;
                    newList = oldList = ui.item.parent().parent();
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

                    var classe = $(this).text();

                    //nascondo l'elemento


                    //bisogna fare il controllo per quando si preme tante volte
                    $('#' + classe).hide();

                } else {
                    $(this).addClass('active');
                    var classe = $(this).text();

                    //visualizzo l'elemento
                    $('#' + classe).show();
                }
                //attivo il doppio scroll che non funziona bisognerà indagare
                $('#wrapper').doubleScroll();
            }
        });

    /**
     * Osservatore per gestire il visualizzza tutto
     */
    $('#checkBox').checkbox({
        onChecked: function () {
            //visualizzo tutto lasciando in selezione gli altri item
            $('.wrapperClasse').show();
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