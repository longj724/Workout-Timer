import { z } from 'zod';

export type Timer = {
  minutes: number;
  seconds: number;
  order: number;
};

export type Interval = {
  id: string;
  name?: string;
  repetitions: number;
  order: number;
  timers: Timer[];
};

export const createTimerSchema = z.object({
  minutes: z.number().min(0).max(59),
  seconds: z.number().min(0).max(59),
  order: z.number().min(0),
});

export const createIntervalSchema = z.object({
  name: z.string().optional(),
  repetitions: z.number().min(1),
  order: z.number().min(0),
  timers: z.array(createTimerSchema),
});

export const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  userId: z.string(),
  intervals: z.array(createIntervalSchema),
});

export type CreateTimerInput = z.infer<typeof createTimerSchema>;
export type CreateIntervalInput = z.infer<typeof createIntervalSchema>;
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
