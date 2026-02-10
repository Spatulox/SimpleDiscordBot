import {
    TextChannel,
    Webhook,
    Message,
    ThreadChannel,
    WebhookMessageCreateOptions
} from 'discord.js';
import {EmbedManager} from "./EmbedManager";
import {Log} from "../../utils/Log";
import {Bot} from "../../bot/Bot";
import {SendableComponent, SendableComponentBuilder} from "../builder/SendableComponentBuilder";

export class WebhookManager {
    private webhook: Webhook | null = null;

    constructor(
        private readonly channel: TextChannel | ThreadChannel,
        private readonly name: string = Bot.config.botName || "",
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
     * Send message/text/component !
     */
    async send(content: string): Promise<Message | null>
    async send(content: SendableComponent): Promise<Message | null>
    async send(content: WebhookMessageCreateOptions): Promise<Message | null>

    async send(content: string | SendableComponent | WebhookMessageCreateOptions): Promise<Message | null> {
        const webhook = await this.getWebhook();
        const options: WebhookMessageCreateOptions = {};

        if (SendableComponentBuilder.isSendableComponent(content)) {
            const t = SendableComponentBuilder.buildMessage(content as SendableComponent | SendableComponent[])
            options.embeds = t.embeds;
            options.components = t.components;
        } else if( typeof content == 'string'){
            options.content = content
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