'use client'

import { useEffect, useState } from 'react'

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(initialValue)

  useEffect(() => {
    // Retrieve from localStorage
    const item =
      typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
    if (item) {
      setStoredValue(JSON.parse(item))
    }
  }, [key])

  const setValue = (value: T) => {
    // Save state
    setStoredValue(value)
    // Save to localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  }
  return [storedValue, setValue]
}
