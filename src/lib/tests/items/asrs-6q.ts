/**
 * ASRS v1.1 - 6-Item Screener
 *
 * LIZENZ: FREE
 * Der ASRS v1.1 wurde von der World Health Organization (WHO) in Zusammenarbeit
 * mit dem Composite International Diagnostic Interview entwickelt.
 *
 * Die 6 Screening-Items sind öffentlich dokumentiert und frei verfügbar unter:
 * https://www.hcp.med.harvard.edu/ncs/asrs.php
 *
 * Referenz:
 * Kessler RC, et al. (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS):
 * a short screening scale for use in the general population. Psychological Medicine, 35(2), 245-256.
 *
 * SCORING (Likert 0-4):
 * 0 = Nie
 * 1 = Selten
 * 2 = Manchmal
 * 3 = Oft
 * 4 = Sehr oft
 *
 * Cutoff: ≥14 (Summe aller Items)
 */

import type { TestItem } from '@/types'

export const ASRS_6Q_ITEMS: TestItem[] = [
  {
    index: 0,
    text: 'Wie oft haben Sie Schwierigkeiten, die letzten Einzelheiten eines Projekts zu erledigen, nachdem die eigentlich schwierigen Teile schon abgeschlossen sind?',
    scoring: { type: 'likert', range: [0, 4] },
  },
  {
    index: 1,
    text: 'Wie oft haben Sie Schwierigkeiten, Dinge in die richtige Reihenfolge zu bringen, wenn Sie eine Aufgabe erledigen müssen, die Organisation erfordert?',
    scoring: { type: 'likert', range: [0, 4] },
  },
  {
    index: 2,
    text: 'Wie oft haben Sie Probleme, sich an Termine oder Verpflichtungen zu erinnern?',
    scoring: { type: 'likert', range: [0, 4] },
  },
  {
    index: 3,
    text: 'Wenn Sie eine Aufgabe vor sich haben, die viel Nachdenken erfordert, wie oft vermeiden oder verzögern Sie den Anfang?',
    scoring: { type: 'likert', range: [0, 4] },
  },
  {
    index: 4,
    text: 'Wie oft zappeln Sie mit Händen oder Füßen herum oder rutschen auf dem Stuhl, wenn Sie längere Zeit sitzen müssen?',
    scoring: { type: 'likert', range: [0, 4] },
  },
  {
    index: 5,
    text: 'Wie oft fühlen Sie sich übermäßig aktiv und gezwungen, Dinge zu tun, als würden Sie von einem Motor angetrieben?',
    scoring: { type: 'likert', range: [0, 4] },
  },
]

export const ASRS_6Q_LIKERT_OPTIONS = [
  { value: 0, label: 'Nie' },
  { value: 1, label: 'Selten' },
  { value: 2, label: 'Manchmal' },
  { value: 3, label: 'Oft' },
  { value: 4, label: 'Sehr oft' },
]

/**
 * Berechnet den ASRS-6Q Score
 */
export function calculateASRS6QScore(answers: number[]): number {
  if (answers.length !== 6) {
    throw new Error('ASRS-6Q erfordert genau 6 Antworten')
  }
  return answers.reduce((sum, val) => sum + val, 0)
}

/**
 * Interpretiert den ASRS-6Q Score
 */
export function interpretASRS6QScore(score: number): {
  level: 'unauffällig' | 'grenzwertig' | 'auffällig'
  summary: string
  details: string
  nextSteps: string[]
  caveats: string[]
} {
  if (score < 14) {
    return {
      level: 'unauffällig',
      summary: 'Keine erhöhten Hinweise auf ADHS-Symptomatik',
      details:
        'Dein Ergebnis liegt im unauffälligen Bereich. Die Symptome, die du beschrieben hast, fallen nicht über das übliche Maß hinaus.',
      nextSteps: [
        'Keine weiteren Schritte notwendig',
        'Bei anhaltenden Sorgen: Gespräch mit Hausarzt/Hausärztin',
      ],
      caveats: [
        'Dieses Screening ersetzt keine professionelle Diagnose',
        'Einzelne Symptome können auch andere Ursachen haben',
      ],
    }
  }

  if (score < 18) {
    return {
      level: 'grenzwertig',
      summary: 'Mögliche Hinweise auf ADHS-Symptomatik',
      details:
        'Dein Ergebnis liegt im grenzwertigen Bereich. Einige der beschriebenen Verhaltensweisen könnten auf ADHS hinweisen.',
      nextSteps: [
        'Gespräch mit Hausarzt/Hausärztin führen',
        'Bei Bedarf: Überweisung zu Facharzt/Fachärztin für Psychiatrie',
        'Optional: Vollständigen ASRS-18 oder andere Screenings durchführen',
      ],
      caveats: [
        'Dieses Screening ist ein erster Hinweis, keine Diagnose',
        'Eine professionelle Abklärung kann Klarheit schaffen',
        'Symptome können auch andere Ursachen haben (Stress, Schlafmangel, etc.)',
      ],
    }
  }

  return {
    level: 'auffällig',
    summary: 'Deutliche Hinweise auf ADHS-Symptomatik',
    details:
      'Dein Ergebnis liegt im auffälligen Bereich. Die beschriebenen Verhaltensweisen deuten auf eine mögliche ADHS hin.',
    nextSteps: [
      'Professionelle Abklärung bei Facharzt/Fachärztin empfohlen',
      'Hausarzt/Hausärztin um Überweisung bitten',
      'Termin bei Psychiater:in oder ADHS-Ambulanz vereinbaren',
    ],
    caveats: [
      'Ein hoher Screening-Wert bedeutet nicht automatisch ADHS',
      'Nur eine professionelle Diagnostik kann eine Diagnose stellen',
      'Es gibt viele Menschen mit ADHS, die ein erfülltes Leben führen',
    ],
  }
}
