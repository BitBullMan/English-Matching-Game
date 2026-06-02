# 消消学英语 · English Match Game

一款"羊了个羊"式的英语学习小游戏：找到 **3 张相同的卡片** 即可消除，每次消除会弹出该词的 **英文 / 中文 / 英美音标 / 英美发音 / 例句 / 记忆点**。

```
点击 → 进托盘 → 凑齐 3 张同款 → 消除 → 弹卡学单词
```

## 功能总览

| 板块 | 说明 |
|---|---|
| 🏠 主页 | 🐼 熊猫吉祥物 + 大"开始游戏"按钮 + 数据条 + 侧栏入口 |
| 🎮 游戏 | 草地散落 5 词×6 张 3 层；连击 ×N；3 个卡通道具（移出/撤回/洗牌） |
| 📚 单词本 | 按 6 个主题筛选；已学带星级，未学锁定 |
| 📅 每日签到 | 7 天循环奖励（金币+道具），保留连续天数 |
| 🏆 排行榜 | Mock 数据，你按词数插入正确名次（接后端后变真实） |
| ⚙️ 设置 | 音乐开关 / 曲风（Kawaii Pop / 8-bit Retro）/ 音效 / 默认口音 / 每日目标 / TTS 引擎信息 |
| ℹ️ 关于 | 玩法、词库、路线图 |

## 技术栈

- **React 18 + Vite** — 轻量、热重载、构建快（产物 ~180 KB / gzip ~62 KB）
- **Web Audio 合成音乐** — 0 mp3 / 0 授权风险 / 离线可用
- **多 provider 语音** — 浏览器 SpeechSynthesis 默认；可切到 OpenAI gpt-4o-mini-tts；支持预生成 mp3 缓存
- **localStorage 持久化** — 金币、已学词、学习次数、设置、签到全自动保存
- **圆润卡通字体** — Fredoka (英文) + ZCOOL KuaiLe (中文)，渐变彩色标题
- **纯 CSS** — 无外部 UI 库，包体小、便于嵌入 WebView / 微信 H5

## 本地运行

```bash
npm install
npm run dev
# → http://localhost:5173
```

## 构建 & 部署

```bash
npm run build      # 产物在 dist/，base 已设为 './'
npm run preview    # 本地预览
```

部署到 Vercel / Netlify / Cloudflare Pages：构建命令 `npm run build`，输出目录 `dist`。

## 三种发布形态 ✅ 全部就绪

### 1) Web ✅
现成可用，dist 丢任何静态托管都行。

### 2) 移动 App（iOS / Android）✅ — Capacitor 已集成

依赖、配置、原生桥接、状态栏/启动屏/返回键全部就绪。打包步骤：

```bash
# 一次性初始化（生成 ios/ 和 android/ 目录）
npm run cap:add:ios       # 需要 macOS + Xcode
npm run cap:add:android   # 需要 Android Studio + JDK 17

# 后续每次代码改动后
npm run ios               # 自动 build → sync → 打开 Xcode
npm run android           # 自动 build → sync → 打开 Android Studio
```

在 Xcode / Android Studio 里点 Run 即可在模拟器/真机上跑。

特性：
- 启动屏粉色（与主页背景一致）
- 状态栏自动深色文字
- iOS safe-area / Android 返回键自动处理
- App 进后台时自动暂停音乐
- 详见 `capacitor.config.ts` + `src/utils/native.js`

### 3) 微信小程序 ✅ — 原生小程序已就绪

不依赖 Taro/uni-app，直接用微信开发者工具打开 `mini-program/` 目录就能跑。

```
mini-program/
├── app.json / app.js / app.wxss
├── project.config.json
├── pages/
│   ├── home/      ← 主页（吉祥物+开始游戏）
│   ├── game/      ← 散落消消乐+单词卡（含双语扩展）
│   ├── review/    ← 单词本
│   └── about/     ← 关于
└── utils/
    ├── words.js   ← 词库（CommonJS）
    ├── level.js   ← 关卡生成（与主项目同算法）
    └── speech.js  ← 发音（接 wx.createInnerAudioContext）
```

详见 `mini-program/README.md`。

## 🔊 接入 OpenAI TTS（类人语音）

默认走浏览器 SpeechSynthesis，免费但音质看系统。要类人音质：

### 方式 A：预生成 mp3（推荐）
```bash
export OPENAI_API_KEY=sk-xxxx
node scripts/gen-audio.mjs    # 用 gpt-4o-mini-tts 一次性生成所有词
# → public/audio/<id>-uk.mp3 / <id>-us.mp3
```
全词库 32 词×2 ≈ $0.10 一次性成本，之后零延迟、离线可用。

### 方式 B：运行时实时调用
复制 `.env.example` → `.env.local`：
```
VITE_TTS_PROVIDER=openai
VITE_OPENAI_TTS_PROXY=https://你的后端/tts   # 推荐走代理保护 key
VITE_OPENAI_TTS_MODEL=gpt-4o-mini-tts
VITE_OPENAI_VOICE_UK=ash
VITE_OPENAI_VOICE_US=sage
```

**⚠️ Arbor 音色：** 你截图里的 Arbor / Breeze / Cove 等是 ChatGPT 应用 **Realtime API** 专属，TTS REST API 没有。API 里最接近 Arbor "easygoing & versatile" 的是 `ash`（英音感）和 `sage`（美音感）。

## 🎵 背景音乐

Web Audio 现场合成，2 种曲风可在设置里切换：

| 曲风 | 风格 | 特点 |
|---|---|---|
| 🎮 Kawaii Pop | 类 Lingokids | C-Am-F-G 卡农圈 + 跳跃旋律 + 鼓 |
| 👾 8-bit Retro | 类宝可梦城镇 | 全方波 + arpeggio + 八度 bass |

特性：
- 背景音乐独立母线，**音量低**（0.12）不抢戏
- **朗读时自动 ducking** — 单词发音时音乐降到 0.02，1.5 秒后渐回，保证听清发音
- 设置里"🎵 背景音乐"开关 = 静音选项
- 想换真实 mp3：`music.js` 顶部 `ENGINE = 'mp3'` + 放文件到 `public/music/loop.mp3`

## 词库扩展

`src/data/words.js` 按 schema 添加：

```js
{
  id: 'velcro',
  emoji: '🧷',
  english: 'Velcro',
  chinese: '魔术贴',
  ipa_uk: '/ˈvel.krəʊ/',
  ipa_us: '/ˈvel.kroʊ/',
  category: 'daily',
  // —— 词卡"深入了解"展开后显示 (中英双语，<20 字) ——
  example_en: "Kid's sneakers have Velcro straps.",
  example_zh: '小孩的运动鞋用魔术贴。',
  memo_en: 'French velours (velvet) + crochet (hook).',
  memo_zh: '法语"天鹅绒"+"钩子"，灵感来自牛蒡刺果。',
  tip_en: 'UK and US both use Velcro.',
  tip_zh: '英美都说 Velcro。'
}
```

## 难度调节

`src/screens/GameScreen.jsx` 里的 `defaultLevelOpt()`：

| 字段 | 含义 | 推荐 |
|---|---|---|
| `wordCount` | 一关用多少词 | 5–10 |
| `triplesPerWord` | 每词几组 (×3 张) | 1–3 |
| `layers` | 层数 | 2–5 |
| `boardW / boardH` | 棋盘大小 (px) | 280–380 |

## 目录结构

```
.
├── index.html               ← 加载 Google Fonts
├── package.json
├── vite.config.js
├── scripts/
│   └── gen-audio.mjs        ← 一次性生成 OpenAI TTS mp3
└── src
    ├── main.jsx
    ├── App.jsx              ← 多屏路由状态机
    ├── styles.css           ← 卡通主题
    ├── data/
    │   └── words.js         ← 词库（带双语扩展字段）
    ├── game/
    │   └── level.js         ← 散落关卡 + 遮挡判定
    ├── utils/
    │   ├── speech.js        ← 多 provider 发音 + 自动 duck
    │   ├── music.js         ← 2 曲风背景音乐
    │   └── store.js         ← localStorage 持久化
    ├── components/
    │   ├── Board.jsx
    │   ├── Tray.jsx
    │   ├── Tools.jsx        ← 卡通 3 色按钮
    │   ├── WordCard.jsx     ← 词卡 + 双语扩展
    │   └── Decorations.jsx
    └── screens/
        ├── HomeScreen.jsx
        ├── GameScreen.jsx
        ├── ReviewScreen.jsx
        ├── DailyScreen.jsx
        ├── SettingsScreen.jsx
        ├── RankingScreen.jsx
        └── AboutScreen.jsx
```
