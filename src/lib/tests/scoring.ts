/**
 * Bloom Now - Scoring Module
 *
 * Zentrale Scoring-Funktionen für alle Tests.
 */

import type { TestId, TestScores, TestInterpretation, ManualTestInput } from '@/types'
import { TEST_DEFINITIONS } from './definitions'
import { calculateASRS6QScore, interpretASRS6QScore } from './items/asrs-6q'

// ============================================
// Score Calculation
// ============================================

export function calculateScore(
  testId: TestId,
  answers?: number[],
  manualInput?: ManualTestInput
): TestScores {
  const definition = TEST_DEFINITIONS[testId]

  // Wenn manuelle Eingabe
  if (manualInput?.totalScore !== undefined) {
    return {
      total: manualInput.totalScore,
      subscales: manualInput.subscaleScores,
    }
  }

  // In-App Scoring
  if (answers && answers.length > 0) {
    switch (testId) {
      case 'asrs-6q':
        return { total: calculateASRS6QScore(answers) }

      default:
        // Einfache Summe als Fallback
        return { total: answers.reduce((sum, val) => sum + val, 0) }
    }
  }

  return { total: 0 }
}

// ============================================
// Interpretation
// ============================================

export function interpretScore(
  testId: TestId,
  scores: TestScores,
  manualInput?: ManualTestInput
): TestInterpretation {
  const definition = TEST_DEFINITIONS[testId]

  // Spezifische Interpretationen
  switch (testId) {
    case 'asrs-6q':
      return interpretASRS6QScore(scores.total)

    case 'vanderbilt-parent':
    case 'vanderbilt-teacher':
      return interpretVanderbilt(scores, manualInput)

    default:
      return interpretGeneric(testId, scores)
  }
}

// ============================================
// Vanderbilt Interpretation
// ============================================

function interpretVanderbilt(
  scores: TestScores,
  manualInput?: ManualTestInput
): TestInterpretation {
  const inattention = manualInput?.symptomCounts?.inattention ?? 0
  const hyperactivity = manualInput?.symptomCounts?.hyperactivity ?? 0
  const hasPerformanceImpairment = manualInput?.performanceImpairment ?? false

  // ADHS-Unaufmerksam: ≥6 Inattention-Symptome + Performance
  const inattentiveType = inattention >= 6 && hasPerformanceImpairment
  // ADHS-Hyperaktiv/Impulsiv: ≥6 Hyperaktivität-Symptome + Performance
  const hyperactiveType = hyperactivity >= 6 && hasPerformanceImpairment
  // ADHS-Kombiniert: beide erfüllt
  const combinedType = inattentiveType && hyperactiveType

  if (combinedType) {
    return {
      level: 'auffällig',
      summary: 'Hinweise auf ADHS (kombinierter Typ)',
      details:
        'Die eingegebenen Werte deuten auf Symptome sowohl im Bereich Unaufmerksamkeit als auch Hyperaktivität/Impulsivität hin, mit Auswirkungen auf die Leistung.',
      nextSteps: [
        'Professionelle Diagnostik empfohlen',
        'Termin bei Kinderarzt/-ärztin oder Kinderpsychiater:in',
        'Auch Teacher-Version ausfüllen lassen (falls nicht geschehen)',
      ],
      caveats: [
        'Dies ist ein Screening, keine Diagnose',
        'Eine professionelle Einschätzung ist notwendig',
      ],
    }
  }

  if (inattentiveType) {
    return {
      level: 'auffällig',
      summary: 'Hinweise auf ADHS (vorwiegend unaufmerksamer Typ)',
      details:
        'Die eingegebenen Werte deuten auf erhöhte Unaufmerksamkeits-Symptome hin, mit Auswirkungen auf die Leistung.',
      nextSteps: [
        'Professionelle Diagnostik empfohlen',
        'Termin bei Kinderarzt/-ärztin oder Kinderpsychiater:in',
      ],
      caveats: ['Dies ist ein Screening, keine Diagnose'],
    }
  }

  if (hyperactiveType) {
    return {
      level: 'auffällig',
      summary: 'Hinweise auf ADHS (vorwiegend hyperaktiv-impulsiver Typ)',
      details:
        'Die eingegebenen Werte deuten auf erhöhte Hyperaktivitäts-/Impulsivitäts-Symptome hin, mit Auswirkungen auf die Leistung.',
      nextSteps: [
        'Professionelle Diagnostik empfohlen',
        'Termin bei Kinderarzt/-ärztin oder Kinderpsychiater:in',
      ],
      caveats: ['Dies ist ein Screening, keine Diagnose'],
    }
  }

  // Keine Kriterien erfüllt
  return {
    level: 'unauffällig',
    summary: 'Kriterien für ADHS nicht erfüllt',
    details:
      'Die eingegebenen Werte erfüllen nicht die Screening-Kriterien für ADHS. Es wurden weniger als 6 Symptome in den Kernbereichen angegeben oder keine Performance-Beeinträchtigung.',
    nextSteps: [
      'Keine weiteren Schritte notwendig',
      'Bei anhaltenden Sorgen: Gespräch mit Kinderarzt/-ärztin',
    ],
    caveats: [
      'Andere Erklärungen für Verhaltensweisen möglich',
      'Bei Zweifeln: professionelle Beratung',
    ],
  }
}

// ============================================
// Generic Interpretation
// ============================================

function interpretGeneric(testId: TestId, scores: TestScores): TestInterpretation {
  const definition = TEST_DEFINITIONS[testId]
  const { thresholds } = definition.scoringInfo

  // Finde passenden Schwellenwert
  const threshold = thresholds.find(
    (t) => scores.total >= t.min && scores.total <= t.max
  )

  if (!threshold) {
    return {
      level: 'unauffällig',
      summary: 'Ergebnis konnte nicht eingeordnet werden',
      details: `Punktzahl: ${scores.total}`,
      nextSteps: ['Bei Unsicherheit: professionelle Beratung suchen'],
      caveats: ['Automatische Interpretation nicht möglich'],
    }
  }

  const baseInterpretation: TestInterpretation = {
    level: threshold.level,
    summary: threshold.label,
    details: threshold.description,
    nextSteps: [],
    caveats: ['Dies ist ein Screening-Ergebnis, keine Diagnose'],
  }

  // Level-spezifische Next Steps
  switch (threshold.level) {
    case 'unauffällig':
      baseInterpretation.nextSteps = [
        'Keine weiteren Schritte notwendig',
        'Bei anhaltenden Sorgen: professionelle Beratung',
      ]
      break
    case 'grenzwertig':
      baseInterpretation.nextSteps = [
        'Beobachtung empfohlen',
        'Bei Bedarf: professionelle Abklärung',
        'Weitere Screenings in diesem Bereich durchführen',
      ]
      break
    case 'auffällig':
    case 'deutlich-auffällig':
      baseInterpretation.nextSteps = [
        'Professionelle Diagnostik empfohlen',
        'Termin bei entsprechendem Facharzt/Fachärztin vereinbaren',
        'Ergebnisse mit Arzt/Ärztin besprechen',
      ]
      break
  }

  return baseInterpretation
}

// ============================================
// DCDQ Age-Specific Cutoffs
// ============================================

export function getDCDQCutoff(age: number): { suspect: number; probable: number } {
  // DCDQ'07 altersabhängige Cutoffs
  if (age >= 5 && age <= 7) {
    return { suspect: 46, probable: 35 }
  }
  if (age >= 8 && age <= 9) {
    return { suspect: 55, probable: 45 }
  }
  if (age >= 10 && age <= 15) {
    return { suspect: 57, probable: 47 }
  }
  // Default für außerhalb des Altersbereichs
  return { suspect: 55, probable: 45 }
}
