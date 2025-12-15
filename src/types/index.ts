/**
 * Bloom Now - Typdefinitionen
 *
 * Datenmodell für:
 * - Profile (Kind, Bezugsperson)
 * - Test-Sessions und Ergebnisse
 * - Reports
 */

// ============================================
// Profil-Typen
// ============================================

export interface ChildProfile {
  id: string
  name: string
  birthDate?: string // ISO Date String
  age?: number
  schoolGrade?: string // z.B. "1. Klasse", "Vorschule"
  schoolType?: 'kindergarten' | 'grundschule' | 'weiterführend' | 'sonstiges'
  strengths: string[] // Stärken des Kindes
  concerns: string[] // Hauptsorgen der Eltern
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CaregiverProfile {
  id: string
  name?: string
  role: 'mutter' | 'vater' | 'erziehungsberechtigter' | 'sonstiges'
  roleOther?: string
  email?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// Test & Screening Typen
// ============================================

export type TestCategory = 'adhd' | 'autism' | 'dyspraxia' | 'lrs'

export type TestId =
  // ADHS
  | 'asrs-6q'
  | 'asrs-18q'
  | 'wurs-25'
  | 'vanderbilt-parent'
  | 'vanderbilt-teacher'
  | 'snap-iv'
  // Autismus
  | 'aq-50'
  | 'raads-r'
  | 'assq'
  // Dyspraxie
  | 'dcdq'
  // LRS
  | 'arhq'

export type TestTargetGroup = 'adult' | 'child' | 'parent-about-child' | 'teacher-about-child'

export type InputMode = 'in-app' | 'manual-score' | 'external-link'

export interface TestDefinition {
  id: TestId
  name: string
  fullName: string
  category: TestCategory
  targetGroup: TestTargetGroup
  description: string
  duration: string // z.B. "5-10 Minuten"
  itemCount?: number
  inputMode: InputMode
  /**
   * WICHTIG: Lizenz-Information
   * 'free' = Items dürfen in-app angezeigt werden
   * 'restricted' = Nur externe Links + manuelle Eingabe erlaubt
   * 'unknown' = Vorsichtshalber wie 'restricted' behandeln
   */
  licenseStatus: 'free' | 'restricted' | 'unknown'
  licenseNote?: string
  sourceUrl?: string
  scoringInfo: ScoringInfo
}

export interface ScoringInfo {
  minScore: number
  maxScore: number
  thresholds: ScoringThreshold[]
  subscales?: SubscaleDefinition[]
}

export interface ScoringThreshold {
  min: number
  max: number
  level: 'unauffällig' | 'grenzwertig' | 'auffällig' | 'deutlich-auffällig'
  label: string
  description: string
  color: 'green' | 'yellow' | 'red' | 'neutral'
}

export interface SubscaleDefinition {
  id: string
  name: string
  itemIndices?: number[]
  maxScore: number
}

// ============================================
// Test Items (nur für freie Tests)
// ============================================

export interface TestItem {
  index: number
  text: string
  /** Scoring-Regel: welche Antworten wie gewertet werden */
  scoring: ItemScoring
}

export type ItemScoring =
  | { type: 'likert'; range: [number, number]; reverseScored?: boolean }
  | { type: 'binary'; positiveValue: number }
  | { type: 'custom'; scoringMap: Record<string, number> }

// ============================================
// Test Session & Ergebnisse
// ============================================

export interface TestSession {
  id: string
  testId: TestId
  childProfileId: string
  caregiverProfileId: string
  /** Wer hat ausgefüllt? (bei Fremdbeurteilung) */
  respondentRole?: 'parent' | 'teacher' | 'self'

  /** Bei in-app Tests: einzelne Antworten */
  answers?: TestAnswer[]

  /** Bei manueller Eingabe: direkte Score-Eingabe */
  manualInputs?: ManualTestInput

  /** Berechnete Scores */
  scores: TestScores

  /** Interpretation */
  interpretation: TestInterpretation

  /** Metadaten */
  startedAt: string
  completedAt?: string
  status: 'in-progress' | 'completed' | 'abandoned'
}

export interface TestAnswer {
  itemIndex: number
  value: number | string
  timestamp?: string
}

export interface ManualTestInput {
  totalScore?: number
  subscaleScores?: Record<string, number>
  /** Für Vanderbilt: Symptom-Counts */
  symptomCounts?: {
    inattention?: number
    hyperactivity?: number
    oppositional?: number
    anxiety?: number
  }
  /** Für Vanderbilt: Performance Impairment */
  performanceImpairment?: boolean
  /** Freitext-Notizen */
  notes?: string
}

export interface TestScores {
  total: number
  percentile?: number
  subscales?: Record<string, number>
}

export interface TestInterpretation {
  level: 'unauffällig' | 'grenzwertig' | 'auffällig' | 'deutlich-auffällig'
  summary: string
  details: string
  nextSteps: string[]
  caveats: string[]
}

// ============================================
// Reports
// ============================================

export interface Report {
  id: string
  childProfileId: string
  createdAt: string
  type: 'kurz' | 'detail'
  includedTestSessions: string[] // Session IDs
  summary: string
  pdfBlob?: Blob
}

// ============================================
// App State
// ============================================

export interface OnboardingState {
  step: number
  completedSteps: number[]
  selectedCategories: TestCategory[]
  disclaimerAccepted: boolean
  emergencyInfoShown: boolean
}

export interface AppState {
  // Profile
  childProfile: ChildProfile | null
  caregiverProfile: CaregiverProfile | null

  // Onboarding
  onboarding: OnboardingState
  isOnboardingComplete: boolean

  // Tests
  testSessions: TestSession[]
  currentTestSession: TestSession | null

  // Reports
  reports: Report[]

  // UI State
  isLoading: boolean
  error: string | null
}

// ============================================
// I18n
// ============================================

export type Locale = 'de-DE' | 'en-US'

export interface I18nStrings {
  [key: string]: string | I18nStrings
}
