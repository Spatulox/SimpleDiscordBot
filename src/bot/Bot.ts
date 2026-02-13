import {Client, ActivityType, Events, version} from 'discord.js';
import { Time } from '../utils/times/UnitTime';
import {Log} from "../utils/Log";
import {InternetChecker} from "../utils/network/InternetChecker";
import {BotLog, ConfigLog} from "./BotLog";
import {EmbedColor, EmbedManager} from "../manager/messages/EmbedManager";
import {BotMessage} from "./BotMessage";
import {BotEnv} from "./BotEnv";
import {BotInteraction} from "./BotInteraction";

type CriticConfig = {
    dev: boolean;
    token: string;
};

export type BotConfig = {
    botIconUrl?: string;
    defaultEmbedColor?: number | EmbedColor;
    botName?: string
    log?: ConfigLog
}

export type InternalBotConfig = {
    clientId: string
} & BotConfig;

export type RandomBotActivity = {type: ActivityType, message: string}[]

export class Bot {

    // Static ref
    public static readonly log = BotLog
    public static readonly message = BotMessage
    public static readonly interaction = BotInteraction

    // Instance properties
    public static _client: Client;
    private static criticConfig: CriticConfig;
    private static _config: InternalBotConfig;

    get config(): InternalBotConfig { return Bot._config; }
    get client(): Client { return Bot._client; }

    static get client(): Client { return Bot._client; }
    static get config(): InternalBotConfig { return Bot._config; }

    constructor(client: Client, config: BotConfig) {

        Log.info('----------------------------------------------------');
        Log.info("Starting Bot")

        Bot.criticConfig = { dev: BotEnv.dev, token: BotEnv.token };
        Bot._config = { ...config, clientId: BotEnv.clientId};
        Bot._client = client;

        (async() => {
            Log.info(`Using discord.js version: ${version}`);
            Log.info('Trying to connect to Discord Servers')

            await InternetChecker.checkConnection(3)

            await this.login()

        })()
    }

    public async login(maxTries: number = 3): Promise<boolean> {
        let success = false;
        let tries = 0;

        while (!success && tries < maxTries) {
            try {
                await Bot._client.login(Bot.criticConfig.token);
                success = true;

                Bot._client.on(Events.ClientReady, async () => {
                    if (Bot._client.user) {
                        await Bot.log.initDiscordLogging()
                        Log.info(`Connected on ${Bot._client.guilds.cache.size} servers as ${Bot._client.user.tag}`);
                        //Bot._client.guilds.cache.forEach(g => console.log(` - ${g.name}`));
                        Bot.log.info(EmbedManager.description("Bot Started"))
                    }
                });

            } catch (error) {
                Log.error(`Connection error : ${error}. Trying again...`);
                tries++;
                await new Promise(resolve =>
                    setTimeout(resolve, Time.second.SEC_03.toMilliseconds())
                );
            }
        }

        if (!success) {
            Log.error('Impossible to connect the bot after 3 attempts');
            return false;
        }

        return true;
    }

    static setActivity(message: string, type: ActivityType) {
        if (Bot._client.user) {
            Bot._client.user.setActivity({ name: message, type });
            Log.info(`Activity defined : ${message}`);
        }
    }

    static setRandomActivity(randomActivity: RandomBotActivity, intervalMs: number | null = null) {
        if(randomActivity.length == 0){
            Log.error("Bot.randomActivity = [{}] is empty")
            return
        }

        const pickRandom = () => {
            const random = randomActivity[Math.floor(Math.random() * randomActivity.length)]!;
            Bot.setActivity(random.message, random.type);
            return random;
        };

        if (intervalMs === null) {
            pickRandom();
            Log.info(`Activity set ONCE`);
            return;
        }

        pickRandom();
        setInterval(async () => {
            pickRandom();
        }, intervalMs);
        Log.info(`Random activity started (every ${Math.round(intervalMs / 60000)}min)`);
        return
    }

}
