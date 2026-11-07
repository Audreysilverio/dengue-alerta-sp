import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { pesquisaComunidade } from '../data/dadosMock.js';
import { LineChart, BarChart } from '../components/Charts.jsx';
import MapaInterativo from '../components/MapaInterativo.jsx';
import { apiUrl } from '../config/api.js';

const pageContent = {

  mapa: {

    icon: 'map',

    kicker: 'TERRITÓRIO',

    title: 'Mapa territorial',

    intro:

      'Uma leitura espacial ajuda a localizar informações e a planejar ações de prevenção. O mapa abaixo é ilustrativo e não representa a distribuição real de casos.',

  },

  analises: {

    icon: 'chart',

    kicker: 'EXPLORAÇÃO DE DADOS',

    title: 'Análises',

    intro:

      'Explore a evolução mensal das notificações de dengue em São Paulo, acompanhe as classificações epidemiológicas e consulte informações ambientais.',

  },

  tendencias: {

    icon: 'trend',

    kicker: 'SÉRIES E CENÁRIOS',

    title: 'Tendências',

    intro:
      
      'Explore a evolução mensal das notificações de dengue e consulte uma estimativa exploratória baseada nos últimos meses completos.',

},

  prevencao: {

    icon: 'shield',

    kicker: 'INFORMAÇÃO EM SAÚDE',

    title: 'Prevenção da dengue',

    intro:

      'Medidas práticas para reduzir criadouros do mosquito e reconhecer sinais que exigem atenção.',

  },

  sobre: {

    icon: 'info',

    kicker: 'PROJETO INTEGRADOR',

    title: 'Sobre o Dengue Alerta SP',

    intro:

      'Plataforma acadêmica para explorar a integração entre informações epidemiológicas, clima e território e apoiar o acesso a informações de prevenção.',

  },

};

function formatarMes(mes) {

  const [ano, numeroMes] = mes.split('-');

  const data = new Date(Number(ano), Number(numeroMes) - 1, 1);

  return data

    .toLocaleDateString('pt-BR', { month: 'short' })

    .replace('.', '');

}

export default function GenericPage({ page, onNavigate, year, area }) {

const [dadosDengue, setDadosDengue] = useState(null);

const [carregando, setCarregando] = useState(false);

const [erro, setErro] = useState('');

const [dadosChuva, setDadosChuva] = useState(null);

const [carregandoChuva, setCarregandoChuva] = useState(false);

const [erroChuva, setErroChuva] = useState('');

const [dadosTemperatura, setDadosTemperatura] = useState(null);

const [carregandoTemperatura, setCarregandoTemperatura] = useState(false);

const [erroTemperatura, setErroTemperatura] = useState('');

const [tarefasConcluidas, setTarefasConcluidas] = useState([]);

const [dadosUmidade, setDadosUmidade] = useState(null);

const [carregandoUmidade, setCarregandoUmidade] = useState(false);

const [erroUmidade, setErroUmidade] = useState('');

const [dadosPrevisao, setDadosPrevisao] = useState(null);

const [carregandoPrevisao, setCarregandoPrevisao] = useState(false);

const [erroPrevisao, setErroPrevisao] = useState(''); 

// Busca os dados de dengue

  useEffect(() => {

    if (page !== 'analises' && page !== 'tendencias') return;

    let ativo = true;

    async function carregarDados() {

      setCarregando(true);

      setErro('');

      try {

       const resposta = await fetch(apiUrl(`/api/dengue/resumo-mensal?ano=${year}`));

        const resultado = await resposta.json();

        if (!resposta.ok) {

          throw new Error(resultado.erro || 'Erro ao consultar dados.');

        }

        if (ativo) {

          setDadosDengue(resultado);

        }

      } catch (erroConsulta) {

        if (ativo) {

          setErro('Não foi possível carregar os dados epidemiológicos.');

        }

      } finally {

        if (ativo) setCarregando(false);

      }

    }

    carregarDados();

    return () => {

      ativo = false;

    };

  }, [page, year]);

  useEffect(() => {
  if (page !== 'tendencias') return;

  let ativo = true;

  async function carregarPrevisao() {
    setCarregandoPrevisao(true);
    setErroPrevisao('');

    try {
      const resposta = await fetch(apiUrl('/api/dengue/previsao'));
      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(resultado.erro || 'Erro ao consultar previsão.');
      }

      if (ativo) {
        setDadosPrevisao(resultado);
      }
    } catch (erroConsulta) {
      if (ativo) {
        setErroPrevisao('Não foi possível carregar a estimativa.');
      }
    } finally {
      if (ativo) {
        setCarregandoPrevisao(false);
      }
    }
  }

  carregarPrevisao();

  return () => {
    ativo = false;
  };
}, [page]);



// Busca os dados mensais de umidade relativa do INMET

useEffect(() => {

  if (page !== 'analises') return;

  let ativo = true;

  async function carregarUmidade() {

    setCarregandoUmidade(true);

    setErroUmidade('');

    try {

     const resposta = await fetch(
  apiUrl('/api/clima/umidade-mensal')
);

      const resultado = await resposta.json();

      if (!resposta.ok) {

        throw new Error(resultado.erro || 'Erro ao consultar dados de umidade.');

      }

      if (ativo) setDadosUmidade(resultado);

    } catch (erroConsulta) {

      if (ativo) {

        setErroUmidade('Não foi possível carregar os dados de umidade.');

      }

    } finally {

      if (ativo) setCarregandoUmidade(false);

    }

  }

  carregarUmidade();

  return () => {

    ativo = false;

  };

}, [page]);

  // Busca os dados reais de chuva do INMET

  useEffect(() => {

    if (page !== 'analises') return;

    let ativo = true;

    async function carregarChuva() {

      setCarregandoChuva(true);

      setErroChuva('');

      try {

       const resposta = await fetch(
  apiUrl('/api/clima/resumo-mensal')
);

        const resultado = await resposta.json();

        if (!resposta.ok) {

          throw new Error(

            resultado.erro || 'Erro ao consultar dados de chuva.'

          );

        }

        if (ativo) {

          setDadosChuva(resultado);

        }

      } catch (erroConsulta) {

        if (ativo) {

          setErroChuva('Não foi possível carregar os dados de chuva.');

        }

      } finally {

        if (ativo) setCarregandoChuva(false);

      }

    }

    carregarChuva();

    return () => {

      ativo = false;

    };

  }, [page]);

  useEffect(() => {

    if (page !== 'analises') return;

    let ativo = true;

    async function carregarTemperatura() {

      setCarregandoTemperatura(true);

      setErroTemperatura('');

      try {

        const resposta = await fetch(
  apiUrl('/api/clima/temperatura-mensal')
);

        const resultado = await resposta.json();

        if (!resposta.ok) throw new Error(resultado.erro || 'Erro ao consultar dados de temperatura.');

        if (ativo) setDadosTemperatura(resultado);

      } catch (erroConsulta) {

        if (ativo) setErroTemperatura('Não foi possível carregar os dados de temperatura.');

      } finally {

        if (ativo) setCarregandoTemperatura(false);

      }

    }

    carregarTemperatura();

    return () => { ativo = false; };

  }, [page]);

  const c = pageContent[page] || pageContent.sobre;

  // Estação A701 — Mirante de Santana

  const chuvaMirante = dadosChuva?.estacoes?.find(

    (estacao) => estacao.codigo === 'A701'

  );

  const dadosGraficoChuva = chuvaMirante?.resumoMensal
    ? chuvaMirante.resumoMensal
        .map((item) => ({
          mes: formatarMes(item.mes),
          chuva: Number(item.precipitacao),
        }))
        .filter((item) => Number.isFinite(item.chuva))
    : [];

  const temperaturaMirante = dadosTemperatura?.estacoes?.find(

    (estacao) => estacao.codigo === 'A701'

  );

  const dadosGraficoTemperatura = temperaturaMirante?.resumoMensal
    ? temperaturaMirante.resumoMensal
        .map((item) => ({
          mes: formatarMes(item.mes),
          casos: Number(item.temperatura),
        }))
        .filter((item) => Number.isFinite(item.casos))
    : [];

    const umidadeMirante = dadosUmidade?.estacoes?.find(

  (estacao) => estacao.codigo === 'A701'

);

const dadosGraficoUmidade = umidadeMirante?.resumoMensal
    ? umidadeMirante.resumoMensal
        .map((item) => ({
          mes: formatarMes(item.mes),
          casos: Number(item.umidade),
        }))
        .filter((item) => Number.isFinite(item.casos))
    : [];

      // Dados e indicadores da página Tendências

  const dadosTendencia = dadosDengue?.resumoMensal

    ? dadosDengue.resumoMensal.map((item) => ({

        mes: formatarMes(item.mes),

        casos: Number(item.notificacoes) || 0,

      }))

    : [];

  const ultimoMes = dadosTendencia[dadosTendencia.length - 1];

  const mesAnterior = dadosTendencia[dadosTendencia.length - 2];

  const variacaoMensal =

    ultimoMes && mesAnterior && mesAnterior.casos > 0

      ? ((ultimoMes.casos - mesAnterior.casos) / mesAnterior.casos) * 100

      : null;

  return (

    <>

      <section className="welcome-row generic-welcome">

        <div>

          <div className="eyebrow">

            <span className="eyebrow-line" /> {c.kicker}

          </div>

          <h1>{c.title}</h1>

          <p className="page-subtitle">{c.intro}</p>

        </div>

        <span className="context-chip">

          {year} · {area}

        </span>

      </section>

    {page === 'mapa' && (

  <section className="panel map-page-panel">

    <MapaInterativo />

  </section>

)}

      {page === 'analises' && (

        <>

          <div className="demo-banner">

            <span className="demo-icon">

              <Icon name="info" />

            </span>

            <div>

              <strong>

                {dadosDengue

                  ? 'Dados epidemiológicos integrados'

                  : 'Dados epidemiológicos'}

              </strong>

              <span>

                {dadosDengue

                  ? `Fonte: SINAN/Dengue. Município de São Paulo. Última notificação: ${

                      dadosDengue.ultimaData

                        ? dadosDengue.ultimaData.split('-').reverse().join('/')

                        : 'Indisponível'

                    }.`

                  : carregando

                    ? 'Consultando a base oficial...'

                    : erro || 'Aguardando dados.'}

              </span>

            </div>

          </div>

          {carregando && <p>Carregando análises...</p>}

          {erro && (

            <div className="demo-banner" role="alert">

              <div className="demo-icon">

                <Icon name="info" />

              </div>

              <div>

                <strong>Falha na consulta</strong>

                <span>{erro}</span>

              </div>

            </div>

          )}

          {dadosDengue && (

            <>

              <section className="dashboard-grid generic-charts">

                <article className="panel chart-panel">

                  <div className="panel-heading">

                    <div>

                      <span className="panel-kicker">SÉRIE TEMPORAL</span>

                      <h2>Notificações por mês</h2>

                      <p>Dados reais por data de notificação</p>

                    </div>

                  </div>

                  <LineChart

                    data={dadosDengue.resumoMensal.map((item) => ({

                      mes: item.mes.substring(5),

                      casos: item.notificacoes,

                    }))}

                  />

                  <div className="chart-footnote">

                    Fonte: Ministério da Saúde — SINAN/Dengue. Notificações não

                    equivalem necessariamente a casos confirmados.

                  </div>

                </article>

                <article className="panel climate-panel">

                  <div className="panel-heading">

                    <div>

                      <span className="panel-kicker">CLASSIFICAÇÃO FINAL</span>

                      <h2>Distribuição das notificações</h2>

                      <p>Registros por código CLASSI_FIN</p>

                    </div>

                  </div>

                  <div className="research-list">

                    {dadosDengue.distribuicaoClassificacao.map((item) => (

                      <div

                        className="research-item"

                        key={item.classificacao}

                      >

                        <div className="research-info">

                          <div className="research-title">

                            {item.classificacao === 'Não informado'

                              ? 'Não informado'

                              : `Classificação ${item.classificacao}`}

                          </div>

                        </div>

                        <strong>{item.total.toLocaleString('pt-BR')}</strong>

                      </div>

                    ))}

                  </div>

                  <div className="chart-footnote">

                    Os códigos são apresentados sem atribuir diagnóstico

                    individual aos registros.

                  </div>

                </article>

              </section>

              <section className="panel text-panel">

                <span className="panel-kicker">INDICADORES EPIDEMIOLÓGICOS</span>

                <h2>Resumo da classificação</h2>

                <div className="about-stat">

                  <strong>

                    {dadosDengue.indicadores.classificadasComoDengue.toLocaleString(

                      'pt-BR'

                    )}

                  </strong>

                  <span>Classificações finais 10, 11 e 12</span>

                </div>

                <div className="about-stat">

                  <strong>

                    {dadosDengue.indicadores.dengueComSinaisDeAlarme.toLocaleString(

                      'pt-BR'

                    )}

                  </strong>

                  <span>

                    Classificação final 11 — dengue com sinais de alarme

                  </span>

                </div>

                <div className="about-stat">

                  <strong>

                    {dadosDengue.indicadores.dengueGrave.toLocaleString(

                      'pt-BR'

                    )}

                  </strong>

                  <span>Classificação final 12 — dengue grave</span>

                </div>

                <div className="about-stat">

                  <strong>

                    {dadosDengue.indicadores.emInvestigacao.toLocaleString(

                      'pt-BR'

                    )}

                  </strong>

                  <span>Classificações 10, 11 e 12 com critério 3</span>

                </div>

                <div className="chart-footnote">{dadosDengue.aviso}</div>

              </section>

            </>

          )}


         <section className="dashboard-grid generic-charts climate-charts">

  {/* PRECIPITAÇÃO */}
  <article className="panel chart-panel">
    <div className="panel-heading">
      <div>
        <span className="panel-kicker">VARIÁVEL AMBIENTAL</span>
        <h2>Precipitação mensal</h2>
        <p>Volume mensal registrado pela estação A701</p>
      </div>
    </div>

    {carregandoChuva ? (
      <p>Carregando dados de precipitação...</p>
    ) : dadosGraficoChuva.length > 0 ? (
      <BarChart data={dadosGraficoChuva} />
    ) : (
      <p>{erroChuva || 'Não há dados de precipitação disponíveis.'}</p>
    )}

    <div className="chart-footnote">
      Fonte: INMET — estação automática A701, Mirante de Santana.
      Precipitação mensal em milímetros (mm).
    </div>
  </article>

  {/* TEMPERATURA */}
  <article className="panel chart-panel">
    <div className="panel-heading">
      <div>
        <span className="panel-kicker">VARIÁVEL AMBIENTAL</span>
        <h2>Temperatura média mensal</h2>
        <p>Temperatura observada na estação A701</p>
      </div>
    </div>

    {carregandoTemperatura ? (
      <p>Carregando dados de temperatura...</p>
    ) : dadosGraficoTemperatura.length > 0 ? (
      <LineChart data={dadosGraficoTemperatura} />
    ) : (
      <p>{erroTemperatura || 'Não há dados de temperatura disponíveis.'}</p>
    )}

    <div className="chart-footnote">
      Fonte: INMET — estação automática A701, Mirante de Santana.
      Temperatura média mensal em graus Celsius (°C).
    </div>
  </article>

  {/* UMIDADE */}
  <article className="panel chart-panel">
    <div className="panel-heading">
      <div>
        <span className="panel-kicker">VARIÁVEL AMBIENTAL</span>
        <h2>Umidade relativa mensal</h2>
        <p>Umidade registrada na estação A701</p>
      </div>
    </div>

    {carregandoUmidade ? (
      <p>Carregando dados de umidade...</p>
    ) : dadosGraficoUmidade.length > 0 ? (
      <LineChart data={dadosGraficoUmidade} />
    ) : (
      <p>{erroUmidade || 'Não há dados de umidade disponíveis.'}</p>
    )}

    <div className="chart-footnote">
      Fonte: INMET — estação automática A701, Mirante de Santana.
      Umidade relativa em porcentagem (%).
    </div>
  </article>

</section>

<div className="chart-footnote">
  Os dados meteorológicos representam a estação A701, em Mirante de
  Santana, e não uma medição específica do Parque Vila Maria. Eles
  oferecem contexto ambiental para a análise, mas não demonstram, por
  si só, relação causal com as notificações de dengue.
</div>
</>
      )}

              {page === 'tendencias' && (

        <>

          <div className="demo-banner">

            <span className="demo-icon">

              <Icon name="info" />

            </span>

            <div>

              <strong>Análise exploratória de tendências</strong>

              <span>

                Os indicadores descrevem notificações registradas.
                A estimativa abaixo é exploratória e não representa previsão epidemiológica oficial.
              </span>

            </div>

          </div>

          {carregando && <p>Carregando tendências...</p>}

          {erro && (

            <div className="demo-banner" role="alert">

              <span className="demo-icon">

                <Icon name="info" />

              </span>

              <div>

                <strong>Falha na consulta</strong>

                <span>{erro}</span>

              </div>

            </div>

          )}

          {dadosDengue && (

            <>

              <section className="about-grid">

                <article className="panel text-panel">

                  <span className="panel-kicker">ÚLTIMO MÊS DISPONÍVEL</span>

                  <h2>{ultimoMes?.mes || 'Indisponível'}</h2>

                  <div className="about-stat">

                    <strong>

                      {ultimoMes?.casos.toLocaleString('pt-BR') ?? '—'}

                    </strong>

                    <span>Notificações registradas</span>

                  </div>

                </article>

                <article className="panel text-panel">

                  <span className="panel-kicker">VARIAÇÃO MENSAL</span>

                  <h2>

                    {variacaoMensal === null

                      ? 'Não calculável'

                      : `${variacaoMensal > 0 ? '+' : ''}${variacaoMensal.toLocaleString(

                          'pt-BR',

                          { maximumFractionDigits: 1 }

                        )}%`}

                  </h2>

                  <p>

                    {variacaoMensal === null

                      ? 'Não há dados suficientes para comparar os dois últimos meses.'

                      : variacaoMensal > 0

                        ? 'Aumento em relação ao mês anterior.'

                        : variacaoMensal < 0

                          ? 'Redução em relação ao mês anterior.'

                          : 'Estabilidade em relação ao mês anterior.'}

                  </p>

                </article>

              </section>

              <section className="panel chart-panel">

                <div className="panel-heading">

                  <div>

                    <span className="panel-kicker">SÉRIE TEMPORAL</span>

                    <h2>Evolução mensal das notificações</h2>

                    <p>Município de São Paulo · {year}</p>

                  </div>

                </div>

                {dadosTendencia.length > 0 ? (

                  <LineChart data={dadosTendencia} />

                ) : (

                  <p>Não há dados mensais disponíveis para exibição.</p>

                )}

                <div className="chart-footnote">

                  Fonte: Ministério da Saúde — SINAN/Dengue. Notificações não

                  equivalem necessariamente a casos confirmados.

                </div>

              </section>

              <section className="panel text-panel">
  <span className="panel-kicker">ESTIMATIVA EXPLORATÓRIA</span>
  <h2>Estimativa para os próximos meses</h2>

  {carregandoPrevisao && <p>Carregando estimativa...</p>}

  {erroPrevisao && <p role="alert">{erroPrevisao}</p>}

  {dadosPrevisao && (
    <>
      <div className="about-grid">
        {dadosPrevisao.previsoes.map((item) => (
          <div className="about-stat" key={item.periodo}>
            <strong>
              {item.notificacoesEstimadas.toLocaleString('pt-BR')}
            </strong>
            <span>{item.periodo}</span>
          </div>
        ))}
      </div>

      <p className="chart-footnote">
        Método: {dadosPrevisao.metodo}.
        {' '}Meses utilizados: {dadosPrevisao.mesesUtilizados.join(', ')}.
      </p>

      <p className="chart-footnote">{dadosPrevisao.aviso}</p>
    </>
  )}
</section>


              <section className="panel text-panel trends-interpretation">

                <span className="panel-kicker">INTERPRETAÇÃO</span>

                <h2>Como ler esta tendência</h2>

                <p>

                  O gráfico apresenta a evolução das notificações ao longo dos

                  meses. A variação mensal compara o último mês disponível com

                  o mês imediatamente anterior, quando ambos possuem valores

                  válidos.

                </p>

                <p>

                  Os dados epidemiológicos são referentes ao Município de São

                  Paulo, conforme a granularidade disponível na base oficial.

                  Parque Vila Maria e seu entorno permanecem como território de

                  referência da pesquisa comunitária.

                </p>

                <div className="chart-footnote">

                  A estimativa apresentada não é uma previsão epidemiológica validada nem calcula risco local.

                </div>

              </section>

            </>

          )}

        </>

       )}

      {page === 'prevencao' && (

        <>

          <section className="panel text-panel prevention-checklist">

            <div className="panel-heading">

              <div>

                <span className="panel-kicker">CUIDADO SEMANAL</span>

                <h2>Checklist de prevenção</h2>

                <p>Reserve alguns minutos por semana para verificar sua casa.</p>

              </div>

              <strong>

                {tarefasConcluidas.length}/6

              </strong>

            </div>

            <div className="checklist-progress">

              <div

                className="checklist-progress-bar"

                style={{

                  width: `${(tarefasConcluidas.length / 6) * 100}%`,

                }}

              />

            </div>

            {[

              'Verifique se a caixa-d’água está bem tampada.',

              'Limpe calhas e ralos, retirando folhas e sujeira.',

              'Elimine água acumulada em pratos de plantas e recipientes.',

              'Mantenha garrafas e pneus protegidos da chuva.',

              'Deixe lixeiras fechadas e descarte corretamente os resíduos.',

              'Verifique quintais, vasos e áreas externas.',

            ].map((tarefa, index) => (

              <label className="checklist-item" key={index}>

                <input

                  type="checkbox"

                  checked={tarefasConcluidas.includes(index)}

                  onChange={(e) => {

                    setTarefasConcluidas((anteriores) =>

                      e.target.checked

                        ? [...anteriores, index]

                        : anteriores.filter((item) => item !== index)

                    );

                  }}

                />

                <span>{tarefa}</span>

              </label>

            ))}

            {tarefasConcluidas.length === 6 && (

              <p className="checklist-complete">

                Ótimo! Você concluiu todas as verificações desta semana.

              </p>

            )}

            <button

              className="text-action"

              type="button"

              onClick={() => setTarefasConcluidas([])}

            >

              Reiniciar checklist

            </button>

          </section>

          <section className="prevention-grid">

            <article className="prevention-card">

              <div className="prevention-icon mint">

                <Icon name="drop" size={24} />

              </div>

              <h2>Elimine água parada</h2>

              <p>

                Tampe caixas-d’água, limpe calhas e descarte recipientes que

                possam acumular água.

              </p>

            </article>

            <article className="prevention-card">

              <div className="prevention-icon amber">

                <Icon name="shield" size={24} />

              </div>

              <h2>Proteja sua casa</h2>

              <p>

                Mantenha lixeiras fechadas, pratos de plantas sem água acumulada

                e quintais limpos.

              </p>

            </article>

            <article className="prevention-card">

              <div className="prevention-icon blue">

                <Icon name="info" size={24} />

              </div>

              <h2>Reconheça os sintomas</h2>

              <p>

                Febre, dores no corpo, dor de cabeça, náuseas e manchas podem

                ocorrer. Procure orientação de um serviço de saúde.

              </p>

            </article>

            <article className="prevention-card urgent">

              <div className="prevention-icon rose">

                <Icon name="bell" size={24} />

              </div>

              <h2>Sinais de alarme</h2>

              <p>

                Dor abdominal intensa, vômitos persistentes, sangramento,

                desmaio ou piora importante exigem atendimento urgente.

              </p>

            </article>

          </section>

          <section className="panel text-panel prevention-myths">

            <span className="panel-kicker">INFORMAÇÃO E CONSCIENTIZAÇÃO</span>

            <h2>Mitos e verdades sobre a dengue</h2>

            <details>

              <summary>O mosquito se reproduz apenas em água suja?</summary>

              <p>

                Mito. O Aedes aegypti pode se reproduzir em água limpa ou suja

                acumulada em recipientes.

              </p>

            </details>

            <details>

              <summary>Uma pequena quantidade de água pode ser suficiente?</summary>

              <p>

                Verdade. Recipientes pequenos com água parada também podem se

                tornar criadouros.

              </p>

            </details>

            <details>

              <summary>Eliminar criadouros ajuda a prevenir a dengue?</summary>

              <p>

                Verdade. Remover locais de água acumulada reduz as oportunidades

                de reprodução do mosquito.

              </p>

            </details>

          </section>

          <div className="source-callout">

            <Icon name="info" />

            <p>

              Conteúdo educativo geral. Em caso de sintomas, procure um serviço

              de saúde. Sinais de alarme exigem atendimento urgente; em

              emergência, acione o SAMU (192). Consulte também os canais oficiais

              da Secretaria Municipal da Saúde.

            </p>

          </div>

        </>

      )}

      {page === 'sobre' && (

        <>

          <section className="about-hero panel">

            <span className="panel-kicker">PROJETO INTEGRADOR IV · UNIVESP</span>

            <h2>DengueAlerta SP</h2>

            <p>

              Uma plataforma acadêmica que reúne dados epidemiológicos,

              meteorológicos e territoriais para apoiar a compreensão da dengue

              e ampliar o acesso à informação para prevenção.

            </p>

            <div className="about-hero-tags">

              <span><Icon name="database" size={15} /> Dados públicos</span>

              <span><Icon name="chart-line" size={15} /> Análise exploratória</span>

              <span><Icon name="users" size={15} /> Pesquisa comunitária</span>

            </div>

          </section>

          <section className="about-grid">

            <article className="panel text-panel">

              <span className="panel-kicker">OBJETIVO</span>

              <h2>Informação acessível para prevenção</h2>

              <p>

                O projeto propõe integrar e apresentar informações relacionadas

                à dengue em uma interface acessível, com gráficos, indicadores,

                mapas ilustrativos e conteúdo educativo.

              </p>

              <h3>O que a plataforma oferece</h3>

              <ul>

                <li>Séries temporais de notificações de dengue.</li>

                <li>Indicadores e classificações epidemiológicas.</li>

                <li>Contexto meteorológico com dados de temperatura.</li>

                <li>Visualização territorial e orientações de prevenção.</li>

              </ul>

            </article>

            <article className="panel text-panel">

              <span className="panel-kicker">PESQUISA COMUNITÁRIA</span>

              <h2>Escuta da comunidade</h2>

              <p>

                A pesquisa voluntária reuniu 75 respostas e investigou o

                interesse por informações sobre dengue, mapas, gráficos,

                indicadores e condições climáticas.

              </p>

              <p>

                Os resultados representam as percepções dos participantes

                e contribuíram para orientar os recursos da plataforma.

                Não representam a incidência da doença.

              </p>

              {pesquisaComunidade.map((item) => (

                <div className="about-stat" key={item.titulo}>

                  <strong>{item.valor}</strong>

                  <span>{item.titulo}</span>

                </div>

              ))}

            </article>

          </section>

          <section className="panel text-panel about-method">

            <span className="panel-kicker">METODOLOGIA E TERRITÓRIO</span>

            <h2>Do território à análise de dados</h2>

            <div className="about-method-grid">

              <article>

                <span className="method-number">01</span>

                <h3>Escuta</h3>

                <p>

                  Levantamento das necessidades informacionais da comunidade

                  do Parque Vila Maria e seu entorno.

                </p>

              </article>

              <article>

                <span className="method-number">02</span>

                <h3>Integração</h3>

                <p>

                  Consulta e organização de dados epidemiológicos e

                  meteorológicos de fontes públicas.

                </p>

              </article>

              <article>

                <span className="method-number">03</span>

                <h3>Visualização</h3>

                <p>

                  Apresentação dos dados em gráficos, indicadores e mapa

                  ilustrativo para facilitar sua interpretação.

                </p>

              </article>

            </div>

            <p>

              Parque Vila Maria e seu entorno são o território de referência

              da pesquisa comunitária. Como a base epidemiológica utilizada

              não oferece um recorte específico para o parque, os indicadores

              de dengue exibidos nesta versão correspondem ao Município de

              São Paulo.

            </p>

          </section>

          <section className="panel text-panel sources-panel">

            <span className="panel-kicker">TRANSPARÊNCIA E ACESSO</span>

            <h2>Bases públicas e portais oficiais</h2>

            <p>

              Consulte as fontes pesquisadas e utilizadas no desenvolvimento

              do DengueAlerta SP. A indicação de integração refere-se aos

              dados efetivamente utilizados nesta versão da plataforma.

            </p>

            <div className="public-sources-grid">

              <article className="public-source-card">

                <span className="source-status integrated">Dados integrados</span>

                <h3>Ministério da Saúde — Dados de dengue</h3>

                <p>

                  Dados epidemiológicos e notificações de dengue disponibilizados

                  no Portal de Dados Abertos do SUS.

                </p>

                <a href="https://dadosabertos.saude.gov.br/dataset/arboviroses-dengue"

                   target="_blank" rel="noreferrer">

                  Acessar base de dengue <Icon name="external-link" size={15} />

                </a>

              </article>

              <article className="public-source-card">

                <span className="source-status consulted">Fonte institucional</span>

                <h3>Ministério da Saúde — Dengue</h3>

                <p>

                  Informações sobre transmissão, sintomas, prevenção e

                  orientações gerais sobre a doença.

                </p>

                <a href="https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dengue/dengue"

                   target="_blank" rel="noreferrer">

                  Consultar orientações <Icon name="external-link" size={15} />

                </a>

              </article>

              <article className="public-source-card">

                <span className="source-status consulted">Material de referência</span>

                <h3>Ministério da Saúde — Manejo clínico</h3>

                <p>

                  Fluxograma oficial de apoio ao manejo clínico de pacientes

                  com suspeita de dengue.

                </p>

                <a href="https://www.gov.br/saude/pt-br/composicao/svsa/resposta-a-emergencias/coes/arboviroses/publicacoes/fluxograma-do-manejo-clinico-da-dengue.pdf"

                   target="_blank" rel="noreferrer">

                  Acessar fluxograma <Icon name="external-link" size={15} />

                </a>

              </article>

              <article className="public-source-card">

                <span className="source-status consulted">Fonte municipal</span>

                <h3>COVISA — Dados epidemiológicos</h3>

                <p>

                  Boletins e informações epidemiológicas de arboviroses

                  publicados pela Secretaria Municipal da Saúde de São Paulo.

                </p>

                <a href="https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/boletim_covisa/arboviroses"

                   target="_blank" rel="noreferrer">

                  Consultar dados e boletins <Icon name="external-link" size={15} />

                </a>

              </article>

              <article className="public-source-card">

                <span className="source-status consulted">Planejamento municipal</span>

                <h3>Plano Municipal 2026/2027</h3>

                <p>

                  Plano de enfrentamento da dengue e demais arboviroses

                  do Município de São Paulo.

                </p>

                <a href="https://prefeitura.sp.gov.br/web/saude/w/vigilancia_em_saude/dengue/362103"

                   target="_blank" rel="noreferrer">

                  Consultar o plano <Icon name="external-link" size={15} />

                </a>

              </article>

              <article className="public-source-card">

                <span className="source-status consulted">Alerta institucional</span>

                <h3>Prefeitura de São Paulo — El Niño</h3>

                <p>

                  Orientações municipais sobre prevenção e combate ao

                  Aedes aegypti diante dos efeitos do El Niño.

                </p>

                <a href="https://prefeitura.sp.gov.br/web/prefeitura-de-sao-paulo/w/prefeitura-refor%C3%A7a-a%C3%A7%C3%B5es-de-preven%C3%A7%C3%A3o-e-combate-ao-aedes-aegypti-diante-dos-efeitos-do-el-ni%C3%B1o"

                   target="_blank" rel="noreferrer">

                  Ler orientações <Icon name="external-link" size={15} />

                </a>

              </article>

              <article className="public-source-card">

                <span className="source-status integrated">Dados integrados</span>

                <h3>INMET — BDMEP</h3>

                <p>

                  Banco de dados meteorológicos para consulta de séries

                  históricas, incluindo temperatura e precipitação.

                </p>

                <a href="https://bdmep.inmet.gov.br/"

                   target="_blank" rel="noreferrer">

                  Acessar o BDMEP <Icon name="external-link" size={15} />

                </a>

              </article>

              <article className="public-source-card">

                <span className="source-status complementar">Fonte complementar</span>

                <h3>IBGE — Dados territoriais e populacionais</h3>

                <p>

                  Informações estatísticas e geográficas que podem apoiar

                  análises territoriais e contextualização populacional.

                </p>

                <a href="https://www.ibge.gov.br/"

                   target="_blank" rel="noreferrer">

                  Acessar o IBGE <Icon name="external-link" size={15} />

                </a>

              </article>

            </div>

          </section>

          <section className="panel text-panel sources-panel">

            <span className="panel-kicker">FUNDAMENTAÇÃO</span>

            <h2>Referências científicas</h2>

            <p>

              Estudos e publicações que contribuíram para a fundamentação

              teórica e as escolhas metodológicas do projeto.

            </p>

            <div className="reference-list">

              <article>

                <strong>Machine Learning forecasting of dengue in São Paulo</strong>

                <p>

                  Estudo sobre previsão de dengue em São Paulo com dados

                  aumentados e indicadores urbanos.

                </p>

                <a href="https://www.sciencedirect.com/science/article/pii/S0001706X26000264"

                   target="_blank" rel="noreferrer">

                  Ler artigo <Icon name="external-link" size={15} />

                </a>

              </article>

              <article>

                <strong>Data visualization for public health policies: the DengueMap experience</strong>

                <p>

                  Discussão sobre visualização de dados para políticas

                  públicas de saúde.

                </p>

                <a href="https://doi.org/10.29397/reciis.v19i1.4537"

                   target="_blank" rel="noreferrer">

                  Ler artigo <Icon name="external-link" size={15} />

                </a>

              </article>

              <article>

                <strong>Digital dashboards visualizing public health data: a systematic review</strong>

                <p>

                  Revisão sistemática sobre dashboards digitais para

                  visualização de dados em saúde pública.

                </p>

                <a href="https://doi.org/10.3389/fpubh.2023.999958"

                   target="_blank" rel="noreferrer">

                  Ler artigo <Icon name="external-link" size={15} />

                </a>

              </article>

              <article>

                <strong>Vigilância entomológica e controle de vetores do dengue</strong>

                <p>

                  Referência sobre vigilância entomológica e controle

                  de vetores.

                </p>

                <a href="https://doi.org/10.1590/S1415-790X2002000300005"

                   target="_blank" rel="noreferrer">

                  Ler artigo <Icon name="external-link" size={15} />

                </a>

              </article>

            </div>

          </section>

          <section className="panel text-panel about-limitations">

            <span className="panel-kicker">LIMITAÇÕES E USO RESPONSÁVEL</span>

            <h2>Como interpretar os dados</h2>

            <p>

              Os dados epidemiológicos desta versão referem-se ao Município

              de São Paulo e não permitem identificar a incidência específica

              no Parque Vila Maria. Os dados meteorológicos são provenientes

              da estação automática A701, em Mirante de Santana.

            </p>

            <p>

              O mapa é ilustrativo e não representa a distribuição real de

              casos ou áreas de risco. A plataforma não calcula risco local

              nem apresenta previsão epidemiológica validada. As informações

              têm finalidade acadêmica e educativa e não substituem os canais

              oficiais de vigilância ou orientação profissional de saúde.

            </p>

          </section>

        </>

      )}

      <footer className="page-footer">

        <span>

          Dengue Alerta SP <b>·</b> Projeto Integrador UNIVESP

        </span>

      </footer>

    </>

  );

}