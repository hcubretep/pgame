/**
 * Card Component
 *
 * Clean card container with optional header and footer.
 */

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-white',
  elevated: 'bg-white shadow-md',
  outlined: 'bg-white border border-gray-200',
}

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-2xl
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between mb-4 ${className}`}
        {...props}
      >
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
          {children}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// Card Content
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className = '', children, ...props }, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
})

CardContent.displayName = 'CardContent'

// Card Footer
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className = '', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`mt-4 pt-4 border-t border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'
