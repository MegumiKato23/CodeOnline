import { Completion, CompletionContext, snippetCompletion } from '@codemirror/autocomplete'

const HTML_TAGS: Completion[] = [
  snippetCompletion("div>$0</div>", { label: "div", type: "tag", boost: 10 }),
  snippetCompletion("span>$0</span>", { label: "span", type: "tag", boost: 9 }),
  snippetCompletion("section>$0</section>", { label: "section", type: "tag", boost: 9 }),
  snippetCompletion("article>$0</article>", { label: "article", type: "tag", boost: 9 }),
  snippetCompletion("header>$0</header>", { label: "header", type: "tag", boost: 9 }),
  snippetCompletion("footer>$0</footer>", { label: "footer", type: "tag", boost: 9 }),
  snippetCompletion("main>$0</main>", { label: "main", type: "tag", boost: 9 }),
  snippetCompletion("nav>$0</nav>", { label: "nav", type: "tag", boost: 9 }),
  snippetCompletion("aside>$0</aside>", { label: "aside", type: "tag", boost: 8 }),
  snippetCompletion("template>$0</template>", { label: "template", type: "tag", boost: 8 }),

  snippetCompletion("h1>$0</h1>", { label: "h1", type: "tag", boost: 9 }),
  snippetCompletion("h2>$0</h2>", { label: "h2", type: "tag", boost: 9 }),
  snippetCompletion("h3>$0</h3>", { label: "h3", type: "tag", boost: 9 }),
  snippetCompletion("h4>$0</h4>", { label: "h4", type: "tag", boost: 8 }),
  snippetCompletion("h5>$0</h5>", { label: "h5", type: "tag", boost: 8 }),
  snippetCompletion("h6>$0</h6>", { label: "h6", type: "tag", boost: 8 }),
  snippetCompletion("p>$0</p>", { label: "p", type: "tag", boost: 9 }),
  snippetCompletion("a href=\"$1\">$0</a>", { label: "a", type: "tag", boost: 9 }),
  snippetCompletion("strong>$0</strong>", { label: "strong", type: "tag", boost: 8 }),
  snippetCompletion("em>$0</em>", { label: "em", type: "tag", boost: 8 }),
  snippetCompletion("code>$0</code>", { label: "code", type: "tag", boost: 8 }),
  snippetCompletion("pre>$0</pre>", { label: "pre", type: "tag", boost: 8 }),
  snippetCompletion("blockquote>$0</blockquote>", { label: "blockquote", type: "tag", boost: 7 }),
  snippetCompletion("q>$0</q>", { label: "q", type: "tag", boost: 7 }),

  snippetCompletion("form action=\"$1\" method=\"$2\">\n\t$0\n</form>", { label: "form", type: "tag", boost: 9 }),
  snippetCompletion("input type=\"$1\" name=\"$0\">", { label: "input", type: "tag", boost: 9 }),
  snippetCompletion("button type=\"$1\">$0</button>", { label: "button", type: "tag", boost: 9 }),
  snippetCompletion("select name=\"$1\">\n\t<option value=\"$2\">$0</option>\n</select>", { label: "select", type: "tag", boost: 8 }),
  snippetCompletion("textarea name=\"$1\">$0</textarea>", { label: "textarea", type: "tag", boost: 8 }),
  snippetCompletion("label for=\"$1\">$0</label>", { label: "label", type: "tag", boost: 8 }),
  snippetCompletion("fieldset>\n\t<legend>$1</legend>\n\t$0\n</fieldset>", { label: "fieldset", type: "tag", boost: 7 }),
  snippetCompletion("legend>$0</legend>", { label: "legend", type: "tag", boost: 7 }),
  snippetCompletion("datalist id=\"$1\">\n\t<option value=\"$0\">\n</datalist>", { label: "datalist", type: "tag", boost: 7 }),
  snippetCompletion("output name=\"$1\">$0</output>", { label: "output", type: "tag", boost: 7 }),
  snippetCompletion("progress value=\"$1\" max=\"$2\">$0</progress>", { label: "progress", type: "tag", boost: 7 }),
  snippetCompletion("meter value=\"$1\" min=\"$2\" max=\"$3\">$0</meter>", { label: "meter", type: "tag", boost: 6 }),

  snippetCompletion("img src=\"$1\" alt=\"$0\">", { label: "img", type: "tag", boost: 9 }),
  snippetCompletion("video controls>\n\t<source src=\"$1\" type=\"video/mp4\">\n\t$0\n</video>", { label: "video", type: "tag", boost: 8 }),
  snippetCompletion("audio controls>\n\t<source src=\"$1\" type=\"audio/mpeg\">\n\t$0\n</audio>", { label: "audio", type: "tag", boost: 8 }),
  snippetCompletion("picture>\n\t<source srcset=\"$1\" media=\"$2\">\n\t<img src=\"$3\" alt=\"$0\">\n</picture>", { label: "picture", type: "tag", boost: 7 }),
  snippetCompletion("source src=\"$1\" type=\"$0\">", { label: "source", type: "tag", boost: 7 }),
  snippetCompletion("track kind=\"$1\" src=\"$2\" srclang=\"$3\" label=\"$0\">", { label: "track", type: "tag", boost: 6 }),
  snippetCompletion("map name=\"$1\">\n\t<area shape=\"$2\" coords=\"$3\" href=\"$4\" alt=\"$0\">\n</map>", { label: "map", type: "tag", boost: 6 }),
  snippetCompletion("area shape=\"$1\" coords=\"$2\" href=\"$3\" alt=\"$0\">", { label: "area", type: "tag", boost: 6 }),

  snippetCompletion("ul>\n\t<li>$0</li>\n</ul>", { label: "ul", type: "tag", boost: 9 }),
  snippetCompletion("ol>\n\t<li>$0</li>\n</ol>", { label: "ol", type: "tag", boost: 9 }),
  snippetCompletion("li>$0</li>", { label: "li", type: "tag", boost: 8 }),
  snippetCompletion("dl>\n\t<dt>$1</dt>\n\t<dd>$0</dd>\n</dl>", { label: "dl", type: "tag", boost: 7 }),
  snippetCompletion("dt>$0</dt>", { label: "dt", type: "tag", boost: 7 }),
  snippetCompletion("dd>$0</dd>", { label: "dd", type: "tag", boost: 7 }),
  snippetCompletion("table>\n\t<tr>\n\t\t<th>$0</th>\n\t</tr>\n</table>", { label: "table", type: "tag", boost: 8 }),
  snippetCompletion("tr>\n\t<td>$0</td>\n</tr>", { label: "tr", type: "tag", boost: 7 }),
  snippetCompletion("th>$0</th>", { label: "th", type: "tag", boost: 7 }),
  snippetCompletion("td>$0</td>", { label: "td", type: "tag", boost: 7 }),
  snippetCompletion("thead>\n\t<tr>\n\t\t<th>$0</th>\n\t</tr>\n</thead>", { label: "thead", type: "tag", boost: 7 }),
  snippetCompletion("tbody>\n\t<tr>\n\t\t<td>$0</td>\n\t</tr>\n</tbody>", { label: "tbody", type: "tag", boost: 7 }),
  snippetCompletion("tfoot>\n\t<tr>\n\t\t<td>$0</td>\n\t</tr>\n</tfoot>", { label: "tfoot", type: "tag", boost: 7 }),
  snippetCompletion("caption>$0</caption>", { label: "caption", type: "tag", boost: 6 }),
  snippetCompletion("colgroup>\n\t<col span=\"$1\">$0\n</colgroup>", { label: "colgroup", type: "tag", boost: 6 }),
  snippetCompletion("col span=\"$1\">$0", { label: "col", type: "tag", boost: 6 }),

  snippetCompletion("meta name=\"$1\" content=\"$0\">", { label: "meta", type: "tag", boost: 7 }),
  snippetCompletion("link rel=\"$1\" href=\"$0\">", { label: "link", type: "tag", boost: 7 }),
  snippetCompletion("script src=\"$1\">$0</script>", { label: "script", type: "tag", boost: 8 }),
]
const HTML_ATTRIBUTES: Completion[] = [
  snippetCompletion('class="$0"', { label: "class", type: "property", boost: 10 }),
  snippetCompletion('id="$0"', { label: "id", type: "property", boost: 10 }),
  snippetCompletion('style="$0"', { label: "style", type: "property", boost: 9 }),
  snippetCompletion('title="$0"', { label: "title", type: "property", boost: 8 }),
  snippetCompletion('data-$0="$1"', { label: "data-*", type: "property", boost: 7 }),
  snippetCompletion('aria-$0="$1"', { label: "aria-*", type: "property", boost: 7 }),
  snippetCompletion('hidden', { label: "hidden", type: "property", boost: 8 }),
  snippetCompletion('lang="$0"', { label: "lang", type: "property", boost: 7 }),
  snippetCompletion('dir="$0"', { label: "dir", type: "property", boost: 7 }),
  snippetCompletion('contenteditable="$0"', { label: "contenteditable", type: "property", boost: 7 }),
  snippetCompletion('draggable="$0"', { label: "draggable", type: "property", boost: 7 }),
  snippetCompletion('spellcheck="$0"', { label: "spellcheck", type: "property", boost: 7 }),
  snippetCompletion('tabindex="$0"', { label: "tabindex", type: "property", boost: 7 }),

  snippetCompletion('name="$0"', { label: "name", type: "property", boost: 9 }),
  snippetCompletion('value="$0"', { label: "value", type: "property", boost: 9 }),
  snippetCompletion('placeholder="$0"', { label: "placeholder", type: "property", boost: 8 }),
  snippetCompletion('required', { label: "required", type: "property", boost: 8 }),
  snippetCompletion('disabled', { label: "disabled", type: "property", boost: 8 }),
  snippetCompletion('readonly', { label: "readonly", type: "property", boost: 7 }),
  snippetCompletion('autofocus', { label: "autofocus", type: "property", boost: 7 }),
  snippetCompletion('autocomplete="$0"', { label: "autocomplete", type: "property", boost: 7 }),
  snippetCompletion('pattern="$0"', { label: "pattern", type: "property", boost: 7 }),
  snippetCompletion('min="$0"', { label: "min", type: "property", boost: 7 }),
  snippetCompletion('max="$0"', { label: "max", type: "property", boost: 7 }),
  snippetCompletion('step="$0"', { label: "step", type: "property", boost: 7 }),
  snippetCompletion('multiple', { label: "multiple", type: "property", boost: 7 }),
  snippetCompletion('checked', { label: "checked", type: "property", boost: 8 }),
  snippetCompletion('selected', { label: "selected", type: "property", boost: 8 }),
  snippetCompletion('for="$0"', { label: "for", type: "property", boost: 8 }),

  snippetCompletion('href="$0"', { label: "href", type: "property", boost: 10 }),
  snippetCompletion('src="$0"', { label: "src", type: "property", boost: 10 }),
  snippetCompletion('alt="$0"', { label: "alt", type: "property", boost: 9 }),
  snippetCompletion('target="$0"', { label: "target", type: "property", boost: 8 }),
  snippetCompletion('rel="$0"', { label: "rel", type: "property", boost: 7 }),
  snippetCompletion('download="$0"', { label: "download", type: "property", boost: 7 }),
  snippetCompletion('media="$0"', { label: "media", type: "property", boost: 7 }),
  snippetCompletion('type="$0"', { label: "type", type: "property", boost: 8 }),
  snippetCompletion('poster="$0"', { label: "poster", type: "property", boost: 7 }),
  snippetCompletion('controls', { label: "controls", type: "property", boost: 8 }),
  snippetCompletion('autoplay', { label: "autoplay", type: "property", boost: 7 }),
  snippetCompletion('loop', { label: "loop", type: "property", boost: 7 }),
  snippetCompletion('muted', { label: "muted", type: "property", boost: 7 }),
  snippetCompletion('preload="$0"', { label: "preload", type: "property", boost: 7 }),

  snippetCompletion('onclick="$0"', { label: "onclick", type: "event", boost: 7 }),
  snippetCompletion('onchange="$0"', { label: "onchange", type: "event", boost: 7 }),
  snippetCompletion('oninput="$0"', { label: "oninput", type: "event", boost: 7 }),
  snippetCompletion('onsubmit="$0"', { label: "onsummit", type: "event", boost: 7 }),
  snippetCompletion('onfocus="$0"', { label: "onfocus", type: "event", boost: 7 }),
  snippetCompletion('onblur="$0"', { label: "onblur", type: "event", boost: 7 }),
  snippetCompletion('onkeydown="$0"', { label: "onkeydown", type: "event", boost: 7 }),
  snippetCompletion('onkeyup="$0"', { label: "onkeyup", type: "event", boost: 7 }),
  snippetCompletion('onmouseover="$0"', { label: "onmouseover", type: "event", boost: 7 }),
  snippetCompletion('onmouseout="$0"', { label: "onmouseout", type: "event", boost: 7 }),
  snippetCompletion('onload="$0"', { label: "onload", type: "event", boost: 7 }),
  snippetCompletion('onerror="$0"', { label: "onerror", type: "event", boost: 7 }),
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