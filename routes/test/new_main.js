/**
 * Created by mattiacorradi on 26/05/2017.
 */


const _ = require("lodash");
const data = require("./data");

const settings = data.settings;
const alunni = data.alunni;
const classi = data.classi;




class Classe {
    constructor(nome){
        this.nome = nome;
        this.alunni = [];
        this.proprieta = {};
    }

    setAlunno(alunno){
        this.alunni.push(alunno);
        this.proprieta = this.generaProprieta();

        let ris = this.checkAlunno();

        if (!Classe.checkValidazione(ris)){
            this.alunni.pop();
            return ris;
        }
        return "ok";
     }


    setBocciato(alunno){
        this.alunni.push(alunno);
        this.proprieta = this.generaProprieta();
    }

    static checkValidazione(ris){
        _.forEach(ris, function (value, key) {
            if(value === false){
                return false;
            }
        });

        return true;
    }

    checkAlunno(){
        let ris = {};
        if(!this.limitiAlunni()){
            ris.limitiAlunni = false;
        }

        if(!this.legge_104_107()){
            ris.legge_104_107 =false;
        }

        if(!this.femmine()){
            ris.femmine = false;
        }

        if(!this.nazionalita()){
            ris.nazionalita = false;
        }

        if(!this.cap()){
            ris.cap = false;
        }

        return ris;
    }


    limitiAlunni(){
        if(this.alunni.length > settings.max_alunni){
            return false;
        }

        return true;
    }


    cap(){
        let n_cap = Object.keys(this.proprieta.cap).length;

        if(n_cap > settings.nazionalita_per_classe){
            return false;
        }

        _.forEach(this.proprieta.nazionalita, function (key, value) {
            if(value > settings.gruppo_cap){
                return false;
            }
        });

        return true;
    }

    nazionalita(){
        let n_naz = Object.keys(this.proprieta.nazionalita).length;

        if(_.has(this.proprieta.nazionalita, "ITALIANA")){
            n_naz--;
        }

        if(n_naz > settings.nazionalita_per_classe){
            return false;
        }

        _.forEach(this.proprieta.nazionalita, function (key, value) {
            if(value > settings.gruppo_nazionalita){
                return false;
            }
        });

        return true;
    }

    femmine(){
        if(this.proprieta.femmine > settings.gruppo_femmine){
            return false;
        }
        return true;
    }

    legge_104_107(){
        if(this.proprieta.n_legge_104 > 0 && this.proprieta.n_legge_107 > 0){
            return false;
        }

        if(this.proprieta.n_legge_104 > 0 && this.alunni.length > settings.numero_alunni_con_104){
            return false;
        }

        return true;
    }

    generaProprieta(){

        let n_femmine = _(_.filter(this.alunni, function (o) {
            if (o.sesso.toLowerCase() === "f") {
                return o.sesso
            }

        })).size();

        let nazionalita = _.countBy(this.alunni, function (o) {
            return o.nazionalita;
        });

        let cap = _.countBy(this.alunni, function (o) {
            return o.cap;
        });

        let voto = _.countBy(this.alunni, function (o) {
            return o.voto;
        });

        let n_legge_107 = _(_.filter(this.alunni, function (item) {
            if (item.legge_107 !== "") {
                return item;
            }
        })).size();

        let n_legge_104 = _(_.filter(this.alunni, function (item) {
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
}



let classe1 = new Classe("1A");

for(i in alunni){
    console.log(classe1.setAlunno(alunni[i]));
}

console.log(classe1);
