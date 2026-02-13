
# Simple Discord Bot ![badge-status](https://img.shields.io/badge/status-active-brightgreen)

[![npm version](https://img.shields.io/npm/v/@spatulox/simplediscordbot.svg)](https://npmjs.com/package/@spatulox/simplediscordbot)
[![downloads](https://img.shields.io/npm/dm/@spatulox/simplediscordbot.svg)](https://npmjs.com/package/@spatulox/simplediscordbot)
[![license](https://img.shields.io/npm/l/@spatulox/simplediscordbot.svg)](LICENSE)

**Ultra-simple Framework Discord.js TypeScript**

## Installation
```bash
npm i @spatulox/simplediscordbot
```

> **TypeScript Discord.js framework** - Simple, powerful, framework-ready. Built for developers who want clean bot architecture.

## Quick Start

```typescript
import {Bot, BotConfig, EmbedColor, Time} from "@spatulox/simplediscordbot";
import {Client, Events, GatewayIntentBits} from "discord.js";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const config: BotConfig = {
    defaultEmbedColor: EmbedColor.blue,
    botName: "Simple Discord Bot",
    log: {
        logChannelId: "YOUR_LOG_CHANNEL_ID",
        errorChannelId: "YOUR_ERROR_CHANNEL_ID",
        info: { console: true, discord: true },
        error: { console: true, discord: true },
        warn: { console: true, discord: true },
        debug: { console: true, discord: false }
    }
};

const bot = new Bot(client, config);

bot.client.on(Events.ClientReady, async () => {
    Bot.setRandomActivity(randomActivityList, Time.minute.MIN_10.toMilliseconds());
    console.log("Bot ready! ✨");
});
```
