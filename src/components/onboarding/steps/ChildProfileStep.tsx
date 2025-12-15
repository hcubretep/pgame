'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { Button, Input, Label, Select, TagsInput } from '@/components/ui'

interface ChildProfileStepProps {
  onNext: () => void
  onBack: () => void
}

export function ChildProfileStep({ onNext, onBack }: ChildProfileStepProps) {
  const { childProfile, setChildProfile } = useAppStore()

  const [name, setName] = useState(childProfile?.name || '')
  const [age, setAge] = useState(childProfile?.age?.toString() || '')
  const [schoolGrade, setSchoolGrade] = useState(childProfile?.schoolGrade || '')
  const [schoolType, setSchoolType] = useState(childProfile?.schoolType || '')
  const [strengths, setStrengths] = useState<string[]>(childProfile?.strengths || [])
  const [concerns, setConcerns] = useState<string[]>(childProfile?.concerns || [])

  const handleNext = async () => {
    await setChildProfile({
      name,
      age: age ? parseInt(age, 10) : undefined,
      schoolGrade,
      schoolType: schoolType as 'kindergarten' | 'grundschule' | 'weiterführend' | 'sonstiges' | undefined,
      strengths,
      concerns,
    })
    onNext()
  }

  const isValid = name.trim().length > 0

  return (
    <div className="animate-in">
      <h2 className="section-title">Über dein Kind</h2>
      <p className="section-subtitle">
        Diese Informationen helfen uns, passende Screenings vorzuschlagen
      </p>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <Label htmlFor="name" required>
            Name oder Spitzname
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Wie möchtest du dein Kind nennen?"
          />
        </div>

        {/* Alter */}
        <div>
          <Label htmlFor="age">Alter (optional)</Label>
          <Input
            id="age"
            type="number"
            min="0"
            max="25"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Jahre"
          />
        </div>

        {/* Klasse */}
        <div>
          <Label htmlFor="schoolGrade">Klasse / Betreuungsform (optional)</Label>
          <Input
            id="schoolGrade"
            value={schoolGrade}
            onChange={(e) => setSchoolGrade(e.target.value)}
            placeholder="z.B. 2. Klasse, Vorschule"
          />
        </div>

        {/* Schulart */}
        <div>
          <Label htmlFor="schoolType">Art der Einrichtung (optional)</Label>
          <Select
            id="schoolType"
            value={schoolType}
            onChange={(e) => setSchoolType(e.target.value)}
            placeholder="Bitte auswählen"
            options={[
              { value: 'kindergarten', label: 'Kindergarten / Kita' },
              { value: 'grundschule', label: 'Grundschule' },
              { value: 'weiterführend', label: 'Weiterführende Schule' },
              { value: 'sonstiges', label: 'Sonstiges' },
            ]}
          />
        </div>

        <div className="divider" />

        {/* Stärken */}
        <div>
          <Label>Stärken deines Kindes (optional)</Label>
          <TagsInput
            value={strengths}
            onChange={setStrengths}
            placeholder="Eingabe + Enter"
            hint="z.B. kreativ, hilfsbereit, gutes Gedächtnis..."
          />
        </div>

        {/* Sorgen */}
        <div>
          <Label>Deine Hauptsorgen (optional)</Label>
          <TagsInput
            value={concerns}
            onChange={setConcerns}
            placeholder="Eingabe + Enter"
            hint="z.B. Konzentration, soziale Situationen, Lesen..."
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
