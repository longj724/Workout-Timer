// External Dependencies
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Internal Dependencies
import { EditIntervalInput, editIntervalSchema } from '../lib/types';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = 'http://localhost:9999';

export const useEditInterval = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (workout: EditIntervalInput) => {
      try {
        const validatedData = editIntervalSchema.parse(workout);

        const response = await fetch(`${API_URL}/workouts/${workout.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to edit the workout');
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
