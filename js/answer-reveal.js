(() => {
'use strict';

const SOURCE = 'data/source/faurgs_ifsc_questoes_integrais_stage2.json';
let bankPromise = null;

const $ = id => document.getElementById(id);

function alternatives(q) {
  if (q?.alternativas && typeof q.alternativas === 'object' && !Array.isArray(q.alternativas)) return q.alternativas;
  const result = {};
  for (const letter of ['A', 'B', 'C', 'D', 'E']) if (q?.[letter] != null) result[letter] = q[letter];
  return result;
}

function isAnnulled(q) {
  const status = String(q?.situacao || q?.status || '').toLowerCase();
  const key = String(q?.gabarito || q?.gabarito_historico || '').toLowerCase();
  return q?.anulada === true || q?.anulado === true || status.includes('anulad') || key.includes('anulad') || q?.id === 'TJRS16-PED-Q26';
}

function answerKey(q) {
  const key = String(q?.gabarito || q?.gabarito_historico || '').trim().toUpperCase();
  return /^[A-E]$/.test(key) ? key : '';
}

function safeRichText(value) {
  if (window.FaurgsRichText?.toSafeHtml) return window.FaurgsRichText.toSafeHtml(value);
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

async function loadBank() {
  if (!bankPromise) {
    bankPromise = fetch(SOURCE, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`Falha ao consultar gabarito (${response.status})`);
        return response.json();
      })
      .then(raw => {
        const questions = raw.questoes || raw.questions || [];
        return new Map(questions.map(q => [String(q.id || ''), q]));
      });
  }
  return bankPromise;
}

function currentQuestionId() {
  return document.querySelector('#questionChips .chip.primary')?.textContent?.trim() || '';
}

function resetReveal() {
  const panel = $('answerReveal');
  const button = $('showAnswerBtn');
  if (!panel || !button) return;
  panel.classList.add('hidden');
  panel.innerHTML = '';
  button.textContent = 'Ver resposta';
  button.setAttribute('aria-expanded', 'false');
  button.disabled = false;
}

async function toggleAnswer() {
  const panel = $('answerReveal');
  const button = $('showAnswerBtn');
  if (!panel || !button) return;

  if (!panel.classList.contains('hidden')) {
    resetReveal();
    return;
  }

  const id = currentQuestionId();
  if (!id) return;

  button.disabled = true;
  button.textContent = 'Consultando…';

  try {
    const bank = await loadBank();
    const q = bank.get(id);
    if (!q) throw new Error('Questão atual não encontrada no banco.');

    if (isAnnulled(q)) {
      panel.innerHTML = '<strong>Questão anulada.</strong><span>Ela não entra na pontuação final.</span>';
    } else {
      const key = answerKey(q);
      if (!key) throw new Error('Gabarito não disponível para esta questão.');
      const text = alternatives(q)[key] ?? '';
      panel.innerHTML = `<div class="answer-key">Gabarito: <strong>${key}</strong></div>${text ? `<div class="answer-text">${safeRichText(text)}</div>` : ''}`;
    }

    panel.classList.remove('hidden');
    button.textContent = 'Ocultar resposta';
    button.setAttribute('aria-expanded', 'true');
  } catch (error) {
    panel.innerHTML = `<span>${safeRichText(error.message || 'Não foi possível consultar o gabarito.')}</span>`;
    panel.classList.remove('hidden');
    button.textContent = 'Tentar novamente';
    button.setAttribute('aria-expanded', 'true');
  } finally {
    button.disabled = false;
  }
}

function init() {
  const button = $('showAnswerBtn');
  const progress = $('progressText');
  if (!button || !progress) return;

  button.addEventListener('click', toggleAnswer);
  let previous = progress.textContent;
  new MutationObserver(() => {
    const current = progress.textContent;
    if (current !== previous) {
      previous = current;
      resetReveal();
    }
  }).observe(progress, { childList: true, subtree: true, characterData: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
})();
