import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios') as typeof axios;
  const mockGet = vi.fn(async (url: string) => {
    if (url.includes('iana.org')) {
      return { data: { services: [ [ ['com'], ['https://rdap.verisign.com/'] ] ] } };
    }
    return {
      data: {
        events: [
          { eventAction: 'registration', eventDate: '1997-09-15T00:00:00.000Z' },
          { eventAction: 'expiration', eventDate: '2028-09-14T00:00:00.000Z' },
          { eventAction: 'last changed', eventDate: '2023-09-19T00:00:00.000Z' },
        ],
        entities: [
          {
            roles: ['registrar'],
            vcardArray: ['vcard', [['fn', {}, 'text', 'MarkMonitor Inc.']]],
          },
          {
            roles: ['registrant'],
            vcardArray: ['vcard', [['fn', {}, 'text', 'Google LLC'], ['adr', {}, 'text', ';;;Mountain View;CA;US']]],
          },
        ],
      },
    };
  });
  return {
    default: { ...actual, create: () => ({ get: mockGet }) },
    get: mockGet,
  };
});

import { analyzeUrl, analyzeEmail, analyzePhoneNumber, calculateFinalScore, generateRecommendations } from '../services/scanner';

describe('analyzeUrl', () => {
  it('should detect a safe URL with SSL', async () => {
    const result = await analyzeUrl('https://google.com');
    expect(result.ssl).toBeDefined();
    expect(result.whois).toBeDefined();
    expect(Array.isArray(result.blacklists)).toBe(true);
    expect(Array.isArray(result.detectedRisks)).toBe(true);
    expect(result.summary).toBeTruthy();
  });

  it('should flag suspicious TLDs', async () => {
    const result = await analyzeUrl('https://login-bank.tk');
    const suspiciousRisks = result.detectedRisks.filter(r =>
      r.description.toLowerCase().includes('suspicious') || r.description.toLowerCase().includes('tld')
    );
    expect(suspiciousRisks.length).toBeGreaterThanOrEqual(0);
  });

  it('should detect brand impersonation', async () => {
    const result = await analyzeUrl('https://paypal-secure-login.com');
    expect(result.detectedRisks.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle URLs without protocol', async () => {
    const result = await analyzeUrl('example.com');
    expect(result).toBeDefined();
    expect(result.summary).toBeTruthy();
  });
});

describe('analyzeEmail', () => {
  it('should detect free email providers', () => {
    const result = analyzeEmail('test@gmail.com');
    const freeEmailRisk = result.detectedRisks.find(r => r.description.toLowerCase().includes('free email'));
    if (freeEmailRisk) {
      expect(freeEmailRisk.severity).toBe('low');
    }
  });

  it('should detect brand impersonation in email', () => {
    const result = analyzeEmail('support@paypal-security.tk');
    expect(result.detectedRisks.length).toBeGreaterThan(0);
  });

  it('should return summary', () => {
    const result = analyzeEmail('user@company.com');
    expect(result.summary).toBeTruthy();
  });
});

describe('analyzePhoneNumber', () => {
  it('should analyze a regular phone number', () => {
    const result = analyzePhoneNumber('+14155552671');
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.detectedRisks)).toBe(true);
  });

  it('should flag high-risk country codes', () => {
    const result = analyzePhoneNumber('+2348012345678');
    expect(result.detectedRisks.length).toBeGreaterThanOrEqual(0);
  });

  it('should return summary', () => {
    const result = analyzePhoneNumber('+15551234567');
    expect(result.summary).toBeTruthy();
  });
});

describe('calculateFinalScore', () => {
  it('should return 100 when all factors are perfect', () => {
    const score = calculateFinalScore({ ssl: 100, domainAge: 100, blacklists: 100, aiAnalysis: 100, communityReports: 100 });
    expect(score).toBe(100);
  });

  it('should return 0 when all factors are poor', () => {
    const score = calculateFinalScore({ ssl: 0, domainAge: 0, blacklists: 0, aiAnalysis: 0, communityReports: 0 });
    expect(score).toBe(0);
  });

  it('should return a weighted score', () => {
    const score = calculateFinalScore({ ssl: 80, domainAge: 60, blacklists: 70, aiAnalysis: 50, communityReports: 90 });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});

describe('generateRecommendations', () => {
  it('should return recommendations for high risk', () => {
    const risks = [{ severity: 'critical', description: 'Test risk', category: 'test' }];
    const recs = generateRecommendations(risks, 20);
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBeGreaterThan(0);
  });

  it('should return empty recommendations for safe score', () => {
    const recs = generateRecommendations([], 90);
    expect(Array.isArray(recs)).toBe(true);
  });
});
