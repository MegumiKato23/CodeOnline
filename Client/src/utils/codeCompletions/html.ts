import { Completion, CompletionContext } from '@codemirror/autocomplete'

// �0�0�1�7�1�7�1�7�0�2�1�7HTML�1�7�1�7�0�5�1�7�1�7�1�7�1�7
const HTML_TAGS: Completion[] = [
  // 结构标签
  { label: "div", type: "tag", apply: "div>$0</div>", boost: 10, info: "Generic container element" },
  { label: "span", type: "tag", apply: "span>$0</span>", boost: 9 },
  { label: "section", type: "tag", apply: "section>$0</section>", boost: 9 },
  { label: "article", type: "tag", apply: "article>$0</article>", boost: 9 },
  { label: "header", type: "tag", apply: "header>$0</header>", boost: 9 },
  { label: "footer", type: "tag", apply: "footer>$0</footer>", boost: 9 },
  { label: "main", type: "tag", apply: "main>$0</main>", boost: 9 },
  { label: "nav", type: "tag", apply: "nav>$0</nav>", boost: 9 },
  { label: "aside", type: "tag", apply: "aside>$0</aside>", boost: 8 },
  { label: "template", type: "tag", apply: "template>$0</template>", boost: 8 },
  
  // 文本标签
  { label: "h1", type: "tag", apply: "h1>$0</h1>", boost: 9 },
  { label: "h2", type: "tag", apply: "h2>$0</h2>", boost: 9 },
  { label: "h3", type: "tag", apply: "h3>$0</h3>", boost: 9 },
  { label: "h4", type: "tag", apply: "h4>$0</h4>", boost: 8 },
  { label: "h5", type: "tag", apply: "h5>$0</h5>", boost: 8 },
  { label: "h6", type: "tag", apply: "h6>$0</h6>", boost: 8 },
  { label: "p", type: "tag", apply: "p>$0</p>", boost: 9 },
  { label: "a", type: "tag", apply: "a href=\"$1\">$0</a>", boost: 9 },
  { label: "strong", type: "tag", apply: "strong>$0</strong>", boost: 8 },
  { label: "em", type: "tag", apply: "em>$0</em>", boost: 8 },
  { label: "code", type: "tag", apply: "code>$0</code>", boost: 8 },
  { label: "pre", type: "tag", apply: "pre>$0</pre>", boost: 8 },
  { label: "blockquote", type: "tag", apply: "blockquote>$0</blockquote>", boost: 7 },
  { label: "q", type: "tag", apply: "q>$0</q>", boost: 7 },
  
  // 表单标签
  { label: "form", type: "tag", apply: "form action=\"$1\" method=\"$2\">\n\t$0\n</form>", boost: 9 },
  { label: "input", type: "tag", apply: "input type=\"$1\" name=\"$0\">", boost: 9 },
  { label: "button", type: "tag", apply: "button type=\"$1\">$0</button>", boost: 9 },
  { label: "select", type: "tag", apply: "select name=\"$1\">\n\t<option value=\"$2\">$0</option>\n</select>", boost: 8 },
  { label: "textarea", type: "tag", apply: "textarea name=\"$1\">$0</textarea>", boost: 8 },
  { label: "label", type: "tag", apply: "label for=\"$1\">$0</label>", boost: 8 },
  { label: "fieldset", type: "tag", apply: "fieldset>\n\t<legend>$1</legend>\n\t$0\n</fieldset>", boost: 7 },
  { label: "legend", type: "tag", apply: "legend>$0</legend>", boost: 7 },
  { label: "datalist", type: "tag", apply: "datalist id=\"$1\">\n\t<option value=\"$0\">\n</datalist>", boost: 7 },
  { label: "output", type: "tag", apply: "output name=\"$1\">$0</output>", boost: 7 },
  { label: "progress", type: "tag", apply: "progress value=\"$1\" max=\"$2\">$0</progress>", boost: 7 },
  { label: "meter", type: "tag", apply: "meter value=\"$1\" min=\"$2\" max=\"$3\">$0</meter>", boost: 6 },
  
  // 多媒体标签
  { label: "img", type: "tag", apply: "img src=\"$1\" alt=\"$0\">", boost: 9 },
  { label: "video", type: "tag", apply: "video controls>\n\t<source src=\"$1\" type=\"video/mp4\">\n\t$0\n</video>", boost: 8 },
  { label: "audio", type: "tag", apply: "audio controls>\n\t<source src=\"$1\" type=\"audio/mpeg\">\n\t$0\n</audio>", boost: 8 },
  { label: "picture", type: "tag", apply: "picture>\n\t<source srcset=\"$1\" media=\"$2\">\n\t<img src=\"$3\" alt=\"$0\">\n</picture>", boost: 7 },
  { label: "source", type: "tag", apply: "source src=\"$1\" type=\"$0\">", boost: 7 },
  { label: "track", type: "tag", apply: "track kind=\"$1\" src=\"$2\" srclang=\"$3\" label=\"$0\">", boost: 6 },
  { label: "map", type: "tag", apply: "map name=\"$1\">\n\t<area shape=\"$2\" coords=\"$3\" href=\"$4\" alt=\"$0\">\n</map>", boost: 6 },
  { label: "area", type: "tag", apply: "area shape=\"$1\" coords=\"$2\" href=\"$3\" alt=\"$0\">", boost: 6 },
  
  // 列表和表格
  { label: "ul", type: "tag", apply: "ul>\n\t<li>$0</li>\n</ul>", boost: 9 },
  { label: "ol", type: "tag", apply: "ol>\n\t<li>$0</li>\n</ol>", boost: 9 },
  { label: "li", type: "tag", apply: "li>$0</li>", boost: 8 },
  { label: "dl", type: "tag", apply: "dl>\n\t<dt>$1</dt>\n\t<dd>$0</dd>\n</dl>", boost: 7 },
  { label: "dt", type: "tag", apply: "dt>$0</dt>", boost: 7 },
  { label: "dd", type: "tag", apply: "dd>$0</dd>", boost: 7 },
  { label: "table", type: "tag", apply: "table>\n\t<tr>\n\t\t<th>$0</th>\n\t</tr>\n</table>", boost: 8 },
  { label: "tr", type: "tag", apply: "tr>\n\t<td>$0</td>\n</tr>", boost: 7 },
  { label: "th", type: "tag", apply: "th>$0</th>", boost: 7 },
  { label: "td", type: "tag", apply: "td>$0</td>", boost: 7 },
  { label: "thead", type: "tag", apply: "thead>\n\t<tr>\n\t\t<th>$0</th>\n\t</tr>\n</thead>", boost: 7 },
  { label: "tbody", type: "tag", apply: "tbody>\n\t<tr>\n\t\t<td>$0</td>\n\t</tr>\n</tbody>", boost: 7 },
  { label: "tfoot", type: "tag", apply: "tfoot>\n\t<tr>\n\t\t<td>$0</td>\n\t</tr>\n</tfoot>", boost: 7 },
  { label: "caption", type: "tag", apply: "caption>$0</caption>", boost: 6 },
  { label: "colgroup", type: "tag", apply: "colgroup>\n\t<col span=\"$1\">$0\n</colgroup>", boost: 6 },
  { label: "col", type: "tag", apply: "col span=\"$1\">$0", boost: 6 },
  
  // 元信息
  { label: "meta", type: "tag", apply: "meta name=\"$1\" content=\"$0\">", boost: 7 },
  { label: "link", type: "tag", apply: "link rel=\"$1\" href=\"$0\">", boost: 7 },
  { label: "script", type: "tag", apply: "script src=\"$1\">$0</script>", boost: 8 },
]
// HTML属性值补全
const HTML_ATTRIBUTES: Completion[] = [
  // 全局属性
  { label: "class", type: "property", apply: "class=\"$0\"", boost: 10, info: "元素类名" },
  { label: "id", type: "property", apply: "id=\"$0\"", boost: 10, info: "元素唯一标识" },
  { label: "style", type: "property", apply: "style=\"$0\"", boost: 9, info: "内联样式" },
  { label: "title", type: "property", apply: "title=\"$0\"", boost: 8, info: "提示文本" },
  { label: "data-*", type: "property", apply: "data-$0=\"$1\"", boost: 7, info: "自定义数据属性" },
  { label: "aria-*", type: "property", apply: "aria-$0=\"$1\"", boost: 7, info: "无障碍属性" },
  { label: "hidden", type: "property", apply: "hidden", boost: 8, info: "隐藏元素" },
  { label: "lang", type: "property", apply: "lang=\"$0\"", boost: 7, info: "语言代码" },
  { label: "dir", type: "property", apply: "dir=\"$0\"", boost: 7, info: "文本方向(ltr/rtl)" },
  { label: "contenteditable", type: "property", apply: "contenteditable=\"$0\"", boost: 7, info: "可编辑内容" },
  { label: "draggable", type: "property", apply: "draggable=\"$0\"", boost: 7, info: "可拖动" },
  { label: "spellcheck", type: "property", apply: "spellcheck=\"$0\"", boost: 7, info: "拼写检查" },
  { label: "tabindex", type: "property", apply: "tabindex=\"$0\"", boost: 7, info: "Tab键顺序" },
  
  // 表单相关属性
  { label: "name", type: "property", apply: "name=\"$0\"", boost: 9, info: "表单控件名称" },
  { label: "value", type: "property", apply: "value=\"$0\"", boost: 9, info: "表单控件值" },
  { label: "placeholder", type: "property", apply: "placeholder=\"$0\"", boost: 8, info: "占位文本" },
  { label: "required", type: "property", apply: "required", boost: 8, info: "必填字段" },
  { label: "disabled", type: "property", apply: "disabled", boost: 8, info: "禁用状态" },
  { label: "readonly", type: "property", apply: "readonly", boost: 7, info: "只读状态" },
  { label: "autofocus", type: "property", apply: "autofocus", boost: 7, info: "自动聚焦" },
  { label: "autocomplete", type: "property", apply: "autocomplete=\"$0\"", boost: 7, info: "自动完成" },
  { label: "pattern", type: "property", apply: "pattern=\"$0\"", boost: 7, info: "正则验证模式" },
  { label: "min", type: "property", apply: "min=\"$0\"", boost: 7, info: "最小值" },
  { label: "max", type: "property", apply: "max=\"$0\"", boost: 7, info: "最大值" },
  { label: "step", type: "property", apply: "step=\"$0\"", boost: 7, info: "步长" },
  { label: "multiple", type: "property", apply: "multiple", boost: 7, info: "多选" },
  { label: "checked", type: "property", apply: "checked", boost: 8, info: "选中状态" },
  { label: "selected", type: "property", apply: "selected", boost: 8, info: "选择状态" },
  { label: "for", type: "property", apply: "for=\"$0\"", boost: 8, info: "关联元素ID" },
  
  // 链接和媒体属性
  { label: "href", type: "property", apply: "href=\"$0\"", boost: 10, info: "链接地址" },
  { label: "src", type: "property", apply: "src=\"$0\"", boost: 10, info: "资源地址" },
  { label: "alt", type: "property", apply: "alt=\"$0\"", boost: 9, info: "替代文本" },
  { label: "target", type: "property", apply: "target=\"$0\"", boost: 8, info: "打开方式(_blank/_self)" },
  { label: "rel", type: "property", apply: "rel=\"$0\"", boost: 7, info: "链接关系" },
  { label: "download", type: "property", apply: "download=\"$0\"", boost: 7, info: "下载属性" },
  { label: "media", type: "property", apply: "media=\"$0\"", boost: 7, info: "媒体查询" },
  { label: "type", type: "property", apply: "type=\"$0\"", boost: 8, info: "MIME类型" },
  { label: "poster", type: "property", apply: "poster=\"$0\"", boost: 7, info: "视频封面" },
  { label: "controls", type: "property", apply: "controls", boost: 8, info: "显示控件" },
  { label: "autoplay", type: "property", apply: "autoplay", boost: 7, info: "自动播放" },
  { label: "loop", type: "property", apply: "loop", boost: 7, info: "循环播放" },
  { label: "muted", type: "property", apply: "muted", boost: 7, info: "静音" },
  { label: "preload", type: "property", apply: "preload=\"$0\"", boost: 7, info: "预加载" },
  
  // 事件处理属性
  { label: "onclick", type: "event", apply: "onclick=\"$0\"", boost: 7, info: "点击事件" },
  { label: "onchange", type: "event", apply: "onchange=\"$0\"", boost: 7, info: "值改变事件" },
  { label: "oninput", type: "event", apply: "oninput=\"$0\"", boost: 7, info: "输入事件" },
  { label: "onsubmit", type: "event", apply: "onsubmit=\"$0\"", boost: 7, info: "表单提交事件" },
  { label: "onfocus", type: "event", apply: "onfocus=\"$0\"", boost: 7, info: "获取焦点事件" },
  { label: "onblur", type: "event", apply: "onblur=\"$0\"", boost: 7, info: "失去焦点事件" },
  { label: "onkeydown", type: "event", apply: "onkeydown=\"$0\"", boost: 7, info: "按键按下事件" },
  { label: "onkeyup", type: "event", apply: "onkeyup=\"$0\"", boost: 7, info: "按键释放事件" },
  { label: "onmouseover", type: "event", apply: "onmouseover=\"$0\"", boost: 7, info: "鼠标移入事件" },
  { label: "onmouseout", type: "event", apply: "onmouseout=\"$0\"", boost: 7, info: "鼠标移出事件" },
  { label: "onload", type: "event", apply: "onload=\"$0\"", boost: 7, info: "加载完成事件" },
  { label: "onerror", type: "event", apply: "onerror=\"$0\"", boost: 7, info: "错误事件" },
]
const HTML_ATTRIBUTE_VALUES: Record<string, Completion[]> = {
  // input类型
  "type": [
    { label: "text", apply: "text", info: "文本输入" },
    { label: "password", apply: "password", info: "密码输入" },
    { label: "email", apply: "email", info: "邮箱输入" },
    { label: "number", apply: "number", info: "数字输入" },
    { label: "tel", apply: "tel", info: "电话输入" },
    { label: "url", apply: "url", info: "URL输入" },
    { label: "search", apply: "search", info: "搜索框" },
    { label: "date", apply: "date", info: "日期选择" },
    { label: "time", apply: "time", info: "时间选择" },
    { label: "datetime-local", apply: "datetime-local", info: "本地日期时间" },
    { label: "month", apply: "month", info: "月份选择" },
    { label: "week", apply: "week", info: "周选择" },
    { label: "color", apply: "color", info: "颜色选择" },
    { label: "checkbox", apply: "checkbox", info: "复选框" },
    { label: "radio", apply: "radio", info: "单选按钮" },
    { label: "file", apply: "file", info: "文件上传" },
    { label: "hidden", apply: "hidden", info: "隐藏字段" },
    { label: "submit", apply: "submit", info: "提交按钮" },
    { label: "reset", apply: "reset", info: "重置按钮" },
    { label: "button", apply: "button", info: "普通按钮" },
    { label: "image", apply: "image", info: "图片按钮" }
  ],
  
  // 链接目标
  "target": [
    { label: "_blank", apply: "_blank", info: "新窗口打开" },
    { label: "_self", apply: "_self", info: "当前窗口打开" },
    { label: "_parent", apply: "_parent", info: "父框架打开" },
    { label: "_top", apply: "_top", info: "顶层窗口打开" }
  ],
  
  // 表单方法
  "method": [
    { label: "get", apply: "get", info: "GET请求" },
    { label: "post", apply: "post", info: "POST请求" },
    { label: "dialog", apply: "dialog", info: "对话框表单" }
  ],
  
  // 自动完成
  "autocomplete": [
    { label: "on", apply: "on", info: "启用自动完成" },
    { label: "off", apply: "off", info: "禁用自动完成" },
    { label: "name", apply: "name", info: "姓名" },
    { label: "email", apply: "email", info: "邮箱" },
    { label: "username", apply: "username", info: "用户名" },
    { label: "current-password", apply: "current-password", info: "当前密码" },
    { label: "new-password", apply: "new-password", info: "新密码" }
  ],
  
  // 内容可编辑
  "contenteditable": [
    { label: "true", apply: "true", info: "可编辑" },
    { label: "false", apply: "false", info: "不可编辑" }
  ],
  
  // 拖拽
  "draggable": [
    { label: "true", apply: "true", info: "可拖动" },
    { label: "false", apply: "false", info: "不可拖动" }
  ],
  
  // 拼写检查
  "spellcheck": [
    { label: "true", apply: "true", info: "启用拼写检查" },
    { label: "false", apply: "false", info: "禁用拼写检查" }
  ],
  
  // 文本方向
  "dir": [
    { label: "ltr", apply: "ltr", info: "从左到右" },
    { label: "rtl", apply: "rtl", info: "从右到左" },
    { label: "auto", apply: "auto", info: "自动检测" }
  ],
  
  // 预加载
  "preload": [
    { label: "none", apply: "none", info: "不预加载" },
    { label: "metadata", apply: "metadata", info: "仅元数据" },
    { label: "auto", apply: "auto", info: "自动预加载" }
  ],
  
  // 媒体查询
  "media": [
    { label: "screen", apply: "screen", info: "屏幕设备" },
    { label: "print", apply: "print", info: "打印设备" },
    { label: "all", apply: "all", info: "所有设备" },
    { label: "(max-width: 600px)", apply: "(max-width: 600px)", info: "最大宽度600px" }
  ]
};
// �0�3�1�7�ۄ1�7�1�7�1�6�1�7�1�7�1�7
function getAttributeValueCompletions(attr: string, pos: number) {
  // �0�6�1�7�1�7�1�7�1�7�1�7�1�7�0�5�1�7�1�7�0�5�1�7�1�8�1�7
  return { from: pos, options: [] }
}

function getSnippetCompletions(): Completion[] {
  return [
    { label: "html5", type: "snippet", apply: "<!DOCTYPE html>\n<html>\n<head>\n\t<title>$1</title>\n</head>\n<body>\n\t$0\n</body>\n</html>" }
  ]
}
const JSX_ATTRIBUTES: Completion[] = [
  { label: "className", apply: "className=\"$0\"", boost: 11, info: "React class name attribute" },
  { label: "onClick", apply: "onClick={$0}", boost: 10, info: "React click handler" },
  { label: "key", apply: "key=\"$0\"", boost: 9, info: "React list key" },
  { label: "style", apply: "style={{ $0 }}", boost: 9, info: "React inline style" },
  { label: "ref", apply: "ref={$0}", boost: 9, info: "React element reference" },
  { label: "children", apply: "children={$0}", boost: 8, info: "React children prop" },
  { label: "defaultValue", apply: "defaultValue=\"$0\"", boost: 8, info: "React uncontrolled input" },
  { label: "value", apply: "value={$0}", boost: 8, info: "React controlled input" },
  { label: "onChange", apply: "onChange={$0}", boost: 9, info: "React change handler" },
  { label: "disabled", apply: "disabled={$0}", boost: 8, info: "React disabled state" },
  { label: "onKeyDown", apply: "onKeyDown={$0}", boost: 8, info: "React key down handler" },
  { label: "onKeyUp", apply: "onKeyUp={$0}", boost: 8, info: "React key up handler" },
  { label: "onMouseEnter", apply: "onMouseEnter={$0}", boost: 8, info: "React mouse enter handler" },
  { label: "onMouseLeave", apply: "onMouseLeave={$0}", boost: 8, info: "React mouse leave handler" },
  { label: "onFocus", apply: "onFocus={$0}", boost: 8, info: "React focus handler" },
  { label: "onBlur", apply: "onBlur={$0}", boost: 8, info: "React blur handler" },
  { label: "onSubmit", apply: "onSubmit={$0}", boost: 8, info: "React form submit handler" },
  { label: "htmlFor", apply: "htmlFor=\"$0\"", boost: 8, info: "React label for attribute" },
  { label: "dangerouslySetInnerHTML", apply: "dangerouslySetInnerHTML={{ __html: $0 }}", boost: 7, info: "React raw HTML insertion" },
  { label: "defaultChecked", apply: "defaultChecked={$0}", boost: 7, info: "React uncontrolled checkbox" },
  { label: "readOnly", apply: "readOnly={$0}", boost: 7, info: "React read-only input" }
]
export function htmlCompletions(context: CompletionContext, projectContext?: any) {
  const line = context.state.doc.lineAt(context.pos)
  const textBefore = line.text.slice(0, context.pos - line.from)
  const isJsx = context.state.doc.toString().includes('return (')
  
  // 动态补全自定义组件
  const customTags = projectContext?.customTags || [];

  // 1. 标签补全：匹配 <tag 开始输入
  const tagOpenMatch = /<([a-z][a-z0-9]*)$/i.exec(textBefore)
  if (tagOpenMatch) {
    return {
      from: context.pos - tagOpenMatch[1].length,
      options: [
        ...HTML_TAGS.filter(tag => tag.label.startsWith(tagOpenMatch[1].toLowerCase())),
        ...customTags.filter(tag => tag.startsWith(tagOpenMatch[1].toLowerCase())).map(label => ({ label, type: 'tag' }))
      ].map(tag => isJsx ? {
        ...tag,
        apply: typeof tag.apply === 'string' ? tag.apply.replace(/=\"/g, '={').replace(/\"/g, '}') : tag.apply
      } : tag),
      filter: false
    }
  }

  // 2. 属性名补全：匹配 <tag attr 开始输入
  const attrMatch = /<[a-z][a-z0-9]*\s+([^\s>]*)$/i.exec(textBefore)
  if (attrMatch) {
    return {
      from: context.pos - attrMatch[1].length,
      options: HTML_ATTRIBUTES.filter(attr =>
        attr.label.startsWith(attrMatch[1].toLowerCase())
      ),
      filter: false
    }
  }

  // 3. 属性值补全：匹配 <tag attr="value 开始输入
  const attrValueMatch = /<[^>]+\s+([a-z-]+)=("[^"]*"|'[^']*'|{[^}]*})?$/i.exec(textBefore);
  if (attrValueMatch) {
    const attrName = attrValueMatch[1];
    const values = HTML_ATTRIBUTE_VALUES[attrName] || [];
    return {
      from: context.pos,
      options: values,
      filter: false
    };
  }

  // 4. 默认返回所有属性补全（包括 JSX 特殊属性）
  return {
    from: context.pos,
    options: isJsx ? [...JSX_ATTRIBUTES, ...HTML_ATTRIBUTES] : HTML_ATTRIBUTES,
    filter: false
  };
}