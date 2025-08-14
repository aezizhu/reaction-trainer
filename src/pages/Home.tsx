import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container" style={{ display: 'grid', gap: 20 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">反应力训练套件</div>
        <div className="subtitle">通过多种小游戏训练反应速度、抑制控制、手眼协调与工作记忆。每次完成后自动记录，生成个性化建议。</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <Link className="btn" to="/reaction">开始：反应时测试</Link>
          <Link className="btn secondary" to="/insights">查看建议与历史</Link>
        </div>
      </section>

      <section className="grid">
        <Card title="反应时 Reaction Time" to="/reaction" desc="随机延时后变色，尽快点击。"/>
        <Card title="点靶 Aim Trainer" to="/aim" desc="快速点击出现的目标，提高命中率与速度。"/>
        <Card title="序列记忆 Sequence" to="/sequence" desc="记住并回放亮灯顺序。"/>
        <Card title="Go/No-Go" to="/gng" desc="看指令决定按与不按，训练抑制反应。"/>
        <Card title="Stroop" to="/stroop" desc="颜色-词义干扰，训练选择性注意与抑制。"/>
        <Card title="Tap Speed" to="/taps" desc="短时极限点击速度与节奏稳定性。"/>
        <Card title="Posner Cue" to="/posner" desc="注意定向与转换成本训练。"/>
        <Card title="Stop-Signal" to="/sst" desc="阻止已启动反应，训练抑制时机（SSRT/SSD）。"/>
        <Card title="Choice RT" to="/crt" desc="多选反应速度与映射准确性。"/>
      </section>
    </div>
  );
}

function Card({ title, desc, to }: { title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="card panel" style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <span className="badge">进入</span>
      </div>
      <div className="muted" style={{ fontSize: 14 }}>{desc}</div>
    </Link>
  );
}


