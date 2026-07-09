# Service 接口模板

生成 `service/{feature}/{Entity}Service.java`。**仅定义 Step 1.3 选中的方法。**

## 模板

```java
package com.guava.{module}.service.{feature};

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

/**
 * <p> {中文模块名} service 接口</p>
 * @author: {author}
 * @created: {YYYY-MM-DD}
 * @version v1.0.1
 */
public interface {Entity}Service
{
  // ↓ 查询（始终）
  IPage<Map<String, Object>> find{Entity}(Page<Map<String, Object>> page, String qc);

  // ↓ only if 新增:
  Map<String, Object> save{Entity}(Map<String, Object> param);

  // ↓ only if 编辑:
  Map<String, Object> update{Entity}(Long id, Map<String, Object> param);

  // ↓ only if 删除:
  Integer remove{Entity}(Long id);

  // ↓ only if 状态变更:
  Map<String, Object> update{Entity}Status(Long id, Integer status);

  // ↓ only if 导出:
  void export(HttpServletResponse response, String fileName, Map<String, Object> params) throws IOException;
}
```

## 方法签名约定

| 操作 | 签名                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| 查询 | `IPage<Map<String, Object>> findXxx(Page<Map<String, Object>> page, String qc)`                             |
| 新增 | `Map<String, Object> saveXxx(Map<String, Object> param)`                                                    |
| 更新 | `Map<String, Object> updateXxx(Long id, Map<String, Object> param)`                                         |
| 删除 | `Integer removeXxx(Long id)`                                                                                |
| 状态 | `Map<String, Object> updateXxxStatus(Long id, Integer status)`                                              |
| 导出 | `void export(HttpServletResponse response, String fileName, Map<String, Object> params) throws IOException` |

## 关键规则

- 查询方法第二个参数统一命名 `qc` 或 `conditions`
- 返回 Map 用于单条记录；列表用 `IPage<Map<String, Object>>`
- 不加 `@Service` 注解（仅 Impl 加）
- 仅声明选中操作的方法，不留空壳
