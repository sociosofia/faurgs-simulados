import fs from 'node:fs';

const file = 'data/source/faurgs_ifsc_questoes_integrais_stage4_linhas.json';
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const targetId = 'PT-UFRGS18-ATI-Q01';
const questions = raw.questoes || raw.questions || [];
const supports = raw.textos_apoio || raw.suportes || [];
const q = questions.find(item => String(item.id) === targetId);
if (!q) throw new Error(`Questão ${targetId} não encontrada`);

const ids = [q.apoio_id,q.suporte_id,q.texto_apoio_id,q.texto_base_id,q.support_id,q.texto_id].filter(Boolean).map(String);
const supportId = value => String(value?.apoio_id ?? value?.id ?? value?.suporte_id ?? value?.texto_apoio_id ?? '').trim();
let support = ids.length ? supports.find(item => ids.includes(supportId(item))) : null;
if (!support) support = supports.find(item => Array.isArray(item.questoes) && item.questoes.map(String).includes(targetId));

const pick = obj => obj ? {
  id: obj.id,
  apoio_id: obj.apoio_id,
  suporte_id: obj.suporte_id,
  texto_apoio_id: obj.texto_apoio_id,
  texto_base_id: obj.texto_base_id,
  support_id: obj.support_id,
  texto_id: obj.texto_id,
  texto_apoio_inicio: typeof obj.texto_apoio === 'string' ? obj.texto_apoio.slice(0,240) : undefined,
  texto_inicio: typeof obj.texto === 'string' ? obj.texto.slice(0,240) : undefined,
  linhas_pdf_count: Array.isArray(obj.linhas_pdf) ? obj.linhas_pdf.length : 0,
  linhas_pdf_inicio: Array.isArray(obj.linhas_pdf) ? obj.linhas_pdf.slice(0,5) : undefined,
  campos_linha: Object.fromEntries(Object.entries(obj).filter(([k]) => /(linha|line|numera)/i.test(k)))
} : null;

console.log(JSON.stringify({targetId, ids, question: pick(q), support: pick(support)}, null, 2));
