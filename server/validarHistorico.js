
const { obterBaseHistorica } = require('./baseHistorica');

async function validarHistorico() {
  const base = await obterBaseHistorica();
  const dados = base.dados;

  const mesesEsperados = [];

  // Gera os meses esperados de janeiro de 2024
  // até setembro de 2026.
  for (let ano = 2024; ano <= 2026; ano++) {
    const ultimoMes = ano === 2026 ? 9 : 12;

    for (let mes = 1; mes <= ultimoMes; mes++) {
      mesesEsperados.push(
        `${ano}-${String(mes).padStart(2, '0')}`
      );
    }
  }

  const mesesEncontrados = dados.map((item) => item.mes);

  const mesesDuplicados = mesesEncontrados.filter(
    (mes, indice) => mesesEncontrados.indexOf(mes) !== indice
  );

  const mesesFaltantes = mesesEsperados.filter(
    (mes) => !mesesEncontrados.includes(mes)
  );

  const mesesExtras = mesesEncontrados.filter(
    (mes) => !mesesEsperados.includes(mes)
  );

  const valoresInvalidos = dados.filter((item) =>
    !Number.isFinite(item.notificacoes) ||
    !Number.isFinite(item.precipitacao) ||
    !Number.isFinite(item.temperatura) ||
    !Number.isFinite(item.umidade) ||
    item.notificacoes < 0 ||
    item.precipitacao < 0
  );

  const resultado = {
    totalRegistros: dados.length,
    totalMesesEsperados: mesesEsperados.length,
    primeiroMes: mesesEncontrados[0],
    ultimoMes: mesesEncontrados[mesesEncontrados.length - 1],
    mesesDuplicados,
    mesesFaltantes,
    mesesExtras,
    valoresInvalidos,
    sequenciaCompleta:
      mesesDuplicados.length === 0 &&
      mesesFaltantes.length === 0 &&
      mesesExtras.length === 0
  };

  console.log('VALIDAÇÃO DA BASE HISTÓRICA');
  console.log(JSON.stringify(resultado, null, 2));
}

validarHistorico().catch((erro) => {
  console.error('Erro na validação:', erro);
});
