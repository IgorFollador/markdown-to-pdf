import MarkdownIt from 'markdown-it';
import type { RuleInline } from 'markdown-it/lib/parser_inline.mjs';
import markdownItMultimdTable from 'markdown-it-multimd-table';
import markdownItTaskLists from 'markdown-it-task-lists';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

const strikethrough: RuleInline = (state, silent) => {
  const start = state.pos;
  if (state.src.charCodeAt(start) !== 0x7e /* ~ */) return false;
  if (state.src.charCodeAt(start + 1) !== 0x7e) return false;

  let match = start + 2;
  while ((match = state.src.indexOf('~~', match)) !== -1) {
    if (state.src.charCodeAt(match - 1) !== 0x5c /* \ */) break;
    match += 2;
  }
  if (match === -1) return false;
  if (silent) return true;

  const content = state.src.slice(start + 2, match);
  const tokenOpen = state.push('s_open', 's', 1);
  tokenOpen.markup = '~~';
  const tokenText = state.push('text', '', 0);
  tokenText.content = content;
  const tokenClose = state.push('s_close', 's', -1);
  tokenClose.markup = '~~';
  state.pos = match + 2;
  return true;
};

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch {
        // fall through
      }
    }
    return hljs.highlightAuto(str).value;
  },
})
  .use(markdownItMultimdTable)
  .use(markdownItTaskLists, { enabled: true, label: true });

md.inline.ruler.before('emphasis', 'strikethrough', strikethrough);

export function renderMarkdown(source: string): string {
  const raw = md.render(source);
  return DOMPurify.sanitize(raw, {
    ADD_TAGS: ['input'],
    ADD_ATTR: ['type', 'checked', 'disabled'],
  });
}
