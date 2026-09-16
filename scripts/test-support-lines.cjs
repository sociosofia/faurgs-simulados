const fs = require('node:fs');
const assert = require('node:assert/strict');
const { resolveAuditedLines, linesToText } = require('../js/support-lines.js');

const raw = JSON.parse(fs.readFileSync('data/source/faurgs_ifsc_questoes_integrais_stage4_linhas.json', 'utf8'));
const questions = raw.questoes || raw.questions || [];
const supports = raw.textos_apoio || raw.suportes || [];

assert.equal(supports.length, 14, 'Esperados 14 textos-base auditados.');
assert.ok(supports.every(s => Array.isArray(s.linhas_pdf) && s.linhas_pdf.length), 'Todo texto-base deve ter linhas_pdf.');

const target = questions.find(q => String(q.id) === 'PT-UFRGS19-ENGAGR-Q01');
assert.ok(target, 'Questão da captura não encontrada no stage4.');
const lines = resolveAuditedLines(target, raw);
assert.ok(lines.length > 20, 'Questão da captura não resolveu o texto-base auditado.');
assert.equal(String(lines[0].rotulo).replace(/[.)]+$/, ''), '01');
assert.match(String(lines[0].texto), /O movimento\s+<em>hippie\s*<\/em>|O movimento hippie/i);
const rendered = linesToText(lines);
assert.match(rendered, /^01\.\s+O movimento/m);

console.log(`Support lines OK: ${lines.length} linhas resolvidas para ${target.id}`);
