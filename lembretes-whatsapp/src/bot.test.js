const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lembretes-'));
const { Bot } = require('./bot');

test('fluxo completo: cadastrar, receber lembretes, listar, cancelar', async () => {
  const saida = [];
  const bot = new Bot(async t => saida.push(t));
  const agora = new Date(2026, 10, 2, 10, 0);

  await bot.responder('Dentista dia 15/11', agora);
  assert.match(saida.at(-1), /Que horas/);
  await bot.responder('14:30', agora);
  assert.match(saida.at(-1), /Quando quer ser lembrado/);
  await bot.responder('5 6', agora);
  assert.match(saida.at(-1), /Evento salvo/);
  assert.match(saida.at(-1), /1 dia antes, 2 dias antes/);

  // 2 dias antes
  await bot.verificar(new Date(2026, 10, 13, 14, 30));
  assert.match(saida.at(-1), /Lembrete\*: Dentista/);
  assert.match(saida.at(-1), /2 dia/);
  const n = saida.length;
  await bot.verificar(new Date(2026, 10, 13, 15, 0)); // não repete
  assert.strictEqual(saida.length, n);
  // 1 dia antes
  await bot.verificar(new Date(2026, 10, 14, 14, 31));
  assert.match(saida.at(-1), /1 dia/);

  await bot.responder('Reunião amanhã às 9h', agora);
  await bot.responder('1', agora);
  await bot.responder('lista', agora);
  assert.match(saida.at(-1), /Reunião/);
  await bot.responder('cancelar 2', agora);
  assert.match(saida.at(-1), /cancelado/);
});

test('opção que já passou é ignorada', async () => {
  const saida = [];
  const bot = new Bot(async t => saida.push(t));
  const agora = new Date(2026, 10, 2, 10, 0);
  await bot.responder('Almoço hoje 12h', agora);
  await bot.responder('3 5', agora); // 1h antes ok, 1 dia antes já passou
  assert.match(saida.at(-1), /Ignorei.*1 dia antes/);
});
