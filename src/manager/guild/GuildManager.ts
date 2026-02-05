import {
    GuildMember,
    Collection,
    Guild,
    GuildBan,
    VoiceChannel, StageChannel, BanOptions, Channel
} from 'discord.js';
import {Log} from "../../utils/Log";
import {Time} from "../../utils/times/UnitTime";
import {UserManager} from "./UserManager";
import {Bot} from "../../bot/Bot";
import {GuildChannelManager} from "./ChannelManager/GuildChannelManager";
import {RoleManager} from "./RoleManager";
import {ForumChannelManager} from "./ChannelManager/ForumChannelManager";
import {NewsChannelManager} from "./ChannelManager/NewsChannelManager";
import {StageChannelManager} from "./ChannelManager/StageChannelManager";
import {GuildTextChannelManager} from "./ChannelManager/GuildTextChannelManager";
import {ThreadChannelManager} from "./ChannelManager/ThreadChannelManager";
import {GuildVoiceChannelManager} from "./ChannelManager/GuildVoiceChannelManager";

export class GuildManager {

    public static readonly role = RoleManager;
    public static readonly user= UserManager;
    public static readonly forumChannel= ForumChannelManager;
    public static readonly guildChannel= GuildChannelManager;
    public static readonly newsChannel= NewsChannelManager;
    public static readonly stageChannel= StageChannelManager;
    public static readonly textChannel= GuildTextChannelManager;
    public static readonly threadChannel= ThreadChannelManager;
    public static readonly voiceChannel= GuildVoiceChannelManager;

    static list(): Guild[] {
        return Array.from(Bot.client.guilds.cache.values());
    }

    /**
     * Search channel by ID (TextChannel, DMChannel, ThreadChannel)
     */
    static async searchChannel(guildId: string, channelId: string): Promise<Channel | null> {
        try {
            return await GuildChannelManager.findInGuild(guildId, channelId);
        } catch (error) {
            Log.error(`Failed to fetch channel ${channelId}: ${error}`);
            return null;
        }
    }

    /**
     * Search guild member by ID
     */
    static async searchMember(memberId: string, guildId: string): Promise<GuildMember | null> {
        try {
            return await UserManager.findInGuild(guildId, guildId);
        } catch (error) {
            Log.error(`Failed to fetch member ${memberId} in guild ${guildId}: ${error}`);
            return null;
        }
    }

    /**
     * Check if member is still in guild
     */
    static async isMemberInGuild(memberId: string, guildId: string): Promise<boolean> {
        try {
            return await UserManager.isInGuild(memberId, guildId);
        } catch (error: any) {
            return error.code !== 10007; // Unknown Member
        }
    }

    /**
     * Fetch all members with retry (heavy operation)
     */
    static async fetchAllMembers(guildId: string, MAX_ATTEMPTS: number = 3, RETRY_DELAY: number = Time.minute.MIN_05.toMilliseconds()): Promise<Collection<string, GuildMember>> {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) throw new Error(`Guild ${guildId} not found`);

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                Log.info(`UserManager: Fetching ${guild.name} members (attempt ${attempt})`);
                return await guild.members.fetch();
            } catch (error) {
                Log.error(`UserManager: Fetch failed (attempt ${attempt}): ${error}`);
                if (attempt < MAX_ATTEMPTS) {
                    await new Promise(r => setTimeout(r, RETRY_DELAY));
                }
            }
        }
        throw new Error(`Failed to fetch members after ${MAX_ATTEMPTS} attempts`);
    }

    static async ban(guildId: string, userId: string, banOption?: BanOptions): Promise<void> {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error(`Guild ${guildId} not found`);
        }

        try {
            await guild.members.ban(userId, banOption);
            Log.info(`Banned user ${userId} from guild ${guildId}`);
        } catch (error) {
            Log.error(`Failed to ban user ${userId} from guild ${guildId}: ${error}`);
            throw error;
        }
    }

    static async unban(guildId: string, userId: string, reason?: string): Promise<void> {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error(`Guild ${guildId} not found`);
        }

        try {
            await guild.members.unban(userId, reason);
            Log.info(`Unbanned user ${userId} from guild ${guildId}`);
        } catch (error) {
            Log.error(`Failed to unban user ${userId} from guild ${guildId}: ${error}`);
            throw error;
        }
    }

    static async listban(guildId: string, limit?: number): Promise<GuildBan[]> {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error(`Guild ${guildId} not found`);
        }

        try {
            const bans = await guild.bans.fetch({ limit });
            return Array.from(bans.values());
        } catch (error) {
            Log.error(`Failed to list bans in guild ${guildId}: ${error}`);
            throw error;
        }
    }

    static async moveMember(
        memberId: string,
        fromChannelId: string,
        toChannelId: string
    ): Promise<boolean> {
        try {
            const guild = Bot.client.guilds.cache.find(g =>
                g.channels.cache.has(fromChannelId) || g.channels.cache.has(toChannelId)
            );

            if (!guild) {
                throw new Error(`Guild containing channels ${fromChannelId} or ${toChannelId} not found`);
            }

            const member = await guild.members.fetch(memberId).catch(() => null);
            if (!member) {
                throw new Error(`Member ${memberId} not found in guild ${guild.id}`);
            }

            const fromChannel = guild.channels.cache.get(fromChannelId);
            const toChannel = guild.channels.cache.get(toChannelId);

            if (!fromChannel) {
                throw new Error(`From channel ${fromChannelId} not found`);
            }
            if (!toChannel) {
                throw new Error(`To channel ${toChannelId} not found`);
            }

            if (!(fromChannel instanceof VoiceChannel || fromChannel instanceof StageChannel)) {
                throw new Error(`From channel ${fromChannelId} is not a voice/stage channel`);
            }

            if (!(toChannel instanceof VoiceChannel || toChannel instanceof StageChannel)) {
                throw new Error(`To channel ${toChannelId} is not a voice/stage channel`);
            }

            if (member.voice.channelId !== fromChannelId) {
                throw new Error(`Member ${memberId} is not in channel ${fromChannelId}`);
            }

            try {
                await member.voice.setChannel(toChannel);
                Log.info(`Moved member ${memberId} from ${fromChannelId} to ${toChannelId}`);
            } catch (error) {
                Log.error(`Failed to move member ${memberId} from ${fromChannelId} to ${toChannelId}: ${error}`);
                throw error;
            }
            return true;
        } catch (e) {
            Log.error(`Failed to move member ${e}`);
            return false
        }
    }
}