'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { getTestDefinition } from '@/lib/tests'
import type { TestSession } from '@/types'
import { Button, Card, CardHeader, CardContent, SignalIndicator, SignalBar, Modal } from '@/components/ui'

export function ResultsView() {
  const { testSessions, childProfile } = useAppStore()
  const [selectedSession, setSelectedSession] = useState<TestSession | null>(null)

  const completedSessions = testSessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())

  if (completedSessions.length === 0) {
    return (
      <div className="text-center py-12 animate-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Ergebnisse</h3>
        <p className="text-gray-500 mb-6">
          Führe dein erstes Screening durch, um Ergebnisse zu sehen.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in">
      {/* Disclaimer */}
      <div className="info-box mb-6">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-sage-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-600">
            Diese Ergebnisse sind Screenings, keine Diagnosen. Sie zeigen Hinweise, die eine professionelle Abklärung sinnvoll machen könnten.
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {completedSessions.map((session) => (
          <ResultCard
            key={session.id}
            session={session}
            onClick={() => setSelectedSession(session)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedSession && (
        <ResultDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}

// ============================================
// Result Card
// ============================================

interface ResultCardProps {
  session: TestSession
  onClick: () => void
}

function ResultCard({ session, onClick }: ResultCardProps) {
  const definition = getTestDefinition(session.testId)
  if (!definition) return null

  const { interpretation, scores } = session
  const { maxScore } = definition.scoringInfo

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{definition.name}</h3>
          <p className="text-sm text-gray-500">
            {session.completedAt
              ? new Date(session.completedAt).toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : ''}
          </p>
        </div>
        <SignalIndicator level={interpretation.level} size="sm" />
      </div>

      <SignalBar
        score={scores.total}
        maxScore={maxScore}
        thresholds={definition.scoringInfo.thresholds.map((t) => ({
          min: t.min,
          max: t.max,
          level: t.level,
        }))}
        height="sm"
      />

      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
        {interpretation.summary}
      </p>

      <div className="flex items-center justify-end mt-3 text-sm text-sage-600">
        <span>Details ansehen</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  )
}

// ============================================
// Result Detail Modal
// ============================================

interface ResultDetailModalProps {
  session: TestSession
  onClose: () => void
}

function ResultDetailModal({ session, onClose }: ResultDetailModalProps) {
  const definition = getTestDefinition(session.testId)
  if (!definition) return null

  const { interpretation, scores } = session
  const { maxScore, thresholds } = definition.scoringInfo

  return (
    <Modal isOpen={true} onClose={onClose} title={definition.fullName} size="lg">
      <div className="space-y-6">
        {/* Score Overview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Ergebnis</h4>
            <SignalIndicator level={interpretation.level} />
          </div>

          <SignalBar
            score={scores.total}
            maxScore={maxScore}
            thresholds={thresholds.map((t) => ({
              min: t.min,
              max: t.max,
              level: t.level,
            }))}
          />
        </div>

        {/* Interpretation */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Einschätzung</h4>
          <p className="text-gray-600">{interpretation.summary}</p>
          {interpretation.details && (
            <p className="text-gray-600 mt-2">{interpretation.details}</p>
          )}
        </div>

        {/* Next Steps */}
        {interpretation.nextSteps.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Empfohlene nächste Schritte</h4>
            <ul className="space-y-2">
              {interpretation.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Caveats */}
        {interpretation.caveats.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-medium text-amber-800 mb-2">Wichtige Hinweise</h4>
            <ul className="space-y-1">
              {interpretation.caveats.map((caveat, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{caveat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Source Link */}
        {definition.sourceUrl && (
          <div className="pt-4 border-t border-gray-200">
            <a
              href={definition.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-sage-600 hover:text-sage-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Quelle: {definition.name}
            </a>
          </div>
        )}

        {/* Datum */}
        <div className="text-sm text-gray-400">
          Durchgeführt am{' '}
          {session.completedAt
            ? new Date(session.completedAt).toLocaleDateString('de-DE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </div>
      </div>
    </Modal>
  )
}
