// src/discord/WebhookManager.ts
import {
    TextChannel,
    Webhook,
    EmbedBuilder,
    Message,
    ThreadChannel,
    MessageCreateOptions, WebhookMessageCreateOptions
} from 'discord.js';
import {EmbedManager} from "./EmbedManager.js";
import {Log} from "../Log.js";
import {Bot} from "../../bot/Bot.js";

export class WebhookManager {
    private webhook: Webhook | null = null;

    constructor(
        private readonly channel: TextChannel | ThreadChannel,
        private readonly name: string = Bot.config.botName,
        private readonly avatarURL?: string
    ) {}

    private get textChannel(): TextChannel {
        return this.channel instanceof ThreadChannel
            ? this.channel.parent! as TextChannel
            : this.channel as TextChannel;
    }

    /**
     * Get or create webhook (lazy initialization)
     */
    private async getWebhook(): Promise<Webhook> {
        if (this.webhook) return this.webhook;

        try {
            const webhooks = await this.textChannel.fetchWebhooks();
            this.webhook = webhooks.find(h => h.name === this.name) ??
                await this.textChannel.createWebhook({
                    name: this.name,
                    avatar: this.avatarURL,
                    reason: 'Auto-created by WebhookManager'
                });

            Log.info(`Webhook ${this.webhook.id} ready for ${this.textChannel.id}`);
            return this.webhook;
        } catch (error) {
            Log.error(`Failed to setup webhook: ${error}`);
            throw error;
        }
    }

    /**
     * Send message/text/embed - EmbedBuilder NATIVE !
     */
    async send(content: string | EmbedBuilder | MessageCreateOptions): Promise<Message | null> {
        const webhook = await this.getWebhook();
        const options: WebhookMessageCreateOptions = {};

        if (content instanceof EmbedBuilder) {
            options.embeds = [content];
        } else if (typeof content === 'object') {
            Object.assign(options, content);
        } else {
            options.content = content;
        }

        if (this.channel instanceof ThreadChannel) {
            options.threadId = this.channel.id;
        }

        try {
            const message = await webhook.send(options);
            Log.info(`Webhook sent to ${this.channel.id}: ${content}`);
            return message;
        } catch (error) {
            Log.error(`Webhook send failed ${this.channel.id}: ${error}`);
            return null;
        }
    }

    /**
     * Quick success embed
     */
    async success(message: string): Promise<Message | null> {
        return await this.send(EmbedManager.success(message));
    }

    /**
     * Quick error embed
     */
    async error(message: string): Promise<Message | null> {
        return await this.send(EmbedManager.error(message));
    }

    /**
     * Delete webhook
     */
    async delete(reason?: string): Promise<void> {
        if (!this.webhook) return;

        try {
            await this.webhook.delete(reason ?? 'Deleted by WebhookManager');
            Log.info(`Webhook ${this.webhook.id} deleted`);
        } catch (error) {
            if ((error as Error).message.includes('Unknown Webhook')) {
                Log.warn('Webhook already deleted');
            } else {
                Log.error(`Failed to delete webhook: ${error}`);
            }
        } finally {
            this.webhook = null;
        }
    }
}