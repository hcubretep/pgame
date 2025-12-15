'use client'

import { Button } from '@/components/ui'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in">
      {/* Logo / Illustration */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-sage-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-sage-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      </div>

      {/* Titel */}
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Willkommen bei Bloom Now
      </h1>

      {/* Untertitel */}
      <p className="text-lg text-sage-700 mb-6">
        Orientierung für Familien
      </p>

      {/* Beschreibung */}
      <p className="text-gray-600 max-w-sm mb-10 leading-relaxed">
        Diese App hilft dir, mögliche Muster bei deinem Kind zu erkennen und strukturierte nächste Schritte zu planen.
      </p>

      {/* CTA Button */}
      <Button size="lg" onClick={onNext}>
        Los geht&apos;s
      </Button>

      {/* Hinweis */}
      <p className="text-sm text-gray-400 mt-8 max-w-xs">
        Alle Daten bleiben lokal auf deinem Gerät.
      </p>
    </div>
  )
}
