import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { HistoryProvider } from '@/contexts/HistoryContext';
import { I18nProvider, useI18n } from '@/contexts/I18nContext';
import Home from '@/pages/Home';
import UnifiedTraining from '@/pages/UnifiedTraining';
import ReactionTime from '@/games/ReactionTime';
import AimTrainer from '@/games/AimTrainer';
import SequenceMemory from '@/games/SequenceMemory';
import GoNoGo from '@/games/GoNoGo';
import Insights from '@/pages/Insights';
import Stroop from '@/games/Stroop';
import TapSpeed from '@/games/TapSpeed';
import PosnerCue from '@/games/PosnerCue';
import Settings from '@/pages/Settings';
import Planner from '@/pages/Planner';
import StopSignal from '@/games/StopSignal';
import ChoiceRT from '@/games/ChoiceRT';

export default function App() {
  return (
    <I18nProvider>
      <HistoryProvider>
        <div>
          <Topbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<UnifiedTraining />} />
              <Route path="/reaction" element={<ReactionTime />} />
              <Route path="/aim" element={<AimTrainer />} />
              <Route path="/sequence" element={<SequenceMemory />} />
              <Route path="/gng" element={<GoNoGo />} />
              <Route path="/stroop" element={<Stroop />} />
              <Route path="/taps" element={<TapSpeed />} />
              <Route path="/posner" element={<PosnerCue />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/sst" element={<StopSignal />} />
              <Route path="/crt" element={<ChoiceRT />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </HistoryProvider>
    </I18nProvider>
  );
}

function Topbar() {
  const { t, lang, setLang } = useI18n();
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(6px)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 10, paddingBottom: 10 }}>
        <Link to="/" style={{ fontWeight: 900, letterSpacing: 0.3 }}>{t('app.title')}</Link>
        <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="badge" to="/">{t('nav.training')}</Link>
          <Link className="badge" to="/insights">{t('nav.insights')}</Link>
          <Link className="badge" to="/settings">{t('nav.settings')}</Link>
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <select aria-label="language" className="btn secondary" value={lang} onChange={(e) => setLang(e.target.value as any)}>
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
            <option value="ar">العربية</option>
            <option value="ru">Русский</option>
          </select>
          <button className="btn secondary" onClick={toggleFullscreen}>{t('nav.fullscreen')}</button>
        </div>
      </div>
    </header>
  );
}

function toggleFullscreen() {
  const el = document.documentElement as any;
  if (!document.fullscreenElement) {
    (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(el);
  } else {
    (document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).msExitFullscreen)?.call(document);
  }
}


