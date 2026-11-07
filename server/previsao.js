function calcularPrevisao(resumoMensal, mesesFuturos = 3) {
  // Considera somente meses completos, excluindo o mês atual/incompleto.
  const dados = resumoMensal
    .filter((item) => item.mes !== '2026-10')
    .filter((item) => Number.isFinite(item.notificacoes));

  if (dados.length < 3) {
    throw new Error('São necessários pelo menos três meses completos.');
  }

  const ultimosMeses = dados.slice(-3);

  const media =
    ultimosMeses.reduce(
      (soma, item) => soma + item.notificacoes,
      0
    ) / ultimosMeses.length;

  const previsoes = [];

  for (let i = 1; i <= mesesFuturos; i++) {
    previsoes.push({
      periodo: `Mês +${i}`,
      notificacoesEstimadas: Math.round(media),
    });
  }

  return {
    metodo: 'Média móvel simples dos últimos três meses completos',
    mesesUtilizados: ultimosMeses.map((item) => item.mes),
    previsoes,
    aviso:
      'Estimativa exploratória baseada na média dos três últimos meses completos. ' +
      'Não representa previsão epidemiológica oficial e não considera sazonalidade, ' +
      'clima, subnotificação ou outros fatores.',
  };
}

module.exports = { calcularPrevisao };