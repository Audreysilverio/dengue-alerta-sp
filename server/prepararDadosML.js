
const fs = require('fs');
const path = require('path');

const { obterBaseHistorica } = require('./baseHistorica');

async function prepararDadosML() {
  const base = await obterBaseHistorica();
  const dados = base.dados;

  const registros = [];

  for (let i = 1; i < dados.length; i++) {
    const atual = dados[i];
    const anterior = dados[i - 1];

    registros.push({
      mes: atual.mes,

      // Variáveis de entrada
      mesDoAno: Number(atual.mes.split('-')[1]),
      chuvaAnterior: anterior.precipitacao,
      temperaturaAnterior: anterior.temperatura,
      umidadeAnterior: anterior.umidade,
      notificacoesAnteriores: anterior.notificacoes,

      // Valor que o modelo deverá aprender a prever
      notificacoes: atual.notificacoes
    });
  }

  const caminhoArquivo = path.join(
    __dirname,
    'dados',
    'base_ml.json'
  );

  fs.mkdirSync(path.dirname(caminhoArquivo), {
    recursive: true
  });

  fs.writeFileSync(
    caminhoArquivo,
    JSON.stringify(registros, null, 2),
    'utf8'
  );

  console.log('BASE PREPARADA PARA MACHINE LEARNING');
  console.log('Registros preparados:', registros.length);
  console.log('Variáveis de entrada: 5');
  console.log('Variável prevista: notificacoes');
  console.log('Arquivo gerado:', caminhoArquivo);
  console.log('Primeiro registro:', registros[0]);
  console.log('Último registro:', registros[registros.length - 1]);
}

module.exports = { prepararDadosML };

if (require.main === module) {
  prepararDadosML().catch((erro) => {
    console.error('Erro ao preparar os dados:', erro);
  });
}
