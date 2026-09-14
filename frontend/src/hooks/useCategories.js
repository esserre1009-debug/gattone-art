import { useEffect, useState } from 'react'
import { getCategories } from '../lib/dataClient'
import fallbackCategories from '../data/categories.json'

export function useCategories() {
  const [categories, setCategories] = useState(fallbackCategories)

  useEffect(() => {
    let active = true
    getCategories().then((data) => {
      if (active) setCategories(data)
    })
    return () => { active = false }
  }, [])

  const filterGroups = [
    { key: 'subject', label: 'Soggetto', values: categories.subjects || [] },
    { key: 'sizeCategory', label: 'Dimensione', values: categories.sizeCategories || [] },
    { key: 'availability', label: 'Disponibilita', values: categories.availabilities || [] },
  ]

  return { categories, filterGroups }
}
