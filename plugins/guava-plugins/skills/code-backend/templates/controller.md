# Controller 模板

> [\_shared.md](../_shared.md) · [conventions.md](../conventions.md)

生成 `controller/{feature}/{ApiName}Controller.java`（`{ApiName}` = 请求上下文去 `/` 转 PascalCase，驼峰保留，如 `/sysUser` → `SysUser`）。**仅生成 Step 1.3 选中的方法 + 扩展端点（状态更新 / 导出，按 `### 服务逻辑描述` 标记）。**

**操作日志开关**：`### 服务逻辑描述` 含「操作日志」标记才生成 `@MarkLog` 注解与 `MarkLog` import；否则一律不生成（默认关闭）。

风格对齐 `guava-admin-starter` 的 `SysUserController.java`（IDEA 保存格式化产物：4 空格缩进、Allman 大括号、import 分组顺序、Javadoc 带 `<p>`）。

## 文件头

```java
package com.guava.{module}.controller.{feature};

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.guava.{module}.service.{feature}.{ApiName}Service;
import com.guava.platform.annotation.MarkLog;   // ↓ only if 操作日志（服务逻辑描述含「操作日志」标记）
import com.guava.platform.exception.BizCode;
import com.guava.platform.utils.common.MyUtil;
import com.guava.platform.utils.iassert.AssertMyUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

/**
 * <p>{中文模块名}</p>
 *
 * @author {git user.name} <{git user.email}>
 * @since {yyyy/M/d}
 */
@Tag(name = "{swagger-tag}")        // 来自「基本信息」Swagger Tag 字段，缺失默认 {模块}-{功能}（驼峰保留，不写死 admin）
@RestController
@RequestMapping("/{feature}/")
@Slf4j
public class {ApiName}Controller
{
    /** {中文模块名}服务 */
    @Resource
    {ApiName}Service {apiName}Service;
```

> import 按「用到的才引入」裁剪；上面是全集参考。分组顺序：三方库（cn.hutool / com.baomidou / com.guava.* / io.swagger）→ jakarta → lombok → org.springframework → 空行 → java.*。

## 方法模板（按选中操作生成）

### 查询（始终生成）

```java
    /**
     * <p>查询{中文名}信息</p>
     *
     * @param params
     * @return com.baomidou.mybatisplus.core.metadata.IPage<java.util.Map<java.lang.String,java.lang.Object>>
     * @since {yyyy/M/d}
     */
    @Operation(summary = "查询->{中文名}信息", description = "查询{中文名}信息")
    @PostMapping(value = "/find{Entity}")
    public IPage<Map<String, Object>> find{Entity}(
            @Parameter(description = "查询条件参数", required = true)
            @RequestBody String params)
    {
        Page<Map<String, Object>> page = new Page<>();
        String conditions = MyUtil.getConditionsWhere(params, page);
        return {apiName}Service.find{Entity}(page, conditions);
    }
```

### 新增

```java
    /** <p>保存{中文名}信息</p> @since {yyyy/M/d} */
    @Operation(summary = "保存->保存{中文名}", description = "插入{中文名}")
    // ↓ only if 操作日志:
    @MarkLog(value = "新增{中文名}-[{0}]", param = "{logField}")
    @PostMapping(value = "/save{Entity}")
    public Map<String, Object> save{Entity}(@RequestBody Map<String, Object> param)
    {
        return {apiName}Service.save{Entity}(param);
    }
```

### 更新

```java
    /** <p>更新{中文名}信息</p> @since {yyyy/M/d} */
    @Operation(summary = "更新->更新{中文名}", description = "更新{中文名}")
    // ↓ only if 操作日志:
    @MarkLog(value = "更新{中文名}-[{0}]", param = "{logField}")
    @PutMapping(value = "/update{Entity}/{pk}")
    public Map<String, Object> update{Entity}(@PathVariable("{pk}") Long {pk}, @RequestBody Map<String, Object> param)
    {
        return {apiName}Service.update{Entity}({pk}, param);
    }
```

### 删除

```java
    /** <p>删除{中文名}</p> @since {yyyy/M/d} */
    @Operation(summary = "删除->删除{中文名}", description = "删除{中文名}")
    // ↓ only if 操作日志:
    @MarkLog(value = "删除{中文名}")
    @PostMapping(value = "/remove{Entity}/{pk}")
    public Integer remove{Entity}(@PathVariable("{pk}") Long {pk})
    {
        return {apiName}Service.remove{Entity}({pk});
    }
```

### 导出

```java
    /** <p>导出{中文名}</p> @throws IOException 写入响应流失败时抛出 @since {yyyy/M/d} */
    @Operation(summary = "导出->导出{中文名}", description = "导出{中文名}")
    @PostMapping(value = "/export{Entity}Data")
    public void export{Entity}Data(HttpServletResponse response, @RequestBody Map<String, Object> param) throws IOException
    {
        AssertMyUtil.notNull(param, BizCode.VARIABLE_NOT_EMPTY, "param");
        {apiName}Service.export(response, "{中文名}导出", param);
    }
```

> 导出用到 `HttpServletResponse` 时补 import `jakarta.servlet.http.HttpServletResponse`（放在 jakarta 分组）。
> 仅在 `### 服务逻辑描述` 出现「导出」标记时生成导出方法。

### 状态更新（按「服务逻辑描述」标记生成）

```java
    /** <p>更新{中文名}状态</p> @since {yyyy/M/d} */
    @Operation(summary = "更新->更新{中文名}状态", description = "更新{中文名}状态")
    // ↓ only if 操作日志:
    @MarkLog(value = "更新{中文名}状态-[{0}]", param = "{logField}")
    @PostMapping(value = "/update{Entity}Status")
    public Map<String, Object> update{Entity}Status(@RequestBody Map<String, Object> params)
    {
        Long {pk} = Long.parseLong(MyUtil.getValue(params.get("{pk}")));
        Integer status = Integer.parseInt(MyUtil.getValue(params.get("status")));
        return {apiName}Service.update{Entity}Status(id, status);
    }
```

### 详情（按需）

```java
    /** <p>获取{中文名}详细信息</p> @since {yyyy/M/d} */
    @Operation(summary = "查询->{中文名}详细信息", description = "获取{中文名}详细信息")
    @GetMapping(value = "/get{Entity}ById")
    public Map<String, Object> get{Entity}ById(@RequestParam String id)
    {
        AssertMyUtil.notEmpty({pk}, BizCode.METHOD_ARGS_NOTNULL, "{pk}");
        return {apiName}Service.get{Entity}ById({pk});
    }
```

## 关键规则

> 通用风格（Javadoc `<p>` + 标准 `@param`/`@return`/`@throws`/`@since`、Allman、4 空格、import 分组、static import）见 [conventions.md](../conventions.md)，此处只列 Controller 特有规则：

- 查询统一 `@RequestBody String params` + `MyUtil.getConditionsWhere`
- 新增/更新用 `@RequestBody Map<String, Object>`；更新路径参数 `@PathVariable("{pk}") Long {pk}`（`{pk}` = 主键，默认 id）
- 仅当服务逻辑描述勾选「操作日志」时写操作加 `@MarkLog`（否则不生成）；每个 public 方法配 `@Operation`
- service 字段不加 `private`（对齐参考文件；ServiceImpl 内 mapper 字段加 `private`）
- 工具/断言/错误码一律用 platform 框架现成类（`MyUtil` / `AssertMyUtil` / `BizCode`），不自造
- hutool `JSONObject` 取值用判空 + `instanceof` 模式匹配（对齐参考实现 `findUsers`，消除警告）：

```java
        String deptId = null;
        if (params != null && !params.isEmpty()) {
            Object deptIdObj = new JSONObject(params).get("u@deptId");
            if (deptIdObj instanceof JSONObject deptJson) {
                deptId = deptJson.getStr("va");
            }
        }
```

- 仅生成 Step 1.3 选中的方法；端点路径与前端 `src/api/` 保持一致
