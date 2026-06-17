import { create } from 'zustand'

type FilterKey = 'financialYear' | 'month' | 'circle' | 'division' | 'subdivision'

interface FilterState {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
  setFilter: (key: FilterKey, value: string) => void
  resetFilters: () => void
}

const defaults = {
  financialYear: '2024-25',
  month: 'All',
  circle: 'All',
  division: 'All',
  subdivision: 'All',
}

export const useFilterStore = create<FilterState>((set) => ({
  ...defaults,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set(defaults),
}))
