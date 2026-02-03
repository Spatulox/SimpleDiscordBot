import {Collection, GuildMember, User} from 'discord.js';
import {Bot} from "../../bot/Bot.js";
import {Log} from "../Log.js";
import {Time} from "../times/UnitTime.js";

export class UserManager {

    /**
     * Find member in specific guild
     */
    static async find(userId: string): Promise<User | null> {
        try {
            return await Bot.client.users.fetch(userId);
        } catch (error) {
            Log.error(`UserManager: Member ${userId} not found`);
            return null;
        }
    }

    /**
     * Find member in specific guild
     */
    static async findInGuild(memberId: string, guildId: string): Promise<GuildMember | null> {
        try {
            const guild = await Bot.client.guilds.fetch(guildId);
            const member = await guild.members.fetch({ user: memberId, force: true });
            return member ?? null;
        } catch (error) {
            Log.error(`UserManager: Member ${memberId} not found in ${guildId}`);
            return null;
        }
    }

    /**
     * Check if user is still in guild
     */
    static async isInGuild(userId: string, guildId: string): Promise<boolean> {
        try {
            const guild = await Bot.client.guilds.fetch(guildId);
            await guild.members.fetch({ user: userId, force: true });
            return true;
        } catch (error: any) {
            return error.code !== 10007;
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
}