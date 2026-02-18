import dotenv from "dotenv";
import {Bot, BotConfig, EmbedColor, Time} from "../index";
import {client} from "./client";
import {Events} from "discord.js"
import {randomActivityList} from "./randomActivityList";
dotenv.config();

async function main() {

    const config: BotConfig = {
        defaultEmbedColor: EmbedColor.blue, // (When embed are created with EmbedManager)
        botName: "Simple Discord Bot", // The name of the bot
        log: {
            logChannelId: "1162047096220827831",
            errorChannelId: "1162047096220827831",
            info: {console: true, discord: true},
            error: {console: true, discord: true},
            warn: {console: true, discord: true},
            debug: {console: true, discord: true},
        }
    }

    const bot = new Bot(client, config);
    bot.client.on(Events.ClientReady, async () => {
        Bot.setRandomActivity(randomActivityList, Time.minute.MIN_10.toMilliseconds())
    })

    bot.client.on(Events.InteractionCreate, async (interaction) => {
        console.log(interaction);
    })

}
main()