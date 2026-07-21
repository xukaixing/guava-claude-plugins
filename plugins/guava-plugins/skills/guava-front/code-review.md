# 本次生成代码检查（前端）

> 每次 Write 完成后**必须**对本轮生成/修改的文件执行。有 Critical 须修复后再结束。

对照：[conventions.md](conventions.md) · [_shared.md](_shared.md)

## 范围

仅检查**本轮** Write/StrReplace 的文件（`*.vue` / `helper.tsx` / `types.d.ts` / `data.ts` / `src/api/**` / locales）。

## 1. 代码规范

- [ ] 路径 = `src/views/<YAML.view>/`；命名、layout 符合 conventions
- [ ] `@section` 分区齐全且顺序正确；无 `function` / `reactive` / 纯 `any` / import 带扩展名
- [ ] 全局类型未 import；`FormInstance`/`TableInstance` 从 `element-plus` 导入
- [ ] 方法多行 JSDoc（`@todo:` / `@author:` / `@Date:`）；API 单行 `// xxx api`
- [ ] 文件头 `@title`/`@version`/`@date`/`@LastEditTime` 正确；覆盖时保留 `@date`、递增 `@version`
- [ ] template **优先 Gv\***；已有 Gv* 时无多余 `el-*`；字段走 helper `FormItem[]`/`TableHeadItem[]`
- [ ] 新页面 `create*List` + i18n，无硬编码中文 label
- [ ] `format` 校验完整（查询/编辑 validator 必填）；`frontendOnly` 时无 api、有 `data.ts`

## 2. 代码安全

- [ ] 无 `v-html` / `innerHTML` 渲染未消毒用户数据
- [ ] 无硬编码 token、密码、密钥、内网地址
- [ ] `data.ts` mock 无真实 PII/生产数据；敏感字段不落前端日志
- [ ] 删除/状态变更有确认；写操作走 `crud.save`/`update`/`submit`，不绕过表单校验
- [ ] 路由参数 / 查询入参做空值与类型兜底，避免异常抛到未处理

## 3. 性能

- [ ] 列表走分页/`crud.search`，无一次拉全量的写死大数组（mock 除外且保持小样本）
- [ ] 无多余 `watch`/`watchEffect`（能 `computed` 则不用 watch）
- [ ] 字典/远程选项不在循环内重复请求；复用已有 API
- [ ] 大表单无整表无意义的深拷贝；编辑回填用 `crud.setEditValue`
- [ ] tabs 子表按需查询，切换时不重复打相同接口（有缓存或条件判断）

## 执行与输出

1. Read 本轮文件 → 按上表逐项勾选  
2. **Critical**（规范违反导致不可用、安全漏洞）→ 立即修复并再检  
3. **Suggestion**（性能/可维护）→ 能改则改，否则在结束说明中列出  
4. 结束前简报（各 ≤3 条）：`规范` / `安全` / `性能`（无问题写「通过」）
