// External Dependencies
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

export const editIntervalSchema = createIntervalSchema.extend({
  id: z.string(),
});

export const completeWorkoutSchema = z.object({
  workoutId: z.string().optional(),
  userId: z.string(),
  dateCompleted: z.date(),
  duration_hours: z.number().min(0),
  duration_minutes: z.number().min(0),
  duration_seconds: z.number().min(0),
});

export const getCompletedWorkoutsSchema = z
  .object({
    userId: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date cannot be earlier than start date.',
    path: ['endDate'],
  });

export type CreateTimerInput = z.infer<typeof createTimerSchema>;
export type CreateIntervalInput = z.infer<typeof createIntervalSchema>;
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type EditIntervalInput = z.infer<typeof editIntervalSchema>;
export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>;
export type GetCompletedWorkoutInput = {
  userId: string;
  startDate: Date;
  endDate: Date;
};

export const timerWithMetadataSchema = z.object({
  id: z.string(),
  intervalId: z.string(),
  minutes: z.number().min(0).max(59),
  seconds: z.number().min(0).max(59),
  order: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const intervalWithMetadataSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  repetitions: z.number().min(1),
  order: z.number().min(0),
  workoutId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  timers: z.array(timerWithMetadataSchema),
});

export const workoutWithRelationsSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  intervals: z.array(intervalWithMetadataSchema),
});

export type WorkoutWithRelations = z.infer<typeof workoutWithRelationsSchema>;
export type WorkoutsList = WorkoutWithRelations[];

export type SoundType = 'none' | 'voice' | 'beeps';

export type Settings = {
  countdownSoundType: SoundType;
  countdownSoundSeconds: number;
  announceIntervalName: boolean;
  announceTimeAtTimerStart: boolean;
  selectedVoiceIdentifier: string;
};

export type CompletedWorkout = {
  id: string;
  workoutId?: string;
  userId: string;
  dateCompleted: string;
  duration_hours: number;
  duration_minutes: number;
  duration_seconds: number;
};
