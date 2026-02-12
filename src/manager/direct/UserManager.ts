import {GuildMember, Message, MessageCreateOptions, User} from "discord.js";
import {Bot} from "../../bot/Bot";
import {Log} from "../../utils/Log";
import {SendableComponent, SendableComponentBuilder} from "../builder/SendableComponentBuilder";

export class UserManager {
    /**
     * Find a member
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
     * Overload for send
     */
    // Normal message
    static async send(user_id: string, content: string): Promise<Message>;
    static async send(user: User, content: string): Promise<Message>;
    // Component Message
    static async send(user_id: string, component: SendableComponent | SendableComponent[]): Promise<Message>;
    static async send(user: User, component: SendableComponent | SendableComponent[]): Promise<Message>;
    static async send(user_id: string, content: string, component: SendableComponent | SendableComponent[]): Promise<Message>;
    static async send(user: User, content: string, component: SendableComponent | SendableComponent[]): Promise<Message>;
    // Discord Message Create Option
    static async send(user_id_or_user: string | User, options: MessageCreateOptions): Promise<Message>;


    /**
     * Impl
     */
    static async send(
        user_id_or_user: string | User,
        content_or_component_or_options: string | SendableComponent | SendableComponent[] | MessageCreateOptions,
        component?: SendableComponent | SendableComponent[]
    ): Promise<Message> {
        try {
            let user: User;
            if (typeof user_id_or_user === 'string') {
                user = await Bot.client.users.fetch(user_id_or_user);
            } else {
                user = user_id_or_user;
            }

            const dmChannel = await user.createDM();

            let payload: MessageCreateOptions;

            if (component && typeof content_or_component_or_options == "string") { // component + content
                payload = SendableComponentBuilder.buildMessage(
                    content_or_component_or_options,
                    component
                );
            } else if (typeof content_or_component_or_options === 'string') { // content only
                payload = SendableComponentBuilder.buildMessage(content_or_component_or_options);
            } else if(SendableComponentBuilder.isSendableComponent(content_or_component_or_options)) { // component only
                payload = SendableComponentBuilder.buildMessage(content_or_component_or_options as SendableComponent | SendableComponent[]);
            } else { // MessageCreationOptionOnly
                payload = content_or_component_or_options as MessageCreateOptions;
            }

            const message = await dmChannel.send(payload);

            Log.info(`Sent DM to ${user.id} (${user.username}): "${(payload.content || 'Embed/Component').substring(0, 50)}..."`);
            return message;
        } catch (error) {
            Log.error(`Failed to send DM to ${user_id_or_user}: ${error}`);
            throw new Error(`Cannot send DM to ${user_id_or_user}`);
        }
    }
}