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
    static async send(channel:TextChannel | DMChannel | ThreadChannel | string, content?: string | null, component?: SendableComponent): Promise<Message | null>
    static async send(channel:TextChannel | DMChannel | ThreadChannel | string, content: SendableComponent): Promise<Message | null>
    static async send(channel:TextChannel | DMChannel | ThreadChannel | string, content: MessageCreateOptions): Promise<Message | null>
    static async send(
        channel: TextChannel | DMChannel | ThreadChannel | string,
        content?: string | null | SendableComponent | MessageCreateOptions,
        component?: SendableComponent
    ): Promise<Message | null> {

        try {
            if (!channel) {
                Log.warn('Cannot send message: invalid channel');
                return null;
            }


            if (typeof channel === "string") {
                const fetchedChannel = Bot.client.channels.cache.get(channel);
                if (!fetchedChannel?.isTextBased()) {
                    Log.warn(`Invalid channel ID: ${channel}`);
                    return null;
                }
                channel = fetchedChannel as TextChannel;
            }

            let messageCreate: MessageCreateOptions;

            if(typeof content !== "string" && !component) {
                if(SendableComponentBuilder.isSendableComponent(content)){
                    messageCreate = SendableComponentBuilder.buildMessage(content as SendableComponent);
                } else {
                    messageCreate = content as MessageCreateOptions;
                }
            } else {
                content = content as string | null
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
            return null;
        }
    }

    static async sendDM(user: User | GuildMember | string, content?: string, component?: SendableComponent): Promise<Message | null> {
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
            return null
        }
    }

    /**
     * Quick success message
     */
    static success(channel: TextChannel | DMChannel | ThreadChannel | User | GuildMember, message: string): Promise<Message | null> {
        const embed = EmbedManager.success(message);
        if(channel instanceof User || channel instanceof GuildMember) {
            return this.sendDM(channel, message, embed)
        }
        return this.send(channel, message, embed);
    }

    /**
     * Quick error message
     */
    static error(channel: TextChannel | DMChannel | ThreadChannel | User | GuildMember, message: string): Promise<Message | null> {
        const embed = EmbedManager.error(message);
        if(channel instanceof User || channel instanceof GuildMember) {
            return this.sendDM(channel, message, embed)
        }
        return this.send(channel, message, embed);
    }
}