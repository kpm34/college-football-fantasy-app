import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  highlight?: boolean
  tone?: 'default' | 'periwinkle'
}

export function Card({
  children,
  className = '',
  hover = false,
  highlight = false,
  tone = 'default',
}: CardProps) {
  const palette = {
    maroon: '#3A1220',
    orange: '#E89A5C',
    periwinkle: '#8091BB',
    tan: '#D9BBA4',
    gold: '#DAA520',
    bronze: '#B8860B',
  } as const
  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 ${className}`}
      style={{
        background: tone === 'periwinkle' ? `${palette.periwinkle}22` : 'rgba(255,255,255,0.06)',
        border: highlight
          ? `2px solid ${tone === 'periwinkle' ? palette.periwinkle : palette.gold}80`
          : `1px solid ${tone === 'periwinkle' ? `${palette.periwinkle}66` : `${palette.tan}40`}`,
        boxShadow: highlight
          ? `0 10px 30px ${palette.gold}33`
          : hover
          ? `0 8px 24px ${palette.maroon}1f`
          : `0 4px 12px ${palette.maroon}14`,
      }}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return <h3 className={`text-2xl font-bold ${className}`}>{children}</h3>
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`${className}`}>{children}</div>
}
