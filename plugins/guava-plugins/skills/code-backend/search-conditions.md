# 后端查询条件配置

Guava 后端通过 `MyUtil.getConditionsWhere(params, page)` 将前端搜索 JSON 转为 SQL WHERE 子句。

## 数据流

```
前端 GvForm 搜索
  → POST @RequestBody String params（JSON 字符串）
  → MyUtil.getConditionsWhere(params, page) 解析分页 + 条件
  → SqlProvider 拼接 SQL： "... WHERE " + conditions
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

查询结果中的字典码、日期、关联 ID 需配置翻译。**禁止内联字符串字面量**（`"dic|yxzt"` / `"dept|o"` / `"date|" + FormatConstant...`），一律引用模块翻译常量类（参考 `guava-admin-starter` 的 `SysUserServiceImpl.getTransHash()`）：

```java
import com.guava.{module}.constant.SysConstants;
```

```java
private HashMap<String, String> getTransHash()
{
  HashMap<String, String> transHash = HashMap.newHashMap(16);
  transHash.put("status", SysConstants.YXZT);             // 字典
  transHash.put("bizType", SysConstants.YWLX);
  transHash.put("deptId", SysConstants.DEPT_S);           // 部门
  transHash.put("createBy", SysConstants.USER_O);         // 用户
  transHash.put("createTime", SysConstants.DATE_SIMPLE_DATE_TIME);
  return transHash;
}
```

| md 前缀 | 含义 | 常量示例（`SysConstants`） |
|------|------|------|
| `dic\|{dicType}` | 字典翻译 | `YXZT` / `YWLX`（`DICT_PREFIX + DicConstants.*`） |
| `date\|{format}` | 日期格式化 | `DATE_SIMPLE_DATE_TIME` / `DATE_SIMPLE_DATE`（`DATE_PREFIX + FormatConstant.*`） |
| `dept\|o` / `dept\|s` | 部门翻译（s=单选 o=多选） | `DEPT_O` / `DEPT_S` |
| `user\|o` / `user\|s` | 用户翻译 | `USER_O` / `USER_NAME` |

**规则**：
- Step 1.1 确认表中标记了字典的字段，必须在 `getTransHash()` 中配置
- 常量类为 `com.guava.{module}.constant.SysConstants`（模块无该类时新建，模式对齐 guava-admin-starter：`DICT_PREFIX + DicConstants.X` / `DATE_PREFIX + FormatConstant.X`）；**所需常量缺失时先补到常量类**，ServiceImpl 只引用常量
- md `### 字典翻译` 的 `dic|yxzt` → `SysConstants.YXZT`；`date|yyyy-MM-dd HH:mm:ss` → `SysConstants.DATE_SIMPLE_DATE_TIME`；`dept|o` → `SysConstants.DEPT_O`

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
- **SQL 关键字一律大写**：`SELECT` / `FROM` / `WHERE` / `LEFT JOIN` / `INNER JOIN` / `ON` / `AND`（与设计器 SQL 预览风格一致）
- SELECT 列用 `db_column aliasName` 驼峰别名，与前端表格 `prop` 对齐
- `conditions` 由平台生成，以 `AND` 开头，直接 `append(conditions)`
- **固定过滤条件**：`### 列表数据表` 中条目的「过滤条件：表 → 条件」行，逐条 `sql.append(" AND " + 条件)` 追加在 `conditions` 之后（如 `sql.append(" AND su.status = '1' ")`）
- 多表关联 JOIN 段写法：

```java
  sql.append(" FROM sys_user u ");
  sql.append(" LEFT JOIN sys_dept d ON u.dept_id = d.id ");
  sql.append(" WHERE ");
```

## 与 page-generator 联动

同时生成前后端时：
1. 先用 page-generator Step 1.1 确认前端查询条件
2. 将相同 field 填入本 skill Step 1.1
3. Controller 端点路径与 `src/api/` 中函数路径一致

示例对齐：

| 前端 API | 后端 Controller |
|---------|----------------|
| `POST /admin/sysbizconf/findBizConf` | `@RequestMapping("/sysbizconf/")` + `@PostMapping("/findBizConf")` |
| `POST /admin/sysUser/saveUser` | `@PostMapping("/saveUser")` |
| `PUT /admin/sysUser/updateUser/{id}` | `@PutMapping("/updateUser/{id}")` |
