import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { performAIAnalysis } from '../services/aiAnalysis';

beforeAll(() => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ choices: [{ message: { content: 'Safe URL analysis' } }] }), { status: 200 })
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('performAIAnalysis', () => {
  it('should analyze a safe URL', async () => {
    const result = await performAIAnalysis('https://google.com', 'url');
    expect(result.summary).toBeTruthy();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.riskFactors)).toBe(true);
    expect(result.modelVersion).toBeTruthy();
  });

  it('should detect phishing keywords in email', async () => {
    const result = await performAIAnalysis('Urgent: Your account has been compromised. Click here to verify now.', 'email');
    expect(result.riskFactors.length).toBeGreaterThan(0);
    const phishingFactor = result.riskFactors.find(f =>
      f.toLowerCase().includes('phish') || f.toLowerCase().includes('urgent') || f.toLowerCase().includes('suspicious')
    );
    expect(phishingFactor).toBeTruthy();
  });

  it('should detect excessive caps in SMS', async () => {
    const result = await performAIAnalysis('YOU HAVE WON!!! CONGRATULATIONS!!! CLAIM YOUR PRIZE NOW!!!', 'sms');
    expect(result.riskFactors.length).toBeGreaterThan(0);
  });

  it('should return safe analysis for clean input', async () => {
    const result = await performAIAnalysis('Hey, are we still meeting for lunch tomorrow?', 'sms');
    expect(result).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(50);
  });
});
