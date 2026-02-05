import {
    Message,
    StartThreadOptions,
    ThreadChannel
} from "discord.js";
import {GuildChannelManager} from "./GuildChannelManager";
import {TextChannelManager} from "./TextChannelManager";
import {Bot} from "../../../bot/Bot";
import {Log} from "../../../utils/Log";

export class ThreadChannelManager extends GuildChannelManager {

    static async findInGuild(guildId: string, channelId: string): Promise<ThreadChannel | null> {
        const channel = await super.findInGuild(guildId, channelId);
        return channel instanceof ThreadChannel ? channel : null;
    }

    static async find(channelId: string): Promise<ThreadChannel | null> {
        const channel = await super.find(channelId);
        return channel instanceof ThreadChannel ? channel : null;
    }

    static findAll(guildId: string): ThreadChannel[] {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            Log.warn(`Guild ${guildId} not found`);
            return [];
        }
        return Array.from(guild.channels.cache.values()).filter(c => c instanceof ThreadChannel);
    }

    static async createFromChannel(
        parentId: string,
        options: StartThreadOptions
    ): Promise<ThreadChannel> {
        const channel = await TextChannelManager.find(parentId);
        if (!channel || !channel.isTextBased()) {
            throw new Error('Parent must be a text-based channel');
        }

        const thread = await channel.threads.create(options);
        return thread as ThreadChannel;
    }

    static async createFromMessage(message: Message, options: StartThreadOptions): Promise<ThreadChannel> {
        const channel = await BasicChannelManager.find(message.id);
        if (!channel) throw new Error('Message channel not found');

        return await message.startThread(options)
    }

}