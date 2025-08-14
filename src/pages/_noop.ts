export function saveAs(_: Blob, __: string) { /* no-op in browser runtime; use URL.createObjectURL */ }

export function exportJson(records: any[]) {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'reaction-history.json'; a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(records: any[]) {
  const rows: string[] = [];
  rows.push('id,game,date,metrics');
  for (const r of records) {
    const metrics = JSON.stringify({ reaction: r.reaction, aim: r.aim, sequence: r.sequence, gng: r.gng, stroop: r.stroop, taps: r.taps, posner: r.posner });
    const safe = JSON.stringify(metrics).replace(/"/g, '""');
    rows.push([r.id, r.game, r.dateIso, safe].map(csvCell).join(','));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'reaction-history.csv'; a.click();
  URL.revokeObjectURL(url);
}

export function importJson(e: React.ChangeEvent<HTMLInputElement>, done: () => void) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const arr = JSON.parse(String(reader.result));
      localStorage.setItem('reaction_trainer_history_v1', JSON.stringify(arr));
      done();
    } catch (err) {
      alert('导入失败：JSON格式不正确');
    }
  };
  reader.readAsText(file);
}

function csvCell(v: string) {
  if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}


