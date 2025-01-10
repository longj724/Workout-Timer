// External Dependencies
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

// Internal Dependencies
import {
  CompletedWorkout,
  GetCompletedWorkoutInput,
  getCompletedWorkoutsSchema,
} from '../lib/types';

const API_URL = 'http://localhost:9999';

export const useGetCompletedWorkouts = (
  workoutData: GetCompletedWorkoutInput
) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [
      'workout-history',
      workoutData.startDate.toLocaleDateString(),
      workoutData.endDate.toLocaleDateString(),
    ],
    queryFn: async (): Promise<CompletedWorkout[]> => {
      const validatedData = getCompletedWorkoutsSchema.parse(workoutData);

      const response = await fetch(
        `${API_URL}/workouts/completed/?startDate=${validatedData.startDate.toLocaleDateString()}&endDate=${validatedData.endDate.toLocaleDateString()}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch workout between dates');
      }

      const data = await response.json();
      // Should parse the data with zod
      return data;
    },
  });
};
