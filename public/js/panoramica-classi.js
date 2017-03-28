$( document ).ready(function() {
    var classi_json = null;

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

            classi_json = listaClassi;

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
                        var li = $('<div/>')
                            .addClass("ui info message")
                            .text(prop + ": " + proprieta[prop])
                            .appendTo(settingClasse);
                    }
                }

                var div = $('<ul/>', {
                    'class': 'contenitoreClasse ui vertical menu'
                }).appendTo(wrapperClasse);


                for (var j = 0; j < arrayStudenti.length; j++) {
                    if (arrayStudenti[j] !== undefined) {
                        var cognomeStudente = arrayStudenti[j].cognome;
                        var nomeStudente = arrayStudenti[j].nome;
                        var cf = arrayStudenti[j].cf

                        var tag;

                        if (arrayStudenti[j].sesso == "M") {
                            var container = $('<div/>')
                                .addClass('ui segment tooltip guys')
                                .attr('id', cf)
                                .html(cognomeStudente + " " + nomeStudente)
                        }
                        else {
                            var container = $('<div/>')
                                .addClass('ui segment tooltip girl')
                                .attr('id', cf)
                                .html(cognomeStudente + " " + nomeStudente)
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
                            .appendTo(container)

                        var li = $('<li/>')
                            .html(container)
                            .appendTo(div);
                    }
                }
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
                    console.log("Moved " + cf_studente_spostato + " from " + oldList.attr('id') + " to " + newList.attr('id'));
                },
                change: function (event, ui) {
                    if (ui.sender) newList = ui.placeholder.parent().parent();
                }
            }).disableSelection();
        },
        type: 'GET'
    });


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