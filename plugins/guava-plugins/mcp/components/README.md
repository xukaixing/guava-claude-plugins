# Guava 组件 MCP（plugin 内）

安装 `guava-plugins@guava-tools` 后自动连接。用法来自 `usage.json`；props 来自消费项目的 `guava-ui`。

共 **27** 个。

| MCP | 用法 | npm 类型 |
| --- | --- | --- |
| `gv-anchor` | `anchor.md` → usage.json | ✓ |
| `gv-badge` | `badge.md` → usage.json | ✓ |
| `gv-body-dialog` | `bodyDialog.md` → usage.json | ✓ |
| `gv-button` | `button.md` → usage.json | ✓ |
| `gv-card` | `card.md` → usage.json | ✓ |
| `gv-cascader` | `cascader.md` → usage.json | ✓ |
| `gv-checkbox` | `checkbox.md` → usage.json | ✓ |
| `gv-checkbox-button` | `checkboxbutton.md` → usage.json | ✓ |
| `gv-checkbox-group` | `checkboxgroup.md` → usage.json | ✓ |
| `gv-col` | `col.md` → usage.json | ✓ |
| `gv-dialog` | `dialog.md` → usage.json | ✓ |
| `gv-drawer` | `drawer.md` → usage.json | ✓ |
| `gv-form` | `form.md` → usage.json | ✓ |
| `gv-input` | `input.md` → usage.json | ✓ |
| `gv-input-number` | `inputNumber.md` → usage.json | ✓ |
| `gv-popover` | `popover.md` → usage.json | ✓ |
| `gv-radio` | `radio.md` → usage.json | ✓ |
| `gv-radio-button` | `radiobutton.md` → usage.json | ✓ |
| `gv-radio-group` | `radiogroup.md` → usage.json | ✓ |
| `gv-row` | `row.md` → usage.json | ✓ |
| `gv-search-bar` | `searchBar.md` → usage.json | ✓ |
| `gv-select` | `select.md` → usage.json | ✓ |
| `gv-table` | `table.md` → usage.json | ✓ |
| `gv-tabs` | `tabs.md` → usage.json | ✓ |
| `gv-tree` | `tree.md` → usage.json | ✓ |
| `gv-upload` | `upload.md` → usage.json | ✗ |
| `gv-validate` | `validate.md` → usage.json | ✗ |

```bash
# 作者机（有 press）更新用法快照
CLAUDE_PROJECT_DIR=/path/to/ses-web node mcp/generate-components.mjs
```
