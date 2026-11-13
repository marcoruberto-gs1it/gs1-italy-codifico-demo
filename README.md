# GS1 Italy Codifico+ — demo GS1 Digital Link

Ambiente demo di **Codifico+** che mostra la nuova funzionalità di creazione e gestione dei
**GS1 Digital Link** di un prodotto. La UI segue il documento di analisi dei requisiti UX/UI (Google Doc, giugno-agosto 2026) e
riproduce il Figma
[GS1 Digital Link - Codifico](https://www.figma.com/design/COyGfp3zoT7vHmZvrEayzr/GS1-Digital-Link---Codifico).

Per ora è solo frontend: non c'è backend e i dati restano in `sessionStorage`, quindi ogni
scheda del browser riparte pulita.

## Demo online

https://marcoruberto-gs1it.github.io/gs1-italy-codifico-demo/

Il sito si aggiorna da solo a ogni push su `main` (workflow
`.github/workflows/deploy-pages.yml`).

## Avvio

```bash
npm install
npm start          # http://localhost:4200
npm run build      # build di produzione in dist/
```

## Cosa si può fare

La demo si apre sulla home. I prodotti consultabili, con l'etichetta "Demo" nell'elenco, sono
cinque, tutti con GTIN su prefissi GS1 Italy e dati di fantasia:

| GTIN | Prodotto | Stato | Brindo |
|---|---|---|---|
| `8000000000934` | vino frizzante bianco 1Lt (il prodotto del Figma) | Finalizzato | sì |
| `8032089002028` | Spaghetti di semola di grano duro 500 g | Finalizzato | no |
| `8032089000673` | Biscotti frollini 350 g | Finalizzato | no |
| `8000000000521` | Olio extravergine di oliva 50 cl | Finalizzato | no |
| `8032089415217` | Spumante brut 750 ml | Bozza | no |

I prodotti senza Brindo non hanno la tab Brindo: servono a provare il GS1 Digital Link come
un'azienda che non usa il servizio. Lo spumante in bozza serve a vedere che senza
finalizzazione non ci sono né la tab Digital Link né il QR code. Ogni prodotto ha i propri link.

La demo segue la specifica tecnica "Gestione GS1 Digital Link in Codifico" v2.4 (03/09/2026,
ticket 3397) per ordine delle tab, link Brindo in tabella, colonna Attivo, verifica di
raggiungibilità e visibilità sui soli prodotti finalizzati.

- **Home ("Benvenuto in Codifico!")**: ricostruita sulla home attuale, con la novità del GS1
  Digital Link nel banner in alto, nella colonna "Digital Link" degli ultimi codici e nel
  grafico del livello di riempimento degli attributi. Il GS1 Digital Link è per prodotto, quindi
  dalla home non si apre un prodotto a caso: il pulsante del banner porta all'elenco dei prodotti
  ("Scegli un prodotto da collegare"). Il QR del banner è un'illustrazione, non un codice leggibile.
- **Prodotti a peso fisso**: l'elenco come in Codifico+ (ricerca, ordinamento, paginazione,
  filtri con conteggi, esportazione CSV funzionante), con il filtro "GS1 Digital Link" e la
  colonna "Digital Link" come nella home: "N link" se ci sono link attivi, "+ Configura Digital
  Link" sui prodotti finalizzati che non ne hanno, "—" sulle bozze. Il menu ⌄ di ogni riga ha
  Genera barcode, Crea variante, Crea imballo e la novità "Crea/Gestisci GS1 Digital Link",
  disattivata sulle bozze.
- **Video tutorial e guida PDF**: il video si apre in una finestra modale dal banner della home
  ("Guarda il video"), da Risorse utili › Tutorial e dalla tab Digital Link; la guida si scarica
  dagli stessi punti. Il video (`public/tutorial/`) è registrato dalla demo stessa;
  la guida rapida (`public/guida/`, 9 pagine) usa le stesse schermate. Il video (2:51, 19 scene)
  ha i **sottotitoli in italiano** (`tutorial-gs1-digital-link.it.vtt`, attivi per default e
  disattivabili dal player, e anche come traccia dentro l'MP4), sincronizzati scena per scena;
  le didascalie numerate sono impresse in alto. Video e guida sono allineati alla demo del
  13/11/2026.
- **Stato vuoto**: all'inizio non ci sono link ("Nessun Link ancora creato").
- **Aggiungi, modifica, disattiva i link**: per ogni link si sceglie URL di destinazione,
  tipologia e lingua.
  - La tabella ha le colonne Tipologia, URL, Lingua, **Attivo** e le azioni Modifica e
    **Disattiva**. Disattivare è una disattivazione logica (specifica §3): il link resta in
    tabella barrato come "Disattivato", il resolver non lo usa più e si può **Riattiva**re (se
    non c'è già un link attivo con stessa tipologia e lingua). Se si disattiva la Destinazione
    Principale, subentra il primo link attivo rimasto.
  - **Risorsa non disponibile** (specifica §4.2): dopo il salvataggio la pagina di destinazione
    viene verificata; se risponde con errore compare l'avviso e il link mostra l'etichetta
    "Risorsa non disponibile", ma resta salvato. Nella demo la verifica è simulata: risponde 404
    un URL che contiene `404` o `non-disponibile`, o che usa il dominio `.invalid`.
  - Le tipologie sono i 60 `linkType` del GS1 Web Vocabulary
    (https://ref.gs1.org/voc/?show=linktypes), tradotti in italiano. Quelle riservate al
    resolver e quella deprecata non si possono scegliere; le tre del settore sanitario sono
    visibili ma disattivate.
  - Le lingue sono tag BCP 47 (`it`, `en-GB`, `es-419`…), cioè il formato di
    `Accept-Language` e di `hreflang`: l'elenco delle lingue proposte dai browser, tenendo solo
    quelle che il motore Intl riconosce. Il nome è scritto per esteso in italiano.
  - L'URL viene controllato mentre si scrive (requisiti §4.1 e §8): deve essere https e non
    può essere un accorciatore di link né un **dominio social** (Facebook, Instagram, TikTok,
    YouTube…), per nessuna tipologia: sono pagine che l'azienda non controlla e possono
    cambiare o sparire, mentre il QR code resta stampato per anni. Per questo la tipologia
    "Social Media" è visibile ma non selezionabile.
  - Due link attivi con la stessa tipologia e la stessa lingua non sono ammessi.
- **Link generati da Brindo** (specifica §4.1): sui vini Brindo i link delle annate
  (`/01/{gtin}/22/{variante}`, uno per annata) compaiono nella tabella della tab Digital Link con
  la dicitura "Generato automaticamente dal servizio Brindo", senza azioni. Finché l'azienda non
  ha link propri compaiono sotto lo stato vuoto, con una nota: valgono solo per i QR code delle
  annate. Gli indirizzi della demo usano il dominio riservato `.example`.
- **Ecologicamente** per ora non genera link nel GS1 Digital Link: è fuori dal perimetro della
  release 1.
- **Destinazione Principale**: il link predefinito (il `defaultLink` del resolver). Il primo
  link creato lo diventa in automatico.
- **URL Base e QR**: es. `https://id.gs1it.org/01/08000000000934` (resolver di GS1 Italy), con il
  GTIN su 14 cifre, non modificabile. È l'indice di tutti i link del prodotto e un QR statico
  (solo GTIN, niente lotto, scadenza o seriale).
- **Anteprima della scansione**: cliccando il QR si sceglie la lingua del telefono (es.
  `en-GB`) e la tipologia richiesta. Il resolver simulato negozia la lingua come un server
  (tag identico, poi lingua base, poi altra variante), mostra dove arriva il consumatore e
  perché, e il linkset JSON (RFC 9264).
- **Genera barcode/QR code**, in tre passi:
  1. EAN-13 oppure QR Code GS1 Digital Link;
  2. contenuto: solo GTIN, oppure GTIN + variante Brindo (AI 22, annata), con testo in chiaro
     (HRI) facoltativo e l'indicazione di dove arriva chi scansiona. Sui prodotti Brindo nessuna
     scelta è preselezionata;
  3. download in **EPS** o **PDF** vettoriali, generati nel browser. Su un prodotto Brindo il QR
     "Solo GTIN" mostra l'avviso concordato prima del download; il nome del file riporta il
     contenuto codificato (GTIN e, se presente, variante e annata).
  Il wizard si apre solo sui prodotti finalizzati (sulle bozze il pulsante è disattivato) e il
  QR code GS1 Digital Link si scarica solo se il prodotto ha almeno un link attivo.
- **Ordine delle tab** (specifica §2, conferma del 19/08/2026): Base, Digital Link,
  Ecologicamente, Brindo. La tab Digital Link c'è solo sui prodotti finalizzati.
- **Linkset**: con la stessa tipologia in più lingue include `gs1:defaultLinkMulti`, un URL per
  lingua.
- **Tab Brindo**: l'etichetta elettronica del vino. Ogni annata ha il proprio link
  `/01/{gtin}/22/{cpv}`.
- **Tab Base**: ricalca la scheda di Codifico+ in produzione. Contiene il riepilogo prodotto
  (GTIN, descrizione, misure, contenuto netto, paesi di vendita, varie), gli imballi che
  contengono il prodotto (GTIN-14 con indicatore 1-3) e il riquadro "Richiesta aggiornamento".
  I dati sono di fantasia.
- **Tab Ecologicamente**: l'etichetta ambientale. Nel Figma è solo uno sfondo, quindi qui è
  ricostruita.
- **Menu utente** (in alto a destra): *Carica l'esempio completo* (link di esempio su tutti i
  prodotti; per il vino sono quelli dell'ultima schermata del Figma) e *Ripristina la demo*.

Le voci di menu che non fanno parte della demo rispondono con l'avviso "Sezione non inclusa
nella demo".

## Struttura

| Percorso | Contenuto |
|---|---|
| `src/app/core/gs1.ts` | Check digit, GTIN-14, URI GS1 Digital Link, HRI |
| `src/app/core/vocabulary.ts` | Tipologie di link (linkType) e lingue |
| `src/app/core/resolver.ts` | Resolver simulato, linkset, validazione URL |
| `src/app/core/barcode/` | EAN-13 e QR come disegni vettoriali, export SVG/EPS/PDF |
| `src/app/core/demo-store.ts` | Stato della demo (signals + sessionStorage) |
| `src/app/core/demo-data.ts` | I prodotti della demo e i link di esempio |
| `src/app/shell/` | Intestazione e menu di Codifico+ |
| `src/app/pages/dashboard/` | Home "Benvenuto in Codifico!" |
| `src/app/pages/products/` | Prodotti a peso fisso |
| `src/app/pages/product/` | Scheda prodotto: tab, colonna laterale, dialog, wizard, anteprime |
| `public/tutorial/`, `public/guida/` | Video tutorial (MP4) e guida rapida (PDF) |

## Note sugli standard

- Il GTIN-13 si scrive su 14 cifre nel Digital Link (`0` a sinistra).
- L'EAN-13 è generato con X = 0,33 mm (100% di ingrandimento), con margini chiari di 11 e 7
  moduli e una larghezza totale di 37,29 mm.
- Il QR usa la correzione d'errore M e un margine chiaro di 4 moduli. L'HRI sta sotto il
  margine chiaro, una riga per ogni AI.
- Nei file EPS e PDF il testo in chiaro usa Helvetica al posto di OCR-B.
