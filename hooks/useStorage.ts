// External Dependencies
import { useState, useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type StorageValue = string | number | boolean | object | null;

/**
 * Custom hook for using AsyncStorage with React state
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist in storage
 * @returns [storedValue, setValue, loading] tuple
 */
export function useAsyncStorage<T extends StorageValue>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  // Load initial value from storage
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(key);

        if (jsonValue === null) {
          // If no value exists, save the initial value
          const valueToStore =
            typeof initialValue === 'object'
              ? JSON.stringify(initialValue)
              : String(initialValue);
          await AsyncStorage.setItem(key, valueToStore);
          setStoredValue(initialValue);
        } else {
          // Parse existing value based on initial value type
          let parsedValue: T;
          if (typeof initialValue === 'object') {
            parsedValue = JSON.parse(jsonValue);
          } else if (typeof initialValue === 'number') {
            parsedValue = Number(jsonValue) as T;
          } else if (typeof initialValue === 'boolean') {
            parsedValue = (jsonValue === 'true') as T;
          } else {
            parsedValue = jsonValue as T;
          }
          setStoredValue(parsedValue);
        }
      } catch (error) {
        console.error(`Error loading stored value for key "${key}":`, error);
        setStoredValue(initialValue);
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key, initialValue]);

  // Update storage and state
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    async (value: SetStateAction<T>) => {
      try {
        // Handle function updates
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore);

        // Save to storage
        if (valueToStore === null) {
          await AsyncStorage.removeItem(key);
        } else {
          const jsonValue =
            typeof valueToStore === 'object'
              ? JSON.stringify(valueToStore)
              : String(valueToStore);
          await AsyncStorage.setItem(key, jsonValue);
        }
      } catch (error) {
        console.error(`Error storing value for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, loading];
}

// Utility types for common use cases
export interface PersistentStorage<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  loading: boolean;
}

// Specialized hooks for common data types
export function useAsyncStorageString(
  key: string,
  initialValue: string = ''
): PersistentStorage<string> {
  const [value, setValue, loading] = useAsyncStorage(key, initialValue);
  return { value, setValue, loading };
}

export function useAsyncStorageNumber(
  key: string,
  initialValue: number = 0
): PersistentStorage<number> {
  const [value, setValue, loading] = useAsyncStorage(key, initialValue);
  return { value, setValue, loading };
}

export function useAsyncStorageBoolean(
  key: string,
  initialValue: boolean = false
): PersistentStorage<boolean> {
  const [value, setValue, loading] = useAsyncStorage(key, initialValue);
  return { value, setValue, loading };
}
