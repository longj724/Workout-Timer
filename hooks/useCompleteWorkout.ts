// External Dependencies
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Internal Dependencies
import { CompleteWorkoutInput, completeWorkoutSchema } from '../lib/types';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useCompleteWorkout = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (workout: CompleteWorkoutInput) => {
      try {
        const validatedData = completeWorkoutSchema.parse(workout);

        const response = await fetch(`${API_URL}/workouts/complete`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
          throw new Error('Failed to record workout');
        }

        return await response.json();
      } catch (error) {
        console;
        if (error instanceof z.ZodError) {
          throw new Error(error.errors[0].message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
    },
  });
};
