'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { Button, Card, CardHeader, CardContent } from '@/components/ui'
import { TestSelection } from '@/components/tests/TestSelection'
import { TestRunner } from '@/components/tests/TestRunner'
import { ResultsView } from '@/components/results/ResultsView'
import { ReportsView } from '@/components/reports/ReportsView'
import { SourcesView } from '@/components/sources/SourcesView'

type DashboardView = 'home' | 'tests' | 'test-runner' | 'results' | 'reports' | 'sources' | 'settings'

export function Dashboard() {
  const { childProfile, caregiverProfile, testSessions, onboarding } = useAppStore()
  const [currentView, setCurrentView] = useState<DashboardView>('home')
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null)

  const completedTests = testSessions.filter((s) => s.status === 'completed')
  const pendingTests = testSessions.filter((s) => s.status === 'in-progress')

  const handleStartTest = (testId: string) => {
    setSelectedTestId(testId)
    setCurrentView('test-runner')
  }

  const handleTestComplete = () => {
    setSelectedTestId(null)
    setCurrentView('results')
  }

  const handleBackToHome = () => {
    setSelectedTestId(null)
    setCurrentView('home')
  }

  // Navigation Header
  const renderHeader = () => {
    if (currentView === 'home') {
      return (
        <div className="sticky-header px-4 pb-4">
          <div className="container-app">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hallo,</p>
                <h1 className="text-xl font-semibold text-gray-900">
                  {caregiverProfile?.name || 'Willkommen'}
                </h1>
              </div>
              <button
                onClick={() => setCurrentView('settings')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Einstellungen"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )
    }

    const titles: Record<DashboardView, string> = {
      home: '',
      tests: 'Screening auswählen',
      'test-runner': 'Screening',
      results: 'Ergebnisse',
      reports: 'Berichte',
      sources: 'Quellen & Formulare',
      settings: 'Einstellungen',
    }

    return (
      <div className="sticky-header px-4 pb-4">
        <div className="container-app">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToHome}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Zurück"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {titles[currentView]}
            </h1>
          </div>
        </div>
      </div>
    )
  }

  // Home View Content
  const renderHomeContent = () => (
    <div className="animate-in">
      {/* Kind-Info Card */}
      {childProfile && (
        <Card variant="elevated" className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-sage-700">
                {childProfile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{childProfile.name}</h3>
              <p className="text-sm text-gray-500">
                {childProfile.age ? `${childProfile.age} Jahre` : ''}
                {childProfile.age && childProfile.schoolGrade ? ' · ' : ''}
                {childProfile.schoolGrade || ''}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setCurrentView('tests')}
          className="card-interactive text-left"
        >
          <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900">Screening starten</h3>
          <p className="text-sm text-gray-500 mt-1">Neues Screening durchführen</p>
        </button>

        <button
          onClick={() => setCurrentView('results')}
          className="card-interactive text-left"
        >
          <div className="w-10 h-10 bg-bloom-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-bloom-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900">Ergebnisse</h3>
          <p className="text-sm text-gray-500 mt-1">
            {completedTests.length} abgeschlossen
          </p>
        </button>

        <button
          onClick={() => setCurrentView('reports')}
          className="card-interactive text-left"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900">Berichte</h3>
          <p className="text-sm text-gray-500 mt-1">PDF erstellen & teilen</p>
        </button>

        <button
          onClick={() => setCurrentView('sources')}
          className="card-interactive text-left"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900">Quellen</h3>
          <p className="text-sm text-gray-500 mt-1">Formulare & Infos</p>
        </button>
      </div>

      {/* Progress Section */}
      {(completedTests.length > 0 || pendingTests.length > 0) && (
        <Card className="mb-6">
          <CardHeader title="Dein Fortschritt" />
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-signal-green rounded-full" />
                <span className="text-gray-600">
                  {completedTests.length} abgeschlossen
                </span>
              </div>
              {pendingTests.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-signal-yellow rounded-full" />
                  <span className="text-gray-600">
                    {pendingTests.length} offen
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Categories */}
      {onboarding.selectedCategories.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Ausgewählte Bereiche" />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {onboarding.selectedCategories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm"
                >
                  {getCategoryLabel(cat)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer Reminder */}
      <div className="info-box">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-sage-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-600">
            <strong>Erinnerung:</strong> Screenings ersetzen keine professionelle Diagnose.
          </p>
        </div>
      </div>
    </div>
  )

  // Render View
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHomeContent()
      case 'tests':
        return <TestSelection onSelectTest={handleStartTest} onBack={handleBackToHome} />
      case 'test-runner':
        return selectedTestId ? (
          <TestRunner testId={selectedTestId} onComplete={handleTestComplete} onBack={() => setCurrentView('tests')} />
        ) : null
      case 'results':
        return <ResultsView />
      case 'reports':
        return <ReportsView />
      case 'sources':
        return <SourcesView />
      case 'settings':
        return <SettingsView onBack={handleBackToHome} />
      default:
        return null
    }
  }

  return (
    <div className="page-wrapper">
      {renderHeader()}
      <div className="page-content">
        <div className="container-app py-6">{renderContent()}</div>
      </div>
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

// Simple Settings View
function SettingsView({ onBack }: { onBack: () => void }) {
  const { resetOnboarding } = useAppStore()
  const [showReset, setShowReset] = useState(false)

  return (
    <div className="animate-in">
      <Card className="mb-4">
        <CardHeader title="Über Bloom Now" />
        <CardContent>
          <p className="text-sm text-gray-600 mb-2">
            Version 1.0.0
          </p>
          <p className="text-sm text-gray-600">
            Eine App zur Orientierung für Familien mit neurodivergenten Kindern.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Datenschutz" />
        <CardContent>
          <p className="text-sm text-gray-600">
            Alle Daten werden ausschließlich lokal auf deinem Gerät gespeichert. Es werden keine Daten an Server übertragen.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Daten zurücksetzen" />
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Alle lokalen Daten löschen und neu beginnen.
          </p>
          {!showReset ? (
            <Button variant="outline" onClick={() => setShowReset(true)}>
              Daten zurücksetzen
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-600 font-medium">
                Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowReset(false)}>
                  Abbrechen
                </Button>
                <Button
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    resetOnboarding()
                    window.location.reload()
                  }}
                >
                  Ja, zurücksetzen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
