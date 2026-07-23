# 类型定义模板

> [_shared.md](../_shared.md)

生成 `types.d.ts`。**仅为 enabled CRUD 操作定义接口。**

## 全局类型（已存在，禁止重复定义）

- `TableRowFn` = `(row: Recordable<any>, index: number) => void`
- `DictSelectedFn` = `(row: Recordable<any>, field: string, dicType: string) => void`

## 模板

```typescript
// <feature>-表格页回调方法赋类型
export interface <Feature>TableActions {
  edit<Feature>: TableRowFn;   // ← only if 编辑
  delete<Feature>: TableRowFn; // ← only if 删除
  // ↓ 操作列自定义按钮时声明对应方法（如停用、详情等）
  // customAction: TableRowFn;
  // ↓ only if expand enabled: 展开行数据缓存
  // expandMap: Recordable<Recordable<any>>;
}

// <feature>-编辑页表单回调方法赋类型  ← only if 新增 or 编辑
export interface <Feature>EditActions {
  dictCB: DictSelectedFn;
  dictClearCB: DictSelectedFn;
}

// <feature>-编辑页子表格回调方法赋类型  ← only if 子表
export interface <Feature>EditTableActions {
  save<Feature>Dtl: TableRowFn;
  delete<Feature>Dtl: TableRowFn;
}
```

## 关键规则

- `TableActions` 仅包含选中的操作属性
- `EditActions` 仅当选中新增/编辑时生成
- `EditTableActions` 仅当选中子表格时生成
- 使用中文注释：`// <feature>-xxx回调方法赋类型`

## form-only

**仅生成** `FormActions`，不生成 `TableActions` / `EditActions` / `EditTableActions`。

```typescript
// <feature>-表单页回调方法赋类型
export interface <Feature>FormActions {
  dictCB: DictSelectedFn;
  dictClearCB: DictSelectedFn;
}
```

无字典字段时可省略 `dictCB` / `dictClearCB`，helper 工厂改为无参 `create<Feature>FormList = () => { ... }`。

## tabs

与 crud-module 相同，生成 `TableActions` + `EditActions`（Drawer 用）。

含 `inline-form` Tab 时追加（可与 `EditActions` 结构相同，二选一）：

```typescript
// <feature>-Tab 内嵌表单回调方法赋类型
export interface <Feature>InlineEditActions {
  dictCB: DictSelectedFn;
  dictClearCB: DictSelectedFn;
}
```

若 Index 与 Edit 共用 `EditActions`，可只生成一个 `EditActions` 接口。

---
