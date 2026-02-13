import {BasicUserManager} from "./BasicUserManager";
import {Bot} from "../../bot/Bot";
import {User} from "discord.js";
import {Log} from "../../utils/Log";

export class UserManager extends BasicUserManager{
    static async find(userId: string): Promise<User | null> {
        try {
            return await Bot.client.users.fetch(userId);
        } catch (error) {
            Log.error(`UserManager: Member ${userId} not found`);
            return null;
        }
    }
}