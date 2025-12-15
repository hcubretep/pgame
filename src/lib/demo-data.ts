/**
 * Bloom Now - Demo-Daten
 *
 * Diese Daten können für Testzwecke geladen werden.
 * KEINE echten Personendaten enthalten.
 */

import type { ChildProfile, CaregiverProfile, TestSession, OnboardingState } from '@/types'
import { generateId } from '@/lib/storage'

export const DEMO_CHILD_PROFILE: ChildProfile = {
  id: 'demo-child-001',
  name: 'Max',
  age: 8,
  schoolGrade: '3. Klasse',
  schoolType: 'grundschule',
  strengths: ['Kreativ', 'Gutes Gedächtnis', 'Hilfsbereit', 'Begeisterungsfähig'],
  concerns: ['Konzentration', 'Stillsitzen', 'Organisation'],
  notes: 'Demo-Profil für Testzwecke',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

export const DEMO_CAREGIVER_PROFILE: CaregiverProfile = {
  id: 'demo-caregiver-001',
  name: 'Anna',
  role: 'mutter',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

export const DEMO_ONBOARDING: OnboardingState = {
  step: 5,
  completedSteps: [0, 1, 2, 3, 4],
  selectedCategories: ['adhd', 'autism'],
  disclaimerAccepted: true,
  emergencyInfoShown: true,
}

export const DEMO_TEST_SESSIONS: TestSession[] = [
  {
    id: 'demo-session-001',
    testId: 'asrs-6q',
    childProfileId: 'demo-child-001',
    caregiverProfileId: 'demo-caregiver-001',
    respondentRole: 'parent',
    answers: [
      { itemIndex: 0, value: 3 },
      { itemIndex: 1, value: 3 },
      { itemIndex: 2, value: 2 },
      { itemIndex: 3, value: 3 },
      { itemIndex: 4, value: 2 },
      { itemIndex: 5, value: 2 },
    ],
    scores: {
      total: 15,
    },
    interpretation: {
      level: 'grenzwertig',
      summary: 'Mögliche Hinweise auf ADHS-Symptomatik',
      details:
        'Das Ergebnis liegt im grenzwertigen Bereich. Einige der beschriebenen Verhaltensweisen könnten auf ADHS hinweisen.',
      nextSteps: [
        'Gespräch mit Kinderarzt/-ärztin führen',
        'Bei Bedarf: Überweisung zu Facharzt/Fachärztin',
        'Optional: Weitere Screenings durchführen',
      ],
      caveats: [
        'Dieses Screening ist ein erster Hinweis, keine Diagnose',
        'Eine professionelle Abklärung kann Klarheit schaffen',
      ],
    },
    startedAt: '2024-01-15T14:00:00Z',
    completedAt: '2024-01-15T14:10:00Z',
    status: 'completed',
  },
  {
    id: 'demo-session-002',
    testId: 'vanderbilt-parent',
    childProfileId: 'demo-child-001',
    caregiverProfileId: 'demo-caregiver-001',
    respondentRole: 'parent',
    manualInputs: {
      symptomCounts: {
        inattention: 7,
        hyperactivity: 5,
      },
      performanceImpairment: true,
    },
    scores: {
      total: 7,
      subscales: {
        inattention: 7,
        hyperactivity: 5,
      },
    },
    interpretation: {
      level: 'auffällig',
      summary: 'Hinweise auf ADHS (vorwiegend unaufmerksamer Typ)',
      details:
        'Die eingegebenen Werte deuten auf erhöhte Unaufmerksamkeits-Symptome hin, mit Auswirkungen auf die Leistung.',
      nextSteps: [
        'Professionelle Diagnostik empfohlen',
        'Termin bei Kinderarzt/-ärztin oder Kinderpsychiater:in',
        'Auch Teacher-Version ausfüllen lassen',
      ],
      caveats: [
        'Dies ist ein Screening, keine Diagnose',
        'Eine professionelle Einschätzung ist notwendig',
      ],
    },
    startedAt: '2024-01-16T10:00:00Z',
    completedAt: '2024-01-16T10:20:00Z',
    status: 'completed',
  },
]

/**
 * Lädt Demo-Daten in den Store
 * Kann über die Konsole oder einen versteckten Button aufgerufen werden
 */
export async function loadDemoData() {
  const { saveChildProfile, saveCaregiverProfile, saveOnboardingState, saveTestSession } =
    await import('@/lib/storage')

  await saveChildProfile(DEMO_CHILD_PROFILE)
  await saveCaregiverProfile(DEMO_CAREGIVER_PROFILE)
  await saveOnboardingState(DEMO_ONBOARDING)

  for (const session of DEMO_TEST_SESSIONS) {
    await saveTestSession(session)
  }

  console.log('Demo-Daten geladen. Seite neu laden.')
  return true
}

// Expose globally for easy console access during development
if (typeof window !== 'undefined') {
  ;(window as typeof window & { loadDemoData: typeof loadDemoData }).loadDemoData = loadDemoData
}
