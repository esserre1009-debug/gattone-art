import categoriesData from './categories.json'

export const SUBJECTS = categoriesData.subjects
export const AVAILABILITIES = categoriesData.availabilities
export const SIZE_CATEGORIES = categoriesData.sizeCategories

export const FILTER_GROUPS = [
  { key: 'subject', label: 'Soggetto', values: SUBJECTS },
  { key: 'sizeCategory', label: 'Dimensione', values: SIZE_CATEGORIES },
  { key: 'availability', label: 'Disponibilita', values: AVAILABILITIES },
]
