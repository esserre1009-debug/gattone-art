import { useEffect, useState } from 'react'

const DEFAULT_FLAGS = {
  enableBio: false,
  enableInstagramFeed: false,
  enableLinkForm: false,
}

export function useFlags() {
  const [flags, setFlags] = useState(DEFAULT_FLAGS)

  useEffect(() => {
    async function loadFlags() {
      try {
        const res = await fetch('/api/flags')
        if (!res.ok) {
          throw new Error('Errore caricamento flags')
        }

        const data = await res.json()

        setFlags({
          enableBio: !!data.enableBio,
          enableInstagramFeed: !!data.enableInstagramFeed,
          enableLinkForm: !!data.enableLinkForm,
        })
      } catch (error) {
        console.error('Errore load flags:', error)
      }
    }

    loadFlags()
  }, [])

  return flags
}