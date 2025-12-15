/**
 * Stepper Component
 *
 * Progress indicator for multi-step flows (Onboarding, Tests).
 */

interface Step {
  id: number
  label?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  completedSteps?: number[]
  onStepClick?: (step: number) => void
  variant?: 'dots' | 'numbers' | 'progress'
}

export function Stepper({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  variant = 'dots',
}: StepperProps) {
  if (variant === 'progress') {
    const progress = ((currentStep + 1) / steps.length) * 100

    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Schritt {currentStep + 1} von {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id)
        const isCurrent = currentStep === index
        const isClickable = onStepClick && (isCompleted || index <= currentStep)

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isClickable && onStepClick(index)}
            disabled={!isClickable}
            className={`
              flex items-center justify-center
              transition-all duration-200
              ${isClickable ? 'cursor-pointer' : 'cursor-default'}
              ${variant === 'numbers' ? 'w-8 h-8 rounded-full text-sm font-medium' : 'w-2.5 h-2.5 rounded-full'}
              ${
                isCurrent
                  ? variant === 'numbers'
                    ? 'bg-sage-600 text-white'
                    : 'bg-sage-600'
                  : isCompleted
                  ? variant === 'numbers'
                    ? 'bg-sage-200 text-sage-700'
                    : 'bg-sage-300'
                  : variant === 'numbers'
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-gray-300'
              }
            `}
            aria-label={step.label || `Schritt ${index + 1}`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {variant === 'numbers' && (
              isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )
            )}
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// Vertical Stepper (für längere Flows)
// ============================================

interface VerticalStepperProps {
  steps: { id: number; label: string; description?: string }[]
  currentStep: number
  completedSteps?: number[]
  onStepClick?: (step: number) => void
}

export function VerticalStepper({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
}: VerticalStepperProps) {
  return (
    <nav aria-label="Fortschritt" className="space-y-1">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id)
        const isCurrent = currentStep === index
        const isClickable = onStepClick && (isCompleted || index <= currentStep)

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isClickable && onStepClick(index)}
            disabled={!isClickable}
            className={`
              w-full flex items-start gap-4 p-3 rounded-xl text-left
              transition-all duration-150
              ${isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
              ${isCurrent ? 'bg-sage-50' : ''}
            `}
          >
            <div
              className={`
                flex-shrink-0 w-8 h-8 rounded-full
                flex items-center justify-center
                text-sm font-medium
                ${
                  isCompleted
                    ? 'bg-sage-600 text-white'
                    : isCurrent
                    ? 'bg-sage-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <div className="pt-0.5">
              <p
                className={`text-sm font-medium ${
                  isCurrent ? 'text-sage-700' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
              )}
            </div>
          </button>
        )
      })}
    </nav>
  )
}
