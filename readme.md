# Manuale tecnico marconiCC
 [guarda il risultato](https://vimeo.com/218364343)
## Prerequisiti
### Server

1. Node js (scaricabile tramite il seguente link: [nodejs](https://nodejs.org/it/))
2. MySQL (scaricabile tramite il seguente link: [mysql](https://mariadb.org/download/))

## Configurazione database

### Creazione Database e utente
	Nome_Database: composizione_classi
	Utente: composizioneclassi
	Password: 5BFF9B615FBEDCD197BFB9371BB5A7D1

### Creazione struttura del database
1. Aprire il file **new-db(unstable).sql** contenuto nella cartella **composizioneclassi/config/**
2. Copiare il contenuto ed eseguirlo sul DBMS (MySQL)

#### **Errori lanciati da MySQL**
Se il DBMS dovesse lanciare qualche errore eseguire il comando su MySQL per cancellare il database:

	drop database composizione_classi;

Una volta fatto questo bisogna copiare ed eseguire piccole porzioni del codice SQL sul DBMS fino ad arrivare alla fine.


## Installazione e lancio

### Installazione applicazione
Per installare l'applicazione digitare i seguenti comandi da console

	cd composizione_classi
	npm install
	npm install bower -g
	npm install pm2 -g
	cd public
	bower install

Una volta completata questa serie di operazioni ci si troverà in un percorso di questo tipo **/composizioneclassi/public**

### Lancio
Sempre da console per lanciare l'applicazione digitare il comando dalla cartella  **/composizioneclassi/**

	pm2 start server.js

Per tornare indietro dalla cartella **/composizioneclassi/public** alla **/composizioneclassi/**

## Produzione file di caricamento studenti
L'applicativo necessita di un file ben formattato per il caricamento degli studenti; il file deve essere un csv con questi campi:


| Nome campo    | Tipo di dato                                                                                                                                                                                                                                                                                                               | Descrizione |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| cognome | Stringa                                                                                                                                                                                                                                   | -      |
| nome           | Stringa                                                                                                                                                                                                              | -       |
| matricola          | Intero                                                                                                                                                                                                                                                                                                             | Codice numerico identificativo all'interno della scuola    |
| cf  | Stringa di 16 caratteri                                                                                                                                                                                                                                                                                     | Codice fiscale       |
| desiderata     | Stringa di 16 caratteri                                                                                                                                                                                                                             | Codice fiscale della persona con la quale l'alunno vuole stare in classe     |
| sesso       | Stringa di 1 carattere (M-F)                                                                                                                                                                                                                                                                            | Maschio o femmina        |
| data_di_nascita   |Data(gg/mm/aaaa)|-
| CAP           | Stringa di 5 caratteri(e.g. 00184)                                                                                                                                                                                                               | Codice di avviamento postale del comune in cui abita
| nazionalità           | Stringa| Nazionalità  dell'alunno
| legge_104          | Stringa | Individua un alunno disabile e contiene la sua specifica disabilità 
| legge_107|Stringa | Dislessia, disgrafia, disortografia e discalculia
| classe_precedente          | Stringa| -         |
| scelta_indirizzo         | Stringa| Indirizzo scelto prima di iscriversi        |
| anno_scolastico          | Stringa(aaaa-aaaa) |L'anno scolastico corrente         |
| codice_catastale         | Stringa di 4 caratteri | Codice catastale del comune di residenza     |
| voto|Intero di 2 caratteri | Voto d'uscita dalle medie    |
| classe_futura| Stringa  |  -    |
| descrizione|  Stringa| -    |


Esempio di record del csv:

	MARIO;ROSSI;10001;RSSMAR03D99L345B;AAAGBC01k99L797k;M;03/04/1999 00:00;00184;ITALIANA;DSA;;; INFORMATICA E TELECOMUNICAZIONI;2017-2018;H501;9;PRIMA;Simple description


## Cambiare la porta dell'applicativo
La porta di marconiCC è la **8080**

1. Con un qualsiasi editor aprire il file **server.js** che si trova nella cartella **/composizioneclasse/**
2. Cambiare il numero di questa istruzione *var port = 8080;*
3. Salvare il file

cd composizione_classi

-INSTALLAZIONE
npm install
-----

cd public
bower install

-LANCIARE
creare il db su mysql,copiando l'sql in script->composizione_classi.sql
node server.js  (nella directory composizione_classi)
