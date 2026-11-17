# Service 接口模板

生成 `service/{feature}/{ApiName}Service.java`（`{ApiName}` = 请求上下文去 `/` 转 PascalCase，驼峰保留）。**仅定义 Step 1.3 选中的方法。**

风格对齐 `guava-admin-starter` 的 `SysUserService.java`（4 空格、Allman 大括号、Javadoc 带 `<p>`）。

## 模板

```java
package com.guava.{module}.service.{feature};

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

/**
 * <p>{中文模块名}服务接口</p>
 *
 * @author {git user.name} <{git user.email}>
 * @since {yyyy/M/d}
 */
public interface {ApiName}Service
{
    IPage<Map<String, Object>> find{Entity}(Page<Map<String, Object>> page, String conditions);

    Map<String, Object> save{Entity}(Map<String, Object> param);

    Map<String, Object> update{Entity}(Long {pk}, Map<String, Object> param);

    Integer remove{Entity}(Long {pk});

    Map<String, Object> update{Entity}Status(Long {pk}, Integer status);

    void export(HttpServletResponse response, String fileName, Map<String, Object> params) throws IOException;
}
```

> 接口方法**不加 Javadoc/注释**（实现类 ServiceImpl 与 Controller 已有）；类头 Javadoc 保留。方法签名仅列选中操作。

## 方法签名约定

| 操作 | 签名 | 触发条件 |
| ---- | --- | -------- |
| 查询 | `IPage<Map<String, Object>> findXxx(Page<Map<String, Object>> page, String conditions)` | 必选 |
| 新增 | `Map<String, Object> saveXxx(Map<String, Object> param)` | operations.save |
| 更新 | `Map<String, Object> updateXxx(Long {pk}, Map<String, Object> param)` | operations.update |
| 删除 | `Integer removeXxx(Long {pk})` | operations.delete |
| 状态 | `Map<String, Object> updateXxxStatus(Long {pk}, Integer status)` | 「服务逻辑描述」含「状态更新」 |
| 导出 | `void exportXxxData(HttpServletResponse response, String fileName, Map<String, Object> params) throws IOException` | 「服务逻辑描述」含「导出」 |

## 关键规则

> 通用风格（类头 Javadoc、标准 `@param`/`@return`/`@throws`/`@since`）见 [conventions.md](../conventions.md)。

- 查询方法第二个参数统一命名 `conditions`
- 返回 Map 用于单条记录；列表用 `IPage<Map<String, Object>>`
- import 顺序：com.baomidou → jakarta → 空行 → java.*；不加 `@Service` 注解（仅 Impl 加）
- 仅声明选中操作的方法，不留空壳
- 接口方法不加注释（Javadoc 只保留类头；实现类已有方法注释）
