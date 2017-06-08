
/**
 * Created by mattiacorradi on 26/05/2017.
 */
"use strict";

const _ = require("lodash");
const data = require("./data");

const settings = data.settings;
const alunni = data.alunni;
const classi = data.classi;

const colors = require('colors').enabled = true;


let insiemi = _.groupBy(alunni, function (o) {
    return o.nazionalita;
});

_.forEach(insiemi, function (value, key) {
    insiemi[key] = _.groupBy(insiemi[key], function (o) {
        return o.cap;
    });
});

console.log(insiemi);