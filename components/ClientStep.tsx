'use client'

import { useState } from 'react'
import { useI18n } from './i18n'
import styles from './ClientStep.module.css'

interface Props {
  ready: boolean
  onComplete: (name: string, city: string, country: string) => void
}

const COUNTRIES = ['VL', 'WA', 'NL', 'LU', 'FR', 'DE'] as const

export function ClientStep({ ready, onComplete }: Props) {
  const { copy, translateCountry } = useI18n()
  const [country, setCountry] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')

  const isValid = country && name.trim() && city.trim()

  if (ready) {
    return (
      <div className={styles.done}>
        <span className={styles.doneDot} />
        {copy.client.completed} — {name}{city ? `, ${city}` : ''}
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>{copy.client.title}</div>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label}>{copy.client.region}<span className={styles.req}>*</span></label>
          <div className={styles.selectWrap}>
            <select className={styles.select} value={country} onChange={e => setCountry(e.target.value)}>
              <option value="">{copy.common.chooseOne}</option>
              {COUNTRIES.map(code => <option key={code} value={code}>{translateCountry(code)}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{copy.client.shopName}<span className={styles.req}>*</span></label>
          <input className={styles.input} type="text" placeholder={copy.client.shopNamePlaceholder} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{copy.client.shopCity}<span className={styles.req}>*</span></label>
          <input className={styles.input} type="text" placeholder={copy.client.shopCityPlaceholder} value={city} onChange={e => setCity(e.target.value)} />
        </div>
      </div>
      <div className={styles.footer}>
        <button
          className={styles.btn}
          disabled={!isValid}
          onClick={() => isValid && onComplete(name.trim(), city.trim(), country)}
        >
          {copy.common.continue}
        </button>
      </div>
    </div>
  )
}
