// External Dependencies
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuth } from '@clerk/clerk-expo';

// Internal Dependencies

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (workoutId: string) => {
      try {
        const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete workout');
        }

        return { success: true };
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
