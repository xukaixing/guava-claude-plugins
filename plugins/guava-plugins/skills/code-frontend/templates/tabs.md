# 多 Tab 列表页

> [\_shared.md](../_shared.md) · [\_common.md](_common.md) · [page-types.md#tabs](../page-types.md#tabs)

生成 `<Base>Index.vue`，外层 `GvTabs`。**搜索-列表 Tab 的主体（script 方法 + GvForm/GvTable 模板）与 [crud.md](crud.md) §3 完全相同，直接复用，本文件只写差异。**

---

## 与 crud-module 的差异

| 项目 | crud-module | tabs |
| ---- | ----------- | ---- |
| 根容器 | `<div>` | `<GvTabs>` + `<GvTabPane>` |
| 搜索/表格 | 页面主体 | 仅 `search-table` Tab |
| Drawer Edit | add/edit 时 | `editMode: drawer` 时 |
| inline 保存 | — | `save{Component}Inline` |
| helper | Search/Table/Edit | 追加 `create{Feature}InlineEditList` |

---

## 模板

= [crud.md](crud.md) §3 模板 + 下列补丁：

| 增量点 | 内容 |
| --- | --- |
| import 追加 | `TabsPaneContext` 类型、`useUtil`、`create<Feature>EditList, create<Feature>InlineEditList` |
| @data 追加 | `activeTab = ref('list')`、`<feature>InlineFm`（FormInstance）、`<feature>InlineEditList` |
| @methods 追加 | `save<Feature>Inline`、`handleTabClick`（见下） |
| @bizData 追加 | `<feature>InlineEditList.value = create<Feature>InlineEditList({ dictCB, dictClearCB }).value` |
| template | 主体包进 `<GvTabs>`：搜索表单 + 列表放 `name="list"` 的 TabPane，内联表单放 `name="edit"` 的 TabPane（见下） |

```typescript
const save<Feature>Inline = async () => { const fm = <feature>InlineFm.value; if (!fm) return; try { const ok = await crud.save(fm, saveXxxApi); if (ok) message('success', '保存成功'); } catch (e) { message(e, 'error'); } };
const handleTabClick = (tab: TabsPaneContext) => { activeTab.value = tab.paneName as string; };
```

template 增量：

```vue
<GvTabs v-model="activeTab" @tab-click="handleTabClick">
  <GvTabPane name="list" :label="'查询-列表'">
    <!-- GvForm 搜索条件 + GvSearchBar：同 crud.md §3 -->
    <!-- GvTable + 工具栏按钮：同 crud.md §3 -->
  </GvTabPane>
  <GvTabPane name="edit" :label="'新增-修改'">
    <GvForm ref="<feature>InlineFm" ref-form="<feature>InlineFm" :divider="'编辑信息'" :form-list="<feature>InlineEditList" />
    <div class="form-actions"><GvButton type="primary" @click="save<Feature>Inline()">保存</GvButton></div>
  </GvTabPane>
</GvTabs>
<!-- <<Base>Edit ... />：editMode=drawer 时同 crud.md，:title 用 rowData?.id ? '编辑' : '新增' -->
```

- `i18n: true` 时 Tab label 走 `t()`，key 见 [i18n.md §5](i18n.md#5-tabs)
- frontendOnly 时 inline save 按 [\_common.md §4.3](_common.md#43-纯表单页-load--saveform-only) 写回 mock
