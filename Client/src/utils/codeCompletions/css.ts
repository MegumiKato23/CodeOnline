import { Completion, CompletionContext } from '@codemirror/autocomplete'

// CSS属性补全
const CSS_PROPERTIES: Completion[] = [
  { label: "display", type: "property", apply: "display: $0;", boost: 10, info: "元素显示方式" },
  { label: "position", type: "property", apply: "position: $0;", boost: 10, info: "元素定位方式" },
  { label: "width", type: "property", apply: "width: $0;", boost: 10, info: "元素宽度" },
  { label: "height", type: "property", apply: "height: $0;", boost: 10, info: "元素高度" },
  { label: "margin", type: "property", apply: "margin: $0;", boost: 10, info: "外边距" },
  { label: "padding", type: "property", apply: "padding: $0;", boost: 10, info: "内边距" },
  { label: "color", type: "property", apply: "color: $0;", boost: 10, info: "文本颜色" },
  { label: "background", type: "property", apply: "background: $0;", boost: 10, info: "背景属性" },
  { label: "font-size", type: "property", apply: "font-size: $0;", boost: 9, info: "字体大小" },
  { label: "border", type: "property", apply: "border: $0;", boost: 9, info: "边框属性" },
  { label: "flex", type: "property", apply: "flex: $0;", boost: 9, info: "Flex布局" },
  { label: "grid", type: "property", apply: "grid: $0;", boost: 9, info: "Grid布局" },
  { label: "animation", type: "property", apply: "animation: $0;", boost: 8, info: "动画属性" },
  { label: "transition", type: "property", apply: "transition: $0;", boost: 8, info: "过渡效果" },
  { label: "opacity", type: "property", apply: "opacity: $0;", boost: 8, info: "透明度" },
  { label: "z-index", type: "property", apply: "z-index: $0;", boost: 8, info: "层叠顺序" },
  { label: "box-shadow", type: "property", apply: "box-shadow: $0;", boost: 8, info: "阴影效果" },
  { label: "text-align", type: "property", apply: "text-align: $0;", boost: 8, info: "文本对齐" },
  { label: "cursor", type: "property", apply: "cursor: $0;", boost: 7, info: "鼠标指针样式" },
  { label: "overflow", type: "property", apply: "overflow: $0;", boost: 7, info: "溢出处理" }
]

// CSS属性值补全
const CSS_PROPERTY_VALUES: Record<string, Completion[]> = {
  "display": [
    { label: "block", apply: "block", info: "块级元素" },
    { label: "inline", apply: "inline", info: "行内元素" },
    { label: "inline-block", apply: "inline-block", info: "行内块元素" },
    { label: "flex", apply: "flex", info: "Flex布局" },
    { label: "grid", apply: "grid", info: "Grid布局" },
    { label: "none", apply: "none", info: "不显示元素" }
  ],
  "position": [
    { label: "static", apply: "static", info: "默认定位" },
    { label: "relative", apply: "relative", info: "相对定位" },
    { label: "absolute", apply: "absolute", info: "绝对定位" },
    { label: "fixed", apply: "fixed", info: "固定定位" },
    { label: "sticky", apply: "sticky", info: "粘性定位" }
  ],
  "color": [
    { label: "red", apply: "red", info: "红色" },
    { label: "blue", apply: "blue", info: "蓝色" },
    { label: "green", apply: "green", info: "绿色" },
    { label: "black", apply: "black", info: "黑色" },
    { label: "white", apply: "white", info: "白色" },
    { label: "transparent", apply: "transparent", info: "透明" },
    { label: "currentColor", apply: "currentColor", info: "当前颜色" },
    { label: "#000000", apply: "#000000", info: "十六进制黑色" },
    { label: "#FFFFFF", apply: "#FFFFFF", info: "十六进制白色" },
    { label: "rgb(0, 0, 0)", apply: "rgb(0, 0, 0)", info: "RGB黑色" },
    { label: "rgba(0, 0, 0, 0.5)", apply: "rgba(0, 0, 0, 0.5)", info: "RGBA半透明黑色" }
  ],
  "background": [
    { label: "none", apply: "none", info: "无背景" },
    { label: "transparent", apply: "transparent", info: "透明背景" },
    { label: "url()", apply: "url($0)", info: "背景图片" },
    { label: "linear-gradient()", apply: "linear-gradient($0)", info: "线性渐变" },
    { label: "radial-gradient()", apply: "radial-gradient($0)", info: "径向渐变" }
  ]
}

// CSS选择器补全
const CSS_SELECTORS: Completion[] = [
  { label: ".class", type: "selector", apply: ".$0", boost: 10, info: "类选择器" },
  { label: "#id", type: "selector", apply: "#$0", boost: 10, info: "ID选择器" },
  { label: "element", type: "selector", apply: "$0", boost: 9, info: "元素选择器" },
  { label: "*", type: "selector", apply: "*", boost: 8, info: "通配符选择器" },
  { label: "[attribute]", type: "selector", apply: "[$0]", boost: 8, info: "属性选择器" },
  { label: ":hover", type: "pseudo", apply: ":hover", boost: 9, info: "悬停状态" },
  { label: ":active", type: "pseudo", apply: ":active", boost: 8, info: "激活状态" },
  { label: ":focus", type: "pseudo", apply: ":focus", boost: 8, info: "焦点状态" },
  { label: ":first-child", type: "pseudo", apply: ":first-child", boost: 8, info: "第一个子元素" },
  { label: ":last-child", type: "pseudo", apply: ":last-child", boost: 8, info: "最后一个子元素" },
  { label: ":nth-child()", type: "pseudo", apply: ":nth-child($0)", boost: 8, info: "第n个子元素" },
  { label: "::before", type: "pseudo", apply: "::before", boost: 8, info: "前伪元素" },
  { label: "::after", type: "pseudo", apply: "::after", boost: 8, info: "后伪元素" }
]

export function cssCompletions(context: CompletionContext, projectContext?: any) {
  const line = context.state.doc.lineAt(context.pos)
  const textBefore = line.text.slice(0, context.pos - line.from)

  // 属性名补全
  const propertyNameMatch = /([a-z-]*)$/.exec(textBefore)
  if (propertyNameMatch && propertyNameMatch[1].length > 0) {
    return {
      from: context.pos - propertyNameMatch[1].length,
      options: CSS_PROPERTIES.filter(prop => prop.label.startsWith(propertyNameMatch[1])),
      filter: false
    }
  }

  // 属性值补全
  const propertyMatch = /([a-z-]+)\s*:\s*([^;]*)$/i.exec(textBefore)
  if (propertyMatch) {
    const propertyName = propertyMatch[1]
    const values = CSS_PROPERTY_VALUES[propertyName] || []
    return {
      from: context.pos - (propertyMatch[2]?.length || 0),
      options: values,
      filter: false
    }
  }

  // 选择器补全
  const selectorMatch = /([.#a-z\[]\s*[^\s{]*)$/i.exec(textBefore)
  if (selectorMatch) {
    return {
      from: context.pos - selectorMatch[1].length,
      options: CSS_SELECTORS,
      filter: false
    }
  }

  // 默认返回属性补全 + 动态补全（如 CSS 变量）
  const dynamicOptions: Completion[] = projectContext?.cssVariables || []

  return {
    from: context.pos,
    options: [...CSS_PROPERTIES, ...dynamicOptions],
    filter: false
  }
}