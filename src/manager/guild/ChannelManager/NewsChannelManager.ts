import {ChannelType, GuildChannelCreateOptions, NewsChannel} from "discord.js";
import {GuildChannelManager} from "./GuildChannelManager";
import {Bot} from "../../../bot/Bot";
import {Log} from "../../../utils/Log";

export class NewsChannelManager extends GuildChannelManager {
    static async findInGuild(guildId: string, channelId: string): Promise<NewsChannel | null> {
        const channel = await super.findInGuild(guildId, channelId);
        return channel instanceof NewsChannel ? channel : null;
    }

    static async find(channelId: string): Promise<NewsChannel | null> {
        const channel = await super.find(channelId);
        return channel instanceof NewsChannel ? channel : null;
    }

    static findAll(guildId: string): NewsChannel[] {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            Log.warn(`Guild ${guildId} not found`);
            return [];
        }
        return Array.from(guild.channels.cache.values()).filter(c => c instanceof NewsChannel);
    }

    static async create(guildId: string, name: string, options?: Omit<GuildChannelCreateOptions, 'type'>): Promise<NewsChannel> {
        return await super._create(guildId, {
            name,
            type: ChannelType.GuildAnnouncement,
            ...options
        }) as NewsChannel;
    }
}