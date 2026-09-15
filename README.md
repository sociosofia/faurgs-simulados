# Simulados FAURGS

Simulador estático de questões reais da banca FAURGS, baseado na experiência do projeto `ifsuldeminas-simulados` e mantido em repositório separado.

## Fonte canônica

`data/source/faurgs_ifsc_questoes_integrais_stage2.json`

O aplicativo lê diretamente esse JSON no navegador. Não há cópia manual do banco dentro do JavaScript.

## Recursos

- treino misto FAURGS;
- filtros por concurso, disciplina, tema e histórico;
- cronômetro e retomada automática da sessão;
- marcação de questões para revisão com motivo e nota;
- resultado por disciplina e relatório copiável;
- retreino dos erros;
- histórico salvo localmente no navegador;
- validação estrutural automática do banco no GitHub Actions;
- publicação preparada para GitHub Pages.

> O botão “Treino misto FAURGS” é um treino aleatório e não pretende reproduzir a composição oficial de um edital específico. Um modo IFSC oficial deve ser configurado depois do cotejamento com o edital correspondente.

## Validação local

```bash
node --check js/app.js
node scripts/validate-bank.mjs
```
