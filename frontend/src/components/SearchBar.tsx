import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Loader2, AlertCircle } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  large?: boolean;
  onSubmit?: (input: string) => void;
  isLoading?: boolean;
}

const URL_REGEX = /^https?:\/\/.+\..+|^[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s\-().]{6,19}$/;

function validate(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (URL_REGEX.test(trimmed)) {
    try {
      new URL(trimmed.startsWith('http') ? trimmed : 'https://' + trimmed);
      return null;
    } catch {
      return 'Invalid URL format. Enter a valid web address (e.g. https://example.com).';
    }
  }
  if (EMAIL_REGEX.test(trimmed)) return null;
  if (PHONE_REGEX.test(trimmed.replace(/\s/g, ''))) return null;
  if (trimmed.length >= 3) return null;
  return 'Enter at least 3 characters for analysis.';
}

export default function SearchBar({
  placeholder = 'Paste a website, email, phone number or message...',
  large = false,
  onSubmit,
  isLoading = false,
}: SearchBarProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const detectType = (value: string): 'url' | 'email' | 'phone' | 'sms' => {
    if (URL_REGEX.test(value)) {
      try { new URL(value.startsWith('http') ? value : 'https://' + value); return 'url'; } catch { /* not a URL */ }
    }
    if (EMAIL_REGEX.test(value)) return 'email';
    if (PHONE_REGEX.test(value.replace(/\s/g, ''))) return 'phone';
    return 'sms';
  };

  const handleChange = (value: string) => {
    setInput(value);
    if (error) setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    if (onSubmit) {
      onSubmit(trimmed);
      return;
    }

    const type = detectType(trimmed);
    const endpoints: Record<string, string> = {
      url: '/url-checker',
      email: '/email-checker',
      phone: '/sms-checker',
      sms: '/sms-checker',
    };
    const modeParam = type === 'phone' ? '&mode=phone' : '';
    navigate(`${endpoints[type]}?q=${encodeURIComponent(trimmed)}${modeParam}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`relative flex items-center ${large ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-page)]'} border ${error ? 'border-[#DC2626]' : 'border-[var(--border)]'} rounded-2xl shadow-search transition-shadow duration-150 focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]`}>
        <div className={`flex-shrink-0 ${large ? 'pl-6' : 'pl-4'}`}>
          <Search className={`${large ? 'w-6 h-6' : 'w-5 h-5'} text-[var(--text-secondary)]`} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 min-w-0 bg-transparent border-0 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] ${
            large ? 'px-4 py-5 text-lg' : 'px-3 py-3.5 text-base'
          }`}
          disabled={isLoading}
          autoFocus={large}
        />
        <div className={`flex-shrink-0 ${large ? 'pr-3' : 'pr-2'}`}>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary gap-1.5 px-4 sm:px-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            <span className="inline text-sm">Analyze</span>
          </button>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-sm text-[#DC2626]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
