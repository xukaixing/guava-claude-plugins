---
feature: userMng1
title: 用户管理
view: sysMng/userMng1
infoPage: true

api:
  module: admin/userMng1
  base: /usermng1
  operations:
    list: /usermng1/findUsers
    save: /usermng1/saveUser
    update: /usermng1/updateUser/{id}
---

## 查询 - 用户信息检索

### 布局

用户信息检索布局描述

| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| 用户姓名 | text_1 | text | isAny | 30 |

## 表格 - 用户信息列表

### 布局

表格布局描述

| 名称 | 字段 | 宽度 | 筛选 | 类型 | 固定 | 扩展 |
| 操作 | | 80 | | action:编辑,删除 | Y |
| 用户姓名 | userName | 150 | Y | | Y |
| 用户账号 | account | 120 | Y | | Y |
| 状态 | status | | Y | dic:xb |
| 金额 | text_4 | | | | | amount, align: right |
| 部门 | deptId | 200 | | | | type=tag |
| 多级表头 | | | | multiHeader |
| 表头 | text_10 |

### 表格工具栏 - 用户信息列表

新增

### 操作列规则 - 用户信息列表

- 编辑：点击后打开「用户信息表单」（Drawer）

---

## 编辑表单 - 用户信息表单（GvDrawer）

### 布局

使用 GvDrawer展示

### 登录信息（GvDescriptions）

#### 布局

描述GvDescription描述

| 名称 | 字段 | 占用列 | 类型 | 扩展 |
| 文本项 | text_1 | 1 |
| 文本项 | text_2 | 1 |
| 文本项 | text_3 | 1 |

### 基本信息（GvForm）

#### 布局

用户信息编辑表单

| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 单行文本 | text_2 | text | Y | isAny | 30 | | 1 | suffixBtn=search:登录列表(Dialog) |
| 下拉选择 | select_3 | dic | Y | isDic | 6 | | 1 | dic=yxzt |
| 数字输入 | number_4 | number | | isNumber | 6 | | 1 |
| 日期选择 | date_5 | date | Y | isDate | 10 | | 1 |

### 按钮

保存

---

## 编辑表单 - 登录列表（GvDialog，宽度 50%）

### 登录列表（GvForm）

| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 单行文本 | text_2 | text | | isAny | 30 | | 1 |
| 单行文本 | text_3 | text | | isAny | 30 | | 1 |

### 按钮

保存

---

## 服务配置(backend)

### 基本信息

- 工程：/Users/andyhsu/Workspace/guava/guava-pro/guava-admin-starter
- 包路径：com.guava.admin
- 功能：usermng1
- 数据库实例：guava_sys
- 请求上下文：/sysuser1
- Swagger Tag：admin-usermng1
- 实体：SysUserPO

### 服务逻辑描述

- 操作：查询、保存、更新

### 字典翻译

- status：dic|xb

### 列表数据表

- 用户信息列表（主画布）：数据库 guava_sys；表 sys_user（别名 su）
  - 查询列：userName、account、status、text_4、deptId、text_10

## 改进

- 描述改进建议
- 新增加配置及应用
