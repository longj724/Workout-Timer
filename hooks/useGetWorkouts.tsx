// External Dependencies
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuth } from '@clerk/clerk-expo';

// Internal Dependencies
import { WorkoutsList } from '../lib/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useGetWorkouts = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['workouts'],
    queryFn: async (): Promise<WorkoutsList> => {
      const response = await fetch(`${API_URL}/workouts`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      console.log('response', response);

      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }

      const data = await response.json();
      // Should parse the data with zod
      return data;
    },
  });
};
