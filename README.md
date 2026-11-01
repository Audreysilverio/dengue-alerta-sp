# Dengue Alerta SP — protótipo acadêmico

Projeto Integrador UNIVESP. Interface em React + Vite + JavaScript + Sass (SCSS).

## Requisitos
- Node.js 20.19+ ou 22.12+ (confira a versão exigida pela versão do Vite instalada)
- npm
- VS Code

## Executar localmente
1. Extraia a pasta `dengue-alerta-sp`.
2. Abra essa pasta no VS Code.
3. Abra o terminal integrado: **Terminal → Novo Terminal**.
4. Confira as versões: `node -v` e `npm -v`.
5. Instale as dependências: `npm install`.
6. Inicie a aplicação: `npm run dev`.
7. Abra no navegador o endereço local informado pelo Vite (normalmente `http://localhost:5173`).

## Gerar versão de produção
- `npm run build`
- `npm run preview`

## Estrutura
- `src/App.jsx`: estrutura da aplicação e navegação.
- `src/components/`: menu lateral, ícones e gráficos reutilizáveis.
- `src/pages/`: páginas Visão geral, Mapa, Análises, Tendências, Prevenção e Sobre.
- `src/data/dadosMock.js`: dados demonstrativos e percentuais informados da pesquisa comunitária.
- `src/styles/global.scss`: identidade visual e responsividade.

## Atenção acadêmica e metodológica
Os valores da série mensal são fictícios e servem apenas para demonstrar os gráficos. Os indicadores do painel aparecem como indisponíveis até integrar bases oficiais. O mapa é esquemático. Não usar o protótipo para afirmar risco atual ou distribuição real de casos.

Fontes previstas para investigação e integração: COVISA/Secretaria Municipal da Saúde de São Paulo, SINAN/Ministério da Saúde e INMET/BDMEP. Antes de publicar, validar licença, período, unidade territorial, definição de caso, data de extração, dados ausentes e compatibilidade entre fontes.
