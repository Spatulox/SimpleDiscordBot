// src/utils/BotLog.ts
import {TextChannel, EmbedBuilder, Message} from 'discord.js';
import {Log} from "../utils/Log";
import {Bot} from "./Bot";

export class BotLog {
    private logChannel: TextChannel | null = null;
    private errorChannel: TextChannel | null = null;

    constructor() {}

    /**
     * Initialize Discord logging channels and update Bot.log references
     */
    public static initDiscordLogging(): void {
        // Find log channel
        if(Bot.config.logChannelId) {
            const logCh = Bot.client.channels.cache.get(Bot.config.logChannelId);
            if (logCh && logCh.isTextBased()) {
                Bot.log.logChannel = logCh as TextChannel;
                Log.info(`Discord log channel initialized: ${Bot.log.logChannel.name}`);
            } else {
                Log.warn(`Discord Log channel ${Bot.config.logChannelId} not found or not accessible`);
            }
        }

        if(Bot.config.errorChannelId) {
            // Find error channel
            const errorCh = Bot.client.channels.cache.get(Bot.config.errorChannelId);
            if (errorCh && errorCh.isTextBased()) {
                Bot.log.errorChannel = errorCh as TextChannel;
                Log.info(`Discord error channel initialized: ${Bot.log.errorChannel.name}`);
            } else {
                Log.warn(`Discord Error channel ${Bot.config.errorChannelId} not found or not accessible`);
            }
        }
    }

    /**
     * Send content to specific Discord channel
     */
    private async _sendToChannel(
        channel: TextChannel | null,
        content: string | EmbedBuilder,
        prefix: "info" | "warn" | "error" | "debug" = 'info'
    ): Promise<Message | void> {
        if (!channel) return;
        let msg

        try {
            if (content instanceof EmbedBuilder) {
                msg = await channel.send({ embeds: [content] });
            } else {
                const timestamp = `\`${new Date().toISOString()}\``;
                msg = await channel.send(`${prefix.toUpperCase()} ${timestamp} ${content}`);
            }
        } catch (error) {
            Log.error(`Failed to send to Discord channel: ${error}`);
        }

        return msg
    }

    /**
     * Send INFO log - TEXT or EMBED !
     */
    async sendLog(content: string | EmbedBuilder): Promise<Message | void> {
        Log.info(content instanceof EmbedBuilder ? 'Embed logged' : content);
        return await this._sendToChannel(this.logChannel, content, 'info');
    }

    /**
     * Send ERROR log - TEXT or EMBED !
     */
    async sendError(content: string | EmbedBuilder): Promise<Message | void> {
        Log.error(content instanceof EmbedBuilder ? 'Embed error logged' : content);
        return await this._sendToChannel(this.errorChannel, content, 'error');
    }

    /**
     * Send WARNING log - TEXT or EMBED (log channel)
     */
    async sendWarn(content: string | EmbedBuilder): Promise<Message | void> {
        Log.warn(content instanceof EmbedBuilder ? 'Embed warning logged' : content);
        return await this._sendToChannel(this.logChannel, content, 'warn');
    }

    /**
     * Send DEBUG log - TEXT or EMBED (log channel)
     */
    async sendDebug(content: string | EmbedBuilder): Promise<Message | void> {
        Log.debug(content instanceof EmbedBuilder ? 'Embed debug logged' : content);
        return await this._sendToChannel(this.logChannel, content, 'debug');
    }
}