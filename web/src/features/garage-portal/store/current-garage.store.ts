import { useQuery } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { portalApi, portalKeys } from '../api/portal.api'
import type { OwnedGarage } from '../model/portal.schemas'

/** Remembers the garage an owner last looked at, on this browser only. */
const STORAGE_KEY = 'parkeasy.garage-portal.garage'

function readSaved(): number | null {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isInteger(value) && value > 0 ? value : null
  } catch {
    // Private mode or blocked storage: start with the first garage.
    return null
  }
}

function save(id: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(id))
  } catch {
    // Not remembered; nothing else depends on it.
  }
}

/** Which of the owner's garages the portal shows. Most owners have one. */
export const useCurrentGarageStore = defineStore('current-garage', () => {
  const selectedId = ref<number | null>(readSaved())
  return {
    selectedId,
    select(id: number) {
      selectedId.value = id
      save(id)
    },
  }
})

/** The owner's garages and the one on screen (the saved one, else the first). */
export function useCurrentGarage() {
  const store = useCurrentGarageStore()
  const garages = useQuery({
    queryKey: portalKeys.garages(),
    queryFn: ({ signal }) => portalApi.myGarages(signal),
  })

  const current = computed<OwnedGarage | null>(() => {
    const list = garages.data.value ?? []
    return list.find((garage) => garage.id === store.selectedId) ?? list[0] ?? null
  })

  return { garages, current, select: store.select }
}
