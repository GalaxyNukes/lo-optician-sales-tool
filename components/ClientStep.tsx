'use client'

import { useState } from 'react'
import styles from './ClientStep.module.css'

interface Props {
  ready: boolean
  onComplete: (name: string, city: string, country: string) => void
}

const COUNTRIES = [
  { value: 'VL', label: 'Vlaanderen' },
  { value: 'WA', label: 'Wallonië' },
  { value: 'NL', label: 'Nederland' },
  { value: 'LU', label: 'Luxemburg' },
  { value: 'FR', label: 'Frankrijk' },
  { value: 'DE', label: 'Duitsland' },
]

export function ClientStep({ ready, onComplete }: Props) {
  const [country, setCountry] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')

  const isValid = country && name.trim() && city.trim()

  if (ready) {
    return (
      <div className={styles.done}>
        <span className={styles.doneDot} />
        Gegevens ingevuld — {name}{city ? `, ${city}` : ''}
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>Gegevens opticien</div>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>Regio / land<span className={styles.req}>*</span></label>
          <div className={styles.selectWrap}>
            <select className={styles.select} value={country} onChange={e => setCountry(e.target.value)}>
              <option value="">Kies er één uit...</option>
              {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Naam winkel<span className={styles.req}>*</span></label>
          <input className={styles.input} type="text" placeholder="Bijv. Optica Janssen" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Stad winkel<span className={styles.req}>*</span></label>
          <input className={styles.input} type="text" placeholder="Bijv. Gent" value={city} onChange={e => setCity(e.target.value)} />
        </div>
      </div>
      <div className={styles.footer}>
        <button
          className={styles.btn}
          disabled={!isValid}
          onClick={() => isValid && onComplete(name.trim(), city.trim(), COUNTRIES.find(c => c.value === country)?.label || '')}
        >
          Doorgaan →
        </button>
      </div>
    </div>
  )
}
