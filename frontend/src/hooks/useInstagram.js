import { useEffect, useState } from 'react'
import { getInstagram } from '../lib/dataClient'
import fallbackInstagram from '../data/instagram.json'

export function useInstagram() {
  const [instagram, setInstagram] = useState(fallbackInstagram)

  useEffect(() => {
    let active = true
    getInstagram().then((data) => {
      if (active) setInstagram(data)
    })
    return () => { active = false }
  }, [])

  return instagram
}
