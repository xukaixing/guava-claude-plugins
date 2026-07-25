# code-optimize / frontend

> 前端技术栈专项规则：Vue 3 · TypeScript · JavaScript · Scss · Css · ElementPlus · Echarts · Axios · Pinia · Router

---

## 五维分析

按以下五个维度逐项审查，**按优先级**输出：

### A. 性能瓶颈（Performance Bottleneck）

> 识别 O(n²) 操作和低效循环

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| 嵌套循环 | 列表内 `find`/`filter`/`includes` 嵌套 → O(n²)，大数据量卡顿 | High |
| 循环内重复计算 | 循环体内调用相同函数且参数相同，结果不变 | Medium |
| 深层遍历 | 递归/多层 `for` 遍历树形结构无剪枝 | Medium |
| 模板中调用方法 | `{{ format(row) }}` 每次 render 全量执行 | High |
| 大数据列表 | 未虚拟滚动、一次渲染上千节点 | High |
| 全量响应式 | 大数组用 `reactive` 导致深层代理开销 | Medium |
| 防抖节流缺失 | 搜索/滚动/resize 未做防抖或节流 | Medium |
| ECharts 频繁 setOption | 数据变化时全量 setOption 而非增量更新 | Medium |

### B. 内存泄漏（Memory Leak）

> 查找未释放的资源、循环引用

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| 事件监听未移除 | `addEventListener` 后在 `onUnmounted` 未 `removeEventListener` | Critical |
| 定时器未清理 | `setInterval` / `setTimeout` 未在 `onUnmounted` 清除 | Critical |
| ECharts 实例未销毁 | 未在 `onUnmounted` 调用 `chart.dispose()` | Critical |
| 全局总线订阅未取消 | `mitt`/`EventBus`.on 后未 .off | High |
| WebSocket/SSE 未关闭 | `onUnmounted` 未 `close` | High |
| ElementPlus 弹窗/监听 | `el-dialog`/`el-drawer` 关闭后未清理内部状态 | Medium |
| 循环引用 | 对象互相引用且无弱引用，GC 无法回收 | Medium |
| 大对象缓存无上限 | Map/Object 缓存数据无 LRU/清理策略 | Medium |
| 闭包引用 | 组件卸载后仍被外部变量引用（如全局数组 push 组件实例） | Medium |

### C. 算法改进（Algorithm Improvement）

> 建议更好的算法或数据结构

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| 列表查找频繁 | 反复 `find`/`filter` → 应用 `Map`/`Set` 预处理（O(1) 查找） | High |
| 去重逻辑 | 双层循环去重 → `Set` 或 `Map` 去重 | Medium |
| 排序不稳定 | 多次排序 → 合并排序条件为一次 `sort` | Low |
| 树形操作 | 多次递归 → 一次构建索引 Map | Medium |
| 字符串拼接 | 循环内 `+` 拼接 → `Array.join` 或模板字符串 | Low |

### D. 缓存机会（Caching Opportunity）

> 识别重复计算

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| 未用 computed | 派生状态每次 render 重算 → 应使用 `computed` | High |
| 相同接口重复调用 | 多组件/多周期请求相同数据 → 应缓存 Promise 或 Pinia store | Medium |
| 复杂格式化 | 同一行数据多次格式化 → 预处理一次 | Medium |
| 配置项硬编码 | 字典/映射表每次 render 重建 → 提到组件外或 `shallowRef` | Low |
| ECharts option 缓存 | 相同配置每次重建 → 复用基础 option 对象 | Low |

### E. 并发问题（Concurrency Issue）

> 查找竞态条件或线程问题

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| 请求竞态 | 快速切换条件导致后发先至，旧响应覆盖新响应 | High |
| 无 AbortController | 组件卸载后请求回调仍执行，setState 警告 | Medium |
| 共享状态污染 | 多实例共用 `reactive` 对象导致互相干扰 | Medium |
| Promise 无 catch | 未处理的 rejection 导致静默失败 | Medium |
| Axios 重复提交 | 按钮无 loading 防重、请求未做幂等处理 | High |

---

## 技术栈专项检查点

### Vue 3

| 场景 | 检查 |
|------|------|
| `<script setup>` | `defineProps`/`defineEmits` 类型完整；无 `any` |
| 响应式 | 大列表不用 `reactive`（用 `shallowRef`/`shallowReactive`）；避免深层响应式 |
| 生命周期 | `onMounted`/`onUnmounted` 配对；清理函数完整 |
| 组件通信 | `provide/inject` 不滥用；事件 emit 有类型 |
| 异步组件 | 大组件用 `defineAsyncComponent` + Suspense |
| KeepAlive | 缓存列表需关注 `onActivated`/`onDeactivated` 数据刷新 |
| computed 缓存失效 | 依赖的响应式值未在 getter 内访问导致缓存不触发 |
| v-for 与 v-if | 同层使用导致全量渲染后再过滤 → 用 computed 或 `<template>` 分离 |
| 插槽滥用 | 频繁创建作用域插槽带来额外开销 → 考虑 render 函数或组件拆分 |
| 模板中调用方法 | `{{ format(row) }}` 每次 render 全量执行 → 改用 computed |

### TypeScript / JavaScript

| 场景 | 检查 |
|------|------|
| 类型安全 | 滥用 `any`、缺少接口定义、类型断言 `as` 过度使用 |
| 重复代码 | 相同逻辑多处复制，应抽工具函数/组合式 |
| 错误边界 | Promise/请求无 catch、async 无 try-catch |
| 命名与可读性 | 变量名无意义、函数过长（>50 行） |
| 死代码 | 未使用的 import/变量/分支 |
| 硬编码 | 魔法数字/字符串应提取为常量 |
| 循环依赖 | 模块 A 引用 B、B 引用 A → 抽取公共模块 |

### Scss / Css

| 场景 | 检查 |
|------|------|
| 深层嵌套 | `&` 嵌套超过 4 层 → 类名爆炸、权重过高 |
| 重复样式 | 相同样式多次定义 → 抽 mixin / 变量 |
| `:scope` 滥用 | 未使用 `:scope` 导致样式全局污染 |
| 冗余属性 | 重复声明相同属性、使用 `!important` 覆盖 |
| 未使用变量 | 颜色/尺寸硬编码 → 应使用 SCSS 变量统一管理 |
| 冗余选择器 | 过度限定选择器（如 `div.container > ul > li > a`） |

### ElementPlus

| 场景 | 检查 |
|------|------|
| 全量引入 | `import ElementPlus from 'element-plus'` 未按需 → 打包体积膨胀 |
| 弹窗泄漏 | `el-dialog` 关闭后内部组件未销毁 → 状态残留 |
| 表单重置 | `el-form` 未调用 `resetFields()` 导致编辑态污染 |
| 表格性能 | `el-table` 大数据未开启虚拟滚动 |
| 重复校验 | 自定义 validator 无缓存 → 每次 render 重建函数 |

### Echarts

| 场景 | 检查 |
|------|------|
| 实例泄漏 | 未在 `onUnmounted` 调用 `dispose()` |
| 频繁渲染 | 数据更新全量 `setOption` → 使用 `notMerge: false` 或增量更新 |
| 未节流 | 窗口 resize 未防抖触发 `resize()` |
| 重复主题 | 每次初始化都引入完整主题 → 应全局注册一次 |
| option 缓存 | 相同配置每次重建 → 复用基础 option 对象 |

### Axios

| 场景 | 检查 |
|------|------|
| 拦截器 | `request`/`response` 拦截器未正确处理异常 |
| 重复请求 | 未用 `CancelToken` / `AbortController` 去重 |
| 未设置超时 | `timeout` 缺失导致请求挂起 |
| 错误处理 | 统一错误提示缺失或过于笼统 |
| 请求竞态 | 快速切换条件时旧响应覆盖新响应 |

### Pinia

| 场景 | 检查 |
|------|------|
| Store 过大 | 单个 Store 承载过多模块 → 应按业务拆分 |
| `$patch` 滥用 | 频繁 `$patch` 导致多次渲染 → 合并更新 |
| 未用 getter | 派生状态放 state → 应用 `getters` |
| 持久化 | 敏感数据使用 `persist` 导致泄露风险 |
| 循环依赖 | Store A 引用 Store B、B 引用 A |

### Router

| 场景 | 检查 |
|------|------|
| 懒加载 | 路由组件未使用 `() => import(...)` → 首屏体积大 |
| 守卫滥用 | `beforeEach` 逻辑过重 → 拆分或异步化 |
| 重复导航 | 未处理 `NavigationDuplicated` 异常 |
| 参数丢失 | `params` 刷新丢失 → 改用 `query` 或 `meta` |
| 未移除监听 | `watch(route)` 后未在卸载时清理 |
