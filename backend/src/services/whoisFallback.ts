import dns from 'dns/promises';
import { cacheWrap } from '../utils/cache';

const CACHE_TTL_WHOIS = 300_000;

const ALTERNATE_RDAP: Record<string, string[]> = {
  com: ['https://rdap.verisign.com/com/v1/domain/'],
  net: ['https://rdap.verisign.com/net/v1/domain/', 'https://rdap.verisign.com/net/v1/domain/'],
  org: ['https://rdap.publicinterestregistry.org/rdap/domain/'],
  xyz: ['https://rdap.nic.xyz/domain/'],
  top: ['https://rdap.nic.top/domain/'],
  club: ['https://rdap.nic.club/domain/'],
  work: ['https://rdap.nic.work/domain/'],
  info: ['https://rdap.afilias.net/rdap/domain/'],
  biz: ['https://rdap.afilias.net/rdap/domain/'],
  io: ['https://rdap.nic.io/domain/'],
  co: ['https://rdap.nic.co/domain/'],
  uk: ['https://rdap.nic.uk/domain/'],
  de: ['https://rdap.denic.de/domain/'],
  eu: ['https://rdap.eu/domain/'],
  fr: ['https://rdap.nic.fr/domain/'],
};

const ALTERNATE_SOURCES = [
  'https://who.is/whois/',
  'https://www.whois.com/whois/',
];

export interface WhoisResult {
  registrar: string;
  creationDate: Date | null;
  expirationDate: Date | null;
  lastUpdated: Date | null;
  country: string;
  organization: string;
}

export interface DomainAgeResult {
  created: Date;
  daysSinceCreation: number;
  monthsSinceCreation: number;
}

async function rdapFetch(server: string, domain: string): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${server}${domain}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json() as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseRdapData(data: Record<string, unknown>): { domainAge: DomainAgeResult | null; whois: WhoisResult | null } | null {
  const events = (data.events as Array<{ eventAction: string; eventDate: string }>) || [];
  const entities = (data.entities as Array<Record<string, unknown>>) || [];
  const creationEvent = events.find((e) => e.eventAction === 'registration');
  const expirationEvent = events.find((e) => e.eventAction === 'expiration');
  const changedEvent = events.find((e) => e.eventAction === 'last changed');
  const creationDate = creationEvent ? new Date(creationEvent.eventDate) : null;
  const expirationDate = expirationEvent ? new Date(expirationEvent.eventDate) : null;
  const lastUpdated = changedEvent ? new Date(changedEvent.eventDate) : null;

  let registrar = 'Unknown', org = 'Unknown', country = 'Unknown';
  for (const entity of entities) {
    const vcardArray = entity.vcardArray as Array<unknown>;
    if (!vcardArray) continue;
    const vcard = vcardArray[1] as Array<Array<unknown>>;
    if (!vcard) continue;
    for (const item of vcard) {
      const [field, , , value] = item as [string, unknown, unknown, string];
      const roles = entity.roles as string[] || [];
      if (field === 'fn' && roles.includes('registrar')) registrar = value;
      if (field === 'fn' && !registrar) org = value;
      if (field === 'adr') {
        const parts = (value || '').split(';');
        if (parts[5]) country = parts[5];
      }
    }
  }

  let domainAge: DomainAgeResult | null = null;
  if (creationDate && !isNaN(creationDate.getTime())) {
    const diff = Date.now() - creationDate.getTime();
    domainAge = {
      created: creationDate,
      daysSinceCreation: Math.floor(diff / 86400000),
      monthsSinceCreation: Math.floor(diff / 2629746000),
    };
  }

  return {
    domainAge,
    whois: { registrar, creationDate, expirationDate, lastUpdated, country, organization: org },
  };
}

export async function tryAlternateRdap(domain: string): Promise<{ domainAge: DomainAgeResult | null; whois: WhoisResult | null } | null> {
  const tld = domain.split('.').pop() || '';
  const servers = ALTERNATE_RDAP[tld] || [];
  if (servers.length === 0) return null;
  const results = await Promise.allSettled(
    servers.map(server => rdapFetch(server, domain))
  );
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) return parseRdapData(r.value);
  }
  return null;
}

export async function tryDnsAge(hostname: string): Promise<DomainAgeResult | null> {
  try {
    const soa = await dns.resolveSoa(hostname);
    if (soa?.serial) {
      const serialStr = String(soa.serial);
      if (serialStr.length >= 8) {
        const dateStr = serialStr.substring(0, 8);
        const year = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1;
        const day = parseInt(dateStr.substring(6, 8), 10);
        if (year > 1900 && year < 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
          const created = new Date(year, month, day);
          if (!isNaN(created.getTime())) {
            const diff = Date.now() - created.getTime();
            return { created, daysSinceCreation: Math.floor(diff / 86400000), monthsSinceCreation: Math.floor(diff / 2629746000) };
          }
        }
      }
    }
  } catch { /* DNS not available */ }
  return null;
}

export async function tryWebWhois(domain: string): Promise<{ domainAge: DomainAgeResult | null; whois: WhoisResult | null } | null> {
  const fetches = ALTERNATE_SOURCES.map(async (source) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`${source}${domain}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrustLensBot/1.0)' },
      });
      const html = await res.text();
      return html;
    } finally {
      clearTimeout(timer);
    }
  });
  const results = await Promise.allSettled(fetches);
  for (const r of results) {
    if (r.status !== 'fulfilled' || !r.value) continue;
    const html = r.value;

    const creationMatch = html.match(/Creation Date[:\s]*([^<\n]+)/i);
    const expiryMatch = html.match(/(?:Registry )?Expir(?:ation|y) Date[:\s]*([^<\n]+)/i);
    const registrarMatch = html.match(/Registrar[:\s]*([^<\n]+)/i);
    const orgMatch = html.match(/(?:Registrant )?Organization[:\s]*([^<\n]+)/i);
    const countryMatch = html.match(/(?:Registrant )?Country[:\s]*([^<\n]+)/i);

    const creationDate = creationMatch ? new Date(creationMatch[1].trim()) : null;
    const expirationDate = expiryMatch ? new Date(expiryMatch[1].trim()) : null;

    let domainAge: DomainAgeResult | null = null;
    if (creationDate && !isNaN(creationDate.getTime())) {
      const diff = Date.now() - creationDate.getTime();
      domainAge = { created: creationDate, daysSinceCreation: Math.floor(diff / 86400000), monthsSinceCreation: Math.floor(diff / 2629746000) };
    }

    return {
      domainAge,
      whois: {
        registrar: registrarMatch ? registrarMatch[1].trim() : 'Unknown',
        creationDate,
        expirationDate,
        lastUpdated: null,
        country: countryMatch ? countryMatch[1].trim() : 'Unknown',
        organization: orgMatch ? orgMatch[1].trim() : 'Unknown',
      },
    };
  }
  return null;
}

export async function comprehensiveWhois(hostname: string): Promise<{
  domainAge: DomainAgeResult | null;
  whois: WhoisResult | null;
  fallbackMethod: string;
}> {
  const domain = hostname.split('.').slice(-2).join('.');

  return cacheWrap(`whois:${domain}`, async () => {
    const results = await Promise.allSettled([
      tryAlternateRdap(domain),
      tryDnsAge(hostname),
      tryWebWhois(domain),
    ]);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const val = result.value as ({ domainAge: DomainAgeResult | null; whois: WhoisResult | null });
        if (val.whois && val.whois.registrar !== 'Unknown') {
          return { ...val, fallbackMethod: 'alternate_rdap' };
        }
      }
    }

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const val = result.value as ({ domainAge: DomainAgeResult | null; whois: WhoisResult | null });
        if (val.domainAge) {
          return { domainAge: val.domainAge, whois: null, fallbackMethod: 'dns_soa' };
        }
      }
    }

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const val = result.value as { domainAge: DomainAgeResult | null; whois: WhoisResult | null };
        if (val.whois || val.domainAge) return { ...val, fallbackMethod: 'web_whois' };
      }
    }

    return { domainAge: null, whois: { registrar: 'Unknown', creationDate: null, expirationDate: null, lastUpdated: null, country: 'Unknown', organization: 'Unknown' }, fallbackMethod: 'none' };
  }, CACHE_TTL_WHOIS);
}
