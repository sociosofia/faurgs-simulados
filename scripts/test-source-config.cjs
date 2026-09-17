const assert = require('node:assert/strict');
const fs = require('node:fs');
const cfg = require('../js/source-config.js');

assert.equal(cfg.CANONICAL_URL, 'data/source/faurgs_ifsc_questoes_integrais_stage4_linhas.json');
assert.equal(cfg.resolveSource('data/source/faurgs_ifsc_questoes_integrais_stage2.json'), cfg.CANONICAL_URL);
assert.equal(cfg.resolveSource('/faurgs-simulados/data/source/faurgs_ifsc_questoes_integrais_stage2.json'), cfg.CANONICAL_URL);
assert.equal(cfg.resolveSource(cfg.CANONICAL_URL), cfg.CANONICAL_URL);

const version = JSON.parse(fs.readFileSync('data/source/version.json', 'utf8'));
assert.equal(version.source, cfg.CANONICAL_URL);
assert.ok(version.bank_version);

const pages = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
assert.ok(!/cp\s+.*stage4.*stage2/i.test(pages), 'O workflow não deve recriar o alias stage2 por cópia.');

const index = fs.readFileSync('index.html', 'utf8');
assert.ok(index.indexOf('js/source-config.js') < index.indexOf('js/app.js'), 'source-config deve carregar antes do motor.');

console.log('Source config OK:', version.bank_version, cfg.CANONICAL_URL);
