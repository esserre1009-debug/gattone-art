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
        const res = await fetch('/api/flags', {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error(`Errore caricamento flags: ${res.status}`)
        }

        const data = await res.json()
        console.log('Flags ricevuti dal backend:', data)

        setFlags({
          enableBio: !!data.enableBio,
          enableInstagramFeed: !!data.enableInstagramFeed,
          enableLinkForm: !!data.enableLinkForm || !!data.enableContact,
        })
      } catch (error) {
        console.error('Errore load flags:', error)
        setFlags(DEFAULT_FLAGS)
      }
    }

    loadFlags()
  }, [])

  return flags
}
