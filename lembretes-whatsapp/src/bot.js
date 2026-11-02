const { interpretarEvento, extrairData, extrairHora } = require('./parser');
const { menuOpcoes, lerEscolhas } = require('./opcoes');
const store = require('./store');

const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const p2 = n => String(n).padStart(2, '0');
const fmtData = d => `${SEMANA[d.getDay()]}, ${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()} às ${p2(d.getHours())}:${p2(d.getMinutes())}`;

function fmtFalta(min) {
  if (min <= 0) return 'é agora!';
  if (min % 10080 === 0) return `falta ${min / 10080} semana(s)`;
  if (min % 1440 === 0) return `falta(m) ${min / 1440} dia(s)`;
  if (min % 60 === 0) return `falta(m) ${min / 60} hora(s)`;
  return `faltam ${min} minutos`;
}

const AJUDA = `🤖 *Assistente de Lembretes*

Me mande o evento com dia e horário. Exemplos:
• _Dentista dia 15/11 às 14:30_
• _Reunião com João amanhã às 9h_
• _Pagar boleto sexta 10h_

Comandos:
• *lista* – ver próximos eventos
• *cancelar 3* – apagar o evento nº 3
• *sair* – desistir do cadastro em andamento
• *ajuda* – ver esta mensagem`;

class Bot {
  constructor(enviar) {
    this.enviar = enviar; // (texto) => Promise
    this.db = store.carregar();
    this.rascunho = null; // evento sendo cadastrado
  }

  async responder(textoBruto, agora = new Date()) {
    const texto = textoBruto.trim();
    const cmd = texto.toLowerCase();

    if (['ajuda', 'menu', 'oi', 'olá', 'ola', '/start'].includes(cmd)) return this.enviar(AJUDA);
    if (['sair', 'parar', 'desistir'].includes(cmd)) { this.rascunho = null; return this.enviar('Ok, cadastro cancelado.'); }
    if (cmd === 'lista' || cmd === 'listar') return this.enviar(this.lista());
    const mc = cmd.match(/^(?:cancelar|apagar|excluir)\s+(\d+)$/);
    if (mc) return this.enviar(this.cancelar(+mc[1]));

    const r = this.rascunho;
    if (r && r.etapa === 'data') {
      const d = extrairData(texto, agora);
      if (!d) return this.enviar('Não entendi a data 😅 Ex: *15/11*, *amanhã*, *sexta*');
      r.data = d.data;
      const h = extrairHora(texto.replace(d.trecho, ' '));
      if (h) r.hora = h;
      return this.avancar(agora);
    }
    if (r && r.etapa === 'hora') {
      const h = extrairHora(/^\d{1,2}$/.test(texto) ? texto + 'h' : texto);
      if (!h) return this.enviar('Não entendi o horário 😅 Ex: *14:30*, *9h*');
      r.hora = h;
      return this.avancar(agora);
    }
    if (r && r.etapa === 'opcoes') {
      const esc = lerEscolhas(texto);
      if (!esc || !esc.length) return this.enviar(`Responda com os números das opções, ex: *5 6*\n\n${menuOpcoes()}`);
      return this.salvar(esc, agora);
    }
    if (r && r.etapa === 'titulo') {
      r.titulo = texto;
      return this.avancar(agora);
    }

    // Novo evento
    const ev = interpretarEvento(texto, agora);
    this.rascunho = { titulo: ev.titulo, data: ev.data, hora: ev.hora };
    return this.avancar(agora);
  }

  async avancar(agora) {
    const r = this.rascunho;
    if (!r.titulo) { r.etapa = 'titulo'; return this.enviar('Qual é o evento? (ex: *Dentista*)'); }
    if (!r.data) { r.etapa = 'data'; return this.enviar(`📌 *${r.titulo}*\nQual dia? (ex: *15/11*, *amanhã*, *sexta*)`); }
    if (!r.hora) { r.etapa = 'hora'; return this.enviar(`📌 *${r.titulo}*\nQue horas? (ex: *14:30*, *9h*)`); }
    const quando = new Date(r.data);
    quando.setHours(r.hora.h, r.hora.min, 0, 0);
    if (quando <= agora) {
      r.data = null; r.etapa = 'data';
      return this.enviar('Essa data/hora já passou. Qual dia? (ex: *15/11*)');
    }
    r.quando = quando;
    r.etapa = 'opcoes';
    return this.enviar(`📌 *${r.titulo}*\n📅 ${fmtData(quando)}\n\nQuando quer ser lembrado? Pode escolher mais de um (ex: *5 6*):\n\n${menuOpcoes()}`);
  }

  async salvar(escolhas, agora) {
    const r = this.rascunho;
    const validas = escolhas.filter(o => r.quando.getTime() - o.min * 60000 > agora.getTime());
    const passadas = escolhas.filter(o => !validas.includes(o));
    if (!validas.length) return this.enviar('Todas essas opções já passaram 😅 Escolha outras (ex: *1 2*).');

    const ev = {
      id: this.db.proximoId++,
      titulo: r.titulo,
      quando: r.quando.toISOString(),
      lembretes: validas.map(o => ({ min: o.min, nome: o.nome, enviado: false })),
    };
    this.db.eventos.push(ev);
    store.salvar(this.db);
    this.rascunho = null;

    let msg = `✅ Evento salvo! (nº ${ev.id})\n📌 *${ev.titulo}*\n📅 ${fmtData(r.quando)}\n🔔 ${validas.map(o => o.nome).join(', ')}`;
    if (passadas.length) msg += `\n\n⚠️ Ignorei (já passou): ${passadas.map(o => o.nome).join(', ')}`;
    return this.enviar(msg);
  }

  lista() {
    const evs = this.db.eventos.slice().sort((a, b) => a.quando.localeCompare(b.quando));
    if (!evs.length) return 'Nenhum evento agendado. Mande um, ex: _Dentista 15/11 14:30_';
    return '📋 *Próximos eventos*\n\n' + evs.map(e =>
      `*${e.id}.* ${e.titulo}\n    📅 ${fmtData(new Date(e.quando))}\n    🔔 ${e.lembretes.map(l => (l.enviado ? '✔️ ' : '') + l.nome).join(', ')}`
    ).join('\n\n') + '\n\nPara apagar: *cancelar nº*';
  }

  cancelar(id) {
    const i = this.db.eventos.findIndex(e => e.id === id);
    if (i < 0) return `Não achei o evento nº ${id}. Mande *lista* para ver.`;
    const [e] = this.db.eventos.splice(i, 1);
    store.salvar(this.db);
    return `🗑️ Evento "${e.titulo}" cancelado.`;
  }

  // Chamado a cada X segundos: envia os lembretes que venceram
  async verificar(agora = new Date()) {
    let mudou = false;
    for (const e of this.db.eventos) {
      const quando = new Date(e.quando);
      for (const l of e.lembretes) {
        if (l.enviado || agora.getTime() < quando.getTime() - l.min * 60000) continue;
        const faltaMin = Math.round((quando - agora) / 60000);
        const msg = faltaMin < -60
          ? `⏰ *Lembrete (atrasado)*: ${e.titulo}\n📅 Era ${fmtData(quando)}`
          : `⏰ *Lembrete*: ${e.titulo}\n📅 ${fmtData(quando)}\n⏳ ${fmtFalta(l.min)}`;
        await this.enviar(msg);
        l.enviado = true;
        mudou = true;
      }
    }
    // Remove eventos já concluídos
    const antes = this.db.eventos.length;
    this.db.eventos = this.db.eventos.filter(e => e.lembretes.some(l => !l.enviado) || new Date(e.quando) > agora);
    if (mudou || antes !== this.db.eventos.length) store.salvar(this.db);
  }
}

module.exports = { Bot, fmtData };
