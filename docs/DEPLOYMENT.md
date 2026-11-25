# 部署与发布说明

面向维护者的部署、更新与验证流程。

## 目录

- [产物构成](#产物构成)
- [部署到静态托管](#部署到静态托管)
- [sharecode 约束](#sharecode-约束)
- [发布新版本](#发布新版本)
- [验证清单](#验证清单)
- [迁移到其他平台](#迁移到其他平台)

---

## 产物构成

应用是纯静态站点，共 9 个运行文件，无任何构建步骤或运行时依赖：

| 文件 | 作用 |
| :--- | :--- |
| `index.html` | 应用主体，内联全部 CSS / JS / 数据 |
| `crossfit-offline.html` | 与 `index.html` 内容完全一致的离线快照 |
| `manifest.json` | PWA 配置 |
| `sw.js` | Service Worker，缓存与版本管理 |
| `icon-180.png` / `icon-192.png` / `icon-512.png` | 主屏幕与 PWA 图标 |
| `favicon-32.png` / `favicon-64.png` | 浏览器标签图标 |

文档文件（`README.md`、`CHANGELOG.md`、`LICENSE`、`docs/`）不参与运行，但建议一并部署，便于访问者了解项目。

## 部署到静态托管

1. 将上述文件放在同一目录；
2. 站点必须通过 **HTTPS** 提供（Service Worker 的硬性要求，`localhost` 除外）；
3. 确保 `sw.js`、`manifest.json`、图标文件可从站点根路径或相对路径访问；
4. 首次发布后，用浏览器打开站点，确认 Service Worker 注册成功。

当前线上地址（WorkBuddy 静态托管）：

```
https://a9269491c75fe5d9c.app.workbuddy.host/?sharecode=SBB6EUCR4K
```

## sharecode 约束

⚠️ **当前托管平台的关键约束**：所有请求必须携带 `?sharecode=SBB6EUCR4K`，否则返回 **403**。

已经落实的位置：

- `index.html` 中 `<link rel="manifest">`、`<link rel="apple-touch-icon">`、`<link rel="icon">` 的 `href`；
- `index.html` 中 Service Worker 的 `navigator.serviceWorker.register('sw.js?sharecode=...')`；
- `manifest.json` 的 `start_url`: `./?sharecode=SBB6EUCR4K`；
- `manifest.json` 中所有图标 `src`；
- `sw.js` 的预缓存资源列表；同时内置兜底逻辑：导航请求遇到 403 时回退到缓存的应用页面。

> 这段历史 Bug 曾导致 PWA 打开后页签与版权都不显示、Service Worker 从未注册。修改任何路径时务必保留参数。

## 发布新版本

标准流程（在 `/workspace/crossfit-pwa` 下执行）：

```bash
# 1. 修改 index.html 后，先做语法检查
python3 - <<'EOF'
import re, subprocess, tempfile, os
s = open('index.html').read()
ok = True
for sc in re.findall(r'<script>(.*?)</script>', s, re.S):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
        f.write(sc); p = f.name
    if subprocess.run(['node', '--check', p], capture_output=True).returncode:
        ok = False
    os.unlink(p)
print('PASS' if ok else 'FAIL')
EOF

# 2. 同步离线快照
cp index.html crossfit-offline.html

# 3. 递增 sw.js 缓存名（如 crossfit-wod-v32 → v33）
#    并更新 index.html 页脚的版本号（如 版本 v2.16。→ v2.17。）

# 4. 发布
node /root/.codebuddy/skills/sites/scripts/publish.js \
  --dir /workspace/crossfit-pwa --language static
```

**数据结构变化时的额外步骤**：

1. 把 `index.html` 里的 `DATA_VER` 加 1；
2. 在 `CHANGELOG.md` 中明确标注破坏性变更；
3. 导入兼容逻辑需同步扩展（在 `rtkgCustom.adds` 的新键补齐、新存储键的规范化分支中增加处理）；
4. 发布后验证旧备份仍能导入。

## 验证清单

发布后逐项确认：

- [ ] `curl` 检查各资源带 sharecode 时返回 200（不带应返回 403，属预期）；
- [ ] 页脚版本号已更新；
- [ ] Service Worker 注册成功并接管页面（`navigator.serviceWorker.controller` 非空）；
- [ ] 底部 6 个页签贴底显示、可正常切换；
- [ ] 字典三模块渲染数量正确（13 / 65 / 176）；
- [ ] 各模块编辑弹窗字段回填正确，保存、还原默认值、删除可用；
- [ ] 新增 / 删除条目后数量文字同步变化；
- [ ] 「刷新本页面」进度条走完并自动刷新；
- [ ] 导出 / 导入备份可用，旧格式备份可导入；
- [ ] 无 JavaScript 运行时报错。

推荐用无头浏览器做端到端验证（Playwright + 390×844 视口模拟 iPhone）：

```bash
node /tmp/verify-pwa.js   # 页面渲染、SW 注册、页签可见性
node /tmp/verify2.js      # 模块渲染数量、按钮存在性
node /tmp/verify3.js      # 编辑弹窗字段回填
node /tmp/verify4.js      # 数量随增删同步
```

## 迁移到其他平台

如果换到其他静态托管（不再强制 sharecode）：

1. 删除 `index.html` 中所有 URL 上的 `?sharecode=SBB6EUCR4K`；
2. 把 `manifest.json` 的 `start_url` 改为 `./`，图标 `src` 去掉查询参数；
3. 把 `sw.js` 预缓存列表中的参数去掉，并移除 403 导航兜底逻辑（如不再需要）；
4. 确认新站点为 HTTPS；
5. 新域名意味着不同的 origin，**本地数据不会随域名迁移**——需引导用户先在旧站导出备份，再到新站导入；
6. 若主屏幕图标变更，用户需删除旧图标重新添加。
