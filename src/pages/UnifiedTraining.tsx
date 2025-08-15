import { useCallback, useMemo, useState } from 'react';
import ReactionTime from '@/games/ReactionTime';
import AimTrainer from '@/games/AimTrainer';
import SequenceMemory from '@/games/SequenceMemory';
import GoNoGo from '@/games/GoNoGo';
import Stroop from '@/games/Stroop';
import TapSpeed from '@/games/TapSpeed';
import PosnerCue from '@/games/PosnerCue';
import StopSignal from '@/games/StopSignal';
import ChoiceRT from '@/games/ChoiceRT';
import { useHistory } from '@/contexts/HistoryContext';
import MiniBars from '@/components/MiniBars';
import { useI18n } from '@/contexts/I18nContext';

type Step = { key: string; title: string; render: (onFinish: () => void) => JSX.Element };

export default function UnifiedTraining() {
  const [stepIndex, setStepIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const { records } = useHistory();
  const { t } = useI18n();
  const steps: Step[] = useMemo(() => [
    { key: 'reaction', title: `${t('game.reaction')} Warmup`, render: (done) => <ReactionTime autoMode targetAttempts={8} onFinish={done} /> },
    { key: 'aim', title: `${t('game.aim')}`, render: (done) => <AimTrainer autoMode onFinish={done} /> },
    { key: 'sequence', title: `${t('game.sequence')}`, render: (done) => <SequenceMemory autoMode onFinish={done} /> },
    { key: 'crt', title: `${t('game.crt')}`, render: (done) => <ChoiceRT autoMode trials={24} onFinish={done} /> },
    { key: 'stroop', title: 'Stroop', render: (done) => <Stroop autoMode onFinish={done} /> },
    { key: 'gng', title: 'Go/No-Go', render: (done) => <GoNoGo autoMode onFinish={done} /> },
    { key: 'posner', title: 'Posner Cue', render: (done) => <PosnerCue autoMode onFinish={done} /> },
    { key: 'sst', title: 'Stop-Signal', render: (done) => <StopSignal autoMode onFinish={done} /> },
    { key: 'taps', title: `${t('game.taps')}`, render: (done) => <TapSpeed autoMode attempts={3} onFinish={done} /> },
  ], []);

  const next = useCallback(() => setStepIndex(i => Math.min(i + 1, steps.length - 1)), [steps.length]);

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">Automated Training</div>
        <div className="muted" style={{ fontSize: 14 }}>The system runs a curated sequence. It auto-starts and saves each game; focus on performing.</div>
        {stepIndex < steps.length ? (
          <>
            <div className="card panel" style={{ display: 'grid', gap: 8 }}>
              <div className="muted" style={{ fontSize: 12 }}>{t('ui.step')} {stepIndex + 1} {t('ui.of')} {steps.length}: {steps[stepIndex].title}</div>
              <div key={`${runId}-${steps[stepIndex].key}`}>
                {steps[stepIndex].render(next)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn secondary" onClick={() => setStepIndex(i => Math.max(0, i - 1))}>{t('ui.previous')}</button>
                <button className="btn secondary" onClick={() => { setStepIndex(0); setRunId(id => id + 1); }}>{t('ui.restartRound')}</button>
              </div>
              <button className="btn" onClick={() => setStepIndex(i => Math.min(steps.length, i + 1))}>{t('ui.skipNext')}</button>
            </div>
          </>
        ) : (
          <Summary records={records} onRestart={() => setStepIndex(0)} />
        )}
      </section>
    </div>
  );
}

function Summary({ records, onRestart }: { records: any[]; onRestart: () => void }) {
  // 最近一次训练周期的最后N条，以各训练类型的最后记录为“本次”，对比近7天平均
  const lastByGame: Record<string, any> = {};
  for (const r of records) if (!(r.game in lastByGame)) lastByGame[r.game] = r;
  const last7d = records.filter(r => Date.now() - new Date(r.dateIso).getTime() <= 7*24*3600*1000);
  const avg = (arr: number[]) => arr.length ? arr.reduce((s,x)=>s+x,0)/arr.length : 0;
  const rtAvg7 = avg(last7d.filter(r=>r.reaction).map(r=>r.reaction.averageMs));
  const aimAvg7 = avg(last7d.filter(r=>r.aim).map(r=>r.aim.hits));
  const tapsAvg7 = avg(last7d.filter(r=>r.taps).map(r=>r.taps.taps));

  return (
    <div className="card panel" style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontWeight: 800 }}>{useI18n().t('ui.summary')}</div>
      <div className="grid">
        {lastByGame.reaction && (
          <div className="card panel">
            <div className="muted" style={{ fontSize: 12 }}>Reaction (lower is better)</div>
            <MiniBars current={Math.round(lastByGame.reaction.reaction.averageMs)} avg={Math.round(rtAvg7)} labels={["Current (ms)", "7d avg (ms)"] as any} />
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>指标</th><th className="num">数值</th></tr></thead>
              <tbody>
                <tr><td>本次平均</td><td className="num">{Math.round(lastByGame.reaction.reaction.averageMs)} ms</td></tr>
                <tr><td>本次最佳</td><td className="num">{Math.round(lastByGame.reaction.reaction.bestMs)} ms</td></tr>
                <tr><td>7日均值</td><td className="num">{Math.round(rtAvg7)} ms</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {lastByGame.aim && (
          <div className="card panel">
            <div className="muted" style={{ fontSize: 12 }}>Aim hits (higher is better)</div>
            <MiniBars current={lastByGame.aim.aim.hits} avg={Math.round(aimAvg7)} labels={["Current", "7d avg"] as any} />
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>指标</th><th className="num">数值</th></tr></thead>
              <tbody>
                <tr><td>命中</td><td className="num">{lastByGame.aim.aim.hits}</td></tr>
                <tr><td>准确率</td><td className="num">{Math.round(lastByGame.aim.aim.accuracy)}%</td></tr>
                <tr><td>时长</td><td className="num">{lastByGame.aim.aim.timeSec}s</td></tr>
                <tr><td>7日均命中</td><td className="num">{Math.round(aimAvg7)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {lastByGame.taps && (
          <div className="card panel">
            <div className="muted" style={{ fontSize: 12 }}>Tap speed (higher is better)</div>
            <MiniBars current={lastByGame.taps.taps.taps} avg={Math.round(tapsAvg7)} labels={["Current", "7d avg"] as any} />
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>指标</th><th className="num">数值</th></tr></thead>
              <tbody>
                <tr><td>本次最佳</td><td className="num">{lastByGame.taps.taps.taps}</td></tr>
                <tr><td>本次平均间隔</td><td className="num">{Math.round(lastByGame.taps.taps.avgIntervalMs)} ms</td></tr>
                <tr><td>7日均点击</td><td className="num">{Math.round(tapsAvg7)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {lastByGame.crt && (
          <div className="card panel">
            <div className="muted" style={{ fontSize: 12 }}>Choice Reaction (CRT)</div>
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>指标</th><th className="num">数值</th></tr></thead>
              <tbody>
                <tr><td>平均RT</td><td className="num">{Math.round(lastByGame.crt.crt.avgRtMs)} ms</td></tr>
                <tr><td>准确率</td><td className="num">{Math.round(lastByGame.crt.crt.accuracy)}%</td></tr>
                <tr><td>选项数</td><td className="num">{lastByGame.crt.crt.choices}</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {lastByGame.stroop && (
          <div className="card panel">
            <div className="muted" style={{ fontSize: 12 }}>Stroop</div>
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>指标</th><th className="num">数值</th></tr></thead>
              <tbody>
                <tr><td>一致平均</td><td className="num">{Math.round(lastByGame.stroop.stroop.congruentAvgMs)} ms</td></tr>
                <tr><td>不一致平均</td><td className="num">{Math.round(lastByGame.stroop.stroop.incongruentAvgMs)} ms</td></tr>
                <tr><td>干扰成本</td><td className="num">{Math.round(lastByGame.stroop.stroop.costMs)} ms</td></tr>
                <tr><td>准确率</td><td className="num">{Math.round(lastByGame.stroop.stroop.accuracy)}%</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {lastByGame.gng && (
          <div className="card panel">
            <div className="muted" style={{ fontSize: 12 }}>Go/No-Go</div>
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>指标</th><th className="num">数值</th></tr></thead>
              <tbody>
                <tr><td>Go 正确率</td><td className="num">{Math.round(lastByGame.gng.gng.goAcc)}%</td></tr>
                <tr><td>No-Go 正确率</td><td className="num">{Math.round(lastByGame.gng.gng.nogoAcc)}%</td></tr>
                <tr><td>平均RT</td><td className="num">{Math.round(lastByGame.gng.gng.avgRtMs)} ms</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {lastByGame.posner && (
          <div className="card panel">
            <div className="muted" style={{ fontSize: 12 }}>Posner Cue</div>
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>指标</th><th className="num">数值</th></tr></thead>
              <tbody>
                <tr><td>有效提示平均</td><td className="num">{Math.round(lastByGame.posner.posner.validAvgMs)} ms</td></tr>
                <tr><td>无效提示平均</td><td className="num">{Math.round(lastByGame.posner.posner.invalidAvgMs)} ms</td></tr>
                <tr><td>转换成本</td><td className="num">{Math.round(lastByGame.posner.posner.costMs)} ms</td></tr>
                <tr><td>准确率</td><td className="num">{Math.round(lastByGame.posner.posner.accuracy)}%</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {lastByGame.sst && (
          <div className="card panel">
            <div className="muted" style={{ fontSize: 12 }}>Stop-Signal</div>
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>指标</th><th className="num">数值</th></tr></thead>
              <tbody>
                <tr><td>平均SSD</td><td className="num">{Math.round(lastByGame.sst.sst.avgSsdMs)} ms</td></tr>
                <tr><td>SSRT（估计）</td><td className="num">{Math.round(lastByGame.sst.sst.ssrtMs)} ms</td></tr>
                <tr><td>Stop 成功率</td><td className="num">{Math.round(lastByGame.sst.sst.stopSuccessPct)}%</td></tr>
                <tr><td>Go 准确率</td><td className="num">{Math.round(lastByGame.sst.sst.goAcc)}%</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card panel">
        <div className="muted" style={{ fontSize: 12 }}>Recommendations</div>
        <ul className="muted" style={{ fontSize: 14, display: 'grid', gap: 6 }}>
          <li>Practice daily; prioritize sleep and rest.</li>
          <li>If RT &gt; 7d average, shorten cue interval and reduce distractions next round.</li>
          <li>If aim accuracy below average, increase target size then ramp difficulty.</li>
          <li>For tap speed, try short (3s) sprints and focus on rhythm stability.</li>
        </ul>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn" onClick={onRestart}>Restart</button>
      </div>
    </div>
  );
}


