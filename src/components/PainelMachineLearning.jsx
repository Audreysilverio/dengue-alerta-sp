
import React, { useEffect, useState } from 'react';
import { apiUrl } from '../config/api.js';

export default function PainelMachineLearning() {
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarResultado() {
      try {
        const resposta = await fetch(
          apiUrl('/api/dengue/resultado-modelo')
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(dados.erro || 'Erro ao carregar resultados.');
        }

        setResultado(dados);
      } catch (erro) {
        setErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarResultado();
  }, []);

  const numero = (valor) =>
    Number(valor).toLocaleString('pt-BR', {
      maximumFractionDigits: 2
    });

  if (carregando) {
    return <section className="panel">Carregando avaliação do modelo...</section>;
  }

  if (erro || !resultado) {
    return (
      <section className="panel">
        <h2>Avaliação do modelo</h2>
        <p>{erro || 'Resultados indisponíveis.'}</p>
      </section>
    );
  }

  return (
    <section className="panel ml-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">INTELIGÊNCIA ARTIFICIAL</span>
          <h2>Aprendizado de máquina</h2>
          <p>Experimento de previsão de notificações de dengue</p>
        </div>
        <span className="research-badge">RIDGE</span>
      </div>

      <div className="ml-description">
        Modelo de regressão Ridge treinado com dados históricos
        de notificações e variáveis climáticas de São Paulo.
      </div>

      <div className="ml-metrics">
        <div>
          <span>Registros de treinamento</span>
          <strong>{resultado.registrosTreinamento}</strong>
        </div>

        <div>
          <span>Registros de teste</span>
          <strong>{resultado.registrosTeste}</strong>
        </div>

        <div>
          <span>MAE — Ridge</span>
          <strong>{numero(resultado.metricas.ridge.mae)}</strong>
        </div>

        <div>
          <span>RMSE — Ridge</span>
          <strong>{numero(resultado.metricas.ridge.rmse)}</strong>
        </div>
      </div>

      <h3>Comparação das previsões</h3>

      <div className="ml-table-wrapper">
        <table className="ml-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Real</th>
              <th>Ridge</th>
              <th>Mês anterior</th>
            </tr>
          </thead>

          <tbody>
            {resultado.previsoes.map((item) => (
              <tr key={item.mes}>
                <td>{item.mes}</td>
                <td>{numero(item.real)}</td>
                <td>{numero(item.ridge)}</td>
                <td>{numero(item.mesAnterior)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <div className="ml-explanation">
        <h3>Entenda o modelo</h3>

        <p>
          O projeto utiliza aprendizado de máquina para investigar
          relações entre as notificações de dengue e as variáveis
          climáticas do município de São Paulo.
        </p>

        <div className="ml-explanation-grid">
          <article>
            <strong>Regressão Ridge</strong>
            <p>
              É um algoritmo de regressão que aprende padrões a partir
              dos dados históricos. Ele utiliza uma técnica de
              regularização para controlar os pesos das variáveis
              e reduzir o risco de excesso de ajuste aos dados.
            </p>
          </article>

          <article>
            <strong>MAE — Erro Absoluto Médio</strong>
            <p>
              Indica quanto a previsão errou, em média, em relação
              aos valores reais de notificações. Quanto menor,
              melhor o desempenho.
            </p>
          </article>

          <article>
            <strong>RMSE — Raiz do Erro Quadrático Médio</strong>
            <p>
              Mede o erro das previsões e penaliza mais os erros
              de maior magnitude. Quanto menor, melhor o desempenho.
            </p>
          </article>

          <article>
            <strong>Referência do mês anterior</strong>
            <p>
              É um método de comparação que utiliza a quantidade
              de notificações do mês anterior como estimativa
              para o mês seguinte. Ajuda a verificar se o modelo
              Ridge realmente acrescenta capacidade preditiva.
            </p>
          </article>
        </div>
      </div>

      <div className="ml-comparison">
        <p>
          <strong>MAE da referência do mês anterior:</strong>{' '}
          {numero(resultado.metricas.mesAnterior.mae)}
        </p>

        <p>
          <strong>RMSE da referência do mês anterior:</strong>{' '}
          {numero(resultado.metricas.mesAnterior.rmse)}
        </p>
      </div>


            
      <div className="ml-error-chart">
        <h3>Comparação visual dos erros</h3>

        <p>
          Quanto menor o erro, melhor o desempenho do método.
        </p>

        <div className="ml-error-group">
          <strong>MAE — Erro Absoluto Médio</strong>

          <div className="ml-error-row">
            <span>Ridge</span>
            <div className="ml-error-track">
              <div
                className="ml-error-fill ridge"
                style={{ width: '100%' }}
              />
            </div>
            <b>{numero(resultado.metricas.ridge.mae)}</b>
          </div>

          <div className="ml-error-row">
            <span>Mês anterior</span>
            <div className="ml-error-track">
              <div
                className="ml-error-fill anterior"
                style={{
                  width: `${
                    (resultado.metricas.mesAnterior.mae /
                    resultado.metricas.ridge.mae) * 100
                  }%`
                }}
              />
            </div>
            <b>{numero(resultado.metricas.mesAnterior.mae)}</b>
          </div>
        </div>

        <div className="ml-error-group">
          <strong>RMSE — Raiz do Erro Quadrático Médio</strong>

          <div className="ml-error-row">
            <span>Ridge</span>
            <div className="ml-error-track">
              <div
                className="ml-error-fill ridge"
                style={{ width: '100%' }}
              />
            </div>
            <b>{numero(resultado.metricas.ridge.rmse)}</b>
          </div>

          <div className="ml-error-row">
            <span>Mês anterior</span>
            <div className="ml-error-track">
              <div
                className="ml-error-fill anterior"
                style={{
                  width: `${
                    (resultado.metricas.mesAnterior.rmse /
                    resultado.metricas.ridge.rmse) * 100
                  }%`
                }}
              />
            </div>
            <b>{numero(resultado.metricas.mesAnterior.rmse)}</b>
          </div>
        </div>
      </div>


      <div className="ml-warning">
        <strong>Limitação da avaliação</strong>
        <p>{resultado.observacao}</p>
        <p>
          Nesta avaliação, a referência baseada nas notificações
          do mês anterior apresentou erro menor que a regressão Ridge.
          Portanto, o modelo ainda não demonstrou superioridade preditiva.
        </p>
      </div>

      <div className="chart-footnote">
        Fonte: Ministério da Saúde — SINAN/Dengue e INMET.
        Município de São Paulo, código 355030.
      </div>
    </section>
  );
}
