(() => {
'use strict';

const DATA_URL = window.FaurgsSource?.url || 'data/source/faurgs_ifsc_questoes_integrais_stage4_linhas.json';
let bankPromise = null;
let scheduled = false;

function stripMarkup(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\*{1,3}|\+\+/g, '')
    .replace(/^\s*\d{1,3}[.)]\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function plainDisplay(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\*{1,3}|\+\+/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function linesToText(lines) {
  if (!Array.isArray(lines)) return '';
  return lines.map(row => {
    const label = String(row?.rotulo ?? '').trim().replace(/[.)]+$/, '');
    const text = String(row?.texto ?? '').trimEnd();
    return label ? `${label}. ${text}` : text;
  }).join('\n');
}

function supportId(value) {
  return String(value?.apoio_id ?? value?.id ?? value?.suporte_id ?? value?.texto_apoio_id ?? '').trim();
}

function resolveAuditedLines(question, raw) {
  if (!question || !raw) return [];
  if (Array.isArray(question.linhas_pdf) && question.linhas_pdf.length) return question.linhas_pdf;

  const supports = raw.textos_apoio || raw.suportes || [];
  const ids = [
    question.apoio_id,
    question.suporte_id,
    question.texto_apoio_id,
    question.texto_base_id,
    question.support_id,
    question.texto_id
  ].filter(Boolean).map(String);

  let support = ids.length
    ? supports.find(item => ids.includes(supportId(item)))
    : null;

  if (!support && question.id) {
    const qid = String(question.id);
    support = supports.find(item => Array.isArray(item.questoes) && item.questoes.map(String).includes(qid));
  }

  if (!support && question.texto_apoio) {
    const questionText = stripMarkup(question.texto_apoio);
    if (questionText.length >= 24) {
      support = supports.find(item => {
        const supportText = stripMarkup(item.texto || item.texto_apoio || '');
        if (supportText.length < 24) return false;
        const n = Math.min(100, questionText.length, supportText.length);
        return n >= 24 && questionText.slice(0, n) === supportText.slice(0, n);
      });
    }
  }

  return Array.isArray(support?.linhas_pdf) ? support.linhas_pdf : [];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { stripMarkup, linesToText, resolveAuditedLines };
}

if (typeof window === 'undefined' || typeof document === 'undefined') return;

function loadBank() {
  if (!bankPromise) {
    bankPromise = fetch(DATA_URL, { cache: 'no-store' }).then(response => {
      if (!response.ok) throw new Error(`Banco indisponível (${response.status})`);
      return response.json();
    });
  }
  return bankPromise;
}

function currentQuestionId() {
  return document.querySelector('#questionChips .chip.primary')?.textContent?.trim() || '';
}

async function syncLines() {
  scheduled = false;
  const id = currentQuestionId();
  const content = document.getElementById('supportContent');
  const block = document.getElementById('supportBlock');
  if (!id || !content || !block || block.classList.contains('hidden')) return;

  try {
    const raw = await loadBank();
    if (id !== currentQuestionId()) return;
    const questions = raw.questoes || raw.questions || [];
    const question = questions.find(item => String(item.id) === id);
    const lines = resolveAuditedLines(question, raw);
    if (!lines.length) return;

    const source = linesToText(lines);
    if (!source) return;
    const currentPlain = plainDisplay(content.textContent);
    const expectedPlain = plainDisplay(source);
    if (currentPlain === expectedPlain) return;

    content.textContent = source;
    content.dataset.auditedLines = 'true';
    content.dataset.auditedLinesFor = id;
    window.FaurgsRichText?.scan?.(content);
  } catch (error) {
    console.warn('[FAURGS] Não foi possível aplicar linhas auditadas:', error);
  }
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(syncLines);
}

function init() {
  schedule();
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

window.FaurgsSupportLines = { sync: syncLines, resolveAuditedLines, linesToText };
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
})();
