'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { Button, Input, Label, RadioGroup } from '@/components/ui'

interface CaregiverStepProps {
  onNext: () => void
  onBack: () => void
}

export function CaregiverStep({ onNext, onBack }: CaregiverStepProps) {
  const { caregiverProfile, setCaregiverProfile } = useAppStore()

  const [role, setRole] = useState(caregiverProfile?.role || '')
  const [name, setName] = useState(caregiverProfile?.name || '')

  const handleNext = async () => {
    await setCaregiverProfile({
      role: role as 'mutter' | 'vater' | 'erziehungsberechtigter' | 'sonstiges',
      name: name || undefined,
    })
    onNext()
  }

  const isValid = role.length > 0

  return (
    <div className="animate-in">
      <h2 className="section-title">Über dich</h2>
      <p className="section-subtitle">Wer bist du für das Kind?</p>

      <div className="space-y-6">
        {/* Rolle */}
        <div>
          <Label required>Deine Rolle</Label>
          <RadioGroup
            name="caregiver-role"
            value={role}
            onChange={setRole}
            options={[
              { value: 'mutter', label: 'Mutter' },
              { value: 'vater', label: 'Vater' },
              { value: 'erziehungsberechtigter', label: 'Erziehungsberechtigte/r' },
              { value: 'sonstiges', label: 'Sonstige Bezugsperson' },
            ]}
          />
        </div>

        {/* Name (optional) */}
        <div>
          <Label htmlFor="caregiver-name">Dein Name (optional)</Label>
          <Input
            id="caregiver-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Für die Berichte"
            hint="Dieser Name erscheint optional in PDF-Berichten"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Zurück
        </Button>
        <Button onClick={handleNext} disabled={!isValid} className="flex-1">
          Weiter
        </Button>
      </div>
    </div>
  )
}
