'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { getAllTests, getTestsByCategory } from '@/lib/tests'
import type { TestDefinition, TestCategory } from '@/types'
import { Button, Card } from '@/components/ui'

interface TestSelectionProps {
  onSelectTest: (testId: string) => void
  onBack: () => void
}

const CATEGORY_INFO: Record<TestCategory, { label: string; icon: string }> = {
  adhd: { label: 'AD(H)S', icon: '🎯' },
  autism: { label: 'Autismus-Spektrum', icon: '🧩' },
  dyspraxia: { label: 'Dyspraxie / DCD', icon: '🏃' },
  lrs: { label: 'LRS', icon: '📖' },
}

const TARGET_GROUP_LABELS: Record<string, string> = {
  adult: 'Erwachsene',
  child: 'Kinder',
  'parent-about-child': 'Eltern über Kind',
  'teacher-about-child': 'Lehrkraft über Kind',
}

export function TestSelection({ onSelectTest, onBack }: TestSelectionProps) {
  const { onboarding } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | 'all'>(
    onboarding.selectedCategories[0] || 'all'
  )
  const [expandedTest, setExpandedTest] = useState<string | null>(null)

  const categories = onboarding.selectedCategories.length > 0
    ? onboarding.selectedCategories
    : (['adhd', 'autism', 'dyspraxia', 'lrs'] as TestCategory[])

  const tests = selectedCategory === 'all'
    ? getAllTests()
    : getTestsByCategory(selectedCategory)

  return (
    <div className="animate-in">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-sage-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-sage-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {CATEGORY_INFO[cat].label}
          </button>
        ))}
      </div>

      {/* Test List */}
      <div className="space-y-4">
        {tests.map((test) => (
          <TestCard
            key={test.id}
            test={test}
            isExpanded={expandedTest === test.id}
            onToggle={() =>
              setExpandedTest(expandedTest === test.id ? null : test.id)
            }
            onStart={() => onSelectTest(test.id)}
          />
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Keine Screenings in dieser Kategorie verfügbar.
        </div>
      )}
    </div>
  )
}

interface TestCardProps {
  test: TestDefinition
  isExpanded: boolean
  onToggle: () => void
  onStart: () => void
}

function TestCard({ test, isExpanded, onToggle, onStart }: TestCardProps) {
  const inputModeLabels = {
    'in-app': 'In der App ausfüllen',
    'manual-score': 'Ergebnis manuell eingeben',
    'external-link': 'Formular extern öffnen',
  }

  return (
    <Card className="overflow-hidden">
      {/* Header - immer sichtbar */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start justify-between"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{test.name}</h3>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {TARGET_GROUP_LABELS[test.targetGroup]}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{test.description}</p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 ml-2 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Dauer</p>
              <p className="text-sm font-medium text-gray-900">{test.duration}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Fragen</p>
              <p className="text-sm font-medium text-gray-900">{test.itemCount || '–'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Ausfüllmodus</p>
              <p className="text-sm font-medium text-gray-900">
                {inputModeLabels[test.inputMode]}
              </p>
            </div>
          </div>

          {/* Lizenz-Hinweis für restricted/unknown */}
          {test.licenseStatus !== 'free' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-amber-800">
                    {test.licenseNote}
                  </p>
                  {test.sourceUrl && (
                    <a
                      href={test.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-800 mt-1"
                    >
                      Zum offiziellen Formular
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Start Button */}
          <Button fullWidth onClick={onStart}>
            {test.inputMode === 'in-app' ? 'Screening starten' : 'Ergebnis eingeben'}
          </Button>
        </div>
      )}
    </Card>
  )
}
