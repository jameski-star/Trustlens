import { useMutation } from '@tanstack/react-query';
import { scanUrl, scanEmail, scanSms, scanPhone } from '../api/client';
import { getCachedResult, setCachedResult } from '../utils/scanCache';

export function useScanUrl() {
  return useMutation({
    mutationFn: async (url: string) => {
      const cached = getCachedResult(url, 'url');
      if (cached) return cached;
      const result = await scanUrl(url);
      setCachedResult(url, 'url', result as Record<string, unknown>);
      return result;
    },
  });
}

export function useScanEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      const cached = getCachedResult(email, 'email');
      if (cached) return cached;
      const result = await scanEmail(email);
      setCachedResult(email, 'email', result as Record<string, unknown>);
      return result;
    },
  });
}

export function useScanSms() {
  return useMutation({
    mutationFn: async (sms: string) => {
      const cached = getCachedResult(sms, 'sms');
      if (cached) return cached;
      const result = await scanSms(sms);
      setCachedResult(sms, 'sms', result as Record<string, unknown>);
      return result;
    },
  });
}

export function useScanPhone() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const cached = getCachedResult(phone, 'phone');
      if (cached) return cached;
      const result = await scanPhone(phone);
      setCachedResult(phone, 'phone', result as Record<string, unknown>);
      return result;
    },
  });
}
