import fs from 'node:fs';

const file = 'data/source/faurgs_ifsc_questoes_integrais_stage4_linhas.json';
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const questions = raw.questoes || raw.questions || [];
const supports = raw.textos_apoio || raw.suportes || [];
const lineKeys = new Set();
const samples = [];
let supportsWithVisibleLines = 0;
let questionsWithVisibleLines = 0;

const linePattern = /(^|\n)\s*(?:\[?\d{1,3}\]?\s*[|.:—-]|L\.?\s*\d{1,3}\b|linha\s+\d{1,3}\b)/im;

function inspectKeys(obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return;
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (/(linha|line|numera)/i.test(key)) {
      lineKeys.add(path);
      if (samples.length < 30) samples.push({ path, value: typeof value === 'string' ? value.slice(0, 220) : value });
    }
  }
}

function visible(text) {
  return typeof text === 'string' && linePattern.test(text);
}

for (const support of supports) {
  inspectKeys(support, 'suporte');
  if (visible(support.texto)) supportsWithVisibleLines += 1;
}

for (const q of questions) {
  inspectKeys(q, 'questao');
  if (visible(q.texto_apoio)) questionsWithVisibleLines += 1;
}

console.log(JSON.stringify({
  arquivo: file,
  questoes: questions.length,
  suportes: supports.length,
  suportes_com_linhas_visiveis: supportsWithVisibleLines,
  questoes_com_texto_apoio_numerado: questionsWithVisibleLines,
  campos_relacionados_a_linhas: [...lineKeys].sort(),
  amostras: samples
}, null, 2));
