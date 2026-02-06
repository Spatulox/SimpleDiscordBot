import {EmbedBuilder, Message, MessageCreateOptions} from "discord.js";
import {GuildTextChannelManager} from "./GuildTextChannelManager";
import {Log} from "../../../utils/Log";

export class GuildMessageManager {


    /**
     * Overloads for send
     */
    static async send(channelId: string, content: string): Promise<Message>;
    static async send(channelId: string, embed: EmbedBuilder): Promise<Message>;
    static async send(channelId: string, options: MessageCreateOptions): Promise<Message>;

    /**
     * Impl
     */
    static async send(
        channelId: string,
        content_or_options: string | EmbedBuilder | MessageCreateOptions
    ): Promise<Message | null> {
        try {
            const channel = await GuildTextChannelManager.find(channelId);

            if(!channel){
                Log.error(`Channel ${channelId} not found in guild`);
                return null
            }

            const payload: MessageCreateOptions = typeof content_or_options === 'string'
                ? { content: content_or_options }
                : content_or_options as MessageCreateOptions;

            return await channel.send(payload);
        } catch (error) {
            Log.error(`Failed to send message to ${channelId}: ${error}`);
            throw error;
        }
    }

    /**
     * Delete message
     */
    static async delete(channelId: string, messageId: string): Promise<boolean> {
        try {
            const channel = await GuildTextChannelManager.find(channelId);
            if (!channel) {
                Log.error(`Channel ${channelId} not found`);
                return false;
            }

            const message = await channel.messages.fetch(messageId);
            await message.delete();

            Log.info(`Deleted message ${messageId} from ${channelId}`);
            return true;
        } catch (error) {
            Log.error(`Failed to delete message ${messageId} from ${channelId}: ${error}`);
            return false;
        }
    }

    /**
     * Fetch messages (last X messages, default 10)
     */
    static async fetch(channelId: string, limit: number = 10): Promise<Message[]> {
        try {
            const channel = await GuildTextChannelManager.find(channelId);
            if (!channel) {
                Log.error(`Channel ${channelId} not found`);
                return [];
            }

            const messages = await channel.messages.fetch({ limit });
            Log.info(`Fetched ${messages.size} messages from ${channelId}`);
            return Array.from(messages.values());
        } catch (error) {
            Log.error(`Failed to fetch messages from ${channelId}: ${error}`);
            return [];
        }
    }

    /**
     * Fetch single message
     */
    static async fetchOne(channelId: string, messageId: string): Promise<Message | null> {
        try {
            const channel = await GuildTextChannelManager.find(channelId);
            if (!channel) {
                Log.error(`Channel ${channelId} not found`);
                return null;
            }

            const message = await channel.messages.fetch(messageId);
            return message;
        } catch (error) {
            Log.error(`Failed to fetch message ${messageId} from ${channelId}: ${error}`);
            return null;
        }
    }
}