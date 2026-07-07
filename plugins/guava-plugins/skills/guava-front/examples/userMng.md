# 示例 — 用户管理

将下方内容保存为业务项目的 `src/pages/sysMng/userMng.md` 后执行 `/guava-plugins:guava-front <配置文件路径>`。

```markdown
---
feature: userMng
title: 用户管理
view: sysMng/userMng
layout: module
api: admin/user
apiBase: /sysuser
crud: search, add, edit, delete
editPage: true
paths:
  find: /sysuser/findUsers
  save: /sysuser/saveUser
  update: /sysuser/updateUser/{id}
  delete: /sysuser/deleteUser
---

## 查询
| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| 用户账号 | u@account | text | isNumberLetter | 30 | |
| 状态 | u@status | dic | isDic | 6 | dic=yxzt |

## 表格
| 名称 | 字段 | 宽度 | 筛选 | 类型 |
| 用户账号 | account | 130 | Y | |

## 编辑
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 扩展 |
| 用户账号 | account | text | Y | isNumberLetter | 30 | disabledOnEdit |
```

## skill 自动推导（无需写入配置）

| 推导项 | 结果 |
|--------|------|
| component | `User` |
| i18n | `userMng` |
| search 方法 | `searchUserList` |
| find API | `findUsersApi` |
| Index | `src/views/sysMng/userMng/UserIndex.vue` |
| helper | `src/views/sysMng/userMng/module/helper.tsx` |

完整推导规则见 [config-parser.md](../config-parser.md)。
