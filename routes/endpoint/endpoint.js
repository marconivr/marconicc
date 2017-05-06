/**
 *  endpoint.js
 *  In questo file ci sarà un oggetto contenente in variabile tutti gli endpoint
 *  5/5/2017
 */

module.exports = {

    utenti:{
        login : "/login",
        signup : "/signup",
        logout : "/logout",
        studenti : "/studenti",
        home : "/",
        creaUtente : "/crea-utente",

    }

    ,

    alunni:{
        uploadAlunniCsv :"/upload-alunni-csv",
        allTag: "/all-tag",
        studenti : "/studenti",
        updateTag : "/update-tag",
        allStudents :"/all-students",
        studentByCf :"/student-by-cf",
        panoramicaClassi : "/panoramica-classi",
        settings : "/settings",
        settingsPrime : "/settings-prime",
        settingsTerze : "/settings-terze",
        insertSettingsPrime : "/insert-settings-prime",
        insertSettingsTerze : "/insert-settings-terze",
    }


};