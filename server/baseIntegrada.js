
const { obterResumoMensal } = require('./servicoDengue');

const {
  resumoChuva,
  resumoTemperatura,
  resumoUmidade,
} = require('./clima');

// Calcula a média dos valores das estações por mês
function consolidarEstacoes(estacoes, campo) {
  const valoresMensais = {};

  for (const estacao of estacoes) {
    for (const item of estacao.resumoMensal) {
      const valor = Number(item[campo]);

      if (!Number.isFinite(valor)) continue;

      if (!valoresMensais[item.mes]) {
        valoresMensais[item.mes] = [];
      }

      valoresMensais[item.mes].push(valor);
    }
  }

  const resultado = {};

  for (const [mes, valores] of Object.entries(valoresMensais)) {
    resultado[mes] =
      valores.reduce((soma, valor) => soma + valor, 0) /
      valores.length;
  }

  return resultado;
}

// Monta a base epidemiológica e meteorológica
async function obterBaseIntegrada(ano = 2026) {
  const dengue = await obterResumoMensal(ano);

const chuva = resumoChuva(ano);
const temperatura = resumoTemperatura(ano);
const umidade = resumoUmidade(ano);

  const mediasChuva = consolidarEstacoes(
    chuva.estacoes,
    'precipitacao'
  );

  const mediasTemperatura = consolidarEstacoes(
    temperatura.estacoes,
    'temperatura'
  );

  const mediasUmidade = consolidarEstacoes(
    umidade.estacoes,
    'umidade'
  );

  const dados = dengue.resumoMensal.map((item) => ({
    mes: item.mes,
    notificacoes: item.notificacoes,

    precipitacao:
      mediasChuva[item.mes] ?? null,

    temperatura:
      mediasTemperatura[item.mes] ?? null,

    umidade:
      mediasUmidade[item.mes] ?? null,
  }));

  return {
    fonteEpidemiologica: dengue.fonte,
    fonteMeteorologica: chuva.fonte,
    municipio: dengue.municipio,
    codigoMunicipio: dengue.codigoMunicipioResidencia,
    ano,

    variaveis: [
      'notificacoes',
      'precipitacao',
      'temperatura',
      'umidade',
    ],

    quantidadeRegistros: dados.length,
    dados,
  };
}

module.exports = { obterBaseIntegrada };
