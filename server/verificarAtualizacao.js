
const { DuckDBInstance } = require('@duckdb/node-api');
const path = require('path');

async function verificar() {
  const db = await DuckDBInstance.create(':memory:');
  const conexao = await db.connect();
  const arquivo = path.join(__dirname, 'DENGBR26.parquet')
    .replace(/\\/g, '/');

  try {
    const consulta = `
      SELECT
        MAX(DT_NOTIFIC) AS ultima_data,
        COUNT(*) AS registros
      FROM read_parquet('${arquivo}')
      WHERE ID_MN_RESI = 355030
    `;

    const resultado = await conexao.run(consulta);
    console.log('Resumo:', await resultado.getRows());

    const consultaDias = `
      SELECT
        DT_NOTIFIC,
        COUNT(*) AS total
      FROM read_parquet('${arquivo}')
      WHERE ID_MN_RESI = 355030
      GROUP BY DT_NOTIFIC
      ORDER BY DT_NOTIFIC DESC
      LIMIT 10
    `;

    const ultimosDias = await conexao.run(consultaDias);
    console.log('Últimos dias:', await ultimosDias.getRows());
  } finally {
    conexao.closeSync();
  }
}

verificar().catch(console.error);
