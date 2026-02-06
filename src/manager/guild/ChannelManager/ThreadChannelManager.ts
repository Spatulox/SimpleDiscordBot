import {
    Message,
    StartThreadOptions,
    ThreadChannel
} from "discord.js";
import {GuildChannelManager} from "./GuildChannelManager";
import {GuildTextChannelManager} from "./GuildTextChannelManager";

export class ThreadChannelManager {

    static async findInGuild(guildId: string, channelId: string): Promise<ThreadChannel | null> {
        const channel = await GuildChannelManager.findInGuild(guildId, channelId);
        return channel?.isThread() ? channel as ThreadChannel : null;
    }

    static async find(channelId: string): Promise<ThreadChannel | null> {
        const channel = await GuildChannelManager.find(channelId);
        return channel?.isThread() ? channel as ThreadChannel : null;
    }

    static findAll(guildId: string): ThreadChannel[] {
        const channels = GuildChannelManager.findAll(guildId);
        return channels.filter(c => c.isThread()) as ThreadChannel[];
    }

    static async createFromChannel(
        parentId: string,
        options: StartThreadOptions
    ): Promise<ThreadChannel> {
        const channel = await GuildTextChannelManager.find(parentId);
        if (!channel || !channel.isTextBased()) {
            throw new Error('Parent must be a text-based channel');
        }

        const thread = await channel.threads.create(options);
        return thread as ThreadChannel;
    }

    static async createFromMessage(message: Message, options: StartThreadOptions): Promise<ThreadChannel> {
        const channel = await GuildChannelManager.find(message.id);
        if (!channel) throw new Error('Message channel not found');

        return await message.startThread(options)
    }

}