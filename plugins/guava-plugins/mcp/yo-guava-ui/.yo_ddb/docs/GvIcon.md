> GvIcon 图标组件，支持 iconfont / element-plus / svg 三种类型。

# Icon 图标组件

::: tip
图标定义在 `src/views/iconsMng/` 目录下：font-icons.ts / el-icons.ts / svg-icons.ts。
:::

## 导入

```typescript
import { GvIcon } from 'guava-ui';
```

## API

### GvIcon Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `iconType` | 图标类型：`iconfont` / `el` / `svg` | `string` | 自动推断 |
| `iconName` | 图标名称 | `string` | — |
| `className` | CSS 类名 | `string` | `''` |
| `size` | 字体大小（px） | `string` | — |

### iconType 自动推断规则

| iconName 前缀 | 实际 iconType |
| ------------- | ------------- |
| `el-icon-xxx` | `el` |
| `gv-icon-xxx` 或 `gv-xxx` | `iconfont` |
| 其他 | `svg` |

### 图标来源

| iconType | 图标列表文件 | 示例 |
| -------- | ------------ |------|
| `iconfont` | `src/views/iconsMng/font-icons.ts` | `<GvIcon iconType="iconfont" iconName="gv-icon-shouye" />` |
| `el` | `src/views/iconsMng/el-icons.ts` | `<GvIcon iconType="el" iconName="AddLocation" />` |
| `svg` | `src/views/iconsMng/svg-icons.ts` | `<GvIcon iconType="svg" iconName="svg-name" />` |

## 使用示例

### Font Icon（自定义图标字体）

```vue
<GvIcon iconType="iconfont" iconName="gv-icon-shouye" />
<GvIcon iconType="iconfont" iconName="gv-icon-xitongguanli" />
<GvIcon iconType="iconfont" iconName="gv-icon-daiban" />
```

### Element Plus Icon

```vue
<GvIcon iconType="el" iconName="AddLocation" />
<GvIcon iconType="el" iconName="ArrowDown" />
<GvIcon iconType="el" iconName="Calendar" />
```

### SVG Icon

```vue
<GvIcon iconType="svg" iconName="some-svg-name" />
```

### 带 className / size

```vue
<GvIcon iconType="el" iconName="Refresh" className="icon-large" size="24" />
```

## 关键规则

- **优先使用 `src/views/iconsMng/` 中已定义的图标**
- font-icons 使用前缀 `gv-icon-xxx`（如 `gv-icon-shouye`）
- el-icons 使用 PascalCase（如 `AddLocation`）
- svg-icons 使用 kebab-case
