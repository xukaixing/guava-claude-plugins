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

```java
/**
 * <p> 查询业务参数配置表信息 </p>
 * @author: wcz
 * @date: 2022-07-01
 * @version: 1.0.1
 */
```

Swagger 方法注解：

```java
@Operation(summary = "查询->业务参数配置表信息", description = "查询业务参数配置表信息服务")
```

## 常用工具类

| 类 | 用途 |
|----|------|
| `MyUtil.getConditionsWhere(params, page)` | 解析前端查询 JSON → SQL WHERE |
| `MyUtil.getValue(obj)` | 安全取值转 String |
| `Map2ObjUtil.toObject(param, XxxPO.class)` | Map → PO |
| `AssertMyUtil.notNull / notEmpty / errMsg` | 参数校验、业务异常 |
| `transResultService.transResult(data, transHash)` | 字典/日期/用户翻译 |
| `ContextHolder.getDeptId()` | 当前登录用户部门 |

## 代码风格

- 类名大括号换行：`public class XxxController\n{`
- 4 空格缩进
- 返回类型用 `Map<String, Object>`，列表用 `IPage<Map<String, Object>>`
- import `jakarta.annotation.Resource`（非 javax）
- PO 转 Map：`xxxPO.toMaps()`

## API 复用规则

生成前检查目标模块是否已有 Controller/Service：
- 已有对应方法 → 不重复生成，仅补充缺失端点
- 路径、命名与前端 `src/api/` 对齐
