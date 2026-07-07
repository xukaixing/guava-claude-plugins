# 类型定义模板

生成 `src/views/<viewPath>/module/types.d.ts`（layout=module）或 `src/views/<viewPath>/types.d.ts`（layout=flat）。**仅为 enabled CRUD 操作定义接口。**

## 已存在文件

文件已存在时 **Write 整文件覆盖**，按当前配置的 CRUD enabled 状态重新生成。禁止跳过。

## 全局类型（已存在，禁止重复定义）

- `TableRowFn` = `(row: Recordable<any>, index: number) => void`
- `DictSelectedFn` = `(row: Recordable<any>, field: string, dicType: string) => void`

## 模板

```typescript
// <feature>-表格页回调方法赋类型
export interface <Feature>TableActions {
  edit<Feature>: TableRowFn;   // ← only if 编辑
  delete<Feature>: TableRowFn; // ← only if 删除
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
