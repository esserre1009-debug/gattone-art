import { useEffect, useState } from 'react'
import { getHero } from '../lib/dataClient'
import fallbackHero from '../data/hero.json'

export function useHero() {
  const [hero, setHero] = useState(fallbackHero)

  useEffect(() => {
    let active = true
    getHero().then((data) => {
      if (active) setHero(data)
    })
    return () => { active = false }
  }, [])

  return hero
}
