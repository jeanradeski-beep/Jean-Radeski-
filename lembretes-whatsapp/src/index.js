process.env.TZ = process.env.TZ || 'America/Sao_Paulo';
try { process.loadEnvFile?.(require('path').join(__dirname, '..', '.env')); } catch {}

const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket, useMultiFileAuthState, DisconnectReason,
  fetchLatestBaileysVersion, jidNormalizedUser,
} = require('@whiskeysockets/baileys');
const { Bot } = require('./bot');
const store = require('./store');

const DONO = (process.env.DONO || '').replace(/\D/g, '');
if (!DONO) {
  console.error('❌ Defina seu número no arquivo .env (DONO=5541999999999). Veja .env.example');
  process.exit(1);
}

// Números BR podem aparecer com ou sem o 9 extra no WhatsApp
function variantes(num) {
  const v = new Set([num]);
  if (num.startsWith('55') && num.length === 13) v.add(num.slice(0, 4) + num.slice(5));
  if (num.startsWith('55') && num.length === 12) v.add(num.slice(0, 4) + '9' + num.slice(4));
  return v;
}
const NUMEROS_DONO = variantes(DONO);
const numeroDe = jid => (jid || '').split('@')[0].split(':')[0];

let sock = null;
const idsEnviados = new Set(); // evita responder às próprias mensagens

const jidDestino = () => bot.db.donoJid || `${DONO}@s.whatsapp.net`;

async function enviar(texto) {
  if (!sock) throw new Error('WhatsApp desconectado');
  const r = await sock.sendMessage(jidDestino(), { text: texto });
  if (r?.key?.id) idsEnviados.add(r.key.id);
}

const bot = new Bot(enviar);

async function conectar() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '..', 'auth'));
  const { version } = await fetchLatestBaileysVersion();
  sock = makeWASocket({ version, auth: state, logger: pino({ level: 'warn' }), markOnlineOnConnect: false });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n📱 Escaneie o QR Code no WhatsApp do número do BOT:');
      console.log('   WhatsApp > Configurações > Aparelhos conectados > Conectar aparelho\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') console.log(`✅ Conectado como ${numeroDe(sock.user.id)}. Lembretes para ${DONO}.`);
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.error('❌ Sessão desconectada no celular. Apague a pasta "auth" e rode de novo.');
        process.exit(1);
      }
      console.log('🔄 Conexão caiu, reconectando...');
      setTimeout(conectar, 3000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages) {
      try {
        if (!m.message || idsEnviados.has(m.key.id)) continue;
        const remoto = m.key.remoteJid || '';
        if (remoto.endsWith('@g.us') || remoto === 'status@broadcast') continue;

        const meuNumero = numeroDe(sock.user?.id);
        const candidatos = [remoto, m.key.senderPn, m.key.participantPn].map(numeroDe);
        const doDono = !m.key.fromMe && candidatos.some(n => NUMEROS_DONO.has(n));
        // Modo "um número só": você manda no chat "Você" (mensagem para si mesmo)
        const chatProprio = m.key.fromMe && numeroDe(jidNormalizedUser(remoto)) === meuNumero && NUMEROS_DONO.has(meuNumero);
        if (!doDono && !chatProprio) continue;

        const texto = m.message.conversation || m.message.extendedTextMessage?.text || '';
        if (!texto) continue;

        // Guarda o chat do dono para mandar os lembretes no lugar certo
        if (bot.db.donoJid !== remoto) { bot.db.donoJid = remoto; store.salvar(bot.db); }

        await bot.responder(texto);
      } catch (e) {
        console.error('Erro ao processar mensagem:', e);
      }
    }
  });
}

// Confere os lembretes a cada 30 segundos
setInterval(() => {
  if (sock?.user) bot.verificar().catch(e => console.error('Erro ao enviar lembrete:', e.message));
}, 30_000);

conectar();
