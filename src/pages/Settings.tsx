import { useState } from 'react';
import { loadPrefs, savePrefs, Prefs } from '@/utils/prefs';
import { useI18n } from '@/contexts/I18nContext';

export default function Settings() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs());
  const { t } = useI18n();
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
        <div className="title">{t('settings.title')}</div>
        <div className="row">
          <Field label={t('settings.sound')}>
            <input type="checkbox" checked={prefs.soundEnabled} onChange={e => update({ soundEnabled: e.target.checked })} />
          </Field>
          <Field label={t('settings.vibration')}>
            <input type="checkbox" checked={prefs.vibrateEnabled} onChange={e => update({ vibrateEnabled: e.target.checked })} />
          </Field>
        </div>

        <Group title={t('game.reaction')}>
          <NumberField label={t('settings.reaction.minDelay')} value={prefs.reaction.minDelayMs} onChange={v => updateNested('reaction', { ...prefs.reaction, minDelayMs: v })} />
          <NumberField label={t('settings.reaction.maxDelay')} value={prefs.reaction.maxDelayMs} onChange={v => updateNested('reaction', { ...prefs.reaction, maxDelayMs: v })} />
        </Group>

        <Group title={t('game.aim')}>
          <NumberField label={t('settings.aim.radius')} value={prefs.aim.radius} onChange={v => updateNested('aim', { ...prefs.aim, radius: v })} />
          <NumberField label={t('settings.aim.spawnMin')} value={prefs.aim.spawnMinMs} onChange={v => updateNested('aim', { ...prefs.aim, spawnMinMs: v })} />
          <NumberField label={t('settings.aim.spawnMax')} value={prefs.aim.spawnMaxMs} onChange={v => updateNested('aim', { ...prefs.aim, spawnMaxMs: v })} />
          <NumberField label={t('settings.aim.duration')} value={prefs.aim.durationSec} onChange={v => updateNested('aim', { ...prefs.aim, durationSec: v })} />
          <NumberField label={t('settings.aim.targetLifetime')} value={prefs.aim.targetLifeMs} onChange={v => updateNested('aim', { ...prefs.aim, targetLifeMs: v })} />
        </Group>

        <Group title={t('game.sequence')}>
          <NumberField label={t('settings.sequence.show')} value={prefs.sequence.showMs} onChange={v => updateNested('sequence', { ...prefs.sequence, showMs: v })} />
          <NumberField label={t('settings.sequence.gap')} value={prefs.sequence.gapMs} onChange={v => updateNested('sequence', { ...prefs.sequence, gapMs: v })} />
        </Group>

        <Group title={t('game.gng')}>
          <NumberField label={t('settings.gng.trials')} value={prefs.gng.trials} onChange={v => updateNested('gng', { ...prefs.gng, trials: v })} />
          <NumberField label={t('settings.gng.goRatio')} step={0.05} value={prefs.gng.goRatio} onChange={v => updateNested('gng', { ...prefs.gng, goRatio: v })} />
          <NumberField label={t('settings.gng.isi')} value={prefs.gng.isiMs} onChange={v => updateNested('gng', { ...prefs.gng, isiMs: v })} />
        </Group>

        <Group title={t('game.stroop')}>
          <NumberField label={t('settings.stroop.total')} value={prefs.stroop.total} onChange={v => updateNested('stroop', { ...prefs.stroop, total: v })} />
          <NumberField label={t('settings.stroop.incongruentRatio')} step={0.05} value={prefs.stroop.incongruentRatio} onChange={v => updateNested('stroop', { ...prefs.stroop, incongruentRatio: v })} />
        </Group>

        <Group title={t('game.taps')}>
          <NumberField label={t('settings.taps.duration')} value={prefs.taps.seconds} onChange={v => updateNested('taps', { ...prefs.taps, seconds: v })} />
        </Group>

        <Group title={t('game.posner')}>
          <NumberField label={t('settings.posner.trials')} value={prefs.posner.trials} onChange={v => updateNested('posner', { ...prefs.posner, trials: v })} />
          <NumberField label={t('settings.posner.validRatio')} step={0.05} value={prefs.posner.validRatio} onChange={v => updateNested('posner', { ...prefs.posner, validRatio: v })} />
          <NumberField label={t('settings.posner.isi')} value={prefs.posner.isiMs} onChange={v => updateNested('posner', { ...prefs.posner, isiMs: v })} />
        </Group>

        <div className="muted" style={{ fontSize: 12 }}>{t('settings.autoSave')}</div>
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


