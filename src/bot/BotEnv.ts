import dotenv from 'dotenv';
import {DiscordRegex} from "../utils/DiscordRegex";
dotenv.config();

export const BotEnv = {
    get token(): string {
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) throw new Error('Missing environment variable : DISCORD_BOT_TOKEN');
        return token;
    },
    get dev(): boolean {
        return process.env.DEV === 'true';
    },
    get clientId(): string {
        const token = process.env.DISCORD_BOT_CLIENTID;
        if (!token) throw new Error('Missing environment variable : DISCORD_BOT_CLIENTID');

        if(!DiscordRegex.BOT_ID.test(token)){
            throw new Error("Invalid token format")
        }

        return token;
    }
} as const;