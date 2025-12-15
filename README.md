# Bloom Now

**Orientierung für Familien mit neurodivergenten Kindern**

Eine mobile-first Progressive Web App (PWA), die Eltern hilft, mögliche Hinweise auf Neurodivergenz bei ihren Kindern zu erkennen und strukturierte nächste Schritte zu planen.

## ⚠️ Wichtiger Hinweis

**Screening ≠ Diagnose**

Diese App ersetzt keine ärztliche oder psychologische Diagnose. Die Ergebnisse zeigen lediglich Hinweise, die eine professionelle Abklärung sinnvoll machen könnten.

## Features

- **Onboarding**: Schritt-für-Schritt Einführung mit Disclaimer und Profilerstellung
- **Screenings**: Validierte Screening-Instrumente für ADHS, Autismus, Dyspraxie, LRS
- **Ergebnisse**: Verständliche Interpretation mit Ampel-Visualisierung
- **PDF-Export**: Kurz- und Detailberichte zum Teilen mit Ärzt:innen
- **Datenschutz**: Alle Daten lokal gespeichert (IndexedDB)
- **PWA**: Installierbar, offline-fähig

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + Custom Components (shadcn-style)
- **State**: Zustand
- **Storage**: IndexedDB (via idb-keyval)
- **PDF**: pdf-lib (client-side)
- **i18n**: Vorbereitet für mehrere Sprachen (aktuell de-DE)

## Installation

```bash
# Repository klonen
git clone <repo-url>
cd bloom-now

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App ist dann unter `http://localhost:3000` erreichbar.

## Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root Layout
│   ├── page.tsx           # Hauptseite
│   └── globals.css        # Globale Styles
├── components/
│   ├── ui/                # Basis-UI-Komponenten
│   ├── onboarding/        # Onboarding-Flow
│   ├── dashboard/         # Dashboard
│   ├── tests/             # Test-Auswahl & -Runner
│   ├── results/           # Ergebnis-Ansichten
│   ├── reports/           # PDF-Berichte
│   └── sources/           # Quellen-Übersicht
├── lib/
│   ├── tests/             # Test-Definitionen & Scoring
│   │   ├── definitions.ts # Alle Test-Metadaten
│   │   ├── scoring.ts     # Scoring-Logik
│   │   └── items/         # Test-Items (nur freie Tests)
│   ├── storage/           # IndexedDB Storage
│   └── pdf/               # PDF-Generierung
├── store/                 # Zustand Store
├── types/                 # TypeScript Typen
└── i18n/                  # Übersetzungen
```

## Tests und Urheberrecht

### Urheberrechts-Policy

Diese App respektiert Urheberrechte. Für jeden Test gilt:

| Status | Bedeutung | Verhalten in der App |
|--------|-----------|---------------------|
| `free` | Frei verfügbar mit dokumentierter Lizenz | Items werden in-app angezeigt |
| `restricted` | Urheberrechtlich geschützt | Link zu offiziellem Formular + manuelle Score-Eingabe |
| `unknown` | Lizenzstatus unklar | Wie `restricted` behandelt |

### Implementierte Tests

#### ADHS - Erwachsene
- **ASRS-6Q** (free): In-App Durchführung, WHO/Harvard Lizenz
- **ASRS-18Q** (restricted): Manuelle Score-Eingabe
- **WURS-25** (restricted): Manuelle Score-Eingabe

#### ADHS - Kinder
- **Vanderbilt Parent** (restricted): Link + Symptom-Count-Eingabe
- **Vanderbilt Teacher** (restricted): Link + Symptom-Count-Eingabe
- **SNAP-IV** (restricted): Manuelle Eingabe

#### Autismus-Spektrum
- **AQ-50** (unknown): Manuelle Score-Eingabe
- **RAADS-R** (restricted): Manuelle Score-Eingabe
- **ASSQ** (unknown): Manuelle Score-Eingabe

#### Dyspraxie
- **DCDQ'07** (restricted): Manuelle Score-Eingabe mit altersabhängigen Cutoffs

#### LRS
- **ARHQ** (unknown): Manuelle Score-Eingabe

### Neuen Test hinzufügen

1. **Definition hinzufügen** in `src/lib/tests/definitions.ts`:
```typescript
'new-test-id': {
  id: 'new-test-id',
  name: 'Kurzname',
  fullName: 'Vollständiger Name',
  category: 'adhd' | 'autism' | 'dyspraxia' | 'lrs',
  targetGroup: 'adult' | 'child' | 'parent-about-child' | 'teacher-about-child',
  description: '...',
  duration: '5-10 Minuten',
  itemCount: 10,
  // WICHTIG: Lizenzstatus prüfen!
  inputMode: 'in-app' | 'manual-score' | 'external-link',
  licenseStatus: 'free' | 'restricted' | 'unknown',
  licenseNote: 'Hinweis zur Lizenz',
  sourceUrl: 'https://...',
  scoringInfo: {
    minScore: 0,
    maxScore: 100,
    thresholds: [
      { min: 0, max: 30, level: 'unauffällig', label: '...', description: '...', color: 'green' },
      // ...
    ],
  },
}
```

2. **Scoring hinzufügen** in `src/lib/tests/scoring.ts` (falls spezielle Logik nötig)

3. **Bei `inputMode: 'in-app'`**: Items hinzufügen in `src/lib/tests/items/new-test-id.ts`

## Demo-Daten

Für Testzwecke können Demo-Daten geladen werden:

```javascript
// In der Browser-Konsole:
loadDemoData()
// Dann Seite neu laden
```

## CI/CD & Build

```bash
# Produktions-Build
npm run build

# Build starten
npm start

# Linting
npm run lint
```

## Datenschutz

- **Lokale Speicherung**: Alle Daten werden ausschließlich im Browser gespeichert (IndexedDB)
- **Keine Server-Kommunikation**: Keine Daten werden an Server übertragen
- **Export möglich**: Daten können als JSON exportiert werden
- **Löschbar**: Alle Daten können jederzeit gelöscht werden

## Lizenz

MIT

## Mitwirken

Beiträge sind willkommen! Bitte beachte:

1. **Urheberrecht**: Keine geschützten Item-Texte in den Code aufnehmen
2. **Sprache**: UI und Kommentare auf Deutsch
3. **Code-Style**: ESLint-Regeln befolgen
4. **Tests**: Bei neuen Features Tests ergänzen

## Ressourcen

- [AWMF Leitlinien](https://www.awmf.org/leitlinien)
- [ADHS Deutschland e.V.](https://www.adhs-deutschland.de)
- [Autismus Deutschland e.V.](https://www.autismus.de)
- [BVL - Legasthenie und Dyskalkulie](https://www.bvl-legasthenie.de)
