
const { obterBaseHistorica } = require('./baseHistorica');

function calcularEstatisticas(valores) {
  const ordenados = [...valores].sort((a, b) => a - b);
  const soma = valores.reduce((total, valor) => total + valor, 0);

  return {
    media: Number((soma / valores.length).toFixed(2)),
    minimo: Number(ordenados[0].toFixed(2)),
    maximo: Number(ordenados[ordenados.length - 1].toFixed(2))
  };
}

function calcularCorrelacao(lista, variavelX, variavelY) {
  const n = lista.length;

  const valoresX = lista.map((item) => item[variavelX]);
  const valoresY = lista.map((item) => item[variavelY]);

  const mediaX = valoresX.reduce((a, b) => a + b, 0) / n;
  const mediaY = valoresY.reduce((a, b) => a + b, 0) / n;

  let numerador = 0;
  let somaQuadradosX = 0;
  let somaQuadradosY = 0;

  for (let i = 0; i < n; i++) {
    const diferencaX = valoresX[i] - mediaX;
    const diferencaY = valoresY[i] - mediaY;

    numerador += diferencaX * diferencaY;
    somaQuadradosX += diferencaX ** 2;
    somaQuadradosY += diferencaY ** 2;
  }

  const denominador = Math.sqrt(somaQuadradosX * somaQuadradosY);

  if (denominador === 0) return null;

  return Number((numerador / denominador).toFixed(3));
}

function analisarDefasagem(dados, variavel) {
  const pares = [];

  for (let i = 1; i < dados.length; i++) {
    pares.push({
      notificacoes: dados[i].notificacoes,
      climaAnterior: dados[i - 1][variavel]
    });
  }

  return calcularCorrelacao(
    pares,
    'climaAnterior',
    'notificacoes'
  );
}

async function analisarBaseHistorica() {
  const base = await obterBaseHistorica();
  const dados = base.dados;

  const estatisticas = {
    notificacoes: calcularEstatisticas(
      dados.map((item) => item.notificacoes)
    ),
    precipitacao: calcularEstatisticas(
      dados.map((item) => item.precipitacao)
    ),
    temperatura: calcularEstatisticas(
      dados.map((item) => item.temperatura)
    ),
    umidade: calcularEstatisticas(
      dados.map((item) => item.umidade)
    )
  };

  const correlacoes = {
    chuva: calcularCorrelacao(dados, 'precipitacao', 'notificacoes'),
    temperatura: calcularCorrelacao(dados, 'temperatura', 'notificacoes'),
    umidade: calcularCorrelacao(dados, 'umidade', 'notificacoes')
  };

  const correlacoesDefasadas = {
    chuvaMesAnterior: analisarDefasagem(dados, 'precipitacao'),
    temperaturaMesAnterior: analisarDefasagem(dados, 'temperatura'),
    umidadeMesAnterior: analisarDefasagem(dados, 'umidade')
  };

  const comparacaoAnual = [2024, 2025, 2026].map((ano) => {
    const registros = dados.filter((item) =>
      item.mes.startsWith(String(ano))
    );

    const total = registros.reduce(
      (soma, item) => soma + item.notificacoes,
      0
    );

    return {
      ano,
      quantidadeMeses: registros.length,
      totalNotificacoes: total,
      mediaMensal: Number((total / registros.length).toFixed(2))
    };
  });

  return {
    quantidadeRegistros: dados.length,
    estatisticas,
    correlacoes,
    correlacoesDefasadas,
    comparacaoAnual
  };
}

module.exports = { analisarBaseHistorica };

if (require.main === module) {
  analisarBaseHistorica()
    .then((resultado) => {
      console.log('ANÁLISE EXPLORATÓRIA — DENGUE ALERTA SP');
      console.log(JSON.stringify(resultado, null, 2));
    })
    .catch((erro) => {
      console.error('Erro na análise histórica:', erro);
    });
}
