import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-[#2563EB]',
    secondary: 'border-2 hover:border-[var(--text-accent)] hover:text-[var(--text-accent)] focus:ring-[#2563EB]' +
      ' border-[var(--border)] text-[var(--text-primary)]',
    ghost: 'hover:text-[var(--text-accent)] hover:bg-[var(--bg-subtle)] focus:ring-[#2563EB]' +
      ' text-[var(--text-secondary)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
