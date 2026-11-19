/**
 * Tipologie di link (linkType) del GS1 Web Vocabulary, tradotte in italiano.
 * Fonte: https://ref.gs1.org/voc/?show=linktypes (dati: https://ref.gs1.org/voc/data/linktypes),
 * 60 termini letti il 13 novembre 2026. L'id è il nome del termine (https://gs1.org/voc/{id}),
 * lo stesso che il resolver espone in ?linkType=gs1:{id} e nel linkset.
 *
 * Etichette e descrizioni vengono dalla "Tabella traduzione Linktype GS1" di GS1 Italy, tranne
 * che per appDownload, backgroundInfo, eifu, eventsInfo, loyaltyProgram, recallStatus,
 * registryEntry, relatedImage e reportFound, assenti dalla tabella. In tabella l'EPCIS compare
 * come gs1:epcis: il termine del vocabolario è epcisRepository.
 *
 * Non tutti i termini si possono scegliere quando si crea un link:
 * - defaultLink, defaultLinkMulti e handledBy sono riservati al resolver (restricted: resolver):
 *   il defaultLink in Codifico+ è la "Destinazione Principale";
 * - productSustainabilityInfo è deprecato: al suo posto si usa sustainabilityInfo;
 * - eifu, epil e smpc sono riservati al settore sanitario validato (validatedHealthcare);
 * - socialMedia non si usa in Codifico, che non ammette domini social come destinazione
 *   (requisiti §4.1 e §8).
 * Nel selettore compaiono solo i termini "selectable"; quelli deprecati restano leggibili sui
 * link già esistenti.
 */
export type LinkTypeAvailability = 'selectable' | 'healthcare' | 'resolver' | 'deprecated' | 'policy';

export interface LinkType {
  id: string;
  label: string;
  description: string;
  availability: LinkTypeAvailability;
  /** Per i termini deprecati: l'id del termine che lo sostituisce. */
  replacedBy?: string;
}

export const LINK_TYPES: readonly LinkType[] = [
  { id: 'activityIdeas', label: 'Idee per attività e intrattenimento', description: 'Collega a idee creative, giochi, tutorial ludico-educativi o attività d\'intrattenimento, particolarmente indicato per giocattoli e tempo libero.', availability: 'selectable' },
  { id: 'allergenInfo', label: 'Informazioni sugli allergeni', description: 'Collega al dettaglio completo degli allergeni presenti nella formulazione o derivanti da possibili contaminazioni crociate nel processo produttivo.', availability: 'selectable' },
  { id: 'appDownload', label: 'Download dell’app', description: "App per smartphone collegata all'entità.", availability: 'selectable' },
  { id: 'backgroundInfo', label: 'Storia e contesto', description: "Informazioni, di solito del titolare, sul contesto creativo dell'entità: ispirazione, innovazione, approccio, scienza o tecnologia utilizzate.", availability: 'selectable' },
  { id: 'brandHomepageClinical', label: 'Portale di brand per operatori clinici', description: 'Collega a una presenza online del marchio specificamente concepita per medici, farmacisti e professionisti della sanità.', availability: 'selectable' },
  { id: 'brandHomepagePatient', label: 'Portale di brand per pazienti', description: 'Collega a risorse e informazioni sul brand dedicate espressamente a pazienti, familiari e caregiver.', availability: 'selectable' },
  { id: 'careersInfo', label: 'Lavora con noi e carriere', description: 'Collega alla sezione carriere dell\'organizzazione con le opportunità di lavoro, posizioni aperte e invio curriculum vitae.', availability: 'selectable' },
  { id: 'certificationInfo', label: 'Certificazioni e conformità', description: 'Collega a documenti di conformità normativa, marchi di qualità (es. Bio, DOP, FSC, OEKO-TEX), licenze e attestati rilasciati da enti terzi accreditati.', availability: 'selectable' },
  { id: 'consumerHandlingStorageInfo', label: 'Modalità di conservazione e consumo', description: 'Fornisce indicazioni e precauzioni per il consumatore sulla corretta conservazione domestica (temperature, modalità di stoccaggio) e preparazione del prodotto.', availability: 'selectable' },
  { id: 'defaultLink', label: 'Collegamento predefinito', description: 'Destinazione standard associata all\'identificatore GS1 verso cui il resolver reindirizza quando la richiesta non specifica un linkType o parametri di contesto specifici.', availability: 'resolver' },
  { id: 'defaultLinkMulti', label: 'Collegamenti predefiniti multipli', description: 'Insieme di link predefiniti differenziati in base alle intestazioni HTTP della richiesta (es. lingua o tipo di media) per offrire la risorsa più adatta al client.', availability: 'resolver' },
  { id: 'dpp', label: 'Passaporto Digitale di Prodotto (DPP)', description: 'Collega al Passaporto Digitale del Prodotto conforme agli standard e ai regolamenti UE su tracciabilità, durabilità, riparabilità e composizione dei materiali.', availability: 'selectable' },
  { id: 'eifu', label: "Istruzioni per l'uso elettroniche (eIFU)", description: "Istruzioni per l'uso in formato elettronico per i dispositivi medici.", availability: 'healthcare' },
  { id: 'epcisRepository', label: 'Repository eventi EPCIS', description: 'Collega a un repository conforme allo standard GS1 EPCIS (Electronic Product Code Information Services) contenente dati su eventi fisici di tracciamento.', availability: 'selectable' },
  { id: 'epil', label: 'Foglio illustrativo elettronico (ePIL)', description: 'Collega al foglietto illustrativo in formato digitale per medicinali e prodotti sanitari, approvato dalle autorità regolatorie e destinato ai pazienti.', availability: 'healthcare' },
  { id: 'eventsInfo', label: 'Eventi', description: 'Dettagli di eventi. Per prenotazioni o appuntamenti si usa «Prenotazione e appuntamenti».', availability: 'selectable' },
  { id: 'faqs', label: 'Domande frequenti (FAQ)', description: 'Collega alla sezione di domande e risposte più comuni riguardanti caratteristiche, uso, garanzia e compatibilità del prodotto.', availability: 'selectable' },
  { id: 'handledBy', label: 'Reindirizzamento a resolver delegato', description: 'Utilizzato quando un resolver reindirizza automaticamente un pattern di URI verso un server o resolver delegato senza ulteriori elaborazioni interne.', availability: 'resolver' },
  { id: 'hasRetailers', label: 'Punti vendita e dove acquistare', description: 'Collega a localizzatori di negozi fisici (store locator) o rivenditori online autorizzati presso cui è possibile comprare l\'articolo.', availability: 'selectable' },
  { id: 'homepage', label: 'Homepage dell\'organizzazione', description: 'Collega alla pagina principale dell\'azienda o organizzazione proprietaria dell\'identificatore GS1.', availability: 'selectable' },
  { id: 'ingredientsInfo', label: 'Elenco degli ingredienti', description: 'Fornisce informazioni complete e strutturate sugli ingredienti contenuti nel prodotto (alimentare, cosmetico o formulato chimico).', availability: 'selectable' },
  { id: 'instructions', label: 'Istruzioni per l\'uso e montaggio', description: 'Collega a manuali utente, schede tecniche di montaggio, avvertenze operative e consigli pratici per l\'uso corretto e sicuro dell\'articolo.', availability: 'selectable' },
  { id: 'jws', label: 'Firma digitale JSON Web Signature', description: 'Collega a una firma crittografica JWS (JSON Web Signature) che attesta l\'autenticità e l\'integrità dei dati o del certificato digitale associato.', availability: 'selectable' },
  { id: 'leaveReview', label: 'Lascia una recensione', description: 'Fornisce un accesso diretto al modulo per consentire all\'acquirente di inserire una recensione o feedback sull\'articolo.', availability: 'selectable' },
  { id: 'locationInfo', label: 'Informazioni sulla posizione e mappa', description: 'Collega a mappe interattive, indicazioni stradali per raggiungere la sede, filiale o stabilimento.', availability: 'selectable' },
  { id: 'logisticsInfo', label: 'Informazioni logistiche di sede B2B', description: 'Collega a dettagli tecnici per corrieri e trasportatori (baie di carico/scarico, restrizioni per mezzi pesanti, procedure di accesso merci).', availability: 'selectable' },
  { id: 'loyaltyProgram', label: 'Programma fedeltà', description: 'Informazioni su un programma fedeltà, compresi lo stato del socio o la registrazione.', availability: 'selectable' },
  { id: 'masterData', label: 'Dati anagrafici B2B (Master Data)', description: 'Fornisce accesso a flussi o schede di dati anagrafici e logistici standardizzati (es. standard GDSN) per scambi interaziendali B2B.', availability: 'selectable' },
  { id: 'menuInfo', label: 'Menu e listino offerte', description: 'Collega al menu gastronomico o all\'elenco dei servizi disponibili presso una specifica struttura, locale o punto vendita.', availability: 'selectable' },
  { id: 'nutritionalInfo', label: 'Informazioni nutrizionali', description: 'Collega alla tabella della dichiarazione nutrizionale, valori energetici e apporto di nutrienti per porzione o per 100g/ml di prodotto.', availability: 'selectable' },
  { id: 'openingHoursInfo', label: 'Orari di apertura', description: 'Collega alle informazioni aggiornate su giorni e orari di apertura al pubblico o finestre temporali di servizio.', availability: 'selectable' },
  { id: 'paymentLink', label: 'Portale per effettuare pagamenti', description: 'Collega a una piattaforma protetta di pagamento digitale per saldare ordini, transazioni o prestazioni di servizi.', availability: 'selectable' },
  { id: 'pip', label: 'Pagina informativa di prodotto', description: 'Collega alla pagina ufficiale con informazioni dettagliate sull\'articolo (descrizione, immagini, caratteristiche e specifiche), gestita dal proprietario del brand o rivenditore e rivolta al consumatore.', availability: 'selectable' },
  { id: 'productSustainabilityInfo', label: 'Sostenibilità prodotto', description: 'Termine deprecato negli standard GS1 ufficiali; la specifica richiede ora l\'impiego del link type canonico gs1:sustainabilityInfo.', availability: 'deprecated', replacedBy: 'sustainabilityInfo' },
  { id: 'promotion', label: 'Promozioni e offerte commerciali', description: 'Collega a campagne promozionali attive, coupon digitali, sconti, concorsi o iniziative speciali associate al prodotto.', availability: 'selectable' },
  { id: 'purchaseSuppliesOrAccessories', label: 'Acquisto ricambi e accessori', description: 'Collega alla pagina di acquisto diretto di consumabili, filtri, componenti ausiliari o accessori ufficiali dedicati al prodotto.', availability: 'selectable' },
  { id: 'quickStartGuide', label: 'Guida rapida all\'avvio', description: 'Collega alla guida sintetica illustrata di primo utilizzo rapido (Quick Start Guide) per una rapida messa in esercizio del prodotto.', availability: 'selectable' },
  { id: 'recallStatus', label: 'Stato di richiamo', description: 'Indica se il prodotto è stato richiamato, di solito tramite API.', availability: 'selectable' },
  { id: 'recipeInfo', label: 'Ricette e suggerimenti gastronomici', description: 'Collega a ricette, preparazioni culinarie, video-ricette e abbinamenti alimentari che impiegano il prodotto.', availability: 'selectable' },
  { id: 'registerProduct', label: 'Registrazione del prodotto e garanzia', description: 'Collega al portale di registrazione del prodotto acquistato per convalidare la garanzia convenzionale o estesa e ricevere assistenza prioritaria.', availability: 'selectable' },
  { id: 'registryEntry', label: 'Voce in un registro', description: 'Voce in un registro, ad esempio delle imprese o delle località (numeri ufficiali, LEI e simili).', availability: 'selectable' },
  { id: 'relatedImage', label: 'Immagine correlata', description: "Un'immagine che rappresenta l'entità identificata o che la riguarda.", availability: 'selectable' },
  { id: 'relatedVideo', label: 'Video descrittivi e dimostrativi', description: 'Collega a filmati multimediali, video dimostrativi, spiegazioni visive o spot legati al prodotto e al suo utilizzo.', availability: 'selectable' },
  { id: 'reportFound', label: 'Segnala un ritrovamento', description: "Servizio per segnalare il ritrovamento di un oggetto e ricollegarlo al proprietario o alle autorità.", availability: 'selectable' },
  { id: 'review', label: 'Recensioni e valutazioni dei clienti', description: 'Collega all\'elenco delle valutazioni, opinioni e recensioni verificate pubblicate da consumatori e acquirenti.', availability: 'selectable' },
  { id: 'safetyInfo', label: 'Informazioni sulla sicurezza', description: 'Collega a informazioni di sicurezza, avvertenze sui rischi, simboli di pericolo, schede di sicurezza (SDS) o istruzioni di primo soccorso.', availability: 'selectable' },
  { id: 'scheduleTime', label: 'Prenotazione e appuntamenti', description: 'Collega a una piattaforma per fissare appuntamenti, prenotare visite, servizi o fasce orarie.', availability: 'selectable' },
  { id: 'serviceInfo', label: 'Assistenza tecnica e manutenzione', description: 'Collega alle istruzioni di manutenzione periodica, risoluzione guasti, parti di ricambio e contatti della rete di assistenza autorizzata.', availability: 'selectable' },
  { id: 'smartLabel', label: 'Pagina SmartLabel', description: 'Collega alla pagina ufficiale SmartLabel dell\'iniziativa per la trasparenza alimentare e di cura della persona (mercato nordamericano).', availability: 'selectable' },
  { id: 'smpc', label: 'Riassunto Caratteristiche Prodotto (RCP/SmPC)', description: 'Documento tecnico-scientifico ufficiale rivolto specificamente agli operatori sanitari contenente le indicazioni terapeutiche e posologiche approvate.', availability: 'healthcare' },
  { id: 'socialMedia', label: 'Canali social media', description: 'Collega ai profili o canali social media ufficiali dell\'azienda o del brand (es. Instagram, YouTube, TikTok).', availability: 'policy' },
  { id: 'statisticInfo', label: 'Statistiche e report aziendali', description: 'Collega a relazioni annuali, report finanziari, indicatori ESG o statistiche pubbliche relative all\'organizzazione o stabilimento.', availability: 'selectable' },
  { id: 'subscribe', label: 'Iscrizione a newsletter o servizi', description: 'Collega a moduli online per l\'iscrizione a newsletter, bollettini informativi, canali di notifica o programmi fedeltà.', availability: 'selectable' },
  { id: 'support', label: 'Supporto e servizio clienti', description: 'Collega ai canali diretti di assistenza clienti (chat dal vivo, centro assistenza, numero verde, modulo ticket o supporto email).', availability: 'selectable' },
  { id: 'sustainabilityInfo', label: 'Informazioni su sostenibilità e riciclo', description: 'Collega a dati e linee guida sulle pratiche di sostenibilità, smaltimento dei materiali, etichettatura ambientale per il riciclo e impronta ecologica del prodotto.', availability: 'selectable' },
  { id: 'traceability', label: 'Informazioni di tracciabilità', description: 'Collega a dati storici sulla catena di fornitura, tracciamento dal luogo di origine alla distribuzione e dettagli specifici di filiera.', availability: 'selectable' },
  { id: 'tutorial', label: 'Tutorial e videoguide formative', description: 'Collega a tutorial didattici, corsi online, guide formative passo-passo e dimostrazioni operative dell\'articolo.', availability: 'selectable' },
  { id: 'userAgreement', label: 'Termini, condizioni e accordi legali', description: 'Collega al contratto di licenza per l\'utente finale (EULA), termini di servizio, informative legali o liberatorie.', availability: 'selectable' },
  { id: 'verificationService', label: 'Servizio di verifica autenticità', description: 'Collega al servizio di messaggistica leggera GS1 per verificare istantaneamente la validità dell\'identificatore e lo stato del prodotto contro contraffazioni.', availability: 'selectable' },
  { id: 'whatsInTheBox', label: 'Contenuto della confezione', description: 'Descrizione visiva ed elenco completo di tutti i componenti, accessori, cavi e materiali inclusi all\'interno dell\'imballaggio.', availability: 'selectable' },
];

/**
 * Le tipologie "Più utilizzato: Sì" della Tabella traduzione Linktype GS1, nell'ordine della
 * tabella, in cima al selettore. Due non compaiono perché in Codifico non si possono scegliere:
 * defaultLink (è la Destinazione Principale) ed epil (riservato al settore sanitario).
 * La tabella cita anche gs1:brandHomepage, che non esiste nel GS1 Web Vocabulary.
 */
export const COMMON_LINK_TYPE_IDS = [
  'pip',
  'defaultLink',
  'sustainabilityInfo',
  'dpp',
  'instructions',
  'ingredientsInfo',
  'allergenInfo',
  'nutritionalInfo',
  'consumerHandlingStorageInfo',
  'safetyInfo',
  'certificationInfo',
  'traceability',
  'epil',
  'promotion',
  'relatedVideo',
  'recipeInfo',
  'review',
  'serviceInfo',
  'support',
  'faqs',
  'registerProduct',
  'hasRetailers',
  'quickStartGuide',
] as const;

export function linkType(id: string): LinkType | undefined {
  return LINK_TYPES.find((t) => t.id === id);
}

export function linkTypeLabel(id: string): string {
  return linkType(id)?.label ?? id;
}

/* ---- Opzioni del selettore "Tipologia" -------------------------------------------------------- */

/** Una tipologia come la usa il selettore: il codice è in forma compatta, es. "gs1:pip". */
export interface LinkTypeOption {
  code: string;
  label: string;
  description: string;
  /** In cima al selettore, nel gruppo "Più utilizzati". */
  popular: boolean;
  status: 'stable' | 'deprecated';
  /** Per i valori deprecati: il codice del valore che lo sostituisce. */
  replacedBy?: string;
}

export const toLinkTypeCode = (id: string): string => `gs1:${id}`;
export const fromLinkTypeCode = (code: string): string => code.replace(/^gs1:/, '');

const toOption = (t: LinkType): LinkTypeOption => ({
  code: toLinkTypeCode(t.id),
  label: t.label,
  description: t.description,
  popular: (COMMON_LINK_TYPE_IDS as readonly string[]).includes(t.id),
  status: t.availability === 'deprecated' ? 'deprecated' : 'stable',
  ...(t.replacedBy ? { replacedBy: toLinkTypeCode(t.replacedBy) } : {}),
});

/**
 * Le opzioni del selettore: prima le più usate nell'ordine di COMMON_LINK_TYPE_IDS, poi le altre.
 * Ci sono anche i termini deprecati, che il selettore non elenca ma mostra se un link esistente
 * li usa. Restano fuori quelli riservati al resolver, al settore sanitario o non ammessi.
 */
const inSelector = (t: LinkType) => t.availability === 'selectable' || t.availability === 'deprecated';

export const LINK_TYPE_OPTIONS: readonly LinkTypeOption[] = [
  ...COMMON_LINK_TYPE_IDS.map((id) => linkType(id)!).filter(inSelector),
  ...LINK_TYPES.filter(
    (t) => inSelector(t) && !(COMMON_LINK_TYPE_IDS as readonly string[]).includes(t.id),
  ),
].map(toOption);

/* ---- Lingue --------------------------------------------------------------------------------- */

/**
 * Lingue come tag BCP 47 (RFC 5646): lo stesso formato che il browser invia in Accept-Language
 * e che il linkset usa in hreflang. L'elenco è quello delle lingue che i browser propongono
 * nelle impostazioni (lingue e varianti regionali più comuni); restano solo i tag che il
 * motore Intl riconosce, cioè quelli con un nome ufficiale.
 */
export interface Language {
  /** Tag BCP 47, es. "it", "en-GB", "es-419". */
  code: string;
  /** Nome completo in italiano, es. "Inglese (Regno Unito)". */
  label: string;
}

const WEB_LANGUAGE_TAGS =
  'af sq am ar hy as ast az eu be bn bs br bg ca ckb zh zh-CN zh-TW zh-HK co hr cs da nl en en-AU en-CA en-IN en-NZ en-ZA en-GB en-US eo et fo fil fi fr fr-CA fr-FR fr-CH gl ka de de-AT de-DE de-LI de-CH el gn gu ha haw he hi hmn hu is ig id ia ga it it-IT it-CH ja jv kn kk km rw ko ku ky lo la lv ln lt lb mk mg ms ml mt mi mr mn my ne nb nn ny oc or om ps fa pl pt pt-BR pt-PT pa qu ro rm ru gd sr sn sd si sk sl so st es es-AR es-419 es-CL es-CO es-CR es-HN es-MX es-PE es-ES es-US es-UY es-VE su sw sv tg ta tt te th ti to tr tk uk ur ug uz vi cy fy xh yi yo zu'.split(
    ' ',
  );

/** Le lingue più usate, in cima al menu. */
export const COMMON_LANGUAGE_CODES = ['it', 'en', 'fr', 'de', 'es'] as const;

const displayNames = (() => {
  try {
    return new Intl.DisplayNames(['it'], { type: 'language', fallback: 'none', languageDisplay: 'standard' });
  } catch {
    return null;
  }
})();

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase('it') + s.slice(1);

/** Nome italiano di un tag riconosciuto, oppure null se il tag non è valido o non ha un nome. */
function recognizedName(tag: string): string | null {
  let canonical: string;
  try {
    canonical = Intl.getCanonicalLocales(tag)[0];
  } catch {
    return null;
  }
  const name = displayNames?.of(canonical);
  if (!name || name.toLowerCase() === canonical.toLowerCase()) return null;
  return capitalize(name);
}

export const LANGUAGES: readonly Language[] = WEB_LANGUAGE_TAGS.flatMap((tag) => {
  const label = recognizedName(tag);
  return label ? [{ code: Intl.getCanonicalLocales(tag)[0], label }] : [];
}).sort((a, b) => a.label.localeCompare(b.label, 'it'));

export const LANGUAGE_GROUPS = {
  common: COMMON_LANGUAGE_CODES.map((code) => LANGUAGES.find((l) => l.code === code)!),
  others: LANGUAGES.filter((l) => !(COMMON_LANGUAGE_CODES as readonly string[]).includes(l.code)),
};

export function languageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? recognizedName(code) ?? code;
}

/** Lingua base di un tag: "en-GB" → "en". */
export function primaryLanguage(tag: string): string {
  return tag.split('-')[0].toLowerCase();
}

/** Valore di Accept-Language come lo invierebbe un browser: "en-GB,en;q=0.9". */
export function acceptLanguageHeader(tag: string): string {
  const base = primaryLanguage(tag);
  return base === tag.toLowerCase() ? tag : `${tag},${base};q=0.9`;
}
