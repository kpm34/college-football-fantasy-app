import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  highlight?: boolean;
}

export function Card({ children, className = '', hover = false, highlight = false }: CardProps) {
  return (
    <div 
      className={`
        glass-card rounded-2xl p-6
        ${hover ? 'hover:bg-white/15 transition-all duration-300' : ''}
        ${highlight ? 'border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-2xl font-bold metallic-text ${className}`}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`text-slate-300 ${className}`}>
      {children}
    </div>
  );
}