# API 文件模板

> [_shared.md](../_shared.md)

生成或补全 `src/api/<apiModule>.ts`。**仅生成 enabled CRUD 的 API 函数。**

## `frontendOnly: true`

**整节跳过**：不创建、不追加、不修改任何 `src/api/**`。列表数据见 [data.md](data.md)。

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

从 `api.operations` 的 key + 路径末段推导 API 函数名：

| operations key | 默认 HTTP | 函数名模板 | 方法名 |
|----------------|-----------|-----------|--------|
| `list` | POST | `{末段}Api` | `search{Entity}List` |
| `create` | POST | `{末段}Api` | `add{Entity}` |
| `update` | PUT | `{末段}Api` | `edit{Entity}` |
| `delete` | POST | `{末段}Api` | `delete{Entity}` |

示例：`api.operations.list: /sysuser/findUsers` → API `findUsersApi`，方法 `searchUserList`

`gateway` 来自配置（默认 `gateway_admin`）。

## form-only

**仅生成** `api.operations` 含 `get` / `save` 的 API。不生成 list/create/update/delete 列表接口。

| operations key | API 名 | 默认 HTTP | 端点 |
|----------------|--------|-----------|------|
| `get` 或 `find` | `get{Component}Api` | GET | `api.operations.get` |
| `save` | `save{Component}Api` | POST | `api.operations.save` |
| `update` | `update{Component}Api` | PUT | `api.operations.update` |

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
