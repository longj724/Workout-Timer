// External Dependencies
import AsyncStorage from '@react-native-async-storage/async-storage';

type StorageValue = string | number | boolean | object | null;

export const asyncStorage = {
  /**
   * Store key-value pair in AsyncStorage
   * @param key - Storage key
   * @param value - Value to store (string, number, boolean, or object)
   */
  set: async <T extends StorageValue>(key: string, value: T): Promise<void> => {
    try {
      if (value === null) {
        await AsyncStorage.removeItem(key);
        return;
      }

      const valueToStore =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      await AsyncStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  /**
   * Get value from AsyncStorage
   * @param key - Storage key
   * @param defaultValue - Default value if key doesn't exist
   * @returns Retrieved value or default value
   */
  get: async <T extends StorageValue>(
    key: string,
    defaultValue: T | null = null
  ): Promise<T | null> => {
    try {
      const item = await AsyncStorage.getItem(key);

      if (item === null) {
        return defaultValue;
      }

      // If defaultValue is provided, use its type to parse
      if (defaultValue !== null) {
        switch (typeof defaultValue) {
          case 'number':
            return Number(item) as T;
          case 'boolean':
            return (item === 'true') as T;
          case 'object':
            return JSON.parse(item) as T;
          default:
            return item as T;
        }
      }

      // If no defaultValue, try to parse as JSON, fallback to string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      return defaultValue;
    }
  },

  /**
   * Delete value by key
   * @param key - Storage key to delete
   */
  delete: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  },

  /**
   * Clear all stored data
   */
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  /**
   * Get multiple items at once
   * @param keys - Array of storage keys
   */
  multiGet: async <T extends StorageValue>(
    keys: string[]
  ): Promise<Record<string, T | null>> => {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      return pairs.reduce((acc, [key, value]) => {
        try {
          acc[key] = value ? JSON.parse(value) : null;
        } catch {
          acc[key] = value as T;
        }
        return acc;
      }, {} as Record<string, T | null>);
    } catch (error) {
      console.error('Error retrieving multiple items:', error);
      return {};
    }
  },

  /**
   * Get all keys in storage
   * @returns Array of storage keys
   */
  getAllKeys: async (): Promise<string[]> => {
    try {
      return (await AsyncStorage.getAllKeys()) as string[];
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
};
