# data.ts（仅 frontendOnly: true）

> [\_shared.md](../_shared.md) · [config-parser.md](../config-parser.md#frontendonly-true仅前端--无后端-api)

当 YAML **`frontendOnly: true`** 时生成：列表 / 表单**不调后端 API**，数据写在本文件。

---

## 1. 后台返回约定

`getListResult(rows?, query?)` **直接返回 `datas` 这一层**（与 `crud.search` 赋给 `search*Data` 的值相同），且**必须带分页**：

```json
{
  "records": [ { "transHash": { "status": "dic|yxzt" } }, { "id": 1, "rownums": 1, ... } ],
  "total": 10,
  "size": 10,
  "current": 1,
  "pages": 1
}
```

---

## 2. records 结构

| 位置 | 内容 |
| ---- | ---- |
| 第 0 条（有 dic / date 列时必填） | `transHash` 列转换元数据（GvTable 会 splice 掉） |
| 其后 | 真实业务行；字典字段 `{ c, v }`，日期格式化字符串，带 `rownums` |

### transHash 取值

| 表格类型列 | transHash value | 行字段形态 |
| ---------- | --------------- | ---------- |
| 空 / text | **不写** | 原始 string / number |
| `dic:yxzt` | `dic\|yxzt` | `{ c: '码', v: '文案' }` |
| 列名含「日期」 | `date\|yyyy-MM-dd` | `'2026-06-08'` |
| 列名含「时间」 | `date\|yyyy-MM-dd HH:mm` | `'2024-04-29 11:52:00'` |
| 部门类 | `dept\|o` | `{ c, v }` |
| 用户类 | `user\|o` | `{ c, v }` |

> **日期数据格式**：含「日期」→ `yyyy-MM-dd`；含「时间」→ `yyyy-MM-dd HH:mm:ss`

---

## 3. 输出路径

| layout | 路径 |
| ------ | ---- |
| `module` | `src/views/<view>/module/data.ts` |
| `flat` | `src/views/<view>/data.ts` |

---

## 4. 模板（crud-module / tabs 列表）

```typescript
/** 列转换（无 dic/date 时可 export const listTransHash = null） */
export const listTransHash: Recordable<string> | null = {
  status: 'dic|yxzt',
  createTime: 'date|yyyy-MM-dd HH:mm',
};

/** 业务行（不含 transHash） */
export const mockListRecords: Recordable<any>[] = [
  {
    id: 1,
    rownums: 1,
    account: 'admin',
    userName: '管理员',
    status: { c: '100201', v: '启用' },
    createTime: '2026-01-01 10:00:00',  // 含「时间」→ 带时分秒
    createDate: '2026-01-01',            // 含「日期」→ 仅日期
  },
  { id: 2, rownums: 2, account: 'demo', userName: '演示用户', status: { c: '100202', v: '停用' }, createTime: '2026-02-01 11:00:00', createDate: '2026-02-01' },
];

/** 构造 GvTable table-data（= 后台 datas） */
export const getListResult = (
  records: Recordable<any>[] = mockListRecords,
  query: Recordable<any> = {},
): Recordable<any> => {
  const list = [...(records ?? [])];
  const pageinfo = query?.pageinfo || {};
  const size = Number(pageinfo.recordsperpage ?? query.size ?? 10) || 10;
  const current = Number(pageinfo.currentpagenum ?? query.current ?? 1) || 1;
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / size) || 1);
  const safeCurrent = Math.min(Math.max(current, 1), pages);
  const start = (safeCurrent - 1) * size;
  const pageList = list.slice(start, start + size);
  pageList.forEach((row, i) => { row.rownums = start + i + 1; });
  const recordsOut: Recordable<any>[] = listTransHash ? [{ transHash: { ...listTransHash } }, ...pageList] : pageList;
  return { records: recordsOut, total, size, current: safeCurrent, pages };
};

const cellCode = (val: unknown): string => {
  if (val == null) return '';
  if (typeof val === 'object' && val !== null && 'c' in (val as object)) return String((val as { c?: string }).c ?? '');
  return String(val);
};

/** 按查询表单过滤 */
export const filterListRecords = (query: Recordable<any> = {}): Recordable<any>[] => {
  const q = query || {};
  return mockListRecords.filter((row) => {
    if (q.account && !String(row.account ?? '').includes(String(q.account))) return false;
    if (q.status != null && q.status !== '' && cellCode(row.status) !== cellCode(q.status)) return false;
    return true;
  });
};
```

---

## 5. form-only 补充

```typescript
/** 纯表单初始值 */
export const mockFormModel: Recordable<any> = {
  siteName: '演示站点',
  maintenanceMode: '10602',
  remark: '',
};
```

---

## 6. 生成规则

1. 根据 ## 表格列生成 `listTransHash`（仅 dic / date / dept / user）
2. 生成 2～3 条 `mockListRecords`（**不含** transHash）；`id`、`rownums` 必填
3. `getListResult`：必须返回分页字段；按 `query.pageinfo` 切片；`records = [{ transHash }, ...pageRows]`
4. `filterListRecords`：dic 字段用 `row.field?.c` 比较
5. 可选 `## 示例数据` 表优先填充
6. 覆盖策略：已存在则 Write 整文件覆盖
