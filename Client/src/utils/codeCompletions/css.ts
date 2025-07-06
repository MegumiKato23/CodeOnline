import { Completion, CompletionContext } from '@codemirror/autocomplete'

// CSS属性补全
const CSS_PROPERTIES: Completion[] = [
  { label: "display", type: "property", apply: "display:", boost: 10 },
  { label: "position", type: "property", apply: "position:", boost: 10 },
  { label: "width", type: "property", apply: "width:", boost: 10 },
  { label: "height", type: "property", apply: "height:", boost: 10 },
  { label: "margin", type: "property", apply: "margin:", boost: 10 },
  { label: "padding", type: "property", apply: "padding:", boost: 10 },
  { label: "color", type: "property", apply: "color:", boost: 10 },
  { label: "background", type: "property", apply: "background:", boost: 10 },
  { label: "font-size", type: "property", apply: "font-size:", boost: 9 },
  { label: "border", type: "property", apply: "border:", boost: 9 },
  { label: "flex", type: "property", apply: "flex:", boost: 9 },
  { label: "grid", type: "property", apply: "grid:", boost: 9 },
  { label: "animation", type: "property", apply: "animation:", boost: 8 },
  { label: "transition", type: "property", apply: "transition:", boost: 8 },
  { label: "opacity", type: "property", apply: "opacity:", boost: 8 },
  { label: "z-index", type: "property", apply: "z-index:", boost: 8 },
  { label: "box-shadow", type: "property", apply: "box-shadow:", boost: 8 },
  { label: "text-align", type: "property", apply: "text-align:", boost: 8 },
  { label: "cursor", type: "property", apply: "cursor:", boost: 7 },
  { label: "overflow", type: "property", apply: "overflow:", boost: 7 }
]

// CSS属性值补全
const CSS_PROPERTY_VALUES: Record<string, Completion[]> = {
  "display": [
    { label: "block", apply: "block" },
    { label: "inline", apply: "inline" },
    { label: "inline-block", apply: "inline-block" },
    { label: "flex", apply: "flex" },
    { label: "grid", apply: "grid" },
    { label: "none", apply: "none" }
  ],
  "position": [
    { label: "static", apply: "static" },
    { label: "relative", apply: "relative" },
    { label: "absolute", apply: "absolute" },
    { label: "fixed", apply: "fixed" },
    { label: "sticky", apply: "sticky" }
  ],
  "color": [
    { label: "red", apply: "red" },
    { label: "blue", apply: "blue" },
    { label: "green", apply: "green" },
    { label: "black", apply: "black" },
    { label: "white", apply: "white" },
    { label: "transparent", apply: "transparent" },
    { label: "currentColor", apply: "currentColor" },
    { label: "#000000", apply: "#000000" },
    { label: "#FFFFFF", apply: "#FFFFFF" },
    { label: "rgb(0, 0, 0)", apply: "rgb(0, 0, 0)" },
    { label: "rgba(0, 0, 0, 0.5)", apply: "rgba(0, 0, 0, 0.5)" }
  ],
  "background": [
    { label: "none", apply: "none" },
    { label: "transparent", apply: "transparent" },
    { label: "url()", apply: "url()" },
    { label: "linear-gradient()", apply: "linear-gradient()" },
    { label: "radial-gradient()", apply: "radial-gradient()" }
  ]
}

// CSS选择器补全
const CSS_SELECTORS: Completion[] = [
  { label: ".class", type: "selector", apply: ".", boost: 10 },
  { label: "#id", type: "selector", apply: "#", boost: 10 },
  { label: "element", type: "selector", apply: "", boost: 9 },
  { label: "*", type: "selector", apply: "*", boost: 8 },
  { label: "[attribute]", type: "selector", apply: "[]", boost: 8 },
  { label: ":hover", type: "pseudo", apply: ":hover", boost: 9 },
  { label: ":active", type: "pseudo", apply: ":active", boost: 8 },
  { label: ":focus", type: "pseudo", apply: ":focus", boost: 8 },
  { label: ":first-child", type: "pseudo", apply: ":first-child", boost: 8 },
  { label: ":last-child", type: "pseudo", apply: ":last-child", boost: 8 },
  { label: ":nth-child()", type: "pseudo", apply: ":nth-child()", boost: 8 },
  { label: "::before", type: "pseudo", apply: "::before", boost: 8 },
  { label: "::after", type: "pseudo", apply: "::after", boost: 8 }
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