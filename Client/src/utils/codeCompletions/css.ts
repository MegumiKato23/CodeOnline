import { Completion, CompletionContext } from '@codemirror/autocomplete'

// 预生成的CSS数据
const CSS_DATA = {
  properties: [
   { label: "display", type: "property", apply: "display: $0", boost: 10 },
    { label: "position", type: "property", apply: "position: $0", boost: 10 },
    { label: "flex", type: "property", apply: "flex: $0", boost: 10 },
    { label: "grid", type: "property", apply: "grid: $0", boost: 10 },
    { label: "float", type: "property", apply: "float: $0", boost: 9 },
    
    // 盒模型
    { label: "width", type: "property", apply: "width: $0", boost: 10 },
    { label: "height", type: "property", apply: "height: $0", boost: 10 },
    { label: "margin", type: "property", apply: "margin: $0", boost: 10 },
    { label: "padding", type: "property", apply: "padding: $0", boost: 10 },
    { label: "border", type: "property", apply: "border: $0", boost: 10 },
    
    // 文本样式
    { label: "color", type: "property", apply: "color: $0", boost: 10 },
    { label: "font-size", type: "property", apply: "font-size: $0", boost: 10 },
    { label: "font-family", type: "property", apply: "font-family: $0", boost: 9 },
    { label: "text-align", type: "property", apply: "text-align: $0", boost: 9 },
    { label: "line-height", type: "property", apply: "line-height: $0", boost: 9 },
    
    // 背景和渐变
    { label: "background", type: "property", apply: "background: $0", boost: 10 },
    { label: "background-color", type: "property", apply: "background-color: $0", boost: 9 },
    { label: "background-image", type: "property", apply: "background-image: $0", boost: 9 },
    { label: "linear-gradient", type: "function", apply: "linear-gradient($0)", boost: 9 },
    
    // 动画和过渡
    { label: "transition", type: "property", apply: "transition: $0", boost: 9 },
    { label: "animation", type: "property", apply: "animation: $0", boost: 9 },
    { label: "transform", type: "property", apply: "transform: $0", boost: 9 }
  ],
  values: [
    { label: "flex", type: "value", apply: "flex", boost: 10 },
    { label: "grid", type: "value", apply: "grid", boost: 10 },
    { label: "block", type: "value", apply: "block", boost: 10 },
    { label: "inline-block", type: "value", apply: "inline-block", boost: 9 },
    { label: "none", type: "value", apply: "none", boost: 9 },
    
    // 定位值
    { label: "absolute", type: "value", apply: "absolute", boost: 10 },
    { label: "relative", type: "value", apply: "relative", boost: 10 },
    { label: "fixed", type: "value", apply: "fixed", boost: 9 },
    { label: "sticky", type: "value", apply: "sticky", boost: 9 },
    
    // 文本对齐
    { label: "center", type: "value", apply: "center", boost: 10 },
    { label: "left", type: "value", apply: "left", boost: 9 },
    { label: "right", type: "value", apply: "right", boost: 9 },
    { label: "justify", type: "value", apply: "justify", boost: 9 }
  ],
  units: [
    { label: "px", type: "unit", apply: "px", boost: 10 },
    { label: "em", type: "unit", apply: "em", boost: 10 },
    { label: "rem", type: "unit", apply: "rem", boost: 10 },
    { label: "%", type: "unit", apply: "%", boost: 10 },
    { label: "vh", type: "unit", apply: "vh", boost: 9 },
    { label: "vw", type: "unit", apply: "vw", boost: 9 },
    { label: "vmin", type: "unit", apply: "vmin", boost: 8 },
    { label: "vmax", type: "unit", apply: "vmax", boost: 8 }
  ]
}

export const cssCompletions = (context: CompletionContext) => {
  const { state, pos } = context
  const line = state.doc.lineAt(pos)
  const textBefore = line.text.slice(0, pos - line.from)

  // 上下文分析
  const isAfterColon = /:[^:]*$/.test(textBefore)
  const isAfterAtRule = /@\w*\s*[^{]*$/.test(textBefore)

  if (isAfterAtRule) {
    return {
      from: pos,
      options: [
        { label: "media", type: "at-rule", apply: "@media $0" },
        { label: "keyframes", type: "at-rule", apply: "@keyframes $0" }
      ]
    }
  }

  return {
    from: pos,
    options: isAfterColon 
      ? [...CSS_DATA.values, ...CSS_DATA.units]
      : CSS_DATA.properties
  }
}