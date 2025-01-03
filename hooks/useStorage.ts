// External Dependencies
import { useState, useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

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

type StorageMutationArgs<T> = {
  key: string;
  value: T;
};

async function setStorageItem<T extends StorageValue>({
  key,
  value,
}: StorageMutationArgs<T>) {
  if (value === null) {
    await AsyncStorage.removeItem(key);
    return null;
  }

  const jsonValue =
    typeof value === 'object' ? JSON.stringify(value) : String(value);

  await AsyncStorage.setItem(key, jsonValue);
  return value;
}

export function useStorageMutation<T extends StorageValue>(key: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: T) => setStorageItem({ key, value }),
    onSuccess: (data) => {
      // Invalidate and refetch any queries that depend on this storage key
      queryClient.invalidateQueries({ queryKey: [key] });
    },
    onError: (error) => {
      console.error(`Error storing value for key "${key}":`, error);
    },
  });
}

// Example typed versions of the mutation hook
export function useStorageStringMutation(key: string) {
  return useStorageMutation<string>(key);
}

export function useStorageNumberMutation(key: string) {
  return useStorageMutation<number>(key);
}

export function useStorageBooleanMutation(key: string) {
  return useStorageMutation<boolean>(key);
}

async function getStorageItem<T extends StorageValue>(
  key: string,
  defaultValue: T
): Promise<T> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);

    if (jsonValue === null) {
      return defaultValue;
    }

    // Parse value based on default value type
    if (typeof defaultValue === 'object') {
      return JSON.parse(jsonValue);
    } else if (typeof defaultValue === 'number') {
      return Number(jsonValue) as T;
    } else if (typeof defaultValue === 'boolean') {
      return (jsonValue === 'true') as T;
    }
    return jsonValue as T;
  } catch (error) {
    console.error(`Error reading storage key "${key}":`, error);
    return defaultValue;
  }
}

export function useStorageQuery<T extends StorageValue>(
  key: string,
  defaultValue: T,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: [key],
    queryFn: () => getStorageItem<T>(key, defaultValue),
    ...options,
  });
}

// Typed versions for common data types
export function useStorageStringQuery(
  key: string,
  defaultValue: string = '',
  options?: { enabled?: boolean }
) {
  return useStorageQuery(key, defaultValue, options);
}

export function useStorageNumberQuery(
  key: string,
  defaultValue: number = 0,
  options?: { enabled?: boolean }
) {
  return useStorageQuery(key, defaultValue, options);
}

export function useStorageBooleanQuery(
  key: string,
  defaultValue: boolean = false,
  options?: { enabled?: boolean }
) {
  return useStorageQuery(key, defaultValue, options);
}
