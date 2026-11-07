const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const {
  resumoChuva,
  resumoTemperatura,
  resumoUmidade,
} = require('./clima');

const { obterIndicadores } = require('./dados');
const { obterResumoMensal } = require('./servicoDengue');

const { calcularPrevisao } = require('./previsao');
const { obterBaseIntegrada } = require('./baseIntegrada');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [
      'https://dengue-alerta-sp.vercel.app',
      'http://localhost:5173',
    ],
  })
);

app.use(express.json());

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    projeto: 'Dengue Alerta SP',
    mensagem: 'Backend funcionando!',
    status: 'online',
  });
});

// Resumo mensal de umidade relativa — INMET
app.get('/api/clima/umidade-mensal', (req, res) => {
  try {
    res.json(resumoUmidade());
  } catch (erro) {
    console.error('Erro ao carregar dados de umidade:', erro);
    res.status(500).json({ erro: erro.message });
  }
});

// Resumo mensal de chuva — INMET
app.get('/api/clima/resumo-mensal', (req, res) => {
  try {
    res.json(resumoChuva());
  } catch (erro) {
    console.error('Erro ao carregar dados de chuva:', erro);
    res.status(500).json({ erro: erro.message });
  }
});

// Resumo mensal de temperatura — INMET
app.get('/api/clima/temperatura-mensal', (req, res) => {
  try {
    res.json(resumoTemperatura());
  } catch (erro) {
    console.error('Erro ao carregar dados de temperatura:', erro);
    res.status(500).json({ erro: erro.message });
  }
});

// Indicadores cadastrados
app.get('/api/indicadores', (req, res) => {
  res.json(obterIndicadores());
});

// Amostra de notificações para testar a conexão com a API
app.get('/api/dengue/amostra', async (req, res) => {
  try {
    const url =
      'https://apidadosabertos.saude.gov.br/arboviroses/dengue?nu_ano=2026&id_municip=355030&limit=10';

    const resposta = await fetch(url);

    if (!resposta.ok) {
      return res.status(502).json({
        erro: 'Não foi possível consultar a API do Ministério da Saúde.',
      });
    }

    const resultado = await resposta.json();

    const notificacoes = (resultado.dengue || []).map((item) => ({
      dataNotificacao: item.dt_notific,
      dataInicioSintomas: item.dt_sin_pri,
      municipioNotificacao: item.id_municip,
      municipioResidencia: item.id_mn_resi,
      classificacaoFinal: item.classi_fin,
      criterioConfirmacao: item.criterio,
    }));

    res.json({
      fonte: 'Ministério da Saúde — SINAN/Dengue',
      tipo: 'Amostra de notificações; não representa o total de casos',
      quantidadeRetornada: notificacoes.length,
      notificacoes,
    });
  } catch (erro) {
    console.error('Falha na consulta à API:', erro);
    res.status(502).json({
      erro: 'Falha ao consultar a fonte de dados.',
    });
  }
});

// Previsão exploratória de notificações de dengue
app.get('/api/dengue/previsao', async (req, res) => {
  try {
    const resumo = await obterResumoMensal(2026);

    const previsao = calcularPrevisao(resumo.resumoMensal, 3);

    res.json({
      fonte: resumo.fonte,
      municipio: resumo.municipio,
      anoBase: 2026,
      ...previsao,
    });
  } catch (erro) {
    console.error('Erro ao calcular previsão:', erro);

    res.status(500).json({
      erro: 'Não foi possível calcular a previsão de dengue.',
      detalhe: erro.message,
    });
  }
});


// Resumo mensal usando a base Parquet local
app.get('/api/dengue/resumo-mensal', async (req, res) => {
  try {
    const ano = Number(req.query.ano || 2026);
    const resumo = await obterResumoMensal(ano);
    res.json(resumo);
  } catch (erro) {
    console.error('Erro no resumo mensal:', erro.message);

    res.status(500).json({
      erro: 'Não foi possível gerar o resumo mensal de dengue.',
      detalhe: erro.message,
    });
  }
});

// Base integrada para análise de dados e Machine Learning
app.get('/api/dengue/base-integrada', async (req, res) => {
  try {
    const base = await obterBaseIntegrada(2026);
    res.json(base);
  } catch (erro) {
    console.error('Erro na base integrada:', erro);

    res.status(500).json({
      erro: 'Não foi possível integrar os dados.',
      detalhe: erro.message,
    });
  }
});


// Resultados da avaliação do modelo de Machine Learning
app.get('/api/dengue/resultado-modelo', (req, res) => {
  try {
    const caminho = path.join(
      __dirname,
      'dados',
      'resultado_modelo.json'
    );

    const resultado = JSON.parse(
      fs.readFileSync(caminho, 'utf8')
    );

    res.json(resultado);
  } catch (erro) {
    console.error('Erro ao carregar resultado do modelo:', erro);

    res.status(500).json({
      erro: 'Não foi possível carregar os resultados do modelo.',
      detalhe: erro.message
    });
  }
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Dengue Alerta SP: servidor iniciado na porta ${PORT}`);
});
