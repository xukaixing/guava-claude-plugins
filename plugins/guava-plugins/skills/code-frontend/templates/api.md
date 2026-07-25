# API 文件

> [\_shared.md](../_shared.md)

生成或补全 `src/api/<apiModule>.ts`。**仅生成 enabled CRUD 的 API 函数。**

---

## 1. frontendOnly

**整节跳过**：不创建、不追加、不修改任何 `src/api/**`。

---

## 2. 生成前检查

| 场景 | 行为 |
| ---- | ---- |
| 文件不存在 | 按模板新建 |
| 文件已存在，所需 API 均已定义 | **跳过**，页面直接 import |
| 文件已存在，缺少配置中的 API | **StrReplace 追加**缺失函数 |

**禁止**整文件覆盖 API；**禁止**因 API 文件存在而跳过页面 Write。

---

## 3. Import 规范

```typescript
import server from '@/api/server';
import { useFetch } from '@/hook/service/useFetch';
```

远程字典 API 若同文件无定义，从已有模块 import：
```typescript
import { findDictFromTableApi } from '@/api/admin/user';
```

---

## 4. 函数命名

从 `api.operations` 的 key + 路径末段推导：

| operations key | HTTP | 函数名模板 | 方法名 |
| -------------- | ---- | --------- | ------ |
| `list` | POST | `{末段}Api` | `search{Entity}List` |
| `create` | POST | `{末段}Api` | `add{Entity}` |
| `update` | PUT | `{末段}Api` | `edit{Entity}` |
| `delete` | POST | `{末段}Api` | `delete{Entity}` |

> 示例：`list: /sysuser/findUsers` → API `findUsersApi`，方法 `searchUserList`

---

## 5. 模板

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

> `<apiEndpoint>` 使用配置中的完整路径（如 `/sysuser/findUsers`）。

---

## 6. form-only

**仅生成** `get` / `save` 对应的 API：

| operations key | API 名 | HTTP |
| -------------- | ------ | ---- |
| `get` / `find` | `get{Component}Api` | GET |
| `save` | `save{Component}Api` | POST |
| `update` | `update{Component}Api` | PUT |

```typescript
// get <feature> api
export const get<Feature>Api = (datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.get(`${server.<gateway>}<apiEndpoint>`, { params: datas });
}

// save <feature> api
export const save<Feature>Api = (datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.post(`${server.<gateway>}<apiEndpoint>`, datas);
}
```

---

## 7. 关键规则

- API 函数只做 HTTP 请求，无 UI 逻辑
- 参数类型：`Recordable<any>` 或 `any`
- 注释使用单行 `// xxx api`
- GET 统一 `{ params: datas }` 传参
