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
          <Tile title={t('game.reaction')} value={String(stats.totals.reaction)} />
          <Tile title={t('game.aim')} value={String(stats.totals.aim)} />
          <Tile title={t('game.sequence')} value={String(stats.totals.sequence)} />
          <Tile title={t('game.gng')} value={String(stats.totals.gng)} />
          <Tile title={t('game.stroop')} value={String(stats.totals.stroop)} />
          <Tile title={t('game.taps')} value={String(stats.totals.taps)} />
          <Tile title={t('game.posner')} value={String(stats.totals.posner)} />
          <Tile title={t('game.sst')} value={String(stats.totals.sst)} />
          <Tile title={t('game.crt')} value={String(stats.totals.crt)} />
        </div>
        <ul style={{ display: 'grid', gap: 8 }}>
          {stats.recommendations.map((r, i) => {
            const [key, ...vars] = r.split(':');
            const text = t(key, vars.length > 0 ? { rt: vars[0] } : {});
            return (
              <li key={i} className="card panel" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                <span>{text}</span>
                <Sparkline data={records.filter(x => x.game === 'reaction' && x.reaction).slice(0, 12).map(x => x!.reaction!.averageMs)} />
              </li>
            );
          })}
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
                  {t('history.avgRt')}: {Math.round(r.reaction.averageMs)} ms, {t('history.best')}: {Math.round(r.reaction.bestMs)} ms
                </div>
              )}
              {r.aim && (
                <div className="muted" style={{ fontSize: 14 }}>
                  {t('history.hits')}: {r.aim.hits}, {t('history.accuracy')}: {Math.round(r.aim.accuracy)}% ({r.aim.timeSec}{t('history.seconds')})
                </div>
              )}
              {r.sequence && (
                <div className="muted" style={{ fontSize: 14 }}>
                  {t('history.level')}: {r.sequence.level}, {t('history.longest')}: {r.sequence.longest}
                </div>
              )}
              {r.gng && (
                <div className="muted" style={{ fontSize: 14 }}>
                  {t('history.goAcc')}: {Math.round(r.gng.goAcc)}%, {t('history.nogoAcc')}: {Math.round(r.gng.nogoAcc)}%, {t('history.avgRt')}: {Math.round(r.gng.avgRtMs)} ms
                </div>
              )}
              {r.stroop && (
                <div className="muted" style={{ fontSize: 14 }}>
                  {t('history.cong')}: {Math.round(r.stroop.congruentAvgMs)} ms, {t('history.incong')}: {Math.round(r.stroop.incongruentAvgMs)} ms, {t('history.cost')}: {Math.round(r.stroop.costMs)} ms, {t('history.accuracy')}: {Math.round(r.stroop.accuracy)}%
                </div>
              )}
              {r.taps && (
                <div className="muted" style={{ fontSize: 14 }}>
                  {t('history.taps')}: {r.taps.taps} ({r.taps.seconds}{t('history.seconds')}), {t('history.avgInterval')}: {Math.round(r.taps.avgIntervalMs)} ms
                </div>
              )}
              {r.posner && (
                <div className="muted" style={{ fontSize: 14 }}>
                  {t('history.valid')}: {Math.round(r.posner.validAvgMs)} ms, {t('history.invalid')}: {Math.round(r.posner.invalidAvgMs)} ms, {t('history.cost')}: {Math.round(r.posner.costMs)} ms, {t('history.accuracy')}: {Math.round(r.posner.accuracy)}%
                </div>
              )}
              {r.sst && (
                <div className="muted" style={{ fontSize: 14 }}>
                  {t('history.ssd')}: {Math.round(r.sst.avgSsdMs)} ms, {t('history.ssrt')}: {Math.round(r.sst.ssrtMs)} ms, {t('history.stopSuccess')}: {Math.round(r.sst.stopSuccessPct)}%, {t('history.goAcc')}: {Math.round(r.sst.goAcc)}%
                </div>
              )}
              {r.crt && (
                <div className="muted" style={{ fontSize: 14 }}>
                  {t('history.choices')}: {r.crt.choices}, {t('history.avgRt')}: {Math.round(r.crt.avgRtMs)} ms, {t('history.accuracy')}: {Math.round(r.crt.accuracy)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 800 }}>{t('insights.lifestyleTips')}</div>
        <ul className="muted" style={{ fontSize: 14, display: 'grid', gap: 6 }}>
          <li>{t('insights.lifestyle1')}</li>
          <li>{t('insights.lifestyle2')}</li>
          <li>{t('insights.lifestyle3')}</li>
          <li>{t('insights.lifestyle4')}</li>
          <li>{t('insights.lifestyle5')}</li>
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


