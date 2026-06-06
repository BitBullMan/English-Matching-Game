# 📊 消消学英语 — 项目状态总览

**版本**: v1.0.0
**最后更新**: 2026-06-06
**仓库**: https://github.com/BitBullMan/English-Matching-Game
**线上**: https://english-matching-game.vercel.app + Cloudflare Pages 镜像

---

## ✅ 刚完成（这一轮迭代的 P0/P1 修复 + 优化）

| # | 改动 | 状态 |
|---|---|:---:|
| 修空白方块 bug | VOCAB_3000 无 emoji 触发空白 → 加文字 fallback | ✅ |
| 主题关卡数据污染 | body-2 显示 "Hands" 文字 → 过滤 v_ 严格只取 base | ✅ |
| 5 个次级页面 i18n | Settings/Daily/Ranking/Review/About 全双语 | ✅ |
| 游戏顶部"关卡 1-1"硬编码 | 改成 "🍎 水果入门" 真实 stage 名 | ✅ |
| Topic 卡难度 ⭐ → 文字标签 | 入门(绿)/进阶(蓝)/中级(黄)/高级(红)/挑战(黑金) | ✅ |
| 游戏退出确认弹窗 | 误点 ← 不丢进度 | ✅ |
| 新手 3 步 onboarding | 首次进游戏自动弹引导 | ✅ |
| vocab top 500 配 emoji | OpenAI 智能映射 498/500 | ✅ |
| vocab 词卡用大图 | Pexels 248 张真实照片 + WordCard v2 | ✅ |
| vocab 101-500 词 mp3 | 补 436 个 -us/-zh mp3 | ✅ |
| vocab 500 例句/memo mp3 | 2000 个 _ex/_memo mp3 全齐 | ✅ |
| **UK voice 换 fable** | coral 女声 → fable 英音男声，重生成 718 个 | ✅ |
| Stages 标题 "Topics/主题" | 比 "Levels/关卡选择" 更准确 | ✅ |

---

## 📦 资产规模

| 资源 | 当前数量 | 备注 |
|---|---|---|
| 词库总数 | 3150 词 | base 218 (含 100 短语) + vocab 2932 |
| 关卡 (Stages) | 30 个 | 主题 22 + vocab 5 + mixed 2 + 旅游短语 10 |
| 预生成 mp3 | **4599 个** | base 词全齐 + vocab top 500 全齐 |
| 真实场景图 (Pexels) | **346 张** | base 98 + vocab top 248 |
| 字体 | Inter + Manrope + Noto Sans SC | 网络字体 CDN |
| Icon 库 | lucide-react (1945 icons) | tree-shake |

---

## 🚧 还没做完 — 可以继续做

### 优先级 P0（影响首次体验）

#### A. Pexels 限速重置后续下 vocab 252 张图
- 当前 248/500 vocab 已下，**剩 252 张**等 Pexels 200/h 配额重置
- 跑：`node scripts/fetch-pexels.mjs --target vocab --limit 500` （脚本自动续）
- 用 base WORDS 也有 98 张图但实际游戏方块 emoji 优先（用户偏好），仅词卡里偶尔用

#### B. vocab 501-3000 没 emoji / 没 mp3 / 没图
- 这 2432 个低频词（"approximately", "throughout" 之类）目前进游戏方块时显示文字 fallback
- 但**当前只有 5 个 vocab 关卡用到（top100/200/300/400/500），不会触发 501+**
- 除非用户扩展更多 vocab 关卡，否则**不紧急**
- 如要补：成本 ~$10 mp3 + ~$3 emoji（OpenAI gpt-4o-mini）

### 优先级 P1（提升留存）

#### C. 金币系统消费场景（task #88）
- 当前 6000+ 金币只涨不消费
- 方案：(A) 删金币 (B) 开商店买工具 (C) 解锁高级关卡（soft 付费墙）
- **延后**：用户当时说"不着急，到时候再说"

#### D. 词卡里的某些 vocab 词例句质量参差
- 例句是 OpenAI 第一次批量生成的（task #60），有少量是"讲述句"非"实用句"
- 如 Quote → "I will quote a famous author today" 偏书面
- 修复：跑 `node scripts/rewrite-examples.mjs --target vocab` 重写（已有脚本，~$3）

### 优先级 P2（长期增值）

#### E. SRS 间隔重复算法
- 现在复习页只按"已学/未学"+ 掌握度排序
- 加 Anki 风格 SM-2 算法 → "今天该复习的 N 个词"
- 工作量：~1 天

#### F. 云端账号 / 同步
- localStorage 只本地，换设备数据丢
- 接 Supabase / Firebase auth + sync
- 工作量：~2-3 天

#### G. AI 助教（词卡里的"问一下"按钮）
- 接 GPT-4o-mini，用户输入 "give me 5 more example sentences" 之类
- 工作量：~半天

#### H. WeChat 小程序版本
- 已有 Taro 3 scaffold（/miniapp/）
- 需要补登录 + 上架
- 工作量：~2-3 天

#### I. AI 生成自定义关卡
- 用户输入 "我想学医疗英文" → GPT 生成 20 个医疗词 + 例句 + mp3
- 工作量：~1 周

---

## 🔥 现成可上线 — 立刻能做的事

### 1. iOS App Store
- ios/ 工程已就绪（Capacitor 8 + Bundle ID + 图标 + 启动屏）
- 你需要：Apple Developer 账号 $99/年
- 文档：`docs/MOBILE_DEPLOY.md` 完整步骤
- 时间：1-2 周审核

### 2. Google Play
- android/ 工程已就绪
- 你需要：Google Play Console $25 一次性
- 文档同上
- 时间：首次 7 天，后续 24h

### 3. 国内 Android 商店（华为/小米/OV/腾讯应用宝）
- 需要营业执照 + 软著
- 渠道包要做 ASA / Adjust 追踪
- 工作量：~1 周（如果有执照）

---

## 🐛 已知小问题（不影响主流程）

- 关卡 picker 严格 v_ 过滤后，某些主题词池可能 < 3 词（关卡会自动隐藏）
- iOS Safari 首次点 🔊 仍需 1 次"激活" — 已通过 unlockSpeech() 处理
- vocab 词 image fallback 顺序：vocab 词 + image → 用图；无 image → emoji；无 emoji → 文字（这个链路稳定，但 252 个 vocab 词在限速期内仍走 emoji）

---

## 📈 下一步建议（按价值排序）

1. **本周做**：跑完 vocab 252 张 Pexels 图（限速重置后 1 次脚本搞定）
2. **本周做**：iOS / Android 真机 + 模拟器联调测试
3. **本月做**：选 1-2 个 P1 项（金币系统 OR vocab 例句重写）
4. **决定后做**：上 App Store 还是先做 PWA install prompt 提升 web 留存
5. **战略层**：如要做 SaaS 订阅，先做账号系统（task F）
