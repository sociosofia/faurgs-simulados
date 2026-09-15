import fs from 'node:fs';
const path='data/source/faurgs_ifsc_questoes_integrais_stage2.json';
const raw=JSON.parse(fs.readFileSync(path,'utf8'));
const qs=raw.questoes||raw.questions||[];
if(!Array.isArray(qs)||!qs.length) throw new Error('Banco sem questões.');
const ids=new Set(); const errors=[]; const warnings=[];
const isAnnulled=q=>q.anulada===true||q.anulado===true||String(q.situacao||q.status||'').toLowerCase().includes('anulad')||String(q.gabarito||q.gabarito_historico||'').toLowerCase().includes('anulad')||q.id==='TJRS16-PED-Q26';
for(const [i,q] of qs.entries()){
  const id=String(q.id||''); if(!id) errors.push(`Questão ${i+1}: sem id`); else if(ids.has(id)) errors.push(`ID duplicado: ${id}`); else ids.add(id);
  if(!String(q.enunciado||q.questao||'').trim()) errors.push(`${id||i+1}: sem enunciado`);
  const alts=q.alternativas&&typeof q.alternativas==='object'&&!Array.isArray(q.alternativas)?q.alternativas:Object.fromEntries(['A','B','C','D','E'].filter(k=>q[k]!=null).map(k=>[k,q[k]]));
  if(Object.keys(alts).length<2) errors.push(`${id||i+1}: alternativas insuficientes`);
  if(Object.keys(alts).length!==5) warnings.push(`${id||i+1}: ${Object.keys(alts).length} alternativas`);
  const gab=String(q.gabarito||q.gabarito_historico||'').trim().toUpperCase();
  if(!isAnnulled(q)&&!/^[A-E]$/.test(gab)) errors.push(`${id||i+1}: gabarito inválido (${gab||'vazio'})`);
}
const supports=raw.textos_apoio||raw.suportes||[];
const uniq=a=>new Set(a.filter(Boolean)).size;
console.log(JSON.stringify({questoes:qs.length,suportes:supports.length,concursos:uniq(qs.map(q=>q.concurso||q.orgao)),disciplinas:uniq(qs.map(q=>q.disciplina)),temas:uniq(qs.map(q=>q.tema)),anuladas:qs.filter(isAnnulled).map(q=>q.id),warnings:warnings.length},null,2));
if(warnings.length) console.warn(warnings.slice(0,20).join('\n')+(warnings.length>20?`\n... +${warnings.length-20} aviso(s)`:''));
if(errors.length){console.error(errors.slice(0,40).join('\n'));process.exit(1);}console.log('Banco FAURGS validado.');
