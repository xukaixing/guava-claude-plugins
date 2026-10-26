# Controller 模板

> [\_shared.md](../_shared.md) · [conventions.md](../conventions.md)

生成 `controller/{feature}/{Entity}Controller.java`。**仅生成 Step 1.3 选中的方法。**

风格对齐 `guava-admin-starter` 的 `SysUserController.java`（IDEA 保存格式化产物：4 空格缩进、Allman 大括号、import 分组顺序、Javadoc 带 `<p>`）。

## 文件头

```java
package com.guava.{module}.controller.{feature};

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.guava.{module}.service.{feature}.{Entity}Service;
import com.guava.platform.annotation.MarkLog;
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
 * <p>{中文模块名}控制器</p>
 *
 * @author {git user.name} <{git user.email}>
 * @since {yyyy/M/d}
 */
@Tag(name = "{swagger-tag}")
@RestController
@RequestMapping("/{feature}/")
@Slf4j
public class {Entity}Controller
{
    /** {中文模块名}服务 */
    @Resource
    {Entity}Service {entity}Service;
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
        return {entity}Service.find{Entity}(page, conditions);
    }
```

### 新增

```java
    /**
     * <p>保存{中文名}信息</p>
     *
     * @param param
     * @return java.util.Map<java.lang.String,java.lang.Object>
     * @since {yyyy/M/d}
     */
    @Operation(summary = "保存->保存{中文名}", description = "插入{中文名}")
    @MarkLog(value = "新增{中文名}-[{0}]", param = "{logField}")
    @PostMapping(value = "/save{Entity}")
    public Map<String, Object> save{Entity}(@RequestBody Map<String, Object> param)
    {
        return {entity}Service.save{Entity}(param);
    }
```

### 更新

```java
    /**
     * <p>更新{中文名}信息</p>
     *
     * @param id
     * @param param
     * @return java.util.Map<java.lang.String,java.lang.Object>
     * @since {yyyy/M/d}
     */
    @Operation(summary = "更新->更新{中文名}", description = "更新{中文名}")
    @MarkLog(value = "更新{中文名}-[{0}]", param = "{logField}")
    @PutMapping(value = "/update{Entity}/{id}")
    public Map<String, Object> update{Entity}(@PathVariable("id") Long id, @RequestBody Map<String, Object> param)
    {
        return {entity}Service.update{Entity}(id, param);
    }
```

### 删除

```java
    /**
     * <p>删除{中文名}</p>
     *
     * @param id
     * @return java.lang.Integer
     * @since {yyyy/M/d}
     */
    @Operation(summary = "删除->删除{中文名}", description = "删除{中文名}")
    @MarkLog(value = "删除{中文名}")
    @PostMapping(value = "/remove{Entity}/{id}")
    public Integer remove{Entity}(@PathVariable("id") Long id)
    {
        return {entity}Service.remove{Entity}(id);
    }
```

### 状态变更

```java
    /**
     * <p>更新{中文名}状态</p>
     *
     * @param params
     * @return java.util.Map<java.lang.String,java.lang.Object>
     * @since {yyyy/M/d}
     */
    @Operation(summary = "更新->{中文名}状态", description = "更新{中文名}状态")
    @MarkLog(value = "更新{中文名}状态-[{0}]", param = "{logField}")
    @PostMapping(value = "/update{Entity}Status")
    public Map<String, Object> update{Entity}Status(@RequestBody Map<String, Object> params)
    {
        Long id = Long.parseLong(MyUtil.getValue(params.get("id")));
        Integer status = Integer.parseInt(MyUtil.getValue(params.get("status")));
        return {entity}Service.update{Entity}Status(id, status);
    }
```

### 导出

```java
    /**
     * <p>导出{中文名}</p>
     *
     * @param response
     * @param param
     * @return void
     * @throws IOException 写入响应流失败时抛出
     * @since {yyyy/M/d}
     */
    @Operation(summary = "导出->导出{中文名}", description = "导出{中文名}")
    @PostMapping(value = "/export{Entity}Data")
    public void export{Entity}Data(HttpServletResponse response, @RequestBody Map<String, Object> param) throws IOException
    {
        AssertMyUtil.notNull(param, BizCode.VARIABLE_NOT_EMPTY, "param");
        {entity}Service.export(response, "{中文名}导出", param);
    }
```

> 导出用到 `HttpServletResponse` 时补 import `jakarta.servlet.http.HttpServletResponse`（放在 jakarta 分组）。

### 详情（按需）

```java
    /**
     * <p>获取{中文名}详细信息</p>
     *
     * @param id
     * @return java.util.Map<java.lang.String,java.lang.Object>
     * @since {yyyy/M/d}
     */
    @Operation(summary = "查询->{中文名}详细信息", description = "获取{中文名}详细信息")
    @GetMapping(value = "/get{Entity}ById")
    public Map<String, Object> get{Entity}ById(@RequestParam String id)
    {
        AssertMyUtil.notEmpty(id, BizCode.METHOD_ARGS_NOTNULL, "id");
        return {entity}Service.get{Entity}ById(id);
    }
```

## 关键规则

> 通用风格（Javadoc `<p>` + 标准 `@param`/`@return`/`@throws`/`@since`、Allman、4 空格、import 分组、static import）见 [conventions.md](../conventions.md)，此处只列 Controller 特有规则：

- 查询统一 `@RequestBody String params` + `MyUtil.getConditionsWhere`
- 新增/更新用 `@RequestBody Map<String, Object>`；更新路径参数 `@PathVariable("id") Long id`
- 写操作加 `@MarkLog`；每个 public 方法配 `@Operation`
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
