(() => {
'use strict';

const SELECTOR = '#questionStatement, #supportContent, .alt-text';
const cache = new WeakMap();

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function normalizeAllowedTags(value) {
  return String(value ?? '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/\s*(strong|b)\s*>/gi, '**')
    .replace(/<\s*(strong|b)\s*>/gi, '**')
    .replace(/<\s*\/\s*(em|i)\s*>/gi, '*')
    .replace(/<\s*(em|i)\s*>/gi, '*')
    .replace(/<\s*\/\s*u\s*>/gi, '++')
    .replace(/<\s*u\s*>/gi, '++');
}

function toSafeHtml(value) {
  let text = normalizeAllowedTags(value).replace(/\r\n?/g, '\n');
  text = escapeHtml(text);
  text = text.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\+\+([\s\S]+?)\+\+/g, '<u>$1</u>');
  text = text.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  return text.replace(/\n/g, '<br>');
}

function renderElement(element) {
  if (!element) return;
  const currentText = element.textContent ?? '';
  const previous = cache.get(element);
  if (previous && currentText === previous.renderedText) return;

  element.innerHTML = toSafeHtml(currentText);
  cache.set(element, {
    source: currentText,
    renderedText: element.textContent ?? ''
  });
}

function scan(root = document) {
  if (root.nodeType === Node.ELEMENT_NODE && root.matches?.(SELECTOR)) {
    renderElement(root);
  }
  root.querySelectorAll?.(SELECTOR).forEach(renderElement);
}

function init() {
  scan(document);
  const observer = new MutationObserver(mutations => {
    const roots = new Set();
    for (const mutation of mutations) {
      const target = mutation.target.nodeType === Node.ELEMENT_NODE
        ? mutation.target
        : mutation.target.parentElement;
      if (target) roots.add(target);
    }
    roots.forEach(scan);
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

window.FaurgsRichText = { toSafeHtml, scan };
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
})();
