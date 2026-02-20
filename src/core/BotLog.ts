// src/utils/BotLog.ts
import {TextChannel, EmbedBuilder, Message, ActionRowBuilder} from 'discord.js';
import {Log} from "../utils/Log";
import {Bot} from "./Bot";
import {SendableComponent} from "../manager/builder/SendableComponentBuilder";

export type ConfigLog = {
    logChannelId: string;
    errorChannelId: string;
    info: {console: boolean, discord: boolean}
    error: {console: boolean, discord: boolean}
    warn: {console: boolean, discord: boolean}
    debug: {console: boolean, discord: boolean}
}

export class BotLog {
    private static logChannel: TextChannel | null = null;
    private static  errorChannel: TextChannel | null = null;

    constructor() {}

    static config(): ConfigLog | undefined {
        return Bot.config.log
    }

    /**
     * Initialize Discord logging channels and update Bot.log references
     */
    public static async initDiscordLogging(): Promise<void> {
        if (!Bot.client.isReady()) {
            Log.warn('Client not ready for Discord logging init');
            return;
        }

        if (Bot.config.log?.logChannelId) {
            try {
                const logCh = await Bot.client.channels.fetch(Bot.config.log.logChannelId) as TextChannel;
                if (logCh?.isTextBased()) {
                    BotLog.logChannel = logCh;
                } else {
                    Log.warn(`Log channel ${Bot.config.log.logChannelId} invalid`);
                }
            } catch (error) {
                Log.error(`Log channel fetch failed: ${error}`);
            }
        }

        if (Bot.config.log?.errorChannelId) {
            try {
                const errorCh = await Bot.client.channels.fetch(Bot.config.log.errorChannelId) as TextChannel;
                if (errorCh?.isTextBased()) {
                    BotLog.errorChannel = errorCh;
                } else {
                    Log.warn(`Error channel ${Bot.config.log.errorChannelId} invalid`);
                }
            } catch (error) {
                Log.error(`Error channel fetch failed: ${error}`);
            }
        }
    }


    /**
     * Send content to specific Discord channel
     */
    private static  async _sendToChannel(
        channel: TextChannel | null,
        content: string | SendableComponent,
        prefix: "info" | "warn" | "error" | "debug" = 'info'
    ): Promise<Message | void> {
        if (!channel) return;
        let msg

        try {
            if (content instanceof EmbedBuilder) {
                const text = content.data.description ?? content.data.title;
                if (text) {
                    Log.info(text);
                }
                msg = await channel.send({embeds: [content]});
            } else if (content instanceof ActionRowBuilder) {
                msg = await channel.send({components: [content]});
            } else {
                const timestamp = `\`${new Date().toISOString()}\``;
                msg = await channel.send(`[${timestamp}] [${prefix.toUpperCase()}] ${content}`);
            }
        } catch (error) {
            Log.error(`Failed to send to Discord channel: ${error}`);
        }

        return msg
    }

    /**
     * Send INFO log - TEXT or EMBED ! Respecte config.log.info
     */
    static async info(content: string | SendableComponent): Promise<Message | void> {
        const logConfig = Bot.config.log;

        // 1. CONSOLE selon config (ou défaut ON)
        if (!logConfig || logConfig.info.console) {
            if(typeof content == 'string') { Log.info(content) }
        }

        // 2. Discord seulement si config + channel
        if (logConfig?.info.discord && this.logChannel) {
            return await this._sendToChannel(this.logChannel, content, 'info');
        }
    }

    /**
     * Send ERROR log - TEXT or EMBED ! Respecte config.log.error
     */
    static async error(content: string | SendableComponent): Promise<Message | void> {
        const logConfig = Bot.config.log;

        // 1. CONSOLE selon config (ou défaut ON)
        if (!logConfig || logConfig.error.console) {
            if(typeof content == 'string') { Log.error(content) }
        }

        // 2. Discord seulement si config + channel
        if (logConfig?.error.discord && this.errorChannel) {
            return await this._sendToChannel(this.errorChannel, content, 'error');
        }
    }

    /**
     * Send WARNING log - TEXT or EMBED ! Respecte config.log.warn
     */
    static async warn(content: string | SendableComponent): Promise<Message | void> {
        const logConfig = Bot.config.log;

        if (!logConfig || logConfig?.warn.console) {
            if(typeof content == 'string') { Log.warn(content) }
        }

        if (logConfig?.warn.discord && this.logChannel) {
            return await this._sendToChannel(this.logChannel, content, 'warn');
        }
    }

    /**
     * Send DEBUG log - TEXT or EMBED ! Respecte config.log.debug
     */
    static async debug(content: string | SendableComponent): Promise<Message | void> {
        const logConfig = Bot.config.log;

        if (!logConfig || logConfig?.debug.console) {
            if(typeof content == 'string') { Log.debug(content) }
        }

        if (logConfig?.debug.discord && this.logChannel) {
            return await this._sendToChannel(this.logChannel, content, 'debug');
        }
    }

}