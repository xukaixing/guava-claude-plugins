---
feature: userMng1
title: 用户管理
view: sysMng/userMng
layout: module
i18n: false
editPage: true
infoPage: true
frontendOnly: true
---

## 查询 - 用户信息检索

### 布局

用户信息检索布局描述

| 名称     | 字段     | 类型 | 校验  | 长度 | 扩展     |
| -------- | -------- | ---- | ----- | ---- | -------- |
| 用户姓名 | text_1   | text | isAny | 30   |          |
| 用户状态 | select_2 | dic  | isDic | 6    | dic=yxzt |

## 表格 - 用户信息列表

### 布局

表格布局描述

| 名称     | 字段   | 宽度 | 筛选 | 类型             | 固定 | 扩展                 |
| -------- | ------ | ---- | ---- | ---------------- | ---- | -------------------- |
| 操作     |        | 80   |      | action:编辑,编辑 | Y    |                      |
| 用户姓名 | text_1 | 150  | Y    |                  | Y    |                      |
| 用户账号 | text_2 | 120  | Y    |                  | Y    |                      |
| 状态     | text_3 |      | Y    | dic:xb           |      |                      |
| 金额     | text_4 |      |      |                  |      | amount, align: right |
| 部门     | text_5 | 200  |      |                  |      | type=tag             |

### 表格工具栏 - 用户信息列表

新增、新增

### 操作列 - 用户信息列表

编辑、编辑

### 操作列规则 - 用户信息列表

- **编辑**：点击后打开「用户信息表单」（Drawer）

---

## 编辑表单 - 用户信息表单

### 布局

使用 GvDrawer展示

### 登录信息（GvDescriptions）

| 名称   | 字段   | 占用列 | 类型 | 扩展 |
| ------ | ------ | ------ | ---- | ---- |
| 文本项 | text_1 | 1      |      |      |
| 文本项 | text_2 | 1      |      |      |
| 文本项 | text_3 | 1      |      |      |

### 基本信息（GvForm）

| 名称     | 字段     | 类型   | 必填 | 校验     | 长度 | 只读 | 占用列 | 扩展                        |
| -------- | -------- | ------ | ---- | -------- | ---- | ---- | ------ | --------------------------- |
| 单行文本 | text_2   | text   | Y    | isAny    | 30   |      | 1      | placeholder: 请输入         |
| 下拉选择 | select_3 | dic    | Y    | isDic    | 6    |      | 1      | dic=yxzt, placeholder: 全部 |
| 数字输入 | number_4 | number |      | isNumber |      |      | 1      | placeholder: 请输入         |
| 日期选择 | date_5   | date   | Y    | isDate   | 10   |      | 1      | placeholder: 选择日期       |

### 按钮

保存
