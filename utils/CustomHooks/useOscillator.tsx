import { Oscillator } from 'tone';

export function useOscillator(frequency: number) {
  const osc = new Oscillator(frequency, 'sine').toDestination();
  const start = osc.start();
  const stop = osc.stop();
}
