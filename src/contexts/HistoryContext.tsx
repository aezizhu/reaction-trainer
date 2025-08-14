import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export type GameKey = 'reaction' | 'aim' | 'sequence' | 'gng' | 'stroop' | 'taps' | 'posner' | 'sst' | 'crt';

export interface SessionRecord {
  id: string;
  game: GameKey;
  dateIso: string;
  // per-game metrics (sparse)
  // reaction: ms array for hits, best, avg
  reaction?: { attempts: number[]; averageMs: number; bestMs: number };
  // aim: hits per 30s, accuracy
  aim?: { hits: number; accuracy: number; timeSec: number };
  // sequence: level reached, longest
  sequence?: { level: number; longest: number };
  // go/no-go: correct go%, correct nogo%, avg rt
  gng?: { goAcc: number; nogoAcc: number; avgRtMs: number };
  // stroop: congruent vs incongruent
  stroop?: { congruentAvgMs: number; incongruentAvgMs: number; accuracy: number; costMs: number };
  // tapspeed: finger tapping
  taps?: { taps: number; seconds: number; avgIntervalMs: number };
  // posner cueing: attention shift cost
  posner?: { validAvgMs: number; invalidAvgMs: number; costMs: number; accuracy: number };
  // stop-signal task
  sst?: { avgSsdMs: number; ssrtMs: number; stopSuccessPct: number; goAcc: number };
  // choice reaction time (4-choice)
  crt?: { choices: number; avgRtMs: number; accuracy: number };
}

interface HistoryContextValue {
  records: SessionRecord[];
  addRecord: (record: SessionRecord) => void;
  clearAll: () => void;
  getStats: () => {
    totals: Record<GameKey, number>;
    last7d: SessionRecord[];
    recommendations: string[];
  };
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

const STORAGE_KEY = 'reaction_trainer_history_v1';

export const HistoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [records, setRecords] = useState<SessionRecord[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) as SessionRecord[]; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const addRecord = (record: SessionRecord) => {
    setRecords(prev => [record, ...prev].slice(0, 1000));
  };

  const clearAll = () => setRecords([]);

  const getStats = useMemo(() => () => {
    const now = Date.now();
    const last7d = records.filter(r => now - new Date(r.dateIso).getTime() <= 7 * 24 * 3600 * 1000);

    const totals: Record<GameKey, number> = { reaction: 0, aim: 0, sequence: 0, gng: 0, stroop: 0, taps: 0, posner: 0, sst: 0, crt: 0 };
    for (const r of records) totals[r.game] += 1;

    const recs: string[] = [];
    // Basic adaptive tips (English only; can be localized later)
    const recentReaction = last7d.filter(r => r.game === 'reaction' && r.reaction);
    if (recentReaction.length >= 3) {
      const avg = recentReaction.reduce((s, r) => s + (r.reaction!.averageMs || 0), 0) / recentReaction.length;
      if (avg > 300) recs.push('Reaction time average is high; add more forewarning interference and keep fingers ready.');
      else recs.push('Good reaction time. Try shorter cue intervals or higher randomness.');
    }

    const recentAim = last7d.filter(r => r.game === 'aim' && r.aim);
    if (recentAim.length >= 2) {
      const acc = recentAim.reduce((s, r) => s + r.aim!.accuracy, 0) / recentAim.length;
      if (acc < 75) recs.push('Aim accuracy is low; consider larger targets or longer visibility, then ramp up.');
      else recs.push('Aim accuracy is solid; try smaller targets or more concurrent targets.');
    }

    const recentSeq = last7d.filter(r => r.game === 'sequence' && r.sequence);
    if (recentSeq.length >= 2) {
      const lvl = Math.max(...recentSeq.map(r => r.sequence!.level));
      if (lvl < 6) recs.push('Sequence level is modest; try chunking with a metronome.');
      else recs.push('Sequence memory is good; add auditory distractors or speed up pacing.');
    }

    const recentGng = last7d.filter(r => r.game === 'gng' && r.gng);
    if (recentGng.length >= 2) {
      const nogo = recentGng.reduce((s, r) => s + r.gng!.nogoAcc, 0) / recentGng.length;
      if (nogo < 85) recs.push('Inhibition errors are frequent; lengthen NO-GO display or lower GO ratio.');
      else recs.push('Inhibition is good; try higher GO ratio or shorter ISI.');
    }

    const recentStroop = last7d.filter(r => r.game === 'stroop' && r.stroop);
    if (recentStroop.length >= 2) {
      const avgCost = recentStroop.reduce((s, r) => s + (r.stroop!.costMs || 0), 0) / recentStroop.length;
      if (avgCost > 120) recs.push('Stroop interference cost is high; focus on color dimension first and reduce incongruent ratio.');
      else recs.push('Stroop performance is stable; increase incongruent ratio or reduce presentation time.');
    }

    const recentTaps = last7d.filter(r => r.game === 'taps' && r.taps);
    if (recentTaps.length >= 2) {
      const avgTapsPerSec = recentTaps.reduce((s, r) => s + r.taps!.taps / r.taps!.seconds, 0) / recentTaps.length;
      if (avgTapsPerSec < 6) recs.push('Tap frequency is low; try short high-rate bursts and keep the wrist relaxed.');
      else recs.push('Tap speed is good; try shorter windows for peak bursts.');
    }

    const recentPosner = last7d.filter(r => r.game === 'posner' && r.posner);
    if (recentPosner.length >= 2) {
      const avgCost = recentPosner.reduce((s, r) => s + (r.posner!.costMs || 0), 0) / recentPosner.length;
      if (avgCost > 60) recs.push('Attentional shift cost is high; increase valid cue ratio first, then add invalid cues.');
      else recs.push('Attentional shifting is good; shorten ISI or raise invalid cue ratio.');
    }

    const recentSst = last7d.filter(r => r.game === 'sst' && r.sst);
    if (recentSst.length >= 2) {
      const ssrt = recentSst.reduce((s, r) => s + (r.sst!.ssrtMs || 0), 0) / recentSst.length;
      if (ssrt > 250) recs.push('SSRT is long; lower initial SSD and use smaller steps, then ramp difficulty.');
      else recs.push('Inhibitory control is good; increase stop ratio or enlarge SSD step.');
    }

    const recentCrt = last7d.filter(r => r.game === 'crt' && r.crt);
    if (recentCrt.length >= 2) {
      const avgRt = recentCrt.reduce((s, r) => s + (r.crt!.avgRtMs || 0), 0) / recentCrt.length;
      const acc = recentCrt.reduce((s, r) => s + (r.crt!.accuracy || 0), 0) / recentCrt.length;
      if (acc < 90) recs.push('CRT accuracy is low; reduce concurrent interference or options then increase gradually.');
      else recs.push(`CRT is stable, avg RT ≈ ${Math.round(avgRt)} ms; try incompatible mappings for challenge.`);
    }

    if (recs.length === 0) recs.push('Start training! Complete 3+ sessions to unlock personalized insights.');

    return { totals, last7d, recommendations: recs };
  }, [records]);

  const value: HistoryContextValue = { records, addRecord, clearAll, getStats };
  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
};


