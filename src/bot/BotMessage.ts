import {
    TextChannel,
    DMChannel,
    ThreadChannel,
    Message,
    User,
    GuildMember, MessageCreateOptions
} from 'discord.js';
import {Log} from "../utils/Log";
import {Bot} from "./Bot";
import {EmbedManager} from "../manager/messages/EmbedManager";
import {SendableComponent, SendableComponentBuilder} from "../manager/builder/SendableComponentBuilder";


export class BotMessage {
    /**
     * Send message to any text-based channel
     */
    async send(channel:TextChannel | DMChannel | ThreadChannel | string, content?: string | null, component?: SendableComponent): Promise<Message | boolean>
    async send(channel:TextChannel | DMChannel | ThreadChannel | string, content: MessageCreateOptions): Promise<Message | boolean>
    async send(
        channel: TextChannel | DMChannel | ThreadChannel | string,
        content?: string | null | MessageCreateOptions,
        component?: SendableComponent
    ): Promise<Message | boolean> {

        try {
            if (!channel) {
                Log.warn('Cannot send message: invalid channel');
                return false;
            }


            if (typeof channel === "string") {
                const fetchedChannel = Bot.client.channels.cache.get(channel);
                if (!fetchedChannel?.isTextBased()) {
                    Log.warn(`Invalid channel ID: ${channel}`);
                    return false;
                }
                channel = fetchedChannel as TextChannel;
            }

            let messageCreate: MessageCreateOptions;

            if(typeof content !== "string" && !component) {
                messageCreate = content as MessageCreateOptions;
            } else {
                content = content as string
                if (content && component) {
                    messageCreate = SendableComponentBuilder.buildMessage(content, component);
                } else if (content) {
                    messageCreate = SendableComponentBuilder.buildMessage(content);
                } else if (component) {
                    messageCreate = SendableComponentBuilder.buildMessage(component);
                } else {
                    throw new Error("content and component cannot be null at the same time");
                }
            }

            try {
                return await channel.send(messageCreate)
            } catch (e) {
                throw e
            }
        } catch (e) {
            Log.error(`Failed to send message : ${e}`);
            return false;
        }
    }

    async sendDM(user: User | GuildMember | string, content?: string, component?: SendableComponent): Promise<Message | boolean> {
        try {
            let targetUser: User;
            if (user instanceof User || user instanceof GuildMember) {
                targetUser = user instanceof GuildMember ? user.user : user;
            } else {
                targetUser = await Bot.client.users.fetch(user)
            }

            let messageCreate: MessageCreateOptions;

            if (content && component) {
                messageCreate = SendableComponentBuilder.buildMessage(content, component);
            } else if (content) {
                messageCreate = SendableComponentBuilder.buildMessage(content);
            } else if (component) {
                messageCreate = SendableComponentBuilder.buildMessage(component);
            } else {
                throw new Error("content and component cannot be null at the same time");
            }

            return await targetUser.send(messageCreate)
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