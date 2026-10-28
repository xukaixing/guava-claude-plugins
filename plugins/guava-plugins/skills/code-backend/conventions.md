# 后端代码规范

> [SKILL.md](SKILL.md) · [../../README.md](../../README.md)

## 目录结构

```
guava-{module}-starter/src/main/java/com/guava/{module}/
├── controller/{feature}/
│   └── {Entity}Controller.java
├── service/{feature}/
│   ├── {Entity}Service.java
│   └── impl/
│       └── {Entity}ServiceImpl.java
├── repository/
│   ├── {Entity}Mapper.java
│   └── provider/
│       └── {Entity}SqlProvider.java
└── model/po/          ← 实体类通常在 guava-entity 模块
```

## 命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| Controller | `{Entity}Controller` | `SysBizConfController` |
| Service 接口 | `{Entity}Service` | `SysBizConfService` |
| ServiceImpl | `{Entity}ServiceImpl` | `SysBizConfServiceImpl` |
| Mapper | `{Entity}Mapper` | `SysBizConfMapper` |
| SqlProvider | `{Entity}SqlProvider` | `SysBizConfSqlProvider` |
| PO 实体 | `{Entity}PO` | `SysBizConfPO` |
| 查询方法 | `find{Entity}` / `find{Entity}List` | `findBizConf` |
| 新增方法 | `save{Entity}` | `saveBizConf` |
| 更新方法 | `update{Entity}` | `updateBizConf` |
| 删除方法 | `remove{Entity}` | `removeBizConf` |
| RequestMapping | `/{feature}/` | `/sysbizconf/` |

## 类注解

### Controller

```java
@Tag(name = "admin-{feature}")       // Swagger 分组，可选
@RestController
@RequestMapping("/{feature}/")
@Slf4j                               // 复杂模块加，简单模块可省略
public class XxxController { }
```

### ServiceImpl

```java
@Service
@Slf4j                               // 可选
public class XxxServiceImpl implements XxxService { }
```

## 依赖注入

- 优先 `@Resource`，部分用 `@Autowired`
- Controller 注入 Service；ServiceImpl 注入 Mapper + 平台服务

```java
@Resource
private XxxMapper xxxMapper;
@Resource
private TransResultService transResultService;
@Resource
private ExcelApiService excelApiService;    // 导出时需要
```

## HTTP 方法约定

| 操作 | 注解 | 参数 | 返回值 |
|------|------|------|--------|
| 列表查询 | `@PostMapping("/findXxx")` | `@RequestBody String params` | `IPage<Map<String, Object>>` |
| 新增 | `@PostMapping("/saveXxx")` | `@RequestBody Map<String, Object> param` | `Map<String, Object>` |
| 更新 | `@PutMapping("/updateXxx/{id}")` | `@PathVariable Long id` + `@RequestBody Map` | `Map<String, Object>` |
| 删除 | `@PostMapping("/removeXxx/{id}")` | `@PathVariable Long id` | `Integer` 或 `void` |
| 详情 | `@GetMapping("/getXxxById")` | `@RequestParam String id` | `Map<String, Object>` |
| 导出 | `@PostMapping("/exportXxxData")` | `HttpServletResponse` + `@RequestBody Map` | `void` |

## 查询 Controller 标准模式

```java
@PostMapping(value = "/findXxx")
public IPage<Map<String, Object>> findXxx(@RequestBody String params)
{
  Page<Map<String, Object>> page = new Page<>();
  String conditions = MyUtil.getConditionsWhere(params, page);
  return xxxService.findXxx(page, conditions);
}
```

## 写操作注解

新增/更新/删除加操作日志：

```java
@MarkLog(value = "新增业务参数-[{0}]", param = "paraName")
```

## Javadoc 规范

对齐 `guava-admin-starter` 的 `SysUser*` 系列（IDEA 保存格式化产物）。author / 时间取自 `git config` 与当前系统时间。

### 类头（Controller / Service / ServiceImpl / PO）

```java
/**
 * <p>系统用户控制器</p>
 *
 * @author Andy Xu <xukaixing@hotmail.com>
 * @since 2026/10/26
 */
```

- 描述包 `<p>...</p>`；`@since` 格式 `yyyy/M/d`；新建写入，覆盖时**保留**原 `@since`

### 方法注释（Controller / Service / ServiceImpl 每个 public 方法，私有方法同样）

```java
/**
 * <p>查询用户信息</p>
 *
 * @param params
 * @return com.baomidou.mybatisplus.core.metadata.IPage<java.util.Map<java.lang.String,java.lang.Object>>
 * @since 2026/10/26
 */
```

- 首行 `<p>中文描述</p>`，后空一行
- 使用标准 `@param` / `@return` / `@since`（**不要** `@param:` 冒号风格）
- `@return` 写全限定类型，泛型内无空格（`java.lang.String,java.lang.Object`）
- 方法签名声明了 `throws XxxException` 时，必配 `@throws XxxException 中文说明`（置于 `@return` 之后、`@since` 之前），如 `@throws IOException 写入响应流失败时抛出`
- `@since` 格式 `yyyy/M/d`；覆盖已有方法时**保留**原 `@since`

Swagger 方法注解：

```java
@Operation(summary = "查询->业务参数配置表信息", description = "查询业务参数配置表信息服务")
```

## 扩展端点

| 标记 | 触发条件 | 生成方法 |
|------|----------|----------|
| 「状态更新」 | `### 服务逻辑描述` 含「状态更新」 | `update{Entity}Status`（启用/停用） |
| 「导出」 | `### 服务逻辑描述` 含「导出」 | `export{Entity}Data`（Excel，依赖 ExcelApiService） |

## 字典翻译（getTransHash）

`getTransHash()` 内容由 md `### 字典翻译` 小节逐条驱动：

```
- status：dic|yxzt
- deptId：dept|o
- createTime：date|yyyy-MM-dd HH:mm:ss
```

对应代码：

```java
transHash.put("status", "dic|yxzt");
transHash.put("deptId", "dept|o");
transHash.put("createTime", "date|" + FormatConstant.SIMPLE_DATE_TIME_FORMAT);
```

- 无 `### 字典翻译` 小节时仅保留 `createTime` 翻译
- 字典类型来自前端表格列 `dicType` 自动收集，可在 md 中手动追加
- `FormatConstant.SIMPLE_DATE_TIME_FORMAT` / `SIMPLE_DATE_FORMAT` 按日期精度选择

## 常用工具类

**优先复用三层框架（entity / component / platform）已提供的能力，不自造等价实现。** 用前先 `guava-backend` MCP `search_platform_classes` 确认类与方法签名：

| 层 | 类 | 用途 |
|----|----|------|
| platform | `MyUtil.getConditionsWhere(params, page)` | 解析前端查询 JSON → SQL WHERE |
| platform | `MyUtil.getValue(obj)` | 安全取值转 String |
| platform | `AssertMyUtil.notNull / notEmpty / errMsg` | 参数校验、业务异常 |
| platform | `BizCode` | 业务错误码（禁止自定义异常码） |
| platform | `MarkLog` | 操作日志注解 |
| platform | `transResultService.transResult(data, transHash)` | 字典/日期/用户翻译 |
| platform | `excelApiService` | 导出表头解析 + Excel 写出 |
| platform | `ContextHolder.getDeptId()` | 当前登录用户部门 |
| platform | `StrMyUtil` / `LangMyUtil` / `ArrayMyUtil` | 占位符 / i18n / 数组工具 |
| platform | `RedisMyClient` | Redis 读写 |
| component | `Map2ObjUtil.toObject(param, XxxPO.class)` | Map → PO |
| component | `PasswordUtils` / `PasswordEncoder` | 密码盐值与加密 |
| component | `DicConstant` / `FormatConstant` / `RedisConstant` | 字典值 / 日期格式 / Redis key 常量 |
| entity | `BasePO` / `XxxPO.toMaps()` | PO 基类 / PO 转 Map |

## 代码风格

对齐 `guava-admin-starter` 的 `SysUser*` 系列（IDEA 保存格式化产物）：

- 类 / 方法大括号换行：`public class XxxController\n{`
- 4 空格缩进
- import 分组顺序：三方库（cn.hutool / com.baomidou / com.guava.* / io.swagger）→ jakarta → lombok → org.springframework → 空行 → java.*
- 返回类型用 `Map<String, Object>`，列表用 `IPage<Map<String, Object>>`
- import `jakarta.annotation.Resource`（非 javax）
- Controller 内 service 字段不加 `private`（`SysUserService sysUserService;`）；ServiceImpl 内 mapper 字段加 `private`
- 注入字段上方单行注释 `/** 系统用户mapper */`
- PO 转 Map：`xxxPO.toMaps()`
- **JDK 25 惯用法**：新建 HashMap 用 `HashMap.newHashMap(16)`，不用 `new HashMap<>()`；Map/POJO 判空用 `isEmpty(...)`（static import `com.baomidou.mybatisplus.core.toolkit.ObjectUtils.isEmpty`），字符串判空用 `isNotEmpty(...)`（static import `cn.hutool.core.text.CharSequenceUtil.isNotEmpty`）
- ServiceImpl 高频工具方法 static import（置于 java.\* 分组之后）：
  `cn.hutool.core.text.CharSequenceUtil.isNotEmpty`、`com.baomidou.mybatisplus.core.toolkit.ObjectUtils.isEmpty`、`com.guava.platform.utils.common.MyUtil.getConditionsWhere`、`com.guava.platform.utils.common.MyUtil.getValue`
- **throws 收窄**：接口方法声明 `throws IOException` 时，实现方法只在确实抛出该异常时保留 `throws`；未保留时同时去掉 `java.io.IOException` import（参考 `exportUserData` 实现）

## API 复用规则

生成前检查目标模块是否已有 Controller/Service：
- 已有对应方法 → 不重复生成，仅补充缺失端点
- 路径、命名与前端 `src/api/` 对齐
