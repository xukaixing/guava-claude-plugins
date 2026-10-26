# ServiceImpl 模板

生成 `service/{feature}/impl/{Entity}ServiceImpl.java`。**仅实现 Step 1.3 选中的方法。**

风格对齐 `guava-admin-starter` 的 `SysUserServiceImpl.java`（4 空格、Allman 大括号、注入字段带 `/** xxx */` 注释、Javadoc 带 `<p>`）。

## 类骨架

```java
package com.guava.{module}.service.{feature}.impl;

// ↓ only if 导出:
import cn.hutool.core.util.ArrayUtil;
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
import com.guava.platform.utils.iassert.AssertMyUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static cn.hutool.core.text.CharSequenceUtil.isNotEmpty;
import static com.baomidou.mybatisplus.core.toolkit.ObjectUtils.isEmpty;
import static com.guava.platform.utils.common.MyUtil.getConditionsWhere;
import static com.guava.platform.utils.common.MyUtil.getValue;

/**
 * <p>{中文模块名}服务实现类</p>
 *
 * @author {git user.name} <{git user.email}>
 * @since {yyyy/M/d}
 */
@Service
@Slf4j
public class {Entity}ServiceImpl implements {Entity}Service
{
    /** {中文名}mapper */
    @Resource
    private {Entity}Mapper {entity}Mapper;
    /** 结果转换服务 */
    @Resource
    private TransResultService transResultService;
    // ↓ only if 导出:
    /** excel导出服务 */
    @Resource
    private ExcelApiService excelApiService;

    /**
     * <p>结果集字典转换配置</p>
     *
     * @return java.util.HashMap<java.lang.String,java.lang.String>
     * @since {yyyy/M/d}
     */
    private HashMap<String, String> getTransHash()
    {
        HashMap<String, String> transHash = HashMap.newHashMap(16);
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
     * <p>查询{中文名}信息</p>
     *
     * @param page
     * @param conditions
     * @return com.baomidou.mybatisplus.core.metadata.IPage<java.util.Map<java.lang.String,java.lang.Object>>
     * @since {yyyy/M/d}
     */
    @Override
    public IPage<Map<String, Object>> find{Entity}(Page<Map<String, Object>> page, String conditions)
    {
        // 设置排序
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
     * <p>保存{中文名}信息</p>
     *
     * @param param
     * @return java.util.Map<java.lang.String,java.lang.Object>
     * @since {yyyy/M/d}
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
        // todo: 如需同步 Redis/Feign，在此调用
        return transResultService.transResult(po.toMaps(), getTransHash());
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
    @Override
    public Map<String, Object> update{Entity}(Long id, Map<String, Object> param)
    {
        AssertMyUtil.notNull(id, BizCode.METHOD_ARGS_NOTNULL, "id");
        {Entity}PO po = Map2ObjUtil.toObject(param, {Entity}PO.class);
        AssertMyUtil.notNull(po, BizCode.VARIABLE_NOT_NULL, "{entity}PO");
        po.setId(id);
        {entity}Mapper.updateById(po);
        // todo: 如需同步 Redis/Feign，在此调用
        return transResultService.transResult(po.toMaps(), getTransHash());
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
     * <p>更新{中文名}状态</p>
     *
     * @param id
     * @param status
     * @return java.util.Map<java.lang.String,java.lang.Object>
     * @since {yyyy/M/d}
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

接口声明 `throws IOException`（见 service.md），实现**收窄 throws**——实现体内不抛出受检异常时不写 `throws`，也不需要 `java.io.IOException` import：

```java
    /**
     * <p>导出{中文名}信息</p>
     *
     * @param response
     * @param fileName
     * @param param
     * @return void
     * @since {yyyy/M/d}
     */
    @Override
    public void export(HttpServletResponse response, String fileName, Map<String, Object> param)
    {
        String header = getValue(param.get("header"));
        String qc = getConditionsWhere(param, null);
        List<List<String>> headList = new ArrayList<>();
        List<String> headFields = excelApiService.toHeader(header, headList);
        String fields = ArrayUtil.join(headFields.toArray(), ",");
        List<Map<String, Object>> dataList = {entity}Mapper.export{Entity}(fields, qc);
        excelApiService.export(response, fileName, headFields, headList, dataList, getTransHash());
    }
```

> 需要补 import `java.util.ArrayList`。`{entity}Mapper.export{Entity}(fields, qc)` 对应 Mapper XML 中的自定义导出查询。

## 实现要点

| 场景         | 模式                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| Map → PO     | `Map2ObjUtil.toObject(param, XxxPO.class)`                                                    |
| 参数校验     | `AssertMyUtil.notNull / notEmpty / errMsg`                                                    |
| 查询结果翻译 | `transResultService.transResult(data, getTransHash())`                                        |
| PO → 返回    | `po.toMaps()` 再翻译                                                                          |
| 排序         | `OrderItem` + `page.addOrder(oi)`                                                             |
| 唯一校验     | Mapper 自定义方法 + `AssertMyUtil.errMsg`                                                     |
| 新建 Map     | `HashMap.newHashMap(16)`（JDK 25）                                                            |
| 导出         | `excelApiService.toHeader(header, headList)` → `ArrayUtil.join` → Mapper 导出查询 → `export` |

## 关键规则

> 通用风格（Javadoc `<p>` + 标准 `@param`/`@return`/`@throws`/`@since`、Allman、4 空格、static import、`HashMap.newHashMap(16)`、throws 收窄、框架优先）见 [conventions.md](../conventions.md)，此处只列 ServiceImpl 特有规则：

- `getTransHash()` 必须覆盖 Step 1.1/1.2 中所有字典和日期字段
- 查询方法必须设置默认排序（`OrderItem` + `page.addOrder(oi)`）
- 新增/更新后返回翻译后的 Map：`transResultService.transResult(po.toMaps(), getTransHash())`
- 复杂业务逻辑（Redis 同步、级联操作）用 `// todo:` 标注，不臆造 Feign 接口
- 仅实现选中操作，不生成空方法
