# Simulados FAURGS

Simulador estático de questões reais da banca FAURGS, baseado na experiência do projeto `ifsuldeminas-simulados` e mantido em repositório separado.

## Fonte canônica

`data/source/faurgs_ifsc_questoes_integrais_stage4_linhas.json`

O `stage4_linhas` é a fonte de runtime. Ele preserva as marcações tipográficas auditadas do `stage3_richtext` e acrescenta a numeração auditada das linhas dos textos-base. As versões anteriores permanecem no repositório como referência histórica.

## Recursos

- treino misto FAURGS;
- filtros por concurso, disciplina, tema e histórico;
- cronômetro e retomada automática da sessão;
- textos-base com numeração de linhas auditada quando existente na prova-fonte;
- botão **Ver resposta** durante o quiz, sem alterar resposta marcada, histórico ou relatório final;
- marcação de questões para revisão com motivo e nota;
- resultado por disciplina e relatório copiável;
- retreino dos erros;
- histórico salvo localmente no navegador;
- renderização segura de destaques tipográficos em enunciados, textos-base e alternativas;
- validação estrutural automática do banco no GitHub Actions;
- auditoria automática de marcadores de formatação e numeração de linhas;
- publicação preparada para GitHub Pages.

> O botão “Treino misto FAURGS” é um treino aleatório e não pretende reproduzir a composição oficial de um edital específico. Um modo IFSC oficial deve ser configurado depois do cotejamento com o edital correspondente.

## Formatação das questões

O simulador preserva uma camada controlada de formatação sem aceitar HTML arbitrário.

- `**texto**` ou `<strong>texto</strong>` / `<b>texto</b>` → **negrito**;
- `*texto*` ou `<em>texto</em>` / `<i>texto</i>` → itálico;
- `++texto++` ou `<u>texto</u>` → sublinhado;
- quebras de linha e `<br>` são preservadas.

Qualquer outro HTML permanece como texto escapado. Assim o banco pode conservar destaques relevantes da prova sem abrir uma superfície de injeção de código.

## Validação local

```bash
node --check js/app.js
node --check js/richtext.js
node --check js/answer-reveal.js
node scripts/test-richtext.cjs
node scripts/validate-bank.mjs
node scripts/audit-formatting.mjs
node scripts/audit-lines.mjs
```
