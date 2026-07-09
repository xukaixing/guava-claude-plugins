# API 文件模板

> [_shared.md](../_shared.md)

生成或补全 `src/api/<apiModule>.ts`。**仅生成 enabled CRUD 的 API 函数。**

## 生成前检查

```bash
# Glob 检查文件是否已存在
src/api/<apiModule>.ts
```

| 场景 | 行为 |
|------|------|
| 文件不存在 | 按模板新建 |
| 文件已存在，所需 `apiName` 均已定义 | **跳过**，页面直接 import |
| 文件已存在，缺少配置中的 `apiName` | **StrReplace 追加**缺失函数，不覆盖其他已有函数 |

**禁止**整文件覆盖 API；**禁止**因 API 文件存在而跳过页面文件的 Write。

## Import 规范

```typescript
import server from '@/api/server';
import { useFetch } from '@/hook/service/useFetch';
```

远程字典 API 若同文件无定义，从已有模块 import：
```typescript
import { findDictFromTableApi } from '@/api/admin/user';
```

## 函数命名

使用配置 CRUD 表中的 `apiName` 列。

## HTTP 方法

| 操作 | 默认 HTTP | 模板 |
|------|----------|------|
| 查询列表 | POST | `fetch.post(endpoint, datas)` |
| 新增 | POST | `fetch.post(endpoint, datas)` |
| 更新 | PUT | `fetch.put(\`${endpoint}/${id}\`, datas)` |
| 删除 | POST | `fetch.post(endpoint, datas)` |
| 子表查询 | POST | `fetch.post(endpoint, datas)` |
| form-only 加载 | GET | `fetch.get(endpoint, { params: datas })` |
| form-only 保存 | POST | `fetch.post(endpoint, datas)` |

`httpMethod` 列可覆盖默认值。`gateway` 来自配置（默认 `gateway_admin`）。

## form-only

**仅生成** `crud` 含 `load` / `save` 的 API。不生成 find/add/edit/delete 列表接口。

| 操作 | API 名 | 默认 HTTP | 端点 |
|------|--------|-----------|------|
| load | `get{Component}Api` | GET | `paths.get`（或 `paths.find`） |
| save | `save{Component}Api` | POST | `paths.save` |
| update（crud 含 update 无 save） | `update{Component}Api` | PUT | `paths.update` |

```typescript
// get <feature> api  ← load enabled
export const get<Feature>Api = (datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.get(`${server.<gateway>}<apiEndpoint>`, { params: datas });
}

// save <feature> api  ← save enabled
export const save<Feature>Api = (datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.post(`${server.<gateway>}<apiEndpoint>`, datas);
}
```

`<apiEndpoint>` 使用配置完整路径（如 `/sysconfig/getByKey`）。GET 统一 `{ params: datas }` 传参。

---

```typescript
import server from '@/api/server';
import { useFetch } from '@/hook/service/useFetch';

// find <feature> list api
export const find<Features>Api = (datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.post(`${server.<gateway>}/<apiEndpoint>`, datas);
}

// save <feature> api  ← only if add enabled
export const save<Feature>Api = (datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.post(`${server.<gateway>}/<apiEndpoint>`, datas);
}

// update <feature> api  ← only if edit enabled
export const update<Feature>Api = (id: number, datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.put(`${server.<gateway>}/<apiEndpoint>/${id}`, datas);
}

// delete <features> api  ← only if delete enabled
export const delete<Features>Api = (datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.post(`${server.<gateway>}/<apiEndpoint>`, datas);
}

// find <feature> detail api  ← only if hasSubTable
export const find<Feature>DtlApi = (datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.post(`${server.<gateway>}/<apiEndpoint>`, datas);
}
```

## 关键规则

- API 函数只做 HTTP 请求，无 UI 逻辑
- 参数类型：`Recordable<any>` 或 `any`（与现有 API 文件保持一致）
- 注释使用单行 `// xxx api`
- `<apiEndpoint>` 使用配置中的完整路径（如 `/sysuser/findUsers`），非 apiServicePath 拼接
