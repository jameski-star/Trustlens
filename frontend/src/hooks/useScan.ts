import { useMutation } from '@tanstack/react-query';
import { scanUrl, scanEmail, scanSms, scanPhone } from '../api/client';

export function useScanUrl() {
  return useMutation({
    mutationFn: scanUrl,
  });
}

export function useScanEmail() {
  return useMutation({
    mutationFn: scanEmail,
  });
}

export function useScanSms() {
  return useMutation({
    mutationFn: scanSms,
  });
}

export function useScanPhone() {
  return useMutation({
    mutationFn: scanPhone,
  });
}
