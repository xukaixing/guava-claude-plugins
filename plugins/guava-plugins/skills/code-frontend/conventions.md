# 代码规范 & 命名

> 流程 [\_shared.md](_shared.md) · 项目 [../../README.md](../../README.md)

---

## 1. 代码风格

### 类型

| 类型 | 来源 |
|------|------|
| `FormItem`、`TableHeadItem`、`Recordable` | 全局类型（`types/app.d.ts`），**禁止 import** |
| `FormInstance`、`TableInstance` | 从 `element-plus` 按需导入 |

### @section 注释（禁止数字注释）

```
// @define name    → defineOptions
// @props          → defineProps
// @emit           → defineEmits
// @hook           → composable / hook 调用
// @data           → ref() 声明
// @computed       → computed()
// @watch          → watch() / watchEffect()
// @methods        → const 箭头函数 + JSDoc
// @bizData        → helper .value 赋值
// @mounted        → onMounted / onUnmounted
```

### 禁止项

- `function` 关键字 → 始终 `const fn = () => {}`
- `reactive` → 仅用 `ref`
- import 带 `.ts` / `.js` 扩展名
- 纯 `any` → 用 `Recordable<any>`
- 单行 JSDoc `/** @todo xxx */` → 必须多行

### 格式

- 单引号、分号、2 空格缩进
- `<style scoped lang="scss">` + BEM 命名
- 文件顺序：`<script setup lang="tsx">` → `<template>` → `<style scoped lang="scss">`
- 组件名：`defineOptions({ name: '...' })`

---

## 2. Vue 方法 JSDoc

`@methods` 下每个 `const` 箭头函数**必须**使用多行格式：

```typescript
/**
 * @todo: <方法中文说明>
 * @author: <git user.name>
 * @Date: <current YYYY-MM-DD HH:mm:ss>
 * @param row 当前行数据        ← 有参数时追加
 * @param _index 行索引
 */
const methodName = () => { ... };
```

API 函数使用单行注释：`// xxx api`

---

## 3. UI 组件

### 优先级

1. **优先** `guava-ui` 封装的 `Gv*` 组件
2. **仅当**无对应 `Gv*` 封装时，才用 `el-*`

使用前须通过 MCP 确认（`get_usage` / `get_props` / `resolve_gv_component`）。

### 常用对照

| el-*（回退） | Gv*（优先） |
| ------------ | ----------- |
| `el-form` | `GvForm` |
| `el-table` | `GvTable` |
| `el-button` | `GvButton` |
| `el-dialog` | `GvDialog` |
| `el-drawer` | `GvDrawer` |
| `el-select` | `GvSelect` 或 form-list `type: dic` |
| `el-input` | `GvInput` 或 form-list `type: text / textarea` |
| `el-switch` | `GvSwitch`（常用于 GvTable 列 render） |
| `el-tabs` / `el-tab-pane` | `GvTabs` / `GvTabPane` |
| `el-row` / `el-col` | `GvRow` / `GvCol` |
| `el-card` | `GvCard` |
| `el-divider` | `GvDivider` |
| `el-tree` | `GvTree` |
| `el-upload` | `GvUpload` |
| `el-icon` | `GvIcon` |

### 字段配置驱动

表单 / 表格字段通过 `helper.tsx` 的 `FormItem[]` / `TableHeadItem[]` + `GvForm :form-list` / `GvTable :table-head` 配置驱动，**禁止**在 template 手写 `<el-input>`、`<el-select>` 等。

### 例外

- **类型**：`FormInstance`、`TableInstance` 等 ref 类型可从 `element-plus` 导入
- **无 Gv* 封装**：用对应 `el-*`
- **存量代码**：修改已有 legacy 页面时可与周边保持一致

---

## 4. Vue 文件头

```vue
<!--
 * @title: <Feature Name in Chinese>
 * @author: <git user.email>
 * @date: <current YYYY-MM-DD HH:mm:ss>
 * @LastEditors: <git user.name>
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>
 * @version: 1.0.1
-->
<script setup lang="tsx">
```

| 字段 | 规则 |
|------|------|
| `@author` / `@LastEditors` | 从 `git config` 获取或直接写 |
| `@date` | 首次创建时系统时间；修改文件时**不变** |
| `@LastEditTime` | 每次修改更新 |
| `@version` | 每次修改递增（末位 +1；`1.0.9` → `1.1.0`；`1.9.9` → `2.0.0`） |

---

## 5. 目录结构

**`src/views/` 下的目录 = YAML `view` 原文**，与 `src/pages/**/*.md` 路径无关。

### layout=module

```
src/views/<view>/
├── <Base>Index.vue
└── module/
    ├── helper.tsx
    ├── types.d.ts
    └── <Base>Edit.vue
```

### layout=flat

```
src/views/<view>/
├── <Base>Index.vue
├── <Base>Edit.vue
├── helper.tsx
└── types.d.ts
```

---

## 6. 命名规范

**componentBaseName 必须从 `feature` 推导，禁止从 `view` 路径推导。**

**规则**：仅当 `feature` 以 `Mng` 结尾时去除 `Mng` 后缀，其余情况保持原样转 PascalCase。

| 项目 | 规范 | 示例 |
| ---- | ---- | ---- |
| viewPath | = YAML `view` 原文（仅决定目录） | `sysMng/userMng2` |
| componentBaseName | 从 `feature` 推导，仅去 `Mng` 后缀 → PascalCase | `User`, `SalesSkills`, `SvcStmtApply` |
| 列表页 | `<Base>Index.vue` | `UserIndex.vue` |
| 编辑页 | `<Base>Edit.vue` | `UserEdit.vue` |
| 纯表单页 | `<Base>.vue` | `SystemConfig.vue` |

| YAML | 正确 | 错误 |
| ---- | ---- | ---- |
| `feature: userMng` + `view: sysMng/userMng2` | `UserIndex.vue` / `UserEdit.vue` | ❌ `UserMng2Index.vue` |
| `feature: svcStmtApply` | `SvcStmtApplyIndex.vue` | ❌ `SvcStmtIndex.vue` |
| API 文件 | `src/api/<apiModule>.ts` | `admin/user.ts` |
| GvForm ref | `<feature>SearchFm` | `userSearchFm` |
| GvForm form-list | `<feature>SearchList` | `userSearchList` |
| GvTable ref | `<feature>TableList` | `userTableList` |
| GvTable table-head | `<feature>TableHeadList` | `userTableHeadList` |
| GvTable table-data | `search<Feature>Data` | `searchUserData` |
| API 函数 | `verb+Entity+Api` | `findUsersApi` |
| 查询方法 | `search*` | `searchUserList` |
| 新增方法 | `add*` | `addUser` |
| 保存回调 | `save*Info` | `saveUserInfo` |
| SearchList 工厂 | `create<Feature>SearchList` | `createUserSearchList` |
| TableHead 工厂 | `create<Feature>TableHeadList` | `createUserTableHeadList` |
| EditList 工厂 | `create<Feature>EditList` | `createUserEditList` |

---

## 7. FormItem format

`format: [required, validator, maxlength, decimal?]`

- 查询 / 编辑 / 表单：**validator 均必填**
- 查询条件：`required` 固定 `0`
- `isDouble` 时第 4 位为小数位数：`[0, 'isDouble', 10, 4]`
- 校验类型完整列表见 [search-conditions.md](search-conditions.md)

---

## 8. CRUD 方法

生成代码时以 **GvCrud MCP**（对齐 `gv.crud.ts`）为准。详见 [config-parser.md](config-parser.md#crud-方法来源)。

| 方法 | 用途 |
| ---- | ---- |
| `crud.search(fm, table, api)` | 带搜索表单的列表查询 |
| `crud.searchNoFm(table, api, filter)` | 无搜索表单的查询（子表） |
| `crud.fetchData(api, data)` | 通用获取（无分页） |
| `crud.submit(api, data)` | 通用提交（删除 / 状态变更） |
| `crud.save(fm, api)` | 新增保存 |
| `crud.update(fm, id, api)` | 更新保存 |
| `crud.setEditValue(list, row)` | 编辑模式填充表单 |
| `crud.resetEditValue(list)` | 新增模式重置表单 |
| `crud.insertResult(data, row)` | 列表插入行 |
| `crud.updateResult(data, row, rownums)` | 列表更新行 |
| `crud.removeResult(data, index)` | 列表删除行 |
| `crud.checkForms(fmNodes)` | 多表单校验 |

**导入**：`import { crud } from 'guava-ui'` 或 `import { crud } from '@/hook/service/useCrud'`

---

## 9. Icon 图标规则

**优先使用 `src/views/iconsMng/` 中已定义的图标**：

| 图标类型 | iconType | 图标列表文件 | 命名规则 | 示例 |
| -------- | -------- | ------------ | -------- |------|
| 字体图标 | `iconfont` | `font-icons.ts` | `gv-icon-xxx` | `<GvIcon iconType="iconfont" iconName="gv-icon-shouye" />` |
| Element 图标 | `el` | `el-icons.ts` | PascalCase | `<GvIcon iconType="el" iconName="AddLocation" />` |
| SVG 图标 | `svg` | `svg-icons.ts` | kebab-case | `<GvIcon iconType="svg" iconName="svg-name" />` |

**规则**：
- 生成代码时，从 `font-icons.ts` / `el-icons.ts` / `svg-icons.ts` 中查找合适的图标
- 不在 `iconsMng` 中定义的图标，不要使用
- `iconType` 可省略（自动推断）：`el-icon-xxx` → el，`gv-icon-xxx` → iconfont，其他 → svg

---

## 10. API 复用规则

- 先 Glob 检查 `src/api/<apiModule>.ts` 是否已存在对应接口函数
- 已有则直接 import；仅缺少时才追加
- import 路径：`@/api/<apiModule>`（无扩展名）
- 远程字典常用：`findDictFromTableApi` from `@/api/admin/user`
