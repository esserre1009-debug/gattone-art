import { useEffect, useState } from 'react'
import { getFlags } from '../lib/dataClient'

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
        const data = await getFlags()

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