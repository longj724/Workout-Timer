// External Dependencies
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Internal Dependencies
import { CreateWorkoutInput, createWorkoutSchema } from '../lib/types';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (workout: CreateWorkoutInput) => {
      try {
        const validatedData = createWorkoutSchema.parse(workout);

        const response = await fetch(`${API_URL}/workouts`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create workout');
        }

        return await response.json();
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(error.errors[0].message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};
