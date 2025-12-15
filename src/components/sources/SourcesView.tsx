'use client'

import { getAllTests } from '@/lib/tests'
import { Card, CardHeader, CardContent } from '@/components/ui'

const TARGET_GROUP_LABELS: Record<string, string> = {
  adult: 'Erwachsene (Selbst)',
  child: 'Kinder (Selbst)',
  'parent-about-child': 'Eltern über Kind',
  'teacher-about-child': 'Lehrkraft über Kind',
}

const CATEGORY_LABELS: Record<string, string> = {
  adhd: 'AD(H)S',
  autism: 'Autismus-Spektrum',
  dyspraxia: 'Dyspraxie / DCD',
  lrs: 'LRS',
}

const LICENSE_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Frei verfügbar', color: 'bg-green-100 text-green-800' },
  restricted: { label: 'Eingeschränkt', color: 'bg-amber-100 text-amber-800' },
  unknown: { label: 'Unklar', color: 'bg-gray-100 text-gray-800' },
}

export function SourcesView() {
  const tests = getAllTests()

  // Group by category
  const byCategory = tests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = []
    }
    acc[test.category].push(test)
    return acc
  }, {} as Record<string, typeof tests>)

  return (
    <div className="animate-in">
      <p className="text-gray-600 mb-6">
        Hier findest du Informationen zu allen Screening-Instrumenten, die in Bloom Now verwendet werden können.
      </p>

      {/* Disclaimer */}
      <div className="info-box mb-6">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-sage-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-600">
            <strong>Urheberrecht:</strong> Aus Respekt vor dem Urheberrecht zeigen wir bei eingeschränkt lizenzierten Tests keine Item-Texte in der App an. Stattdessen verlinken wir zu offiziellen Formularen.
          </p>
        </div>
      </div>

      {/* Tests by Category */}
      {Object.entries(byCategory).map(([category, categoryTests]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {CATEGORY_LABELS[category] || category}
          </h3>

          <div className="space-y-4">
            {categoryTests.map((test) => (
              <Card key={test.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-500">{test.fullName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${LICENSE_LABELS[test.licenseStatus].color}`}>
                    {LICENSE_LABELS[test.licenseStatus].label}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{test.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Für wen</p>
                    <p className="font-medium text-gray-900">
                      {TARGET_GROUP_LABELS[test.targetGroup]}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dauer</p>
                    <p className="font-medium text-gray-900">{test.duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Items</p>
                    <p className="font-medium text-gray-900">{test.itemCount || '–'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Scoring</p>
                    <p className="font-medium text-gray-900">
                      {test.scoringInfo.minScore}–{test.scoringInfo.maxScore}
                    </p>
                  </div>
                </div>

                {/* Thresholds */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Schwellenwerte:</p>
                  <div className="flex flex-wrap gap-2">
                    {test.scoringInfo.thresholds.map((threshold, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 text-xs rounded ${
                          threshold.color === 'green'
                            ? 'bg-green-100 text-green-800'
                            : threshold.color === 'yellow'
                            ? 'bg-amber-100 text-amber-800'
                            : threshold.color === 'red'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {threshold.min}–{threshold.max}: {threshold.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* License Note */}
                {test.licenseNote && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600">{test.licenseNote}</p>
                  </div>
                )}

                {/* Source Link */}
                {test.sourceUrl && (
                  <a
                    href={test.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-sage-600 hover:text-sage-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Offizielle Quelle öffnen
                  </a>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* General Sources */}
      <Card className="mt-8">
        <CardHeader title="Allgemeine Informationen" />
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://www.awmf.org/leitlinien"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-600 hover:text-sage-700 underline"
              >
                AWMF Leitlinien (Deutschland)
              </a>
              <span className="text-gray-500"> – Medizinische Leitlinien</span>
            </li>
            <li>
              <a
                href="https://www.adhs-deutschland.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-600 hover:text-sage-700 underline"
              >
                ADHS Deutschland e.V.
              </a>
              <span className="text-gray-500"> – Selbsthilfeorganisation</span>
            </li>
            <li>
              <a
                href="https://www.autismus.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-600 hover:text-sage-700 underline"
              >
                Autismus Deutschland e.V.
              </a>
              <span className="text-gray-500"> – Bundesverband</span>
            </li>
            <li>
              <a
                href="https://www.bvl-legasthenie.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-600 hover:text-sage-700 underline"
              >
                BVL – Legasthenie und Dyskalkulie
              </a>
              <span className="text-gray-500"> – Bundesverband</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
