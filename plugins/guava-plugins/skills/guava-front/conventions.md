# 代码规范 & 命名

> 流程 [\_shared.md](_shared.md) · 项目 [../../README.md](../../README.md)

## 代码风格

- **全局类型** — `ItemForm`、`TableHeadItem`、`Recordable` 是全局类型，禁止 import
- **element-plus 类型** — `FormInstance`、`TableInstance` 从 `element-plus` 按需导入
- **`@section` 注释** — 所有 Vue 组件使用以下分区标记（禁止数字注释）：

```
// @define name    → defineOptions
// @props          → defineProps
// @emit           → defineEmits
// @hook           → store / composable (useAppStore, useUtil 等)
// @data           → 所有 ref() 声明
// @computed       → computed() 属性
// @watch          → watch() / watchEffect()
// @methods        → 所有 const 箭头函数 + JSDoc
// @bizData        → helper .value 赋值
// @mounted        → onMounted / onUnmounted
```

- **禁止** `function` 关键字 → 始终使用 `const fn = () => {}`
- **禁止** `reactive` → 仅使用 `ref`
- **禁止** import 带 `.ts` / `.js` 扩展名
- **禁止** 纯 `any` → 使用 `Recordable<any>`
- 单引号、分号、2 空格缩进
- `<style scoped lang="scss">` + BEM 命名
- 文件顺序：`<script setup lang="tsx">` → `<template>` → `<style scoped lang="scss">`
- 组件名：`defineOptions({ name: '...' })`
- Vue 方法使用多行 JSDoc（**禁止**单行 `/** @todo xxx */`）
- API 函数使用单行注释：`// xxx api`

### Vue 方法 JSDoc 模板

`@methods` 分区下每个 `const` 箭头函数**必须**使用以下多行格式（含 `@author:`、`@Date:` 两行，冒号后保留空格）：

```ts
/**
 * @todo: <方法中文说明>
 * @author: <git user.name>
 * @Date: <current YYYY-MM-DD HH:mm:ss>
 */
const methodName = () => { ... };
```

有参数时追加 `@param`，有返回值时追加 `@return`：

```ts
/**
 * @todo: 编辑用户
 * @author: <git user.name>
 * @Date: <current YYYY-MM-DD HH:mm:ss>
 * @param row 当前行数据
 * @param _index 行索引
 */
const editUser = (row: Recordable<any>, _index: number) => { ... };
```

## UI 组件（Guava UI / guava-ui）

生成或修改 **Vue `<template>`** 时：

- **优先** 使用 npm 包 `guava-ui` 封装的 **`Gv*` 组件**
- **仅当** `guava-ui` 中**不存在**对应 `Gv*` 封装时，才允许使用 Element Plus 的 **`el-*` 标签**（或 `El*` 组件）
- 使用前须通过插件 MCP **`guava-ui`** / **`gv-*`**（`get_usage` / `get_props` / `resolve_gv_component`）确认；**禁止**在已有 `Gv*` 时仍写 `el-*`

表单/表格字段优先通过 `helper.tsx` 的 `FormItem[]` / `TableHeadItem[]` + `GvForm :form-list` / `GvTable :table-head` 配置驱动（`type: text | dic | date | textarea` 等），**不要**在 template 手写 `<el-input>`、`<el-select>` 等（若 `GvForm` 已支持该字段类型）。

### 常用对照

| Element Plus（无 Gv* 时回退） | 优先使用 (Guava UI)                             |
| ------------------------------- | ----------------------------------------------- |
| `el-form`                       | `GvForm`                                        |
| `el-table`                      | `GvTable`                                       |
| `el-button`                     | `GvButton`                                      |
| `el-dialog`                     | `GvDialog`                                      |
| `el-drawer`                     | `GvDrawer`                                      |
| `el-select`                     | `GvSelect`，或 form-list `type: dic`            |
| `el-input`                      | `GvInput`，或 form-list `type: text / textarea` |
| `el-tabs` / `el-tab-pane`       | `GvTabs` / `GvTabPane`                          |
| `el-row` / `el-col`             | `GvRow` / `GvCol`                               |
| `el-card`                       | `GvCard`                                        |
| `el-divider`                    | `GvDivider`                                     |
| `el-tree`                       | `GvTree`                                        |
| `el-upload`                     | `GvUpload`                                      |
| `el-icon`                       | `GvIcon`                                        |

页面级常用组合：`GvForm` + `GvSearchBar` + `GvButton`（搜索区）、`GvTable`（列表）、`GvDrawer` / `GvDialog`（编辑容器）。

### 例外

- **类型**：`FormInstance`、`TableInstance` 等 ref 类型可从 `element-plus` 导入（已在上方说明）
- **无 Gv* 封装**：`guava-ui` 未提供的组件 → 使用对应 `el-*`（如 `GvTimeline` 不存在时用 `el-timeline`）
- **存量代码**：修改已有 legacy 页面时可与周边保持一致

## Vue 文件头

```vue
<!--
 * @title: <Feature Name in Chinese>
 * @author: <author email>         ← 可选：只读 `git config user.email`，或直接写已知邮箱
 * @date: <current YYYY-MM-DD HH:mm:ss>  ← 文件首次创建时的系统时间
 * @LastEditors: <author name>     ← 可选：只读 `git config user.name`，或直接写已知姓名
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>  ← 每次修改时的系统时间
 * @version: 1.0.1
-->
<script setup lang="tsx">
```

获取方式：

- `@author` / `@LastEditors`: 可只读 `git config` 获取，或直接填写；**禁止**为此执行 add/commit 等 git 仓库操作
- `@date` / `@LastEditTime`: 使用当前系统时间，格式 `YYYY-MM-DD HH:mm:ss`
- 新建文件时 `@date` = `@LastEditTime`；修改文件时**不修改 `@date`**，只更新 `@LastEditors` + `@LastEditTime` + `@version`

## 版本号规则

每次修改文件时，**必须递增文件头部 `@version`**（`@date` 保持不变）：

- 末位 +1（如 `1.0.1` → `1.0.2`）
- 末位到 10 时进位：`1.0.9` → `1.1.0`
- 中位到 10 时进位：`1.9.9` → `2.0.0`
- 同时更新 `@LastEditors` 和 `@LastEditTime`

## 目录结构

**`src/views/` 下的目录 = YAML `view` 原文**，与 `src/pages/**/*.md` 路径无关。  
例：`view: sysMng/userMng2` → `src/views/sysMng/userMng2/`（不是 `userMng`）。

两种布局，由配置 `layout` 决定：

### layout=module（系统管理常用）

```
src/views/<view>/                 ← 例 view: sysMng/userMng2
├── UserIndex.vue                 ← Index 在 view 根目录；文件名由 feature/component 推导
└── module/
    ├── helper.tsx
    ├── types.d.ts
    └── UserEdit.vue
```

### layout=flat（业务模块常用）

```
src/views/<view>/                 ← 例 view: svcProduct/svcLead/salesSkills
├── SalesSkillsIndex.vue
├── SalesSkillsEdit.vue
├── helper.tsx
└── types.d.ts
```

## 命名参考

| 项目               | 规范                           | 示例                      |
| ------------------ | ------------------------------ | ------------------------- |
| viewPath           | **= YAML `view` 原文**         | `sysMng/userMng2`         |
| componentBaseName  | PascalCase，去 Mng 后缀        | `User`, `SalesSkills`     |
| 列表页             | `<Base>Index.vue`              | `UserIndex.vue`           |
| 编辑页             | `<Base>Edit.vue`               | `UserEdit.vue`            |
| 纯表单页           | `<Base>.vue`（form-only）      | `SystemConfig.vue`        |
| Helper 文件        | `helper.tsx`                   | `helper.tsx`              |
| Types 文件         | `types.d.ts`                   | `types.d.ts`              |
| API 文件           | `src/api/<apiModule>.ts`       | `admin/user.ts`           |
| GvForm ref         | `<feature>SearchFm`            | `userSearchFm`            |
| GvForm form-list   | `<feature>SearchList`          | `userSearchList`          |
| GvTable ref        | `<feature>TableList`           | `userTableList`           |
| GvTable table-head | `<feature>TableHeadList`       | `userTableHeadList`       |
| GvTable table-data | `search<Feature>Data`          | `searchUserData`          |
| API 函数           | `verb+Entity+Api`              | `findUsersApi`            |
| 查询方法           | `search*`                      | `searchUserList`          |
| 编辑方法           | `edit*` / `<feature>Edit`      | `editUser`                |
| 删除方法           | `delete*`                      | `deleteUser`              |
| 新增方法           | `add*` / `<feature>Add`        | `addUser`                 |
| 保存回调           | `save*Info`                    | `saveUserInfo`            |
| SearchList 工厂    | `create<Feature>SearchList`    | `createUserSearchList`    |
| TableHead 工厂     | `create<Feature>TableHeadList` | `createUserTableHeadList` |
| EditList 工厂      | `create<Feature>EditList`      | `createUserEditList`      |

### Legacy 模式（勿用于新页面）

旧页面可能使用 `buildSearchFilter` / `buildUserHeadList`、硬编码中文 label、无 i18n。
新页面统一用 `create*List` 工厂 + `useI18n()` + `t('i18nKey.field')`。

## FormItem format 参考

`format: [required, validator, maxlength, decimal?]`

- 查询条件与编辑/form 表单：**validator 均必填**
- 查询条件：`required` 固定为 `0`
- `isDouble` 时第 4 位为小数位数，如 `[0, 'isDouble', 10, 4]`
- 校验类型完整列表（对齐 guava-ui `gv.validate.ts`）见 [search-conditions.md](search-conditions.md)

## crud API 参考

| 方法                                    | 用途                      |
| --------------------------------------- | ------------------------- |
| `crud.search(fm, table, api)`           | 带搜索表单的列表查询      |
| `crud.searchNoFm(table, api, filter)`   | 无搜索表单的查询（子表）  |
| `crud.save(fm, api, hasMsg?)`           | 新增保存                  |
| `crud.update(fm, id, api)`              | 更新保存                  |
| `crud.submit(api, data)`                | 通用提交（删除/状态变更） |
| `crud.setEditValue(list, row)`          | 编辑模式填充表单          |
| `crud.resetEditValue(list)`             | 新增模式重置表单          |
| `crud.insertResult(data, row)`          | 列表插入行                |
| `crud.updateResult(data, row, rownums)` | 列表更新行                |
| `crud.removeResult(data, index)`        | 列表删除行                |
| `crud.fetchTable(api, filter)`          | 获取表格数据              |

## API 复用规则

生成页面时，**优先检查已有 API 文件**，避免重复创建：

- 先 Glob `src/api/<apiModule>.ts`（如 `admin/user`、`svcProduct/clueChannelCreation`）
- 若已有对应接口函数（如 `findXxxApi` / `saveXxxApi` / `updateXxxApi` / `deleteXxxApi`），**直接 import 使用**
- 仅当 API 文件不存在，或缺少必要接口时，才生成新的 API 函数
- import 路径：`@/api/<apiModule>`（无扩展名）
- 远程字典常用：`findDictFromTableApi` from `@/api/admin/user` 或同模块 API 文件
