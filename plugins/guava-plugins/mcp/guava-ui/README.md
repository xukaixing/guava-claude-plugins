# guava-ui MCP（catalog）

随 **guava-plugins** 分发。见上级 [../README.md](../README.md) 与插件根 `.mcp.json`。

运行时：
- props：`${CLAUDE_PROJECT_DIR}/node_modules/guava-ui`（类型定义）
- 用法：各 `components/Gv*/usage.json` + `usage.md`

## 已更新组件（2026-07-24）

| 组件 | 更新内容 |
|------|---------|
| `GvForm` | props 对齐源码（refForm/formList/divider/isDivider/size/labelWidth/formStyle/scroller） |
| `GvTable` | props 对齐源码（新增 maxWidth/expandRowKeys/limitHeight/tableAction/tableActionIcon/preserveExpanded 等；移除 stripe，内部固定为 true） |
| `GvValidate` | 对齐 `gv.validate.ts` 源码，补充 `isLength`、`isTelephone`；示例覆盖全部 19 个校验规则 |
| `GvCrud` | **新增**，对齐 `gv.crud.ts` 源码，覆盖全部 13 个 CRUD 工具方法（search/save/update/setEditValue 等） |

## 注意事项

- `GvTable` 的 `stripe`（斑马纹）在组件内部固定为 `true`，无需传入
- `GvTable` 的 `border` 默认为 `true`，`tableType === 'detail'` 时自动为 `false`
- `GvForm` 的 `labelWidth` 默认值为 `100`
