## 反应力训练 Reaction Trainer

一个包含多种反应力训练小游戏的前端应用，内置历史记录与个性化建议。

- 反应时 Reaction Time
- 点靶 Aim Trainer
- 序列记忆 Sequence Memory
- Go/No-Go 抑制控制

### 本地运行

```bash
pnpm i # 或 npm i / yarn
pnpm dev # 默认端口 5175
```

### 数据持久化
- 所有记录保存在浏览器 localStorage，键：`reaction_trainer_history_v1`

### 目录结构
```
reaction-trainer/
  src/
    games/
    pages/
    contexts/
    styles/
```


