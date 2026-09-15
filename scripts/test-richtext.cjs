const assert = require('node:assert/strict');
const { toSafeHtml } = require('../js/richtext.js');

assert.equal(toSafeHtml('<strong><em>Mas</em></strong>'), '<strong><em>Mas</em></strong>');
assert.equal(toSafeHtml('<em><strong>Mas</strong></em>'), '<em><strong>Mas</strong></em>');
assert.equal(toSafeHtml('**1**'), '<strong>1</strong>');
assert.equal(toSafeHtml('*Stolen Focus*'), '<em>Stolen Focus</em>');
assert.equal(toSafeHtml('***ambos***'), '<strong><em>ambos</em></strong>');
assert.equal(toSafeHtml('++trecho++'), '<u>trecho</u>');
assert.equal(toSafeHtml('<u><strong>trecho</strong></u>'), '<u><strong>trecho</strong></u>');
assert.equal(toSafeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
assert.equal(toSafeHtml('<strong onclick="x">não</strong>'), '&lt;strong onclick=&quot;x&quot;&gt;não</strong>');
assert.equal(toSafeHtml('linha 1\nlinha 2'), 'linha 1<br>linha 2');

console.log('Richtext OK');
