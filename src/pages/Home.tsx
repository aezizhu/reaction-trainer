import { Link } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';

export default function Home() {
  const { t } = useI18n();
  return (
    <div className="container" style={{ display: 'grid', gap: 20 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">{t('home.title')}</div>
        <div className="subtitle">{t('home.subtitle')}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <Link className="btn" to="/reaction">{t('home.startReaction')}</Link>
          <Link className="btn secondary" to="/insights">{t('home.viewInsights')}</Link>
        </div>
      </section>

      <section className="grid">
        <Card title={`${t('game.reaction')}`} to="/reaction" desc={t('rt.rules')} />
        <Card title={`${t('game.aim')}`} to="/aim" desc={t('aim.rules')} />
        <Card title={`${t('game.sequence')}`} to="/sequence" desc={t('seq.rules')} />
        <Card title={`Go/No-Go`} to="/gng" desc={t('gng.rules', { n: 30 })} />
        <Card title={`Stroop`} to="/stroop" desc={t('stroop.rules')} />
        <Card title={`${t('game.taps')}`} to="/taps" desc={t('aim.clickHere')} />
        <Card title={`Posner Cue`} to="/posner" desc={t('posner.rules')} />
        <Card title={`Stop-Signal`} to="/sst" desc={t('sst.rules')} />
        <Card title={`${t('game.crt')}`} to="/crt" desc={'4-choice reaction with D/F/J/K'} />
      </section>
    </div>
  );
}

function Card({ title, desc, to }: { title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="card panel" style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <span className="badge">{useI18n().t('home.open')}</span>
      </div>
      <div className="muted" style={{ fontSize: 14 }}>{desc}</div>
    </Link>
  );
}


