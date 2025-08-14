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
    // Basic adaptive tips
    const recentReaction = last7d.filter(r => r.game === 'reaction' && r.reaction);
    if (recentReaction.length >= 3) {
      const avg = recentReaction.reduce((s, r) => s + (r.reaction!.averageMs || 0), 0) / recentReaction.length;
      if (avg > 300) recs.push('反应时均值偏高，建议加入更多“预备信号干扰”的训练，并保持手指放在触控区。');
      else recs.push('反应时表现不错，尝试减少提示间隔或提高随机性。');
    }

    const recentAim = last7d.filter(r => r.game === 'aim' && r.aim);
    if (recentAim.length >= 2) {
      const acc = recentAim.reduce((s, r) => s + r.aim!.accuracy, 0) / recentAim.length;
      if (acc < 75) recs.push('点靶命中率较低，建议降低目标尺寸或延长显示时间进行分步训练。');
      else recs.push('命中率良好，尝试缩小目标半径或增加并发目标数量。');
    }

    const recentSeq = last7d.filter(r => r.game === 'sequence' && r.sequence);
    if (recentSeq.length >= 2) {
      const lvl = Math.max(...recentSeq.map(r => r.sequence!.level));
      if (lvl < 6) recs.push('序列记忆层级不高，可采用“分段复述 + 节拍器”策略提升。');
      else recs.push('序列记忆不错，尝试增加干扰音或加快节奏。');
    }

    const recentGng = last7d.filter(r => r.game === 'gng' && r.gng);
    if (recentGng.length >= 2) {
      const nogo = recentGng.reduce((s, r) => s + r.gng!.nogoAcc, 0) / recentGng.length;
      if (nogo < 85) recs.push('抑制错误较多，建议延长No-Go刺激显示时长或降低Go比例。');
      else recs.push('抑制控制良好，尝试提高Go:No-Go比或缩短ISI。');
    }

    const recentStroop = last7d.filter(r => r.game === 'stroop' && r.stroop);
    if (recentStroop.length >= 2) {
      const avgCost = recentStroop.reduce((s, r) => s + (r.stroop!.costMs || 0), 0) / recentStroop.length;
      if (avgCost > 120) recs.push('Stroop 干扰成本较高，建议先专注于颜色维度，降低不一致比例再逐步提高。');
      else recs.push('Stroop 表现稳定，可提高不一致比例或缩短呈现时间。');
    }

    const recentTaps = last7d.filter(r => r.game === 'taps' && r.taps);
    if (recentTaps.length >= 2) {
      const avgTapsPerSec = recentTaps.reduce((s, r) => s + r.taps!.taps / r.taps!.seconds, 0) / recentTaps.length;
      if (avgTapsPerSec < 6) recs.push('手指敲击频率偏低，建议进行短时高频点按训练，并注意放松手腕以减少疲劳。');
      else recs.push('敲击速度不错，可尝试更短时间窗口下的极限训练。');
    }

    const recentPosner = last7d.filter(r => r.game === 'posner' && r.posner);
    if (recentPosner.length >= 2) {
      const avgCost = recentPosner.reduce((s, r) => s + (r.posner!.costMs || 0), 0) / recentPosner.length;
      if (avgCost > 60) recs.push('注意转换成本较高，建议先提高有效提示比例，逐步引入无效提示。');
      else recs.push('注意转换良好，可缩短ISI或提高无效提示比例。');
    }

    const recentSst = last7d.filter(r => r.game === 'sst' && r.sst);
    if (recentSst.length >= 2) {
      const ssrt = recentSst.reduce((s, r) => s + (r.sst!.ssrtMs || 0), 0) / recentSst.length;
      if (ssrt > 250) recs.push('抑制时间（SSRT）偏长，建议降低初始SSD并采用小步进自适应，逐步提升难度。');
      else recs.push('抑制反应良好，可尝试增加Stop比例或扩大SSD步进。');
    }

    const recentCrt = last7d.filter(r => r.game === 'crt' && r.crt);
    if (recentCrt.length >= 2) {
      const avgRt = recentCrt.reduce((s, r) => s + (r.crt!.avgRtMs || 0), 0) / recentCrt.length;
      const acc = recentCrt.reduce((s, r) => s + (r.crt!.accuracy || 0), 0) / recentCrt.length;
      if (acc < 90) recs.push('多选反应准确率偏低，建议降低并发干扰或减少选项数量后再逐步增加。');
      else recs.push(`多选反应稳定，平均RT≈${Math.round(avgRt)}ms，可加入不兼容映射提高挑战。`);
    }

    if (recs.length === 0) recs.push('开始训练吧！完成任意3轮后将生成个性化建议。');

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


