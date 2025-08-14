export type Prefs = {
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  reaction: { minDelayMs: number; maxDelayMs: number; baselineMs?: number };
  aim: { radius: number; spawnMinMs: number; spawnMaxMs: number; durationSec: number; targetLifeMs: number };
  sequence: { showMs: number; gapMs: number };
  gng: { trials: number; goRatio: number; isiMs: number };
  stroop: { total: number; incongruentRatio: number };
  taps: { seconds: number };
  posner: { trials: number; validRatio: number; isiMs: number };
};

const DEFAULT_PREFS: Prefs = {
  soundEnabled: false,
  vibrateEnabled: true,
  reaction: { minDelayMs: 800, maxDelayMs: 2600, baselineMs: undefined },
  aim: { radius: 18, spawnMinMs: 500, spawnMaxMs: 1000, durationSec: 30, targetLifeMs: 1500 },
  sequence: { showMs: 600, gapMs: 250 },
  gng: { trials: 30, goRatio: 0.7, isiMs: 900 },
  stroop: { total: 32, incongruentRatio: 0.5 },
  taps: { seconds: 5 },
  posner: { trials: 36, validRatio: 0.8, isiMs: 400 }
};

const KEY = 'reaction_trainer_prefs_v1';

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const merged = { ...DEFAULT_PREFS, ...JSON.parse(raw) } as Prefs;
    return merged;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: Prefs) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function usePrefs(): [Prefs, (patch: Partial<Prefs>) => void] {
  const [prefs, setPrefs] = useStateSafe(loadPrefs());
  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch } as Prefs;
    setPrefs(next);
    savePrefs(next);
  };
  return [prefs, update];
}

// Small safe-state helper (no SSR here but keep consistent style)
import { useState } from 'react';
function useStateSafe<T>(initial: T) {
  const [v, setV] = useState<T>(initial);
  return [v, setV] as const;
}


