# data.ts 模板（仅 `frontendOnly: true`）

> [_shared.md](../_shared.md) · [config-parser.md](../config-parser.md#frontendonly-true仅前端--无后端-api)

当 YAML **`frontendOnly: true`** 时生成：列表/表单**不调后端 API**，数据写在本文件。  
**列表数据结构必须与后台 `datas` 一致**（供 `GvTable :table-data` 直接使用）。

## 后台返回约定（对齐）

接口外层：

```json
{ "code": 200, "status": "ok", "message": "success", "datas": { /* 见下 */ } }
```

`frontendOnly` 的 `getListResult()` **直接返回 `datas` 这一层**（与 `crud.search` 赋给 `search*Data` 的值相同）：

```json
{
  "records": [ /* 见下 */ ],
  "total": 1,
  "size": 10,
  "current": 1,
  "pages": 1
}
```

### `records` 结构

1. **第 0 条（可选但有 dic/date 列时必填）**：列转换元数据 `transHash`（GvTable 会 splice 掉，不参与展示行）
2. **其后**：真实业务行；字典/组织/用户类字段为 `{ c, v }`，日期为格式化字符串，并带 `rownums`

```json
"records": [
  {
    "transHash": {
      "status": "dic|yxzt",
      "createTime": "date|yyyy-MM-dd HH:mm",
      "deptId": "dept|o",
      "createBy": "user|o"
    }
  },
  {
    "id": 2770,
    "account": "andy",
    "userName": "andy",
    "status": { "c": "100201", "v": "启用" },
    "createTime": "2024-04-29 11:52",
    "rownums": 1
  }
]
```

### `transHash` 取值（由 ## 表格「类型」列推导）

| 表格类型列 | transHash value | 行字段形态 |
|------------|-----------------|------------|
| 空 / text | **不写**该 key | 原始 string/number |
| `dic:yxzt` | `dic\|yxzt` | `{ c: '码', v: '文案' }` |
| `date:date` | `date\|yyyy-MM-dd` | `'2026-06-08'` |
| `date:datetime` | `date\|yyyy-MM-dd HH:mm` | `'2024-04-29 11:52'` |
| 部门类（扩展注明 dept） | `dept\|o` | `{ c, v }` |
| 用户类（扩展注明 user） | `user\|o` | `{ c, v }` |

**无任何 dic/date/dept/user 列时**：可不含 `transHash` 行，`records` 只放业务行。

## 输出路径

| layout   | 路径 |
|----------|------|
| `module` | `src/views/<view>/module/data.ts` |
| `flat`   | `src/views/<view>/data.ts` |

## 生成规则

1. 根据 ## 表格列生成 `listTransHash`（仅 dic/date/dept/user）。
2. 生成 **2～3 条** `mockListRecords`（**不含** transHash）；`id`、`rownums` 必填；dic 列必须 `{ c, v }`。
3. `getListResult(rows?)`：`records = [ { transHash }, ...rows ]`（有 transHash 时）+ `total/size/current/pages`。
4. `filterListRecords`：dic 字段用 `row.field?.c`（或 string）与查询条件比较。
5. 可选 `## 示例数据` 表优先填充；dic 列可写 `码|文案` 或仅码（文案用码占位）。
6. form-only 另导出 `mockFormModel`（编辑态常用码值 string，不必 `{c,v}`）。
7. 覆盖策略：已存在则 **Write 整文件覆盖**。

## 模板（crud-module / tabs 列表）

```typescript
/**
 * @title: <moduleTitle> 前端静态数据（frontendOnly）
 * @description: 对齐后台 datas：分页 + records[0].transHash + 字典 {c,v}
 */

/** 列转换（对齐后台 datas.records[0].transHash；无 dic/date 时可 export const listTransHash = null） */
export const listTransHash: Recordable<string> | null = {
  // ← 按 ## 表格类型列生成，例：
  status: 'dic|yxzt',
  createTime: 'date|yyyy-MM-dd HH:mm',
  // deptId: 'dept|o',
  // createBy: 'user|o',
};

/**
 * 业务行（不含 transHash；增删改 mutate 本数组后再 getListResult）
 * dic 列必须 { c, v }；日期按 transHash 格式
 */
export const mockListRecords: Recordable<any>[] = [
  {
    id: 1,
    rownums: 1,
    account: 'admin',
    userName: '管理员',
    status: { c: '100201', v: '启用' },
    mobile: '13800000001',
    email: 'admin@example.com',
    createTime: '2026-01-01 10:00',
  },
  {
    id: 2,
    rownums: 2,
    account: 'demo',
    userName: '演示用户',
    status: { c: '100202', v: '停用' },
    mobile: '13800000002',
    email: 'demo@example.com',
    createTime: '2026-02-01 11:00',
  },
];

/**
 * @todo: 构造 GvTable table-data（= 后台 datas）
 */
export const getListResult = (records: Recordable<any>[] = mockListRecords): Recordable<any> => {
  const list = [...(records ?? [])];
  // 重算 rownums
  list.forEach((row, i) => {
    row.rownums = i + 1;
  });
  const size = 10;
  const total = list.length;
  const recordsOut: Recordable<any>[] = listTransHash
    ? [{ transHash: { ...listTransHash } }, ...list]
    : list;
  return {
    records: recordsOut,
    total,
    size,
    current: 1,
    pages: Math.max(1, Math.ceil(total / size) || 1),
  };
};

const cellCode = (val: unknown): string => {
  if (val == null) return '';
  if (typeof val === 'object' && val !== null && 'c' in (val as object)) {
    return String((val as { c?: string }).c ?? '');
  }
  return String(val);
};

/**
 * @todo: 按查询表单过滤（field 对齐 ## 查询，去掉 u@ 前缀；dic 比 c）
 */
export const filterListRecords = (query: Recordable<any> = {}): Recordable<any>[] => {
  const q = query || {};
  return mockListRecords.filter((row) => {
    if (q.account && !String(row.account ?? '').includes(String(q.account))) return false;
    if (q.userName && !String(row.userName ?? '').includes(String(q.userName))) return false;
    if (q.status != null && q.status !== '' && cellCode(row.status) !== cellCode(q.status)) return false;
    return true;
  });
};
```

## 模板补充（form-only）

```typescript
/** 纯表单初始值（码值即可） */
export const mockFormModel: Recordable<any> = {
  siteName: '演示站点',
  maintenanceMode: '10602',
  remark: '',
};
```
