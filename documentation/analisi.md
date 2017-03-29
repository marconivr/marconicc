

# Struttura JSON per passaggio dati tra server e client

```
{
nome: nome della classe,
studenti: [
    {
     nome: nome,
     cognome: cognome,
     data_di_nascita,
     cf: codice fiscale,
     sesso: (M / F),
     cap: codice postale,
     cat: codice catastale,
     voto: per le prime voto di uscita dalle medie, per le seconde la media dei voti,
     condotta: sicuramente si avrà per le terze per le prime è da definire.(In caso verrà lasciato o nullo o verrà attribuito un valore uguale per tutti per lasciare gli algoritmi uguali),
     nazionalita: nazionalità,
     desiderata1: cf dello studente voluto,
     desiderata2: cf dello studente voluto,
     bs: (true/false) sia se è bes o sia se è dsa. Nei dati che ci vengono forniti non sappiamo la differenza,
     104: (true/false) alunni disabili,
     certificazione_linguistica: (true/false) gli alunni che hanno questa certificazione quindi con campo true vengono considerati NON madrelingua
    }
    ]
}
```


# Parametri da tenere in considerazione per la composizione delle classi:

| Tipologia     | Distribuzione                                                                                                                                                                                                                                                                                                                       | Settabile |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| Numero classi | divisione alunni. (non max min come adesso perchè se no non sì può sforare con i casi speciali)                                                                                                                                                                                                                                     | Sì        |
| 104           | max numero alunni per classe(l'anno scorso erano 23). Solo uno per classe (sono sono più di uno per classe si sfora)                                                                                                                                                                                                                | Sì        |
| 107           | spalmarli nelle classi                                                                                                                                                                                                                                                                                                              | -         |
| Desiderata    | Chi vuole stare con chi. Deve essere reciproco                                                                                                                                                                                                                                                                                      | -         |
| Ripetenti     | distribuzione voti nella classe deve avvicinarsi alla distribuzione complessiva di tutti gli studenti                                                                                                                                                                                                                               | -         |
| Femmine       | femmine distribuite a gruppi in base al numero stabilito                                                                                                                                                                                                                                                                            | Sì        |
| Nazionalità   |
| Cap           | Non max e min numero di alunni con stessa nazionalità per classe. Max numero di diverse nazionalità per classe                                                                                                                                                                                                                      | Sì        |
| Voto          | Del Marconi o di altre classe. Vanno distribuiti in base al numero di bocciati nelle prime. Poi si andrà ad intervenire a mano  per esigenze particolari del cdc. Gli studenti ripetenti delle medie non vengono considerati(per ragioni di probabilità perchè verranno inglobati probabilmente nel voto di uscita 6 dalle medie).  | -         |


#Info
- Chiedere a Bileddo come funziona l'input su spaggiari

