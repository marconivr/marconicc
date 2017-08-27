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
        insertUtente: "/insert-utente"
    }

    ,

    alunni:{
        exportSingleCsv: "/export-single-csv",
        exportSingleExcel: "/export-single-excel",
        uploadAlunniCsv :"/upload-alunni-csv",
        uploadAlunniRimandatiSettembre: "/upload-alunni-rimandati-settembre",
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
        deleteSetting : "/delete-setting",
        tagAlunni : "/tag-alunni",
        insertTag : "/insert-tag",
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
        getStudentsFromSpecifiCYear: "/get-students-from-specifiC-year",
        setActiveConfiguration : "/set-active-configuration",
        eliminaClassiCreate: "/delete-classes",
        eliminaStudenti: "/delete-studenti"
        
    }


};