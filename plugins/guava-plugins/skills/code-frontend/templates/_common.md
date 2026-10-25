# 公共片段（跨模板唯一真相）

> crud / edit / form / tabs / free / info 模板共用下列片段。**引用本文件，禁止在模板内重复展开。**

---

## 1. Vue 文件头注释

每个 `*.vue` 文件顶部必须带：

```vue
<!--
 * @title: <模块中文标题>
 * @author: <git user.email>
 * @date: <current YYYY-MM-DD HH:mm:ss>
 * @LastEditors: <git user.name>
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>
 * @version: 1.0.1
-->
```

> 覆盖已存在文件：保留 `@date`，更新 `@LastEditTime`，递增 `@version`（见 [\_shared.md](../_shared.md#覆盖策略)）。

---

## 2. i18n 开关

| `i18n` | 行为 |
| ------ | ---- |
| `false`（**默认**） | label / 文案直接写中文；**不** `import useI18n`，不用 `t()` |
| `true` | label 用 `t('<i18nKey>.xxx')`；`import { useI18n } from '@/hook/web/useI18n'` + `const { t } = useI18n()` |

> i18n: true 时的 key 规则与 zh-CN / en 模板见 [i18n.md](i18n.md)。

---

## 3. dictCB / dictClearCB 字典回调桩

helper 工厂的字典字段需要 `cb` / `clear` 回调，调用方声明：

```typescript
const dictCB = (_, __, ___) => {};
const dictClearCB = (_, __, ___) => {};
```

> 风格变体：form.md / tabs.md 用类型标注版 `const dictCB: DictSelectedFn = (_res, _field, _dicType) => {};`，语义相同，按所在模板示例为准。

---

## 4. frontendOnly 数据流（`frontendOnly: true`）

**禁止 `@/api` import**；数据来自 [data.md](data.md)（列表）或本文件内 mock（表单）。三种形态：

### 4.1 列表页查询 / 删除（crud / tabs）

```typescript
const search<Feature>List = async () => {
  const fm = <feature>SearchFm.value;
  try {
    const query = fm ? getFormModel(fm) || {} : {};
    search<Feature>Data.value = getListResult(filterListRecords(query), { current: 1, size: search<Feature>Data.value?.size || 10 });
  } catch (e) { message(e, 'error'); }
};

const delete<Feature> = (row, index) => {
  confirm('确认删除？').then(async () => {
    try {
      if (row.id) { mockListRecords.splice(mockListRecords.findIndex((r) => r.id === row.id), 1); search<Feature>List(); message('删除成功', 'success'); }
      else crud.removeResult(search<Feature>Data.value, index);
    } catch (e) { message(e, 'error'); }
  }).catch(() => {});
};
```

### 4.2 编辑页保存（edit）

保存不调 API，向父组件抛 `saved`：

```typescript
const <feature>Save = async () => {
  const fm = <feature>EditFm.value;
  if (!fm) return;
  try {
    const model = getFormModel(fm) || {};
    if (props.rowData?.id) emit('saved', { type: 'update', data: { ...props.rowData, ...model }, rownums: props.rowData?.rownums });
    else emit('saved', { type: 'insert', data: { ...model, id: model.id || `local-${Date.now()}` } });
  } catch (e) { message(e, 'error'); }
};
```

### 4.3 纯表单页 load / save（form-only）

```typescript
// load：mockFormModel 写入表单（onMounted 时）
try { crud.setEditValue(<feature>FormList.value, mockFormModel); } catch (e) { message(e, 'error'); }

// save：校验后写回 mockFormModel
const save<Feature> = async () => {
  const fm = <feature>FormFm.value;
  if (!fm) return;
  try {
    await fm.validate();
    Object.assign(mockFormModel, getFormModel(fm) || {});
    message('保存成功', 'success');
  } catch (e) { /* 校验失败或异常 */ }
};
```
