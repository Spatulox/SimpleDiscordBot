import {Client, ActivityType, Events, version, Interaction, TextChannel, EmbedBuilder} from 'discord.js';
import dotenv from 'dotenv';
import configJson from '../../config.json' with { type: 'json' };
import { Time } from '../utils/times/UnitTime.js';
import {Log} from "../utils/Log.js";
import {InternetChecker} from "../network/InternetChecker.js";
import {BotLog} from "./BotLog.js";
import {EmbedColor} from "../utils/messages/EmbedManager.js";
import {BotMessage} from "./BotMessage.js";

dotenv.config();

type CriticConfig = {
    dev: boolean;
    token: string;
};

type Config = {
    clientId: string;
    botIconUrl: string;
    logChannelId: string;
    errorChannelId: string;
    defaultEmbedColor: number | EmbedColor;
    botName: string
}

type RandomActivity = {type: ActivityType, message: string}[]

export class Bot {
    private static _client: Client;
    public static readonly log = new BotLog()
    public static readonly message = new BotMessage()

    private static criticConfig: CriticConfig;
    private static _config: Config;

    private static randomActivity: RandomActivity = [];

    static get client(): Client { return Bot._client; }
    static get config(): Config { return Bot._config; }

    constructor(client: Client, randomActivity: RandomActivity = []) {

        Log.info('----------------------------------------------------');
        Log.info("Starting Program")

        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) throw new Error('Missing environment variable: DISCORD_BOT_TOKEN');
        Bot.criticConfig = { dev: configJson.dev, token } as CriticConfig;
        Bot._config = { ...configJson } as Config;
        Bot._client = client
        Bot.randomActivity = randomActivity;

        (async() => {
            Log.info(`Using discord.js version: ${version}`);
            Log.info('Trying to connect to Discord Servers')

            await InternetChecker.checkConnection(3)

            await this.login()

            Bot._client.on(Events.ClientReady, () => {
                if(client && client.user){
                    Log.info(`${client.user.username} has logged in, waiting...`)
                }
            })

            /*Bot.client.on(Events.InteractionCreate, async (interaction: Interaction) =>{
                console.log(interaction);
            })*/

        })()
    }

    public async login(maxTries: number = 3): Promise<boolean> {
        let success = false;
        let tries = 0;

        while (!success && tries < maxTries) {
            try {
                await Bot._client.login(Bot.criticConfig.token);
                success = true;

                Bot._client.once(Events.ClientReady, () => {
                    if (Bot._client.user) {
                        BotLog.initDiscordLogging()
                        Log.info(`Connected as ${Bot._client.user.tag}`);
                        Log.info(`Connected on : ${Bot._client.guilds.cache.size} servers`);
                        Bot._client.guilds.cache.forEach(g => console.log(` - ${g.name}`));
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

    static setRandomActivity() {
        if(Bot.randomActivity.length == 0){
            Log.error("Bot.randomActivity = [{}] is empty")
            return
        }

        const random = Bot.randomActivity[Math.floor(Math.random() * Bot.randomActivity.length)]!;
        Bot.setActivity(random.message, random.type);
    }

}
