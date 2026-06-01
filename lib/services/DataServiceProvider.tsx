'use client'

import {
  createContext,
  useContext,
  ReactNode,
  useMemo
} from 'react'
import { DataService } from './types'
import { WebDataService } from './webDataService'
import { TauriDataService } from './tauriDataService'

const DataServiceContext = createContext<DataService | undefined>(undefined)

export function DataServiceProvider({ children }: { children: ReactNode }) {
  const service = useMemo<DataService>(() => {
    const isTauri =
      typeof window !== 'undefined' &&
      '__TAURI_INTERNALS__' in window

    if (isTauri) {
      return new TauriDataService()
    }

    return new WebDataService()
  }, [])

  return (
    <DataServiceContext.Provider value={service}>
      {children}
    </DataServiceContext.Provider>
  )
}

export function useDataService(): DataService {
  const service = useContext(DataServiceContext)

  if (!service) {
    throw new Error(
      'useDataService must be called within a DataServiceProvider'
    )
  }

  return service
}
