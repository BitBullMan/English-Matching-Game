# 📱 iOS / Android 完整打包上架指南

**应用名**：消消学英语 (English Match)
**Bundle ID**：`com.englishmatch.app`
**版本**：1.0.0 (build 1)
**架构**：React + Vite (web) + Capacitor 8 (native shell)

---

## 0. 一句话流程

```bash
# 本地从 0 → 真机
git clone … && cd "English Gaming app"
npm install
npm run cap:sync          # build web + 同步到 ios/ android/
npm run ios               # 打开 Xcode（macOS 必需）
npm run android           # 打开 Android Studio
```

> 仓库里 `ios/App/App/public/` 与 `android/app/src/main/assets/public/` 已被 `.gitignore` 排除（80 MB），
> `cap sync` 会从 `dist/` 重新拷贝，所以**每次拉新代码后第一件事必跑 `npm run cap:sync`**。

---

## 1. 环境准备 (一次性)

### macOS (iOS + Android 都行)
| 工具 | 安装 | 用途 |
|---|---|---|
| Xcode 15+ | App Store | iOS 真机 / 模拟器 / Archive |
| CocoaPods | `sudo gem install cocoapods` | iOS 依赖管理 |
| Android Studio | https://developer.android.com/studio | Android 真机 / 模拟器 / aab 打包 |
| Node 20+ | `brew install node` | 项目本身 |
| JDK 17 | Android Studio 自带 | Gradle 构建 |

### Windows / Linux (仅 Android)
Android Studio + JDK 17 + Node 20，跳过 iOS 章节。

### 首次 iOS pods 同步
```bash
cd ios/App
pod install
cd ../..
```

---

## 2. 修改图标 / 启动屏

1. 编辑 `assets/make-icon.py`（颜色/emoji/布局），跑 `python3 assets/make-icon.py`
2. 重新生成所有尺寸：
   ```bash
   npm run assets:generate
   ```
3. `cap sync` 自动会把新图带进 native 工程。

源图说明：
- `assets/icon.png` — 1024×1024，主图
- `assets/icon-foreground.png` — 1024×1024，Android 自适应前景（留 safe area）
- `assets/icon-background.png` — 1024×1024，Android 自适应背景（纯色）
- `assets/splash.png` / `splash-dark.png` — 2732×2732，启动屏

---

## 3. iOS 打包 → App Store

### 3.1 在 Xcode 里跑
```bash
npm run ios   # = build + cap sync + cap open ios
```
Xcode 打开 `ios/App/App.xcworkspace`（**不是 .xcodeproj**）。

### 3.2 配置签名
1. 在 Xcode 顶栏选 **App** 这个 target → **Signing & Capabilities**
2. **Team**：选你的 Apple Developer 个人或公司账号（$99/年）
3. **Bundle Identifier**：保持 `com.englishmatch.app`（如冲突改成自己的反向域名，比如 `com.yourname.englishmatch`，同步改 `capacitor.config.ts` 里的 `appId` 后再 `cap sync`）
4. Xcode 自动 Provisioning Profile，勾上 "Automatically manage signing"

### 3.3 真机测试
1. 数据线连 iPhone，顶栏目标选你的设备
2. 第一次运行：iPhone 上 设置 → 通用 → VPN与设备管理 → 信任开发者证书
3. ▶️ Run

### 3.4 Archive 上传 App Store
1. 顶栏目标改成 **Any iOS Device (arm64)**
2. 菜单 **Product → Archive**（5–10 分钟）
3. Organizer 窗口弹出 → **Distribute App → App Store Connect → Upload**
4. 等审核状态变绿（约 10 分钟后到 App Store Connect）

### 3.5 App Store Connect 配置
打开 https://appstoreconnect.apple.com：
- **App 信息**：名称 `消消学英语`、副标题 `Match-3 学英语`、类别 `教育 > 词汇 / 游戏 > 益智`
- **隐私问卷**：本 App **不收集任何用户数据**（所有进度本地 localStorage） → 选「不收集数据」
- **加密合规**：Info.plist 已声明 `ITSAppUsesNonExemptEncryption = false`
- **截图**：6.7" iPhone Pro Max + iPad 12.9"（用 Xcode Simulator 截）
- **审核备注**：写一句 "Vocabulary game, no login, no IAP"
- **提交审核**：通常 24–48h 出结果

---

## 4. Android 打包 → Google Play

### 4.1 打开 Android Studio
```bash
npm run android  # = build + cap sync + cap open android
```

### 4.2 生成签名 keystore（一次性，**务必备份**）
```bash
cd android/app
keytool -genkey -v -keystore keystore.jks -alias englishmatch \
  -keyalg RSA -keysize 2048 -validity 10000
# 提示输入：密码（记下！）、姓名、城市等
```

**⚠️ keystore.jks + 密码丢了就再也升级不了 App，先存到 1Password 之类的密码管理器。**

### 4.3 配置 release 签名
新建 `android/key.properties`（已在 `.gitignore`）：
```properties
storePassword=你的keystore密码
keyPassword=你的key密码
keyAlias=englishmatch
storeFile=keystore.jks
```

编辑 `android/app/build.gradle`，在 `android {` 块里加：
```groovy
signingConfigs {
    release {
        def keystoreProperties = new Properties()
        def keystorePropertiesFile = rootProject.file('key.properties')
        if (keystorePropertiesFile.exists()) {
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
        }
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
    }
}
```

### 4.4 打 aab (Google Play 必需格式)
```bash
cd android
./gradlew bundleRelease
# 产物：android/app/build/outputs/bundle/release/app-release.aab
```

### 4.5 Google Play Console 上架
打开 https://play.google.com/console（一次性注册费 $25）：
1. 创建应用 → 应用名 `消消学英语`、默认语言 `中文 (简体)`
2. 应用类别：**教育**
3. 内容分级：填问卷（无暴力/广告 → 全年龄段 3+）
4. 数据安全：选「不收集数据」
5. 测试 → 内部测试 → 上传 `app-release.aab`
6. 商店详情：标题、简短描述、完整描述、图标、特征图、截图（最少 2 张手机截图）
7. 提交审核（首次 7 天内出结果，后续更新通常 24h）

---

## 5. 版本号更新流程

| 端 | 文件 | 字段 |
|---|---|---|
| package.json | `"version"` | 1.0.0 → 1.0.1 |
| iOS | `ios/App/App.xcodeproj/project.pbxproj` | `MARKETING_VERSION` (用户可见) + `CURRENT_PROJECT_VERSION` (build号必递增) |
| Android | `android/app/build.gradle` | `versionName "1.0.0"` + `versionCode 1` (build号必递增) |

> Xcode 也可以在 General 标签里点改，不用动文本。

---

## 6. 常见坑

### iOS 白屏 / 没声音
- 没跑 `cap sync` → `public/` 是空的
- iOS Safari 需要用户手势才能播放音频 → 我们已经在首次点击时 `unlockSpeech()` 处理

### Android `INSTALL_FAILED_UPDATE_INCOMPATIBLE`
- 之前装过 debug 包，先卸载 → 装 release 包

### App Store 审核被拒：「主要功能与 web 版无差异」
- 苹果有时会卡 Capacitor 类的 webview 包装应用
- 解决：申诉时强调 **离线音频包（41 MB mp3 已打包）+ 本地进度持久化 + 锁屏后台行为**，这些是浏览器版没有的

### 包体积超 100 MB（App Store 限制）
- 当前预生成 mp3 = ~41 MB，加上 React/native bin = ~60 MB 总，**安全**
- 如果之后扩到 3000 词 mp3 → ~250 MB，需要分包：
  - iOS：用 `on-demand resources`
  - Android：用 `Play Asset Delivery`

### Cloudflare Pages / Vercel web 版同时部署
- web 端: `npm run build` → 提交 dist/ 或让 CI 跑
- mobile 端: 独立 `cap sync`，两端代码 100% 共用

---

## 7. CI/CD（可选）
- **iOS**: GitHub Actions + [`fastlane`](https://fastlane.tools) + App Store Connect API key → 一键 Archive + Upload
- **Android**: GitHub Actions + `./gradlew bundleRelease` + Play Developer API → 一键发到内部测试通道

模板见 `docs/CI_TEMPLATES.md`（待补充）

---

## 8. 上架检查清单

### iOS 提交前
- [ ] Bundle ID 与 App Store Connect 一致
- [ ] 版本号 + Build 号都递增
- [ ] App 图标已替换（不是 Xcode 占位图）
- [ ] 启动屏正常
- [ ] 真机跑过 30 分钟无崩溃
- [ ] 截图 6.7" 5 张
- [ ] 隐私政策 URL（如收集数据则必需，我们不收集 → 不需要）

### Android 提交前
- [ ] `keystore.jks` 已备份到 1Password / 多端
- [ ] versionCode + versionName 都递增
- [ ] `app-release.aab` 已通过 bundletool 验证
- [ ] 至少 2 张手机截图 + 特征图 1024×500
- [ ] 内容分级问卷已填
- [ ] 数据安全声明已填

---

完成上面的清单就可以提交审核。祝上架顺利 🚀
