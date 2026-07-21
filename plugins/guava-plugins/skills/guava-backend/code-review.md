# 本次生成代码检查（后端）

> 每次 Write 完成后**必须**对本轮生成/修改的文件执行。有 Critical 须修复后再结束。

对照：[conventions.md](conventions.md) · [_shared.md](_shared.md)

## 范围

仅检查**本轮** Write/StrReplace 的文件（Controller / Service / ServiceImpl，及用户要求生成的 Mapper/SqlProvider）。

## 1. 代码规范

- [ ] 包路径、类名、方法名、`RequestMapping` 符合 conventions；与前端 `paths` 对齐
- [ ] 类注解、`@Resource` 注入、HTTP 方法/参数/返回类型符合约定
- [ ] 写操作有 `@MarkLog`；查询走 `MyUtil.getConditionsWhere` 标准模式
- [ ] Javadoc 类头 + 方法注释（`@param:` / `@return:` / `@since:`）；覆盖保留原 `@since`
- [ ] 大括号换行、4 空格、`jakarta.annotation.Resource`；JDK/编译等级 ≥ 25
- [ ] 未重复生成已有端点；仅补充缺失方法

## 2. 代码安全

- [ ] SQL/条件：条件来自 `MyUtil.getConditionsWhere` 或白名单字段拼接；禁止字符串直接拼用户原始入参进 SQL
- [ ] 写操作：`AssertMyUtil`（或等价）校验必填；id/主键来自 path 时做空与合法性检查
- [ ] 无硬编码账号、密码、密钥、连接串
- [ ] 删除/更新按 id 操作，不信任 body 内可篡改的身份字段替代鉴权上下文
- [ ] 日志不打印密码、token、完整证件号等敏感字段
- [ ] 导出等大接口注意权限与参数校验（有导出时）

## 3. 性能

- [ ] 列表查询带分页（`Page` / `IPage`），禁止无分页全表扫描式接口
- [ ] `transResult` / `getTransHash()` 字段集合理，无多余翻译列
- [ ] ServiceImpl 无循环内单条查库（N+1）；批量用已有 Mapper 批量方法
- [ ] 无重复无意义的 Map↔PO 转换；能一次 `toMaps()` 则不多次拷贝
- [ ] 复杂条件可走索引字段；避免 `SELECT *` 思路下无用大字段（若手写 SQL）

## 执行与输出

1. Read 本轮文件 → 按上表逐项勾选  
2. **Critical**（规范导致不可编译/不可用、注入与越权风险）→ 立即修复并再检  
3. **Suggestion**（性能/可维护）→ 能改则改，否则在结束说明中列出  
4. 结束前简报（各 ≤3 条）：`规范` / `安全` / `性能`（无问题写「通过」）
