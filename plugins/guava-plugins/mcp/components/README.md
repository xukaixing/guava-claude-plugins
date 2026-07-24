# Guava 组件 MCP（plugin 内）

安装 `guava-plugins@guava-tools` 后自动连接。用法来自 `usage.json`；props 来自消费项目的 `guava-ui`。

共 **53** 个（含 1 个工具 MCP `gv-crud`）。

## 表单类

| MCP | 说明 | npm 类型 |
| --- | --- | --- |
| `gv-form` | 配置驱动表单（FormItem[]） | ✓ |
| `gv-search-bar` | 查询区按钮栏 | ✓ |
| `gv-input` | 输入框 | ✓ |
| `gv-input-number` | 数字输入 | ✓ |
| `gv-select` | 下拉选择 | ✓ |
| `gv-cascader` | 级联选择 | ✓ |
| `gv-date-picker` | 日期选择 | ✓ |
| `gv-time-picker` | 时间选择 | ✓ |
| `gv-switch` | 开关 | ✓ |
| `gv-checkbox` | 复选框 | ✓ |
| `gv-checkbox-button` | 按钮式复选 | ✓ |
| `gv-checkbox-group` | 复选框组 | ✓ |
| `gv-radio` | 单选 | ✓ |
| `gv-radio-button` | 按钮式单选 | ✓ |
| `gv-radio-group` | 单选组 | ✓ |
| `gv-upload` | 上传 | ✗ |
| `gv-validate` | 校验规则 | ✗ |

## 数据类

| MCP | 说明 | npm 类型 |
| --- | --- | --- |
| `gv-table` | 配置驱动表格（TableHeadItem[]） | ✓ |
| `gv-table-bar` | 表格工具栏 | ✓ |
| `gv-tree` | 树 | ✓ |
| `gv-tag` | 标签 | ✓ |
| `gv-badge` | 徽标 | ✓ |

## 操作类

| MCP | 说明 | npm 类型 |
| --- | --- | --- |
| `gv-button` | 按钮（权限/确认/bizType） | ✓ |
| `gv-icon` | 图标 | ✓ |
| `gv-popconfirm` | 气泡确认 | ✓ |

## 反馈类

| MCP | 说明 | npm 类型 |
| --- | --- | --- |
| `gv-dialog` | 对话框 | ✓ |
| `gv-body-dialog` | Body 级对话框 | ✓ |
| `gv-drawer` | 抽屉 | ✓ |
| `gv-export-dialog` | 导出对话框 | ✓ |
| `gv-popover` | 气泡卡片 | ✓ |

## 布局类

| MCP | 说明 | npm 类型 |
| --- | --- | --- |
| `gv-row` | 栅格行 | ✓ |
| `gv-col` | 栅格列 | ✓ |
| `gv-card` | 卡片 | ✓ |
| `gv-divider` | 分割线 | ✓ |
| `gv-scroll-pane` | 滚动容器 | ✓ |

## 导航类

| MCP | 说明 | npm 类型 |
| --- | --- | --- |
| `gv-tabs` | 标签页 | ✓ |
| `gv-tab-pane` | 标签页面板 | ✓ |
| `gv-steps` | 步骤条 | ✓ |
| `gv-step` | 步骤项 | ✓ |
| `gv-bread-crumb` | 面包屑 | ✓ |
| `gv-anchor` | 锚点 | ✓ |
| `gv-backtop` | 回到顶部 | ✓ |

## 壳类

| MCP | 说明 | npm 类型 |
| --- | --- | --- |
| `gv-sidebar` | 侧边栏（布局壳） | ✓ |
| `gv-sidebar-logo` | 侧边栏 Logo | ✓ |
| `gv-expand-menu` | 展开菜单 | ✓ |
| `gv-tags-view` | 多页签视图 | ✓ |
| `gv-hamburger` | 折叠菜单按钮 | ✓ |
| `gv-screen-full` | 全屏切换 | ✓ |
| `gv-lang-select` | 语言切换 | ✓ |
| `gv-theme` | 主题切换 | ✓ |

## 其他

| MCP | 说明 | npm 类型 |
| --- | --- | --- |
| `gv-timeline` | 时间线 | ✓ |
| `gv-timeline-item` | 时间线项 | ✓ |
| `gv-crud` | CRUD 工具函数 | — |

---

```bash
# 作者机（有 press）更新用法快照
CLAUDE_PROJECT_DIR=/path/to/ses-web node mcp/generate-components.mjs
```
