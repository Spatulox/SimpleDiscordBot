import {ChannelType, StageChannel} from "discord.js";
import {GuildChannelManager} from "./GuildChannelManager";
import {Bot} from "../../../bot/Bot";
import {Log} from "../../../utils/Log";

export class StageChannelManager extends GuildChannelManager {
    static async findInGuild(guildId: string, channelId: string): Promise<StageChannel | null> {
        const channel = await super.findInGuild(guildId, channelId);
        return channel instanceof StageChannel ? channel : null;
    }

    static async find(channelId: string): Promise<StageChannel | null> {
        const channel = await super.find(channelId);
        return channel instanceof StageChannel ? channel : null;
    }

    static findAll(guildId: string): StageChannel[] {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            Log.warn(`Guild ${guildId} not found`);
            return [];
        }
        return Array.from(guild.channels.cache.values()).filter(c => c instanceof StageChannel);
    }

    static async create(guildId: string, name: string, options?: {
        parent?: string;
        bitrate?: number;
        userLimit?: number;
        topic?: string;
    }): Promise<StageChannel> {
        return await super._create(guildId, {
            name,
            type: ChannelType.GuildStageVoice,
            ...options
        }) as StageChannel;
    }
}
