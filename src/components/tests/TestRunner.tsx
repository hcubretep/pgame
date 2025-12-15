'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { getTestDefinition, calculateScore, interpretScore, ASRS_6Q_ITEMS, ASRS_6Q_LIKERT_OPTIONS } from '@/lib/tests'
import type { TestId, ManualTestInput } from '@/types'
import { Button, Card, Input, Label, RadioGroup, Checkbox, Stepper } from '@/components/ui'

interface TestRunnerProps {
  testId: string
  onComplete: () => void
  onBack: () => void
}

export function TestRunner({ testId, onComplete, onBack }: TestRunnerProps) {
  const {
    childProfile,
    caregiverProfile,
    startTestSession,
    completeTestSession,
    currentTestSession,
  } = useAppStore()

  const definition = getTestDefinition(testId as TestId)

  const [session, setSession] = useState(currentTestSession)
  const [answers, setAnswers] = useState<number[]>([])
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [manualInput, setManualInput] = useState<ManualTestInput>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Start session when component mounts
  useEffect(() => {
    if (!currentTestSession && childProfile && caregiverProfile) {
      const newSession = startTestSession(
        testId,
        childProfile.id,
        caregiverProfile.id
      )
      setSession(newSession)
    }
  }, [testId, childProfile, caregiverProfile, currentTestSession, startTestSession])

  if (!definition) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Test nicht gefunden.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Zurück
        </Button>
      </div>
    )
  }

  // Render different modes
  if (definition.inputMode === 'in-app') {
    return (
      <InAppTestRunner
        definition={definition}
        answers={answers}
        setAnswers={setAnswers}
        currentItemIndex={currentItemIndex}
        setCurrentItemIndex={setCurrentItemIndex}
        onComplete={async () => {
          setIsSubmitting(true)
          const scores = calculateScore(testId as TestId, answers)
          const interpretation = interpretScore(testId as TestId, scores)

          if (session) {
            await completeTestSession(session.id, scores, interpretation)
          }
          onComplete()
        }}
        onBack={onBack}
        isSubmitting={isSubmitting}
      />
    )
  }

  // Manual score entry
  return (
    <ManualScoreEntry
      definition={definition}
      manualInput={manualInput}
      setManualInput={setManualInput}
      onComplete={async () => {
        setIsSubmitting(true)
        const scores = calculateScore(testId as TestId, undefined, manualInput)
        const interpretation = interpretScore(testId as TestId, scores, manualInput)

        if (session) {
          await completeTestSession(session.id, scores, interpretation)
        }
        onComplete()
      }}
      onBack={onBack}
      isSubmitting={isSubmitting}
    />
  )
}

// ============================================
// In-App Test Runner (für ASRS-6Q etc.)
// ============================================

interface InAppTestRunnerProps {
  definition: ReturnType<typeof getTestDefinition>
  answers: number[]
  setAnswers: (answers: number[]) => void
  currentItemIndex: number
  setCurrentItemIndex: (index: number) => void
  onComplete: () => void
  onBack: () => void
  isSubmitting: boolean
}

function InAppTestRunner({
  definition,
  answers,
  setAnswers,
  currentItemIndex,
  setCurrentItemIndex,
  onComplete,
  onBack,
  isSubmitting,
}: InAppTestRunnerProps) {
  if (!definition) return null

  // Get items based on test
  const items = definition.id === 'asrs-6q' ? ASRS_6Q_ITEMS : []
  const likertOptions = definition.id === 'asrs-6q' ? ASRS_6Q_LIKERT_OPTIONS : []

  const currentItem = items[currentItemIndex]
  const totalItems = items.length
  const isLastItem = currentItemIndex === totalItems - 1
  const currentAnswer = answers[currentItemIndex]

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers]
    newAnswers[currentItemIndex] = value
    setAnswers(newAnswers)
  }

  const goNext = () => {
    if (isLastItem) {
      onComplete()
    } else {
      setCurrentItemIndex(currentItemIndex + 1)
    }
  }

  const goPrev = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1)
    } else {
      onBack()
    }
  }

  if (!currentItem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Keine Fragen verfügbar.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Zurück
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-in">
      {/* Progress */}
      <div className="mb-6">
        <Stepper
          steps={items.map((_, i) => ({ id: i }))}
          currentStep={currentItemIndex}
          completedSteps={answers.map((_, i) => i).filter((i) => answers[i] !== undefined)}
          variant="progress"
        />
      </div>

      {/* Question */}
      <Card className="mb-6">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Frage {currentItemIndex + 1} von {totalItems}
          </p>
          <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
            {currentItem.text}
          </h3>
        </div>

        {/* Likert Options */}
        <RadioGroup
          name={`question-${currentItemIndex}`}
          value={currentAnswer?.toString() ?? ''}
          onChange={(value) => handleAnswer(parseInt(value, 10))}
          options={likertOptions.map((opt) => ({
            value: opt.value.toString(),
            label: opt.label,
          }))}
          size="lg"
        />
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={goPrev} className="flex-1">
          Zurück
        </Button>
        <Button
          onClick={goNext}
          disabled={currentAnswer === undefined || isSubmitting}
          loading={isSubmitting}
          className="flex-1"
        >
          {isLastItem ? 'Auswerten' : 'Weiter'}
        </Button>
      </div>
    </div>
  )
}

// ============================================
// Manual Score Entry
// ============================================

interface ManualScoreEntryProps {
  definition: ReturnType<typeof getTestDefinition>
  manualInput: ManualTestInput
  setManualInput: (input: ManualTestInput) => void
  onComplete: () => void
  onBack: () => void
  isSubmitting: boolean
}

function ManualScoreEntry({
  definition,
  manualInput,
  setManualInput,
  onComplete,
  onBack,
  isSubmitting,
}: ManualScoreEntryProps) {
  if (!definition) return null

  const isVanderbilt = definition.id.startsWith('vanderbilt')

  return (
    <div className="animate-in">
      {/* Info Box */}
      <div className="info-box mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">So geht&apos;s:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>
            <a
              href={definition.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sage-600 hover:text-sage-700 underline"
            >
              Offizielles Formular öffnen
            </a>
          </li>
          <li>Formular ausfüllen (Papier oder digital)</li>
          <li>Ergebnis unten eingeben</li>
        </ol>
      </div>

      {/* Vanderbilt-specific Input */}
      {isVanderbilt ? (
        <VanderbiltInput
          manualInput={manualInput}
          setManualInput={setManualInput}
        />
      ) : (
        <GenericScoreInput
          definition={definition}
          manualInput={manualInput}
          setManualInput={setManualInput}
        />
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Abbrechen
        </Button>
        <Button
          onClick={onComplete}
          disabled={!isValidInput(definition, manualInput) || isSubmitting}
          loading={isSubmitting}
          className="flex-1"
        >
          Auswerten
        </Button>
      </div>
    </div>
  )
}

// ============================================
// Vanderbilt Input
// ============================================

interface VanderbiltInputProps {
  manualInput: ManualTestInput
  setManualInput: (input: ManualTestInput) => void
}

function VanderbiltInput({ manualInput, setManualInput }: VanderbiltInputProps) {
  const updateSymptomCount = (key: string, value: number) => {
    setManualInput({
      ...manualInput,
      symptomCounts: {
        ...manualInput.symptomCounts,
        [key]: value,
      },
    })
  }

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">Symptom-Zählung</h3>
      <p className="text-sm text-gray-600 mb-4">
        Zähle die Anzahl der Items mit Wert 2 (&quot;Oft&quot;) oder 3 (&quot;Sehr oft&quot;):
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="inattention">
            Unaufmerksamkeit (Fragen 1-9): Items mit 2 oder 3
          </Label>
          <Input
            id="inattention"
            type="number"
            min={0}
            max={9}
            value={manualInput.symptomCounts?.inattention ?? ''}
            onChange={(e) =>
              updateSymptomCount('inattention', parseInt(e.target.value, 10) || 0)
            }
            placeholder="0-9"
          />
        </div>

        <div>
          <Label htmlFor="hyperactivity">
            Hyperaktivität/Impulsivität (Fragen 10-18): Items mit 2 oder 3
          </Label>
          <Input
            id="hyperactivity"
            type="number"
            min={0}
            max={9}
            value={manualInput.symptomCounts?.hyperactivity ?? ''}
            onChange={(e) =>
              updateSymptomCount('hyperactivity', parseInt(e.target.value, 10) || 0)
            }
            placeholder="0-9"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Checkbox
            checked={manualInput.performanceImpairment ?? false}
            onChange={(e) =>
              setManualInput({
                ...manualInput,
                performanceImpairment: e.target.checked,
              })
            }
            label="Performance-Beeinträchtigung vorhanden"
            description="Mindestens 1 Performance-Item mit 4 oder 5 bewertet?"
          />
        </div>
      </div>
    </Card>
  )
}

// ============================================
// Generic Score Input
// ============================================

interface GenericScoreInputProps {
  definition: ReturnType<typeof getTestDefinition>
  manualInput: ManualTestInput
  setManualInput: (input: ManualTestInput) => void
}

function GenericScoreInput({
  definition,
  manualInput,
  setManualInput,
}: GenericScoreInputProps) {
  if (!definition) return null

  const { minScore, maxScore } = definition.scoringInfo

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">Ergebnis eingeben</h3>

      <div>
        <Label htmlFor="totalScore">
          Gesamtpunktzahl ({minScore}-{maxScore})
        </Label>
        <Input
          id="totalScore"
          type="number"
          min={minScore}
          max={maxScore}
          step={definition.id === 'snap-iv' || definition.id === 'arhq' ? 0.01 : 1}
          value={manualInput.totalScore ?? ''}
          onChange={(e) =>
            setManualInput({
              ...manualInput,
              totalScore: parseFloat(e.target.value) || 0,
            })
          }
          placeholder={`${minScore}-${maxScore}`}
        />
      </div>

      {/* Optional: Subskalen */}
      {definition.scoringInfo.subscales && definition.scoringInfo.subscales.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Subskalen (optional):
          </p>
          <div className="space-y-3">
            {definition.scoringInfo.subscales.map((sub) => (
              <div key={sub.id}>
                <Label htmlFor={`subscale-${sub.id}`}>{sub.name}</Label>
                <Input
                  id={`subscale-${sub.id}`}
                  type="number"
                  min={0}
                  max={sub.maxScore}
                  value={manualInput.subscaleScores?.[sub.id] ?? ''}
                  onChange={(e) =>
                    setManualInput({
                      ...manualInput,
                      subscaleScores: {
                        ...manualInput.subscaleScores,
                        [sub.id]: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder={`0-${sub.maxScore}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional: Notizen */}
      <div className="mt-4">
        <Label htmlFor="notes">Notizen (optional)</Label>
        <Input
          id="notes"
          value={manualInput.notes ?? ''}
          onChange={(e) =>
            setManualInput({
              ...manualInput,
              notes: e.target.value,
            })
          }
          placeholder="z.B. Datum des Ausfüllens, Besonderheiten..."
        />
      </div>
    </Card>
  )
}

// ============================================
// Validation
// ============================================

function isValidInput(
  definition: ReturnType<typeof getTestDefinition>,
  input: ManualTestInput
): boolean {
  if (!definition) return false

  if (definition.id.startsWith('vanderbilt')) {
    const { symptomCounts } = input
    return (
      symptomCounts?.inattention !== undefined ||
      symptomCounts?.hyperactivity !== undefined
    )
  }

  return input.totalScore !== undefined && input.totalScore >= 0
}
