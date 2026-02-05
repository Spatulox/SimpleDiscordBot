import {ChannelType, VoiceChannel} from "discord.js";
import {GuildChannelManager} from "./GuildChannelManager";
import {Bot} from "../../../bot/Bot";
import {Log} from "../../../utils/Log";

export class VoiceChannelManager extends GuildChannelManager {
    static async findInGuild(guildId: string, channelId: string): Promise<VoiceChannel | null> {
        const channel = await super.findInGuild(guildId, channelId);
        return channel?.isVoiceBased() ? channel as VoiceChannel : null;
    }

    static async find(channelId: string): Promise<VoiceChannel | null> {
        const channel = await super.find(channelId);
        return channel?.isVoiceBased() ? channel as VoiceChannel : null;
    }

    static findAll(guildId: string): VoiceChannel[] {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            Log.warn(`Guild ${guildId} not found`);
            return [];
        }
        return Array.from(guild.channels.cache.values()).filter(c => c instanceof VoiceChannel);
    }

    static async create(guildId: string, name: string, options?: {
        parent?: string;
        bitrate?: number;
        userLimit?: number;
    }): Promise<VoiceChannel> {
        return await super._create(guildId, {
            name,
            type: ChannelType.GuildVoice,
            ...options
        }) as VoiceChannel;
    }
}