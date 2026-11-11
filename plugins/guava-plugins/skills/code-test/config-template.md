# 自动化测试配置模板（test config）

> 复制本文件到消费项目根目录 `e2e.test.md` 后填写（路径可自定义，扩展名建议 `.test.md`）。
> **仅供编写新配置时读，生成 / 执行流程不读本文件**——执行时读的是你复制出来的那份。
>
> 用法：
> - `/guava-plugins:guava-test e2e.test.md`（显式给路径）
> - `/guava-plugins:guava-test`（省略参数时自动发现工程根 `e2e.test.md` / 唯一的 `*.test.md`）
>
> ⚠️ **含真实凭据时务必把该文件加入 `.gitignore`**（与 `db.yml` 同约定）；密码推荐用
> `${ENV_VAR}` 引用环境变量，避免明文入库。命令行显式传入的参数优先级高于本配置。

```yaml
---
# ---- 环境（必填）----
baseUrl: http://localhost:5173        # 被测系统入口
username: admin                       # 登录用户名
password: ${E2E_PASSWORD}             # 支持 ${ENV_VAR} 引用（运行时从环境变量解析）；也可填明文（注意 gitignore）
headless: true                        # false = 有头浏览器调试（默认 true）
# loginPath: /login                   # 登录页路径，默认 /login
# menuSelector: .el-menu              # 侧边栏容器选择器，默认 .el-menu
---

# ---- 被测功能（必填）----
# md 路径 / 功能名 / 菜单路径文本，三选一；与命令行传入的功能参数等价
feature: src/pages/sysMng/userMng.md

## 范围（可选）
# 用例类别子集，缺省 = 全量；命令行显式声明范围时以命令行为准
scope: [menu, buttons, validations, crud]

## 菜单路径（可选）
# 无 md 的功能（实况探测模式）建议填写，如 [系统管理, 用户管理]；有 md 时以 md 推导为准
menuPath: [系统管理, 用户管理]

## 预置数据授权（可选）
# own-only（默认）= 只新增/修改/删除测试自建数据（E2E_ 前缀，自动清理）
# preset = 允许触碰预置/共享数据（逐项在报告中列出）
authScope: own-only
```

## 填写说明

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `baseUrl` / `username` / `password` | ✅ | 与命令行输入等价；`password` 写 `${E2E_PASSWORD}` 时，运行前 `export E2E_PASSWORD=xxx` 或写入 `.claude/settings.json` env |
| `headless` | 可选 | `false` 适合调试选择器问题时观察浏览器 |
| `loginPath` / `menuSelector` | 可选 | 登录结构探测失败的兜底覆盖（见 fixtures.md §5） |
| `feature` | ✅ | 同 `SKILL.md` Step 1 的功能输入形态 |
| `scope` | 可选 | `menu` / `buttons` / `validations` / `crud` 任意子集 |
| `menuPath` | 可选 | 实况探测模式下帮助定位菜单 |
| `authScope` | 可选 | 超出 `own-only` 的授权会被主 agent 执行前逐条向你确认 |

## 与命令行参数的优先级

```
命令行显式参数  >  e2e.test.md 配置  >  交互询问
```

- 例：配置里 `feature: userMng.md`，命令行说"测按钮和校验" → 功能取配置、范围取命令行
- 配置缺 `baseUrl` / `username` / `password` 任一 → 仍会问，不会静默跳过
