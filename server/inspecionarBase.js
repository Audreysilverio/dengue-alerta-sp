
const AdmZip = require('adm-zip');
const parquet = require('@dsnp/parquetjs');
const fs = require('fs');
const path = require('path');
const util = require('util');

async function inspecionar() {
  const zipPath = path.join(__dirname, 'DENGBR26.parquet.zip');
  const destino = path.join(__dirname, 'DENGBR26.parquet');

  console.log('1. Conferindo o arquivo ZIP...');

  if (!fs.existsSync(zipPath)) {
    throw new Error('Arquivo ZIP não encontrado: ' + zipPath);
  }

  console.log('2. Extraindo o arquivo Parquet...');

  const zip = new AdmZip(zipPath);
  const entrada = zip.getEntry('DENGBR26.parquet');

  if (!entrada) {
    throw new Error('O arquivo Parquet não foi encontrado dentro do ZIP.');
  }

  zip.extractEntryTo('DENGBR26.parquet', __dirname, false, true);

  if (!fs.existsSync(destino)) {
    throw new Error('A extração não criou o arquivo Parquet.');
  }

  console.log('3. Abrindo a base...');

  const reader = await parquet.ParquetReader.openFile(destino);

  try {
    console.log('4. Estrutura da base:');
    console.dir(reader.schema, { depth: 5 });

    console.log('\n5. Primeiro registro:');

    const cursor = reader.getCursor();
    const registro = await cursor.next();

    console.dir(registro, { depth: 5 });
  } finally {
    await reader.close();
  }
}

inspecionar().catch((erro) => {
  console.error('\nNão foi possível inspecionar a base.');
  console.dir(erro, { depth: 5 });
  console.error('Detalhes:', erro?.stack || String(erro));
});
