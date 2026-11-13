/**
 * Tipologie di link (linkType) del GS1 Web Vocabulary, tradotte in italiano.
 * Fonte: https://ref.gs1.org/voc/?show=linktypes (dati: https://ref.gs1.org/voc/data/linktypes),
 * 60 termini letti il 13 novembre 2026. L'id è il nome del termine (https://gs1.org/voc/{id}),
 * lo stesso che il resolver espone in ?linkType=gs1:{id} e nel linkset.
 *
 * Non tutti i termini si possono scegliere quando si crea un link:
 * - defaultLink, defaultLinkMulti e handledBy sono riservati al resolver (restricted: resolver):
 *   il defaultLink in Codifico+ è la "Destinazione Principale";
 * - productSustainabilityInfo è deprecato: al suo posto si usa sustainabilityInfo;
 * - eifu, epil e smpc sono riservati al settore sanitario validato (validatedHealthcare):
 *   restano visibili ma non selezionabili;
 * - socialMedia non si usa in Codifico, che non ammette domini social come destinazione
 *   (requisiti §4.1 e §8): visibile ma non selezionabile.
 */
export type LinkTypeAvailability = 'selectable' | 'healthcare' | 'resolver' | 'deprecated' | 'policy';

export interface LinkType {
  id: string;
  label: string;
  description: string;
  availability: LinkTypeAvailability;
}

export const LINK_TYPES: readonly LinkType[] = [
  { id: 'activityIdeas', label: 'Idee per Attività', description: 'Idee per usare il prodotto o per altre forme di intrattenimento, in particolare con i bambini.', availability: 'selectable' },
  { id: 'allergenInfo', label: 'Pagina Informazioni Allergeni', description: 'Descrizione delle informazioni sugli allergeni.', availability: 'selectable' },
  { id: 'appDownload', label: 'Download App', description: "App per smartphone collegata all'entità.", availability: 'selectable' },
  { id: 'backgroundInfo', label: 'Storia e Contesto', description: "Informazioni, di solito del titolare, sul contesto creativo dell'entità: ispirazione, innovazione, approccio, scienza o tecnologia utilizzate.", availability: 'selectable' },
  { id: 'brandHomepageClinical', label: 'Informazioni sul Marchio per Professionisti Sanitari', description: 'Presenza del marchio rivolta ai professionisti sanitari.', availability: 'selectable' },
  { id: 'brandHomepagePatient', label: 'Informazioni sul Marchio per Pazienti', description: 'Presenza del marchio rivolta ai pazienti.', availability: 'selectable' },
  { id: 'careersInfo', label: 'Lavora con Noi', description: "Offerte di lavoro, carriera o altre opportunità professionali legate a un'organizzazione o a una località.", availability: 'selectable' },
  { id: 'certificationInfo', label: 'Informazioni sulle Certificazioni', description: 'Informazioni sulle certificazioni.', availability: 'selectable' },
  { id: 'consumerHandlingStorageInfo', label: 'Conservazione e Manipolazione', description: 'Indicazioni per manipolare e conservare il prodotto in sicurezza.', availability: 'selectable' },
  { id: 'defaultLink', label: 'Link Predefinito', description: 'Il link verso cui il resolver reindirizza se la richiesta non indica altro. In Codifico+ è la Destinazione Principale.', availability: 'resolver' },
  { id: 'defaultLinkMulti', label: 'Link Predefiniti Multipli', description: 'Più link predefiniti, scelti dal resolver in base alle intestazioni della richiesta.', availability: 'resolver' },
  { id: 'dpp', label: 'Passaporto Digitale del Prodotto (DPP)', description: 'Il passaporto digitale del prodotto.', availability: 'selectable' },
  { id: 'eifu', label: "Istruzioni per l'Uso Elettroniche (eIFU)", description: "Istruzioni per l'uso in formato elettronico per i dispositivi medici.", availability: 'healthcare' },
  { id: 'epcisRepository', label: 'Repository EPCIS', description: 'Archivio EPCIS con gli eventi di visibilità della filiera.', availability: 'selectable' },
  { id: 'epil', label: 'Foglio Illustrativo Elettronico (ePIL)', description: 'Foglio illustrativo elettronico per il paziente.', availability: 'healthcare' },
  { id: 'eventsInfo', label: 'Informazioni su Eventi', description: 'Dettagli di eventi. Per prenotazioni o appuntamenti si usa "Prenotazioni e Appuntamenti".', availability: 'selectable' },
  { id: 'faqs', label: 'Domande Frequenti (FAQ)', description: 'Un insieme di domande frequenti.', availability: 'selectable' },
  { id: 'handledBy', label: 'Gestito da', description: 'Usato quando un resolver inoltra tutte le richieste che corrispondono a uno schema a un altro servizio, ad esempio da GS1 a quello del marchio.', availability: 'resolver' },
  { id: 'hasRetailers', label: 'Punti Vendita', description: 'Elenco dei rivenditori.', availability: 'selectable' },
  { id: 'homepage', label: 'Pagina Informazioni Azienda', description: "Informazioni generali su un'organizzazione o un marchio, di solito la homepage del sito.", availability: 'selectable' },
  { id: 'ingredientsInfo', label: 'Informazioni sugli Ingredienti', description: 'Informazioni sugli ingredienti.', availability: 'selectable' },
  { id: 'instructions', label: 'Istruzioni', description: "Istruzioni di montaggio, consigli d'uso e simili.", availability: 'selectable' },
  { id: 'jws', label: 'Firma Digitale (JSON Web Signature)', description: 'Una firma digitale in formato JSON Web Signature.', availability: 'selectable' },
  { id: 'leaveReview', label: 'Lascia una Recensione', description: 'Pagina da cui aggiungere una recensione.', availability: 'selectable' },
  { id: 'locationInfo', label: 'Informazioni sulla Località', description: "Mappa, indicazioni stradali o altre informazioni sul luogo. Per la logistica B2B si usa \"Informazioni Logistiche\".", availability: 'selectable' },
  { id: 'logisticsInfo', label: 'Informazioni Logistiche', description: 'Informazioni logistiche B2B relative a una località fisica.', availability: 'selectable' },
  { id: 'loyaltyProgram', label: 'Programma Fedeltà', description: 'Informazioni su un programma fedeltà, compresi lo stato del socio o la registrazione.', availability: 'selectable' },
  { id: 'masterData', label: 'Dati Anagrafici (Master Data)', description: "Fonte di dati anagrafici strutturati dell'entità, di solito per applicazioni B2B.", availability: 'selectable' },
  { id: 'menuInfo', label: 'Menu', description: "Menu di cibi, servizi o altre offerte di un'organizzazione.", availability: 'selectable' },
  { id: 'nutritionalInfo', label: 'Informazioni Nutrizionali', description: 'Valori nutrizionali.', availability: 'selectable' },
  { id: 'openingHoursInfo', label: 'Orari di Apertura', description: 'Orari di apertura.', availability: 'selectable' },
  { id: 'paymentLink', label: 'Effettua un Pagamento', description: 'Pagina con i dettagli per pagare o da cui effettuare un pagamento.', availability: 'selectable' },
  { id: 'pip', label: 'Pagina Informazioni Prodotto', description: "Informazioni specifiche sull'articolo identificato, di solito gestite dal titolare del marchio o dal rivenditore.", availability: 'selectable' },
  { id: 'productSustainabilityInfo', label: 'Sostenibilità e Riciclo (deprecato)', description: 'Termine deprecato: usa "Pagina Informazioni Sostenibilità".', availability: 'deprecated' },
  { id: 'promotion', label: 'Promozioni', description: 'Una promozione.', availability: 'selectable' },
  { id: 'purchaseSuppliesOrAccessories', label: 'Acquista Ricambi o Accessori', description: "Dove acquistare materiali di consumo o accessori per l'articolo.", availability: 'selectable' },
  { id: 'quickStartGuide', label: 'Guida Rapida', description: "Le funzioni principali da conoscere per iniziare a usare l'articolo o il servizio.", availability: 'selectable' },
  { id: 'recallStatus', label: 'Stato di Richiamo', description: 'Indica se il prodotto è stato richiamato, di solito tramite API.', availability: 'selectable' },
  { id: 'recipeInfo', label: 'Ricette', description: 'Un sito di ricette.', availability: 'selectable' },
  { id: 'registerProduct', label: "Registrazione dell'Acquisto", description: 'Pagina per registrare la proprietà del prodotto, anche ai fini della garanzia.', availability: 'selectable' },
  { id: 'registryEntry', label: 'Voce in un Registro', description: 'Voce in un registro, ad esempio delle imprese o delle località (numeri ufficiali, LEI e simili).', availability: 'selectable' },
  { id: 'relatedImage', label: 'Immagine Correlata', description: "Un'immagine che rappresenta l'entità identificata o che la riguarda.", availability: 'selectable' },
  { id: 'relatedVideo', label: 'Video Correlato', description: "Un video, o un documento con un video incorporato, che descrive l'entità identificata.", availability: 'selectable' },
  { id: 'reportFound', label: 'Segnala Ritrovamento', description: "Servizio per segnalare il ritrovamento di un oggetto e ricollegarlo al proprietario o alle autorità.", availability: 'selectable' },
  { id: 'review', label: 'Recensioni', description: 'Recensioni.', availability: 'selectable' },
  { id: 'safetyInfo', label: 'Informazioni sulla Sicurezza', description: 'Informazioni sulla sicurezza.', availability: 'selectable' },
  { id: 'scheduleTime', label: 'Prenotazioni e Appuntamenti', description: 'Informazioni su orari, appuntamenti o prenotazioni.', availability: 'selectable' },
  { id: 'serviceInfo', label: 'Assistenza e Manutenzione', description: 'Istruzioni di assistenza o manutenzione.', availability: 'selectable' },
  { id: 'smartLabel', label: 'SmartLabel', description: 'La pagina SmartLabel del prodotto.', availability: 'selectable' },
  { id: 'smpc', label: 'Riassunto delle Caratteristiche del Prodotto (RCP)', description: 'Riassunto delle caratteristiche del prodotto (SmPC) per i medicinali.', availability: 'healthcare' },
  { id: 'socialMedia', label: 'Social Media', description: 'Un canale social. Non disponibile in Codifico: i domini social non sono ammessi come destinazione.', availability: 'policy' },
  { id: 'statisticInfo', label: 'Statistiche', description: "Statistiche su un'organizzazione, una località o un'altra entità.", availability: 'selectable' },
  { id: 'subscribe', label: 'Iscrizione', description: 'Un modulo di iscrizione.', availability: 'selectable' },
  { id: 'support', label: 'Assistenza Clienti', description: 'Un canale di supporto: helpdesk, chat, email e simili.', availability: 'selectable' },
  { id: 'sustainabilityInfo', label: 'Pagina Informazioni Sostenibilità', description: 'Informazioni su sostenibilità e riciclo.', availability: 'selectable' },
  { id: 'traceability', label: 'Informazioni sulla Tracciabilità', description: 'Informazioni di tracciabilità, compreso il track and trace.', availability: 'selectable' },
  { id: 'tutorial', label: 'Tutorial', description: 'Un tutorial o una serie di tutorial: corsi online, video dimostrativi e simili.', availability: 'selectable' },
  { id: 'userAgreement', label: 'Firma di Accordi o Liberatorie', description: 'Un accordo o una liberatoria da firmare.', availability: 'selectable' },
  { id: 'verificationService', label: 'Servizio di Verifica', description: "Servizio GS1 Lightweight Messaging per verificare lo stato di un prodotto, un'organizzazione o una località e del suo identificativo.", availability: 'selectable' },
  { id: 'whatsInTheBox', label: 'Contenuto della Confezione', description: 'Elenco di tutti gli articoli contenuti in una confezione.', availability: 'selectable' },
];

/** Le tipologie più usate per i prodotti di largo consumo, in cima al menu. */
export const COMMON_LINK_TYPE_IDS = [
  'pip',
  'allergenInfo',
  'ingredientsInfo',
  'nutritionalInfo',
  'sustainabilityInfo',
  'instructions',
  'recipeInfo',
  'promotion',
  'dpp',
] as const;

const byLabel = (a: LinkType, b: LinkType) => a.label.localeCompare(b.label, 'it');

export const LINK_TYPE_GROUPS = {
  common: COMMON_LINK_TYPE_IDS.map((id) => LINK_TYPES.find((t) => t.id === id)!),
  others: LINK_TYPES.filter(
    (t) => t.availability === 'selectable' && !(COMMON_LINK_TYPE_IDS as readonly string[]).includes(t.id),
  ).sort(byLabel),
  healthcare: LINK_TYPES.filter((t) => t.availability === 'healthcare').sort(byLabel),
  policy: LINK_TYPES.filter((t) => t.availability === 'policy').sort(byLabel),
};

export function linkType(id: string): LinkType | undefined {
  return LINK_TYPES.find((t) => t.id === id);
}

export function linkTypeLabel(id: string): string {
  return linkType(id)?.label ?? id;
}

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
