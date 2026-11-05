import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { LineChart, BarChart } from '../components/Charts.jsx';
import { pesquisaComunidade } from '../data/dadosMock.js';
import { apiUrl } from '../config/api.js';

function Metric({ icon, label, value, foot, tone }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon name={icon} size={21} /></div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-foot">{foot}</div>
    </article>
  );
}

function formatarMes(mes) {
  const [ano, numeroMes] = mes.split('-');
  return new Date(Number(ano), Number(numeroMes) - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function formatarData(data) {
  if (!data || data === 'null') return 'Indisponível';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function Dashboard({ onNavigate, year, setYear, area, setArea }) {
  const [dadosDengue, setDadosDengue] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [dadosChuva, setDadosChuva] = useState(null);
  const [carregandoChuva, setCarregandoChuva] = useState(false);
  const [erroChuva, setErroChuva] = useState('');

  const [dadosTemperatura, setDadosTemperatura] = useState(null);
  const [carregandoTemperatura, setCarregandoTemperatura] = useState(false);
  const [erroTemperatura, setErroTemperatura] = useState('');

  useEffect(() => {
    let ativo = true;
    async function carregarDados() {
      setCarregando(true);
      setErro('');
      setDadosDengue(null);
      try {
        const resposta = await fetch(apiUrl(`/api/dengue/resumo-mensal?ano=${year}`));
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível consultar os dados.');
        if (ativo) setDadosDengue(resultado);
      } catch {
        if (ativo) setErro('Não foi possível carregar os dados. Confira se o backend está ligado.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregarDados();
    return () => { ativo = false; };
  }, [year]);

  useEffect(() => {
    let ativo = true;
    async function carregarChuva() {
      setCarregandoChuva(true);
      setErroChuva('');
      setDadosChuva(null);
      try {
        const resposta = await fetch(apiUrl('/api/clima/resumo-mensal'));
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível consultar dados de chuva.');
        if (ativo) setDadosChuva(resultado);
      } catch {
        if (ativo) setErroChuva('Não foi possível carregar os dados de chuva. Confira se o backend está ligado.');
      } finally {
        if (ativo) setCarregandoChuva(false);
      }
    }
    carregarChuva();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    let ativo = true;
    async function carregarTemperatura() {
      setCarregandoTemperatura(true);
      setErroTemperatura('');
      try {
       const resposta = await fetch(
  apiUrl('/api/clima/temperatura-mensal')
);
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível consultar dados de temperatura.');
        if (ativo) setDadosTemperatura(resultado);
      } catch {
        if (ativo) setErroTemperatura('Não foi possível carregar os dados de temperatura. Confira se o backend está ligado.');
      } finally {if (ativo) setCarregandoTemperatura(false);
      }
    }
    carregarTemperatura();
    return () => { ativo = false; };
  }, []);

  const dadosGrafico = dadosDengue
    ? dadosDengue.resumoMensal.map(item => ({ mes: formatarMes(item.mes), casos: item.notificacoes }))
    : [];

  const territorioMunicipal = area === 'Município de São Paulo' || area === 'São Paulo — visão geral';
  const totalExibido = dadosDengue ? dadosDengue.totalNotificacoes.toLocaleString('pt-BR') : '—';

  const chuvaMirante = dadosChuva?.estacoes?.find(estacao => estacao.codigo === 'A701');
  const dadosGraficoChuva = chuvaMirante?.resumoMensal
    ? chuvaMirante.resumoMensal.map(item => ({ mes: formatarMes(item.mes), chuva: Number(item.precipitacao) || 0 }))
    : [];
  const totalChuvaMirante = dadosGraficoChuva.reduce((total, item) => total + item.chuva, 0);

  const temperaturaMirante = dadosTemperatura?.estacoes?.find(estacao => estacao.codigo === 'A701');
  const dadosGraficoTemperatura = temperaturaMirante?.resumoMensal
    ? temperaturaMirante.resumoMensal
        .map(item => ({ mes: formatarMes(item.mes), casos: Number(item.temperatura) }))
        .filter(item => Number.isFinite(item.casos))
    : [];
  const ultimaTemperatura = dadosGraficoTemperatura.length
    ? dadosGraficoTemperatura[dadosGraficoTemperatura.length - 1].casos
    : null;

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> PAINEL DE VIGILÂNCIA</div>
          <h1>Dados que ajudam a <span>proteger vidas.</span></h1>
          <p className="page-subtitle">Acompanhe informações sobre dengue, território e clima em um só lugar.</p>
        </div>
        <div className="filter-group">
          <label>Período
            <select value={year} onChange={e => setYear(e.target.value)}><option value="2026">2026</option></select>
          </label>
          <label>Território
            <select value={area} onChange={e => setArea(e.target.value)}>
              <option>Parque Vila Maria e entorno</option>
              <option>Município de São Paulo</option>
              <option>São Paulo — visão geral</option>
            </select>
          </label>
        </div>
      </section>

      <div className="demo-banner">
        <span className="demo-icon"><Icon name="info" size={18} /></span>
        <div>
          <strong>{dadosDengue ? 'Notificações da base do Ministério da Saúde' : 'Dados epidemiológicos'}</strong>
          <span>{dadosDengue
            ? `Dados por município de residência. Última data de notificação disponível: ${formatarData(dadosDengue.ultimaData)}. O período mais recente pode estar incompleto.`
            : 'Os dados serão carregados do backend.'}</span>
        </div>
        <span className="demo-tag">{carregando ? 'CARREGANDO' : dadosDengue ? 'BASE LOCAL' : 'AGUARDANDO'}</span>
      </div>

      {erro && <div className="demo-banner" role="alert"><span className="demo-icon"><Icon name="info" size={18} /></span><div><strong>Não foi possível carregar os dados</strong><span>{erro}</span></div></div>}

      {!territorioMunicipal && <div className="demo-banner"><span className="demo-icon"><Icon name="info" size={18} /></span><div><strong>Dados municipais</strong><span>A base integrada cobre o município de São Paulo, não apenas o Parque Vila Maria. Os números não devem ser interpretados como estimativas específicas do bairro.</span></div></div>}

      <section className="metric-grid">
        <Metric icon="drop" label="Notificações registradas" value={totalExibido} foot={dadosDengue ? `De ${formatarData(dadosDengue.primeiraData)} a ${formatarData(dadosDengue.ultimaData)}` : carregando ? 'Consultando a base local' : 'Aguardando dados'} tone="mint" />
        <Metric icon="chart" label="Classificadas como dengue" value={dadosDengue ? dadosDengue.indicadores.classificadasComoDengue.toLocaleString('pt-BR') : '—'} foot={dadosDengue ? `${dadosDengue.indicadores.emInvestigacao} registros em investigação` : 'Aguardando dados'} tone="amber" />
        <Metric icon="shield" label="Dengue com sinais de alarme" value={dadosDengue ? dadosDengue.indicadores.dengueComSinaisDeAlarme.toLocaleString('pt-BR') : '—'} foot="Classificação final 11" tone="blue" />
        <Metric icon="shield" label="Dengue grave" value={dadosDengue ? dadosDengue.indicadores.dengueGrave.toLocaleString('pt-BR') : '—'} foot="Classificação final 12" tone="rose" />
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading"><div><span className="panel-kicker">SÉRIE TEMPORAL</span><h2>Evolução mensal de notificações</h2><p>{dadosDengue ? 'Notificações por data de notificação e município de residência' : 'Aguardando dados da base'}</p></div><button className="text-action" onClick={() => onNavigate('analises')}>Ver análises <Icon name="arrow" size={16} /></button></div>
          <div className="chart-legend"><span><i className="legend-dot legend-dot--green" /> Notificações</span></div>
          {carregando ? <p>Carregando notificações...</p> : dadosGrafico.length > 0 ? <LineChart data={dadosGrafico} /> : <p>Não há dados disponíveis para o período selecionado.</p>}
          {dadosDengue && <div className="chart-footnote">Fonte: Ministério da Saúde — SINAN/Dengue. Notificações não equivalem necessariamente a casos confirmados.</div>}
        </article>

        <article className="panel climate-panel">
          <div className="panel-heading"><div><span className="panel-kicker">VARIÁVEIS AMBIENTAIS</span><h2>Chuva por mês</h2><p>Estação Mirante de Santana — INMET</p></div><div className="weather-icon"><Icon name="cloud" size={22} /></div></div>
          <div className="climate-summary"><strong>{dadosGraficoChuva.length > 0 ? totalChuvaMirante.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '—'} <small>mm</small></strong><span>{dadosGraficoChuva.length > 0 ? 'Precipitação acumulada no período disponível' : carregandoChuva ? 'Carregando dados de chuva...' : 'Valor real indisponível'}</span></div>
          {carregandoChuva ? <p>Carregando dados meteorológicos...</p> : dadosGraficoChuva.length > 0 ? <BarChart data={dadosGraficoChuva} /> : <p>{erroChuva || 'Não há dados de chuva disponíveis para exibição.'}</p>}
          <div className="chart-footnote">Fonte: INMET — estação automática A701, Mirante de Santana. Valores mensais em milímetros (mm).</div>
        </article>

        <article className="panel climate-panel">
          <div className="panel-heading"><div><span className="panel-kicker">VARIÁVEIS AMBIENTAIS</span><h2>Temperatura média mensal</h2><p>Estação Mirante de Santana — INMET</p></div><div className="weather-icon"><Icon name="thermometer" size={22} /></div></div>
          <div className="climate-summary"><strong>{ultimaTemperatura !== null ? ultimaTemperatura.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '—'} <small>°C</small></strong><span>{dadosGraficoTemperatura.length > 0 ? 'Temperatura média do último mês disponível' : carregandoTemperatura ? 'Carregando dados de temperatura...' : 'Valor real indisponível'}</span></div>
          {carregandoTemperatura ? <p>Carregando dados de temperatura...</p> : dadosGraficoTemperatura.length > 0 ? <LineChart data={dadosGraficoTemperatura} /> : <p>{erroTemperatura || 'Não há dados de temperatura disponíveis para exibição.'}</p>}
          <div className="chart-footnote">Fonte: INMET — estação automática A701, Mirante de Santana. Temperatura média mensal em graus Celsius (°C).</div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel territory-panel">
          <div className="panel-heading"><div><span className="panel-kicker">VISÃO TERRITORIAL</span><h2>Explore a região</h2><p>Mapa ilustrativo, sem distribuição real de casos.</p></div><button className="icon-button" onClick={() => onNavigate('mapa')} aria-label="Abrir mapa"><Icon name="arrow" /></button></div>
          <div className="mini-map"><div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" /><div className="map-river" /><span className="map-label label-a">VILA MARIA</span><span className="map-label label-b">PARQUE</span><span className="map-pin"><Icon name="drop" size={16} /></span><span className="map-caption">MAPA ESQUEMÁTICO</span></div>
          <button className="panel-link" onClick={() => onNavigate('mapa')}>Abrir mapa territorial <Icon name="arrow" size={16} /></button>
        </article>
        <article className="panel research-panel">
          <div className="panel-heading"><div><span className="panel-kicker">ESCUTA DA COMUNIDADE</span><h2>O que as pessoas valorizam</h2><p>Resultados da pesquisa comunitária do projeto</p></div><span className="research-badge">75 respostas</span></div>
          <div className="research-list">{pesquisaComunidade.map((item, i) => <div className="research-item" key={item.titulo}><div className="research-number">0{i + 1}</div><div className="research-info"><div className="research-title">{item.titulo}</div><div className="research-track"><span style={{ width: item.valor }} /></div></div><strong>{item.valor}</strong></div>)}</div>
          <div className="research-note">Pesquisa de percepção: esses percentuais não são indicadores de casos de dengue.</div>
        </article>
      </section>

      <footer className="page-footer"><span>Dengue Alerta SP <b>·</b> Projeto Integrador UNIVESP</span><span>Protótipo acadêmico · Notificações e variáveis climáticas integradas; mapa ilustrativo</span></footer>
    </>
  );
}
