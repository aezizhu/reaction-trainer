import { useMemo } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { exportJson, exportCsv, importJson } from './_noop';
import Sparkline from '@/components/Sparkline';

export default function Insights() {
  const { records, clearAll, getStats } = useHistory();
  const stats = useMemo(() => getStats(), [records]);
  const todayCount = useMemo(() => records.filter(r => new Date(r.dateIso).toDateString() === new Date().toDateString()).length, [records]);
  const streakDays = useMemo(() => computeStreak(records.map(r => r.dateIso)), [records]);

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 10 }}>
        <div className="title">建议与概览</div>
        <div className="row">
          <Tile title="近7天训练次数" value={stats.last7d.length.toString()} />
          <Tile title="今日完成" value={String(todayCount)} />
          <Tile title="连续天数" value={String(streakDays)} />
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
          <button className="btn" onClick={() => exportJson(records)}>导出JSON</button>
          <button className="btn" onClick={() => exportCsv(records)}>导出CSV</button>
          <label className="btn secondary" style={{ cursor: 'pointer' }}>
            导入JSON
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => importJson(e, window.location.reload)} />
          </label>
          <button className="btn secondary" onClick={clearAll}>清空历史</button>
        </div>
      </section>

      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 800 }}>历史记录</div>
        <div className="grid">
          {records.map(r => (
            <div key={r.id} className="card panel" style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="badge">{r.game}</span>
                <span className="muted" style={{ fontSize: 12 }}>{new Date(r.dateIso).toLocaleString()}</span>
              </div>
              {r.reaction && (
                <div className="muted" style={{ fontSize: 14 }}>
                  平均反应时：{Math.round(r.reaction.averageMs)}ms，最佳：{Math.round(r.reaction.bestMs)}ms
                </div>
              )}
              {r.aim && (
                <div className="muted" style={{ fontSize: 14 }}>
                  命中：{r.aim.hits}，准确率：{Math.round(r.aim.accuracy)}%（{r.aim.timeSec}s）
                </div>
              )}
              {r.sequence && (
                <div className="muted" style={{ fontSize: 14 }}>
                  达到层级：{r.sequence.level}，最长：{r.sequence.longest}
                </div>
              )}
              {r.gng && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Go正确率：{Math.round(r.gng.goAcc)}%，No-Go正确率：{Math.round(r.gng.nogoAcc)}%，平均RT：{Math.round(r.gng.avgRtMs)}ms
                </div>
              )}
              {r.stroop && (
                <div className="muted" style={{ fontSize: 14 }}>
                  Cong：{Math.round(r.stroop.congruentAvgMs)}ms，Incong：{Math.round(r.stroop.incongruentAvgMs)}ms，成本：{Math.round(r.stroop.costMs)}ms，准确率：{Math.round(r.stroop.accuracy)}%
                </div>
              )}
              {r.taps && (
                <div className="muted" style={{ fontSize: 14 }}>
                  点击：{r.taps.taps}（{r.taps.seconds}s），平均间隔：{Math.round(r.taps.avgIntervalMs)}ms
                </div>
              )}
              {r.posner && (
                <div className="muted" style={{ fontSize: 14 }}>
                  有效：{Math.round(r.posner.validAvgMs)}ms，无效：{Math.round(r.posner.invalidAvgMs)}ms，成本：{Math.round(r.posner.costMs)}ms，准确率：{Math.round(r.posner.accuracy)}%
                </div>
              )}
              {r.sst && (
                <div className="muted" style={{ fontSize: 14 }}>
                  SSD：{Math.round(r.sst.avgSsdMs)}ms，SSRT：{Math.round(r.sst.ssrtMs)}ms，Stop成功率：{Math.round(r.sst.stopSuccessPct)}%，Go准确率：{Math.round(r.sst.goAcc)}%
                </div>
              )}
              {r.crt && (
                <div className="muted" style={{ fontSize: 14 }}>
                  选项：{r.crt.choices}，平均RT：{Math.round(r.crt.avgRtMs)}ms，准确率：{Math.round(r.crt.accuracy)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 800 }}>生活方式建议（辅助提升反应力）</div>
        <ul className="muted" style={{ fontSize: 14, display: 'grid', gap: 6 }}>
          <li>充足睡眠（7–9小时），规律作息。</li>
          <li>每周≥150分钟中等强度运动（跑步/骑行/游泳等）。</li>
          <li>营养均衡（Omega-3、维生素B/E、抗氧化食物）。</li>
          <li>压力管理（冥想/呼吸/正念），避免过度疲劳训练。</li>
          <li>交替进行不同训练，避免单一刺激习惯化。</li>
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


