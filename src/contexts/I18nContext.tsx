import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'en' | 'zh' | 'es' | 'ar' | 'ru';

type Dict = Record<string, Partial<Record<Lang, string>>>;

const STORAGE_KEY = 'reaction_trainer_lang';

const DEFAULT_LANG: Lang = 'en';

// Translation dictionary. Add keys as needed across the app.
const dict: Dict = {
  // App / Topbar
  'app.title': { en: 'Reaction Trainer', zh: '反应力训练', es: 'Entrenador de Reacción', ar: 'مدرب الاستجابة', ru: 'Тренажёр реакции' },
  'nav.training': { en: 'Training', zh: '训练', es: 'Entrenamiento', ar: 'التدريب', ru: 'Тренировка' },
  'nav.insights': { en: 'Insights', zh: '建议与统计', es: 'Ideas', ar: 'الرؤى', ru: 'Аналитика' },
  'nav.settings': { en: 'Settings', zh: '设置', es: 'Ajustes', ar: 'الإعدادات', ru: 'Настройки' },
  'nav.fullscreen': { en: 'Fullscreen', zh: '全屏', es: 'Pantalla completa', ar: 'ملء الشاشة', ru: 'Полноэкранный режим' },
  'nav.language': { en: 'Language', zh: '语言', es: 'Idioma', ar: 'اللغة', ru: 'Язык' },

  // Home
  'home.title': { en: 'Reaction Training Suite', zh: '反应力训练套件', es: 'Suite de Entrenamiento de Reacción', ar: 'مجموعة تدريب الاستجابة', ru: 'Комплект тренировки реакции' },
  'home.subtitle': { en: 'Train reaction time, inhibition control, hand-eye coordination, and working memory through multiple mini-games. History is recorded and personalized tips are generated.', zh: '通过多种小游戏训练反应速度、抑制控制、手眼协调与工作记忆。每次完成后自动记录，生成个性化建议。', es: 'Entrena el tiempo de reacción, el control inhibitorio, la coordinación mano-ojo y la memoria de trabajo con varios minijuegos. El historial se guarda y se generan consejos personalizados.', ar: 'درّب زمن الاستجابة، التحكم المثبط، التنسيق بين العين واليد، والذاكرة العاملة من خلال عدة ألعاب صغيرة. يتم حفظ السجل وتوليد نصائح مخصصة.', ru: 'Тренируйте время реакции, подавление, координацию рук и глаз и рабочую память с помощью мини-игр. История сохраняется и создаются персональные рекомендации.' },
  'home.startReaction': { en: 'Start: Reaction Time Test', zh: '开始：反应时测试', es: 'Comenzar: Prueba de Tiempo de Reacción', ar: 'ابدأ: اختبار زمن الاستجابة', ru: 'Начать: тест времени реакции' },
  'home.viewInsights': { en: 'View Insights & History', zh: '查看建议与历史', es: 'Ver ideas e historial', ar: 'عرض الرؤى والسجل', ru: 'Просмотр аналитики и истории' },
  'home.open': { en: 'Open', zh: '进入', es: 'Abrir', ar: 'فتح', ru: 'Открыть' },

  // Game names
  'game.reaction': { en: 'Reaction Time', zh: '反应时', es: 'Tiempo de Reacción', ar: 'زمن الاستجابة', ru: 'Время реакции' },
  'game.aim': { en: 'Aim Trainer', zh: '点靶', es: 'Entrenador de Puntería', ar: 'مدرب التصويب', ru: 'Тренажёр меткости' },
  'game.sequence': { en: 'Sequence Memory', zh: '序列记忆', es: 'Memoria de Secuencias', ar: 'ذاكرة التسلسل', ru: 'Память последовательностей' },
  'game.gng': { en: 'Go/No-Go', zh: 'Go/No-Go', es: 'Go/No-Go', ar: 'اذهب/توقف', ru: 'Go/No-Go' },
  'game.stroop': { en: 'Stroop', zh: 'Stroop', es: 'Stroop', ar: 'ستروب', ru: 'Струп' },
  'game.taps': { en: 'Tap Speed', zh: '点击速度', es: 'Velocidad de Toques', ar: 'سرعة النقر', ru: 'Скорость касаний' },
  'game.posner': { en: 'Posner Cue', zh: 'Posner 注意定向', es: 'Señal de Posner', ar: 'إشارات بوسنر', ru: 'Подсказка Познера' },
  'game.sst': { en: 'Stop-Signal', zh: 'Stop-Signal', es: 'Señal de Parada', ar: 'إشارة الإيقاف', ru: 'Стоп-сигнал' },
  'game.crt': { en: 'Choice Reaction', zh: '多选反应', es: 'Reacción de Elección', ar: 'الاستجابة الاختيارية', ru: 'Выбор реакции' },

  // Common UI
  'ui.start': { en: 'Start', zh: '开始', es: 'Comenzar', ar: 'ابدأ', ru: 'Старт' },
  'ui.pause': { en: 'Pause', zh: '暂停', es: 'Pausar', ar: 'إيقاف مؤقت', ru: 'Пауза' },
  'ui.save': { en: 'Save to History', zh: '保存到历史', es: 'Guardar en historial', ar: 'احفظ في السجل', ru: 'Сохранить в историю' },
  'ui.reset': { en: 'Reset', zh: '重置', es: 'Reiniciar', ar: 'إعادة ضبط', ru: 'Сброс' },
  'ui.progress': { en: 'Progress', zh: '进度', es: 'Progreso', ar: 'التقدم', ru: 'Прогресс' },
  'ui.currentTrial': { en: 'Current Trial', zh: '当前试次', es: 'Ensayo Actual', ar: 'المحاولة الحالية', ru: 'Текущий пробный' },
  'ui.timeLeft': { en: 'Time Left', zh: '剩余时间', es: 'Tiempo restante', ar: 'الوقت المتبقي', ru: 'Осталось времени' },
  'ui.round': { en: 'Round', zh: '轮次', es: 'Ronda', ar: 'الجولة', ru: 'Раунд' },
  'ui.best': { en: 'Best', zh: '最佳', es: 'Mejor', ar: 'الأفضل', ru: 'Лучший' },
  'ui.average': { en: 'Average', zh: '平均', es: 'Promedio', ar: 'المتوسط', ru: 'Среднее' },
  'ui.attempts': { en: 'Attempts', zh: '尝试次数', es: 'Intentos', ar: 'محاولات', ru: 'Попытки' },
  'ui.hits': { en: 'Hits', zh: '命中', es: 'Aciertos', ar: 'إصابات', ru: 'Попадания' },
  'ui.clicks': { en: 'Clicks', zh: '点击', es: 'Clics', ar: 'نقرات', ru: 'Клики' },
  'ui.accuracy': { en: 'Accuracy', zh: '准确率', es: 'Precisión', ar: 'الدقة', ru: 'Точность' },
  'ui.spawns': { en: 'Spawns', zh: '生成目标', es: 'Apariciones', ar: 'ظهور الأهداف', ru: 'Появления' },
  'ui.missed': { en: 'Missed', zh: '未击中', es: 'Fallados', ar: 'أخطأت', ru: 'Промахи' },
  'ui.ssd': { en: 'SSD', zh: 'SSD', es: 'SSD', ar: 'SSD', ru: 'SSD' },
  'ui.step': { en: 'Step', zh: '步骤', es: 'Paso', ar: 'الخطوة', ru: 'Шаг' },
  'ui.of': { en: 'of', zh: '/', es: 'de', ar: 'من', ru: 'из' },
  'ui.restartRound': { en: 'Restart Round', zh: '重启本轮', es: 'Reiniciar Ronda', ar: 'إعادة تشغيل الجولة', ru: 'Перезапустить раунд' },
  'ui.previous': { en: 'Previous', zh: '上一步', es: 'Anterior', ar: 'السابق', ru: 'Назад' },
  'ui.skipNext': { en: 'Skip / Next', zh: '跳过/下一步', es: 'Omitir / Siguiente', ar: 'تخطي / التالي', ru: 'Пропустить / Далее' },
  'ui.summary': { en: 'Summary of this Round', zh: '本轮训练总结', es: 'Resumen de esta ronda', ar: 'ملخص هذه الجولة', ru: 'Итоги раунда' },

  // Game instructions
  'rt.rules': { en: 'Click as soon as the panel turns green. Early click during WAIT counts as 1000 ms (false start).', zh: '规则：界面随机变色后尽快点击。过早点击计为1000ms（抢跑）。', es: 'Haz clic cuando el panel se ponga verde. Clic temprano durante ESPERA cuenta como 1000 ms (salida en falso).', ar: 'انقر فور تحوّل اللوحة إلى اللون الأخضر. النقر المبكر أثناء الانتظار يُحسب 1000 مللي ثانية (انطلاقة خاطئة).', ru: 'Кликните, как только панель станет зелёной. Ранний клик во время ожидания считается 1000 мс (фальстарт).' },
  'rt.clickToStart': { en: 'Click to start', zh: '点击开始', es: 'Haz clic para empezar', ar: 'انقر للبدء', ru: 'Нажмите, чтобы начать' },
  'rt.wait': { en: 'Wait... don’t false start', zh: '等待变色... 不要抢跑', es: 'Espera... no salgas en falso', ar: 'انتظر... لا تبدأ مبكرًا', ru: 'Ждите... не стартуйте раньше' },
  'rt.now': { en: 'Now! Click!', zh: '现在！点击！', es: '¡Ahora! ¡Haz clic!', ar: 'الآن! انقر!', ru: 'Сейчас! Жмите!' },
  'rt.continue': { en: 'Click to continue', zh: '再次点击继续', es: 'Haz clic para continuar', ar: 'انقر للمتابعة', ru: 'Нажмите, чтобы продолжить' },

  'aim.rules': { en: '30-second timer. Click appearing targets. Focus on accuracy before speed.', zh: '30秒限时，点击尽可能多的目标。建议先追求准确率再提速。', es: '30 segundos. Haz clic en los objetivos que aparecen. Prioriza precisión antes que velocidad.', ar: 'مؤقت 30 ثانية. انقر على الأهداف الظاهرة. ركّز على الدقة قبل السرعة.', ru: '30 секунд. Кликайте по целям. Сначала точность, затем скорость.' },
  'aim.clickHere': { en: 'Click here or press Space', zh: '点击这里或按空格', es: 'Haz clic aquí o presiona Espacio', ar: 'انقر هنا أو اضغط المسافة', ru: 'Кликните здесь или нажмите Пробел' },

  'seq.rules': { en: 'Watch the light sequence and reproduce it by clicking in the same order. Levels increase gradually.', zh: '观看亮灯顺序，然后按相同顺序点击。层级逐步提高。', es: 'Observa la secuencia y repítela en el mismo orden. El nivel aumenta gradualmente.', ar: 'شاهد تسلسل الإضاءة وكرره بنفس الترتيب. يزيد المستوى تدريجيًا.', ru: 'Смотрите последовательность и повторяйте её. Уровень постепенно повышается.' },
  'seq.currentLevel': { en: 'Current Level', zh: '当前层级', es: 'Nivel actual', ar: 'المستوى الحالي', ru: 'Текущий уровень' },
  'seq.longest': { en: 'Longest', zh: '最长', es: 'Más largo', ar: 'الأطول', ru: 'Максимум' },

  'gng.rules': { en: 'Press Space for GO; withhold response for NO-GO. Total {n} trials.', zh: '看到“GO”请立即按空格，看到“NO-GO”请抑制反应不按。共{n}次。', es: 'Presiona Espacio en GO; inhibe la respuesta en NO-GO. Total {n} ensayos.', ar: 'اضغط المسافة عند GO؛ امنع الاستجابة عند NO-GO. المجموع {n} محاولة.', ru: 'Нажимайте Пробел на GO; удерживайте реакцию на NO-GO. Всего {n} попыток.' },

  'stroop.rules': { en: 'Keys: D=Red F=Green J=Blue K=Yellow. Respond to the FONT COLOR, not the word.', zh: '按键：D=红 F=绿 J=蓝 K=黄。根据“字体颜色”作答，而非词义。', es: 'Teclas: D=Rojo F=Verde J=Azul K=Amarillo. Responde al COLOR DE LA FUENTE, no a la palabra.', ar: 'المفاتيح: D=أحمر F=أخضر J=أزرق K=أصفر. اجِب على لون الخط، لا على الكلمة.', ru: 'Клавиши: D=Красный F=Зелёный J=Синий K=Жёлтый. Отвечайте на ЦВЕТ, а не слово.' },
  'stroop.readyNext': { en: 'Preparing next...', zh: '准备下一题...', es: 'Preparando siguiente...', ar: 'تحضير التالي...', ru: 'Подготовка следующего...' },

  'posner.rules': { en: 'Follow left/right arrow cue. When target appears, press the corresponding arrow key (←/→).', zh: '依据左/右箭头线索定向。目标出现后按对应方向键（←/→）。', es: 'Sigue la señal de flecha izquierda/derecha. Al aparecer el objetivo, presiona la flecha correspondiente (←/→).', ar: 'اتبع إشارة السهم لليسار/ليمين. عند ظهور الهدف اضغط السهم المقابل (←/→).', ru: 'Следуйте подсказке влево/вправо. Когда цель появляется, нажмите соответствующую стрелку (←/→).' },

  'sst.rules': { en: 'Respond with arrow keys. If you hear a beep, try to withhold the response (adaptive SSD).', zh: '按方向键响应箭头。如听到“哔”则尽量抑制不按（Stop 信号延迟自适应）。', es: 'Responde con las flechas. Si escuchas un pitido, intenta inhibir la respuesta (SSD adaptativo).', ar: 'استجب بمفاتيح الأسهم. إذا سمعت صفيرًا فحاول منع الاستجابة (SSD تكيفي).', ru: 'Отвечайте стрелками. При сигнале (пип) постарайтесь удержаться (адаптивный SSD).' },

  // Insights / Summary
  'insights.title': { en: 'Insights & Overview', zh: '建议与概览', es: 'Ideas y Resumen', ar: 'الرؤى ونظرة عامة', ru: 'Аналитика и обзор' },
  'insights.sessions7d': { en: 'Sessions in last 7 days', zh: '近7天训练次数', es: 'Sesiones en los últimos 7 días', ar: 'الجلسات في آخر 7 أيام', ru: 'Сессии за последние 7 дней' },
  'insights.doneToday': { en: 'Completed Today', zh: '今日完成', es: 'Completado hoy', ar: 'مكتمل اليوم', ru: 'Сделано сегодня' },
  'insights.streakDays': { en: 'Streak Days', zh: '连续天数', es: 'Días consecutivos', ar: 'أيام متتالية', ru: 'Серия дней' },
  'insights.history': { en: 'History', zh: '历史记录', es: 'Historial', ar: 'السجل', ru: 'История' },
  'insights.exportJson': { en: 'Export JSON', zh: '导出JSON', es: 'Exportar JSON', ar: 'تصدير JSON', ru: 'Экспорт JSON' },
  'insights.exportCsv': { en: 'Export CSV', zh: '导出CSV', es: 'Exportar CSV', ar: 'تصدير CSV', ru: 'Экспорт CSV' },
  'insights.importJson': { en: 'Import JSON', zh: '导入JSON', es: 'Importar JSON', ar: 'استيراد JSON', ru: 'Импорт JSON' },
  'insights.clear': { en: 'Clear History', zh: '清空历史', es: 'Borrar historial', ar: 'مسح السجل', ru: 'Очистить историю' },
  'insights.startTraining': { en: 'Start training to generate personalized insights.', zh: '开始训练吧！完成任意3轮后将生成个性化建议。', es: 'Comienza a entrenar para generar recomendaciones personalizadas.', ar: 'ابدأ التدريب لإنشاء رؤى مخصصة.', ru: 'Начните тренироваться, чтобы получить персональные рекомендации.' },
  'charts.current': { en: 'Current', zh: '本次', es: 'Actual', ar: 'الحالي', ru: 'Текущий' },
  'charts.avg7d': { en: '7d avg', zh: '7日均', es: '7d prom', ar: 'متوسط 7 أيام', ru: 'ср. за 7 дн.' },
};

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    return stored || DEFAULT_LANG;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  const t = useMemo(() => (key: string, vars?: Record<string, string | number>) => {
    const entry = dict[key];
    const raw = (entry && (entry[lang] || entry.en)) || key;
    if (!vars) return raw;
    return Object.keys(vars).reduce((s, k) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k])), raw);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}


