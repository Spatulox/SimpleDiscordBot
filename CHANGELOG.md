# Changelog
Date format : dd/mm/yyy

### 13/04/2026 - 2.0.3
- Fix : WebhookManager can now send webhooks in threads

### 08/04/2026 - 2.0.1
- Fix the README.md to match the new BotLog system

### 08/04/2026 - 2.0.0
- GuildManager.find now seach in cache then fetch. Now can return Guild | null
- BotLog now have separate channelId for each log type
- EmbedManager.field now use two parameter instead of 4 (embed: EmbedBuilder, field: {name: string, value: string, inline?: boolean})
- Rework of WebHookManager : Can use local image or http(s) link
  - fix a crash when sending a Component V2 with webhook.send() method

### 08/04/2026 - 1.7.1
- WebHook Manager now don't crash when another bot with the same Webhook manager and webhook name try to access to the same webhook with the same name

### 08/04/2026 - 1.7.0
- SelectMenu can now be directly put inside Bot.log.xxx() and Bot.message.send(). no more need for SelectMenuManager.rows()