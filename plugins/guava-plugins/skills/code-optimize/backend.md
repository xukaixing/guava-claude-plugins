# code-optimize / backend

> 后端技术栈专项规则：Java · SpringBoot · SpringCloud · Redis · MyBatis · MySQL · MQ · JVM

---

## 五维分析

按以下五个维度逐项审查，**按优先级**输出：

### A. 性能瓶颈（Performance Bottleneck）

> 识别 O(n²) 操作和低效循环

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| N+1 查询 | 循环内逐条查数据库 → 应批量 `IN` 或 `JOIN` | High |
| 全表扫描 | 缺少索引条件、`LIKE '%xxx'` 前缀模糊 → 优化 SQL 或 ES | High |
| 嵌套循环 | 列表内 `find`/`filter`/`contains` 嵌套 → O(n²) | High |
| 深分页 | `LIMIT 1000000, 10` → 游标分页 `WHERE id > lastId` | High |
| 大事务 | 事务内包含 RPC/IO → 拆分事务范围 | High |
| 循环内重复调用 | 循环体内调用相同 RPC/DB 且参数相同 | Medium |
| 未批量操作 | 循环 `insert`/`update` → 批量 SQL 或 `ExecutorType.BATCH` | Medium |
| 线程池队列满 | `Executors.newFixedThreadPool` 无界队列 → OOM | High |
| 连接池耗尽 | 数据库/HTTP 连接池未配置 max-size、超时 | High |
| Stream 滥用 | 简单遍历用 Stream → 可读性差且性能略低 | Low |

### B. 内存泄漏（Memory Leak）

> 查找未释放的资源、循环引用

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| 未关闭资源 | `InputStream`/`Connection`/`Jedis` 未 `try-with-resources` | Critical |
| ThreadLocal 泄漏 | 线程池场景下 `ThreadLocal` 未 `remove()` | Critical |
| 连接池泄漏 | 连接未归还 → 池耗尽 | Critical |
| 循环引用 | 对象互相引用且无弱引用，GC 无法回收 | Medium |
| 大对象缓存无上限 | Map/Object 缓存数据无 LRU/清理策略 | Medium |
| 元空间 OOM | 动态类加载过多 → `Metaspace` 膨胀 | High |
| 堆外内存 | NIO/Netty 直接内存未限制 → `MaxDirectMemorySize` | Medium |
| Redis 连接泄漏 | `Jedis` 未 `close()` → 连接池耗尽 | Critical |

### C. 算法改进（Algorithm Improvement）

> 建议更好的算法或数据结构

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| 列表查找频繁 | 反复遍历查找 → 应用 `HashMap`/`HashSet` 预处理（O(1) 查找） | High |
| 去重逻辑 | 双层循环去重 → `HashSet` 去重 | Medium |
| 排序不稳定 | 多次排序 → 合并排序条件为一次 `sort` | Low |
| 树形操作 | 多次递归 → 一次构建索引 Map | Medium |
| 字符串拼接 | 循环内 `+` → `StringBuilder` | Low |
| 集合未指定容量 | `new ArrayList<>()` 频繁扩容 → 预估 `new ArrayList<>(size)` | Low |
| 自动装箱 | 大量 `int → Integer` → 使用基本类型或 `IntStream` | Low |

### D. 缓存机会（Caching Opportunity）

> 识别重复计算

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| 未用缓存 | 高频查询直接打 DB → 应加 Redis 缓存 | High |
| 相同接口重复调用 | 多方法/多周期查相同数据 → 应缓存结果 | Medium |
| 缓存穿透 | 不存在的数据直接打到 DB → 布隆过滤器或空值缓存 | High |
| 缓存击穿 | 热点 Key 失效瞬间大量请求 → 互斥锁或逻辑过期 | High |
| 缓存雪崩 | 大量 Key 同时失效 → 加随机过期时间 | High |
| 配置项硬编码 | 字典/映射表每次重建 → 启动时加载缓存 | Low |
| Pipeline 缺失 | 批量 Redis 操作逐条执行 → 用 `Pipeline`/`multiGet` | Medium |

### E. 并发问题（Concurrency Issue）

> 查找竞态条件或线程问题

| 检查项 | 说明 | 严重度 |
|--------|------|--------|
| 线程不安全 | 多线程操作共享 `HashMap` → `ConcurrentHashMap` | High |
| 无锁/锁失效 | `synchronized` 在分布式环境失效 → 分布式锁 | High |
| 重复提交 | 未做幂等处理 → 数据库唯一键或 Redis 去重 | High |
| 请求竞态 | 快速切换条件导致后发先至 | Medium |
| 事务并发 | 长事务持锁 → 拆分事务、降低隔离级别 | Medium |
| 线程池拒绝 | 无界队列或 `AbortPolicy` → 合理配置队列+拒绝策略 | High |
| 消息重复消费 | 未做幂等 → 数据库唯一键或 Redis 去重 | Medium |
| 死锁 | 多锁顺序不一致 → 统一获取顺序 | High |

---

## 技术栈专项检查点

### SpringBoot / SpringCloud

| 场景 | 检查 |
|------|------|
| Bean 作用域错误 | 无状态 Service 使用 `@Scope("prototype")` 浪费资源 |
| 事务滥用 | `@Transactional` 范围过大、未指定 `rollbackFor`、嵌套事务传播不当 |
| 异步未配置 | `@Async` 未自定义线程池 → 默认线程池队列满时拒绝 |
| 配置硬编码 | 超时/重试/限流参数写死在代码 → 应走配置中心 |
| 服务调用 | Feign/Dubbo 未设置超时 → 级联故障 |
| 未熔断降级 | 核心接口无 `@HystrixCommand` / Sentinel 规则 |
| 循环依赖 | Bean A 依赖 B、B 依赖 A → 重构或 `@Lazy` |
| 健康检查 | 未暴露 `/actuator/health` 或检查逻辑不准 |

### Java 核心

| 场景 | 检查 |
|------|------|
| 线程池 | `Executors.newFixedThreadPool` 无界队列 → OOM，应用 `ThreadPoolExecutor` 显式指定 |
| 连接池 | 数据库/HTTP 连接池未配置 max-size、超时 → 连接耗尽 |
| N+1 查询 | 循环内查数据库 → 应批量查询（`IN` 或 `JOIN`） |
| 大事务 | 事务内包含 RPC/IO → 拆分事务范围 |
| 对象创建 | 循环内 `new` 对象 → 复用或对象池 |
| Stream 滥用 | 简单遍历用 Stream → 可读性差且性能略低 |
| 未关闭资源 | `InputStream`/`Connection` 未 `try-with-resources` |
| 集合初始化 | 未指定容量 → 频繁扩容 → 应预估 `new ArrayList<>(size)` |
| 字符串拼接 | 循环内 `+` → `StringBuilder` |
| 自动装箱 | 大量 `int → Integer` → 使用基本类型或 `IntStream` |

### Redis

| 场景 | 检查 |
|------|------|
| 大 Key | String 超 10KB / Hash 超 5000 字段 → 拆分或压缩 |
| 热 Key | 热点数据无本地缓存 → 多级缓存 |
| 缓存穿透 | 不存在的数据直接打到 DB → 布隆过滤器或空值缓存 |
| 缓存击穿 | 热点 Key 失效瞬间大量请求 → 互斥锁或逻辑过期 |
| 缓存雪崩 | 大量 Key 同时失效 → 加随机过期时间 |
| 无过期时间 | Key 永不过期 → 内存持续增长 |
| Pipeline 缺失 | 批量操作逐条执行 → 用 `Pipeline`/`multiGet` |
| 序列化 | JDK 序列化体积大 → JSON / Protobuf |
| Lua 脚本滥用 | 复杂逻辑全放 Lua → 可读性差，拆分 |
| 连接泄漏 | 未归还连接池 → `Jedis` 必须 `close()` |

### MyBatis

| 场景 | 检查 |
|------|------|
| N+1 查询 | `<collection>` 循环查子表 → 用 `<collection>` + `fetchType="lazy"` 或 `JOIN` 一次性加载 |
| 全表扫描 | 缺少索引条件、`LIKE '%xxx'` 前缀模糊 → 优化 SQL 或 ES |
| `SELECT *` | 查询全部字段 → 只查需要的列 |
| 动态 SQL | `<if>` 过多无索引命中 → 检查执行计划 |
| 批量操作 | 循环 `insert` → 用 `foreach` 批量或 `ExecutorType.BATCH` |
| 分页 | `PageHelper` 查出全量再内存分页 → 物理分页 |
| 一级缓存污染 | 长事务内大量操作导致缓存膨胀 → 适时 `clearCache()` |
| 未用连接池 | 未配置 Druid/HikariCP → 连接创建开销大 |
| 慢 SQL 无监控 | 未开启 `slowSql` 日志 → 无法定位 |
| 参数类型不匹配 | `#{id}` 传入 `String` 但列是 `BIGINT` → 索引失效 |

### MySQL

| 场景 | 检查 |
|------|------|
| 缺少索引 | `WHERE`/`ORDER BY`/`JOIN ON` 字段无索引 |
| 索引失效 | 函数包裹列、隐式类型转换、`OR` 条件 |
| 深分页 | `LIMIT 1000000, 10` → 游标分页 `WHERE id > lastId` |
| 大字段 | `TEXT`/`BLOB` 与普通字段混存 → 拆分副表 |
| 事务隔离 | 默认 `REPEATABLE READ` 下 gap lock → 降为 `READ COMMITTED` |
| 连接数 | `max_connections` 不足 → 连接拒绝 |

### 消息队列（RocketMQ / Kafka）

| 场景 | 检查 |
|------|------|
| 消息丢失 | 异步发送无 ack、消费失败无重试 |
| 消息积压 | 消费者处理慢 → 扩容或降级 |
| 重复消费 | 未做幂等 → 数据库唯一键或 Redis 去重 |
| 事务消息 | 本地事务与消息不一致 → 事务消息或最终一致性 |
| 顺序消息 | 未指定 `MessageQueueSelector` → 乱序 |

### JVM

| 场景 | 检查 |
|------|------|
| 堆内存 | `-Xmx` 过小 → Full GC 频繁 |
| 元空间 | 动态类加载过多 → `Metaspace` OOM |
| 线程泄漏 | 线程池未 shutdown、`ThreadLocal` 未 `remove()` |
| GC 日志 | 未开启 `-Xlog:gc*` → 无法分析停顿 |
| 堆外内存 | NIO/Netty 直接内存未限制 → `MaxDirectMemorySize` |
| Full GC | 大对象晋升、内存泄漏 → Heap Dump 分析 |
