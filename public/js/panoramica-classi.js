var debug = true;
var jsonVoti = {};
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
    var approx = result.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
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
    updateChart(toClass)

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
                    'html': '<a class="ui red ribbon label">' + nomeClasse + '</a>'
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


                for (var j = 0; j < arrayStudenti.length; j++) {
                    if (arrayStudenti[j] !== undefined) {
                        var cognomeStudente = arrayStudenti[j].cognome;
                        var nomeStudente = arrayStudenti[j].nome;
                        var cf = arrayStudenti[j].cf;
                        var cf = arrayStudenti[j].cf;

                        //sezione per sapere quanti studenti hanno un determinato voto
                        var voto = arrayStudenti[j].media_voti;
                        if (jsonVoti[voto] === undefined)jsonVoti[voto] = 1;
                        else jsonVoti[voto] = jsonVoti[voto] + 1;


                        var tag;
                        var anagrafica = $('<p/>')
                            .html(cognomeStudente + " " + nomeStudente);
                        if (arrayStudenti[j].sesso == "M") {
                            var container = $('<div/>',
                                {
                                    'width': $('.contenitoreClasse ').width()
                                })
                                .addClass('ui segment tooltip guys ')
                                .attr('id', cf)
                                .html(anagrafica)
                        }
                        else {
                            var container = $('<div/>',
                                {
                                    'width': $('.contenitoreClasse ').width()
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
                    }
                }

                //CHART DATA//
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
                        labels: ["Sei", "Sette", "Otto", "Nove", "Dieci"],
                        datasets: [{
                            label: 'studenti',
                            data: [
                                jsonVoti[6],
                                jsonVoti[7],
                                jsonVoti[8],
                                jsonVoti[9],
                                jsonVoti[10]
                            ],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255,99,132,1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
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
                    updateChart(newList.attr('id'));

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

    /**
     * update a chart for a specific chart
     * @param newClassName
     */
    function updateChart(newClassName) {
        //json voti di questa classe
        var position = newClassName[1].charCodeAt(0) - 65;//65 is the first ASCII letter
        var myChart = chartArray[position];

        myChart.data.datasets[0].data[0] = 10;
        myChart.update();
    }

});