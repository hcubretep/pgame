/**
 * Bloom Now - Test-Definitionen
 *
 * WICHTIG: Urheberrechts-Hinweise
 * - Tests mit licenseStatus: 'restricted' oder 'unknown' zeigen KEINE Item-Texte in der App
 * - Stattdessen: Links zu offiziellen Formularen + manuelle Score-Eingabe
 * - Nur Tests mit licenseStatus: 'free' und dokumentierter Quelle zeigen Items
 */

import type { TestDefinition, TestId } from '@/types'

export const TEST_DEFINITIONS: Record<TestId, TestDefinition> = {
  // ============================================
  // AD(H)S - Erwachsene
  // ============================================

  'asrs-6q': {
    id: 'asrs-6q',
    name: 'ASRS-6',
    fullName: 'Adult ADHD Self-Report Scale v1.1 - 6-Item Screener',
    category: 'adhd',
    targetGroup: 'adult',
    description:
      'Kurzer Selbstbeurteilungs-Fragebogen für ADHS-Symptome bei Erwachsenen. Entwickelt von der WHO.',
    duration: '2-3 Minuten',
    itemCount: 6,
    /**
     * LIZENZ-STATUS: FREE
     * Der ASRS v1.1 wurde von der WHO entwickelt und ist für nicht-kommerzielle
     * Nutzung frei verfügbar. Die 6 Screening-Items sind öffentlich dokumentiert.
     * Quelle: https://www.hcp.med.harvard.edu/ncs/asrs.php
     */
    inputMode: 'in-app',
    licenseStatus: 'free',
    licenseNote:
      'WHO/Harvard ASRS v1.1 - frei verfügbar für Screening-Zwecke',
    sourceUrl: 'https://www.hcp.med.harvard.edu/ncs/asrs.php',
    scoringInfo: {
      minScore: 0,
      maxScore: 24,
      thresholds: [
        {
          min: 0,
          max: 13,
          level: 'unauffällig',
          label: 'Unauffällig',
          description: 'Keine Hinweise auf erhöhte ADHS-Symptomatik',
          color: 'green',
        },
        {
          min: 14,
          max: 17,
          level: 'grenzwertig',
          label: 'Grenzwertig',
          description: 'Mögliche Hinweise auf ADHS-Symptomatik',
          color: 'yellow',
        },
        {
          min: 18,
          max: 24,
          level: 'auffällig',
          label: 'Auffällig',
          description: 'Deutliche Hinweise auf ADHS-Symptomatik',
          color: 'red',
        },
      ],
    },
  },

  'asrs-18q': {
    id: 'asrs-18q',
    name: 'ASRS-18',
    fullName: 'Adult ADHD Self-Report Scale v1.1 - Full Version',
    category: 'adhd',
    targetGroup: 'adult',
    description:
      'Vollständiger Selbstbeurteilungs-Fragebogen mit 18 Items für detailliertere Einschätzung.',
    duration: '5-10 Minuten',
    itemCount: 18,
    /**
     * LIZENZ-STATUS: RESTRICTED
     * Die vollständige 18-Item-Version erfordert korrekte Nutzung.
     * Zur Sicherheit: externe Verlinkung + manuelle Score-Eingabe.
     */
    inputMode: 'manual-score',
    licenseStatus: 'restricted',
    licenseNote:
      'Vollversion nur über offizielles Formular ausfüllen',
    sourceUrl: 'https://www.hcp.med.harvard.edu/ncs/asrs.php',
    scoringInfo: {
      minScore: 0,
      maxScore: 72,
      thresholds: [
        {
          min: 0,
          max: 23,
          level: 'unauffällig',
          label: 'Unauffällig',
          description: 'Keine Hinweise auf erhöhte ADHS-Symptomatik',
          color: 'green',
        },
        {
          min: 24,
          max: 36,
          level: 'grenzwertig',
          label: 'Grenzwertig',
          description: 'Mögliche Hinweise auf ADHS-Symptomatik',
          color: 'yellow',
        },
        {
          min: 37,
          max: 72,
          level: 'auffällig',
          label: 'Auffällig',
          description: 'Deutliche Hinweise auf ADHS-Symptomatik',
          color: 'red',
        },
      ],
      subscales: [
        { id: 'inattention', name: 'Unaufmerksamkeit', maxScore: 36 },
        { id: 'hyperactivity', name: 'Hyperaktivität/Impulsivität', maxScore: 36 },
      ],
    },
  },

  'wurs-25': {
    id: 'wurs-25',
    name: 'WURS-25',
    fullName: 'Wender Utah Rating Scale - Kurzform',
    category: 'adhd',
    targetGroup: 'adult',
    description:
      'Retrospektive Beurteilung von ADHS-Symptomen in der Kindheit (für Erwachsene).',
    duration: '5-10 Minuten',
    itemCount: 25,
    /**
     * LIZENZ-STATUS: RESTRICTED
     * Deutsche Übersetzung und Items sind nicht eindeutig frei verfügbar.
     * Nur manuelle Score-Eingabe nach externem Ausfüllen.
     */
    inputMode: 'manual-score',
    licenseStatus: 'restricted',
    licenseNote: 'Formular extern ausfüllen, dann Score hier eingeben',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/8285936/',
    scoringInfo: {
      minScore: 0,
      maxScore: 100,
      thresholds: [
        {
          min: 0,
          max: 29,
          level: 'unauffällig',
          label: 'Unauffällig',
          description: 'Keine Hinweise auf ADHS in der Kindheit',
          color: 'green',
        },
        {
          min: 30,
          max: 45,
          level: 'grenzwertig',
          label: 'Grenzwertig',
          description: 'Mögliche Hinweise auf ADHS in der Kindheit',
          color: 'yellow',
        },
        {
          min: 46,
          max: 100,
          level: 'auffällig',
          label: 'Auffällig',
          description: 'Deutliche Hinweise auf ADHS in der Kindheit (Cutoff ≥46)',
          color: 'red',
        },
      ],
    },
  },

  // ============================================
  // AD(H)S - Kinder (Fremdbeurteilung)
  // ============================================

  'vanderbilt-parent': {
    id: 'vanderbilt-parent',
    name: 'Vanderbilt (Eltern)',
    fullName: 'NICHQ Vanderbilt Assessment Scale - Parent',
    category: 'adhd',
    targetGroup: 'parent-about-child',
    description:
      'Eltern-Fragebogen zur Einschätzung von ADHS-Symptomen beim Kind.',
    duration: '10-15 Minuten',
    itemCount: 55,
    /**
     * LIZENZ-STATUS: RESTRICTED
     * NICHQ Vanderbilt ist weit verbreitet, aber Items sind urheberrechtlich geschützt.
     * Flow: Link zu offiziellem PDF + manuelle Eingabe der Symptom-Counts.
     */
    inputMode: 'manual-score',
    licenseStatus: 'restricted',
    licenseNote:
      'Offizielles Formular herunterladen und ausfüllen, dann Symptom-Counts hier eingeben',
    sourceUrl: 'https://www.nichq.org/resource/nichq-vanderbilt-assessment-scales',
    scoringInfo: {
      minScore: 0,
      maxScore: 9,
      thresholds: [
        {
          min: 0,
          max: 5,
          level: 'unauffällig',
          label: 'Kriterien nicht erfüllt',
          description: 'Weniger als 6 Symptome mit Score 2-3',
          color: 'green',
        },
        {
          min: 6,
          max: 9,
          level: 'auffällig',
          label: 'Kriterien möglicherweise erfüllt',
          description: '6+ Symptome mit Score 2-3 UND Performance-Beeinträchtigung',
          color: 'red',
        },
      ],
      subscales: [
        { id: 'inattention', name: 'Unaufmerksamkeit (Fragen 1-9)', maxScore: 9 },
        { id: 'hyperactivity', name: 'Hyperaktivität/Impulsivität (Fragen 10-18)', maxScore: 9 },
        { id: 'oppositional', name: 'Oppositionelles Verhalten', maxScore: 8 },
        { id: 'conduct', name: 'Verhaltensauffälligkeiten', maxScore: 14 },
        { id: 'anxiety', name: 'Angst/Depression', maxScore: 7 },
      ],
    },
  },

  'vanderbilt-teacher': {
    id: 'vanderbilt-teacher',
    name: 'Vanderbilt (Lehrkraft)',
    fullName: 'NICHQ Vanderbilt Assessment Scale - Teacher',
    category: 'adhd',
    targetGroup: 'teacher-about-child',
    description:
      'Lehrkraft-Fragebogen zur Einschätzung von ADHS-Symptomen in der Schule.',
    duration: '10-15 Minuten',
    itemCount: 43,
    inputMode: 'manual-score',
    licenseStatus: 'restricted',
    licenseNote:
      'Offizielles Formular der Lehrkraft geben, dann Symptom-Counts hier eingeben',
    sourceUrl: 'https://www.nichq.org/resource/nichq-vanderbilt-assessment-scales',
    scoringInfo: {
      minScore: 0,
      maxScore: 9,
      thresholds: [
        {
          min: 0,
          max: 5,
          level: 'unauffällig',
          label: 'Kriterien nicht erfüllt',
          description: 'Weniger als 6 Symptome mit Score 2-3',
          color: 'green',
        },
        {
          min: 6,
          max: 9,
          level: 'auffällig',
          label: 'Kriterien möglicherweise erfüllt',
          description: '6+ Symptome mit Score 2-3 UND Performance-Beeinträchtigung',
          color: 'red',
        },
      ],
      subscales: [
        { id: 'inattention', name: 'Unaufmerksamkeit', maxScore: 9 },
        { id: 'hyperactivity', name: 'Hyperaktivität/Impulsivität', maxScore: 9 },
      ],
    },
  },

  'snap-iv': {
    id: 'snap-iv',
    name: 'SNAP-IV',
    fullName: 'Swanson, Nolan, and Pelham Questionnaire - IV',
    category: 'adhd',
    targetGroup: 'parent-about-child',
    description:
      'Rating-Skala für ADHS- und ODD-Symptome bei Kindern.',
    duration: '10 Minuten',
    itemCount: 26,
    inputMode: 'manual-score',
    licenseStatus: 'restricted',
    licenseNote: 'Formular extern ausfüllen, dann Durchschnittswerte eingeben',
    sourceUrl: 'https://www.adhd.net/snap-iv-26.pdf',
    scoringInfo: {
      minScore: 0,
      maxScore: 3,
      thresholds: [
        {
          min: 0,
          max: 1.1,
          level: 'unauffällig',
          label: 'Unauffällig',
          description: 'Durchschnitt unter klinischem Cutoff',
          color: 'green',
        },
        {
          min: 1.2,
          max: 1.7,
          level: 'grenzwertig',
          label: 'Grenzwertig',
          description: 'Durchschnitt im grenzwertigen Bereich',
          color: 'yellow',
        },
        {
          min: 1.8,
          max: 3,
          level: 'auffällig',
          label: 'Auffällig',
          description: 'Durchschnitt im auffälligen Bereich',
          color: 'red',
        },
      ],
      subscales: [
        { id: 'inattention', name: 'Unaufmerksamkeit (Items 1-9)', maxScore: 3 },
        { id: 'hyperactivity', name: 'Hyperaktivität/Impulsivität (Items 10-18)', maxScore: 3 },
        { id: 'odd', name: 'Oppositionelles Verhalten (Items 19-26)', maxScore: 3 },
      ],
    },
  },

  // ============================================
  // Autismus-Spektrum
  // ============================================

  'aq-50': {
    id: 'aq-50',
    name: 'AQ-50',
    fullName: 'Autism Spectrum Quotient (50 Items)',
    category: 'autism',
    targetGroup: 'adult',
    description:
      'Selbstbeurteilungs-Fragebogen für autistische Merkmale bei Erwachsenen.',
    duration: '10-15 Minuten',
    itemCount: 50,
    /**
     * LIZENZ-STATUS: UNKNOWN
     * Der AQ von Baron-Cohen ist wissenschaftlich weit verbreitet.
     * Deutsche Übersetzungen existieren, aber Lizenzstatus nicht eindeutig.
     * Sicherheitshalber: manuelle Score-Eingabe.
     */
    inputMode: 'manual-score',
    licenseStatus: 'unknown',
    licenseNote:
      'Formular extern ausfüllen (z.B. auf aspietests.org), dann Score hier eingeben',
    sourceUrl: 'https://docs.autismresearchcentre.com/tests/AQ_Adult.pdf',
    scoringInfo: {
      minScore: 0,
      maxScore: 50,
      thresholds: [
        {
          min: 0,
          max: 25,
          level: 'unauffällig',
          label: 'Unauffällig',
          description: 'Durchschnittlicher Bereich',
          color: 'green',
        },
        {
          min: 26,
          max: 31,
          level: 'grenzwertig',
          label: 'Erhöhte Traits',
          description: 'Überdurchschnittlich viele autistische Merkmale',
          color: 'yellow',
        },
        {
          min: 32,
          max: 50,
          level: 'auffällig',
          label: 'Auffällig',
          description: 'Klinisch relevante Hinweise (Cutoff ≥32)',
          color: 'red',
        },
      ],
      subscales: [
        { id: 'social-skill', name: 'Soziale Fähigkeiten', maxScore: 10 },
        { id: 'attention-switching', name: 'Aufmerksamkeitswechsel', maxScore: 10 },
        { id: 'attention-detail', name: 'Detailaufmerksamkeit', maxScore: 10 },
        { id: 'communication', name: 'Kommunikation', maxScore: 10 },
        { id: 'imagination', name: 'Vorstellungskraft', maxScore: 10 },
      ],
    },
  },

  'raads-r': {
    id: 'raads-r',
    name: 'RAADS-R',
    fullName: 'Ritvo Autism Asperger Diagnostic Scale - Revised',
    category: 'autism',
    targetGroup: 'adult',
    description:
      'Umfassendes Screening für Autismus-Spektrum bei Erwachsenen.',
    duration: '15-20 Minuten',
    itemCount: 80,
    /**
     * LIZENZ-STATUS: RESTRICTED
     * Der RAADS-R ist urheberrechtlich geschützt.
     * Verweis auf seriöse Online-Versionen + manuelle Score-Eingabe.
     */
    inputMode: 'manual-score',
    licenseStatus: 'restricted',
    licenseNote:
      'Online-Version ausfüllen, dann Gesamtscore hier eingeben',
    sourceUrl: 'https://www.aspietests.org/raads/',
    scoringInfo: {
      minScore: 0,
      maxScore: 240,
      thresholds: [
        {
          min: 0,
          max: 64,
          level: 'unauffällig',
          label: 'Unauffällig',
          description: 'Keine Hinweise auf Autismus',
          color: 'green',
        },
        {
          min: 65,
          max: 89,
          level: 'grenzwertig',
          label: 'Grenzwertig',
          description: 'Einige autistische Merkmale (Cutoff ≥65)',
          color: 'yellow',
        },
        {
          min: 90,
          max: 240,
          level: 'auffällig',
          label: 'Auffällig',
          description: 'Deutliche Hinweise auf Autismus',
          color: 'red',
        },
      ],
      subscales: [
        { id: 'language', name: 'Sprache', maxScore: 21 },
        { id: 'social', name: 'Soziale Bezogenheit', maxScore: 78 },
        { id: 'sensory', name: 'Sensorik/Motorik', maxScore: 39 },
        { id: 'interests', name: 'Umschriebene Interessen', maxScore: 102 },
      ],
    },
  },

  'assq': {
    id: 'assq',
    name: 'ASSQ',
    fullName: 'Autism Spectrum Screening Questionnaire',
    category: 'autism',
    targetGroup: 'parent-about-child',
    description:
      'Eltern-/Lehrkraft-Fragebogen für Autismus-Screening bei Kindern.',
    duration: '5-10 Minuten',
    itemCount: 27,
    /**
     * LIZENZ-STATUS: UNKNOWN
     * Der ASSQ ist wissenschaftlich publiziert, aber Lizenzstatus unklar.
     * Sicherheitshalber: Link + manuelle Summe.
     */
    inputMode: 'manual-score',
    licenseStatus: 'unknown',
    licenseNote: 'Formular extern ausfüllen, dann Summe hier eingeben',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/10210299/',
    scoringInfo: {
      minScore: 0,
      maxScore: 54,
      thresholds: [
        {
          min: 0,
          max: 14,
          level: 'unauffällig',
          label: 'Unauffällig',
          description: 'Keine Hinweise auf Autismus-Spektrum',
          color: 'green',
        },
        {
          min: 15,
          max: 18,
          level: 'grenzwertig',
          label: 'Grenzwertig',
          description: 'Erhöhter Wert, weitere Abklärung empfohlen',
          color: 'yellow',
        },
        {
          min: 19,
          max: 54,
          level: 'auffällig',
          label: 'Auffällig',
          description: 'Deutliche Hinweise, professionelle Diagnostik empfohlen',
          color: 'red',
        },
      ],
    },
  },

  // ============================================
  // Dyspraxie / DCD
  // ============================================

  'dcdq': {
    id: 'dcdq',
    name: 'DCDQ\'07',
    fullName: 'Developmental Coordination Disorder Questionnaire',
    category: 'dyspraxia',
    targetGroup: 'parent-about-child',
    description:
      'Eltern-Fragebogen für motorische Koordinationsstörungen.',
    duration: '10-15 Minuten',
    itemCount: 15,
    /**
     * LIZENZ-STATUS: RESTRICTED
     * DCDQ erfordert offizielle Nutzung.
     * Altersabhängige Cutoffs werden implementiert.
     */
    inputMode: 'manual-score',
    licenseStatus: 'restricted',
    licenseNote:
      'Offizielles Formular ausfüllen, dann Gesamtscore hier eingeben',
    sourceUrl: 'https://dcdq.ca/',
    scoringInfo: {
      minScore: 15,
      maxScore: 75,
      thresholds: [
        // Cutoffs altersabhängig - hier vereinfacht für 5-7 Jahre
        {
          min: 47,
          max: 75,
          level: 'unauffällig',
          label: 'Unauffällig',
          description: 'Motorik im Normalbereich',
          color: 'green',
        },
        {
          min: 35,
          max: 46,
          level: 'grenzwertig',
          label: 'Grenzwertig',
          description: 'Mögliche DCD, weitere Abklärung empfohlen',
          color: 'yellow',
        },
        {
          min: 15,
          max: 34,
          level: 'auffällig',
          label: 'Auffällig',
          description: 'Hinweise auf DCD (Cutoff altersabhängig)',
          color: 'red',
        },
      ],
      subscales: [
        { id: 'control-movement', name: 'Kontrolle bei Bewegung', maxScore: 30 },
        { id: 'fine-motor', name: 'Feinmotorik/Schreiben', maxScore: 20 },
        { id: 'coordination', name: 'Allgemeine Koordination', maxScore: 25 },
      ],
    },
  },

  // ============================================
  // LRS
  // ============================================

  'arhq': {
    id: 'arhq',
    name: 'ARHQ',
    fullName: 'Adult Reading History Questionnaire',
    category: 'lrs',
    targetGroup: 'adult',
    description:
      'Retrospektiver Fragebogen zu Lese-/Schreibschwierigkeiten.',
    duration: '10 Minuten',
    itemCount: 23,
    /**
     * LIZENZ-STATUS: UNKNOWN
     * Lizenzstatus unklar - manuelle Score-Eingabe.
     */
    inputMode: 'manual-score',
    licenseStatus: 'unknown',
    licenseNote: 'Formular extern ausfüllen, dann Score hier eingeben',
    sourceUrl: 'https://dyslexiaida.org/',
    scoringInfo: {
      minScore: 0,
      maxScore: 1,
      thresholds: [
        {
          min: 0,
          max: 0.3,
          level: 'unauffällig',
          label: 'Unauffällig',
          description: 'Keine Hinweise auf LRS-Hintergrund',
          color: 'green',
        },
        {
          min: 0.31,
          max: 0.43,
          level: 'grenzwertig',
          label: 'Grenzwertig',
          description: 'Einige Hinweise, weitere Abklärung sinnvoll',
          color: 'yellow',
        },
        {
          min: 0.44,
          max: 1,
          level: 'auffällig',
          label: 'Auffällig',
          description: 'Deutliche Hinweise auf LRS-Hintergrund',
          color: 'red',
        },
      ],
    },
  },
}

// ============================================
// Helper Functions
// ============================================

export function getTestsByCategory(category: string): TestDefinition[] {
  return Object.values(TEST_DEFINITIONS).filter(
    (test) => test.category === category
  )
}

export function getTestDefinition(testId: TestId): TestDefinition | undefined {
  return TEST_DEFINITIONS[testId]
}

export function getAllTests(): TestDefinition[] {
  return Object.values(TEST_DEFINITIONS)
}

export function getTestsForTargetGroup(targetGroup: string): TestDefinition[] {
  return Object.values(TEST_DEFINITIONS).filter(
    (test) => test.targetGroup === targetGroup
  )
}
