# Controller 模板

> [\_shared.md](../_shared.md) · [conventions.md](../conventions.md)

生成 `controller/{feature}/{Entity}Controller.java`。**仅生成 Step 1.3 选中的方法。**

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
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

/**
 * <p> {中文模块名} controller</p>
 * @author: {git user.email}
 * @created: {YYYY-MM-DD}
 * @version v1.0.1
 */
@Tag(name = "{swagger-tag}")
@RestController
@RequestMapping("/{feature}/")
@Slf4j
public class {Entity}Controller
{
  @Resource
  {entity}Service {entity}Service;
```

## 方法模板（按选中操作生成）

### 查询（始终生成）

```java
  /**
   * <p> 查询{中文名}信息 </p>
   * @author: {author}
   * @date: {date}
   * @version: 1.0.1
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
  @Operation(summary = "保存->{中文名}", description = "保存{中文名}")
  @MarkLog(value = "新增{中文名}-[{0}]", param = "{logField}")
  @PostMapping(value = "/save{Entity}")
  public Map<String, Object> save{Entity}(@RequestBody Map<String, Object> param)
  {
    return {entity}Service.save{Entity}(param);
  }
```

### 更新

```java
  @Operation(summary = "更新->{中文名}", description = "更新{中文名}")
  @MarkLog(value = "更新{中文名}-[{0}]", param = "{logField}")
  @PutMapping(value = "/update{Entity}/{id}")
  public Map<String, Object> update{Entity}(
          @PathVariable("id") Long id,
          @RequestBody Map<String, Object> param)
  {
    return {entity}Service.update{Entity}(id, param);
  }
```

### 删除

```java
  @Operation(summary = "删除->{中文名}", description = "删除{中文名}")
  @MarkLog(value = "删除{中文名}")
  @PostMapping(value = "/remove{Entity}/{id}")
  public Integer remove{Entity}(@PathVariable("id") Long id)
  {
    return {entity}Service.remove{Entity}(id);
  }
```

### 状态变更

```java
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
  @Operation(summary = "导出->{中文名}", description = "导出{中文名}")
  @PostMapping(value = "/export{Entity}Data")
  public void export{Entity}Data(
          HttpServletResponse response,
          @RequestBody Map<String, Object> param) throws IOException
  {
    AssertMyUtil.notNull(param, BizCode.VARIABLE_NOT_EMPTY, "param");
    {entity}Service.export(response, "{中文名}导出", param);
  }
```

## 关键规则

- 查询统一 `@RequestBody String params` + `MyUtil.getConditionsWhere`
- 新增/更新用 `@RequestBody Map<String, Object>`
- 更新路径参数 `@PathVariable("id") Long id`
- 写操作加 `@MarkLog`
- 仅生成 Step 1.3 选中的方法
- 端点路径与前端 `src/api/` 保持一致
