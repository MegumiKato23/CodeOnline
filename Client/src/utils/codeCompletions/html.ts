import { Completion, CompletionContext } from '@codemirror/autocomplete'

// 预生成的HTML标签数据
const HTML_TAGS: Completion[] = [
  { label: "div", type: "tag", apply: "div>$0</div>", boost: 10 },
    { label: "span", type: "tag", apply: "span>$0</span>", boost: 9 },
    { label: "section", type: "tag", apply: "section>$0</section>", boost: 9 },
    { label: "article", type: "tag", apply: "article>$0</article>", boost: 9 },
    { label: "header", type: "tag", apply: "header>$0</header>", boost: 9 },
    { label: "footer", type: "tag", apply: "footer>$0</footer>", boost: 9 },
    { label: "main", type: "tag", apply: "main>$0</main>", boost: 9 },
    { label: "nav", type: "tag", apply: "nav>$0</nav>", boost: 9 },
    { label: "aside", type: "tag", apply: "aside>$0</aside>", boost: 8 },
    
    // 文本标签
    { label: "h1", type: "tag", apply: "h1>$0</h1>", boost: 9 },
    { label: "h2", type: "tag", apply: "h2>$0</h2>", boost: 9 },
    { label: "h3", type: "tag", apply: "h3>$0</h3>", boost: 9 },
    { label: "p", type: "tag", apply: "p>$0</p>", boost: 9 },
    { label: "a", type: "tag", apply: "a href=\"$1\">$0</a>", boost: 9 },
    { label: "strong", type: "tag", apply: "strong>$0</strong>", boost: 8 },
    { label: "em", type: "tag", apply: "em>$0</em>", boost: 8 },
    { label: "code", type: "tag", apply: "code>$0</code>", boost: 8 },
    
    // 表单标签
    { label: "form", type: "tag", apply: "form action=\"$1\" method=\"$2\">\n\t$0\n</form>", boost: 9 },
    { label: "input", type: "tag", apply: "input type=\"$1\" name=\"$0\">", boost: 9 },
    { label: "button", type: "tag", apply: "button type=\"$1\">$0</button>", boost: 9 },
    { label: "select", type: "tag", apply: "select name=\"$1\">\n\t<option value=\"$2\">$0</option>\n</select>", boost: 8 },
    { label: "textarea", type: "tag", apply: "textarea name=\"$1\">$0</textarea>", boost: 8 },
    { label: "label", type: "tag", apply: "label for=\"$1\">$0</label>", boost: 8 },
    
    // 媒体标签
    { label: "img", type: "tag", apply: "img src=\"$1\" alt=\"$0\">", boost: 9 },
    { label: "video", type: "tag", apply: "video controls>\n\t<source src=\"$1\" type=\"video/mp4\">\n\t$0\n</video>", boost: 8 },
    { label: "audio", type: "tag", apply: "audio controls>\n\t<source src=\"$1\" type=\"audio/mpeg\">\n\t$0\n</audio>", boost: 8 },
    
    // 列表和表格
    { label: "ul", type: "tag", apply: "ul>\n\t<li>$0</li>\n</ul>", boost: 9 },
    { label: "ol", type: "tag", apply: "ol>\n\t<li>$0</li>\n</ol>", boost: 9 },
    { label: "li", type: "tag", apply: "li>$0</li>", boost: 8 },
    { label: "table", type: "tag", apply: "table>\n\t<tr>\n\t\t<th>$0</th>\n\t</tr>\n</table>", boost: 8 },
    
    // 元标签
    { label: "meta", type: "tag", apply: "meta name=\"$1\" content=\"$0\">", boost: 7 },
    { label: "link", type: "tag", apply: "link rel=\"$1\" href=\"$0\">", boost: 7 },
    { label: "script", type: "tag", apply: "script src=\"$1\">$0</script>", boost: 8 },
    { label: "style", type: "tag", apply: "style>$0</style>", boost: 8 }
]

// 预生成的HTML属性数据
const HTML_ATTRIBUTES: Completion[] = 
[
  { label: "class", type: "property", apply: "class=\"$0\"", boost: 10 },
    { label: "id", type: "property", apply: "id=\"$0\"", boost: 10 },
    { label: "style", type: "property", apply: "style=\"$0\"", boost: 9 },
    { label: "title", type: "property", apply: "title=\"$0\"", boost: 8 },
    { label: "data-*", type: "property", apply: "data-$0=\"$1\"", boost: 7 },
    
    // 表单相关属性
    { label: "name", type: "property", apply: "name=\"$0\"", boost: 9 },
    { label: "value", type: "property", apply: "value=\"$0\"", boost: 9 },
    { label: "placeholder", type: "property", apply: "placeholder=\"$0\"", boost: 8 },
    { label: "required", type: "property", apply: "required", boost: 8 },
    { label: "disabled", type: "property", apply: "disabled", boost: 8 },
    { label: "readonly", type: "property", apply: "readonly", boost: 7 },
    
    // 链接和媒体属性
    { label: "href", type: "property", apply: "href=\"$0\"", boost: 10 },
    { label: "src", type: "property", apply: "src=\"$0\"", boost: 10 },
    { label: "alt", type: "property", apply: "alt=\"$0\"", boost: 9 },
    { label: "target", type: "property", apply: "target=\"$0\"", boost: 8 },
    { label: "rel", type: "property", apply: "rel=\"$0\"", boost: 7 },
    
    // 事件属性
    { label: "onclick", type: "event", apply: "onclick=\"$0\"", boost: 7 },
    { label: "onchange", type: "event", apply: "onchange=\"$0\"", boost: 7 },
]

// 私有工具函数
function getAttributeValueCompletions(attr: string, pos: number) {
  // 实现属性值提示逻辑
  return { from: pos, options: [] }
}

function getSnippetCompletions(): Completion[] {
  return [
    { label: "html5", type: "snippet", apply: "<!DOCTYPE html>\n<html>\n<head>\n\t<title>$1</title>\n</head>\n<body>\n\t$0\n</body>\n</html>" }
  ]
}
export function htmlCompletions(context: CompletionContext) {
  const line = context.state.doc.lineAt(context.pos)
  const textBefore = line.text.slice(0, context.pos - line.from)
  
  // 您的上下文判断逻辑
  const inTag = /<[^>]*$/.test(textBefore)
  const inAttribute = /<[^>]*\s[^>]*$/.test(textBefore)

  return {
    from: context.pos,
    options: inAttribute ? HTML_ATTRIBUTES : [...HTML_TAGS, ...HTML_ATTRIBUTES]
  }
}