import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'periwinkle';
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
    const palette = {
      maroon: '#3A1220',
      orange: '#E89A5C',
      periwinkle: '#8091BB',
      tan: '#D9BBA4',
      gold: '#DAA520',
      bronze: '#B8860B',
    } as const;
    
    const variants = {
      primary: `text-white hover:scale-105 shadow-lg`,
      secondary: `text-white border`,
      ghost: 'text-white hover:bg-white/10',
      periwinkle: 'text-white hover:scale-105 shadow-lg'
    } as const;

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-8 py-4 text-lg',
      lg: 'px-10 py-5 text-xl'
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={
          variant === 'primary'
            ? { background: `linear-gradient(90deg, ${palette.gold}, ${palette.bronze})`, boxShadow: `0 10px 20px ${palette.maroon}33` }
            : variant === 'secondary'
            ? { background: 'rgba(255,255,255,0.06)', borderColor: `${palette.tan}66`, boxShadow: `0 8px 16px ${palette.maroon}22` }
            : variant === 'periwinkle'
            ? { background: `linear-gradient(90deg, ${palette.periwinkle}, #6B7CA6)`, boxShadow: `0 10px 20px ${palette.maroon}33` }
            : undefined
        }
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