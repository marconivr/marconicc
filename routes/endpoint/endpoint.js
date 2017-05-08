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
        home : "/",
        creaUtente : "/crea-utente",
        unauthorized : "/unauthorized",
        exportSingleCsv: "/export-single-csv",

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
        tagAlunni : "/tag-alunni",
        insertSettingsPrime : "/insert-settings-prime",
        insertSettingsTerze : "/insert-settings-terze",
        insertPriorita: "/insert-priorita",
        studentiPrimaJson: "/studenti-prima-json",
        numeroRagazzePrima: "/numero-ragazze-prima",
        numeroStessoCap: "/numero-stesso-cap",
        getClassiComposte: "/get-classi-composte",
        generateClassi: "/generate-classi",
        moveStudent: "/move-student",
        getPastSettingsPrime: "/get-past-settings-prime",
        getDatiPrime: "/get-dati-prime",
        getHistory: "/get-history",
        removeStudentFromHistory: "/remove-student-from-history",
        getPastSettingsTerze: "/get-past-settings-terze",
    }


};