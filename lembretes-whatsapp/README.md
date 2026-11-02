# Assistente de Lembretes no WhatsApp

Você manda o evento pelo WhatsApp, escolhe quando quer ser lembrado e recebe a notificação no WhatsApp.

## Como funciona

```
Você:  Dentista dia 15/11 às 14:30
Bot:   📌 Dentista
       📅 dom, 15/11/2026 às 14:30
       Quando quer ser lembrado? (ex: 5 6)
       1 - Na hora do evento
       2 - 30 minutos antes
       3 - 1 hora antes
       4 - 3 horas antes
       5 - 1 dia antes
       6 - 2 dias antes
       7 - 1 semana antes
Você:  5 6
Bot:   ✅ Evento salvo! (nº 1) 🔔 1 dia antes, 2 dias antes
```

Entende: `15/11`, `15/11/2027`, `hoje`, `amanhã`, `depois de amanhã`, `sexta`… e `14:30`, `14h`, `9h30`, `às 8`.
Se faltar dia ou horário, o bot pergunta.

Comandos: `lista`, `cancelar 3`, `sair`, `ajuda`.

## Precisa de 2 números

- **Número do bot**: um chip extra (ou WhatsApp Business num segundo número). É ele que fica conectado.
- **Seu número**: você conversa com o bot e recebe os lembretes como notificação normal.

> Dá para usar só o seu número (mandando no chat "Você"/mensagem para si mesmo),
> mas aí o WhatsApp **não toca notificação**, porque a mensagem vem de você mesmo.

## Instalação

Requisitos: Node.js 18+ e um computador/servidor ligado 24h (ex: VPS, Raspberry Pi, Railway, Render).

```bash
cd lembretes-whatsapp
npm install
cp .env.example .env     # coloque seu número em DONO=55DDDNUMERO
npm start
```

1. Aparece um QR Code no terminal.
2. No celular do **número do bot**: WhatsApp > Configurações > Aparelhos conectados > Conectar aparelho.
3. Pronto. Do **seu** número, mande `ajuda` para o bot.

A sessão fica salva na pasta `auth/` (não precisa escanear de novo) e os eventos em `data/eventos.json`.

Para manter rodando sempre: `npx pm2 start src/index.js --name lembretes`.

## Observações

- Usa a biblioteca [Baileys](https://github.com/WhiskeySockets/Baileys) (conexão não oficial, igual ao WhatsApp Web).
  Para uso pessoal funciona bem; evite mandar mensagens em massa para não arriscar bloqueio do número do bot.
- Só o número em `DONO` consegue usar o bot.
- Se o bot ficar desligado na hora de um lembrete, ele envia assim que voltar (marcado como "atrasado" se passou do evento).

## Testes

```bash
npm test
```
