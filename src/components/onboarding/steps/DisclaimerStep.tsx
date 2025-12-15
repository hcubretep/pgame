'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { Button, Checkbox, Modal } from '@/components/ui'

interface DisclaimerStepProps {
  onNext: () => void
  onBack: () => void
}

export function DisclaimerStep({ onNext, onBack }: DisclaimerStepProps) {
  const { acceptDisclaimer, showEmergencyInfo, onboarding } = useAppStore()
  const [accepted, setAccepted] = useState(onboarding.disclaimerAccepted)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)

  const handleAccept = () => {
    setAccepted(true)
    acceptDisclaimer()
  }

  const handleNext = () => {
    if (accepted) {
      onNext()
    }
  }

  return (
    <div className="animate-in">
      <h2 className="section-title">Wichtige Hinweise</h2>
      <p className="section-subtitle">Bitte lies diese Informationen sorgfältig</p>

      <div className="space-y-4 mb-8">
        {/* Screening ≠ Diagnose */}
        <div className="info-box">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Screening ≠ Diagnose
              </h3>
              <p className="text-sm text-gray-600">
                Diese App ersetzt keine ärztliche oder psychologische Diagnose. Die Ergebnisse zeigen lediglich Hinweise, die eine professionelle Abklärung sinnvoll machen könnten.
              </p>
            </div>
          </div>
        </div>

        {/* Datenschutz */}
        <div className="info-box">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Deine Daten bleiben bei dir
              </h3>
              <p className="text-sm text-gray-600">
                Alle Informationen werden ausschließlich lokal auf deinem Gerät gespeichert. Es werden keine Daten an Server übertragen.
              </p>
            </div>
          </div>
        </div>

        {/* Notfall */}
        <div className="info-box-warning">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Bei akuter Belastung
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Falls du oder dein Kind akut belastet seid, wende dich bitte an professionelle Hilfe.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowEmergencyModal(true)
                  showEmergencyInfo()
                }}
              >
                Notfall-Nummern anzeigen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Akzeptieren Checkbox */}
      <div className="bg-white rounded-xl p-4 mb-8">
        <Checkbox
          checked={accepted}
          onChange={(e) => handleAccept()}
          label="Ich habe die Hinweise gelesen und verstanden"
          description="Ich verstehe, dass diese App keine Diagnose stellt."
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Zurück
        </Button>
        <Button onClick={handleNext} disabled={!accepted} className="flex-1">
          Weiter
        </Button>
      </div>

      {/* Emergency Modal */}
      <Modal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        title="Notfall-Nummern"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Bei akuter Gefahr oder Notfall erreichst du hier professionelle Hilfe:
          </p>

          <div className="space-y-3">
            <a
              href="tel:112"
              className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">Notruf</p>
                <p className="text-sm text-gray-600">Akute Gefahr</p>
              </div>
              <span className="text-xl font-bold text-red-600">112</span>
            </a>

            <a
              href="tel:08001110111"
              className="flex items-center justify-between p-4 bg-sage-50 rounded-xl hover:bg-sage-100 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">Telefonseelsorge</p>
                <p className="text-sm text-gray-600">24h, kostenlos, anonym</p>
              </div>
              <span className="text-lg font-semibold text-sage-700">0800 111 0 111</span>
            </a>

            <a
              href="tel:08001110333"
              className="flex items-center justify-between p-4 bg-sage-50 rounded-xl hover:bg-sage-100 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">Kinder- und Jugendtelefon</p>
                <p className="text-sm text-gray-600">Mo-Sa 14-20 Uhr, kostenlos</p>
              </div>
              <span className="text-lg font-semibold text-sage-700">0800 111 0 333</span>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  )
}
