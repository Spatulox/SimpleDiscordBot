import { TextChannel, DMChannel, ThreadChannel } from 'discord.js';
import {Bot} from "../../bot/Bot.js";
import {Log} from "../Log.js";

export class ChannelManager {
    /**
     * Search text-based channel by ID (cache or fetch)
     */
    static async find(channelId: string): Promise<TextChannel | DMChannel | ThreadChannel | null> {
        try {
            const channel = Bot.client.channels.cache.get(channelId) || await Bot.client.channels.fetch(channelId);
            return channel?.isTextBased() ? channel as TextChannel | DMChannel | ThreadChannel : null;
        } catch (error) {
            Log.error(`ChannelManager: Failed to fetch ${channelId}: ${error}`);
            return null;
        }
    }

    /**
     * Find channel in specific guild
     */
    static async findInGuild(guildId: string, channelId: string): Promise<TextChannel | null> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) return null;

            const channel = guild.channels.cache.get(channelId) as TextChannel;
            return channel?.isTextBased() ? channel : null;
        } catch (error) {
            Log.error(`ChannelManager: Failed guild channel ${guildId}/${channelId}: ${error}`);
            return null;
        }
    }

    /**
     * Get all text channels in guild
     */
    static getTextChannelsInGuild(guildId: string): TextChannel[] {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) return [];

        return guild.channels.cache
            .filter(channel => channel.isTextBased() && channel.type !== 11) // Exclude threads
            .map(channel => channel as TextChannel) as TextChannel[];
    }
}