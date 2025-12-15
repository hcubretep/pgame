/**
 * Input Components
 *
 * Text input, textarea, and label.
 */

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

// ============================================
// Label
// ============================================

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-gray-700 mb-1.5 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'

// ============================================
// Text Input
// ============================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, hint, className = '', ...props }, ref) => {
    const hasError = !!error

    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`
            w-full px-4 py-3
            text-base text-gray-900
            bg-white
            border rounded-xl
            transition-colors duration-150
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${
              hasError
                ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                : 'border-gray-200 focus:border-sage-400 focus:ring-sage-200'
            }
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ============================================
// Textarea
// ============================================

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, hint, className = '', ...props }, ref) => {
    const hasError = !!error

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3
            text-base text-gray-900
            bg-white
            border rounded-xl
            transition-colors duration-150
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            resize-none
            ${
              hasError
                ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                : 'border-gray-200 focus:border-sage-400 focus:ring-sage-200'
            }
            ${className}
          `}
          rows={4}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// ============================================
// Tags Input (für Stärken, Sorgen)
// ============================================

export interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  hint?: string
  maxTags?: number
}

export function TagsInput({
  value,
  onChange,
  placeholder,
  hint,
  maxTags = 10,
}: TagsInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const input = e.currentTarget
      const newTag = input.value.trim()

      if (newTag && !value.includes(newTag) && value.length < maxTags) {
        onChange([...value, newTag])
        input.value = ''
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-sage-500 hover:text-sage-700"
              aria-label={`${tag} entfernen`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-200 focus:border-sage-400"
      />
      {hint && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
    </div>
  )
}
