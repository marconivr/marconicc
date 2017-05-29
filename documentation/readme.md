# Composizione classi

##Obiettivi
Fornire uno strumento alla scuola in grado di comporre le classi in modo automatico, in base a dei parametri personalizzabili dall'utente*-

##Deliverables

 - Analisi e specifiche
 - WBS
 - Gantt
 - Organigramma progetto
 - Unità organizzative
 - Tecnologie utilizzate


## Requisiti
- Mysql
- NodeJS
## Installazione e lancio
### Database
Nome: composizione_classi
Utente: composizioneclassi
Password: 5BFF9B615FBEDCD197BFB9371BB5A7D1

### Installazione
Elenco passi da eseguire per installare il progetto.
Digitare i seguenti comandi da console

- cd composizione_classi
- npm install
- npm install bower -g
- cd public
- bower install

### Lancio

Elenco passi da eseguire per lanciare il progetto:


- creare il db su mysql,copiando l'sql in script->composizione_classi.sql
- Da linea di comando digitare `node server.js`  (nella directory composizione_classi)


## Progettazione

### WBS
### GANTT
### Matrice responsabilità
### Unità  organizzative
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
- Trello (Link al progetto: [https://trello.com/composizioneclassi](https://trello.com/composizioneclassi))
- Visio
- Git
- Bitbucket
## Obiettivi sprint
### Sprint 1

- Individuazione dei requisiti del progetto
- Creazione database
- Creazione interfacce web principali
- Implementazione algoritmo che genera casualmente classi
- Pagina 'Elenco alunni' con possibilità di ricerca
- Aggiunta proprietà  principali di ogni classe (numero Alunni, femmine, media, bocciati)
- Possibilita  di aggiungere tag agli alunni()

### Sprint 2

- Creare classi utilizzando la logica degli insiemi
- Pagina impostazioni nella quale inserire delle caratteristiche che deve avere una classe ideale
- Importare impostazioni passate
- Statistiche real time
- Modifica barra del menu
- Gestione history e possibilità di restore delle modifiche

### Sprint 3
- Possibilità di creazione di altre scuole
- Aggiunta diritti per gli utenti(0 admin, 1 modifica, 2 visualizza)
- Pagina tag(e.g *La religione*) in cui poterne inserire di nuovi
- Dropdown classi
- Possibilità inserimento nuovi utenti