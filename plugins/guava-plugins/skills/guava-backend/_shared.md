# guava-backend 共享规则

> 规范 [conventions.md](conventions.md) · 项目 [../../README.md](../../README.md) · 路径 [../../context/backend.md](../../context/backend.md)

## 环境要求

| 项 | 要求 |
|----|------|
| JDK | **>= 25** |
| 编译等级 | **>= 25**（`maven.compiler.release` / `source`+`target`） |

生成与编译均按上述版本；不得使用更低 JDK 或更低 `--release`。

## 覆盖策略

| 文件 | 已存在时 |
|------|----------|
| Controller / Service / ServiceImpl | **Write 覆盖**；保留类头与方法上的 `@since` / `@since:` |
| Mapper / SqlProvider | 本 skill 默认不生成；用户要求时 **追加** 缺失方法 |

禁止因已存在而跳过。仅补充缺失端点时 StrReplace 追加。

## 输出根

所有路径相对于 **`GUAVA_BACKEND_ROOT`** + `backend.module`（见配置或 Interactive 确认）。

## 生成后

`hooks/lint-fix.sh` 对 Java 自动格式化；`Stop` 时校验。失败须修复后再结束。
