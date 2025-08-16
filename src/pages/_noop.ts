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
  
  // 添加BOM以确保Excel正确识别UTF-8编码
  const bom = '\uFEFF';
  
  // 创建详细的列标题
  const headers = [
    'ID',
    'Game',
    'Date',
    'Time',
    'Reaction_AvgRT_ms',
    'Reaction_BestRT_ms',
    'Reaction_Accuracy_percent',
    'Aim_Hits',
    'Aim_Accuracy_percent',
    'Aim_Duration_seconds',
    'Sequence_Level',
    'Sequence_Longest',
    'GoNoGo_GoAccuracy_percent',
    'GoNoGo_NoGoAccuracy_percent',
    'GoNoGo_AvgRT_ms',
    'Stroop_CongruentAvg_ms',
    'Stroop_IncongruentAvg_ms',
    'Stroop_InterferenceCost_ms',
    'Stroop_Accuracy_percent',
    'Taps_Count',
    'Taps_Duration_seconds',
    'Taps_AvgInterval_ms',
    'Posner_ValidAvg_ms',
    'Posner_InvalidAvg_ms',
    'Posner_SwitchCost_ms',
    'Posner_Accuracy_percent',
    'StopSignal_AvgSSD_ms',
    'StopSignal_SSRT_ms',
    'StopSignal_StopSuccess_percent',
    'StopSignal_GoAccuracy_percent',
    'ChoiceRT_Choices',
    'ChoiceRT_AvgRT_ms',
    'ChoiceRT_Accuracy_percent'
  ];
  
  rows.push(bom + headers.join(','));
  
  for (const r of records) {
    const row = [
      r.id,
      r.game,
      formatDate(r.dateIso),
      formatTime(r.dateIso),
      r.reaction?.averageMs || '',
      r.reaction?.bestMs || '',
      r.reaction?.accuracy || '',
      r.aim?.hits || '',
      r.aim?.accuracy || '',
      r.aim?.timeSec || '',
      r.sequence?.level || '',
      r.sequence?.longest || '',
      r.gng?.goAcc || '',
      r.gng?.nogoAcc || '',
      r.gng?.avgRtMs || '',
      r.stroop?.congruentAvgMs || '',
      r.stroop?.incongruentAvgMs || '',
      r.stroop?.costMs || '',
      r.stroop?.accuracy || '',
      r.taps?.taps || '',
      r.taps?.seconds || '',
      r.taps?.avgIntervalMs || '',
      r.posner?.validAvgMs || '',
      r.posner?.invalidAvgMs || '',
      r.posner?.costMs || '',
      r.posner?.accuracy || '',
      r.sst?.avgSsdMs || '',
      r.sst?.ssrtMs || '',
      r.sst?.stopSuccessPct || '',
      r.sst?.goAcc || '',
      r.crt?.choices || '',
      r.crt?.avgRtMs || '',
      r.crt?.accuracy || ''
    ];
    
    rows.push(row.map(csvCell).join(','));
  }
  
  const blob = new Blob([rows.join('\n')], { type: 'text/csv; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; 
  a.download = `reaction-training-history-${formatDate(new Date().toISOString())}.csv`; 
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  }); // HH:MM:SS format
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
      alert('Import failed: invalid JSON format');
    }
  };
  reader.readAsText(file);
}

function csvCell(v: string) {
  if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}


