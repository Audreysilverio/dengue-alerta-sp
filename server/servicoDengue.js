
const { DuckDBInstance } = require('@duckdb/node-api');
const path = require('path');

const arquivo = path.join(__dirname, 'DENGBR26.parquet')
  .replace(/\\/g, '/');

async function obterResumoMensal(ano = 2026) {
  if (!Number.isInteger(ano) || ano !== 2026) {
    throw new Error(
      'Esta base local contém somente os dados de 2026.'
    );
  }

  const banco = await DuckDBInstance.create(':memory:');
  const conexao = await banco.connect();

  try {
    // Notificações agrupadas por mês
    const consulta = `
      SELECT
        strftime(DT_NOTIFIC, '%Y-%m') AS mes,
        COUNT(*) AS notificacoes
      FROM read_parquet('${arquivo}')
      WHERE ID_MN_RESI = 355030
        AND DT_NOTIFIC IS NOT NULL
      GROUP BY mes
      ORDER BY mes
    `;

    const resultado = await conexao.run(consulta);
    const linhas = await resultado.getRows();

    const resumoMensal = linhas.map(([mes, notificacoes]) => ({
      mes,
      notificacoes: Number(notificacoes),
    }));

    // Primeira data, última data e total
    const consultaData = `
      SELECT
        MIN(DT_NOTIFIC) AS primeiraData,
        MAX(DT_NOTIFIC) AS ultimaData,
        COUNT(*) AS totalNotificacoes
      FROM read_parquet('${arquivo}')
      WHERE ID_MN_RESI = 355030
        AND DT_NOTIFIC IS NOT NULL
    `;

    const resultadoData = await conexao.run(consultaData);

    const [primeiraData, ultimaData, total] =
      (await resultadoData.getRows())[0];

    // Indicadores epidemiológicos
    const consultaIndicadores = `
      SELECT
        SUM(CASE
          WHEN CLASSI_FIN IN ('10', '11', '12')
          THEN 1 ELSE 0
        END) AS classificadasComoDengue,

        SUM(CASE
          WHEN CLASSI_FIN IN ('10', '11', '12')
            AND CRITERIO IN ('1', '2')
          THEN 1 ELSE 0
        END) AS criteriosLaboratorialOuClinico,

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

    const resultadoIndicadores =
      await conexao.run(consultaIndicadores);

    const [
      classificadasComoDengue,
      criteriosLaboratorialOuClinico,
      dengueComSinaisDeAlarme,
      dengueGrave,
      emInvestigacao,
    ] = (await resultadoIndicadores.getRows())[0];

    // Distribuição das classificações
    const consultaClassificacao = `
      SELECT
        CAST(CLASSI_FIN AS VARCHAR) AS classificacao,
        COUNT(*) AS total
      FROM read_parquet('${arquivo}')
      WHERE ID_MN_RESI = 355030
        AND DT_NOTIFIC IS NOT NULL
      GROUP BY CLASSI_FIN
      ORDER BY CLASSI_FIN
    `;

    const resultadoClassificacao =
      await conexao.run(consultaClassificacao);

    const linhasClassificacao =
      await resultadoClassificacao.getRows();

    const distribuicaoClassificacao = linhasClassificacao.map(
      ([classificacao, quantidade]) => ({
        classificacao: classificacao ?? 'Não informado',
        total: Number(quantidade),
      })
    );

    return {
      fonte: 'Ministério da Saúde — SINAN/Dengue',
      municipio: 'São Paulo',
      criterio: 'Município de residência',
      codigoMunicipioResidencia: 355030,
      ano,

      indicador: 'Notificações por data de notificação',

      totalNotificacoes: Number(total),
      primeiraData: String(primeiraData),
      ultimaData: String(ultimaData),

      resumoMensal,

      indicadores: {
        classificadasComoDengue: Number(classificadasComoDengue),
        criteriosLaboratorialOuClinico:
          Number(criteriosLaboratorialOuClinico),
        dengueComSinaisDeAlarme:
          Number(dengueComSinaisDeAlarme),
        dengueGrave: Number(dengueGrave),
        emInvestigacao: Number(emInvestigacao),
      },

      distribuicaoClassificacao,

      aviso:
        'Notificações não equivalem necessariamente a casos confirmados. ' +
        'Os indicadores seguem os filtros de classificação e critério ' +
        'aplicados à base local. A base precisa ser atualizada para ' +
        'refletir novas publicações.',
    };
  } finally {
    conexao.closeSync();
  }
}

module.exports = { obterResumoMensal };
