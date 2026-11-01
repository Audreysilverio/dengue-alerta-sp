
const indicadores = {
  dengue: {
    nome: 'Casos de dengue',
    fonte: 'Ministério da Saúde / COVISA',
    unidade: 'casos',
    atualizadoEm: null,
    periodo: null,
    dados: [],
    status: 'aguardando_conexao',
  },

  chuva: {
    nome: 'Precipitação',
    fonte: 'INMET',
    unidade: 'mm',
    atualizadoEm: null,
    periodo: null,
    dados: [],
    status: 'aguardando_conexao',
  },

  temperatura: {
    nome: 'Temperatura',
    fonte: 'INMET',
    unidade: '°C',
    atualizadoEm: null,
    periodo: null,
    dados: [],
    status: 'aguardando_conexao',
  },
};

function obterIndicadores() {
  return indicadores;
}

module.exports = { obterIndicadores };
