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

## Usando o seu próprio número (padrão)

O bot se conecta ao **seu WhatsApp** como um "aparelho conectado" (igual ao WhatsApp Web).
Você conversa com ele no chat **"Você"** (mensagem para si mesmo) e os lembretes chegam nesse chat.

> ⚠️ Como a mensagem vem de você mesmo, o WhatsApp **não toca notificação**.
> Dica: fixe o chat "Você" no topo para ver os lembretes.
> Se um dia quiser que toque, coloque outro número em `DONO` no `.env` (ex: um chip extra conectado no bot).

## Instalação

Requisitos: Node.js 18+ e um computador/servidor ligado 24h (ex: VPS, Raspberry Pi, Railway, Render).

```bash
cd lembretes-whatsapp
npm install
cp .env.example .env     # deixe DONO vazio para usar o seu próprio número
npm start
```

1. Aparece um QR Code no terminal.
2. No seu celular: WhatsApp > Configurações > Aparelhos conectados > Conectar aparelho.
3. Abra o chat **"Você"** e mande `ajuda`.

A sessão fica salva na pasta `auth/` (não precisa escanear de novo) e os eventos em `data/eventos.json`.

Para manter rodando sempre: `npx pm2 start src/index.js --name lembretes`.

## Observações

- Usa a biblioteca [Baileys](https://github.com/WhiskeySockets/Baileys) (conexão não oficial, igual ao WhatsApp Web).
  Para uso pessoal funciona bem; como só manda mensagens para você mesmo, o risco de bloqueio é muito baixo.
- Só você consegue usar o bot (ele ignora conversas com outras pessoas e grupos).
- Se o bot ficar desligado na hora de um lembrete, ele envia assim que voltar (marcado como "atrasado" se passou do evento).

## Testes

```bash
npm test
```
