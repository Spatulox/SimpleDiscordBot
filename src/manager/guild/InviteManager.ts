import {
    Invite,
    InviteCreateOptions
} from 'discord.js';
import { Log } from '../../utils/Log';
import {GuildChannelManager} from "./ChannelManager/GuildChannelManager";
import {GuildManager} from "./GuildManager";

export class InviteManager {

    /**
     * Create an invite for a channel
     */
    static async create(
        channelId: string,
        options: {
            maxAge?: number;
            maxUses?: number;
            reason?: string;
            temporary?: boolean;
        } = {}
    ): Promise<Invite> {
        try {
            const channel = await GuildChannelManager.find(channelId);
            if (!channel) {
                throw new Error(`Channel ${channelId} not found`);
            }

            const guild = channel.guild;
            const inviteOptions: InviteCreateOptions = {
                maxAge: options.maxAge ?? 86400,
                maxUses: options.maxUses ?? 0,
                temporary: options.temporary ?? false,
                reason: options.reason
            };

            // ✅ guild.invites.create(channelId, options)
            const invite = await guild.invites.create(channelId, inviteOptions);
            Log.info(`Created invite ${invite.code} for channel ${channelId}`);
            return invite;
        } catch (error) {
            Log.error(`Failed to create invite for channel ${channelId}: ${error}`);
            throw error;
        }
    }


    /**
     * Delete an invitation
     */
    static async delete(invite: Invite): Promise<boolean> {
        try {
            await invite.delete();
            Log.info(`Deleted invite ${invite.code} from guild ${invite.guild?.id}`);
            return true;
        } catch (error) {
            Log.error(`Failed to delete invite ${invite.code}: ${error}`);
            return false;
        }
    }

    /**
     * List every invitation from a guild
     */
    static async list(guildId: string): Promise<Invite[]> {
        try {
            const guild = await GuildManager.find(guildId);
            if (!guild) {
                throw new Error(`Guild ${guildId} not found`);
            }

            const invites = await guild.invites.fetch();
            const inviteList = Array.from(invites.values());

            Log.info(`Fetched ${inviteList.length} invites for guild ${guildId}`);
            return inviteList;
        } catch (error) {
            Log.error(`Failed to fetch invites for guild ${guildId}: ${error}`);
            throw error;
        }
    }
}