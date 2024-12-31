import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { CreateWorkoutInput, createWorkoutSchema } from '../lib/types';

const API_URL = 'http://localhost:9999';

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workout: CreateWorkoutInput) => {
      try {
        const validatedData = createWorkoutSchema.parse(workout);

        const response = await fetch(`${API_URL}/workouts`, {
          method: 'POST',
          headers: {
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
