/**
 * Guava UI MCP catalog — runtime data from node_modules/guava-ui types
 * + vendored usage.json (generated from press).
 */
import { getComponentFromTypes, listGvFromTypes } from '../../_shared/npm-types.mjs';
import { GUAVA_UI_NPM, GUAVA_UI_TYPES, REPO_ROOT } from '../../_shared/paths.mjs';
import { loadVendoredUsage } from '../../_shared/vendored-docs.mjs';

export { REPO_ROOT, GUAVA_UI_NPM, GUAVA_UI_TYPES };

export const COMPONENT_META = {
  GvForm: { category: 'form', summary: '配置驱动表单（FormItem[]）', pageLevel: true, elFallback: 'el-form' },
  GvSearchBar: { category: 'form', summary: '查询区按钮栏（放 GvForm 默认插槽）', pageLevel: true },
  GvInput: { category: 'form', summary: '输入框', elFallback: 'el-input' },
  GvInputNumber: { category: 'form', summary: '数字输入', elFallback: 'el-input-number' },
  GvSelect: { category: 'form', summary: '下拉选择', elFallback: 'el-select' },
  GvCascader: { category: 'form', summary: '级联选择', elFallback: 'el-cascader' },
  GvDatePicker: { category: 'form', summary: '日期选择', elFallback: 'el-date-picker' },
  GvTimePicker: { category: 'form', summary: '时间选择', elFallback: 'el-time-picker' },
  GvSwitch: { category: 'form', summary: '开关', elFallback: 'el-switch' },
  GvCheckbox: { category: 'form', summary: '复选框', elFallback: 'el-checkbox' },
  GvCheckboxGroup: { category: 'form', summary: '复选框组', elFallback: 'el-checkbox-group' },
  GvCheckboxButton: { category: 'form', summary: '按钮式复选', elFallback: 'el-checkbox-button' },
  GvRadio: { category: 'form', summary: '单选', elFallback: 'el-radio' },
  GvRadioGroup: { category: 'form', summary: '单选组', elFallback: 'el-radio-group' },
  GvRadioButton: { category: 'form', summary: '按钮式单选', elFallback: 'el-radio-button' },
  GvTable: { category: 'data', summary: '配置驱动表格（TableHeadItem[]）', pageLevel: true, elFallback: 'el-table' },
  GvTableBar: { category: 'data', summary: '表格工具栏', pageLevel: true },
  GvTree: { category: 'data', summary: '树', elFallback: 'el-tree' },
  GvTag: { category: 'data', summary: '标签', elFallback: 'el-tag' },
  GvBadge: { category: 'data', summary: '徽标', elFallback: 'el-badge' },
  GvButton: { category: 'action', summary: '按钮（权限/确认/bizType）', pageLevel: true, elFallback: 'el-button' },
  GvPopconfirm: { category: 'action', summary: '气泡确认', elFallback: 'el-popconfirm' },
  GvIcon: { category: 'action', summary: '图标', elFallback: 'el-icon' },
  GvDialog: { category: 'feedback', summary: '对话框', pageLevel: true, elFallback: 'el-dialog' },
  GvBodyDialog: { category: 'feedback', summary: 'Body 级对话框', pageLevel: true },
  GvDrawer: { category: 'feedback', summary: '抽屉', pageLevel: true, elFallback: 'el-drawer' },
  GvExportDialog: { category: 'feedback', summary: '导出对话框', pageLevel: true },
  GvPopover: { category: 'feedback', summary: '气泡卡片', elFallback: 'el-popover' },
  GvRow: { category: 'layout', summary: '栅格行', elFallback: 'el-row' },
  GvCol: { category: 'layout', summary: '栅格列', elFallback: 'el-col' },
  GvCard: { category: 'layout', summary: '卡片', elFallback: 'el-card' },
  GvDivider: { category: 'layout', summary: '分割线', elFallback: 'el-divider' },
  GvScrollPane: { category: 'layout', summary: '滚动容器' },
  GvTabs: { category: 'nav', summary: '标签页', pageLevel: true, elFallback: 'el-tabs' },
  GvTabPane: { category: 'nav', summary: '标签页面板', elFallback: 'el-tab-pane' },
  GvSteps: { category: 'nav', summary: '步骤条', elFallback: 'el-steps' },
  GvStep: { category: 'nav', summary: '步骤项', elFallback: 'el-step' },
  GvBreadCrumb: { category: 'nav', summary: '面包屑', elFallback: 'el-breadcrumb' },
  GvAnchor: { category: 'nav', summary: '锚点', elFallback: 'el-anchor' },
  GvBacktop: { category: 'nav', summary: '回到顶部', elFallback: 'el-backtop' },
  GvSidebar: { category: 'shell', summary: '侧边栏（布局壳）' },
  GvSidebarLogo: { category: 'shell', summary: '侧边栏 Logo' },
  GvExpandMenu: { category: 'shell', summary: '展开菜单' },
  GvTagsView: { category: 'shell', summary: '多页签视图' },
  GvHamburger: { category: 'shell', summary: '折叠菜单按钮' },
  GvScreenFull: { category: 'shell', summary: '全屏切换' },
  GvLangSelect: { category: 'shell', summary: '语言切换' },
  GvTheme: { category: 'shell', summary: '主题切换' },
};

/** Element Plus / 需求关键词 → Gv 组件 */
export const EL_TO_GV = {
  'el-form': 'GvForm',
  'el-table': 'GvTable',
  'el-button': 'GvButton',
  'el-dialog': 'GvDialog',
  'el-drawer': 'GvDrawer',
  'el-select': 'GvSelect',
  'el-input': 'GvInput',
  'el-input-number': 'GvInputNumber',
  'el-date-picker': 'GvDatePicker',
  'el-time-picker': 'GvTimePicker',
  'el-cascader': 'GvCascader',
  'el-switch': 'GvSwitch',
  'el-checkbox': 'GvCheckbox',
  'el-checkbox-group': 'GvCheckboxGroup',
  'el-radio': 'GvRadio',
  'el-radio-group': 'GvRadioGroup',
  'el-tabs': 'GvTabs',
  'el-tab-pane': 'GvTabPane',
  'el-row': 'GvRow',
  'el-col': 'GvCol',
  'el-card': 'GvCard',
  'el-divider': 'GvDivider',
  'el-tree': 'GvTree',
  'el-tag': 'GvTag',
  'el-badge': 'GvBadge',
  'el-icon': 'GvIcon',
  'el-popover': 'GvPopover',
  'el-popconfirm': 'GvPopconfirm',
  'el-steps': 'GvSteps',
  'el-step': 'GvStep',
  'el-breadcrumb': 'GvBreadCrumb',
  'el-anchor': 'GvAnchor',
  'el-backtop': 'GvBacktop',
  form: 'GvForm',
  table: 'GvTable',
  button: 'GvButton',
  dialog: 'GvDialog',
  drawer: 'GvDrawer',
  search: 'GvSearchBar',
  查询: 'GvSearchBar',
  表单: 'GvForm',
  表格: 'GvTable',
  按钮: 'GvButton',
  弹窗: 'GvDialog',
  抽屉: 'GvDrawer',
};

export const PAGE_RECIPES = {
  'crud-list': {
    title: 'CRUD 列表页',
    components: ['GvForm', 'GvSearchBar', 'GvButton', 'GvTable', 'GvDrawer', 'GvDialog'],
    composition: `
列表页典型组合：
1. GvForm(ref-form + :form-list) 查询区，默认插槽放 GvSearchBar
2. GvButton 新增/导出等工具按钮
3. GvTable(:table-head + :table-data) 列表
4. 编辑容器用 GvDrawer 或 GvDialog，内嵌编辑页（同样 GvForm）

字段配置走 helper.tsx 的 FormItem[] / TableHeadItem[]，禁止在 template 手写 el-input/el-select。
`.trim(),
  },
  'form-edit': {
    title: '编辑表单页 / Drawer 内容',
    components: ['GvForm', 'GvButton', 'GvRow', 'GvCol'],
    composition: `
编辑页典型组合：
1. GvForm(ref-form + :form-list + :is-divider) 编辑字段
2. footer 用 GvButton（save / cancel），confirm / perms 按需
`.trim(),
  },
  'form-only': {
    title: '纯表单配置页',
    components: ['GvForm', 'GvButton', 'GvCard'],
    composition: `
纯表单页：
1. GvCard（可选）包裹
2. GvForm + helper create*EditList
3. GvButton 保存
`.trim(),
  },
  tabs: {
    title: '多 Tab 列表页',
    components: ['GvTabs', 'GvTabPane', 'GvForm', 'GvSearchBar', 'GvTable'],
    composition: `
Tabs 页：
1. GvTabs + GvTabPane
2. 每个 pane 内复用 crud-list：GvForm + GvSearchBar + GvTable
`.trim(),
  },
};

/** Build full Gv* catalog from installed guava-ui types. */
export function buildCatalog() {
  const names = listGvFromTypes();
  return names.map((pkgName) => {
    const typed = getComponentFromTypes(pkgName);
    const meta = COMPONENT_META[pkgName] || { category: 'other', summary: `${pkgName} 组件` };
    const usage = loadVendoredUsage(pkgName);
    return {
      name: pkgName,
      package: 'guava-ui',
      category: meta.category,
      summary: meta.summary,
      pageLevel: !!meta.pageLevel,
      elFallback: meta.elFallback || null,
      source: 'npm-types',
      hasVendoredUsage: !usage.error,
      props: typed.props || [],
      emits: typed.emits || [],
      typesError: typed.error || null,
    };
  });
}

/** @type {ReturnType<typeof buildCatalog> | null} */
let cached = null;

export function getCatalog(force = false) {
  if (!cached || force) cached = buildCatalog();
  return cached;
}

/**
 * @param {string} name
 */
export function getComponentDetail(name) {
  const catalog = getCatalog();
  const key = name.trim();
  const item =
    catalog.find((c) => c.name.toLowerCase() === key.toLowerCase()) ||
    catalog.find((c) => c.name.toLowerCase() === `gv${key}`.toLowerCase());
  if (!item) return null;
  const usage = loadVendoredUsage(item.name);
  return {
    ...item,
    npmRoot: GUAVA_UI_NPM,
    typesPath: GUAVA_UI_TYPES,
    usageNotes: usageNotesFor(item.name),
    docs: {
      tip: usage.tip,
      markdown: usage.usageMarkdown || usage.markdown,
      api: usage.api,
      examples: usage.examples,
      docSlug: usage.docSlug,
      generatedAt: usage.generatedAt,
      error: usage.error,
    },
  };
}

/**
 * @param {string} name
 */
function usageNotesFor(name) {
  const notes = {
    GvForm: [
      '必填 props: refForm, formList(FormItem[])',
      '查询表单默认插槽放 <GvSearchBar />',
      '字段 type: text | textarea | number | dic | date | datetime | checkbox | radio | blank | switch 等',
      'format: [required, validator, maxlength, decimal?]；查询 required 固定 0，validator 必填',
    ],
    GvTable: [
      '必填 props: tableHead(TableHeadItem[])',
      'tableData 通常为 crud.search 返回的 Recordable',
      '列配置走 helper create*TableHeadList，勿手写 el-table-column',
    ],
    GvButton: [
      '常用: type / icon / confirm / perms / bizType(reset|import|export|shrink|expand) / refForm',
      '搜索按钮常配合 refForm 指向 GvForm 的 ref-form',
    ],
    GvSearchBar: ['放在 GvForm 默认插槽内；expand 控制折叠'],
    GvDialog: ['v-model:visible；hasFooter / width / closeOnClickModal'],
    GvDrawer: ['编辑抽屉容器，与列表页 dialogVisible 模式类似'],
  };
  return notes[name] || [];
}

/**
 * @param {string} query
 */
export function searchComponents(query) {
  const q = query.trim().toLowerCase();
  if (!q) return getCatalog();
  const catalog = getCatalog();
  return catalog.filter((c) => {
    const hay = [c.name, c.summary, c.category, c.elFallback || '', ...c.props.map((p) => p.name)].join(' ').toLowerCase();
    return hay.includes(q) || q.split(/\s+/).every((token) => hay.includes(token));
  });
}

/**
 * @param {string} hint
 */
export function resolveComponent(hint) {
  const raw = hint.trim();
  const lower = raw.toLowerCase();
  const mapped = EL_TO_GV[lower] || EL_TO_GV[raw];
  if (mapped) {
    return { input: raw, resolved: mapped, detail: getComponentDetail(mapped) };
  }
  const byName = getComponentDetail(raw);
  if (byName) return { input: raw, resolved: byName.name, detail: byName };
  const hits = searchComponents(raw);
  return {
    input: raw,
    resolved: hits[0]?.name || null,
    candidates: hits.slice(0, 8).map((c) => ({ name: c.name, summary: c.summary, category: c.category })),
    detail: hits[0] ? getComponentDetail(hits[0].name) : null,
  };
}

/**
 * @param {string} recipeId
 */
export function getPageRecipe(recipeId) {
  const key = recipeId.trim().toLowerCase();
  const recipe = PAGE_RECIPES[key];
  if (!recipe) {
    return {
      available: Object.keys(PAGE_RECIPES),
      error: `Unknown recipe: ${recipeId}`,
    };
  }
  return {
    id: key,
    ...recipe,
    componentsDetail: recipe.components.map((n) => {
      const d = getComponentDetail(n);
      return d
        ? { name: d.name, summary: d.summary, props: d.props, emits: d.emits, usageNotes: d.usageNotes }
        : { name: n, missing: true };
    }),
  };
}
