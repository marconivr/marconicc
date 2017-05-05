# Composizione classi

## Requisiti
- Mysql
- NodeJS
## Installazione e lancio
### Database
Nome: composizione_classi
Utente: composizioneclassi
Password: 5BFF9B615FBEDCD197BFB9371BB5A7D1

### Installazione
Elenco passi da eseguire per installare il progetto:

- cd composizione_classi
- npm install
- npm install bower -g
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
![Matrice di responsabilità ](/img/matrice_responsabilita.PNG)
### Unità  organizzative
![Unità  organizzative](/img/unita_organizzative.PNG)
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
- 2 GB di RAM
- CPU Quadcore
### Software
- WebStorm
- NodeJs
- Trello
- Visio
- Git
- Bitbucket
## Obiettivi sprint
### Sprint 1

- Creazione database
- Creazione interfacce web principali
- Implementazione algoritmo che genera casualmente classi
- Pagina 'Elenco alunni' con possibilità di ricerca
- Aggiunta proprietà  principali di ogni classe (numero Alunni, femmine, media, bocciati)
- Possibilita  di aggiungere tag agli alunni(dsa...)

### Sprint 2

- Creare classi utilizzando la logica degli insiemi
- Pagina impostazioni nella quale inserire delle caratteristiche che deve avere una classe ideale
- Importare impostazioni passate
- Statistiche real time