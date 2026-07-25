# ServiceImpl 模板

生成 `service/{feature}/impl/{Entity}ServiceImpl.java`。**仅实现 Step 1.3 选中的方法。**

Javadoc 对齐 `guava-gateway-starter`（见 [conventions.md](../conventions.md)）。

## 类骨架

```java
package com.guava.{module}.service.{feature}.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.guava.{module}.repository.{Entity}Mapper;
import com.guava.{module}.service.{feature}.{Entity}Service;
import com.guava.component.constant.FormatConstant;
import com.guava.component.utils.bean.Map2ObjUtil;
import com.guava.entity.po.{Entity}PO;
import com.guava.platform.exception.BizCode;
import com.guava.platform.service.ExcelApiService;
import com.guava.platform.service.TransResultService;
import com.guava.platform.utils.common.ArrayMyUtil;
import com.guava.platform.utils.common.MyUtil;
import com.guava.platform.utils.iassert.AssertMyUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * {中文模块名} serviceImpl
 * <p>{中文模块名} serviceImpl 实现类 </p>
 *
 * @author {git user.name} <{git user.email}>
 * @since {M/d/yy}
 */
@Service
@Slf4j
public class {Entity}ServiceImpl implements {Entity}Service
{
  @Resource
  private {Entity}Mapper {entity}Mapper;
  @Resource
  private TransResultService transResultService;
  // ↓ only if 导出:
  @Resource
  private ExcelApiService excelApiService;

  /**
   * 字典/日期翻译配置
   * @param:
   * @return: java.util.HashMap<java.lang.String, java.lang.String>
   * @since: {M/d/yy}
   */
  private HashMap<String, String> getTransHash()
  {
    HashMap<String, String> transHash = new HashMap<>();
    transHash.put("bizType", "dic|ywlx");     // ← 按确认表逐条添加
    transHash.put("status", "dic|yxzt");
    transHash.put("createTime", "date|" + FormatConstant.SIMPLE_DATE_TIME_FORMAT);
    return transHash;
  }
```

## 方法实现（按选中操作生成）

### 查询

```java
  /**
   * 查询{中文名}信息
   * @param: page
   * @param: conditions
   * @return: com.baomidou.mybatisplus.core.metadata.IPage<java.util.Map<java.lang.String, java.lang.Object>>
   * @since: {M/d/yy}
   */
  @Override
  public IPage<Map<String, Object>> find{Entity}(Page<Map<String, Object>> page, String conditions)
  {
    OrderItem oi = new OrderItem();
    oi.setColumn("{table_alias}.create_time");   // ← 排序列
    oi.setAsc(false);
    page.addOrder(oi);
    return transResultService.transResult(
        {entity}Mapper.find{Entity}(page, conditions),
        getTransHash()
    );
  }
```

### 新增

```java
  /**
   * 新增{中文名}
   * @param: param
   * @return: java.util.Map<java.lang.String, java.lang.Object>
   * @since: {M/d/yy}
   */
  @Override
  public Map<String, Object> save{Entity}(Map<String, Object> param)
  {
    {Entity}PO po = Map2ObjUtil.toObject(param, {Entity}PO.class);
    AssertMyUtil.notNull(po, BizCode.VARIABLE_NOT_NULL, "{entity}PO");
    // ↓ 唯一性等业务校验（按 Step 1.2 备注）
    // Integer exist = {entity}Mapper.checkXxx(po.getXxxField());
    // if (exist != 0) { AssertMyUtil.errMsg("xxx重复"); }
    {entity}Mapper.save(po);
    // ↓ 如需同步 Redis/Feign，在此调用
    return transResultService.transResult(po.toMaps(), getTransHash());
  }
```

### 更新

```java
  /**
   * 更新{中文名}
   * @param: id
   * @param: param
   * @return: java.util.Map<java.lang.String, java.lang.Object>
   * @since: {M/d/yy}
   */
  @Override
  public Map<String, Object> update{Entity}(Long id, Map<String, Object> param)
  {
    {Entity}PO po = Map2ObjUtil.toObject(param, {Entity}PO.class);
    AssertMyUtil.notNull(po, BizCode.VARIABLE_NOT_NULL, "{entity}PO");
    po.setId(id);
    {entity}Mapper.updateById(po);
    // ↓ 如需同步 Redis/Feign，在此调用
    return transResultService.transResult(po.toMaps(), getTransHash());
  }
```

### 删除

```java
  /**
   * 删除{中文名}
   * @param: id
   * @return: java.lang.Integer
   * @since: {M/d/yy}
   */
  @Override
  public Integer remove{Entity}(Long id)
  {
    AssertMyUtil.notNull(id, BizCode.VARIABLE_NOT_NULL, "id");
    return {entity}Mapper.deleteById(id);
  }
```

### 状态变更

```java
  /**
   * 更新{中文名}状态
   * @param: id
   * @param: status
   * @return: java.util.Map<java.lang.String, java.lang.Object>
   * @since: {M/d/yy}
   */
  @Override
  public Map<String, Object> update{Entity}Status(Long id, Integer status)
  {
    AssertMyUtil.notNull(id, BizCode.VARIABLE_NOT_NULL, "id");
    {Entity}PO po = new {Entity}PO();
    po.setId(id);
    po.setStatus(status);
    {entity}Mapper.updateById(po);
    return transResultService.transResult(po.toMaps(), getTransHash());
  }
```

### 导出

```java
  /**
   * 导出{中文名}
   * @param: response
   * @param: fileName
   * @param: param
   * @return: void
   * @since: {M/d/yy}
   */
  @Override
  public void export(HttpServletResponse response, String fileName, Map<String, Object> param) throws IOException
  {
    Page<Map<String, Object>> page = new Page<>();
    String qc = MyUtil.getConditionsWhere(param, page);
    List<Map<String, Object>> dataList = {entity}Mapper.find{Entity}(page, qc).getRecords();
    List<Map<String, Object>> transList = transResultService.transResult(dataList, getTransHash());
    // 表头列名与前端导出配置对齐
    String[] headers = ArrayMyUtil.toStringArray(param.get("header"));
    excelApiService.exportExcel(response, fileName, headers, transList);
  }
```

## 实现要点

| 场景         | 模式                                                   |
| ------------ | ------------------------------------------------------ |
| Map → PO     | `Map2ObjUtil.toObject(param, XxxPO.class)`             |
| 参数校验     | `AssertMyUtil.notNull / notEmpty / errMsg`             |
| 查询结果翻译 | `transResultService.transResult(data, getTransHash())` |
| PO → 返回    | `po.toMaps()` 再翻译                                   |
| 排序         | `OrderItem` + `page.addOrder(oi)`                      |
| 唯一校验     | Mapper 自定义方法 + `AssertMyUtil.errMsg`              |

## 关键规则

- 每个 public/private 方法带方法注释：描述 + `@param:` + `@return:` + `@since:`
- `getTransHash()` 必须覆盖 Step 1.1/1.2 中所有字典和日期字段
- 查询方法必须设置默认排序
- 新增/更新后返回翻译后的 Map
- 复杂业务逻辑（Redis 同步、级联操作）用 `// todo:` 标注，不臆造 Feign 接口
- 仅实现选中操作，不生成空方法
