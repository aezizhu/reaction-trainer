import { useMemo } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { exportJson, exportCsv, importJson } from './_noop';
import Sparkline from '@/components/Sparkline';
import { useI18n } from '@/contexts/I18nContext';

export default function Insights() {
  const { t } = useI18n();
  const { records, clearAll, getStats } = useHistory();
  const stats = useMemo(() => getStats(), [records]);
  const todayCount = useMemo(() => records.filter(r => new Date(r.dateIso).toDateString() === new Date().toDateString()).length, [records]);
  const streakDays = useMemo(() => computeStreak(records.map(r => r.dateIso)), [records]);

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 10 }}>
        <div className="title">{t('insights.title')}</div>
        <div className="row">
          <Tile title={t('insights.sessions7d')} value={stats.last7d.length.toString()} />
          <Tile title={t('insights.doneToday')} value={String(todayCount)} />
          <Tile title={t('insights.streakDays')} value={String(streakDays)} />
          <Tile title="Reaction" value={String(stats.totals.reaction)} />
          <Tile title="Aim" value={String(stats.totals.aim)} />
          <Tile title="Sequence" value={String(stats.totals.sequence)} />
          <Tile title="Go/No-Go" value={String(stats.totals.gng)} />
          <Tile title="Stroop" value={String(stats.totals.stroop)} />
          <Tile title="Tap" value={String(stats.totals.taps)} />
          <Tile title="Posner" value={String(stats.totals.posner)} />
          <Tile title="SST" value={String(stats.totals.sst)} />
          <Tile title="CRT" value={String(stats.totals.crt)} />
        </div>
        <ul style={{ display: 'grid', gap: 8 }}>
          {stats.recommendations.map((r, i) => (
            <li key={i} className="card panel" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
              <span>{r}</span>
              <Sparkline data={records.filter(x => x.game === 'reaction' && x.reaction).slice(0, 12).map(x => x!.reaction!.averageMs)} />
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => exportJson(records)}>{t('insights.exportJson')}</button>
          <button className="btn" onClick={() => exportCsv(records)}>{t('insights.exportCsv')}</button>
          <label className="btn secondary" style={{ cursor: 'pointer' }}>
            {t('insights.importJson')}
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => importJson(e, window.location.reload)} />
          </label>
          <button className="btn secondary" onClick={clearAll}>{t('insights.clear')}</button>
        </div>
      </section>

      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 800 }}>{t('insights.history')}</div>
        <div className="grid">
          {records.map(r => (
            <div key={r.id} className="card panel" style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="badge">{r.game}</span>
                <span className="muted" style={{ fontSize: 12 }}>{new Date(r.dateIso).toLocaleString()}</span>
              </div>
              {r.reaction && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Avg RT: {Math.round(r.reaction.averageMs)} ms, Best: {Math.round(r.reaction.bestMs)} ms
                </div>
              )}
              {r.aim && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Hits: {r.aim.hits}, Accuracy: {Math.round(r.aim.accuracy)}% ({r.aim.timeSec}s)
                </div>
              )}
              {r.sequence && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Level: {r.sequence.level}, Longest: {r.sequence.longest}
                </div>
              )}
              {r.gng && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Go Acc: {Math.round(r.gng.goAcc)}%, No-Go Acc: {Math.round(r.gng.nogoAcc)}%, Avg RT: {Math.round(r.gng.avgRtMs)} ms
                </div>
              )}
              {r.stroop && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Cong: {Math.round(r.stroop.congruentAvgMs)} ms, Incong: {Math.round(r.stroop.incongruentAvgMs)} ms, Cost: {Math.round(r.stroop.costMs)} ms, Acc: {Math.round(r.stroop.accuracy)}%
                </div>
              )}
              {r.taps && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Taps: {r.taps.taps} ({r.taps.seconds}s), Avg Interval: {Math.round(r.taps.avgIntervalMs)} ms
                </div>
              )}
              {r.posner && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Valid: {Math.round(r.posner.validAvgMs)} ms, Invalid: {Math.round(r.posner.invalidAvgMs)} ms, Cost: {Math.round(r.posner.costMs)} ms, Acc: {Math.round(r.posner.accuracy)}%
                </div>
              )}
              {r.sst && (
                <div className="muted" style={{ fontSize: 14 }}>
                  SSD: {Math.round(r.sst.avgSsdMs)} ms, SSRT: {Math.round(r.sst.ssrtMs)} ms, Stop Success: {Math.round(r.sst.stopSuccessPct)}%, Go Acc: {Math.round(r.sst.goAcc)}%
                </div>
              )}
              {r.crt && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Choices: {r.crt.choices}, Avg RT: {Math.round(r.crt.avgRtMs)} ms, Acc: {Math.round(r.crt.accuracy)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 800 }}>Lifestyle tips (general)</div>
        <ul className="muted" style={{ fontSize: 14, display: 'grid', gap: 6 }}>
          <li>Sleep 7–9 hours; maintain regular schedule.</li>
          <li>Exercise ≥150 minutes/week at moderate intensity.</li>
          <li>Balanced nutrition; consider Omega-3 and vitamins.</li>
          <li>Stress management (meditation/breathing/mindfulness).</li>
          <li>Alternate different trainings to avoid habituation.</li>
        </ul>
      </section>
    </div>
  );
}

function Tile({ title, value }: { title: string; value: string }) {
  return (
    <div className="card panel" style={{ flex: 1 }}>
      <div className="muted" style={{ fontSize: 12 }}>{title}</div>
      <div className="metric">{value}</div>
    </div>
  );
}

function computeStreak(dateIsos: string[]): number {
  if (dateIsos.length === 0) return 0;
  const days = new Set(dateIsos.map(d => new Date(d).toDateString()));
  let streak = 0;
  const d = new Date();
  while (true) {
    if (days.has(d.toDateString())) { streak += 1; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}


