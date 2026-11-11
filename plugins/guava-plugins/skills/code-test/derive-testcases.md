# 用例推导（md 配置 / Vue 源码 → 用例清单）

> 主流程 `SKILL.md` · 用例模板 [test-templates.md](test-templates.md)

把功能输入转成**结构化用例清单（manifest）**——Step 4 生成 spec 的唯一依据。两个信息源交叉核对：**md 画布小节**（意图）与 **`src/views/<view>/` 生成产物**（真实 DOM），**Vue 源码优先**。

---

## 1. md 模式：解析画布小节

### 1.1 定位与解析

- md 路径解析、feature → `src/views/<view>/` 的推导见 `SKILL.md` Step 1
- 解析三个小节（小节后缀按 `-` 前前缀匹配，如 `## 编辑表单 - 用户`）：

| 小节 | 提取内容 | 服务于 |
| --- | --- | --- |
| `## 查询` | 查询条件字段：label、组件（输入/下拉/日期…）、placeholder、是否必填 | T1 页面渲染断言、T3 查询条件校验 |
| `## 表格` | 列清单；**action 按钮**（新增/编辑/删除/导出/状态变更…，区分工具栏级与行级）；`## 操作列` / 行内 `action:` | T2 按钮用例清单、T4 行级编辑入口 |
| `## 编辑表单` | 字段：label、组件、**校验规则**（required、长度、格式、错误文案）、编辑容器（GvDialog / GvDrawer，含 `### 布局` 指令时） | T3 校验用例、T4 保存/修改数据 |

### 1.2 交叉核对 Vue 生成产物

Read `src/views/<view>/` 下主 SFC 与 edit/helper 文件（只读本 view 目录，禁止全工程 grep 漫游），核对并补齐：

| 核对项 | 目的 |
| --- | --- |
| 编辑容器类型（`GvDialog` / `GvDrawer`）与标题 | T4 打开断言 |
| 按钮真实文案与 `v-if` 权限条件 | T2 选择器与可达性（`$AUTH_SCOPE` 内账号应可见） |
| `FormItem` 的 `format` 校验（rules message） | T3 期望错误文案 |
| 校验 trigger（blur / change） | T3 触发方式 |
| 下拉 / 字典列的选项来源（dic code） | T4 合法数据构造 |
| 保存成功提示文案（`ElMessage` 内容） | T4 断言 |

md 与源码冲突 → **以源码为准**，并在报告"改进建议"里标注 md 漂移。

---

## 2. 用例清单（manifest）格式

结构化清单（生成 spec 时逐条消费）：

```yaml
feature: userMng            # spec 文件名
view: sysMng/userMng        # src/views/<view>/
menuPath: [系统管理, 用户管理]   # T1；无 md 时取用户输入的菜单路径
pageTitle: 用户管理          # T1 页头断言
buttons:                    # T2
  - { name: 查询, scope: toolbar, expect: 列表刷新请求 200 }
  - { name: 重置, scope: toolbar, expect: 查询条件清空 + 列表重置 }
  - { name: 新增, scope: toolbar, expect: 新增对话框打开, dialogTitle: 新增用户 }
  - { name: 导出, scope: toolbar, expect: 下载触发且非空 }       # 有则测
  - { name: 编辑, scope: row, expect: 编辑对话框回填 }            # 只对自建记录
  - { name: 删除, scope: row, expect: 确认后删除 + 列表消失 }      # 只对自建记录，preset 范围外默认跳过
validations:               # T3（编辑表单）
  - { field: 用户名, label: 用户名, rule: required, message: 请输入用户名, trigger: blur }
  - { field: phone, label: 手机号, rule: pattern, message: 手机号格式不正确 }
queryValidations: []        # T3（查询条件，有必填才生成）
crud:                      # T4
  createFields: [用户名, 手机号, ...]   # 需填字段与合法值来源（uniqueTag / dic 首项）
  editField: 用户名                    # 修改验证字段
  successMessage: 保存成功              # 保存成功提示文案
```

## 3. 实况探测模式（无 md）

输入是功能名但 `src/pages/**` 无匹配时：

1. 用一次性 Playwright 脚本（临时 spec，`testDir` 复用脚手架）登录 → `clickMenu` 到目标页 → dump：
   - 侧边栏菜单项文本（确认菜单路径）
   - 工具栏按钮文本 / `.el-table__header` 列头
   - 打开"新增"容器后的表单字段（label + `required` 标记）与错误文案（逐字段提交空值抓 `.el-form-item__error`）
2. 从 dump 归纳 manifest（字段名用 label 拼音/英文猜测，测试数据按组件类型构造）。
3. 报告中**必须标注覆盖来源为"实况探测"**——只覆盖看得到的部分，权限分支、接口异常路径不在覆盖内。

## 4. 覆盖缺口与降级

- 按钮在 `$AUTH_SCOPE` 账号下不可见 → 跳过并标注（不测权限拒绝路径）
- 依赖第三方状态（短信验证码、支付回调）→ 跳过并标注
- 实况探测抓不到的校验规则 → T3 只测必填 + 提交空表单整体报错，其余标注缺口
