/**
 * Bloom Now - Deutsche Übersetzungen
 *
 * Struktur so aufgebaut, dass später weitere Sprachen einfach ergänzt werden können.
 */

export const de = {
  // ============================================
  // App-weite Texte
  // ============================================
  app: {
    name: 'Bloom Now',
    tagline: 'Orientierung für Familien mit neurodivergenten Kindern',
    version: '1.0.0',
  },

  // ============================================
  // Navigation
  // ============================================
  nav: {
    home: 'Start',
    dashboard: 'Übersicht',
    tests: 'Screenings',
    results: 'Ergebnisse',
    reports: 'Berichte',
    sources: 'Quellen & Formulare',
    settings: 'Einstellungen',
    help: 'Hilfe',
  },

  // ============================================
  // Onboarding
  // ============================================
  onboarding: {
    welcome: {
      title: 'Willkommen bei Bloom Now',
      subtitle: 'Orientierung und Unterstützung für Familien',
      description:
        'Diese App hilft dir, mögliche Muster bei deinem Kind zu erkennen und strukturierte nächste Schritte zu planen.',
      startButton: 'Los geht\'s',
    },

    disclaimer: {
      title: 'Wichtige Hinweise',
      subtitle: 'Bitte lies diese Informationen sorgfältig',

      notDiagnosis: {
        title: 'Screening ≠ Diagnose',
        text: 'Diese App ersetzt keine ärztliche oder psychologische Diagnose. Die Ergebnisse zeigen lediglich Hinweise, die eine professionelle Abklärung sinnvoll machen könnten.',
      },

      dataPrivacy: {
        title: 'Deine Daten bleiben bei dir',
        text: 'Alle Informationen werden ausschließlich lokal auf deinem Gerät gespeichert. Es werden keine Daten an Server übertragen.',
      },

      emergency: {
        title: 'Bei akuter Belastung',
        text: 'Falls du oder dein Kind akut belastet seid, wende dich bitte an professionelle Hilfe:',
        numbers: [
          { label: 'Notruf', number: '112' },
          { label: 'Telefonseelsorge', number: '0800 111 0 111' },
          { label: 'Kinder- und Jugendtelefon', number: '0800 111 0 333' },
        ],
      },

      acceptButton: 'Ich habe verstanden',
    },

    profile: {
      title: 'Über dein Kind',
      subtitle: 'Diese Informationen helfen uns, passende Screenings vorzuschlagen',

      childName: 'Name oder Spitzname',
      childNamePlaceholder: 'Wie möchtest du dein Kind nennen?',

      birthDate: 'Geburtsdatum (optional)',
      age: 'Alter',
      agePlaceholder: 'Jahre',

      schoolGrade: 'Klasse / Betreuungsform',
      schoolGradePlaceholder: 'z.B. 2. Klasse, Vorschule',

      schoolType: 'Art der Einrichtung',
      schoolTypes: {
        kindergarten: 'Kindergarten / Kita',
        grundschule: 'Grundschule',
        weiterfuehrend: 'Weiterführende Schule',
        sonstiges: 'Sonstiges',
      },

      strengths: 'Stärken deines Kindes',
      strengthsPlaceholder: 'Was kann dein Kind besonders gut?',
      strengthsHint: 'z.B. kreativ, hilfsbereit, gutes Gedächtnis...',

      concerns: 'Deine Hauptsorgen',
      concernsPlaceholder: 'Was beschäftigt dich?',
      concernsHint: 'z.B. Konzentration, soziale Situationen, Lesen...',
    },

    caregiver: {
      title: 'Über dich',
      subtitle: 'Wer bist du für das Kind?',

      role: 'Deine Rolle',
      roles: {
        mutter: 'Mutter',
        vater: 'Vater',
        erziehungsberechtigter: 'Erziehungsberechtigte/r',
        sonstiges: 'Sonstige Bezugsperson',
      },

      name: 'Dein Name (optional)',
      namePlaceholder: 'Für die Berichte',
    },

    categories: {
      title: 'Welche Bereiche interessieren dich?',
      subtitle: 'Du kannst mehrere auswählen oder später ändern',

      adhd: {
        title: 'AD(H)S',
        description: 'Aufmerksamkeit, Konzentration, Impulsivität',
      },
      autism: {
        title: 'Autismus-Spektrum',
        description: 'Soziale Interaktion, Kommunikation, Interessen',
      },
      dyspraxia: {
        title: 'Dyspraxie / DCD',
        description: 'Motorische Koordination, Bewegungsplanung',
      },
      lrs: {
        title: 'LRS',
        description: 'Lesen, Schreiben, Rechtschreibung',
      },

      hint: 'Du kannst jederzeit weitere Bereiche hinzufügen.',
    },

    complete: {
      title: 'Alles bereit!',
      subtitle: 'Du kannst jetzt mit den Screenings beginnen',
      startButton: 'Zur Übersicht',
    },
  },

  // ============================================
  // Dashboard
  // ============================================
  dashboard: {
    greeting: 'Hallo',
    today: 'Heute',

    tiles: {
      screening: {
        title: 'Screening starten',
        description: 'Neues Screening durchführen',
      },
      results: {
        title: 'Ergebnisse',
        description: 'Bisherige Screening-Ergebnisse ansehen',
      },
      nextSteps: {
        title: 'Nächste Schritte',
        description: 'Empfohlene Maßnahmen',
      },
      reports: {
        title: 'Berichte',
        description: 'PDF-Berichte erstellen und exportieren',
      },
    },

    progress: {
      title: 'Dein Fortschritt',
      completed: 'abgeschlossen',
      pending: 'offen',
    },

    quickActions: {
      newScreening: 'Neues Screening',
      exportPdf: 'PDF erstellen',
    },
  },

  // ============================================
  // Tests / Screenings
  // ============================================
  tests: {
    selectTitle: 'Screening auswählen',
    selectSubtitle: 'Wähle ein Screening aus den von dir markierten Bereichen',

    info: {
      duration: 'Dauer',
      targetGroup: 'Für wen',
      itemCount: 'Fragen',
      whatIs: 'Was ist das?',
      howLong: 'Wie lange dauert es?',
      forWhom: 'Für wen ist es geeignet?',
    },

    targetGroups: {
      adult: 'Erwachsene (Selbsteinschätzung)',
      child: 'Kinder (Selbsteinschätzung)',
      'parent-about-child': 'Eltern (über ihr Kind)',
      'teacher-about-child': 'Lehrkraft (über ein Kind)',
    },

    startButton: 'Screening starten',
    continueButton: 'Fortsetzen',

    // Input-Modi
    inputModes: {
      inApp: 'In der App ausfüllen',
      manualScore: 'Ergebnis manuell eingeben',
      externalLink: 'Formular extern öffnen',
    },

    // Lizenz-Hinweise
    licenseNotice: {
      restricted:
        'Aus urheberrechtlichen Gründen können die Fragen dieses Tests nicht in der App angezeigt werden.',
      external: 'Offizielles Formular öffnen',
      manual: 'Nach dem Ausfüllen: Ergebnis hier eingeben',
    },

    // Likert-Skalen
    likert: {
      never: 'Nie',
      rarely: 'Selten',
      sometimes: 'Manchmal',
      often: 'Oft',
      veryOften: 'Sehr oft',
    },

    // Binary
    binary: {
      yes: 'Ja',
      no: 'Nein',
      agree: 'Stimme zu',
      disagree: 'Stimme nicht zu',
    },

    // Progress
    progress: {
      question: 'Frage',
      of: 'von',
    },

    // Completion
    complete: {
      title: 'Screening abgeschlossen',
      calculating: 'Ergebnis wird berechnet...',
      viewResults: 'Ergebnis ansehen',
    },
  },

  // ============================================
  // Ergebnisse
  // ============================================
  results: {
    title: 'Ergebnisse',
    subtitle: 'Übersicht deiner Screening-Ergebnisse',

    score: 'Punktzahl',
    interpretation: 'Einschätzung',
    confidence: 'Hinweis zur Aussagekraft',
    practical: 'Was bedeutet das praktisch?',
    nextSteps: 'Empfohlene nächste Schritte',

    levels: {
      unauffaellig: 'Unauffällig',
      grenzwertig: 'Grenzwertig',
      auffaellig: 'Auffällig',
      'deutlich-auffaellig': 'Deutlich auffällig',
    },

    noResults: 'Noch keine Ergebnisse vorhanden.',
    startScreening: 'Erstes Screening starten',

    disclaimer:
      'Diese Ergebnisse sind keine Diagnose. Sie zeigen Hinweise, die eine professionelle Abklärung sinnvoll machen könnten.',

    showSource: 'Quelle anzeigen',
    exportPdf: 'Als PDF exportieren',
  },

  // ============================================
  // Reports
  // ============================================
  reports: {
    title: 'Berichte',
    subtitle: 'Erstelle PDF-Berichte zum Teilen',

    create: {
      title: 'Neuen Bericht erstellen',
      selectTests: 'Welche Screenings sollen enthalten sein?',
      type: 'Berichtsart',
      types: {
        kurz: {
          title: 'Kurzbericht',
          description: '1 Seite mit den wichtigsten Informationen',
        },
        detail: {
          title: 'Detailbericht',
          description: '3 Seiten mit ausführlichen Ergebnissen und Quellen',
        },
      },
      generateButton: 'Bericht erstellen',
    },

    list: {
      empty: 'Noch keine Berichte erstellt.',
      download: 'Herunterladen',
      share: 'Teilen',
      delete: 'Löschen',
    },
  },

  // ============================================
  // Quellen
  // ============================================
  sources: {
    title: 'Quellen & Formulare',
    subtitle: 'Informationen zu den verwendeten Screening-Instrumenten',

    columns: {
      name: 'Name',
      purpose: 'Zweck',
      respondent: 'Wer füllt aus?',
      links: 'Links',
      license: 'Lizenz',
    },
  },

  // ============================================
  // Gemeinsame UI-Elemente
  // ============================================
  common: {
    back: 'Zurück',
    next: 'Weiter',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    loading: 'Wird geladen...',
    error: 'Ein Fehler ist aufgetreten',
    retry: 'Erneut versuchen',
    optional: '(optional)',
    required: 'Pflichtfeld',
  },

  // ============================================
  // Fehler
  // ============================================
  errors: {
    generic: 'Ein unerwarteter Fehler ist aufgetreten.',
    storage: 'Fehler beim Speichern der Daten.',
    load: 'Fehler beim Laden der Daten.',
    pdf: 'Fehler beim Erstellen des PDFs.',
  },
}

export type Translations = typeof de
