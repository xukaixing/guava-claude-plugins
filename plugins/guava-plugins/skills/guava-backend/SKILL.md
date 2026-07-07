---
name: guava-backend
description: >
  Generate Spring Boot Controller, Service interface, and ServiceImpl following Guava
  project conventions. Use when the user asks to create backend APIs, REST controllers,
  service layers, CRUD endpoints, or Spring Boot code for Guava projects. Triggers include
  "generate controller", "create service", "add backend API for...", "Spring Boot CRUD",
  "生成后端接口", "生成 Controller/Service". Before generating, confirm CRUD operations
  and custom search conditions (field alias, query type) with the user.

  Scope: generate files only. Do NOT run git commands or commit.

  Invoke as /guava-plugins:guava-backend when installed via guava-plugins plugin.
disable-model-invocation: true
---

# Guava Spring Boot Backend Generator

生成符合 Guava 项目约定的 Controller、Service 接口、ServiceImpl 实现类。

## 工作流程

### Step 0: 读取项目上下文

生成前阅读目标模块中**一个已有模块**的完整实现：

1. **Controller** — `controller/{feature}/` 下的注解、参数、返回值模式
2. **Service 接口** — 方法签名约定
3. **ServiceImpl** — Mapper 注入、`getTransHash()`、`transResultService` 用法
4. **SqlProvider**（如有）— 动态 SQL 拼接方式

默认参考模块：`guava-admin-starter` 下的 `sysbizconf`（标准 CRUD）或 `sysuser`（复杂业务）。

### Step 1: 理解需求

| 项目 | 说明 | 示例 |
|------|------|------|
| Module | Maven 子模块 | `guava-admin-starter`, `guava-service-product` |
| Base package | Java 包根路径 | `com.guava.admin` |
| Feature | 业务域小写 | `sysbizconf`, `leadTag` |
| Entity/PO | 实体类名 | `SysBizConfPO` |
| RequestMapping | Controller 路径前缀 | `/sysbizconf/`, `/leadTag/` |
| Swagger Tag | API 分组名 | `admin-sysbizconf` |

### Step 1.1: 定义查询条件

列表查询为**必选**。生成前用表格确认每条查询条件：

```
📋 请确认查询条件（与前端 field 一致，查询为必选）：

| # | 条件名称 | field（含表别名） | 查询类型 | SQL列/别名 | 备注 |
|---|---------|------------------|---------|-----------|------|
| 1 | 参数代码 | b@paraKey | like | b.para_key | |
| 2 | 业务类型 | b@bizType | eq | b.biz_type | 字典 ywlx |
| 3 | 创建时间 | createTime | daterange | b.create_time | |
```

**查询类型**：`like` / `eq` / `in` / `daterange` / `gt` / `lt`

规则见 [search-conditions.md](search-conditions.md)。`field` 必须与前端 GvForm 搜索表单的 `field` 一致（如 `u@account`）。

### Step 1.2: 定义业务字段

若选中新增/编辑，确认实体字段：

```
📋 请确认业务字段（仅当选中新增/编辑时）：

| # | 字段名称 | Java属性 | DB列 | 类型 | 必填 | 字典 | dicType | 备注 |
|---|---------|---------|------|------|------|------|---------|------|
| 1 | 参数代码 | paraKey | para_key | String | 是 | 否 | — | 唯一校验 |
| 2 | 业务类型 | bizType | biz_type | Integer | 是 | 是 | ywlx | transHash |
```

### Step 1.3: 选择 CRUD 操作

**禁止自动生成全部操作**，仅生成用户选中的：

```
📋 请确认需要的 CRUD 操作（查询为必选）：

| 操作 | 需要 | Controller方法 | HTTP | 端点 |
|------|------|---------------|------|------|
| 查询 | ✅ | findXxx | POST | /findXxx |
| 新增 | ☐ | saveXxx | POST | /saveXxx |
| 编辑 | ☐ | updateXxx | PUT | /updateXxx/{id} |
| 删除 | ☐ | removeXxx | POST | /removeXxx/{id} |
| 导出 | ☐ | exportXxxData | POST | /exportXxxData |
| 状态变更 | ☐ | updateXxxStatus | POST | /updateXxxStatus |
```

### Step 1.4: 生成前文件清单

```
📋 待生成文件清单：

☐ .../controller/<feature>/<Entity>Controller.java
☐ .../service/<feature>/<Entity>Service.java
☐ .../service/<feature>/impl/<Entity>ServiceImpl.java
```

每写完一个文件将 ☐ 改为 ✅。

> Mapper / SqlProvider 不在本 skill 默认范围，生成后提醒用户按需补充，见 Step 8。

### Step 2–4: 按模板生成

| Step | 文件 | 模板 | 依赖 |
|------|------|------|------|
| 2 | Controller | [templates/controller.md](templates/controller.md) | Step 1.1, 1.3 |
| 3 | Service 接口 | [templates/service.md](templates/service.md) | Step 1.3 |
| 4 | ServiceImpl | [templates/service-impl.md](templates/service-impl.md) | Step 1.1, 1.2, 1.3 |

### Step 5: 生成后检查

提醒用户：
1. 补充 `XxxMapper` 接口 + `XxxSqlProvider` 动态 SQL（查询条件来自 Step 1.1）
2. 在 `getTransHash()` 中配置字典/日期翻译（`dic|编码`、`date|格式`）
3. 新增/编辑需 `Map2ObjUtil.toObject(param, XxxPO.class)` 映射
4. 写操作加 `@MarkLog` 操作日志
5. 与前端 API 路径对齐（如 `/admin/sysbizconf/findBizConf`）

## 参考文档

| 文档 | 内容 |
|------|------|
| [conventions.md](conventions.md) | 包结构、命名、注解、代码风格 |
| [search-conditions.md](search-conditions.md) | 查询条件、MyUtil.getConditionsWhere、transHash |
| [templates/controller.md](templates/controller.md) | Controller 模板 |
| [templates/service.md](templates/service.md) | Service 接口模板 |
| [templates/service-impl.md](templates/service-impl.md) | ServiceImpl 模板 |
