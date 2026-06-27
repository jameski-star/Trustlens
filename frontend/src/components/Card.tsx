import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`card ${hover ? 'hover:shadow-card-hover transition-shadow duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
