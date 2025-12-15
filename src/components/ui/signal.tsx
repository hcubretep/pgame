/**
 * Signal / Ampel Component
 *
 * Ruhige, nicht alarmistische Visualisierung von Ergebnissen.
 */

type SignalLevel = 'unauffällig' | 'grenzwertig' | 'auffällig' | 'deutlich-auffällig' | 'neutral'

interface SignalIndicatorProps {
  level: SignalLevel
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  customLabel?: string
}

const levelConfig: Record<SignalLevel, { color: string; bgColor: string; label: string }> = {
  'unauffällig': {
    color: 'text-signal-green',
    bgColor: 'bg-signal-green',
    label: 'Unauffällig',
  },
  'grenzwertig': {
    color: 'text-signal-yellow',
    bgColor: 'bg-signal-yellow',
    label: 'Grenzwertig',
  },
  'auffällig': {
    color: 'text-signal-yellow',
    bgColor: 'bg-signal-yellow',
    label: 'Auffällig',
  },
  'deutlich-auffällig': {
    color: 'text-signal-red',
    bgColor: 'bg-signal-red',
    label: 'Deutlich auffällig',
  },
  'neutral': {
    color: 'text-signal-neutral',
    bgColor: 'bg-signal-neutral',
    label: 'Keine Einschätzung',
  },
}

const sizeConfig: Record<NonNullable<SignalIndicatorProps['size']>, { dot: string; text: string }> = {
  sm: { dot: 'w-2 h-2', text: 'text-sm' },
  md: { dot: 'w-3 h-3', text: 'text-base' },
  lg: { dot: 'w-4 h-4', text: 'text-lg' },
}

export function SignalIndicator({
  level,
  size = 'md',
  showLabel = true,
  customLabel,
}: SignalIndicatorProps) {
  const config = levelConfig[level]
  const sizeStyle = sizeConfig[size]

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`${sizeStyle.dot} ${config.bgColor} rounded-full`}
        aria-hidden="true"
      />
      {showLabel && (
        <span className={`${sizeStyle.text} ${config.color} font-medium`}>
          {customLabel || config.label}
        </span>
      )}
    </div>
  )
}

// ============================================
// Signal Bar (für Score-Visualisierung)
// ============================================

interface SignalBarProps {
  score: number
  maxScore: number
  thresholds?: { min: number; max: number; level: SignalLevel }[]
  showScore?: boolean
  height?: 'sm' | 'md' | 'lg'
}

export function SignalBar({
  score,
  maxScore,
  thresholds,
  showScore = true,
  height = 'md',
}: SignalBarProps) {
  const percentage = Math.min((score / maxScore) * 100, 100)

  // Bestimme die Farbe basierend auf Schwellenwerten
  let barColor = 'bg-signal-neutral'
  if (thresholds) {
    for (const threshold of thresholds) {
      if (score >= threshold.min && score <= threshold.max) {
        barColor = levelConfig[threshold.level].bgColor
        break
      }
    }
  }

  const heightStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightStyles[height]}`}>
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showScore && (
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>{score}</span>
          <span>von {maxScore}</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// Result Card mit Signal
// ============================================

interface ResultCardProps {
  title: string
  score: number
  maxScore: number
  level: SignalLevel
  summary: string
  details?: string
  className?: string
}

export function ResultCard({
  title,
  score,
  maxScore,
  level,
  summary,
  details,
  className = '',
}: ResultCardProps) {
  const config = levelConfig[level]

  return (
    <div className={`bg-white rounded-2xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <SignalIndicator level={level} size="sm" />
      </div>

      <div className="mb-4">
        <SignalBar
          score={score}
          maxScore={maxScore}
          thresholds={[
            { min: 0, max: maxScore * 0.4, level: 'unauffällig' },
            { min: maxScore * 0.4, max: maxScore * 0.7, level: 'grenzwertig' },
            { min: maxScore * 0.7, max: maxScore, level: 'auffällig' },
          ]}
        />
      </div>

      <p className="text-gray-700 mb-2">{summary}</p>

      {details && (
        <p className="text-sm text-gray-500">{details}</p>
      )}

      {/* Disclaimer immer sichtbar */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">
          Dies ist ein Screening-Ergebnis, keine Diagnose.
        </p>
      </div>
    </div>
  )
}

// ============================================
// Ampel-Legende
// ============================================

export function SignalLegend() {
  const levels: SignalLevel[] = ['unauffällig', 'grenzwertig', 'auffällig', 'deutlich-auffällig']

  return (
    <div className="flex flex-wrap gap-4">
      {levels.map((level) => (
        <SignalIndicator key={level} level={level} size="sm" />
      ))}
    </div>
  )
}
