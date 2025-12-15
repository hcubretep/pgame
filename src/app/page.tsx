'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { Onboarding } from '@/components/onboarding/Onboarding'
import { Dashboard } from '@/components/dashboard/Dashboard'

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)
  const {
    isLoading,
    isOnboardingComplete,
    initializeFromStorage,
  } = useAppStore()

  useEffect(() => {
    setIsMounted(true)
    initializeFromStorage()
  }, [initializeFromStorage])

  // Verhindere Hydration-Fehler
  if (!isMounted) {
    return (
      <div className="page-wrapper">
        <div className="flex items-center justify-center flex-1">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div className="flex items-center justify-center flex-1">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  // Zeige Onboarding oder Dashboard
  if (!isOnboardingComplete) {
    return <Onboarding />
  }

  return <Dashboard />
}

function LoadingSpinner() {
  return (
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sage-200 border-t-sage-600" />
      <p className="mt-4 text-gray-500">Wird geladen...</p>
    </div>
  )
}
