import {GuildChannelManager} from "./GuildChannelManager";
import {ChannelType, ForumChannel} from "discord.js";
import {Bot} from "../../../bot/Bot";
import {Log} from "../../../utils/Log";

export class ForumChannelManager extends GuildChannelManager {
    static async findInGuild(guildId: string, channelId: string): Promise<ForumChannel | null> {
        const channel = await super.findInGuild(guildId, channelId);
        return channel instanceof ForumChannel ? channel : null;
    }

    static async find(channelId: string): Promise<ForumChannel | null> {
        const channel = await super.find(channelId);
        return channel instanceof ForumChannel ? channel : null;
    }

    static findAll(guildId: string): ForumChannel[] {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            Log.warn(`Guild ${guildId} not found`);
            return [];
        }
        return Array.from(guild.channels.cache.values()).filter(c => c instanceof ForumChannel);
    }


    static async create(guildId: string, name: string, options?: {
        parent?: string;
        topic?: string;
        nsfw?: boolean;
    }): Promise<ForumChannel> {
        return await super._create(guildId, {
            name,
            type: ChannelType.GuildForum,
            ...options
        }) as ForumChannel;
    }
}