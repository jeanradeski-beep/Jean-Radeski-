const test = require('node:test');
const assert = require('node:assert');
const { interpretarEvento } = require('./parser');
const { lerEscolhas } = require('./opcoes');

const agora = new Date(2026, 10, 2, 10, 0); // seg 02/11/2026 10:00

const casos = [
  ['Dentista dia 15/11 às 14:30', 'Dentista', '2026-11-15 14:30'],
  ['Reunião com João amanhã às 9h', 'Reunião com João', '2026-11-03 09:00'],
  ['Aniversário da Ana 20/12 19h30', 'Aniversário da Ana', '2026-12-20 19:30'],
  ['Pagar boleto sexta 10h', 'Pagar boleto', '2026-11-06 10:00'],
  ['Consulta 05/01 as 8', 'Consulta', '2027-01-05 08:00'],
  ['Viagem 10/02/2027 às 6 horas', 'Viagem', '2027-02-10 06:00'],
];

const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

for (const [texto, titulo, quando] of casos) {
  test(texto, () => {
    const r = interpretarEvento(texto, agora);
    assert.strictEqual(r.titulo, titulo);
    assert.ok(r.quando, 'deveria achar data e hora');
    assert.strictEqual(fmt(r.quando), quando);
  });
}

test('sem horário', () => {
  const r = interpretarEvento('Dentista 15/11', agora);
  assert.ok(r.data);
  assert.strictEqual(r.hora, null);
});

test('escolhas', () => {
  assert.deepStrictEqual(lerEscolhas('5 e 6').map(o => o.id), [5, 6]);
  assert.deepStrictEqual(lerEscolhas('5,6,7').map(o => o.id), [5, 6, 7]);
  assert.strictEqual(lerEscolhas('9'), null);
});
