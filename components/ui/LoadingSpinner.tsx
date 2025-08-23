interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
        <div className={`${sizes[size]} border-4 border-transparent rounded-full animate-spin border-t-blue-500`} />
      </div>
      {message && (
        <p className="text-slate-400 text-sm">{message}</p>
      )}
    </div>
  );
}