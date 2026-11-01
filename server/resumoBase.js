
const { DuckDBInstance } = require('@duckdb/node-api');
const path = require('path');

async function consultarBase() {
  const arquivo = path.join(__dirname, 'DENGBR26.parquet');
  const db = await DuckDBInstance.create(':memory:');
  const conexao = await db.connect();

  try {
    console.log('\n=== PERÍODO DA BASE ===');

    let resultado = await conexao.run(`
      SELECT
        COUNT(*) AS total_registros,
        MIN(DT_NOTIFIC) AS primeira_data,
        MAX(DT_NOTIFIC) AS ultima_data
      FROM read_parquet('${arquivo.replace(/\\/g, '/')}')
    `);

    console.log(await resultado.getRows());

    console.log('\n=== RESIDENTES DE SÃO PAULO POR MÊS ===');

    resultado = await conexao.run(`
      SELECT
        strftime(DT_NOTIFIC, '%Y-%m') AS mes,
        COUNT(*) AS notificacoes
      FROM read_parquet('${arquivo.replace(/\\/g, '/')}')
      WHERE ID_MN_RESI = 355030
      GROUP BY mes
      ORDER BY mes
    `);

    console.log(await resultado.getRows());

    console.log('\n=== CLASSIFICAÇÃO FINAL ===');

    resultado = await conexao.run(`
      SELECT
        CLASSI_FIN,
        COUNT(*) AS quantidade
      FROM read_parquet('${arquivo.replace(/\\/g, '/')}')
      WHERE ID_MN_RESI = 355030
      GROUP BY CLASSI_FIN
      ORDER BY quantidade DESC
    `);

    console.log(await resultado.getRows());
  } finally {
    conexao.closeSync();
  }
}

consultarBase().catch((erro) => {
  console.error('Erro na consulta:', erro);
});
