# 类型定义

> [\_shared.md](../_shared.md)

生成 `types.d.ts`。**仅为 enabled CRUD 操作定义接口。**

---

## 全局类型（禁止重复定义）

- `TableRowFn` = `(row: Recordable<any>, index: number) => void`
- `DictSelectedFn` = `(row: Recordable<any>, field: string, dicType: string) => void`

---

## 模板

```typescript
// <feature>-表格页回调方法赋类型
export interface <Feature>TableActions {
  edit<Feature>: TableRowFn;    // ← only if 编辑
  delete<Feature>: TableRowFn;  // ← only if 删除
  // ↓ 操作列自定义按钮时声明对应方法
  // customAction: TableRowFn;
  // ↓ only if expand enabled
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

---

## 关键规则

- `TableActions` 仅包含选中的操作属性
- `EditActions` 仅当选中新增 / 编辑时生成
- `EditTableActions` 仅当选中子表格时生成

---

## form-only

**仅生成** `FormActions`：

```typescript
// <feature>-表单页回调方法赋类型
export interface <Feature>FormActions {
  dictCB: DictSelectedFn;
  dictClearCB: DictSelectedFn;
}
```

无字典字段时可省略 `dictCB` / `dictClearCB`，helper 工厂改为无参。

---

## tabs

与 crud-module 相同。含 `inline-form` Tab 时追加：

```typescript
// <feature>-Tab 内嵌表单回调方法赋类型
export interface <Feature>InlineEditActions {
  dictCB: DictSelectedFn;
  dictClearCB: DictSelectedFn;
}
```

---

## 多 Tab 页（Variant D）

含 `## 标签页` 时，根据 Tab type 追加对应类型：

### Tab table 类型

```typescript
// <feature>-编辑页 Tab 表格回调方法赋类型（only if type=table Tab）
export interface <Feature><TabName>TableActions {
  save<Feature><TabName>: TableRowFn;
  delete<Feature><TabName>: TableRowFn;
}
```

> TabName 为 `name` 字段转 PascalCase（如 `orderDtl` → `OrderDtl`）

### Tab form 类型

```typescript
// <feature>-编辑页 Tab 表单回调方法赋类型（only if type=form Tab）
export interface <Feature>TabEditActions {
  dictCB: DictSelectedFn;
  dictClearCB: DictSelectedFn;
}
```

> 仅当 type=form 的 Tab 含字典字段时生成
