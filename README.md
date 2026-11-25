<div align="center">

# MyCrossfitWod

**MyCFWod** — 装在口袋里的 CrossFit 训练手册

[![version](https://img.shields.io/badge/version-v2.16-9ece00?style=flat-square)](CHANGELOG.md)
[![platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-4078c0?style=flat-square)](docs/USAGE.md)
[![stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JavaScript-ef8c1c?style=flat-square)](#技术实现)
[![license](https://img.shields.io/badge/license-Proprietary-d9534f?style=flat-square)](LICENSE)

[在线体验](https://a9269491c75fe5d9c.app.workbuddy.host/?sharecode=SBB6EUCR4K) · [使用手册](docs/USAGE.md) · [更新日志](CHANGELOG.md) · [部署说明](docs/DEPLOYMENT.md)

</div>

---

## 项目简介

**MyCrossfitWod**（简称 **MyCFWod**）是一款为零构建依赖设计的 CrossFit 训练 PWA。它把随机训练计划生成、真实课表、WOD 索引、热身套路、训练计时器、1RM 配重换算和训练历史整合进一个单文件 Web 应用，可添加到手机主屏幕离线使用。

所有个人数据（自定义条目、重量记录、训练历史、计时预设）**仅保存在设备本地**，不上传任何服务器。

> **一句话概括**：打开就能用、离线也能用、数据自己掌握的 CrossFit 训练工具。

## 功能一览

应用采用单屏架构，底部固定 6 个页签：

| 页签 | 核心功能 |
| :--- | :--- |
| **训练计划** | 从 161 个真实训练日、16 天网友分享课、65 个力量/技术模板、101 个 WOD 中随机组合；支持「按此课表训练」「按此计划定时」一键跳转 |
| **课表** | 真实训练日与网友分享课，按标签折叠、搜索；每条可编辑、新增、还原默认值 |
| **WOD** | 101 个 WOD 索引，支持搜索与双选组合、内置小闹钟；可编辑、新增 |
| **热身** | 5 套套路（举重日 / 体操技巧日 / 有氧与 WOD 日 / 无器械通用版等），可编辑、新增 |
| **计时器** | 准备 → 锻炼 → 休息 → 完成状态机；支持 EMOM / AMRAP / Tabata / 间歇与「每 X 分钟 × N 组」等预设；项目清单歌词式高亮、轮转模式、蜂鸣提示、屏幕常亮 |
| **字典** | 专业术语 13 条、技术模板 65 个、技术动作 176 个，三模块均可编辑、新增 |

贯穿全站的辅助能力：

- **1RM 配重换算** — 录入一次最大重量后实时计算各百分比配重
- **重量与记录备忘** — 折叠式记录区，条目可编辑
- **训练历史** — 自动记录训练内容并支持一键复现
- **数据备份** — 导出/导入 JSON 文件，iOS 上可存入「文件」App 的任意文件夹
- **数据版本保护** — 涉及数据结构变化时先提示备份；导入旧备份自动规范化兼容
- **刷新本页面** — 带进度条的缓存清理与 Service Worker 重注册
- **备注气泡** — 标题旁的 `?` 提供要领说明，桌面悬停、触屏点按
- **搜索与计数** — 各模块数量随条目增删实时同步

## 快速开始

### 在线使用

直接用 Safari 打开 [在线地址](https://a9269491c75fe5d9c.app.workbuddy.host/?sharecode=SBB6EUCR4K)。

### 添加到主屏幕（推荐）

1. 在 **Safari** 中打开在线地址；
2. 点击底部「共享」按钮 → 「添加到主屏幕」；
3. 名称默认为 **MyCrossfitWod**（简称 MyCFWod），确认添加；
4. 从主屏幕图标启动，即可全屏、离线使用。

详细步骤与 Android / 桌面浏览器说明见 [使用手册](docs/USAGE.md)。

### 首次使用建议

先到「训练计划」页最下方点 **导出备份**，把当前数据存一份到「文件」App。以后换机或清理网站数据前，导入这个文件即可完整恢复。

## 数据管理

应用使用以下本地存储键：

| 存储键 | 内容 | 类型 |
| :--- | :--- | :--- |
| `rtkgCustom` | 各页签的编辑与新增内容（`edits` / `adds` 结构） | 对象 |
| `rtkgRecs` | 1RM 与重量记录 | 数组 |
| `rtkgHist` | 训练历史 | 数组 |
| `rtkgTimerPresets` | 自定义计时预设 | 数组 |
| `rtkgDataVer` | 数据结构版本号 | 数字 |

**兼容性设计**

- 刷新与版本更新**不会清除** localStorage，原有数据原样保留；
- 只有当某次更新真正改变数据结构时，才会在加载和刷新前弹窗提示先导出备份；
- 导入备份时自动补全缺失模块、过滤格式异常的旧数据，因此旧版本备份也能继续导入。

⚠️ 删除主屏幕图标、清除网站数据或使用无痕模式，都会导致本地数据丢失，请定期导出备份。

## 技术实现

| 层面 | 方案 |
| :--- | :--- |
| 应用形态 | 单文件 `index.html`，内联全部 HTML / CSS / JavaScript 与静态数据，零构建、零第三方运行时依赖 |
| 界面架构 | `body[data-tab]` + `switchTab()` 单屏切换，固定底部 tabbar，适配 iOS 安全区 |
| 离线能力 | Service Worker 预缓存 + 导航请求兜底（缓存名 `crossfit-wod-v32`） |
| PWA 元数据 | `manifest.json` 定义独立显示模式、名称、图标 |
| 数据持久化 | `localStorage`，导出/导入为 JSON 文件 |
| 声音与屏幕 | Web Audio API 蜂鸣；Wake Lock API 屏幕常亮（依赖 iOS 18.5+ 主屏幕 PWA） |
| 数据规模 | 161 个训练日 + 16 天分享课 + 101 个 WOD + 65 个技术模板 + 176 个技术动作 + 13 条术语 |

**平台适配说明**：当前托管平台要求所有资源请求携带 `?sharecode=SBB6EUCR4K`，否则返回 403。因此 manifest 的 `start_url`、图标路径、Service Worker 注册路径均带该参数。迁移到其他托管环境时需同步调整，详见 [部署说明](docs/DEPLOYMENT.md)。

## 项目结构

```text
MyCrossfitWod/
├── index.html              # 应用主体（内联 CSS / JS / 数据）
├── crossfit-offline.html   # 与 index.html 同步的离线快照
├── manifest.json           # PWA 配置（名称、图标、启动地址）
├── sw.js                   # Service Worker（缓存与版本管理）
├── icon-180.png            # iOS 主屏幕图标
├── icon-192.png            # PWA 图标
├── icon-512.png            # PWA 高清图标
├── favicon-32.png          # 浏览器标签图标
├── favicon-64.png          # 浏览器标签高清图标
├── README.md               # 项目说明（本文件）
├── CHANGELOG.md            # 版本更新日志
├── LICENSE                 # 版权声明
├── docs/
│   ├── USAGE.md            # 使用手册
│   └── DEPLOYMENT.md       # 部署与发布说明
└── .gitignore
```

## 本地预览

无需安装依赖，任选一种方式：

```bash
# 方式一：Python 静态服务器
cd /workspace/crossfit-pwa
python3 -m http.server 8080
# 打开 http://localhost:8080/

# 方式二：Node.js
npx serve /workspace/crossfit-pwa
```

> 本地 `http://localhost` 环境下 Service Worker 可正常注册；带 `?sharecode=` 的完整资源路径仅在当前线上托管环境需要。

## 已知限制

1. **图标更新需重加主屏幕**：iOS 会缓存主屏幕图标，更新图标后需删除旧图标再重新添加。
2. **本地数据不可跨设备自动同步**：PWA 无 iCloud 同步接口，换机需通过导出/导入迁移。
3. **内置条目的编辑按标题定位**：若后续版本修改了内置条目标题，基于旧标题的自定义修改可能不再匹配。
4. **导入为全量覆盖**：导入备份会覆盖当前设备上的现有数据，操作前会有确认提示。
5. **屏幕常亮依赖系统支持**：需 iOS 18.5+ 且从主屏幕启动的 PWA。
6. **动作库联动**：技术动作的修改会同步影响随机生成器的动作抽选。

## 许可与版权

© 2026 RTKG. All rights reserved.

本项目为**专有软件**，版权归 RTKG 所有。未经许可，不得复制、修改、分发、转发或商用。详见 [LICENSE](LICENSE)。

内容整理自 AMRAP PERFORM 课表，仅供本人训练参考。CrossFit 是 CrossFit, Inc. 的商标，本项目与之无关联。
