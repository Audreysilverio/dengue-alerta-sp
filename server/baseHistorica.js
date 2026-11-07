
const { obterBaseIntegrada } = require('./baseIntegrada');

async function obterBaseHistorica() {
  const anos = [2024, 2025, 2026];

  const bases = await Promise.all(
    anos.map((ano) => obterBaseIntegrada(ano))
  );

  const dados = bases
    .flatMap((base) => base.dados)
    .filter((registro) =>
      Number.isFinite(registro.notificacoes) &&
      Number.isFinite(registro.precipitacao) &&
      Number.isFinite(registro.temperatura) &&
      Number.isFinite(registro.umidade)
    )
    .sort((a, b) => a.mes.localeCompare(b.mes));

  return {
    fonte: 'Ministério da Saúde — SINAN/Dengue e INMET',
    municipio: 'São Paulo',
    codigoMunicipio: '355030',
    anosIncluidos: anos,
    quantidadeRegistros: dados.length,
    variaveis: [
      'notificacoes',
      'precipitacao',
      'temperatura',
      'umidade'
    ],
    dados
  };
}

module.exports = { obterBaseHistorica };

if (require.main === module) {
  obterBaseHistorica()
    .then((base) => {
      console.log('BASE HISTÓRICA INTEGRADA');
      console.log('Registros:', base.quantidadeRegistros);
      console.log('Primeiro registro:', base.dados[0]);
      console.log('Último registro:', base.dados[base.dados.length - 1]);
      console.log('Dados completos:');
      console.log(JSON.stringify(base, null, 2));
    })
    .catch((erro) => {
      console.error('Erro ao gerar base histórica:', erro);
    });
}
