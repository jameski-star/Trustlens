import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Loader2 } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  large?: boolean;
  onSubmit?: (input: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({
  placeholder = 'Paste a website, email, phone number or message...',
  large = false,
  onSubmit,
  isLoading = false,
}: SearchBarProps) {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const detectType = (value: string): 'url' | 'email' | 'phone' | 'sms' => {
    if (value.startsWith('http://') || value.startsWith('https://') || value.includes('.')) {
      try { new URL(value.startsWith('http') ? value : 'https://' + value); return 'url'; } catch {}
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
    if (/^[\+\d\s\-\(\)\.]{7,20}$/.test(value.replace(/\s/g, ''))) return 'phone';
    return 'sms';
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (onSubmit) {
      onSubmit(input.trim());
      return;
    }

    const type = detectType(input.trim());
    const endpoints: Record<string, string> = {
      url: '/url-checker',
      email: '/email-checker',
      phone: '/sms-checker',
      sms: '/sms-checker',
    };
    navigate(`${endpoints[type]}?q=${encodeURIComponent(input.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`relative flex items-center ${large ? 'bg-white' : 'bg-[#FAFBFC]'} border border-[#E2E8F0] rounded-2xl shadow-search transition-all duration-200 focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]`}>
        <div className={`${large ? 'pl-6' : 'pl-4'}`}>
          <Search className={`${large ? 'w-6 h-6' : 'w-5 h-5'} text-[#475569]`} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent border-0 outline-none text-[#0F172A] placeholder:text-[#475569] ${
            large ? 'px-4 py-5 text-lg' : 'px-3 py-3.5 text-base'
          }`}
          disabled={isLoading}
          autoFocus={large}
        />
        <div className={`${large ? 'pr-3' : 'pr-2'}`}>
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
            <span className="hidden sm:inline">Analyze</span>
          </button>
        </div>
      </div>
    </form>
  );
}
