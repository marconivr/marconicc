var flag = {
  "ITALIANA" : "it",
  "CINGALESE" : "lk",
  "BANGLADESE": "bd",
  "ROMENA" : "ro",
  "CINESE" : "cn",
  "MAROCCHINA" : "ma",
  "PARAGUAIANA" : "py",
  "TUNISINA" : "tn",
  "FILIPPINA" : "ph",
  "ALBANESE" : "al",
  "MOLDAVA" : "md",
  "LETTONE" : "lv",
  "BRASILIANA" : "br",
  "NIGERIANA" : "ng",
  "GHANESE" : "gh",
  "PERUVIANA" : "pe",
  "CUBANA" : "cu",
  "CROATA" : "hr",
  "SENEGALESE" : "sn"
};


var colorJson = {
    aqua: "#00ffff",
    azure: "#f0ffff",
    black: "#000000",
    blue: "#0000ff",
    brown: "#a52a2a",
    darkcyan: "#008b8b",
    darkgrey: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkolivegreen: "#556b2f",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    green: "#008000",
    indigo: "#4b0082",
    khaki: "#f0e68c",
    lime: "#00ff00",
    magenta: "#ff00ff",
    maroon: "#800000",
    navy: "#000080",
    orange: "#ffa500",
    red: "#ff0000",
    yellow: "#ffff00"
};


var newObj = {};

var colorArray = [];

for (var prop in colorJson){
  colorArray.push(colorJson[prop]);
}


console.log(colorArray);


i = 0;
for (var prop in flag){
    newObj[prop] = {'iso':flag[prop],'color':colorArray[i]};
    i++;
}



console.log(newObj);


var newFlagJson =  { ITALIANA: { iso: 'it', color: '#2F3F73' },
    CINGALESE: { iso: 'lk', color: '#609C35' },
    BANGLADESE: { iso: 'bd', color: '#B18F3C' },
    ROMENA: { iso: 'ro', color: '#A03753' },
    CINESE: { iso: 'cn', color: '#5C368D' },
    MAROCCHINA: { iso: 'ma', color: '#008b8b' },
    PARAGUAIANA: { iso: 'py', color: '#C05F30' },
    TUNISINA: { iso: 'tn', color: '#122D85' },
    FILIPPINA: { iso: 'ph', color: '#bdb76b' },
    ALBANESE: { iso: 'al', color: '#556b2f' },
    MOLDAVA: { iso: 'md', color: '#d90368' },
    LETTONE: { iso: 'lv', color: '#e9967a' },
    BRASILIANA: { iso: 'br', color: '#2e294e' },
    NIGERIANA: { iso: 'ng', color: '#ffd400' },
    GHANESE: { iso: 'gh', color: '#f0e68c' },
    PERUVIANA: { iso: 'pe', color: '#a99985' },
    CUBANA: { iso: 'cu', color: '#16db93' },
    CROATA: { iso: 'hr', color: '#048ba8' },
    SENEGALESE: { iso: 'sn', color: '#a4036f' } };