function controlloIdoneità(objalunno, objclasse, ind){
    if (determinaVoto(objclasse, impostazioni.media) <= (objalunno.media + 1) && 
        determinaVoto(objclasse, impostazioni.media) >= (objalunno.media - 1)){
        
        if (cognomiSimiliInClass(objalunno.cognome, objclasse) <= impostazioni.cognomiSim && 
            cognomiUgualiInClass(objalunno.cognome, objclasse) <= impostazioni.cognomiUg){
            
            if (residenzeUgualiInClasse(objclasse, objalunno.residenza) <= impostazioni.residUg && 
            stranieriSimiliInClasse(objclasse, objalunno.nazionalita) <= impostazioni.stranieri){

                insertAlunnoInClass(objalunno, objclasse);
                listAlunni.splice(ind, 1);
                return;
            }
            else if (clEsaurite){
                insertAlunnoInClass(objalunno, objclasse);
                listAlunni.splice(ind, 1);
                return;
            }
        }
        else if (clEsaurite){
            insertAlunnoInClass(objalunno, objclasse);
            listAlunni.splice(ind, 1);
            return;
        }
    }
    else if (clEsaurite){
            insertAlunnoInClass(objalunno, objclasse);
            listAlunni.splice(ind, 1);
            return;
        }
}

function popolamentoInClassi(){
    var blocco;
    alert("popolamento classi");
    for (i = 0; i < listClass.length; i++){
        blocco = false;
        //alert(listClass[i].nome + ". Alunni da assegnare: " + listAlunni.length);
        while (listClass[i].alunni.length <= impostazioni.studXClMax){
            var ind = Math.floor(Math.random() * listAlunni.length);
            controlloIdoneità(listAlunni[ind], listClass[i], ind); //insertAlunnoInClass()
            /*
            if (listClass[i].alunni.length >= (impostazioni.studXClMax / 2)){
                controlloIdoneità(listAlunni[ind], listClass[i], ind); //insertAlunnoInClass()
            }
            else{
                insertAlunnoInClass(listAlunni[ind], listClass[i]);
                listAlunni.splice(ind, 1);
            }*/
            //questo controllo va in fondo in questa maniera tale che se rimane qualche alunno da inserire può essere inserito finchè non raggiunge il massimo stabilito
            //alert(listClass[i].alunni + " , " + listClass[i].alunni.length);
            console.log("indice " + i);
            if (i >= listClass.length){
                break;
            } else if (listClass[i].alunni.length >= impostazioni.studXClMin){
                break;
            }
        }
    }
    clEsaurite = true;
    if (listAlunni.length > 0 && clEsaurite){
        popolamentoInClassi();
    }
    alert("popolamento completata");
}

function printClassi(){
    var text = "";
    alert("indice:" + listClass.length);
    for (i = 0; i < listClass.length; i++){
        alert(listClass[i].nome + " ," + i);
        text += "<h3>" + listClass[i].nome + "</h3><br/>";
        for (k = 0; k < listClass[i].alunni.length; k++){
            text += listClass[i].alunni[k].nome + " ," +  listClass[i].alunni[k].cognome + " ,cf" + listClass[i].alunni[k].cf + "<br/>";
        }
        alert("Io di qui ci esco");
        text += "media classe: " + mediaClasse(listClass[i]) + "<br/>";
    }
    document.getElementById("print").innerHTML = text;
}