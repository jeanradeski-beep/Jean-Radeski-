// Lê "Dentista 15/11 14:30", "Reunião amanhã às 9h", "Aniversário da Ana dia 20/12 às 19h30"
const DIAS_SEMANA = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

function semAcento(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function extrairData(texto, agora) {
  const t = semAcento(texto.toLowerCase());
  let m = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (m) {
    const dia = +m[1], mes = +m[2] - 1;
    let ano = m[3] ? +m[3] : agora.getFullYear();
    if (ano < 100) ano += 2000;
    const d = new Date(ano, mes, dia);
    if (d.getMonth() !== mes) return null; // data inválida (ex: 31/02)
    // Sem ano e já passou: assume o ano que vem
    if (!m[3] && d < new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())) d.setFullYear(ano + 1);
    return { data: d, trecho: texto.substr(m.index, m[0].length) };
  }
  const base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  if ((m = t.match(/\bdepois de amanha\b/))) { base.setDate(base.getDate() + 2); return { data: base, trecho: texto.substr(m.index, m[0].length) }; }
  if ((m = t.match(/\bamanha\b/))) { base.setDate(base.getDate() + 1); return { data: base, trecho: texto.substr(m.index, m[0].length) }; }
  if ((m = t.match(/\bhoje\b/))) return { data: base, trecho: texto.substr(m.index, m[0].length) };
  m = t.match(/\b(domingo|segunda|terca|quarta|quinta|sexta|sabado)(?:-feira)?\b/);
  if (m) {
    const alvo = DIAS_SEMANA.indexOf(m[1]);
    let diff = (alvo - base.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    base.setDate(base.getDate() + diff);
    return { data: base, trecho: texto.substr(m.index, m[0].length) };
  }
  return null;
}

function extrairHora(texto) {
  const t = semAcento(texto.toLowerCase());
  const m = t.match(/\b(\d{1,2})(?:\s*[:h]\s*(\d{2})?|\s*horas?)\b/) ||
            t.match(/\bas\s+(\d{1,2})\b/);
  if (!m) return null;
  const h = +m[1];
  const min = m[2] ? +m[2] : 0;
  if (h > 23 || min > 59) return null;
  return { h, min, trecho: texto.substr(m.index, m[0].length) };
}

const SEMPRE_REMOVER = new Set(['dia', 'as', 'às', 'proxima', 'próxima', 'proximo', 'próximo']);
const CONECTORES = new Set(['de', 'do', 'da', 'no', 'na', 'em', 'para', 'pra', 'e', 'a', 'o']);

function limparTitulo(texto, trechos) {
  let t = texto;
  for (const tr of trechos) if (tr) t = t.replace(tr, ' ');
  let p = t.split(/\s+/).filter(w => w && !SEMPRE_REMOVER.has(w.toLowerCase()));
  while (p.length && CONECTORES.has(p[p.length - 1].toLowerCase().replace(/[,.]/g, ''))) p.pop();
  while (p.length && CONECTORES.has(p[0].toLowerCase())) p.shift();
  t = p.join(' ').replace(/[\s,.-]+$/, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function interpretarEvento(texto, agora = new Date()) {
  const d = extrairData(texto, agora);
  const h = extrairHora(d ? texto.replace(d.trecho, ' ') : texto);
  const titulo = limparTitulo(texto, [d && d.trecho, h && h.trecho]);
  let quando = null;
  if (d && h) {
    quando = new Date(d.data);
    quando.setHours(h.h, h.min, 0, 0);
  }
  return { titulo, data: d && d.data, hora: h, quando };
}

module.exports = { interpretarEvento, extrairData, extrairHora };
