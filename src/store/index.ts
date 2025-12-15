/**
 * Bloom Now - Zustand Store
 *
 * Zentraler State Management mit Zustand.
 * Synchronisiert automatisch mit lokalem Storage.
 */

import { create } from 'zustand'
import type {
  ChildProfile,
  CaregiverProfile,
  TestSession,
  Report,
  OnboardingState,
  TestCategory,
  AppState,
} from '@/types'
import {
  saveChildProfile,
  saveCaregiverProfile,
  saveTestSession,
  saveOnboardingState,
  saveReport,
  getChildProfile,
  getCaregiverProfile,
  getTestSessions,
  getReports,
  getOnboardingState,
  generateId,
  deleteTestSession as deleteTestSessionFromStorage,
} from '@/lib/storage'

// ============================================
// Initial State
// ============================================

const initialOnboarding: OnboardingState = {
  step: 0,
  completedSteps: [],
  selectedCategories: [],
  disclaimerAccepted: false,
  emergencyInfoShown: false,
}

const initialState: AppState = {
  childProfile: null,
  caregiverProfile: null,
  onboarding: initialOnboarding,
  isOnboardingComplete: false,
  testSessions: [],
  currentTestSession: null,
  reports: [],
  isLoading: true,
  error: null,
}

// ============================================
// Store Actions Interface
// ============================================

interface AppActions {
  // Initialization
  initializeFromStorage: () => Promise<void>

  // Profile Actions
  setChildProfile: (profile: Partial<ChildProfile>) => Promise<void>
  setCaregiverProfile: (profile: Partial<CaregiverProfile>) => Promise<void>

  // Onboarding Actions
  setOnboardingStep: (step: number) => void
  completeOnboardingStep: (step: number) => void
  setSelectedCategories: (categories: TestCategory[]) => void
  acceptDisclaimer: () => void
  showEmergencyInfo: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void

  // Test Session Actions
  startTestSession: (testId: string, childProfileId: string, caregiverProfileId: string) => TestSession
  updateTestSession: (sessionId: string, updates: Partial<TestSession>) => Promise<void>
  completeTestSession: (sessionId: string, scores: TestSession['scores'], interpretation: TestSession['interpretation']) => Promise<void>
  deleteTestSession: (sessionId: string) => Promise<void>
  setCurrentTestSession: (session: TestSession | null) => void

  // Report Actions
  createReport: (type: 'kurz' | 'detail', testSessionIds: string[]) => Promise<Report>
  deleteReport: (reportId: string) => Promise<void>

  // UI Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// ============================================
// Store Implementation
// ============================================

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,

  // ----------------------------------------
  // Initialization
  // ----------------------------------------
  initializeFromStorage: async () => {
    set({ isLoading: true })
    try {
      const [childProfile, caregiverProfile, testSessions, reports, onboarding] =
        await Promise.all([
          getChildProfile(),
          getCaregiverProfile(),
          getTestSessions(),
          getReports(),
          getOnboardingState(),
        ])

      set({
        childProfile,
        caregiverProfile,
        testSessions,
        reports,
        onboarding: onboarding ?? initialOnboarding,
        isOnboardingComplete: onboarding?.completedSteps.includes(4) ?? false,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: 'Fehler beim Laden der Daten',
        isLoading: false,
      })
    }
  },

  // ----------------------------------------
  // Profile Actions
  // ----------------------------------------
  setChildProfile: async (profileData) => {
    const existingProfile = get().childProfile
    const now = new Date().toISOString()

    const profile: ChildProfile = existingProfile
      ? {
          ...existingProfile,
          ...profileData,
          updatedAt: now,
        }
      : {
          id: generateId(),
          name: '',
          strengths: [],
          concerns: [],
          createdAt: now,
          updatedAt: now,
          ...profileData,
        }

    await saveChildProfile(profile)
    set({ childProfile: profile })
  },

  setCaregiverProfile: async (profileData) => {
    const existingProfile = get().caregiverProfile
    const now = new Date().toISOString()

    const profile: CaregiverProfile = existingProfile
      ? {
          ...existingProfile,
          ...profileData,
          updatedAt: now,
        }
      : {
          id: generateId(),
          role: 'erziehungsberechtigter',
          createdAt: now,
          updatedAt: now,
          ...profileData,
        }

    await saveCaregiverProfile(profile)
    set({ caregiverProfile: profile })
  },

  // ----------------------------------------
  // Onboarding Actions
  // ----------------------------------------
  setOnboardingStep: (step) => {
    const onboarding = { ...get().onboarding, step }
    set({ onboarding })
    saveOnboardingState(onboarding)
  },

  completeOnboardingStep: (step) => {
    const currentOnboarding = get().onboarding
    const completedSteps = currentOnboarding.completedSteps.includes(step)
      ? currentOnboarding.completedSteps
      : [...currentOnboarding.completedSteps, step]

    const onboarding = { ...currentOnboarding, completedSteps }
    set({ onboarding })
    saveOnboardingState(onboarding)
  },

  setSelectedCategories: (categories) => {
    const onboarding = { ...get().onboarding, selectedCategories: categories }
    set({ onboarding })
    saveOnboardingState(onboarding)
  },

  acceptDisclaimer: () => {
    const onboarding = { ...get().onboarding, disclaimerAccepted: true }
    set({ onboarding })
    saveOnboardingState(onboarding)
  },

  showEmergencyInfo: () => {
    const onboarding = { ...get().onboarding, emergencyInfoShown: true }
    set({ onboarding })
    saveOnboardingState(onboarding)
  },

  completeOnboarding: () => {
    set({ isOnboardingComplete: true })
    const onboarding = { ...get().onboarding, completedSteps: [0, 1, 2, 3, 4] }
    saveOnboardingState(onboarding)
  },

  resetOnboarding: () => {
    set({ onboarding: initialOnboarding, isOnboardingComplete: false })
    saveOnboardingState(initialOnboarding)
  },

  // ----------------------------------------
  // Test Session Actions
  // ----------------------------------------
  startTestSession: (testId, childProfileId, caregiverProfileId) => {
    const session: TestSession = {
      id: generateId(),
      testId: testId as TestSession['testId'],
      childProfileId,
      caregiverProfileId,
      answers: [],
      scores: { total: 0 },
      interpretation: {
        level: 'unauffällig',
        summary: '',
        details: '',
        nextSteps: [],
        caveats: [],
      },
      startedAt: new Date().toISOString(),
      status: 'in-progress',
    }

    set({
      currentTestSession: session,
      testSessions: [...get().testSessions, session],
    })

    saveTestSession(session)
    return session
  },

  updateTestSession: async (sessionId, updates) => {
    const sessions = get().testSessions.map((s) =>
      s.id === sessionId ? { ...s, ...updates } : s
    )
    const currentSession = get().currentTestSession

    set({
      testSessions: sessions,
      currentTestSession:
        currentSession?.id === sessionId
          ? { ...currentSession, ...updates }
          : currentSession,
    })

    const updatedSession = sessions.find((s) => s.id === sessionId)
    if (updatedSession) {
      await saveTestSession(updatedSession)
    }
  },

  completeTestSession: async (sessionId, scores, interpretation) => {
    const updates: Partial<TestSession> = {
      scores,
      interpretation,
      completedAt: new Date().toISOString(),
      status: 'completed',
    }

    await get().updateTestSession(sessionId, updates)
    set({ currentTestSession: null })
  },

  deleteTestSession: async (sessionId) => {
    const sessions = get().testSessions.filter((s) => s.id !== sessionId)
    set({ testSessions: sessions })
    await deleteTestSessionFromStorage(sessionId)
  },

  setCurrentTestSession: (session) => {
    set({ currentTestSession: session })
  },

  // ----------------------------------------
  // Report Actions
  // ----------------------------------------
  createReport: async (type, testSessionIds) => {
    const childProfile = get().childProfile
    const sessions = get().testSessions.filter((s) =>
      testSessionIds.includes(s.id)
    )

    const report: Report = {
      id: generateId(),
      childProfileId: childProfile?.id ?? '',
      createdAt: new Date().toISOString(),
      type,
      includedTestSessions: testSessionIds,
      summary: sessions
        .map((s) => `${s.testId}: ${s.interpretation.summary}`)
        .join('\n'),
    }

    await saveReport(report)
    set({ reports: [...get().reports, report] })
    return report
  },

  deleteReport: async (reportId) => {
    const reports = get().reports.filter((r) => r.id !== reportId)
    set({ reports })
  },

  // ----------------------------------------
  // UI Actions
  // ----------------------------------------
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
