'use client'

import { useAppStore } from '@/store'
import { Button } from '@/components/ui'

interface CompleteStepProps {
  onComplete: () => void
  onBack: () => void
}

export function CompleteStep({ onComplete, onBack }: CompleteStepProps) {
  const { childProfile, onboarding } = useAppStore()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-sage-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Titel */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Alles bereit!
      </h2>

      {/* Zusammenfassung */}
      <p className="text-gray-600 mb-6 max-w-sm">
        Du kannst jetzt mit den Screenings für{' '}
        <span className="font-medium text-gray-900">
          {childProfile?.name || 'dein Kind'}
        </span>{' '}
        beginnen.
      </p>

      {/* Ausgewählte Bereiche */}
      {onboarding.selectedCategories.length > 0 && (
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">Ausgewählte Bereiche:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {onboarding.selectedCategories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm"
              >
                {getCategoryLabel(cat)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Button size="lg" onClick={onComplete} className="mb-4">
        Zur Übersicht
      </Button>

      <Button variant="ghost" onClick={onBack}>
        Zurück
      </Button>
    </div>
  )
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    adhd: 'AD(H)S',
    autism: 'Autismus',
    dyspraxia: 'Dyspraxie',
    lrs: 'LRS',
  }
  return labels[category] || category
}
