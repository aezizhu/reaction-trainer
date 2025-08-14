## Reaction Trainer

A multi-game cognitive training web app focused on reaction time, inhibition control, hand-eye coordination, and working memory. It records local history and generates lightweight personalized insights.

- Reaction Time
- Aim Trainer
- Sequence Memory
- Go/No-Go
- Stroop
- Tap Speed
- Posner Cue
- Stop-Signal
- Choice Reaction (CRT)

### Quick Start

```bash
cd /Users/aezi/CascadeProjects/reaction-trainer
pnpm i
pnpm dev  # opens http://localhost:5175
```

If pnpm is not installed:
```bash
brew install pnpm
# or: npm i -g pnpm
# or: corepack enable && corepack prepare pnpm@latest --activate
```

### Data Persistence
- All records are stored in browser localStorage under key: `reaction_trainer_history_v1`
- Preferences are stored under key: `reaction_trainer_prefs_v1`

### Project Structure
```
reaction-trainer/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  src/
    main.tsx
    App.tsx
    styles/global.css
    contexts/
      HistoryContext.tsx
      I18nContext.tsx
    pages/
      Home.tsx
      Insights.tsx
      Settings.tsx
      UnifiedTraining.tsx
    games/
      ReactionTime.tsx
      AimTrainer.tsx
      SequenceMemory.tsx
      GoNoGo.tsx
      Stroop.tsx
      TapSpeed.tsx
      PosnerCue.tsx
      StopSignal.tsx
      ChoiceRT.tsx
```

### Internationalization (i18n)
- Built-in language switcher in the top bar. Supported languages: English (en), Chinese (zh), Spanish (es), Arabic (ar), Russian (ru).
- Implemented via `src/contexts/I18nContext.tsx` with a small in-app dictionary.

### Build
```bash
pnpm build
```

### License
MIT



