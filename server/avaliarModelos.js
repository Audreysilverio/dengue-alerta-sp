
const fs = require('fs');
const path = require('path');
const { Matrix, inverse } = require('ml-matrix');

const variaveis = [
  'mesDoAno',
  'chuvaAnterior',
  'temperaturaAnterior',
  'umidadeAnterior',
  'notificacoesAnteriores'
];

function calcularMAE(reais, previstos) {
  return reais.reduce(
    (soma, real, i) => soma + Math.abs(real - previstos[i]),
    0
  ) / reais.length;
}

function calcularRMSE(reais, previstos) {
  return Math.sqrt(
    reais.reduce(
      (soma, real, i) => soma + (real - previstos[i]) ** 2,
      0
    ) / reais.length
  );
}

function prepararEscala(treino) {
  return variaveis.map((variavel) => {
    const valores = treino.map((item) => item[variavel]);
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;

    const variancia = valores.reduce(
      (soma, valor) => soma + (valor - media) ** 2,
      0
    ) / valores.length;

    return {
      variavel,
      media,
      desvio: Math.sqrt(variancia) || 1
    };
  });
}

function transformar(dados, escala) {
  return dados.map((item) => [
    1,
    ...escala.map(({ variavel, media, desvio }) =>
      (item[variavel] - media) / desvio
    )
  ]);
}

function executarAvaliacao() {
  const caminho = path.join(__dirname, 'dados', 'base_ml.json');
  const dados = JSON.parse(fs.readFileSync(caminho, 'utf8'));

  const treino = dados.slice(0, 24);
  const teste = dados.slice(24);

  const reais = teste.map((item) => item.notificacoes);

  // Referência: repetir notificações do mês anterior.
  const previsaoAnterior = teste.map(
    (item) => item.notificacoesAnteriores
  );

  const escala = prepararEscala(treino);
  const X = new Matrix(transformar(treino, escala));
  const y = Matrix.columnVector(
    treino.map((item) => Math.log1p(item.notificacoes))
  );

  const XTeste = new Matrix(transformar(teste, escala));

  const lambda = 1;
  const identidade = Matrix.eye(X.columns);
  identidade.set(0, 0, 0);

  const coeficientes = inverse(
    X.transpose().mmul(X).add(identidade.mul(lambda))
  )
    .mmul(X.transpose())
    .mmul(y);

  const previstosRidge = XTeste.mmul(coeficientes)
    .to1DArray()
    .map((valor) => Math.max(0, Math.expm1(valor)));

  const resultado = {
    fonte: 'Ministério da Saúde — SINAN/Dengue e INMET',
    municipio: 'São Paulo',
    codigoMunicipio: '355030',
    algoritmo: 'Regressão Ridge',
    regularizacao: lambda,
    totalRegistros: dados.length,
    registrosTreinamento: treino.length,
    registrosTeste: teste.length,
    observacao: 'Avaliação exploratória temporal; resultados não representam previsão operacional validada.',
    metricas: {
      ridge: {
        mae: Number(calcularMAE(reais, previstosRidge).toFixed(2)),
        rmse: Number(calcularRMSE(reais, previstosRidge).toFixed(2))
      },
      mesAnterior: {
        mae: Number(calcularMAE(reais, previsaoAnterior).toFixed(2)),
        rmse: Number(calcularRMSE(reais, previsaoAnterior).toFixed(2))
      }
    },
    previsoes: teste.map((item, i) => ({
      mes: item.mes,
      real: reais[i],
      ridge: Math.round(previstosRidge[i]),
      mesAnterior: previsaoAnterior[i]
    }))
  };

  const destino = path.join(__dirname, 'dados', 'resultado_modelo.json');

  fs.writeFileSync(
    destino,
    JSON.stringify(resultado, null, 2),
    'utf8'
  );

  console.log('AVALIAÇÃO FINAL GERADA');
  console.log(JSON.stringify(resultado, null, 2));
  console.log('\nArquivo salvo:', destino);
}

executarAvaliacao();
