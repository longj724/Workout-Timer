import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
// import { ENV } from 'expo-env';

// Define the workout schema using zod
const WorkoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  user_id: z.string(),
});

const WorkoutsResponseSchema = z.array(WorkoutSchema);

const API_URL = 'http://localhost:9999';

type Workout = z.infer<typeof WorkoutSchema>;

const fetchWorkouts = async (): Promise<Workout[]> => {
  const response = await fetch(`${API_URL}/workouts`);
  const data = await response.json();
  return WorkoutsResponseSchema.parse(data);
};

export const useGetWorkouts = () => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts,
  });
};

export type { Workout };
