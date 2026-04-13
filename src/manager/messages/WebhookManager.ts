import {
    Base64Resolvable, BaseGuildTextChannel,
    BufferResolvable,
    Client,
    Message,
    Snowflake,
    TextChannel, ThreadChannel,
    Webhook,
    WebhookMessageCreateOptions
} from 'discord.js';
import {SendableComponent, SendableComponentBuilder} from "../builder/SendableComponentBuilder";
import {readFile} from 'fs/promises';
import {resolve} from 'path';
import {Bot} from "../../core/Bot";
import {EmbedManager} from "./EmbedManager";

export class WebhookManager {
    private webhook: Webhook | null = null;

    constructor(
        private readonly client: Client,
        private readonly name: string,
        private readonly avatarPathOrUrl?: string
    ) {
    }

    private async getAvatar(): Promise<BufferResolvable | Base64Resolvable | null> {
        if (!this.avatarPathOrUrl) return null;

        // Si c'est une URL http/https
        if (this.avatarPathOrUrl.startsWith('http://') || this.avatarPathOrUrl.startsWith('https://')) {
            return this.avatarPathOrUrl;
        }

        // Sinon c'est un chemin local (relatif ou absolu)
        try {
            const resolvedPath = resolve(process.cwd(), this.avatarPathOrUrl);
            // readFile retourne un Buffer qui est BufferResolvable
            return await readFile(resolvedPath);
        } catch (error) {
            Bot.log.warn(`Failed to load avatar from ${this.avatarPathOrUrl}: ${error}`);
            return null;
        }
    }

    /**
     * Récupère le channel à partir de l'ID ou utilise directement si TextChannel/ThreadChannel
     */
    private async getTextChannel(channelId: Snowflake): Promise<TextChannel | ThreadChannel> {
        const channel = await this.client.channels.fetch(channelId);

        if (!channel) {
            throw new Error(`Channel ${channelId} not found`);
        }

        if (
            !(channel instanceof TextChannel) &&
            !(channel instanceof ThreadChannel)
        ) {
            throw new Error(`Channel ${channelId} is not a TextChannel nor a ThreadChannel`);
        }
        return channel;
    }

    /**
     * Get or create webhook (lazy initialization)
     */
    private async getWebhook(channelId: Snowflake): Promise<Webhook> {
        if (this.webhook) return this.webhook;

        try {
            const textThreadChannel = await this.getTextChannel(channelId);
            let textChannel: BaseGuildTextChannel;

            if (textThreadChannel instanceof ThreadChannel) {
                const parent = textThreadChannel.parent;
                if (!parent || !(parent instanceof BaseGuildTextChannel)) {
                    throw new Error("Targeted channel parent is not a BaseGuildTextChannel");
                }
                textChannel = parent;
            } else {
                textChannel = textThreadChannel;
            }

            const webhooks = await textChannel.fetchWebhooks();

            this.webhook = webhooks.find(
                h =>
                    h.name === this.name &&
                    h.owner?.id === this.client.user?.id
                ) ??
                await textChannel.createWebhook({
                    name: this.name,
                    avatar: await this.getAvatar(),
                    reason: 'Auto-created by WebhookManager'
                });

            Bot.log.debug(`Webhook ${this.webhook.id} ready for channel ${channelId}`);
            return this.webhook;
        } catch (error) {
            Bot.log.error(`Failed to setup webhook for ${channelId}: ${error}`);
            throw error;
        }
    }

    /**
     * Send message/text/component !
     */
    async send(channelId: Snowflake, content: string): Promise<Message | null>
    async send(channelId: Snowflake, content: SendableComponent): Promise<Message | null>
    async send(channelId: Snowflake, content: WebhookMessageCreateOptions): Promise<Message | null>

    async send(
        channelId: Snowflake,
        content: string | SendableComponent | WebhookMessageCreateOptions
    ): Promise<Message | null> {
        const webhook = await this.getWebhook(channelId);
        let options: WebhookMessageCreateOptions = {};

        if (SendableComponentBuilder.isSendableComponent(content)) {
            options = SendableComponentBuilder.buildMessage(content);
        } else if (typeof content === 'string') {
            options.content = content;
        } else if (typeof content === 'object') {
            Object.assign(options, content);
        } else {
            options.content = String(content);
        }

        try {
            return await webhook.send(options);
        } catch (error) {
            Bot.log.error(`Webhook send failed to ${channelId}: ${error}`);
            return null;
        }
    }

    /**
     * Quick success embed
     */
    async success(channelId: Snowflake, message: string): Promise<Message | null> {
        return await this.send(channelId, EmbedManager.success(message));
    }

    /**
     * Quick error embed
     */
    async error(channelId: Snowflake, message: string): Promise<Message | null> {
        return await this.send(channelId, EmbedManager.error(message));
    }

    /**
     * Delete webhook
     */
    async delete(channelId: Snowflake, reason?: string): Promise<void> {
        if (!this.webhook) return;

        try {
            await this.webhook.delete(reason ?? 'Deleted by WebhookManager');
            Bot.log.info(`Webhook ${this.webhook.id} deleted from ${channelId}`);
        } catch (error) {
            if ((error as Error).message.includes('Unknown Webhook')) {
                Bot.log.warn(`Webhook already deleted from ${channelId}`);
            } else {
                Bot.log.error(`Failed to delete webhook from ${channelId}: ${error}`);
            }
        } finally {
            this.webhook = null;
        }
    }
}