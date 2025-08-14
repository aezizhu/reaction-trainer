import { useState } from 'react';
import { loadPrefs, savePrefs, Prefs } from '@/utils/prefs';

export default function Settings() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs());
  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch } as Prefs;
    setPrefs(next);
    savePrefs(next);
  };

  const updateNested = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    update({ [key]: value } as Partial<Prefs>);
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 12 }}>
        <div className="title">设置</div>
        <div className="row">
          <Field label="声效">
            <input type="checkbox" checked={prefs.soundEnabled} onChange={e => update({ soundEnabled: e.target.checked })} />
          </Field>
          <Field label="震动">
            <input type="checkbox" checked={prefs.vibrateEnabled} onChange={e => update({ vibrateEnabled: e.target.checked })} />
          </Field>
        </div>

        <Group title="反应时 Reaction">
          <NumberField label="最小延迟(ms)" value={prefs.reaction.minDelayMs} onChange={v => updateNested('reaction', { ...prefs.reaction, minDelayMs: v })} />
          <NumberField label="最大延迟(ms)" value={prefs.reaction.maxDelayMs} onChange={v => updateNested('reaction', { ...prefs.reaction, maxDelayMs: v })} />
        </Group>

        <Group title="点靶 Aim">
          <NumberField label="目标半径(px)" value={prefs.aim.radius} onChange={v => updateNested('aim', { ...prefs.aim, radius: v })} />
          <NumberField label="生成间隔最小(ms)" value={prefs.aim.spawnMinMs} onChange={v => updateNested('aim', { ...prefs.aim, spawnMinMs: v })} />
          <NumberField label="生成间隔最大(ms)" value={prefs.aim.spawnMaxMs} onChange={v => updateNested('aim', { ...prefs.aim, spawnMaxMs: v })} />
          <NumberField label="持续时间(s)" value={prefs.aim.durationSec} onChange={v => updateNested('aim', { ...prefs.aim, durationSec: v })} />
          <NumberField label="目标生存(ms)" value={prefs.aim.targetLifeMs} onChange={v => updateNested('aim', { ...prefs.aim, targetLifeMs: v })} />
        </Group>

        <Group title="序列记忆 Sequence">
          <NumberField label="点亮时长(ms)" value={prefs.sequence.showMs} onChange={v => updateNested('sequence', { ...prefs.sequence, showMs: v })} />
          <NumberField label="间隔时长(ms)" value={prefs.sequence.gapMs} onChange={v => updateNested('sequence', { ...prefs.sequence, gapMs: v })} />
        </Group>

        <Group title="Go/No-Go">
          <NumberField label="试次数" value={prefs.gng.trials} onChange={v => updateNested('gng', { ...prefs.gng, trials: v })} />
          <NumberField label="Go比例(0-1)" step={0.05} value={prefs.gng.goRatio} onChange={v => updateNested('gng', { ...prefs.gng, goRatio: v })} />
          <NumberField label="ISI(ms)" value={prefs.gng.isiMs} onChange={v => updateNested('gng', { ...prefs.gng, isiMs: v })} />
        </Group>

        <Group title="Stroop">
          <NumberField label="总题数" value={prefs.stroop.total} onChange={v => updateNested('stroop', { ...prefs.stroop, total: v })} />
          <NumberField label="不一致比例(0-1)" step={0.05} value={prefs.stroop.incongruentRatio} onChange={v => updateNested('stroop', { ...prefs.stroop, incongruentRatio: v })} />
        </Group>

        <Group title="Tap Speed">
          <NumberField label="时长(s)" value={prefs.taps.seconds} onChange={v => updateNested('taps', { ...prefs.taps, seconds: v })} />
        </Group>

        <Group title="Posner">
          <NumberField label="试次数" value={prefs.posner.trials} onChange={v => updateNested('posner', { ...prefs.posner, trials: v })} />
          <NumberField label="有效比例(0-1)" step={0.05} value={prefs.posner.validRatio} onChange={v => updateNested('posner', { ...prefs.posner, validRatio: v })} />
          <NumberField label="ISI(ms)" value={prefs.posner.isiMs} onChange={v => updateNested('posner', { ...prefs.posner, isiMs: v })} />
        </Group>

        <div className="muted" style={{ fontSize: 12 }}>设置会自动保存到本地浏览器。</div>
      </section>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card panel" style={{ display: 'grid', gap: 10 }}>
      <div style={{ fontWeight: 800 }}>{title}</div>
      <div className="row">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="card panel col" style={{ display: 'grid', gap: 6 }}>
      <span className="muted" style={{ fontSize: 12 }}>{label}</span>
      <div>{children}</div>
    </label>
  );
}

function NumberField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="card panel col" style={{ display: 'grid', gap: 6 }}>
      <span className="muted" style={{ fontSize: 12 }}>{label}</span>
      <input type="number" value={value} step={step} onChange={e => onChange(Number(e.target.value))} className="card" style={{ padding: 10 }} />
    </label>
  );
}


