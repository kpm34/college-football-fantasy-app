import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'font-bold rounded-xl transition-all duration-300 relative overflow-hidden';
    
    const variants = {
      primary: 'chrome-button text-slate-800 hover:scale-105 shadow-lg',
      secondary: 'glass-card text-white hover:bg-white/20 border border-white/20',
      ghost: 'text-white hover:bg-white/10'
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-8 py-4 text-lg',
      lg: 'px-10 py-5 text-xl'
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';