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
  'posner.help': { en: 'Click the panel below to start, then use arrow keys to respond', zh: '点击下方面板开始，然后使用方向键响应', es: 'Haz clic en el panel de abajo para empezar, luego usa las teclas de flecha para responder', ar: 'انقر على اللوحة أدناه للبدء، ثم استخدم مفاتيح الأسهم للاستجابة', ru: 'Нажмите на панель ниже, чтобы начать, затем используйте клавиши со стрелками для ответа' },
  
  // Choice Reaction Time
  'crt.rules': { en: 'Respond using D/F/J/K matching the position. Aim for both speed and accuracy.', zh: '使用D/F/J/K键匹配位置进行响应。追求速度和准确性的平衡。', es: 'Responde usando D/F/J/K para coincidir con la posición. Busca velocidad y precisión.', ar: 'استجب باستخدام D/F/J/K لمطابقة الموقع. اهتم بالسرعة والدقة.', ru: 'Отвечайте клавишами D/F/J/K, соответствующими позиции. Стремитесь к скорости и точности.' },
  
  // Tap Speed
  'taps.rules': { en: 'Tap as fast as possible within 5 seconds (or press Space). Focus on rhythm stability.', zh: '在5秒内尽可能快地点击（或按空格键）。注意保持节奏稳定。', es: 'Toca lo más rápido posible en 5 segundos (o presiona Espacio). Concéntrate en la estabilidad del ritmo.', ar: 'انقر بأسرع ما يمكن خلال 5 ثوانٍ (أو اضغط المسافة). ركّز على ثبات الإيقاع.', ru: 'Нажимайте как можно быстрее в течение 5 секунд (или нажмите Пробел). Сосредоточьтесь на стабильности ритма.' },
  
  // Color names for Stroop
  'color.red': { en: 'RED', zh: '红色', es: 'ROJO', ar: 'أحمر', ru: 'КРАСНЫЙ' },
  'color.green': { en: 'GREEN', zh: '绿色', es: 'VERDE', ar: 'أخضر', ru: 'ЗЕЛЁНЫЙ' },
  'color.blue': { en: 'BLUE', zh: '蓝色', es: 'AZUL', ar: 'أزرق', ru: 'СИНИЙ' },
  'color.yellow': { en: 'YELLOW', zh: '黄色', es: 'AMARILLO', ar: 'أصفر', ru: 'ЖЁЛТЫЙ' },
  
  // Settings page
  'settings.title': { en: 'Settings', zh: '设置', es: 'Configuración', ar: 'الإعدادات', ru: 'Настройки' },
  'settings.sound': { en: 'Sound', zh: '声音', es: 'Sonido', ar: 'الصوت', ru: 'Звук' },
  'settings.vibration': { en: 'Vibration', zh: '震动', es: 'Vibración', ar: 'الاهتزاز', ru: 'Вибрация' },
  'settings.autoSave': { en: 'Settings are saved to your browser automatically.', zh: '设置会自动保存到您的浏览器。', es: 'La configuración se guarda automáticamente en tu navegador.', ar: 'يتم حفظ الإعدادات تلقائياً في متصفحك.', ru: 'Настройки автоматически сохраняются в вашем браузере.' },
  
  // Settings - Reaction
  'settings.reaction.minDelay': { en: 'Min Delay (ms)', zh: '最小延迟 (毫秒)', es: 'Retraso Mín (ms)', ar: 'الحد الأدنى للتأخير (مللي ثانية)', ru: 'Мин. задержка (мс)' },
  'settings.reaction.maxDelay': { en: 'Max Delay (ms)', zh: '最大延迟 (毫秒)', es: 'Retraso Máx (ms)', ar: 'الحد الأقصى للتأخير (مللي ثانية)', ru: 'Макс. задержка (мс)' },
  
  // Settings - Aim
  'settings.aim.radius': { en: 'Target Radius (px)', zh: '目标半径 (像素)', es: 'Radio del Objetivo (px)', ar: 'نصف قطر الهدف (بكسل)', ru: 'Радиус цели (пикс)' },
  'settings.aim.spawnMin': { en: 'Spawn Min (ms)', zh: '生成最小间隔 (毫秒)', es: 'Generación Mín (ms)', ar: 'الحد الأدنى للتوليد (مللي ثانية)', ru: 'Мин. интервал появления (мс)' },
  'settings.aim.spawnMax': { en: 'Spawn Max (ms)', zh: '生成最大间隔 (毫秒)', es: 'Generación Máx (ms)', ar: 'الحد الأقصى للتوليد (مللي ثانية)', ru: 'Макс. интервал появления (мс)' },
  'settings.aim.duration': { en: 'Duration (s)', zh: '持续时间 (秒)', es: 'Duración (s)', ar: 'المدة (ثانية)', ru: 'Длительность (с)' },
  'settings.aim.targetLifetime': { en: 'Target Lifetime (ms)', zh: '目标存活时间 (毫秒)', es: 'Vida del Objetivo (ms)', ar: 'عمر الهدف (مللي ثانية)', ru: 'Время жизни цели (мс)' },
  
  // Settings - Sequence
  'settings.sequence.show': { en: 'Show (ms)', zh: '显示时间 (毫秒)', es: 'Mostrar (ms)', ar: 'عرض (مللي ثانية)', ru: 'Показать (мс)' },
  'settings.sequence.gap': { en: 'Gap (ms)', zh: '间隔时间 (毫秒)', es: 'Intervalo (ms)', ar: 'الفاصل (مللي ثانية)', ru: 'Интервал (мс)' },
  
  // Settings - Go/No-Go
  'settings.gng.trials': { en: 'Trials', zh: '试验次数', es: 'Intentos', ar: 'المحاولات', ru: 'Попытки' },
  'settings.gng.goRatio': { en: 'Go Ratio (0-1)', zh: 'Go 比例 (0-1)', es: 'Proporción Go (0-1)', ar: 'نسبة Go (0-1)', ru: 'Соотношение Go (0-1)' },
  'settings.gng.isi': { en: 'ISI (ms)', zh: 'ISI (毫秒)', es: 'ISI (ms)', ar: 'ISI (مللي ثانية)', ru: 'ISI (мс)' },
  
  // Settings - Stroop
  'settings.stroop.total': { en: 'Total Items', zh: '总项目数', es: 'Total de Elementos', ar: 'إجمالي العناصر', ru: 'Всего элементов' },
  'settings.stroop.incongruentRatio': { en: 'Incongruent Ratio (0-1)', zh: '不一致比例 (0-1)', es: 'Proporción Incongruente (0-1)', ar: 'نسبة عدم التطابق (0-1)', ru: 'Соотношение неконгруэнтности (0-1)' },
  
  // Settings - Tap Speed
  'settings.taps.duration': { en: 'Duration (s)', zh: '持续时间 (秒)', es: 'Duración (s)', ar: 'المدة (ثانية)', ru: 'Длительность (с)' },
  
  // Settings - Posner
  'settings.posner.trials': { en: 'Trials', zh: '试验次数', es: 'Intentos', ar: 'المحاولات', ru: 'Попытки' },
  'settings.posner.validRatio': { en: 'Valid Ratio (0-1)', zh: '有效比例 (0-1)', es: 'Proporción Válida (0-1)', ar: 'نسبة الصحة (0-1)', ru: 'Соотношение валидности (0-1)' },
  'settings.posner.isi': { en: 'ISI (ms)', zh: 'ISI (毫秒)', es: 'ISI (ms)', ar: 'ISI (مللي ثانية)', ru: 'ISI (мс)' },
  
  // Insights - Lifestyle tips
  'insights.lifestyleTips': { en: 'Lifestyle tips (general)', zh: '生活方式建议（通用）', es: 'Consejos de estilo de vida (general)', ar: 'نصائح نمط الحياة (عامة)', ru: 'Советы по образу жизни (общие)' },
  'insights.lifestyle1': { en: 'Sleep 7–9 hours; maintain regular schedule.', zh: '睡眠7-9小时；保持规律作息。', es: 'Duerme 7-9 horas; mantén un horario regular.', ar: 'نم 7-9 ساعات؛ حافظ على جدول منتظم.', ru: 'Спите 7-9 часов; соблюдайте регулярный режим.' },
  'insights.lifestyle2': { en: 'Exercise ≥150 minutes/week at moderate intensity.', zh: '每周进行≥150分钟中等强度运动。', es: 'Ejercita ≥150 minutos/semana a intensidad moderada.', ar: 'تمرن ≥150 دقيقة/أسبوع بكثافة معتدلة.', ru: 'Занимайтесь спортом ≥150 минут/неделю с умеренной интенсивностью.' },
  'insights.lifestyle3': { en: 'Balanced nutrition; consider Omega-3 and vitamins.', zh: '均衡营养；考虑补充Omega-3和维生素。', es: 'Nutrición equilibrada; considera Omega-3 y vitaminas.', ar: 'تغذية متوازنة؛ فكر في أوميغا-3 والفيتامينات.', ru: 'Сбалансированное питание; рассмотрите Омега-3 и витамины.' },
  'insights.lifestyle4': { en: 'Stress management (meditation/breathing/mindfulness).', zh: '压力管理（冥想/呼吸/正念）。', es: 'Manejo del estrés (meditación/respiración/atención plena).', ar: 'إدارة التوتر (التأمل/التنفس/اليقظة).', ru: 'Управление стрессом (медитация/дыхание/осознанность).' },
  'insights.lifestyle5': { en: 'Alternate different trainings to avoid habituation.', zh: '交替进行不同训练以避免习惯化。', es: 'Alterna diferentes entrenamientos para evitar la habituación.', ar: 'بدّل بين التدريبات المختلفة لتجنب التعود.', ru: 'Чередуйте разные тренировки, чтобы избежать привыкания.' },
  
  // Training prompt
  'insights.startTraining': { en: 'Start training! Complete 3+ sessions to unlock personalized insights.', zh: '开始训练！完成3次以上训练以解锁个性化建议。', es: '¡Comienza a entrenar! Completa 3+ sesiones para desbloquear insights personalizados.', ar: 'ابدأ التدريب! أكمل 3+ جلسات لفتح الرؤى الشخصية.', ru: 'Начните тренировку! Завершите 3+ сессии, чтобы разблокировать персонализированные идеи.' },
  
  // Personalized recommendations
  'insights.rec.rtHigh': { en: 'Reaction time average is high; add more forewarning interference and keep fingers ready.', zh: '反应时间平均值较高；增加更多预警干扰并保持手指准备状态。', es: 'El tiempo de reacción promedio es alto; agrega más interferencia de advertencia y mantén los dedos listos.', ar: 'متوسط زمن الاستجابة مرتفع؛ أضف المزيد من التداخل التحذيري وحافظ على استعداد الأصابع.', ru: 'Среднее время реакции высокое; добавьте больше предупреждающих помех и держите пальцы готовыми.' },
  'insights.rec.rtGood': { en: 'Good reaction time. Try shorter cue intervals or higher randomness.', zh: '反应时间良好。尝试更短的提示间隔或更高的随机性。', es: 'Buen tiempo de reacción. Prueba intervalos de señal más cortos o mayor aleatoriedad.', ar: 'زمن استجابة جيد. جرب فترات إشارة أقصر أو عشوائية أعلى.', ru: 'Хорошее время реакции. Попробуйте более короткие интервалы сигналов или более высокую случайность.' },
  'insights.rec.aimLow': { en: 'Aim accuracy is low; consider larger targets or longer visibility, then ramp up.', zh: '瞄准准确率较低；考虑更大的目标或更长的可见时间，然后逐步提高。', es: 'La precisión de puntería es baja; considera objetivos más grandes o mayor visibilidad, luego aumenta gradualmente.', ar: 'دقة التصويب منخفضة؛ فكر في أهداف أكبر أو رؤية أطول، ثم ارفع تدريجياً.', ru: 'Точность прицеливания низкая; рассмотрите более крупные цели или более длительную видимость, затем постепенно увеличивайте.' },
  'insights.rec.aimGood': { en: 'Aim accuracy is solid; try smaller targets or more concurrent targets.', zh: '瞄准准确率稳定；尝试更小的目标或更多并发目标。', es: 'La precisión de puntería es sólida; prueba objetivos más pequeños o más objetivos concurrentes.', ar: 'دقة التصويب ثابتة؛ جرب أهداف أصغر أو أهداف متزامنة أكثر.', ru: 'Точность прицеливания стабильная; попробуйте более мелкие цели или больше одновременных целей.' },
  'insights.rec.seqLow': { en: 'Sequence level is modest; try chunking with a metronome.', zh: '序列等级适中；尝试使用节拍器进行分块。', es: 'El nivel de secuencia es modesto; prueba agrupar con un metrónomo.', ar: 'مستوى التسلسل متواضع؛ جرب التجميع مع مقياس الإيقاع.', ru: 'Уровень последовательности скромный; попробуйте группировку с метрономом.' },
  'insights.rec.seqGood': { en: 'Sequence memory is good; add auditory distractors or speed up pacing.', zh: '序列记忆良好；添加听觉干扰或加快节奏。', es: 'La memoria de secuencia es buena; agrega distractores auditivos o acelera el ritmo.', ar: 'ذاكرة التسلسل جيدة؛ أضف مشتتات سمعية أو سرع الإيقاع.', ru: 'Память последовательности хорошая; добавьте слуховые отвлекающие факторы или ускорьте темп.' },
  'insights.rec.gngLow': { en: 'Inhibition errors are frequent; lengthen NO-GO display or lower GO ratio.', zh: '抑制错误频繁；延长NO-GO显示时间或降低GO比例。', es: 'Los errores de inhibición son frecuentes; alarga la visualización NO-GO o reduce la proporción GO.', ar: 'أخطاء التثبيط متكررة؛ أطيل عرض NO-GO أو قلل نسبة GO.', ru: 'Ошибки торможения частые; увеличьте время показа NO-GO или уменьшите соотношение GO.' },
  'insights.rec.gngGood': { en: 'Inhibition is good; try higher GO ratio or shorter ISI.', zh: '抑制能力良好；尝试更高的GO比例或更短的ISI。', es: 'La inhibición es buena; prueba una proporción GO más alta o ISI más corto.', ar: 'التثبيط جيد؛ جرب نسبة GO أعلى أو ISI أقصر.', ru: 'Торможение хорошее; попробуйте более высокое соотношение GO или более короткий ISI.' },
  'insights.rec.stroopHigh': { en: 'Stroop interference cost is high; focus on color dimension first and reduce incongruent ratio.', zh: 'Stroop干扰成本较高；首先专注于颜色维度并减少不一致比例。', es: 'El costo de interferencia Stroop es alto; enfócate primero en la dimensión del color y reduce la proporción incongruente.', ar: 'تكلفة تداخل Stroop مرتفعة؛ ركز على بُعد اللون أولاً وقلل نسبة عدم التطابق.', ru: 'Стоимость интерференции Струпа высокая; сначала сосредоточьтесь на цветовом измерении и уменьшите соотношение неконгруэнтности.' },
  'insights.rec.stroopGood': { en: 'Stroop performance is stable; increase incongruent ratio or reduce presentation time.', zh: 'Stroop表现稳定；增加不一致比例或减少呈现时间。', es: 'El rendimiento Stroop es estable; aumenta la proporción incongruente o reduce el tiempo de presentación.', ar: 'أداء Stroop مستقر؛ زد نسبة عدم التطابق أو قلل وقت العرض.', ru: 'Производительность Струпа стабильна; увеличьте соотношение неконгруэнтности или уменьшите время предъявления.' },
  'insights.rec.tapsLow': { en: 'Tap frequency is low; try short high-rate bursts and keep the wrist relaxed.', zh: '点击频率较低；尝试短时间高频率爆发并保持手腕放松。', es: 'La frecuencia de toque es baja; prueba ráfagas cortas de alta frecuencia y mantén la muñeca relajada.', ar: 'تردد النقر منخفض؛ جرب انفجارات قصيرة عالية التردد وحافظ على استرخاء المعصم.', ru: 'Частота нажатий низкая; попробуйте короткие всплески высокой частоты и держите запястье расслабленным.' },
  'insights.rec.tapsGood': { en: 'Tap speed is good; try shorter windows for peak bursts.', zh: '点击速度良好；尝试更短的窗口进行峰值爆发。', es: 'La velocidad de toque es buena; prueba ventanas más cortas para ráfagas máximas.', ar: 'سرعة النقر جيدة؛ جرب نوافذ أقصر للانفجارات القصوى.', ru: 'Скорость нажатий хорошая; попробуйте более короткие окна для пиковых всплесков.' },
  'insights.rec.posnerHigh': { en: 'Attentional shift cost is high; increase valid cue ratio first, then add invalid cues.', zh: '注意力转移成本较高；首先增加有效提示比例，然后添加无效提示。', es: 'El costo del cambio de atención es alto; aumenta primero la proporción de señales válidas, luego agrega señales inválidas.', ar: 'تكلفة تحول الانتباه مرتفعة؛ زد نسبة الإشارات الصالحة أولاً، ثم أضف إشارات غير صالحة.', ru: 'Стоимость переключения внимания высокая; сначала увеличьте соотношение валидных сигналов, затем добавьте невалидные сигналы.' },
  'insights.rec.posnerGood': { en: 'Attentional shifting is good; shorten ISI or raise invalid cue ratio.', zh: '注意力转移良好；缩短ISI或提高无效提示比例。', es: 'El cambio de atención es bueno; acorta el ISI o aumenta la proporción de señales inválidas.', ar: 'تحول الانتباه جيد؛ قصر ISI أو ارفع نسبة الإشارات غير الصالحة.', ru: 'Переключение внимания хорошее; сократите ISI или увеличьте соотношение невалидных сигналов.' },
  'insights.rec.sstLong': { en: 'SSRT is long; lower initial SSD and use smaller steps, then ramp difficulty.', zh: 'SSRT较长；降低初始SSD并使用更小的步长，然后逐步提高难度。', es: 'El SSRT es largo; reduce el SSD inicial y usa pasos más pequeños, luego aumenta la dificultad gradualmente.', ar: 'SSRT طويل؛ قلل SSD الأولي واستخدم خطوات أصغر، ثم ارفع الصعوبة تدريجياً.', ru: 'SSRT длинный; уменьшите начальный SSD и используйте меньшие шаги, затем постепенно увеличивайте сложность.' },
  'insights.rec.sstGood': { en: 'Inhibitory control is good; increase stop ratio or enlarge SSD step.', zh: '抑制控制良好；增加停止比例或扩大SSD步长。', es: 'El control inhibitorio es bueno; aumenta la proporción de parada o agranda el paso SSD.', ar: 'التحكم التثبيطي جيد؛ زد نسبة التوقف أو ارفع خطوة SSD.', ru: 'Тормозной контроль хороший; увеличьте соотношение остановки или увеличьте шаг SSD.' },
  'insights.rec.crtLow': { en: 'CRT accuracy is low; reduce concurrent interference or options then increase gradually.', zh: 'CRT准确率较低；减少并发干扰或选项，然后逐步增加。', es: 'La precisión CRT es baja; reduce la interferencia concurrente o las opciones, luego aumenta gradualmente.', ar: 'دقة CRT منخفضة؛ قلل التداخل المتزامن أو الخيارات ثم زد تدريجياً.', ru: 'Точность CRT низкая; уменьшите одновременные помехи или опции, затем постепенно увеличивайте.' },
  'insights.rec.crtGood': { en: 'CRT is stable, avg RT ≈ {rt} ms; try incompatible mappings for challenge.', zh: 'CRT稳定，平均RT≈{rt}毫秒；尝试不兼容映射以增加挑战。', es: 'CRT es estable, TR promedio ≈ {rt} ms; prueba mapeos incompatibles para el desafío.', ar: 'CRT مستقر، متوسط زمن الاستجابة ≈ {rt} مللي ثانية؛ جرب التخطيطات غير المتوافقة للتحدي.', ru: 'CRT стабилен, среднее ВР ≈ {rt} мс; попробуйте несовместимые сопоставления для вызова.' },
  
  // History record metrics
  'history.avgRt': { en: 'Avg RT', zh: '平均RT', es: 'TR Promedio', ar: 'متوسط زمن الاستجابة', ru: 'Среднее ВР' },
  'history.best': { en: 'Best', zh: '最佳', es: 'Mejor', ar: 'أفضل', ru: 'Лучший' },
  'history.hits': { en: 'Hits', zh: '命中', es: 'Aciertos', ar: 'إصابات', ru: 'Попадания' },
  'history.accuracy': { en: 'Accuracy', zh: '准确率', es: 'Precisión', ar: 'الدقة', ru: 'Точность' },
  'history.level': { en: 'Level', zh: '等级', es: 'Nivel', ar: 'المستوى', ru: 'Уровень' },
  'history.longest': { en: 'Longest', zh: '最长', es: 'Más Largo', ar: 'الأطول', ru: 'Самый длинный' },
  'history.goAcc': { en: 'Go Acc', zh: 'Go 正确率', es: 'Precisión Go', ar: 'دقة Go', ru: 'Точность Go' },
  'history.nogoAcc': { en: 'No-Go Acc', zh: 'No-Go 正确率', es: 'Precisión No-Go', ar: 'دقة No-Go', ru: 'Точность No-Go' },
  'history.cong': { en: 'Cong', zh: '一致', es: 'Cong', ar: 'متطابق', ru: 'Конгр.' },
  'history.incong': { en: 'Incong', zh: '不一致', es: 'Incong', ar: 'غير متطابق', ru: 'Инконгр.' },
  'history.cost': { en: 'Cost', zh: '成本', es: 'Costo', ar: 'التكلفة', ru: 'Стоимость' },
  'history.taps': { en: 'Taps', zh: '点击', es: 'Toques', ar: 'النقرات', ru: 'Нажатия' },
  'history.seconds': { en: 's', zh: '秒', es: 's', ar: 'ث', ru: 'с' },
  'history.avgInterval': { en: 'Avg Interval', zh: '平均间隔', es: 'Intervalo Promedio', ar: 'متوسط الفاصل', ru: 'Средний интервал' },
  'history.valid': { en: 'Valid', zh: '有效', es: 'Válido', ar: 'صالح', ru: 'Валидный' },
  'history.invalid': { en: 'Invalid', zh: '无效', es: 'Inválido', ar: 'غير صالح', ru: 'Невалидный' },
  'history.ssd': { en: 'SSD', zh: 'SSD', es: 'SSD', ar: 'SSD', ru: 'SSD' },
  'history.ssrt': { en: 'SSRT', zh: 'SSRT', es: 'SSRT', ar: 'SSRT', ru: 'SSRT' },
  'history.stopSuccess': { en: 'Stop Success', zh: 'Stop 成功率', es: 'Éxito Stop', ar: 'نجاح الإيقاف', ru: 'Успех остановки' },
  'history.choices': { en: 'Choices', zh: '选项数', es: 'Opciones', ar: 'الخيارات', ru: 'Выборы' },

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

  'charts.current': { en: 'Current', zh: '本次', es: 'Actual', ar: 'الحالي', ru: 'Текущий' },
  'charts.avg7d': { en: '7d avg', zh: '7日均', es: '7d prom', ar: 'متوسط 7 أيام', ru: 'ср. за 7 дн.' },
  
  // Training page
  'training.title': { en: 'Automated Training', zh: '自动训练', es: 'Entrenamiento Automatizado', ar: 'التدريب الآلي', ru: 'Автоматическая тренировка' },
  'training.description': { en: 'The system runs a curated sequence. It auto-starts and saves each game; focus on performing.', zh: '系统将按顺序运行精选训练项目。每个训练会自动开始并保存；请专注于训练表现。', es: 'El sistema ejecuta una secuencia seleccionada. Inicia y guarda automáticamente cada juego; concéntrate en el rendimiento.', ar: 'يقوم النظام بتشغيل تسلسل منظم. يبدأ ويحفظ كل لعبة تلقائياً؛ ركز على الأداء.', ru: 'Система запускает подобранную последовательность. Автоматически запускает и сохраняет каждую игру; сосредоточьтесь на выполнении.' },
  'training.warmup': { en: 'Warmup', zh: '热身', es: 'Calentamiento', ar: 'الإحماء', ru: 'Разминка' },
  'training.metrics': { en: 'Metrics', zh: '指标', es: 'Métricas', ar: 'المقاييس', ru: 'Метрики' },
  'training.value': { en: 'Value', zh: '数值', es: 'Valor', ar: 'القيمة', ru: 'Значение' },
  'training.current_ms': { en: 'Current (ms)', zh: '当前 (ms)', es: 'Actual (ms)', ar: 'الحالي (مللي ثانية)', ru: 'Текущий (мс)' },
  'training.avg_ms': { en: '7d avg (ms)', zh: '7日均值 (ms)', es: 'Promedio 7d (ms)', ar: 'متوسط 7 أيام (مللي ثانية)', ru: 'Среднее за 7д (мс)' },
  'training.lower_better': { en: 'lower is better', zh: '数值越低越好', es: 'menor es mejor', ar: 'الأقل هو الأفضل', ru: 'чем ниже, тем лучше' },
  'training.higher_better': { en: 'higher is better', zh: '数值越高越好', es: 'mayor es mejor', ar: 'الأعلى هو الأفضل', ru: 'чем выше, тем лучше' },
  'training.recommendations': { en: 'Recommendations', zh: '建议', es: 'Recomendaciones', ar: 'التوصيات', ru: 'Рекомендации' },
  'training.rec1': { en: 'Practice daily; prioritize sleep and rest.', zh: '每日练习；注意保证睡眠和休息。', es: 'Practica diariamente; prioriza el sueño y el descanso.', ar: 'تدرب يومياً؛ أعط الأولوية للنوم والراحة.', ru: 'Тренируйтесь ежедневно; уделяйте внимание сну и отдыху.' },
  'training.rec2': { en: 'If RT > 7d average, shorten cue interval and reduce distractions next round.', zh: '如果反应时间高于7日均值，下轮缩短提示间隔并减少干扰。', es: 'Si el TR > promedio 7d, acorta el intervalo de señal y reduce las distracciones en la siguiente ronda.', ar: 'إذا كان زمن الاستجابة > متوسط 7 أيام، قصر فترة الإشارة وقلل المشتتات في الجولة القادمة.', ru: 'Если ВР > среднего за 7 дней, сократите интервал сигнала и уменьшите отвлекающие факторы в следующем раунде.' },
  'training.rec3': { en: 'If aim accuracy below average, increase target size then ramp difficulty.', zh: '如果瞄准准确率低于平均值，增大目标尺寸后再逐步提高难度。', es: 'Si la precisión de puntería está por debajo del promedio, aumenta el tamaño del objetivo y luego incrementa la dificultad.', ar: 'إذا كانت دقة التصويب أقل من المتوسط، زد حجم الهدف ثم ارفع الصعوبة تدريجياً.', ru: 'Если точность прицеливания ниже средней, увеличьте размер цели, затем постепенно повышайте сложность.' },
  'training.rec4': { en: 'For tap speed, try short (3s) sprints and focus on rhythm stability.', zh: '对于点击速度，尝试短时间（3秒）冲刺并注意保持节奏稳定。', es: 'Para la velocidad de toque, prueba sprints cortos (3s) y concéntrate en la estabilidad del ritmo.', ar: 'لسرعة النقر، جرب السباقات القصيرة (3 ثوان) وركز على ثبات الإيقاع.', ru: 'Для скорости нажатий попробуйте короткие (3с) спринты и сосредоточьтесь на стабильности ритма.' },
  
  // Summary metrics
  'summary.current_avg': { en: 'Current Average', zh: '本次平均', es: 'Promedio Actual', ar: 'المتوسط الحالي', ru: 'Текущее среднее' },
  'summary.current_best': { en: 'Current Best', zh: '本次最佳', es: 'Mejor Actual', ar: 'أفضل حالي', ru: 'Текущий лучший' },
  'summary.7d_avg': { en: '7-Day Average', zh: '7日均值', es: 'Promedio 7 días', ar: 'متوسط 7 أيام', ru: 'Среднее за 7 дней' },
  'summary.hits': { en: 'Hits', zh: '命中', es: 'Aciertos', ar: 'إصابات', ru: 'Попадания' },
  'summary.accuracy': { en: 'Accuracy', zh: '准确率', es: 'Precisión', ar: 'الدقة', ru: 'Точность' },
  'summary.duration': { en: 'Duration', zh: '时长', es: 'Duración', ar: 'المدة', ru: 'Длительность' },
  'summary.7d_avg_hits': { en: '7-Day Avg Hits', zh: '7日均命中', es: 'Promedio 7d aciertos', ar: 'متوسط الإصابات 7 أيام', ru: 'Ср. попаданий за 7д' },
  'summary.best_taps': { en: 'Best Taps', zh: '本次最佳', es: 'Mejor Toques', ar: 'أفضل النقرات', ru: 'Лучшие нажатия' },
  'summary.avg_interval': { en: 'Avg Interval', zh: '本次平均间隔', es: 'Intervalo Promedio', ar: 'متوسط الفاصل', ru: 'Средний интервал' },
  'summary.7d_avg_taps': { en: '7-Day Avg Taps', zh: '7日均点击', es: 'Promedio 7d toques', ar: 'متوسط النقرات 7 أيام', ru: 'Ср. нажатий за 7д' },
  'summary.avg_rt': { en: 'Average RT', zh: '平均RT', es: 'TR Promedio', ar: 'متوسط زمن الاستجابة', ru: 'Среднее ВР' },
  'summary.choices': { en: 'Choices', zh: '选项数', es: 'Opciones', ar: 'الخيارات', ru: 'Выборы' },
  'summary.congruent_avg': { en: 'Congruent Avg', zh: '一致平均', es: 'Promedio Congruente', ar: 'متوسط المتطابق', ru: 'Конгруэнтное среднее' },
  'summary.incongruent_avg': { en: 'Incongruent Avg', zh: '不一致平均', es: 'Promedio Incongruente', ar: 'متوسط غير المتطابق', ru: 'Инконгруэнтное среднее' },
  'summary.interference_cost': { en: 'Interference Cost', zh: '干扰成本', es: 'Costo de Interferencia', ar: 'تكلفة التداخل', ru: 'Стоимость интерференции' },
  'summary.go_accuracy': { en: 'Go Accuracy', zh: 'Go 正确率', es: 'Precisión Go', ar: 'دقة Go', ru: 'Точность Go' },
  'summary.nogo_accuracy': { en: 'No-Go Accuracy', zh: 'No-Go 正确率', es: 'Precisión No-Go', ar: 'دقة No-Go', ru: 'Точность No-Go' },
  'summary.valid_cue_avg': { en: 'Valid Cue Avg', zh: '有效提示平均', es: 'Promedio Señal Válida', ar: 'متوسط الإشارة الصالحة', ru: 'Среднее валидной подсказки' },
  'summary.invalid_cue_avg': { en: 'Invalid Cue Avg', zh: '无效提示平均', es: 'Promedio Señal Inválida', ar: 'متوسط الإشارة غير الصالحة', ru: 'Среднее невалидной подсказки' },
  'summary.switch_cost': { en: 'Switch Cost', zh: '转换成本', es: 'Costo de Cambio', ar: 'تكلفة التبديل', ru: 'Стоимость переключения' },
  'summary.avg_ssd': { en: 'Average SSD', zh: '平均SSD', es: 'SSD Promedio', ar: 'متوسط SSD', ru: 'Среднее SSD' },
  'summary.ssrt_est': { en: 'SSRT (Est.)', zh: 'SSRT（估计）', es: 'SSRT (Est.)', ar: 'SSRT (تقديري)', ru: 'SSRT (оценка)' },
  'summary.stop_success': { en: 'Stop Success', zh: 'Stop 成功率', es: 'Éxito Stop', ar: 'نجاح الإيقاف', ru: 'Успех остановки' },
  'summary.go_acc': { en: 'Go Accuracy', zh: 'Go 准确率', es: 'Precisión Go', ar: 'دقة Go', ru: 'Точность Go' }
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


