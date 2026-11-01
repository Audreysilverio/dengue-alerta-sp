
const { DuckDBInstance } = require('@duckdb/node-api');
const path = require('path');

async function consultar() {
  const arquivo = path.join(__dirname, 'DENGBR26.parquet')
    .replace(/\\/g, '/');

  const banco = await DuckDBInstance.create(':memory:');
  const conexao = await banco.connect();

  try {
    const consulta = `
      SELECT
        COUNT(*) AS totalNotificacoes,

        SUM(CASE
          WHEN CLASSI_FIN IN ('10', '11', '12')
          THEN 1 ELSE 0
        END) AS classificadasComoDengue,

        SUM(CASE
          WHEN CLASSI_FIN IN ('10', '11', '12')
            AND CRITERIO IN ('1', '2')
          THEN 1 ELSE 0
        END) AS confirmadasPorCriterio,

        SUM(CASE
          WHEN CLASSI_FIN = '11'
          THEN 1 ELSE 0
        END) AS dengueComSinaisDeAlarme,

        SUM(CASE
          WHEN CLASSI_FIN = '12'
          THEN 1 ELSE 0
        END) AS dengueGrave,

        SUM(CASE
          WHEN CLASSI_FIN IN ('10', '11', '12')
            AND CRITERIO = '3'
          THEN 1 ELSE 0
        END) AS emInvestigacao

      FROM read_parquet('${arquivo}')
      WHERE ID_MN_RESI = 355030
        AND DT_NOTIFIC IS NOT NULL
    `;

    const resultado = await conexao.run(consulta);
    const linhas = await resultado.getRows();

    console.table(linhas);
  } finally {
    conexao.closeSync();
  }
}

consultar().catch(console.error);
