// src/utils/BotLog.ts
import {TextChannel, EmbedBuilder} from 'discord.js';
import {Log} from "../utils/Log.js";
import {Bot} from "./Bot.js";

export class BotLog {
    private logChannel: TextChannel | null = null;
    private errorChannel: TextChannel | null = null;

    constructor() {}

    /**
     * Initialize Discord logging channels and update Bot.log references
     */
    public static initDiscordLogging(): void {
        // Find log channel
        const logCh = Bot.client.channels.cache.get(Bot.config.logChannelId);
        if (logCh && logCh.isTextBased()) {
            Bot.log.logChannel = logCh as TextChannel;
            Log.info(`Discord log channel initialized: ${Bot.log.logChannel.name}`);
        } else {
            Log.warn(`Log channel ${Bot.config.logChannelId} not found or not accessible`);
        }

        // Find error channel
        const errorCh = Bot.client.channels.cache.get(Bot.config.errorChannelId);
        if (errorCh && errorCh.isTextBased()) {
            Bot.log.errorChannel = errorCh as TextChannel;
            Log.info(`Discord error channel initialized: ${Bot.log.errorChannel.name}`);
        } else {
            Log.warn(`Error channel ${Bot.config.errorChannelId} not found or not accessible`);
        }
    }

    /**
     * Send content to specific Discord channel
     */
    private async _sendToChannel(
        channel: TextChannel | null,
        content: string | EmbedBuilder,
        prefix: "info" | "warn" | "error" = 'info'
    ): Promise<void> {
        if (!channel) return;

        try {
            if (content instanceof EmbedBuilder) {
                await channel.send({ embeds: [content] });
            } else {
                const timestamp = `\`${new Date().toISOString()}\``;
                await channel.send(`${prefix.toUpperCase()} ${timestamp} ${content}`);
            }
        } catch (error) {
            Log.error(`Failed to send to Discord channel: ${error}`);
        }
    }

    /**
     * Send INFO log - TEXT or EMBED !
     */
    async sendLog(content: string | EmbedBuilder): Promise<void> {
        Log.info(content instanceof EmbedBuilder ? 'Embed logged' : content);
        await this._sendToChannel(this.logChannel, content, 'info');
    }

    /**
     * Send ERROR log - TEXT or EMBED !
     */
    async sendError(content: string | EmbedBuilder): Promise<void> {
        Log.error(content instanceof EmbedBuilder ? 'Embed error logged' : content);
        await this._sendToChannel(this.errorChannel, content, 'error');
    }

    /**
     * Send WARNING log - TEXT or EMBED (log channel)
     */
    async sendWarn(content: string | EmbedBuilder): Promise<void> {
        Log.warn(content instanceof EmbedBuilder ? 'Embed warning logged' : content);
        await this._sendToChannel(this.logChannel, content, 'warn');
    }
}