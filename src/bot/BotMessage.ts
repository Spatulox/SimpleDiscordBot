import {
    TextChannel,
    DMChannel,
    ThreadChannel,
    Message,
    User,
    GuildMember
} from 'discord.js';
import {Log} from "../utils/Log";
import {Bot} from "./Bot";
import {EmbedManager} from "../manager/messages/EmbedManager";
import {SendableComponent, SendableComponentBuilder} from "../manager/builder/SendableComponentBuilder";


export class BotMessage {
    /**
     * Send message to any text-based channel
     */
    async send(
        channel: TextChannel | DMChannel | ThreadChannel | string,
        content?: string,
        component?: SendableComponent
    ): Promise<Message | boolean> {
        if (!channel) {
            Log.warn('Cannot send message: invalid channel');
            return false;
        }

        if(!content && !component) {
            throw new Error("content and component cannot be null at the same time");
        }

        if (typeof channel === "string") {
            const fetchedChannel = Bot.client.channels.cache.get(channel);
            if (!fetchedChannel?.isTextBased()) {
                Log.warn(`Invalid channel ID: ${channel}`);
                return false;
            }
            channel = fetchedChannel as TextChannel;
        }

        try {
            return await channel.send(SendableComponentBuilder.buildMessage(content, component));
        } catch (error) {
            Log.error(`Failed to send message to ${channel.id}: ${error}`);
            return false;
        }
    }

    async sendDM(user: User | GuildMember | string, content?: string, component?: SendableComponent): Promise<Message | boolean> {
        if(!content && !component) {
            throw new Error("content and component cannot be null at the same time");
        }
        try {
            let targetUser: User;
            if (user instanceof User || user instanceof GuildMember) {
                targetUser = user instanceof GuildMember ? user.user : user;
            } else {
                targetUser = await Bot.client.users.fetch(user)
            }

            return await targetUser.send(SendableComponentBuilder.buildMessage(content, component))
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
            return this.sendDM(channel, message, embed)
        }
        return this.send(channel, message, embed);
    }

    /**
     * Quick error message
     */
    error(channel: TextChannel | DMChannel | ThreadChannel | User | GuildMember, message: string): Promise<Message | boolean> {
        const embed = EmbedManager.error(message);
        if(channel instanceof User || channel instanceof GuildMember) {
            return this.sendDM(channel, message, embed)
        }
        return this.send(channel, message, embed);
    }
}