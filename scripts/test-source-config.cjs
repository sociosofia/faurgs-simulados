const assert = require('node:assert/strict');
const cfg = require('../js/source-config.js');

assert.equal(cfg.CANONICAL_URL, 'data/source/faurgs_ifsc_questoes_integrais_stage4_linhas.json');
assert.equal(cfg.resolveSource('data/source/faurgs_ifsc_questoes_integrais_stage2.json'), cfg.CANONICAL_URL);
assert.equal(cfg.resolveSource('/faurgs-simulados/data/source/faurgs_ifsc_questoes_integrais_stage2.json'), cfg.CANONICAL_URL);
assert.equal(cfg.resolveSource(cfg.CANONICAL_URL), cfg.CANONICAL_URL);
console.log('Source config OK:', cfg.CANONICAL_URL);
