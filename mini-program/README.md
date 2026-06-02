# 消消学英语 · 微信小程序版

原生小程序（不依赖 Taro/uni-app），可直接用**微信开发者工具**打开运行。

## 怎么打开

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开工具 → **导入项目** → 选择本目录 `mini-program/`
3. AppID 选"测试号"（也可填你自己的小程序 AppID）
4. 点击右上角"编译"即可在模拟器看到效果

## 当前页面

| 路径 | 说明 |
|---|---|
| `pages/home/index` | 主页：🐼 吉祥物 + 数据条 + 开始游戏 |
| `pages/game/index` | 游戏：散落消消乐 + 单词卡（中英双语+UK/US 音标）+ 3 个道具 |
| `pages/review/index` | 单词本：已学列表 + 星级 |
| `pages/about/index` | 关于 |

## 发音怎么搞

小程序里没有 SpeechSynthesis API。两种方案：

**方案 A：上传预生成 mp3（推荐）**
1. 在主项目里跑 `node scripts/gen-audio.mjs` 生成 `public/audio/*.mp3`
2. 把这些 mp3 复制到小程序的 `audio/` 目录（与 `pages/` 同级）
3. 也可上传到云存储（CDN），把 `utils/speech.js` 里的 URL 改成 CDN 地址

**方案 B：实时调云端 TTS**
- 调云函数（云开发）/ 你自己的后端 → 转发到 OpenAI TTS / 微软 Azure / 有道智云
- 后端返回 mp3 URL，前端 `wx.createInnerAudioContext()` 播放

`utils/speech.js` 已经预留了 `wx.createInnerAudioContext()` 调用框架。

## 后续要补的

- [ ] 每日签到页（参照主项目 `src/screens/DailyScreen.jsx`）
- [ ] 排行榜页（mock 数据先）
- [ ] 设置页（音乐/口音/目标）
- [ ] 背景音乐（用 `wx.createInnerAudioContext({ src: '/music/loop.mp3' })`）
- [ ] 单词数据从 12 词扩到 32 词（直接照搬主项目 `src/data/words.js`，去掉 ESM `export` 改成 `module.exports`）

## 体积与限制

微信小程序主包 < 2 MB，分包 < 20 MB 总。词库（emoji+文本）几 KB；
如果预生成 mp3 全部塞进主包会超，建议放 CDN。
