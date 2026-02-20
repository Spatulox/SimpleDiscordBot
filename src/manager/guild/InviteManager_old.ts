import { Invite, Collection } from 'discord.js';
import {Bot} from "../../core/Bot";
import {Log} from "../../utils/Log";

export class InviteManager {
    /**
     * Check if invite is old (more than 1 hour)
     */
    static isOld(invite: Invite, excludedInvite: string[] = []): boolean {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1h

        if (!invite.createdAt) {
            return false;
        }
        
        return (
            invite.maxAge !== 0 &&
            !excludedInvite.includes(invite.code) &&
            invite.createdAt < oneHourAgo
        );
    }

    /**
     * Delete single invite
     */
    static async delete(invite: Invite): Promise<boolean> {
        try {
            await invite.delete();

            if (invite.createdAt) {
                Log.info(`🗑️ Deleted invite \`${invite.code}\` created ${invite.createdAt.toDateString()}`);
                return true;
            }

            Log.warn(`Invite ${invite.code} deleted but no createdAt`);
            return true;
        } catch (error: any) {
            Log.error(`Failed to delete invite ${invite.code}: ${error.message}`);
            return false;
        }
    }

    /**
     * Delete all old invites from guild
     */
    static async cleanupGuild(guildId: string): Promise<number> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) {
                Log.error(`Guild ${guildId} not found for invite cleanup`);
                return 0;
            }

            const invites = await guild.invites.fetch();
            let deletedCount = 0;

            for (const [_code, invite] of invites) {
                if (this.isOld(invite)) {
                    const success = await this.delete(invite);
                    if (success) deletedCount++;

                    // Rate limit protection
                    await new Promise(r => setTimeout(r, 100));
                }
            }

            Log.info(`Invite cleanup ${guild.name}: ${deletedCount} old invites deleted`);
            return deletedCount;
        } catch (error) {
            Log.error(`Invite cleanup failed for ${guildId}: ${error}`);
            return 0;
        }
    }

    /**
     * Get all invites from guild
     */
    static async fetchGuildInvites(guildId: string): Promise<Collection<string, Invite>> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) throw new Error(`Guild ${guildId} not found`);

            return await guild.invites.fetch();
        } catch (error) {
            Log.error(`Failed to fetch invites for ${guildId}: ${error}`);
            return new Collection();
        }
    }

    /**
     * Get old invites only
     */
    static getOldInvites(invites: Collection<string, Invite>): Invite[] {
        return invites.filter(invite => this.isOld(invite)).map(invite => invite);
    }
}