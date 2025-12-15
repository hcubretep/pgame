/**
 * Bloom Now - Lokaler Speicher
 *
 * Datenschutz-first: Alle Daten werden lokal im Browser gespeichert.
 * Verwendet IndexedDB (via idb-keyval) mit localStorage als Fallback.
 */

import { get, set, del, keys, clear } from 'idb-keyval'
import type {
  ChildProfile,
  CaregiverProfile,
  TestSession,
  Report,
  OnboardingState,
} from '@/types'

// Storage Keys
const STORAGE_KEYS = {
  CHILD_PROFILE: 'bloom_child_profile',
  CAREGIVER_PROFILE: 'bloom_caregiver_profile',
  TEST_SESSIONS: 'bloom_test_sessions',
  REPORTS: 'bloom_reports',
  ONBOARDING: 'bloom_onboarding',
  SETTINGS: 'bloom_settings',
} as const

// ============================================
// Generische Storage-Funktionen
// ============================================

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await get(key)
    return value ?? null
  } catch {
    // Fallback zu localStorage
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value)
  } catch {
    // Fallback zu localStorage
    localStorage.setItem(key, JSON.stringify(value))
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await del(key)
  } catch {
    localStorage.removeItem(key)
  }
}

// ============================================
// Profile Storage
// ============================================

export async function saveChildProfile(profile: ChildProfile): Promise<void> {
  await setItem(STORAGE_KEYS.CHILD_PROFILE, profile)
}

export async function getChildProfile(): Promise<ChildProfile | null> {
  return getItem<ChildProfile>(STORAGE_KEYS.CHILD_PROFILE)
}

export async function saveCaregiverProfile(profile: CaregiverProfile): Promise<void> {
  await setItem(STORAGE_KEYS.CAREGIVER_PROFILE, profile)
}

export async function getCaregiverProfile(): Promise<CaregiverProfile | null> {
  return getItem<CaregiverProfile>(STORAGE_KEYS.CAREGIVER_PROFILE)
}

// ============================================
// Test Sessions Storage
// ============================================

export async function saveTestSession(session: TestSession): Promise<void> {
  const sessions = await getTestSessions()
  const existingIndex = sessions.findIndex((s) => s.id === session.id)

  if (existingIndex >= 0) {
    sessions[existingIndex] = session
  } else {
    sessions.push(session)
  }

  await setItem(STORAGE_KEYS.TEST_SESSIONS, sessions)
}

export async function getTestSessions(): Promise<TestSession[]> {
  const sessions = await getItem<TestSession[]>(STORAGE_KEYS.TEST_SESSIONS)
  return sessions ?? []
}

export async function getTestSession(id: string): Promise<TestSession | null> {
  const sessions = await getTestSessions()
  return sessions.find((s) => s.id === id) ?? null
}

export async function deleteTestSession(id: string): Promise<void> {
  const sessions = await getTestSessions()
  const filtered = sessions.filter((s) => s.id !== id)
  await setItem(STORAGE_KEYS.TEST_SESSIONS, filtered)
}

// ============================================
// Reports Storage
// ============================================

export async function saveReport(report: Report): Promise<void> {
  const reports = await getReports()
  const existingIndex = reports.findIndex((r) => r.id === report.id)

  if (existingIndex >= 0) {
    reports[existingIndex] = report
  } else {
    reports.push(report)
  }

  await setItem(STORAGE_KEYS.REPORTS, reports)
}

export async function getReports(): Promise<Report[]> {
  const reports = await getItem<Report[]>(STORAGE_KEYS.REPORTS)
  return reports ?? []
}

export async function deleteReport(id: string): Promise<void> {
  const reports = await getReports()
  const filtered = reports.filter((r) => r.id !== id)
  await setItem(STORAGE_KEYS.REPORTS, filtered)
}

// ============================================
// Onboarding Storage
// ============================================

export async function saveOnboardingState(state: OnboardingState): Promise<void> {
  await setItem(STORAGE_KEYS.ONBOARDING, state)
}

export async function getOnboardingState(): Promise<OnboardingState | null> {
  return getItem<OnboardingState>(STORAGE_KEYS.ONBOARDING)
}

// ============================================
// Data Export / Import (für Backup)
// ============================================

export interface ExportedData {
  version: string
  exportedAt: string
  childProfile: ChildProfile | null
  caregiverProfile: CaregiverProfile | null
  testSessions: TestSession[]
  reports: Report[]
  onboarding: OnboardingState | null
}

export async function exportAllData(): Promise<ExportedData> {
  const [childProfile, caregiverProfile, testSessions, reports, onboarding] =
    await Promise.all([
      getChildProfile(),
      getCaregiverProfile(),
      getTestSessions(),
      getReports(),
      getOnboardingState(),
    ])

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    childProfile,
    caregiverProfile,
    testSessions,
    reports,
    onboarding,
  }
}

export async function importData(data: ExportedData): Promise<void> {
  if (data.childProfile) {
    await saveChildProfile(data.childProfile)
  }
  if (data.caregiverProfile) {
    await saveCaregiverProfile(data.caregiverProfile)
  }
  if (data.testSessions) {
    await setItem(STORAGE_KEYS.TEST_SESSIONS, data.testSessions)
  }
  if (data.reports) {
    await setItem(STORAGE_KEYS.REPORTS, data.reports)
  }
  if (data.onboarding) {
    await saveOnboardingState(data.onboarding)
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await clear()
  } catch {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }
}

// ============================================
// Utility: Generate IDs
// ============================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
