export type Timer = {
  minutes: number;
  seconds: number;
};

export interface Interval {
  id: string;
  title: string;
  timers: Timer[];
  repetitions: number;
}
