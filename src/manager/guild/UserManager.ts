import {GuildMember, User} from 'discord.js';
import {Bot} from "../../bot/Bot";
import {Log} from "../../utils/Log";

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
    static async findInGuild(guildId: string, memberId: string): Promise<GuildMember | null> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) throw new Error(`Guild ${guildId} not found`);

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
    static async isInGuild(guildId: string, userId: string): Promise<boolean> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) return false;

            await guild.members.fetch({ user: userId, force: true });
            return true;
        } catch (error: any) {
            return error.code !== 10007; // Unknown Member
        }
    }

    /**
     * Check if user is banned from guild
     */
    static async isBanned(guildId: string, userId: string): Promise<boolean> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) {
                Log.warn(`Guild ${guildId} not found`);
                return false;
            }

            const ban = await guild.bans.fetch(userId);
            return !!ban;
        } catch (error: any) {
            Log.debug(`User ${userId} is not banned from guild ${guildId}`);
            return false;
        }
    }

    /**
     * Deconnect a member from a voice
     */
    static async deconnectFromVoice(guildId: string, memberId: string): Promise<void> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) {
                throw new Error(`Guild ${guildId} not found`);
            }

            const member = await guild.members.fetch(memberId);
            if (!member.voice.channel) {
                throw new Error(`Member ${memberId} is not in a voice channel`);
            }

            await member.voice.disconnect();
            Log.info(`Disconnected member ${memberId} from voice in guild ${guildId}`);
        } catch (error) {
            Log.error(`Failed to disconnect member ${memberId} from voice in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Check if a member is in voice
     */
    static async isInVoice(memberId: string, guildId: string): Promise<boolean> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) return false;

            const member = await guild.members.fetch(memberId);
            return member.voice.channelId !== null;
        } catch (error) {
            Log.debug(`Member ${memberId} not found or not in voice in guild ${guildId}`);
            return false;
        }
    }

    /**
     * Mute a member
     */
    static async mute(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) throw new Error(`Guild ${guildId} not found`);

            const member = await guild.members.fetch(memberId);
            await member.voice.setMute(true, reason);
            Log.info(`Server muted ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to server mute ${memberId} in ${guildId}:, error`);
            throw error;
        }
    }

    /**
     * Unmute a member
     */
    static async unmute(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) throw new Error(`Guild ${guildId} not found`);

            const member = await guild.members.fetch(memberId);
            await member.voice.setMute(false, reason);
            Log.info(`Server unmuted ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to server unmute ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Deafen a member
     */
    static async deafen(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) throw new Error(`Guild ${guildId} not found`);

            const member = await guild.members.fetch(memberId);
            await member.voice.setDeaf(true, reason);
            Log.info(`Server deafened ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to server deafen ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Undeafen member voice
     */
    static async undeafen(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) throw new Error(`Guild ${guildId} not found`);

            const member = await guild.members.fetch(memberId);
            await member.voice.setDeaf(false, reason);
            Log.info(`Server undeafened ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to server undeafen ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Timeout a member
     */
    static async timeout(guildId: string, memberId: string, duration: number, reason?: string): Promise<void> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) throw new Error(`Guild ${guildId} not found`);

            const member = await guild.members.fetch(memberId);
            const expires = Date.now() + duration

            await member.timeout(expires, reason);
            Log.info(`Timed out ${memberId} for ${duration}ms in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to timeout ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Remove the timeout of a member
     */
    static async untimeout(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) throw new Error(`Guild ${guildId} not found`);

            const member = await guild.members.fetch(memberId);
            await member.timeout(null, reason);
            Log.info(`Untimed out ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to untimeout ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Kick a member
     */
    static async kick(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) throw new Error(`Guild ${guildId} not found`);

            const member = await guild.members.fetch(memberId);
            await member.kick(reason);
            Log.info(`Kicked ${memberId} from guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to kick ${memberId} from ${guildId}: ${error}`);
            throw error;
        }
    }
}