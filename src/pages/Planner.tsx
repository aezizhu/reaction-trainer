import { useMemo, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';

type PlanItem = { id: string; title: string; path: string; targetPerDay: number };

const DEFAULT_PLAN: PlanItem[] = [
  { id: 'p1', title: 'Reaction x3', path: '/reaction', targetPerDay: 3 },
  { id: 'p2', title: 'Aim x2', path: '/aim', targetPerDay: 2 },
  { id: 'p3', title: 'Go/No-Go x2', path: '/gng', targetPerDay: 2 },
];

export default function Planner() {
  const { records } = useHistory();
  const [plan, setPlan] = useState<PlanItem[]>(loadPlan());

  const todayDone = useMemo(() => countToday(records), [records]);

  const updateTarget = (id: string, v: number) => {
    const next = plan.map(p => p.id === id ? { ...p, targetPerDay: v } : p);
    setPlan(next); savePlan(next);
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 10 }}>
        <div className="title">Planner</div>
        <div className="grid">
          {plan.map(p => (
            <div key={p.id} className="card panel" style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <span className="badge">{todayDone[p.title] || 0}/{p.targetPerDay}</span>
              </div>
              <label className="muted" style={{ fontSize: 12 }}>Daily Target</label>
              <input type="number" value={p.targetPerDay} onChange={e => updateTarget(p.id, Number(e.target.value))} className="card" style={{ padding: 8 }} />
              <a className="btn" href={p.path}>Open</a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function countToday(records: any[]) {
  const today = new Date().toDateString();
  const map: Record<string, number> = {};
  for (const r of records) {
    if (new Date(r.dateIso).toDateString() !== today) continue;
    const key = r.game;
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}

const PLAN_KEY = 'reaction_trainer_plan_v1';
function loadPlan(): PlanItem[] {
  try { return JSON.parse(localStorage.getItem(PLAN_KEY) || '[]') || DEFAULT_PLAN; } catch { return DEFAULT_PLAN; }
}
function savePlan(p: PlanItem[]) { localStorage.setItem(PLAN_KEY, JSON.stringify(p)); }


