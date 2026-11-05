
const fs = require('fs');
const path = require('path');

const pastaDados = path.join(__dirname, 'dados');

const estacoes = [
  {
    codigo: 'A701',
    nome: 'Mirante de Santana',
    arquivo: 'chuva-mirante-2026.CSV',
  },
  {
    codigo: 'A771',
    nome: 'Interlagos',
    arquivo: 'chuva-interlagos-2026.CSV',
  },
];

function lerDadosMensais(arquivo) {
  const caminho = path.join(pastaDados, arquivo);

  if (!fs.existsSync(caminho)) {
    throw new Error(`Arquivo meteorológico não encontrado: ${arquivo}`);
  }

  const linhas = fs.readFileSync(caminho, 'latin1').split(/\r?\n/);

  const indiceCabecalho = linhas.findIndex((linha) =>
    linha.startsWith('Data;Hora UTC;')
  );

  if (indiceCabecalho === -1) {
    throw new Error(`Cabeçalho não encontrado em ${arquivo}`);
  }

  const cabecalho = linhas[indiceCabecalho].split(';');
  const indiceData = cabecalho.indexOf('Data');

  const indicePrecipitacao = cabecalho.findIndex((coluna) =>
    coluna.includes('PRECIPITAÇÃO TOTAL, HORÁRIO')
  );

  const indiceTemperatura = cabecalho.findIndex((coluna) =>
    coluna.includes('TEMPERATURA DO AR - BULBO SECO, HORARIA')
  );

  const indiceUmidade = cabecalho.findIndex((coluna) =>
    coluna.includes('UMIDADE RELATIVA DO AR, HORARIA')
  );

  if (indiceData === -1 || indicePrecipitacao === -1) {
    throw new Error(`Colunas de data ou precipitação ausentes em ${arquivo}`);
  }

  const acumulados = {};

  for (const linha of linhas.slice(indiceCabecalho + 1)) {
    if (!linha.trim()) continue;

    const colunas = linha.split(';');
    const data = colunas[indiceData];

    if (!data || !/^\d{4}\/\d{2}\/\d{2}$/.test(data)) continue;

    const mes = data.slice(0, 7).replace('/', '-');

    if (!acumulados[mes]) {
      acumulados[mes] = {
        precipitacao: 0,
        temperaturas: [],
        umidades: [],
      };
    }

    const valorChuvaBruto = colunas[indicePrecipitacao];
    const valorChuva = Number(valorChuvaBruto?.replace(',', '.'));

    if (
      valorChuvaBruto &&
      Number.isFinite(valorChuva) &&
      valorChuva >= 0 &&
      valorChuva < 9999
    ) {
      acumulados[mes].precipitacao += valorChuva;
    }

    if (indiceTemperatura !== -1) {
      const valorTemperaturaBruto = colunas[indiceTemperatura];
      const valorTemperatura = Number(valorTemperaturaBruto?.replace(',', '.'));

      if (
        valorTemperaturaBruto &&
        Number.isFinite(valorTemperatura) &&
        valorTemperatura > -100 &&
        valorTemperatura < 100
      ) {
        acumulados[mes].temperaturas.push(valorTemperatura);
      }
    }

    if (indiceUmidade !== -1) {
      const valorUmidadeBruto = colunas[indiceUmidade];
      const valorUmidade = Number(valorUmidadeBruto?.replace(',', '.'));

      if (
        valorUmidadeBruto &&
        Number.isFinite(valorUmidade) &&
        valorUmidade >= 0 &&
        valorUmidade <= 100
      ) {
        acumulados[mes].umidades.push(valorUmidade);
      }
    }
  }

  return Object.entries(acumulados).map(([mes, valores]) => ({
    mes,
    precipitacao: Math.round(valores.precipitacao * 10) / 10,
    temperatura:
      valores.temperaturas.length > 0
        ? Math.round(
            (valores.temperaturas.reduce((total, valor) => total + valor, 0) /
              valores.temperaturas.length) *
              10
          ) / 10
        : null,
    umidade:
      valores.umidades.length > 0
        ? Math.round(
            (valores.umidades.reduce((total, valor) => total + valor, 0) /
              valores.umidades.length) *
              10
          ) / 10
        : null,
  }));
}

function resumoChuva() {
  return {
    fonte: 'INMET — estações meteorológicas automáticas',
    ano: 2026,
    unidade: 'mm',
    estacoes: estacoes.map((estacao) => ({
      codigo: estacao.codigo,
      nome: estacao.nome,
      resumoMensal: lerDadosMensais(estacao.arquivo).map((item) => ({
        mes: item.mes,
        precipitacao: item.precipitacao,
      })),
    })),
  };
}

function resumoTemperatura() {
  return {
    fonte: 'INMET — estações meteorológicas automáticas',
    ano: 2026,
    unidade: '°C',
    estacoes: estacoes.map((estacao) => ({
      codigo: estacao.codigo,
      nome: estacao.nome,
      resumoMensal: lerDadosMensais(estacao.arquivo).map((item) => ({
        mes: item.mes,
        temperatura: item.temperatura,
      })),
    })),
  };
}

function resumoUmidade() {
  return {
    fonte: 'INMET — estações meteorológicas automáticas',
    ano: 2026,
    unidade: '%',
    estacoes: estacoes.map((estacao) => ({
      codigo: estacao.codigo,
      nome: estacao.nome,
      resumoMensal: lerDadosMensais(estacao.arquivo).map((item) => ({
        mes: item.mes,
        umidade: item.umidade,
      })),
    })),
  };
}

module.exports = { resumoChuva, resumoTemperatura, resumoUmidade };
