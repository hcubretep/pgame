/**
 * Radio and Checkbox Components
 */

import { forwardRef, type InputHTMLAttributes } from 'react'

// ============================================
// Radio Button
// ============================================

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || `radio-${Math.random().toString(36).substring(7)}`

    return (
      <label
        htmlFor={inputId}
        className={`
          flex items-center gap-3 cursor-pointer
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <input
          ref={ref}
          type="radio"
          id={inputId}
          className="
            w-5 h-5
            border-2 border-gray-300
            text-sage-600
            focus:ring-2 focus:ring-sage-200 focus:ring-offset-0
            cursor-pointer
            disabled:cursor-not-allowed
          "
          {...props}
        />
        {label && <span className="text-base text-gray-700">{label}</span>}
      </label>
    )
  }
)

Radio.displayName = 'Radio'

// ============================================
// Radio Group
// ============================================

export interface RadioGroupOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  value: string
  onChange: (value: string) => void
  options: RadioGroupOption[]
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  orientation = 'vertical',
  size = 'md',
}: RadioGroupProps) {
  const sizeStyles = {
    sm: 'p-3 gap-2',
    md: 'p-4 gap-3',
    lg: 'p-5 gap-4',
  }

  return (
    <div
      className={`
        flex ${orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}
        gap-3
      `}
      role="radiogroup"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-start cursor-pointer
            border-2 rounded-xl transition-all duration-150
            ${sizeStyles[size]}
            ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${
              value === option.value
                ? 'border-sage-500 bg-sage-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={option.disabled}
            className="
              w-5 h-5 mt-0.5
              border-2 border-gray-300
              text-sage-600
              focus:ring-2 focus:ring-sage-200 focus:ring-offset-0
              cursor-pointer
            "
          />
          <div className="ml-3">
            <span className="text-base font-medium text-gray-900">
              {option.label}
            </span>
            {option.description && (
              <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  )
}

// ============================================
// Checkbox
// ============================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substring(7)}`

    return (
      <label
        htmlFor={inputId}
        className={`
          flex items-start gap-3 cursor-pointer
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className="
            w-5 h-5 mt-0.5
            border-2 border-gray-300
            rounded
            text-sage-600
            focus:ring-2 focus:ring-sage-200 focus:ring-offset-0
            cursor-pointer
            disabled:cursor-not-allowed
          "
          {...props}
        />
        <div>
          {label && <span className="text-base text-gray-700">{label}</span>}
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// ============================================
// Checkbox Group
// ============================================

export interface CheckboxGroupOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface CheckboxGroupProps {
  value: string[]
  onChange: (values: string[]) => void
  options: CheckboxGroupOption[]
  orientation?: 'horizontal' | 'vertical'
}

export function CheckboxGroup({
  value,
  onChange,
  options,
  orientation = 'vertical',
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue])
    } else {
      onChange(value.filter((v) => v !== optionValue))
    }
  }

  return (
    <div
      className={`
        flex ${orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}
        gap-3
      `}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-start cursor-pointer
            border-2 rounded-xl p-4 transition-all duration-150
            ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${
              value.includes(option.value)
                ? 'border-sage-500 bg-sage-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }
          `}
        >
          <input
            type="checkbox"
            checked={value.includes(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            disabled={option.disabled}
            className="
              w-5 h-5 mt-0.5
              border-2 border-gray-300
              rounded
              text-sage-600
              focus:ring-2 focus:ring-sage-200 focus:ring-offset-0
              cursor-pointer
            "
          />
          <div className="ml-3">
            <span className="text-base font-medium text-gray-900">
              {option.label}
            </span>
            {option.description && (
              <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  )
}
