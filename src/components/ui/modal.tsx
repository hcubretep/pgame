/**
 * Modal Component
 *
 * Accessible modal/dialog for disclaimers, confirmations, etc.
 */

'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
}

const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full mx-4',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus trap und Escape-Key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Verhindern des Hintergrund-Scrollings
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    // Focus auf Modal setzen
    modalRef.current?.focus()

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${sizeStyles[size]}
          bg-white rounded-2xl shadow-xl
          max-h-[90vh] overflow-hidden
          flex flex-col
          animate-in fade-in-0 zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-0">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 -m-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Schließen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 pt-0 border-t border-gray-100 mt-auto">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Confirmation Modal
// ============================================

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  variant = 'default',
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'primary' : 'primary'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  )
}
