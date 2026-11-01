
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const { Readable } = require('stream');
const AdmZip = require('adm-zip');
const { DuckDBInstance } = require('@duckdb/node-api');

const URL_BASE =
  'https://s3.sa-east-1.amazonaws.com/ckan.saude.gov.br/SINAN/Dengue/parquet/DENGBR26.parquet.zip';

const PASTA = __dirname;
const ZIP_TEMP = path.join(PASTA, 'DENGBR26.parquet.zip.tmp');
const ZIP_ATUAL = path.join(PASTA, 'DENGBR26.parquet.zip');
const PARQUET = path.join(PASTA, 'DENGBR26.parquet');
const PARQUET_TEMP = path.join(PASTA, 'DENGBR26.parquet.tmp');
const BACKUP = path.join(PASTA, 'DENGBR26.parquet.backup');

async function validarParquet(arquivo) {
  const banco = await DuckDBInstance.create(':memory:');
  const conexao = await banco.connect();

  try {
    const caminho = arquivo.replace(/\\/g, '/');

    const resultado = await conexao.run(`
      SELECT COUNT(*) AS total, MAX(DT_NOTIFIC) AS ultimaData
      FROM read_parquet('${caminho}')
    `);

    const [total, ultimaData] = (await resultado.getRows())[0];

    if (Number(total) <= 0 || !ultimaData) {
      throw new Error('A base não contém registros válidos.');
    }

    return {
      total: Number(total),
      ultimaData: String(ultimaData),
    };
  } finally {
    conexao.closeSync();
  }
}

async function baixarBaseDengue() {
  try {
    console.log('1. Baixando a base oficial...');

    const resposta = await fetch(URL_BASE);

    if (!resposta.ok || !resposta.body) {
      throw new Error(`Download falhou: HTTP ${resposta.status}`);
    }

    await pipeline(
      Readable.fromWeb(resposta.body),
      fs.createWriteStream(ZIP_TEMP)
    );

    console.log('2. Extraindo o arquivo Parquet...');

    const zip = new AdmZip(ZIP_TEMP);
    const entrada = zip.getEntry('DENGBR26.parquet');

    if (!entrada) {
      throw new Error('Arquivo Parquet não encontrado no ZIP.');
    }

    fs.writeFileSync(PARQUET_TEMP, entrada.getData());

    console.log('3. Validando a nova base...');

    const validacao = await validarParquet(PARQUET_TEMP);

    console.log('Registros:', validacao.total);
    console.log('Última data:', validacao.ultimaData);

    console.log('4. Substituindo a base local...');

    if (fs.existsSync(BACKUP)) fs.unlinkSync(BACKUP);

    if (fs.existsSync(PARQUET)) {
      fs.renameSync(PARQUET, BACKUP);
    }

    try {
      fs.renameSync(PARQUET_TEMP, PARQUET);
      fs.renameSync(ZIP_TEMP, ZIP_ATUAL);

      if (fs.existsSync(BACKUP)) fs.unlinkSync(BACKUP);
    } catch (erro) {
      if (fs.existsSync(BACKUP)) {
        if (fs.existsSync(PARQUET)) fs.unlinkSync(PARQUET);
        fs.renameSync(BACKUP, PARQUET);
      }
      throw erro;
    }

    console.log('Atualização concluída com sucesso!');

    return validacao;
  } catch (erro) {
    console.error('Erro ao atualizar a base:', erro.message);

    if (fs.existsSync(PARQUET_TEMP)) fs.unlinkSync(PARQUET_TEMP);
    if (fs.existsSync(ZIP_TEMP)) fs.unlinkSync(ZIP_TEMP);

    throw erro;
  }
}

module.exports = { baixarBaseDengue };

// Executa o download quando chamado diretamente pelo terminal.
if (require.main === module) {
  baixarBaseDengue().catch(() => {
    process.exitCode = 1;
  });
}
