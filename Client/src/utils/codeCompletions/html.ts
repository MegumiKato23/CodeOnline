import { Completion, CompletionContext } from '@codemirror/autocomplete'

// Ԥ���ɵ�HTML��ǩ����
const HTML_TAGS: Completion[] = [
  { label: "div", type: "tag", apply: "div>$0</div>", boost: 10, info: "Generic container element" },
    { label: "span", type: "tag", apply: "span>$0</span>", boost: 9 },
    { label: "section", type: "tag", apply: "section>$0</section>", boost: 9 },
    { label: "article", type: "tag", apply: "article>$0</article>", boost: 9 },
    { label: "header", type: "tag", apply: "header>$0</header>", boost: 9 },
    { label: "footer", type: "tag", apply: "footer>$0</footer>", boost: 9 },
    { label: "main", type: "tag", apply: "main>$0</main>", boost: 9 },
    { label: "nav", type: "tag", apply: "nav>$0</nav>", boost: 9 },
    { label: "aside", type: "tag", apply: "aside>$0</aside>", boost: 8 },
    
    // �ı���ǩ
    { label: "h1", type: "tag", apply: "h1>$0</h1>", boost: 9 },
    { label: "h2", type: "tag", apply: "h2>$0</h2>", boost: 9 },
    { label: "h3", type: "tag", apply: "h3>$0</h3>", boost: 9 },
    { label: "p", type: "tag", apply: "p>$0</p>", boost: 9 },
    { label: "a", type: "tag", apply: "a href=\"$1\">$0</a>", boost: 9 },
    { label: "strong", type: "tag", apply: "strong>$0</strong>", boost: 8 },
    { label: "em", type: "tag", apply: "em>$0</em>", boost: 8 },
    { label: "code", type: "tag", apply: "code>$0</code>", boost: 8 },
    
    // ������ǩ
    { label: "form", type: "tag", apply: "form action=\"$1\" method=\"$2\">\n\t$0\n</form>", boost: 9 },
    { label: "input", type: "tag", apply: "input type=\"$1\" name=\"$0\">", boost: 9 },
    { label: "button", type: "tag", apply: "button type=\"$1\">$0</button>", boost: 9 },
    { label: "select", type: "tag", apply: "select name=\"$1\">\n\t<option value=\"$2\">$0</option>\n</select>", boost: 8 },
    { label: "textarea", type: "tag", apply: "textarea name=\"$1\">$0</textarea>", boost: 8 },
    { label: "label", type: "tag", apply: "label for=\"$1\">$0</label>", boost: 8 },
    
    // ý���ǩ
    { label: "img", type: "tag", apply: "img src=\"$1\" alt=\"$0\">", boost: 9 },
    { label: "video", type: "tag", apply: "video controls>\n\t<source src=\"$1\" type=\"video/mp4\">\n\t$0\n</video>", boost: 8 },
    { label: "audio", type: "tag", apply: "audio controls>\n\t<source src=\"$1\" type=\"audio/mpeg\">\n\t$0\n</audio>", boost: 8 },
    
    // �б��ͱ���
    { label: "ul", type: "tag", apply: "ul>\n\t<li>$0</li>\n</ul>", boost: 9 },
    { label: "ol", type: "tag", apply: "ol>\n\t<li>$0</li>\n</ol>", boost: 9 },
    { label: "li", type: "tag", apply: "li>$0</li>", boost: 8 },
    { label: "table", type: "tag", apply: "table>\n\t<tr>\n\t\t<th>$0</th>\n\t</tr>\n</table>", boost: 8 },
    
    // Ԫ��ǩ
    { label: "meta", type: "tag", apply: "meta name=\"$1\" content=\"$0\">", boost: 7 },
    { label: "link", type: "tag", apply: "link rel=\"$1\" href=\"$0\">", boost: 7 },
    { label: "script", type: "tag", apply: "script src=\"$1\">$0</script>", boost: 8 },
    { label: "style", type: "tag", apply: "style>$0</style>", boost: 8 }
]

// Ԥ���ɵ�HTML��������
const HTML_ATTRIBUTES: Completion[] = 
[
  { label: "class", type: "property", apply: "class=\"$0\"", boost: 10 },
    { label: "id", type: "property", apply: "id=\"$0\"", boost: 10 },
    { label: "style", type: "property", apply: "style=\"$0\"", boost: 9 },
    { label: "title", type: "property", apply: "title=\"$0\"", boost: 8 },
    { label: "data-*", type: "property", apply: "data-$0=\"$1\"", boost: 7 },
    
    // �����������
    { label: "name", type: "property", apply: "name=\"$0\"", boost: 9 },
    { label: "value", type: "property", apply: "value=\"$0\"", boost: 9 },
    { label: "placeholder", type: "property", apply: "placeholder=\"$0\"", boost: 8 },
    { label: "required", type: "property", apply: "required", boost: 8 },
    { label: "disabled", type: "property", apply: "disabled", boost: 8 },
    { label: "readonly", type: "property", apply: "readonly", boost: 7 },
    
    // ���Ӻ�ý������
    { label: "href", type: "property", apply: "href=\"$0\"", boost: 10 },
    { label: "src", type: "property", apply: "src=\"$0\"", boost: 10 },
    { label: "alt", type: "property", apply: "alt=\"$0\"", boost: 9 },
    { label: "target", type: "property", apply: "target=\"$0\"", boost: 8 },
    { label: "rel", type: "property", apply: "rel=\"$0\"", boost: 7 },
    
    // �¼�����
    { label: "onclick", type: "event", apply: "onclick=\"$0\"", boost: 7 },
    { label: "onchange", type: "event", apply: "onchange=\"$0\"", boost: 7 },
]
const HTML_ATTRIBUTE_VALUES: Record<string, Completion[]> = {
  "type": [
    { label: "text", apply: "text" },
    { label: "checkbox", apply: "checkbox" }
  ],
  "target": [
    { label: "_blank", apply: "_blank" }
  ]
};
// ˽�й��ߺ���
function getAttributeValueCompletions(attr: string, pos: number) {
  // ʵ������ֵ��ʾ�߼�
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
export function htmlCompletions(context: CompletionContext) {
  const line = context.state.doc.lineAt(context.pos)
  const textBefore = line.text.slice(0, context.pos - line.from)
  const isJsx = context.state.doc.toString().includes('return (')
  
  // 1. ��ǩ����ȫ������ <d ��ȫ div��
  const tagOpenMatch = /<([a-z][a-z0-9]*)$/i.exec(textBefore)
  if (tagOpenMatch) {
    return {
      from: context.pos - tagOpenMatch[1].length,
      options: HTML_TAGS.filter(tag => 
        tag.label.startsWith(tagOpenMatch[1].toLowerCase())
      ).map(tag => isJsx ? {
        ...tag,
        apply: typeof tag.apply === 'string' ? tag.apply.replace(/=\"/g, '={').replace(/\"/g, '}') : tag.apply
      } : tag),
      filter: false
    }
  }

  // 2. ��������ȫ������ <div c ��ȫ class��
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
  
  const attrValueMatch = /<[^>]+\s+([a-z-]+)=("[^"]*"|'[^']*')$/i.exec(textBefore);
  if (attrValueMatch) {
    const attrName = attrValueMatch[1];
    const values = HTML_ATTRIBUTE_VALUES[attrName] || [];
    return {
      from: context.pos,
      options: values,
      filter: false
    };
  }
   return {
    from: context.pos,
    options: isJsx ? [...JSX_ATTRIBUTES, ...HTML_ATTRIBUTES] : HTML_ATTRIBUTES,
    filter: false
  };
 
}