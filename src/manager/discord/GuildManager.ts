import {Guild, GuildMember, TextChannel, DMChannel, ThreadChannel, Collection} from 'discord.js';
import {Log} from "../../utils/Log";
import {Time} from "../../utils/times/UnitTime";
import {ChannelManager} from "./ChannelManager";
import {UserManager} from "./UserManager";

export class GuildManager {
    /**
     * Search channel by ID (TextChannel, DMChannel, ThreadChannel)
     */
    static async searchChannel(guildId: string, channelId: string): Promise<TextChannel | DMChannel | ThreadChannel | null> {
        try {
            return await ChannelManager.findInGuild(guildId, channelId);
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
     * Fetch all members with retry logic
     */
    static async fetchAllMembers(guild: Guild): Promise<Collection<string, GuildMember>> {
        const MAX_ATTEMPTS = 3;
        const RETRY_DELAY = Time.minute.MIN_05.toMilliseconds();

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                Log.info(`Fetching members for ${guild.name} (attempt ${attempt})`);
                const members = await guild.members.fetch();
                Log.info(`${guild.name}: ${members.size} members fetched`);
                return members;
            } catch (error) {
                Log.error(`Guild ${guild.name} fetch failed (attempt ${attempt}): ${error}`);

                if (attempt < MAX_ATTEMPTS) {
                    await new Promise(r => setTimeout(r, RETRY_DELAY));
                }
            }
        }
        throw new Error(`Failed to fetch members for ${guild.id} after ${MAX_ATTEMPTS} attempts`);
    }
}