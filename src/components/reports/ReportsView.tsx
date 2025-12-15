'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { getTestDefinition } from '@/lib/tests'
import { generatePDFReport } from '@/lib/pdf'
import { Button, Card, CardHeader, CardContent, CheckboxGroup, RadioGroup } from '@/components/ui'

export function ReportsView() {
  const { testSessions, reports, childProfile, caregiverProfile, createReport } = useAppStore()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [reportType, setReportType] = useState<'kurz' | 'detail'>('kurz')
  const [isGenerating, setIsGenerating] = useState(false)

  const completedSessions = testSessions.filter((s) => s.status === 'completed')

  const sessionOptions = completedSessions.map((session) => {
    const definition = getTestDefinition(session.testId)
    return {
      value: session.id,
      label: definition?.name || session.testId,
      description: session.completedAt
        ? new Date(session.completedAt).toLocaleDateString('de-DE')
        : '',
    }
  })

  const handleGenerateReport = async () => {
    if (selectedSessions.length === 0) return

    setIsGenerating(true)
    try {
      // Create report in store
      const report = await createReport(reportType, selectedSessions)

      // Generate PDF
      const sessionsToInclude = completedSessions.filter((s) =>
        selectedSessions.includes(s.id)
      )

      await generatePDFReport({
        type: reportType,
        childProfile: childProfile!,
        caregiverProfile: caregiverProfile!,
        sessions: sessionsToInclude,
      })

      setIsCreating(false)
      setSelectedSessions([])
    } catch (error) {
      console.error('Fehler beim Erstellen des Berichts:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (completedSessions.length === 0) {
    return (
      <div className="text-center py-12 animate-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Berichte möglich</h3>
        <p className="text-gray-500 mb-6">
          Führe zuerst ein Screening durch, um Berichte erstellen zu können.
        </p>
      </div>
    )
  }

  if (isCreating) {
    return (
      <div className="animate-in">
        <h3 className="section-title">Neuen Bericht erstellen</h3>

        {/* Session Selection */}
        <Card className="mb-6">
          <CardHeader title="Screenings auswählen" />
          <CardContent>
            <CheckboxGroup
              value={selectedSessions}
              onChange={setSelectedSessions}
              options={sessionOptions}
            />
          </CardContent>
        </Card>

        {/* Report Type */}
        <Card className="mb-6">
          <CardHeader title="Berichtsart" />
          <CardContent>
            <RadioGroup
              name="report-type"
              value={reportType}
              onChange={(v) => setReportType(v as 'kurz' | 'detail')}
              options={[
                {
                  value: 'kurz',
                  label: 'Kurzbericht',
                  description: '1 Seite mit den wichtigsten Informationen',
                },
                {
                  value: 'detail',
                  label: 'Detailbericht',
                  description: '3+ Seiten mit ausführlichen Ergebnissen und Quellen',
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
            Abbrechen
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={selectedSessions.length === 0 || isGenerating}
            loading={isGenerating}
            className="flex-1"
          >
            PDF erstellen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in">
      {/* Create New Button */}
      <Button fullWidth onClick={() => setIsCreating(true)} className="mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Neuen Bericht erstellen
      </Button>

      {/* Info */}
      <div className="info-box mb-6">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-sage-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-600">
            Berichte können als PDF heruntergeladen und mit Ärzt:innen oder der Schule geteilt werden. Sie enthalten einen Disclaimer, dass es sich um Screenings und keine Diagnosen handelt.
          </p>
        </div>
      </div>

      {/* Quick Generate */}
      <Card>
        <CardHeader title="Schnell-Export" subtitle="Alle abgeschlossenen Screenings" />
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={async () => {
                setIsGenerating(true)
                try {
                  await generatePDFReport({
                    type: 'kurz',
                    childProfile: childProfile!,
                    caregiverProfile: caregiverProfile!,
                    sessions: completedSessions,
                  })
                } finally {
                  setIsGenerating(false)
                }
              }}
              loading={isGenerating}
            >
              Kurzbericht
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={async () => {
                setIsGenerating(true)
                try {
                  await generatePDFReport({
                    type: 'detail',
                    childProfile: childProfile!,
                    caregiverProfile: caregiverProfile!,
                    sessions: completedSessions,
                  })
                } finally {
                  setIsGenerating(false)
                }
              }}
              loading={isGenerating}
            >
              Detailbericht
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
