import fs from 'node:fs';

const file = 'data/source/faurgs_ifsc_questoes_integrais_stage2.json';
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const questions = raw.questoes || raw.questions || [];
const supports = raw.textos_apoio || raw.suportes || [];

const patterns = {
  markdownBold: /\*\*[^*]+\*\*/,
  htmlBold: /<\s*(strong|b)\b/i,
  markdownItalic: /(^|[^*])\*[^*\n]+\*(?!\*)/,
  htmlItalic: /<\s*(em|i)\b/i,
  underline: /(\+\+[^+]+\+\+|<\s*u\b)/i,
  lineBreakTag: /<\s*br\s*\/?>/i
};

const counts = Object.fromEntries(Object.keys(patterns).map(key => [key, 0]));
const samples = [];
const formattingKeys = new Set();

function inspectObjectKeys(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (/(negr|bold|desta|format|rich|html|markdown|italic|sublinh)/i.test(key)) formattingKeys.add(key);
  }
}

function inspectText(text, label) {
  if (typeof text !== 'string' || !text) return;
  const found = [];
  for (const [name, regex] of Object.entries(patterns)) {
    if (regex.test(text)) {
      counts[name] += 1;
      found.push(name);
    }
  }
  if (found.length && samples.length < 20) samples.push({ label, found, excerpt: text.slice(0, 180) });
}

for (const q of questions) {
  inspectObjectKeys(q);
  inspectText(q.enunciado || q.questao, `${q.id || 'sem-id'}:enunciado`);
  const alternatives = q.alternativas && typeof q.alternativas === 'object' ? q.alternativas : q;
  for (const letter of ['A', 'B', 'C', 'D', 'E']) inspectText(alternatives?.[letter], `${q.id || 'sem-id'}:${letter}`);
  inspectText(q.texto_apoio, `${q.id || 'sem-id'}:texto_apoio`);
}

for (const support of supports) {
  inspectObjectKeys(support);
  inspectText(support.texto, `${support.apoio_id || support.id || 'suporte'}:texto`);
}

console.log(JSON.stringify({
  questoes: questions.length,
  suportes: supports.length,
  marcadores: counts,
  campos_de_formatacao_detectados: [...formattingKeys].sort(),
  amostras: samples
}, null, 2));
