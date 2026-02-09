import {
    TextChannel,
    DMChannel,
    ThreadChannel,
    EmbedBuilder,
    Message,
    User,
    GuildMember
} from 'discord.js';
import {Log} from "../utils/Log";
import {Bot} from "./Bot";
import {EmbedManager} from "../manager/messages/EmbedManager";

export class BotMessage {
    /**
     * Send message to any text-based channel
     */
    async send(
        channel: TextChannel | DMChannel | ThreadChannel | string,
        content: string | EmbedBuilder
    ): Promise<Message | boolean> {
        if (!channel) {
            Log.warn('Cannot send message: invalid channel');
            return false;
        }

        if(typeof channel == "string") {
            channel = Bot.client.channels.cache.get(channel) as TextChannel;
        }

        try {
            if (content instanceof EmbedBuilder) {
                const msg = await channel.send({ embeds: [content] });
                Log.info(`Embed sent to ${channel.id}`);
                return msg;
            } else {
                const msg = await channel.send(content);
                Log.info(`Message sent to ${channel.id}: ${content.slice(0, 50)}...`);
                return msg;
            }
        } catch (error) {
            Log.error(`Failed to send message to ${channel.id}: ${error}`);
            return false;
        }
    }

    async sendDM(user: User | GuildMember | string, content: string | EmbedBuilder): Promise<Message | boolean> {
        try {
            let targetUser: User;
            if (user instanceof User || user instanceof GuildMember) {
                targetUser = user instanceof GuildMember ? user.user : user;
            } else {
                targetUser = await Bot.client.users.fetch(user)
            }

            if (content instanceof EmbedBuilder) {
                return await targetUser.send({embeds: [content]})
            } else {
                return await targetUser.send(content)
            }
        } catch (error) {
            Log.error(`Failed to send message to ${user}: ${error}`);
            return false
        }
    }

    /**
     * Quick success message
     */
    success(channel: TextChannel | DMChannel | ThreadChannel | User | GuildMember, message: string): Promise<Message | boolean> {
        const embed = EmbedManager.success(message);
        if(channel instanceof User || channel instanceof GuildMember) {
            return this.sendDM(channel, embed)
        }
        return this.send(channel, embed);
    }

    /**
     * Quick error message
     */
    error(channel: TextChannel | DMChannel | ThreadChannel | User | GuildMember, message: string): Promise<Message | boolean> {
        const embed = EmbedManager.error(message);
        if(channel instanceof User || channel instanceof GuildMember) {
            return this.sendDM(channel, embed)
        }
        return this.send(channel, embed);
    }
}