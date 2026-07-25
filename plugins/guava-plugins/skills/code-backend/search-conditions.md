# 后端查询条件配置

Guava 后端通过 `MyUtil.getConditionsWhere(params, page)` 将前端搜索 JSON 转为 SQL WHERE 子句。

## 数据流

```
前端 GvForm 搜索
  → POST @RequestBody String params（JSON 字符串）
  → MyUtil.getConditionsWhere(params, page) 解析分页 + 条件
  → SqlProvider 拼接 SQL： "... where " + conditions
  → Mapper 执行查询
  → transResultService.transResult() 翻译字典/日期
```

## 前后端 field 对齐

前端 `helper.tsx` 搜索表单的 `field` 必须与后端查询 field **完全一致**：

| 前端 field | 后端解析 | SQL 列 |
|-----------|---------|--------|
| `u@account` | 表别名 `u` + 字段 `account` | `u.account` |
| `b@paraKey` | 表别名 `b` + 字段 `paraKey` | `b.para_key`（驼峰转下划线） |
| `createTime` | 无别名 | `create_time` |
| `status` | 无别名 | `status` |

> 带 `@` 的 field 是 Guava 平台约定：`表别名@Java属性名`。

## 查询条件确认表

```
📋 请确认查询条件：

| # | 条件名称 | field | 查询类型 | SQL列 | 字典翻译 | 备注 |
|---|---------|-------|---------|-------|---------|------|
| 1 | 用户账号 | u@account | like | u.account | — | |
| 2 | 状态 | u@status | eq | u.status | dic\|yxzt | getTransHash |
| 3 | 创建时间 | createTime | daterange | u.create_time | date\|yyyy-MM-dd HH:mm:ss | |
```

### 查询类型

| 类型 | 说明 | 前端 validator |
|------|------|---------------|
| `like` | 模糊匹配 | `isAny`, `isNumberLetter` |
| `eq` | 精确匹配 | `isDic`, `isNumber` |
| `in` | 多选 IN | `isDic` + `multiple` |
| `daterange` | 日期范围 | `isDate` + `dateType: daterange` |
| `gt` / `lt` | 大于/小于 | `isNumber`, `isDate` |

## Controller 查询模板

```java
@PostMapping(value = "/findXxx")
public IPage<Map<String, Object>> findXxx(@RequestBody String params)
{
  Page<Map<String, Object>> page = new Page<>();
  String conditions = MyUtil.getConditionsWhere(params, page);
  return xxxService.findXxx(page, conditions);
}
```

## ServiceImpl 查询模板

```java
@Override
public IPage<Map<String, Object>> findXxx(Page<Map<String, Object>> page, String conditions)
{
  // 设置默认排序
  OrderItem oi = new OrderItem();
  oi.setColumn("b.create_time");   // ← 数据库列名
  oi.setAsc(false);
  page.addOrder(oi);
  return transResultService.transResult(
      xxxMapper.findXxx(page, conditions),
      getTransHash()
  );
}
```

## getTransHash() 字典翻译

查询结果中的字典码、日期、关联 ID 需配置翻译：

```java
private HashMap<String, String> getTransHash()
{
  HashMap<String, String> transHash = new HashMap<>();
  transHash.put("bizType", "dic|ywlx");                              // 字典
  transHash.put("status", "dic|yxzt");
  transHash.put("deptId", "dept|o");                                 // 部门
  transHash.put("createBy", "user|o");                               // 用户
  transHash.put("createTime", "date|" + FormatConstant.SIMPLE_DATE_TIME_FORMAT);
  return transHash;
}
```

| 前缀 | 含义 | 示例 |
|------|------|------|
| `dic\|{dicType}` | 字典翻译 | `dic\|yxzt` |
| `date\|{format}` | 日期格式化 | `date\|yyyy-MM-dd HH:mm:ss` |
| `dept\|o` | 部门名称 | — |
| `user\|o` | 用户名称 | — |

**规则**：Step 1.1 确认表中标记了字典的字段，必须在 `getTransHash()` 中配置。

## SqlProvider 查询 SQL 模板

```java
public static String findXxx(Page<Map<String, Object>> page, String conditions)
{
  StringBuffer sql = new StringBuffer();
  sql.append(" SELECT ");
  sql.append("   b.id, ");
  sql.append("   b.para_key paraKey, ");
  sql.append("   b.para_name paraName, ");
  sql.append("   b.biz_type bizType, ");
  sql.append("   b.status, ");
  sql.append("   b.create_time createTime ");
  sql.append(" FROM sys_biz_conf b ");
  sql.append(" WHERE ");
  sql.append(conditions);    // ← 直接拼接，MyUtil 已处理
  return sql.toString();
}
```

注意：
- SELECT 列用 `db_column aliasName` 驼峰别名，与前端表格 `prop` 对齐
- `conditions` 由平台生成，以 `and` 开头，直接 `append(conditions)`

## 与 page-generator 联动

同时生成前后端时：
1. 先用 page-generator Step 1.1 确认前端查询条件
2. 将相同 field 填入本 skill Step 1.1
3. Controller 端点路径与 `src/api/` 中函数路径一致

示例对齐：

| 前端 API | 后端 Controller |
|---------|----------------|
| `POST /admin/sysbizconf/findBizConf` | `@RequestMapping("/sysbizconf/")` + `@PostMapping("/findBizConf")` |
| `POST /admin/sysuser/saveUser` | `@PostMapping("/saveUser")` |
| `PUT /admin/sysuser/updateUser/{id}` | `@PutMapping("/updateUser/{id}")` |
