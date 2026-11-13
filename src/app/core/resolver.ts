import { DigitalLinkEntry } from './demo-data';
import { GS1_RESOLVER_HOST } from './gs1';
import { languageLabel, linkTypeLabel, primaryLanguage } from './vocabulary';

/**
 * Simulazione del comportamento di un resolver GS1 conforme (GS1-Conformant Resolver Standard
 * 1.1), limitata a quello che serve per l'anteprima:
 *
 * - senza linkType la richiesta va al defaultLink, cioè la "Destinazione Principale"; se però
 *   per la stessa tipologia esiste un link nella lingua preferita del browser (Accept-Language, con il
 *   ripiego da "en-GB" a "en"), vince quello;
 * - con un linkType esplicito si cerca quella tipologia, prima nella lingua richiesta e poi in
 *   qualunque lingua; se non c'è, si ripiega sul defaultLink;
 * - linkType=linkset restituisce l'elenco completo (RFC 9264).
 */
export interface Resolution {
  link: DigitalLinkEntry | null;
  /** Perché il resolver ha scelto proprio questo link, in parole semplici. */
  reason: string;
}

export function resolve(
  links: readonly DigitalLinkEntry[],
  defaultLink: DigitalLinkEntry | null,
  lang: string,
  linkType?: string,
): Resolution {
  if (!links.length || !defaultLink) {
    return {
      link: null,
      reason:
        'Nessun link configurato: il resolver GS1 mostra la scheda del prodotto pubblicata sul GS1 Registry Platform.',
    };
  }

  const type = linkType ?? defaultLink.linkType;
  const sameType = links.filter((l) => l.linkType === type);
  const inLanguage = matchLanguage(sameType, lang);
  const how = (l: DigitalLinkEntry) =>
    sameTag(l.lang, lang) ? '' : ` (lingua più vicina a ${lang}: ${l.lang})`;

  if (!linkType) {
    if (inLanguage && inLanguage.id !== defaultLink.id) {
      return {
        link: inLanguage,
        reason: `Esiste un link nella lingua preferita del browser: "${linkTypeLabel(type)}" in ${lower(languageLabel(inLanguage.lang))}${how(inLanguage)}.`,
      };
    }
    return {
      link: defaultLink,
      reason: inLanguage
        ? `La lingua preferita del browser corrisponde alla Destinazione Principale (${lower(languageLabel(defaultLink.lang))}).`
        : 'Nessuna regola per questa lingua: si usa la Destinazione Principale.',
    };
  }

  if (inLanguage) {
    return {
      link: inLanguage,
      reason: `Trovato un link "${linkTypeLabel(type)}" in ${lower(languageLabel(inLanguage.lang))}${how(inLanguage)}.`,
    };
  }
  if (sameType.length) {
    return {
      link: sameType[0],
      reason: `Nessun link "${linkTypeLabel(type)}" in ${lower(languageLabel(lang))}: si usa quello disponibile in ${lower(languageLabel(sameType[0].lang))}.`,
    };
  }
  return {
    link: defaultLink,
    reason: `Nessun link di tipo "${linkTypeLabel(type)}": si ripiega sulla Destinazione Principale.`,
  };
}

const sameTag = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** "Portoghese (Brasile)" → "portoghese (Brasile)": minuscola solo l'iniziale, dentro una frase. */
const lower = (s: string) => s.charAt(0).toLocaleLowerCase('it') + s.slice(1);

/**
 * Sceglie il link nella lingua più vicina al tag richiesto, come la negoziazione di
 * Accept-Language: prima il tag identico ("en-GB"), poi la lingua base ("en"), poi un'altra
 * variante della stessa lingua ("en-US"). Null se nessuna corrisponde.
 */
export function matchLanguage(links: readonly DigitalLinkEntry[], tag: string): DigitalLinkEntry | null {
  const base = primaryLanguage(tag);
  return (
    links.find((l) => sameTag(l.lang, tag)) ??
    links.find((l) => sameTag(l.lang, base)) ??
    links.find((l) => primaryLanguage(l.lang) === base) ??
    null
  );
}

/** Linkset JSON (application/linkset+json) che il resolver restituirebbe per questo prodotto. */
export function linkset(anchor: string, links: readonly DigitalLinkEntry[], defaultLink: DigitalLinkEntry | null) {
  const entry: Record<string, unknown> = { anchor };
  if (defaultLink) {
    entry['https://gs1.org/voc/defaultLink'] = [
      { href: defaultLink.url, title: linkTypeLabel(defaultLink.linkType), hreflang: [defaultLink.lang] },
    ];
    // Stessa tipologia in più lingue: gs1:defaultLinkMulti, un URL per lingua (Resolver Standard §2.3).
    const multi = links.filter((l) => l.linkType === defaultLink.linkType);
    if (multi.length > 1) {
      entry['https://gs1.org/voc/defaultLinkMulti'] = multi.map((l) => ({
        href: l.url,
        title: linkTypeLabel(l.linkType),
        hreflang: [l.lang],
      }));
    }
  }
  for (const l of links) {
    const key = `https://gs1.org/voc/${l.linkType}`;
    const list = (entry[key] as object[] | undefined) ?? [];
    list.push({ href: l.url, title: linkTypeLabel(l.linkType), hreflang: [l.lang] });
    entry[key] = list;
  }
  return { linkset: [entry] };
}

/**
 * Validazione dell'URL di destinazione (requisiti §4.1 e §8).
 * - Solo https: lo standard non lo impone, ma Codifico rifiuta http:// per la sicurezza di chi
 *   scansiona.
 * - Nessun accorciatore di link: la destinazione finale resterebbe nascosta.
 * - Nessun dominio social (né piattaforme video social): sono pagine che l'azienda non controlla,
 *   possono cambiare o sparire, mentre il QR code resta stampato per tutta la vita del prodotto.
 *   Il blocco vale per qualunque tipologia, come nel Figma (https://facebook.com/... non valido).
 * - Non può essere il resolver stesso.
 */
const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'buff.ly', 'is.gd', 'rebrand.ly'];
const SOCIAL_HOSTS = [
  'facebook.com',
  'fb.com',
  'instagram.com',
  'tiktok.com',
  'x.com',
  'twitter.com',
  'linkedin.com',
  'pinterest.com',
  'threads.net',
  'snapchat.com',
  'youtube.com',
  'youtu.be',
  'whatsapp.com',
  'telegram.me',
  't.me',
];

const matches = (host: string, list: string[]) => list.some((h) => host === h || host.endsWith(`.${h}`));

export type UrlCheck = { valid: true } | { valid: false; reason: string };

export function checkDestinationUrl(value: string): UrlCheck {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return { valid: false, reason: "Scrivi l'indirizzo completo, ad esempio https://www.tuosito.it/prodotto" };
  }
  if (url.protocol !== 'https:') return { valid: false, reason: "L'indirizzo deve iniziare con https://" };
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(url.hostname)) {
    return { valid: false, reason: 'Il dominio non è valido' };
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (matches(host, SHORTENERS)) {
    return { valid: false, reason: 'Gli accorciatori di link non sono ammessi: usa l’indirizzo completo della pagina' };
  }
  if (matches(host, SOCIAL_HOSTS)) {
    return {
      valid: false,
      reason:
        'I domini dei social network non sono ammessi: sono pagine che non controlli e possono cambiare o sparire, mentre il QR code resta stampato per anni. Usa una pagina del tuo sito.',
    };
  }
  if (host === GS1_RESOLVER_HOST || host === 'id.gs1.org') {
    return { valid: false, reason: 'La destinazione non può essere un resolver GS1: indica la pagina reale' };
  }
  return { valid: true };
}

/**
 * Verifica di raggiungibilità della pagina di destinazione (specifica §4.2 e §7).
 *
 * Nella demo non c'è backend e il browser non può interrogare siti di terzi, quindi la verifica
 * è simulata in modo prevedibile: risponde 404 un indirizzo che contiene "404" o
 * "non-disponibile", o che usa il dominio riservato .invalid. In produzione la fa il server al
 * salvataggio e poi periodicamente. L'esito non blocca mai il salvataggio.
 */
export function checkReachability(url: string): { reachable: boolean; status?: number } {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { reachable: true };
  }
  const host = u.hostname.toLowerCase();
  const rest = (u.pathname + u.search).toLowerCase();
  const broken = host.endsWith('.invalid') || /404|non-disponibile/.test(rest) || host.includes('404');
  return broken ? { reachable: false, status: 404 } : { reachable: true };
}
