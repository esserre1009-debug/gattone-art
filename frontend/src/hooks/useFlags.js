import { useEffect, useState } from 'react'
import { getFlags } from '../lib/dataClient'
import fallbackFlags from '../data/flags.json'

export function useFlags() {
  const [flags, setFlags] = useState(fallbackFlags)

  useEffect(() => {
    let active = true
    getFlags().then((data) => {
      if (active) setFlags(data)
    })
    return () => { active = false }
  }, [])

  return flags
}
