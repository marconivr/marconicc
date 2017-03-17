# Composizione classi

## Installazione e lancio<a id="installazione"></a>
### Database
Nome: composizione_classi
Utente: composizioneclassi
Password: 5BFF9B615FBEDCD197BFB9371BB5A7D1

### Installazione
Elenco passi da eseguire per installare il progetto:


- cd composizione_classi
- npm install
- cd public
- bower install

### Lancio

Elenco passi da eseguire per lanciare il progetto:


- creare il db su mysql,copiando l'sql in script->composizione_classi.sql
- node server.js  (nella directory composizione_classi)


## Progettazione

### Spina di pesce
### WBS
### GANTT
### Matrice responsabilità
![](img\matrice_responsabilita.png)
### Unità organizzative
![](img\unita_organizzative.png)
### Strumenti utilizzati
- WebStorm
- NodeJs
- Trello
- Visio

## Architettura

### Ruoli
- User
- Root

### Hardware
### Software

## Obiettivi sprint
### Sprint 1

- Creazione database
- Creazione interfacce principali(signup, signin, elenco-studenti, panoramica-classi)
- Implementazione algoritmo che genera casualmente classi
- Aggiunta proprietà principali di ogni classe (numero Alunni, femmine, media, bocciati)
- Possibilità di inserire delle proprietà specifiche per ogni studente(dsa, dca)