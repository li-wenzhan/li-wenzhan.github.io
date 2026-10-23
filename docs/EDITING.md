# 主页内容编辑入口

英文默认页面为 `/`，中文为 `/zh/`。每个版本均包含关于我、研究成果、个人经历、研究方向四个页面。内容由本地数据构建，页面不需要数据库或后台登录。

## 常用编辑入口

| 内容 | 文件 |
| --- | --- |
| 英文简介、News、教育工作、论文 | [`_data/profile.json`](../_data/profile.json) |
| 对应中文内容 | [`_data/profile.zh.json`](../_data/profile.zh.json) |
| 按钮、导航、标题文字 | [`_data/i18n.json`](../_data/i18n.json) |
| 语言菜单名称、短标签和路径 | [`_data/languages.json`](../_data/languages.json) |
| 导师、实验室及机构的官方链接 | [`_data/links.json`](../_data/links.json) |
| 预留的荣誉与奖励 | [`_data/honors.json`](../_data/honors.json) |

请修改数据源，然后运行 `npm run build`。`index.html`、`zh/index.html` 及各子页面为生成结果，直接修改 HTML 的内容会在下次构建时被覆盖。本轮作者在 HTML 中修改的博士开始时间（2026 年 8 月）与 CoRL 录用时间（2026 年 9 月）已经同步回数据源。

## 添加 News

在两个语言版本的 `news` 数组中各添加一项。两种语言使用相同的唯一 `id` 和 `date`；`label`、`text`、`tag` 分别翻译。

- `date` 使用 `YYYY-MM` 或 `YYYY-MM-DD`，以已确认的时间精度为准。
- 构建时按日期自动倒序排列，较新的消息在最上方。同月消息保持数据中的先后顺序。
- `anchor` 可省略，或写成 `publications/#pub-dada`、`experience/#education` 这样的站内路径；构建时自动加入语言前缀。
- 超出 News 区域的消息可用鼠标滚轮、触控、滚动条或键盘上下键查看。打印时展开完整列表。
- RA 任职区间已确认为 2025 年 8 月至 2026 年 4 月。按作者要求，News 仅保留开始消息，结束时间展示在个人经历中。

## 维护语言菜单

导航栏使用“地球图标 + 当前语言”的下拉菜单，选项以各语言自身的名称显示，当前语言带勾号。菜单支持鼠标、触控、方向键、Tab 与 Esc；即使浏览器禁用 JavaScript，仍可展开并使用普通链接切换语言。

菜单选项集中在 [`_data/languages.json`](../_data/languages.json)。增加语言前，先完成对应语言的数据、页面生成、互链与翻译，再加入选项；只增加菜单名称不会自动翻译网页。切换语言保留当前子页面，启用 JavaScript 时也保留章节锚点。

## 启用荣誉与奖励板块

此板块已实现，当前 `en` 和 `zh` 都是空数组，因此网页不显示标题、空白占位或导航。以后在 [`_data/honors.json`](../_data/honors.json) 中填写真实获奖信息即可；每项包含：

| 字段 | 内容 |
| --- | --- |
| `year` | 获奖年份，字符串 |
| `title` | 奖项完整名称 |
| `organization` | 颁奖单位 |
| `url` | 可选，官方奖项或获奖名单的 HTTPS 链接 |

英文和中文数组按同一顺序填写相同条目。重新构建后，板块会出现在个人经历页面，并自动加入本页目录。无需修改布局或公开个人管理入口。

添加新的中文内容后，运行 `python tools/chinese-fonts.py` 更新本地字体子集，再运行 `npm run build`。更新内容后预览 `/` 与 `/zh/`，确认两个版本事实与日期一致。

## DADA 与 WPBP

WPBP @ ICRA 2026 是 DADA 的扩展摘要口头报告，不单独计为第五篇论文。相关标签、摘要链接和说明保存在 DADA 的 `workshop` 字段；中文补充说明使用 `workshopNote`。录用日期采用作者提供邮件中的 2026 年 4 月 11 日。

## 提交与发布

完成构建与检查后，使用英文提交说明，格式为 `Type(module): Summary`，空行后列出详细改动。每次本地 commit 后立即 push 同一分支；GitHub Actions 发布到 `https://li-wenzhan.github.io/`。
