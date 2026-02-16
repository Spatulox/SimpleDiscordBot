import {BasicUserManager} from "./BasicUserManager";
import {Bot} from "../../bot/Bot";
import {User} from "discord.js";
import {Log} from "../../utils/Log";

export class UserManager extends BasicUserManager{
    static async find(userId: string): Promise<User | null> {
        const cached = Bot.client.users.cache.get(userId);
        if (cached) return cached;

        const user = await Bot.client.users.fetch(userId).catch(() => null);
        if (!user) Log.error(`UserManager: User ${userId} not found`);
        return user;
    }
}