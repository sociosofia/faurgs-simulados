# Simulados FAURGS

Simulador estático de questões reais da banca FAURGS, baseado na experiência do projeto `ifsuldeminas-simulados` e mantido em repositório separado.

## Fonte canônica

`data/source/faurgs_ifsc_questoes_integrais_stage3_richtext.json`

O aplicativo lê diretamente esse JSON no navegador. O `stage2` permanece no repositório como referência anterior; o `stage3_richtext` é a fonte de runtime por preservar marcações tipográficas auditadas.

## Recursos

- treino misto FAURGS;
- filtros por concurso, disciplina, tema e histórico;
- cronômetro e retomada automática da sessão;
- marcação de questões para revisão com motivo e nota;
- resultado por disciplina e relatório copiável;
- retreino dos erros;
- histórico salvo localmente no navegador;
- renderização segura de destaques tipográficos em enunciados, textos-base e alternativas;
- validação estrutural automática do banco no GitHub Actions;
- auditoria automática de marcadores de formatação;
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
node scripts/validate-bank.mjs
node scripts/audit-formatting.mjs
```
