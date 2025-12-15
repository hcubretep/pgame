'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import type { TestCategory } from '@/types'
import { Button, CheckboxGroup } from '@/components/ui'

interface CategoriesStepProps {
  onNext: () => void
  onBack: () => void
}

const CATEGORIES = [
  {
    value: 'adhd',
    label: 'AD(H)S',
    description: 'Aufmerksamkeit, Konzentration, Impulsivität',
  },
  {
    value: 'autism',
    label: 'Autismus-Spektrum',
    description: 'Soziale Interaktion, Kommunikation, Interessen',
  },
  {
    value: 'dyspraxia',
    label: 'Dyspraxie / DCD',
    description: 'Motorische Koordination, Bewegungsplanung',
  },
  {
    value: 'lrs',
    label: 'LRS',
    description: 'Lesen, Schreiben, Rechtschreibung',
  },
]

export function CategoriesStep({ onNext, onBack }: CategoriesStepProps) {
  const { onboarding, setSelectedCategories } = useAppStore()
  const [selected, setSelected] = useState<string[]>(onboarding.selectedCategories)

  const handleChange = (values: string[]) => {
    setSelected(values)
    setSelectedCategories(values as TestCategory[])
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="animate-in">
      <h2 className="section-title">Welche Bereiche interessieren dich?</h2>
      <p className="section-subtitle">
        Du kannst mehrere auswählen oder später ändern
      </p>

      <div className="mb-6">
        <CheckboxGroup
          value={selected}
          onChange={handleChange}
          options={CATEGORIES}
        />
      </div>

      {/* Hinweis */}
      <div className="info-box mb-8">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-600">
            Du kannst jederzeit weitere Bereiche hinzufügen. Die Auswahl hilft uns, dir passende Screenings vorzuschlagen.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Zurück
        </Button>
        <Button onClick={handleNext} className="flex-1">
          {selected.length > 0 ? 'Weiter' : 'Überspringen'}
        </Button>
      </div>
    </div>
  )
}
