import { Completion, CompletionContext } from '@codemirror/autocomplete'
const CSS_SELECTORS: Completion[] = [
  { label: ".class", type: "selector", apply: ".$0" },
  { label: "#id", type: "selector", apply: "#$0" },
  { label: "element", type: "selector", apply: "$0" },
  { label: "[attribute]", type: "selector", apply: "[$0]" }
]
// Ԥ���ɵ�CSS����
const CSS_DATA = {
  properties: [
   { label: "display", type: "property", apply: "display: $0", boost: 10, info: "CSS display property" },
    { label: "position", type: "property", apply: "position: $0", boost: 10, info: "CSS position property" },
    { label: "flex", type: "property", apply: "flex: $0", boost: 10, info: "CSS flex property" },
    { label: "grid", type: "property", apply: "grid: $0", boost: 10, info: "CSS grid property" },
    { label: "float", type: "property", apply: "float: $0", boost: 9, info: "CSS float property" },
    
    // Box model
    { label: "width", type: "property", apply: "width: $0", boost: 10, info: "CSS width property" },
    { label: "height", type: "property", apply: "height: $0", boost: 10, info: "CSS height property" },
    { label: "margin", type: "property", apply: "margin: $0", boost: 10, info: "CSS margin property" },
    { label: "padding", type: "property", apply: "padding: $0", boost: 10, info: "CSS padding property" },
    { label: "border", type: "property", apply: "border: $0", boost: 10, info: "CSS border property" },
    
    // Text styling
    { label: "color", type: "property", apply: "color: $0", boost: 10, info: "CSS color property" },
    { label: "font-size", type: "property", apply: "font-size: $0", boost: 10, info: "CSS font size" },
    { label: "font-family", type: "property", apply: "font-family: $0", boost: 9, info: "CSS font family" },
    { label: "text-align", type: "property", apply: "text-align: $0", boost: 9, info: "CSS text alignment" },
    { label: "line-height", type: "property", apply: "line-height: $0", boost: 9, info: "CSS line height" },
    
    // Backgrounds and gradients
    { label: "background", type: "property", apply: "background: $0", boost: 10, info: "CSS background shorthand" },
    { label: "background-color", type: "property", apply: "background-color: $0", boost: 9, info: "CSS background color" },
    { label: "background-image", type: "property", apply: "background-image: $0", boost: 9, info: "CSS background image" },
    { label: "linear-gradient", type: "function", apply: "linear-gradient($0)", boost: 9, info: "CSS linear gradient" },
    { label: "radial-gradient", type: "function", apply: "radial-gradient($0)", boost: 9, info: "CSS radial gradient" },
    { label: "conic-gradient", type: "function", apply: "conic-gradient($0)", boost: 9, info: "CSS conic gradient" },
    
    // Transitions and animations
    { label: "transition", type: "property", apply: "transition: $0", boost: 9, info: "CSS transition property" },
    { label: "animation", type: "property", apply: "animation: $0", boost: 9, info: "CSS animation property" },
    { label: "transform", type: "property", apply: "transform: $0", boost: 9, info: "CSS transform property" },
    
    // CSS variables
    { label: "--*", type: "variable", apply: "--$0", boost: 8, info: "CSS custom property" },
    { label: "var", type: "function", apply: "var(--$0)", boost: 8, info: "CSS variable usage" },
    
    // Preprocessor support
    { label: "@mixin", type: "directive", apply: "@mixin $0($1) {\n\t$2\n}", boost: 8, info: "SCSS mixin" },
    { label: "@include", type: "directive", apply: "@include $0($1)", boost: 8, info: "SCSS include" },
    { label: "@extend", type: "directive", apply: "@extend $0", boost: 8, info: "SCSS extend" },
    { label: "@function", type: "directive", apply: "@function $0($1) {\n\t@return $2\n}", boost: 8, info: "SCSS function" },
    { label: "@if", type: "directive", apply: "@if $0 {\n\t$1\n}", boost: 8, info: "SCSS conditional" },
    { label: "@for", type: "directive", apply: "@for $0 from $1 through $2 {\n\t$3\n}", boost: 8, info: "SCSS loop" },
    { label: "@each", type: "directive", apply: "@each $0 in $1 {\n\t$2\n}", boost: 8, info: "SCSS iteration" },
    { label: "@while", type: "directive", apply: "@while $0 {\n\t$1\n}", boost: 8, info: "SCSS while loop" },
    { label: "@use", type: "directive", apply: "@use '$0'", boost: 8, info: "SCSS module import" },
    { label: "@forward", type: "directive", apply: "@forward '$0'", boost: 8, info: "SCSS module forwarding" },
  ],
  values: [
    { label: "flex", type: "value", apply: "flex", boost: 10 },
    { label: "grid", type: "value", apply: "grid", boost: 10 },
    { label: "block", type: "value", apply: "block", boost: 10 },
    { label: "inline-block", type: "value", apply: "inline-block", boost: 9 },
    { label: "none", type: "value", apply: "none", boost: 9 },
    
    // ��λֵ
    { label: "absolute", type: "value", apply: "absolute", boost: 10 },
    { label: "relative", type: "value", apply: "relative", boost: 10 },
    { label: "fixed", type: "value", apply: "fixed", boost: 9 },
    { label: "sticky", type: "value", apply: "sticky", boost: 9 },
    
    // �ı�����
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
  const line = context.state.doc.lineAt(context.pos)
  const textBefore = line.text.slice(0, context.pos - line.from)
  const isScss = context.state.doc.toString().includes('@mixin') || 
                context.state.doc.toString().includes('@include')
  
  // ���1����ѡ����λ��
  const selectorMatch = /([.#a-zA-Z][^{]*)$/.exec(textBefore)
  if (selectorMatch && !textBefore.includes('{')) {
    return {
      from: context.pos - selectorMatch[1].length,
      options: CSS_SELECTORS,
      filter: false
    }
  }

  // ���2����������λ��
  const propMatch = /([a-z-]+)\s*:\s*[^;]*$/i.exec(textBefore)
  if (!propMatch) {
    return {
      from: context.pos,
      options: [
        ...CSS_DATA.properties,
        ...(isScss ? CSS_DATA.properties.filter(p => p.type === 'directive') : [])
      ],
      filter: false
    }
  }

  // ���3��������ֵλ��
  const isAfterColon = /:\s*[^;]*$/.test(textBefore)
  if (isAfterColon) {
    const currentProp = propMatch[1].toLowerCase()
    return {
      from: context.pos - (textBefore.split(':').pop()?.trim().length || 0),
      options: [
        ...CSS_DATA.values.filter(v => 
          v.apply.includes(currentProp) || 
          currentProp.includes(v.apply)
        ),
        ...CSS_DATA.units,
        ...(currentProp === 'var' ? CSS_DATA.properties.filter(p => p.label.startsWith('--')) : [])
      ],
      filter: false
    }
  }

  return null
}

// 4. ����������ȷ����ȷ�պϣ�
function getCssValuesForProp(prop: string): Completion[] {
  return CSS_DATA.values.filter(v => 
    v.apply.includes(prop) || 
    prop.includes(v.apply)
  )
}