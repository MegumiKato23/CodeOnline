import { Completion, CompletionContext, snippetCompletion } from '@codemirror/autocomplete'

const HTML_TAGS: Completion[] = [
  snippetCompletion("html></html>", { label: "html", type: "tag", boost: 10 }),
  snippetCompletion("head></head>", { label: "head", type: "tag", boost: 10 }),
  snippetCompletion("body></body>", { label: "body", type: "tag", boost: 10 }),
  snippetCompletion("title></title>", { label: "title", type: "tag", boost: 9 }),
  snippetCompletion("meta charset=\"UTF-8\">", { label: "meta", type: "tag", boost: 9 }),
  snippetCompletion("link rel=\"stylesheet\" href=\"\">", { label: "link", type: "tag", boost: 9 }),
  snippetCompletion("script src=\"\"></script>", { label: "script", type: "tag", boost: 9 }),

  snippetCompletion("div></div>", { label: "div", type: "tag", boost: 10 }),
  snippetCompletion("span></span>", { label: "span", type: "tag", boost: 9 }),
  snippetCompletion("section></section>",  { label: "section", type: "tag", boost: 9 }),
  snippetCompletion("article></article>",  { label: "article", type: "tag", boost: 9 }),
  snippetCompletion("header></header>",  { label: "header", type: "tag", boost: 9 }),
  snippetCompletion("footer></footer>",  { label: "footer", type: "tag", boost: 9 }),
  snippetCompletion("main></main>",  { label: "main", type: "tag", boost: 9 }),
  snippetCompletion("nav></nav>",  { label: "nav", type: "tag", boost: 9 }),
  snippetCompletion("aside></aside>",  { label: "aside", type: "tag", boost: 8 }),
  snippetCompletion("template></template>", { label: "template", type: "tag", boost: 8 }),

  snippetCompletion("h1></h1>",  { label: "h1", type: "tag", boost: 9 }),
  snippetCompletion("h2></h2>",  { label: "h2", type: "tag", boost: 9 }),
  snippetCompletion("h3></h3>",  { label: "h3", type: "tag", boost: 9 }),
  snippetCompletion("h4></h4>",  { label: "h4", type: "tag", boost: 8 }),
  snippetCompletion("h5></h5>",  { label: "h5", type: "tag", boost: 8 }),
  snippetCompletion("h6></h6>",  { label: "h6", type: "tag", boost: 8 }),
  snippetCompletion("p></p>",  { label: "p", type: "tag", boost: 9 }),
  snippetCompletion("a href=\"\"></a>", { label: "a", type: "tag", boost: 9 }),
  snippetCompletion("strong></strong>", { label: "strong", type: "tag", boost: 8 }),
  snippetCompletion("em></em>", { label: "em", type: "tag", boost: 8 }),
  snippetCompletion("code></code>", { label: "code", type: "tag", boost: 8 }),
  snippetCompletion("pre></pre>", { label: "pre", type: "tag", boost: 8 }),
  snippetCompletion("blockquote></blockquote>", { label: "blockquote", type: "tag", boost: 7 }),

  snippetCompletion("form action=\"\" method=\"\">\n\t\n</form>", { label: "form", type: "tag", boost: 9 }),
  snippetCompletion("input type=\"\" name=\"\">", { label: "input", type: "tag", boost: 9 }),
  snippetCompletion("button type=\"\"></button>", { label: "button", type: "tag", boost: 9 }),
  snippetCompletion("select name=\"\">\n\t<option value=\"\"></option>\n</select>", { label: "select", type: "tag", boost: 8 }),
  snippetCompletion("textarea name=\"\"></textarea>", { label: "textarea", type: "tag", boost: 8 }),
  snippetCompletion("label for=\"\"></label>", { label: "label", type: "tag", boost: 8 }),

  snippetCompletion("img src=\"\" alt=\"\">", { label: "img", type: "tag", boost: 9 }),
  snippetCompletion("video controls>\n\t<source src=\"\" type=\"video/mp4\">\n\t\n</video>", { label: "video", type: "tag", boost: 8 }),
  snippetCompletion("audio controls>\n\t<source src=\"\" type=\"audio/mpeg\">\n\t\n</audio>", { label: "audio", type: "tag", boost: 8 }),

  snippetCompletion("ul>\n\t<li></li>\n</ul>", { label: "ul", type: "tag", boost: 9 }),
  snippetCompletion("ol>\n\t<li></li>\n</ol>", { label: "ol", type: "tag", boost: 9 }),
  snippetCompletion("li></li>", { label: "li", type: "tag", boost: 8 }),

  snippetCompletion("table>\n\t<tr>\n\t\t<th></th>\n\t</tr>\n</table>", { label: "table", type: "tag", boost: 8 }),
  snippetCompletion("tr>\n\t<td></td>\n</tr>", { label: "tr", type: "tag", boost: 7 }),
  snippetCompletion("th></th>", { label: "th", type: "tag", boost: 7 }),
  snippetCompletion("td></td>", { label: "td", type: "tag", boost: 7 }),
  snippetCompletion("thead>\n\t<tr>\n\t\t<th></th>\n\t</tr>\n</thead>", { label: "thead", type: "tag", boost: 7 }),
  snippetCompletion("tbody>\n\t<tr>\n\t\t<td></td>\n\t</tr>\n</tbody>", { label: "tbody", type: "tag", boost: 7 }),
  snippetCompletion("tfoot>\n\t<tr>\n\t\t<td></td>\n\t</tr>\n</tfoot>", { label: "tfoot", type: "tag", boost: 7 }),
]
const HTML_ATTRIBUTES: Completion[] = [
  snippetCompletion('class=""', { label: "class", type: "property", boost: 10 }),
  snippetCompletion('id=""', { label: "id", type: "property", boost: 10 }),
  snippetCompletion('style=""', { label: "style", type: "property", boost: 9 }),
  snippetCompletion('title=""', { label: "title", type: "property", boost: 8 }),
  snippetCompletion('data-=""', { label: "data-*", type: "property", boost: 7 }),
  snippetCompletion('aria-=""', { label: "aria-*", type: "property", boost: 7 }),
  snippetCompletion('hidden', { label: "hidden", type: "property", boost: 8 }),
  snippetCompletion('lang=""', { label: "lang", type: "property", boost: 7 }),
  snippetCompletion('dir=""', { label: "dir", type: "property", boost: 7 }),
  snippetCompletion('contenteditable=""', { label: "contenteditable", type: "property", boost: 7 }),
  snippetCompletion('draggable=""', { label: "draggable", type: "property", boost: 7 }),
  snippetCompletion('spellcheck=""', { label: "spellcheck", type: "property", boost: 7 }),
  snippetCompletion('tabindex=""', { label: "tabindex", type: "property", boost: 7 }),

  snippetCompletion('name=""', { label: "name", type: "property", boost: 9 }),
  snippetCompletion('value=""', { label: "value", type: "property", boost: 9 }),
  snippetCompletion('placeholder=""', { label: "placeholder", type: "property", boost: 8 }),
  snippetCompletion('required', { label: "required", type: "property", boost: 8 }),
  snippetCompletion('disabled', { label: "disabled", type: "property", boost: 8 }),
  snippetCompletion('readonly', { label: "readonly", type: "property", boost: 7 }),
  snippetCompletion('autofocus', { label: "autofocus", type: "property", boost: 7 }),
  snippetCompletion('autocomplete=""', { label: "autocomplete", type: "property", boost: 7 }),
  snippetCompletion('pattern=""', { label: "pattern", type: "property", boost: 7 }),
  snippetCompletion('min=""', { label: "min", type: "property", boost: 7 }),
  snippetCompletion('max=""', { label: "max", type: "property", boost: 7 }),
  snippetCompletion('step=""', { label: "step", type: "property", boost: 7 }),
  snippetCompletion('multiple', { label: "multiple", type: "property", boost: 7 }),
  snippetCompletion('checked', { label: "checked", type: "property", boost: 8 }),
  snippetCompletion('selected', { label: "selected", type: "property", boost: 8 }),
  snippetCompletion('for=""', { label: "for", type: "property", boost: 8 }),

  snippetCompletion('href=""', { label: "href", type: "property", boost: 10 }),
  snippetCompletion('src=""', { label: "src", type: "property", boost: 10 }),
  snippetCompletion('alt=""', { label: "alt", type: "property", boost: 9 }),
  snippetCompletion('target=""', { label: "target", type: "property", boost: 8 }),
  snippetCompletion('rel=""', { label: "rel", type: "property", boost: 7 }),
  snippetCompletion('download=""', { label: "download", type: "property", boost: 7 }),
  snippetCompletion('media=""', { label: "media", type: "property", boost: 7 }),
  snippetCompletion('type=""', { label: "type", type: "property", boost: 8 }),
  snippetCompletion('poster=""', { label: "poster", type: "property", boost: 7 }),
  snippetCompletion('controls', { label: "controls", type: "property", boost: 8 }),
  snippetCompletion('autoplay', { label: "autoplay", type: "property", boost: 7 }),
  snippetCompletion('loop', { label: "loop", type: "property", boost: 7 }),
  snippetCompletion('muted', { label: "muted", type: "property", boost: 7 }),
  snippetCompletion('preload=""', { label: "preload", type: "property", boost: 7 }),

  snippetCompletion('onclick=""', { label: "onclick", type: "event", boost: 7 }),
  snippetCompletion('onchange=""', { label: "onchange", type: "event", boost: 7 }),
  snippetCompletion('oninput=""', { label: "oninput", type: "event", boost: 7 }),
  snippetCompletion('onsubmit=""', { label: "onsummit", type: "event", boost: 7 }),
  snippetCompletion('onfocus=""', { label: "onfocus", type: "event", boost: 7 }),
  snippetCompletion('onblur=""', { label: "onblur", type: "event", boost: 7 }),
  snippetCompletion('onkeydown=""', { label: "onkeydown", type: "event", boost: 7 }),
  snippetCompletion('onkeyup=""', { label: "onkeyup", type: "event", boost: 7 }),
  snippetCompletion('onmouseover=""', { label: "onmouseover", type: "event", boost: 7 }),
  snippetCompletion('onmouseout=""', { label: "onmouseout", type: "event", boost: 7 }),
  snippetCompletion('onload=""', { label: "onload", type: "event", boost: 7 }),
  snippetCompletion('onerror=""', { label: "onerror", type: "event", boost: 7 }),
]

const HTML_ATTRIBUTE_VALUES: Record<string, Completion[]> = {
  "type": [
    { label: "text", apply: "text" },
    { label: "password", apply: "password" },
    { label: "email", apply: "email" },
    { label: "number", apply: "number" },
    { label: "tel", apply: "tel" },
    { label: "url", apply: "url" },
    { label: "search", apply: "search" },
    { label: "date", apply: "date" },
    { label: "time", apply: "time" },
    { label: "datetime-local", apply: "datetime-local" },
    { label: "month", apply: "month" },
    { label: "week", apply: "week" },
    { label: "color", apply: "color" },
    { label: "checkbox", apply: "checkbox" },
    { label: "radio", apply: "radio" },
    { label: "file", apply: "file" },
    { label: "hidden", apply: "hidden" },
    { label: "submit", apply: "submit" },
    { label: "reset", apply: "reset" },
    { label: "button", apply: "button" },
    { label: "image", apply: "image" }
  ],
  "target": [
    { label: "_blank", apply: "_blank" },
    { label: "_self", apply: "_self" },
    { label: "_parent", apply: "_parent" },
    { label: "_top", apply: "_top" }
  ],
  "method": [
    { label: "get", apply: "get" },
    { label: "post", apply: "post" },
    { label: "dialog", apply: "dialog" }
  ],
  "autocomplete": [
    { label: "on", apply: "on" },
    { label: "off", apply: "off" },
    { label: "name", apply: "name" },
    { label: "email", apply: "email" },
    { label: "username", apply: "username" },
    { label: "current-password", apply: "current-password" },
    { label: "new-password", apply: "new-password" }
  ],
  "contenteditable": [
    { label: "true", apply: "true" },
    { label: "false", apply: "false" }
  ],
  "draggable": [
    { label: "true", apply: "true" },
    { label: "false", apply: "false" }
  ],
  "spellcheck": [
    { label: "true", apply: "true" },
    { label: "false", apply: "false" }
  ],
  "dir": [
    { label: "ltr", apply: "ltr" },
    { label: "rtl", apply: "rtl" },
    { label: "auto", apply: "auto" }
  ],
  "preload": [
    { label: "none", apply: "none" },
    { label: "metadata", apply: "metadata" },
    { label: "auto", apply: "auto" }
  ],
  "media": [
    { label: "screen", apply: "screen" },
    { label: "print", apply: "print" },
    { label: "all", apply: "all" },
    { label: "(max-width: 600px)", apply: "(max-width: 600px)" }
  ]
}

function getAttributeValueCompletions(attr: string, pos: number) {
  const options = HTML_ATTRIBUTE_VALUES[attr.toLowerCase()] || []
  return { 
    from: pos, 
    options: options.map(opt => ({
      ...opt,
       apply: `${opt.apply}"` // 加上引号，确保补全带引号
    })), 
    filter: false 
  }
}

function getSnippetCompletions(): Completion[] {
  return [
    snippetCompletion("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n\t<meta charset=\"UTF-8\">\n\t<title>$1</title>\n</head>\n<body>\n\t$0\n</body>\n</html>", {
      label: "html5",
      type: "snippet",
      boost: 10
    })
  ]
}

export function htmlCompletions(context: CompletionContext, projectContext?: any) {
  const line = context.state.doc.lineAt(context.pos)
  const textBefore = line.text.slice(0, context.pos - line.from)
  const isJsx = context.state.doc.toString().includes('return (')

  const customTags = projectContext?.customTags || [];

  // 1. 标签补全：匹配 <tag 开始输入
  const tagOpenMatch = /<([a-z][a-z0-9]*)$/i.exec(textBefore)
  if (tagOpenMatch) {
    const fromPos = context.pos - tagOpenMatch[1].length
    return {
      from: fromPos,
      options: [
        ...HTML_TAGS.filter(tag => tag.label.startsWith(tagOpenMatch[1].toLowerCase())),
        ...customTags.filter(tag => tag.startsWith(tagOpenMatch[1].toLowerCase())).map(label => ({ label, type: 'tag' }))
      ].map(tag => {
        if (!isJsx && textBefore.endsWith('<')) {
          // 如果前面已经有 <，去掉补全文本开头的 <
          if (typeof tag.apply === 'string' && tag.apply.startsWith('<')) {
            return { ...tag, apply: tag.apply.slice(1) }
          }
        }
        if (isJsx) {
          return {
            ...tag,
            apply: typeof tag.apply === 'string' ? tag.apply.replace(/=\"/g, '={').replace(/\"/g, '}') : tag.apply
          }
        }
        return tag
      }),
      filter: false
    }
  }

  // 2. 属性名补全：匹配 <tag attr 开始输入，改为更精确匹配属性名
  const attrMatch = /<[a-z][a-z0-9]*\s+([a-z-]*)$/i.exec(textBefore)
  if (attrMatch) {
    return {
      from: context.pos - attrMatch[1].length,
      options: HTML_ATTRIBUTES.filter(attr =>
        attr.label.startsWith(attrMatch[1].toLowerCase())
      ),
      filter: false
    }
  }

  // 3. 属性值补全：匹配 <tag attr="value 开始输入，改用 getAttributeValueCompletions 返回，并修正 from 位置
  const attrValueMatch = /<[^>]+\s+([a-z-]+)=["']([^"']*)$/i.exec(textBefore);
  if (attrValueMatch) {
    const attrName = attrValueMatch[1];
    const valueStartPos = context.pos - attrValueMatch[2].length;
    return getAttributeValueCompletions(attrName, valueStartPos);
  }

  // 4. snippet 补全支持
  const snippetCompletions = getSnippetCompletions();
  if (textBefore.trim() === '') {
    return {
      from: context.pos,
      options: snippetCompletions,
      filter: false
    }
  }

  return null;
}