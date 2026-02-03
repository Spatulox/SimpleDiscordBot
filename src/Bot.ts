import {Client, ActivityType, Events, version, Interaction} from 'discord.js';
import dotenv from 'dotenv';
import configJson from '../config.json' with { type: 'json' };
import { Time } from './utils/times/UnitTime.js';
import {Log} from "./utils/Log.js";
import {InternetChecker} from "./network/InternetChecker.js";

dotenv.config();

type Config = {
    dev: boolean;
    clientId: string;
    logChannelId: string;
    token: string;
};

type RandomActivity = {type: ActivityType, message: string}[]

export class Bot {
    private static client: Client;
    private static config: Config;

    private static randomActivity: RandomActivity = [];

    constructor(client: Client, randomActivity: RandomActivity = []) {

        Log.info('----------------------------------------------------');
        Log.info("Starting Program")

        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) throw new Error('Missing environment variable: DISCORD_BOT_TOKEN');
        Bot.config = { ...configJson, token } as Config;
        Bot.client = client
        Bot.randomActivity = randomActivity;

        (async() => {
            Log.info(`Using discord.js version: ${version}`);
            Log.info('Trying to connect to Discord Servers')

            await InternetChecker.checkConnection(3)

            Bot.client.on(Events.ClientReady, () => {
                if(client && client.user){
                    Log.info(`${client.user.username} has logged in, waiting...`)
                }
            })

            /*Bot.client.on(Events.InteractionCreate, async (interaction: Interaction) =>{
                console.log(interaction);
            })*/

        })()
    }

    public async login(): Promise<boolean> {
        let success = false;
        let tries = 0;
        const maxTries = 3;

        while (!success && tries < maxTries) {
            try {
                await Bot.client.login(Bot.config.token);
                success = true;

                Bot.client.once(Events.ClientReady, () => {
                    if (Bot.client.user) {
                        Log.info(`Connected as ${Bot.client.user.tag}`);
                        Log.info(`Connected on : ${Bot.client.guilds.cache.size} servers`);
                        Bot.client.guilds.cache.forEach(g => console.log(` - ${g.name}`));
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
        if (Bot.client.user) {
            Bot.client.user.setActivity({ name: message, type });
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
