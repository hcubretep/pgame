/**
 * Bloom Now - PDF Report Generator
 *
 * Generiert Kurz- und Detailberichte als PDF.
 * Verwendet pdf-lib für client-side PDF-Generierung.
 */

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib'
import type { ChildProfile, CaregiverProfile, TestSession } from '@/types'
import { getTestDefinition } from '@/lib/tests'

interface GeneratePDFOptions {
  type: 'kurz' | 'detail'
  childProfile: ChildProfile
  caregiverProfile: CaregiverProfile
  sessions: TestSession[]
}

const COLORS = {
  primary: rgb(0.376, 0.447, 0.376), // sage-600
  text: rgb(0.1, 0.1, 0.1),
  textLight: rgb(0.4, 0.4, 0.4),
  green: rgb(0.42, 0.56, 0.5),
  yellow: rgb(0.83, 0.65, 0.45),
  red: rgb(0.76, 0.47, 0.4),
  border: rgb(0.85, 0.85, 0.85),
}

export async function generatePDFReport(options: GeneratePDFOptions): Promise<void> {
  const { type, childProfile, caregiverProfile, sessions } = options

  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595.28 // A4
  const pageHeight = 841.89
  const margin = 50

  // Generate pages based on type
  if (type === 'kurz') {
    await generateShortReport(pdfDoc, options, { helvetica, helveticaBold, pageWidth, pageHeight, margin })
  } else {
    await generateDetailReport(pdfDoc, options, { helvetica, helveticaBold, pageWidth, pageHeight, margin })
  }

  // Save and download
  const pdfBytes = await pdfDoc.save()
  downloadPDF(pdfBytes, `bloom-now-${type}-${new Date().toISOString().split('T')[0]}.pdf`)
}

interface Fonts {
  helvetica: PDFFont
  helveticaBold: PDFFont
  pageWidth: number
  pageHeight: number
  margin: number
}

// ============================================
// Short Report (1 page)
// ============================================

async function generateShortReport(
  pdfDoc: PDFDocument,
  options: GeneratePDFOptions,
  fonts: Fonts
): Promise<void> {
  const { childProfile, caregiverProfile, sessions } = options
  const { helvetica, helveticaBold, pageWidth, pageHeight, margin } = fonts

  const page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  // Header
  y = drawText(page, 'Bloom Now - Screening-Bericht', margin, y, helveticaBold, 20, COLORS.primary)
  y -= 5
  y = drawText(page, 'Kurzbericht', margin, y, helvetica, 12, COLORS.textLight)
  y -= 20

  // Line
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: COLORS.border,
  })
  y -= 20

  // Child Info
  y = drawText(page, 'Kind:', margin, y, helveticaBold, 11, COLORS.text)
  y = drawText(page, childProfile.name, margin + 100, y + 14, helvetica, 11, COLORS.text)
  y -= 5

  if (childProfile.age) {
    y = drawText(page, 'Alter:', margin, y, helveticaBold, 11, COLORS.text)
    y = drawText(page, `${childProfile.age} Jahre`, margin + 100, y + 14, helvetica, 11, COLORS.text)
    y -= 5
  }

  y = drawText(page, 'Erstellt am:', margin, y, helveticaBold, 11, COLORS.text)
  y = drawText(page, new Date().toLocaleDateString('de-DE'), margin + 100, y + 14, helvetica, 11, COLORS.text)
  y -= 25

  // Results Summary
  y = drawText(page, 'Screening-Ergebnisse', margin, y, helveticaBold, 14, COLORS.primary)
  y -= 15

  for (const session of sessions) {
    const definition = getTestDefinition(session.testId)
    if (!definition) continue

    const levelColor = getLevelColor(session.interpretation.level)

    // Test name and level
    y = drawText(page, definition.name, margin, y, helveticaBold, 11, COLORS.text)

    // Draw level indicator
    page.drawCircle({
      x: margin + 200,
      y: y + 4,
      size: 4,
      color: levelColor,
    })

    y = drawText(
      page,
      session.interpretation.level === 'unauffällig'
        ? 'Unauffällig'
        : session.interpretation.level === 'grenzwertig'
        ? 'Grenzwertig'
        : session.interpretation.level === 'auffällig'
        ? 'Auffällig'
        : 'Deutlich auffällig',
      margin + 210,
      y + 14,
      helvetica,
      10,
      levelColor
    )
    y -= 5

    // Summary (wrapped)
    const summaryLines = wrapText(session.interpretation.summary, 80)
    for (const line of summaryLines) {
      y = drawText(page, line, margin + 10, y, helvetica, 10, COLORS.textLight)
    }
    y -= 10
  }

  // Next Steps
  y -= 10
  y = drawText(page, 'Empfohlene nächste Schritte', margin, y, helveticaBold, 14, COLORS.primary)
  y -= 15

  const allNextSteps = new Set<string>()
  sessions.forEach((s) => s.interpretation.nextSteps.forEach((step) => allNextSteps.add(step)))

  Array.from(allNextSteps).forEach((step) => {
    y = drawText(page, `• ${step}`, margin, y, helvetica, 10, COLORS.text)
  })

  // Disclaimer
  y -= 30
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: pageWidth - 2 * margin,
    height: 60,
    color: rgb(0.98, 0.97, 0.95),
    borderColor: COLORS.border,
    borderWidth: 1,
  })

  y -= 10
  y = drawText(page, 'Wichtiger Hinweis', margin + 10, y, helveticaBold, 10, COLORS.text)
  y -= 5
  const disclaimerLines = wrapText(
    'Dies ist ein Screening-Ergebnis, keine Diagnose. Die Ergebnisse zeigen Hinweise, ' +
    'die eine professionelle Abklärung sinnvoll machen könnten. Bitte besprechen Sie ' +
    'die Ergebnisse mit einem/einer Facharzt/Fachärztin.',
    90
  )
  for (const line of disclaimerLines) {
    y = drawText(page, line, margin + 10, y, helvetica, 9, COLORS.textLight)
  }

  // Footer
  page.drawText('Erstellt mit Bloom Now - bloomnow.app', {
    x: margin,
    y: 30,
    size: 8,
    font: helvetica,
    color: COLORS.textLight,
  })
}

// ============================================
// Detail Report (3+ pages)
// ============================================

async function generateDetailReport(
  pdfDoc: PDFDocument,
  options: GeneratePDFOptions,
  fonts: Fonts
): Promise<void> {
  const { childProfile, caregiverProfile, sessions } = options
  const { helvetica, helveticaBold, pageWidth, pageHeight, margin } = fonts

  // Page 1: Overview
  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  // Header
  y = drawText(page, 'Bloom Now - Screening-Bericht', margin, y, helveticaBold, 20, COLORS.primary)
  y -= 5
  y = drawText(page, 'Detailbericht', margin, y, helvetica, 12, COLORS.textLight)
  y -= 20

  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: COLORS.border,
  })
  y -= 25

  // Profile Section
  y = drawText(page, 'Profil', margin, y, helveticaBold, 14, COLORS.primary)
  y -= 15

  y = drawText(page, `Kind: ${childProfile.name}`, margin, y, helvetica, 11, COLORS.text)
  if (childProfile.age) {
    y = drawText(page, `Alter: ${childProfile.age} Jahre`, margin, y, helvetica, 11, COLORS.text)
  }
  if (childProfile.schoolGrade) {
    y = drawText(page, `Klasse: ${childProfile.schoolGrade}`, margin, y, helvetica, 11, COLORS.text)
  }
  if (caregiverProfile.name) {
    y = drawText(page, `Bezugsperson: ${caregiverProfile.name}`, margin, y, helvetica, 11, COLORS.text)
  }
  y = drawText(page, `Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, margin, y, helvetica, 11, COLORS.text)

  // Strengths
  if (childProfile.strengths.length > 0) {
    y -= 15
    y = drawText(page, 'Stärken:', margin, y, helveticaBold, 11, COLORS.text)
    y = drawText(page, childProfile.strengths.join(', '), margin + 70, y + 14, helvetica, 10, COLORS.textLight)
  }

  // Overview Table
  y -= 30
  y = drawText(page, 'Übersicht der Ergebnisse', margin, y, helveticaBold, 14, COLORS.primary)
  y -= 20

  // Table header
  page.drawRectangle({
    x: margin,
    y: y - 5,
    width: pageWidth - 2 * margin,
    height: 25,
    color: rgb(0.95, 0.95, 0.95),
  })

  y = drawText(page, 'Screening', margin + 10, y, helveticaBold, 10, COLORS.text)
  y = drawText(page, 'Score', margin + 250, y + 13, helveticaBold, 10, COLORS.text)
  y = drawText(page, 'Einschätzung', margin + 330, y + 13, helveticaBold, 10, COLORS.text)
  y -= 15

  // Table rows
  for (const session of sessions) {
    const definition = getTestDefinition(session.testId)
    if (!definition) continue

    const levelColor = getLevelColor(session.interpretation.level)

    y = drawText(page, definition.name, margin + 10, y, helvetica, 10, COLORS.text)
    y = drawText(
      page,
      `${session.scores.total}/${definition.scoringInfo.maxScore}`,
      margin + 250,
      y + 13,
      helvetica,
      10,
      COLORS.text
    )

    page.drawCircle({
      x: margin + 330,
      y: y + 17,
      size: 4,
      color: levelColor,
    })

    y = drawText(
      page,
      getLevelLabel(session.interpretation.level),
      margin + 340,
      y + 13,
      helvetica,
      10,
      levelColor
    )
    y -= 10

    // Separator
    page.drawLine({
      start: { x: margin, y: y + 5 },
      end: { x: pageWidth - margin, y: y + 5 },
      thickness: 0.5,
      color: COLORS.border,
    })
  }

  // Disclaimer on page 1
  y -= 30
  page.drawRectangle({
    x: margin,
    y: y - 60,
    width: pageWidth - 2 * margin,
    height: 70,
    color: rgb(0.98, 0.97, 0.95),
    borderColor: COLORS.border,
    borderWidth: 1,
  })

  y -= 10
  y = drawText(page, 'Wichtiger Hinweis', margin + 10, y, helveticaBold, 10, COLORS.text)
  y -= 5
  const disclaimerLines = wrapText(
    'Dies ist ein Screening-Ergebnis, keine Diagnose. Die Ergebnisse zeigen Hinweise, ' +
    'die eine professionelle Abklärung sinnvoll machen könnten. Bitte besprechen Sie ' +
    'die Ergebnisse mit einem/einer Facharzt/Fachärztin oder Psycholog:in.',
    95
  )
  for (const line of disclaimerLines) {
    y = drawText(page, line, margin + 10, y, helvetica, 9, COLORS.textLight)
  }

  // Page 2+: Detail per test
  for (const session of sessions) {
    const definition = getTestDefinition(session.testId)
    if (!definition) continue

    page = pdfDoc.addPage([pageWidth, pageHeight])
    y = pageHeight - margin

    // Test Header
    y = drawText(page, definition.fullName, margin, y, helveticaBold, 16, COLORS.primary)
    y -= 5
    y = drawText(page, definition.name, margin, y, helvetica, 11, COLORS.textLight)
    y -= 20

    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: COLORS.border,
    })
    y -= 20

    // Score
    const levelColor = getLevelColor(session.interpretation.level)
    y = drawText(page, 'Ergebnis:', margin, y, helveticaBold, 12, COLORS.text)

    page.drawCircle({
      x: margin + 80,
      y: y + 4,
      size: 6,
      color: levelColor,
    })

    y = drawText(
      page,
      `${session.scores.total} von ${definition.scoringInfo.maxScore} - ${getLevelLabel(session.interpretation.level)}`,
      margin + 95,
      y + 14,
      helveticaBold,
      12,
      levelColor
    )
    y -= 20

    // Interpretation
    y = drawText(page, 'Einschätzung', margin, y, helveticaBold, 12, COLORS.text)
    y -= 10
    const summaryLines = wrapText(session.interpretation.summary, 90)
    for (const line of summaryLines) {
      y = drawText(page, line, margin, y, helvetica, 11, COLORS.text)
    }

    if (session.interpretation.details) {
      y -= 10
      const detailLines = wrapText(session.interpretation.details, 90)
      for (const line of detailLines) {
        y = drawText(page, line, margin, y, helvetica, 10, COLORS.textLight)
      }
    }

    // Next Steps
    y -= 20
    y = drawText(page, 'Empfohlene nächste Schritte', margin, y, helveticaBold, 12, COLORS.text)
    y -= 10
    for (const step of session.interpretation.nextSteps) {
      y = drawText(page, `• ${step}`, margin, y, helvetica, 10, COLORS.text)
    }

    // Caveats
    if (session.interpretation.caveats.length > 0) {
      y -= 20
      y = drawText(page, 'Hinweise', margin, y, helveticaBold, 12, COLORS.text)
      y -= 10
      for (const caveat of session.interpretation.caveats) {
        y = drawText(page, `• ${caveat}`, margin, y, helvetica, 10, COLORS.textLight)
      }
    }

    // Test Info
    y -= 30
    page.drawRectangle({
      x: margin,
      y: y - 80,
      width: pageWidth - 2 * margin,
      height: 90,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: COLORS.border,
      borderWidth: 1,
    })

    y -= 10
    y = drawText(page, 'Über diesen Test', margin + 10, y, helveticaBold, 10, COLORS.text)
    y -= 5
    const descLines = wrapText(definition.description, 90)
    for (const line of descLines) {
      y = drawText(page, line, margin + 10, y, helvetica, 9, COLORS.textLight)
    }

    y -= 10
    if (definition.sourceUrl) {
      y = drawText(page, `Quelle: ${definition.sourceUrl}`, margin + 10, y, helvetica, 8, COLORS.textLight)
    }

    y = drawText(
      page,
      `Durchgeführt am: ${session.completedAt ? new Date(session.completedAt).toLocaleDateString('de-DE') : ''}`,
      margin + 10,
      y,
      helvetica,
      8,
      COLORS.textLight
    )

    // Footer
    page.drawText('Erstellt mit Bloom Now - bloomnow.app', {
      x: margin,
      y: 30,
      size: 8,
      font: helvetica,
      color: COLORS.textLight,
    })
  }

  // Sources page
  page = pdfDoc.addPage([pageWidth, pageHeight])
  y = pageHeight - margin

  y = drawText(page, 'Quellen', margin, y, helveticaBold, 16, COLORS.primary)
  y -= 20

  const usedTests = Array.from(new Set(sessions.map((s) => s.testId)))
  usedTests.forEach((testId) => {
    const definition = getTestDefinition(testId)
    if (!definition) return

    y = drawText(page, definition.name, margin, y, helveticaBold, 11, COLORS.text)
    y = drawText(page, definition.fullName, margin, y, helvetica, 10, COLORS.textLight)
    if (definition.sourceUrl) {
      y = drawText(page, definition.sourceUrl, margin, y, helvetica, 9, COLORS.primary)
    }
    y -= 10
  })

  // Footer
  page.drawText('Erstellt mit Bloom Now - bloomnow.app', {
    x: margin,
    y: 30,
    size: 8,
    font: helvetica,
    color: COLORS.textLight,
  })
}

// ============================================
// Helper Functions
// ============================================

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>
): number {
  page.drawText(text, { x, y, size, font, color })
  return y - size - 4
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim()
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)

  return lines
}

function getLevelColor(level: string): ReturnType<typeof rgb> {
  switch (level) {
    case 'unauffällig':
      return COLORS.green
    case 'grenzwertig':
      return COLORS.yellow
    case 'auffällig':
    case 'deutlich-auffällig':
      return COLORS.red
    default:
      return COLORS.textLight
  }
}

function getLevelLabel(level: string): string {
  switch (level) {
    case 'unauffällig':
      return 'Unauffällig'
    case 'grenzwertig':
      return 'Grenzwertig'
    case 'auffällig':
      return 'Auffällig'
    case 'deutlich-auffällig':
      return 'Deutlich auffällig'
    default:
      return level
  }
}

function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
