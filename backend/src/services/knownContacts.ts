export interface OfficialContact {
  name: string;
  type: 'company' | 'government' | 'telecom' | 'bank' | 'emergency' | 'tech';
  phones: string[];
  emails: string[];
  domains: string[];
  countries: string[];
  aliases: string[];
  category: 'official' | 'emergency' | 'scam_alert';
  notes: string;
  verifiedDate: string;
}

export const KNOWN_CONTACTS: OfficialContact[] = [
  {
    name: 'FBI',
    type: 'government',
    phones: ['+12023243000', '+18558456387', '+12023247137'],
    emails: ['tips@fbi.gov', 'publicaffairs@fbi.gov', 'cyber@fbi.gov'],
    domains: ['fbi.gov', 'ic3.gov'],
    countries: ['US'],
    aliases: ['federal bureau of investigation'],
    category: 'emergency',
    notes: 'FBI headquarters. Use 1-800-CALL-FBI for tips.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'CIA',
    type: 'government',
    phones: ['+17034821100'],
    emails: ['cia@cia.gov'],
    domains: ['cia.gov'],
    countries: ['US'],
    aliases: ['central intelligence agency'],
    category: 'official',
    notes: 'CIA headquarters, Langley VA.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'NSA',
    type: 'government',
    phones: ['+13016886000'],
    emails: [],
    domains: ['nsa.gov', 'nsa.gov'],
    countries: ['US'],
    aliases: ['national security agency'],
    category: 'official',
    notes: 'NSA headquarters, Fort Meade MD.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'DHS',
    type: 'government',
    phones: ['+12024474000'],
    emails: [],
    domains: ['dhs.gov'],
    countries: ['US'],
    aliases: ['department of homeland security', 'homeland security'],
    category: 'official',
    notes: 'DHS Washington DC headquarters.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'US Secret Service',
    type: 'government',
    phones: ['+12024065800'],
    emails: [],
    domains: ['secretservice.gov'],
    countries: ['US'],
    aliases: ['secret service', 'usss'],
    category: 'official',
    notes: 'Investigates financial crimes and cybercrime.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'FTC',
    type: 'government',
    phones: ['+18773824357', '+12023262222'],
    emails: ['consumerresponse@ftc.gov'],
    domains: ['ftc.gov', 'reportfraud.ftc.gov'],
    countries: ['US'],
    aliases: ['federal trade commission'],
    category: 'official',
    notes: 'File fraud complaints. 1-877-FTC-HELP.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'IC3',
    type: 'government',
    phones: [],
    emails: [],
    domains: ['ic3.gov'],
    countries: ['US'],
    aliases: ['internet crime complaint center'],
    category: 'official',
    notes: 'File internet crime complaints online at ic3.gov.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'CISA',
    type: 'government',
    phones: ['+17032350001', '+18882829270'],
    emails: ['central@cisa.dhs.gov'],
    domains: ['cisa.gov'],
    countries: ['US'],
    aliases: ['cybersecurity and infrastructure security agency'],
    category: 'official',
    notes: 'US cybersecurity agency. 24/7 watch: 1-888-282-0870.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'NCSC UK',
    type: 'government',
    phones: [],
    emails: ['report@phishing.gov.uk', 'enquiries@ncsc.gov.uk'],
    domains: ['ncsc.gov.uk'],
    countries: ['GB'],
    aliases: ['national cyber security centre'],
    category: 'official',
    notes: 'UK cyber security authority.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Action Fraud UK',
    type: 'government',
    phones: ['+4403001232040'],
    emails: [],
    domains: ['actionfraud.police.uk'],
    countries: ['GB'],
    aliases: ['action fraud', 'uk fraud reporting'],
    category: 'official',
    notes: 'UK national fraud and cyber crime reporting. 0300 123 2040.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'ACCC Scamwatch Australia',
    type: 'government',
    phones: [],
    emails: [],
    domains: ['scamwatch.gov.au', 'accc.gov.au'],
    countries: ['AU'],
    aliases: ['scamwatch', 'australian competition'],
    category: 'official',
    notes: 'Australian scam reporting portal.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'RCMP Canada',
    type: 'government',
    phones: ['+16139980284'],
    emails: [],
    domains: ['rcmp-grc.gc.ca', 'antifraudcentre.ca'],
    countries: ['CA'],
    aliases: ['royal canadian mounted police', 'rcmp'],
    category: 'official',
    notes: 'Canadian Anti-Fraud Centre.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Europol',
    type: 'government',
    phones: ['+31703025300'],
    emails: ['info@europol.eu'],
    domains: ['europol.europa.eu'],
    countries: ['NL'],
    aliases: ['european police'],
    category: 'official',
    notes: 'EU law enforcement agency.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Interpol',
    type: 'government',
    phones: ['+33472440000'],
    emails: [],
    domains: ['interpol.int'],
    countries: ['FR'],
    aliases: ['international criminal police'],
    category: 'official',
    notes: 'International police organization, Lyon France.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Safaricom',
    type: 'telecom',
    phones: ['+254720000000', '+254721000000', '+254722000000', '+254723000000', '+254724000000', '+254725000000', '+254726000000', '+254727000000', '+254728000000', '+254729000000', '+254100000000', '+254110000000', '+254111000000', '+254112000000', '+254113000000', '+254114000000', '+254115000000', '+254116000000', '+254117000000', '+254118000000', '+254119000000'],
    emails: ['customercare@safaricom.co.ke', 'fraud@safaricom.co.ke'],
    domains: ['safaricom.co.ke', 'safaricom.com'],
    countries: ['KE'],
    aliases: ['safaricom kenya'],
    category: 'official',
    notes: 'Kenyan telecom operator. Customer care: 100, 0722000100.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Airtel Kenya',
    type: 'telecom',
    phones: ['+254730000000', '+254731000000', '+254732000000', '+254733000000', '+254734000000', '+254735000000', '+254736000000', '+254737000000', '+254738000000', '+254739000000'],
    emails: ['customercare@ke.airtel.com'],
    domains: ['airtel.co.ke', 'africa.airtel.com'],
    countries: ['KE'],
    aliases: ['airtel kenya', 'zain kenya'],
    category: 'official',
    notes: 'Customer care: 0733100100.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Telkom Kenya',
    type: 'telecom',
    phones: ['+254770000000', '+254771000000', '+254772000000', '+254773000000', '+254774000000', '+254775000000', '+254776000000', '+254777000000', '+254778000000', '+254779000000', '+254107000000'],
    emails: ['customerservice@telkom.co.ke'],
    domains: ['telkom.co.ke'],
    countries: ['KE'],
    aliases: ['telkom kenya', 'orange kenya'],
    category: 'official',
    notes: 'Customer care: 100 from Telkom line.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Equity Bank Kenya',
    type: 'bank',
    phones: ['+254763000000', '+254731000000'],
    emails: ['info@equitybank.co.ke', 'fraud@equitybank.co.ke'],
    domains: ['equitybank.co.ke', 'equitybank.com', 'equitygroupfoundation.com'],
    countries: ['KE'],
    aliases: ['equity bank', 'equity group'],
    category: 'official',
    notes: 'Customer care: 0763 000 000, 0731 000 000.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'KCB Bank Kenya',
    type: 'bank',
    phones: ['+254732100000', '+254711111000'],
    emails: ['contactcentre@kcb.co.ke'],
    domains: ['kcbgroup.com', 'kcb.co.ke'],
    countries: ['KE'],
    aliases: ['kcb bank', 'kenya commercial bank'],
    category: 'official',
    notes: 'Customer care: 0732 100 000, 0711 111 000.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Cooperative Bank Kenya',
    type: 'bank',
    phones: ['+254711011000'],
    emails: ['customercare@co-opbank.co.ke'],
    domains: ['co-opbank.co.ke'],
    countries: ['KE'],
    aliases: ['cooperative bank', 'co-op bank'],
    category: 'official',
    notes: 'Customer care: 0711 011 000.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Standard Chartered Kenya',
    type: 'bank',
    phones: ['+254719089000', '+254729089000'],
    emails: ['ke.servicecentre@sc.com'],
    domains: ['sc.com/ke'],
    countries: ['KE'],
    aliases: ['standard chartered', 'stanchart'],
    category: 'official',
    notes: 'Customer care: 0719 089 000, 0729 089 000.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'NCBA Bank Kenya',
    type: 'bank',
    phones: ['+254718121000', '+254708078511'],
    emails: ['customercare@ncbagroup.com'],
    domains: ['ncbagroup.com'],
    countries: ['KE'],
    aliases: ['ncba bank', 'cba bank', 'nic bank'],
    category: 'official',
    notes: 'Customer care: 0718 121 000.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Absa Bank Kenya',
    type: 'bank',
    phones: ['+254702120000', '+254732120000'],
    emails: ['absa.kenya@absa.africa'],
    domains: ['absa.co.ke'],
    countries: ['KE'],
    aliases: ['absa kenya', 'barclays kenya'],
    category: 'official',
    notes: 'Customer care: 0702 120 000, 0732 120 000.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'M-Pesa',
    type: 'telecom',
    phones: ['+254722000100', '+254728000100', '+254739000100'],
    emails: ['mpesa@safaricom.co.ke', 'fraud@safaricom.co.ke'],
    domains: ['safaricom.co.ke/m-pesa'],
    countries: ['KE'],
    aliases: ['m-pesa', 'mpesa', 'mobile money'],
    category: 'official',
    notes: 'Safaricom mobile money service. Customer care: 100.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Google',
    type: 'tech',
    phones: ['+16503300100', '+16502530000'],
    emails: [],
    domains: ['google.com', 'googlemail.com'],
    countries: ['US'],
    aliases: ['google inc', 'google llc', 'alphabet'],
    category: 'official',
    notes: 'Google headquarters, Mountain View CA. Google does not initiate unsolicited calls.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Apple',
    type: 'tech',
    phones: ['+14089961010', '+18006927753'],
    emails: [],
    domains: ['apple.com', 'icloud.com'],
    countries: ['US'],
    aliases: ['apple inc', 'apple computer'],
    category: 'official',
    notes: 'Apple support: 1-800-MY-APPLE. Apple does not call about account issues unsolicited.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Microsoft',
    type: 'tech',
    phones: ['+14258828080', '+18006427676'],
    emails: [],
    domains: ['microsoft.com', 'office.com', 'live.com', 'outlook.com', 'hotmail.com'],
    countries: ['US'],
    aliases: ['microsoft corporation', 'msft'],
    category: 'official',
    notes: 'Microsoft does not call about virus infections or computer issues.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Amazon',
    type: 'tech',
    phones: ['+12062661991', '+18882804331'],
    emails: [],
    domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.co.jp'],
    countries: ['US'],
    aliases: ['amazon.com', 'amazon web services', 'aws'],
    category: 'official',
    notes: 'Amazon does not call about suspicious orders unsolicited.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'PayPal',
    type: 'tech',
    phones: ['+14029357300', '+18882211161'],
    emails: ['service@paypal.com'],
    domains: ['paypal.com'],
    countries: ['US'],
    aliases: ['paypal', 'paypal inc'],
    category: 'official',
    notes: 'PayPal support: 1-888-221-1161. PayPal sends emails from @paypal.com only.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Netflix',
    type: 'tech',
    phones: ['+18555797172'],
    emails: ['info@netflix.com'],
    domains: ['netflix.com'],
    countries: ['US'],
    aliases: ['netflix inc'],
    category: 'official',
    notes: 'Netflix only sends account emails from @netflix.com.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Meta / Facebook',
    type: 'tech',
    phones: [],
    emails: [],
    domains: ['facebook.com', 'meta.com', 'instagram.com', 'whatsapp.com', 'messenger.com'],
    countries: ['US'],
    aliases: ['meta', 'facebook', 'instagram'],
    category: 'official',
    notes: 'Meta does not call or email about account verification unsolicited.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Emergency Services US',
    type: 'emergency',
    phones: ['911'],
    emails: [],
    domains: [],
    countries: ['US'],
    aliases: ['911', 'emergency'],
    category: 'emergency',
    notes: 'US emergency services.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Emergency Services UK',
    type: 'emergency',
    phones: ['999', '112'],
    emails: [],
    domains: [],
    countries: ['GB'],
    aliases: ['999', '112', 'emergency'],
    category: 'emergency',
    notes: 'UK emergency services. 999 or 112.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Emergency Services Kenya',
    type: 'emergency',
    phones: ['112', '999', '911'],
    emails: [],
    domains: [],
    countries: ['KE'],
    aliases: ['emergency kenya'],
    category: 'emergency',
    notes: 'Kenya emergency: 112 (police), 999 (all services), 911 (mobile).',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Emergency Services EU',
    type: 'emergency',
    phones: ['112'],
    emails: [],
    domains: [],
    countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'SE', 'DK', 'FI', 'PL', 'CZ', 'GR', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'LT', 'LV', 'EE', 'LU', 'MT', 'CY'],
    aliases: ['112', 'european emergency'],
    category: 'emergency',
    notes: 'Pan-European emergency number 112.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Emergency Services Australia',
    type: 'emergency',
    phones: ['000', '112'],
    emails: [],
    domains: [],
    countries: ['AU'],
    aliases: ['000', 'emergency australia'],
    category: 'emergency',
    notes: 'Australia emergency: 000.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Emergency Services Canada',
    type: 'emergency',
    phones: ['911'],
    emails: [],
    domains: [],
    countries: ['CA'],
    aliases: ['911', 'emergency canada'],
    category: 'emergency',
    notes: 'Canada emergency 911.',
    verifiedDate: '2026-01-01',
  },
  {
    name: 'Emergency Services India',
    type: 'emergency',
    phones: ['112', '100'],
    emails: [],
    domains: [],
    countries: ['IN'],
    aliases: ['112', '100', 'emergency india'],
    category: 'emergency',
    notes: 'India emergency: 112 (all), 100 (police), 101 (fire), 102 (ambulance).',
    verifiedDate: '2026-01-01',
  },
];

export function findContactByPhone(phone: string): OfficialContact | null {
  const cleaned = phone.replace(/[\s\-().+]/g, '');
  for (const contact of KNOWN_CONTACTS) {
    for (const cp of contact.phones) {
      const cpCleaned = cp.replace(/[\s\-().+]/g, '');
      if (cleaned.endsWith(cpCleaned) || cpCleaned.endsWith(cleaned)) {
        return contact;
      }
    }
  }
  return null;
}

export function findContactByEmail(email: string): OfficialContact | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  for (const contact of KNOWN_CONTACTS) {
    if (contact.domains.some(d => domain === d || domain.endsWith('.' + d))) {
      return contact;
    }
    if (contact.emails.some(e => e.toLowerCase() === email.toLowerCase())) {
      return contact;
    }
  }
  return null;
}

export function findContactByDomain(domain: string): OfficialContact | null {
  const lower = domain.toLowerCase();
  for (const contact of KNOWN_CONTACTS) {
    if (contact.domains.some(d => lower === d || lower.endsWith('.' + d))) {
      return contact;
    }
  }
  return null;
}

export function isOfficialNumber(phone: string): { official: boolean; contact: OfficialContact | null; match: 'exact' | 'prefix' | 'none' } {
  const contact = findContactByPhone(phone);
  if (!contact) return { official: false, contact: null, match: 'none' };
  const cleaned = phone.replace(/[\s\-().+]/g, '');
  const exact = contact.phones.some(cp => cp.replace(/[\s\-().+]/g, '') === cleaned);
  return { official: true, contact, match: exact ? 'exact' : 'prefix' };
}

export function isOfficialEmail(email: string): { official: boolean; contact: OfficialContact | null; notes: string } {
  const contact = findContactByEmail(email);
  if (!contact) return { official: false, contact: null, notes: '' };
  return { official: true, contact, notes: `This domain belongs to ${contact.name}. ${contact.notes}` };
}

export function isImpersonatingOfficial(phone: string): { impersonating: boolean; officialContact: OfficialContact | null; details: string } {
  const cleaned = phone.replace(/[\s\-().+]/g, '');
  for (const contact of KNOWN_CONTACTS) {
    for (const cp of contact.phones) {
      const cpCleaned = cp.replace(/[\s\-().+]/g, '');
      if (cpCleaned !== cleaned && (cleaned.startsWith(cpCleaned.substring(0, 5)) || cleaned.includes(cpCleaned.substring(0, 6)))) {
        if (cleaned.length >= cpCleaned.length - 2 && cleaned.length <= cpCleaned.length + 3) {
          return {
            impersonating: true,
            officialContact: contact,
            details: `Phone number resembles ${contact.name} official number (${cp}). Possible impersonation attempt.`,
          };
        }
      }
    }
  }
  return { impersonating: false, officialContact: null, details: '' };
}
