const fs = require('fs');
const path = require('path');

const ARQ = path.join(process.env.DATA_DIR || path.join(__dirname, '..', 'data'), 'eventos.json');

function carregar() {
  try { return JSON.parse(fs.readFileSync(ARQ, 'utf8')); }
  catch { return { proximoId: 1, eventos: [] }; }
}

function salvar(db) {
  fs.mkdirSync(path.dirname(ARQ), { recursive: true });
  fs.writeFileSync(ARQ + '.tmp', JSON.stringify(db, null, 2));
  fs.renameSync(ARQ + '.tmp', ARQ);
}

module.exports = { carregar, salvar };
