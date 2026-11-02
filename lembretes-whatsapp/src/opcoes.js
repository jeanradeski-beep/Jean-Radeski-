// Opções de antecedência do lembrete (em minutos)
const OPCOES = [
  { id: 1, nome: 'Na hora do evento', min: 0 },
  { id: 2, nome: '30 minutos antes', min: 30 },
  { id: 3, nome: '1 hora antes', min: 60 },
  { id: 4, nome: '3 horas antes', min: 180 },
  { id: 5, nome: '1 dia antes', min: 1440 },
  { id: 6, nome: '2 dias antes', min: 2880 },
  { id: 7, nome: '1 semana antes', min: 10080 },
];

function menuOpcoes() {
  return OPCOES.map(o => `*${o.id}* - ${o.nome}`).join('\n');
}

// "5 6" / "5,6" / "5 e 6" -> opções escolhidas
function lerEscolhas(texto) {
  const ids = [...new Set((texto.match(/\d+/g) || []).map(Number))];
  const escolhidas = ids.map(id => OPCOES.find(o => o.id === id)).filter(Boolean);
  return escolhidas.length === ids.length ? escolhidas : null;
}

module.exports = { OPCOES, menuOpcoes, lerEscolhas };
