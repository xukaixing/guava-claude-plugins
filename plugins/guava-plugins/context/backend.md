# 后端上下文（按需）

> 流程 `skills/guava-backend/SKILL.md` · 规范 `skills/guava-backend/conventions.md`

## 工程根路径

优先 `settings.json` / `settings.local.json` 中的 **`GUAVA_BACKEND_ROOT`**（Maven 多模块根，含 `pom.xml`）。

未配置时默认：`${CLAUDE_PROJECT_DIR}/../guava-admin`（按本机实际调整）。

生成 Java 写入该目录下模块，例如：

```text
{GUAVA_BACKEND_ROOT}/guava-admin-starter/src/main/java/com/guava/admin/
├── controller/{feature}/
├── service/{feature}/
└── ...
```

## 与前端对齐

| 前端配置 | 后端 |
|----------|------|
| `apiBase: /sysuser` | `@RequestMapping("/sysuser/")` 或 feature 段一致 |
| `paths.find/save/...` | Controller 端点同名 |
| 查询表 `field` | `MyUtil.getConditionsWhere` 字段一致（见 `search-conditions.md`） |

可选 YAML（`guava-all` / 全栈配置）：

```yaml
backend:
  module: guava-admin-starter
  package: com.guava.admin
  feature: sysuser
  entity: SysUserPO
```

## 环境

- JDK **>= 25**，编译等级 **>= 25**

## 命令

```bash
# 在 GUAVA_BACKEND_ROOT 下（需 JDK >= 25）
mvn -pl guava-admin-starter -am compile -q
mvn spotless:apply          # 若项目已配 spotless
```

## 生成后 hook

`hooks/lint-fix.sh` 对 `.java`：`google-java-format -i` 或 `mvn spotless:apply`（见 `GUAVA_JAVA_FORMAT`）。
