'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { Button, Stepper } from '@/components/ui'
import { WelcomeStep } from './steps/WelcomeStep'
import { DisclaimerStep } from './steps/DisclaimerStep'
import { ChildProfileStep } from './steps/ChildProfileStep'
import { CaregiverStep } from './steps/CaregiverStep'
import { CategoriesStep } from './steps/CategoriesStep'
import { CompleteStep } from './steps/CompleteStep'

const STEPS = [
  { id: 0, label: 'Willkommen' },
  { id: 1, label: 'Hinweise' },
  { id: 2, label: 'Kind' },
  { id: 3, label: 'Du' },
  { id: 4, label: 'Bereiche' },
  { id: 5, label: 'Fertig' },
]

export function Onboarding() {
  const {
    onboarding,
    setOnboardingStep,
    completeOnboardingStep,
    completeOnboarding,
  } = useAppStore()

  const [currentStep, setCurrentStep] = useState(onboarding.step)

  const goToNextStep = () => {
    completeOnboardingStep(currentStep)
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      setOnboardingStep(nextStep)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      setOnboardingStep(prevStep)
    }
  }

  const handleComplete = () => {
    completeOnboarding()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={goToNextStep} />
      case 1:
        return <DisclaimerStep onNext={goToNextStep} onBack={goToPrevStep} />
      case 2:
        return <ChildProfileStep onNext={goToNextStep} onBack={goToPrevStep} />
      case 3:
        return <CaregiverStep onNext={goToNextStep} onBack={goToPrevStep} />
      case 4:
        return <CategoriesStep onNext={goToNextStep} onBack={goToPrevStep} />
      case 5:
        return <CompleteStep onComplete={handleComplete} onBack={goToPrevStep} />
      default:
        return null
    }
  }

  return (
    <div className="page-wrapper">
      {/* Header mit Stepper */}
      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <div className="sticky-header px-4 pb-4">
          <div className="container-app">
            <Stepper
              steps={STEPS.slice(1, -1)}
              currentStep={currentStep - 1}
              completedSteps={onboarding.completedSteps.filter((s) => s > 0 && s < STEPS.length - 1).map((s) => s - 1)}
              variant="dots"
            />
          </div>
        </div>
      )}

      {/* Hauptinhalt */}
      <div className="page-content">
        <div className="container-app py-6">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
