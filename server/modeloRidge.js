
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

function executarModelo() {
  const caminho = path.join(__dirname, 'dados', 'base_ml.json');
  const dados = JSON.parse(fs.readFileSync(caminho, 'utf8'));

  const treino = dados.slice(0, 24);
  const teste = dados.slice(24);

  const escala = prepararEscala(treino);

  const X = new Matrix(transformar(treino, escala));

  const y = Matrix.columnVector(
    treino.map((item) => Math.log1p(item.notificacoes))
  );

  const XTeste = new Matrix(transformar(teste, escala));
  const reais = teste.map((item) => item.notificacoes);

  const lambdas = [1, 10, 100];

  console.log('COMPARAÇÃO DE REGULARIZAÇÃO — RIDGE');
  console.log('Treinamento:', treino.length);
  console.log('Teste:', teste.length);

  for (const lambda of lambdas) {
    const identidade = Matrix.eye(X.columns);
    identidade.set(0, 0, 0);

    const coeficientes = inverse(
      X.transpose().mmul(X).add(identidade.mul(lambda))
    )
      .mmul(X.transpose())
      .mmul(y);

    const previsoesLog = XTeste.mmul(coeficientes).to1DArray();

    const previstos = previsoesLog.map((valor) =>
      Math.max(0, Math.expm1(valor))
    );

    console.log(`\nLambda: ${lambda}`);
    console.log('MAE:', calcularMAE(reais, previstos).toFixed(2));
    console.log('RMSE:', calcularRMSE(reais, previstos).toFixed(2));

    teste.forEach((item, i) => {
      console.log({
        mes: item.mes,
        real: reais[i],
        previsto: Math.round(previstos[i])
      });
    });
  }
}

executarModelo();
