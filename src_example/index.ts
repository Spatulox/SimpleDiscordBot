import {Bot, BotConfig, SimpleColor, Time} from "../src";
import {client} from "./client";
import {Events} from "discord.js"
import {randomActivityList} from "./randomActivityList";

async function main() {

    const config: BotConfig = {
        defaultSimpleColor: SimpleColor.blue, // (When embed are created with EmbedManager)
        botName: "Simple Discord Bot", // The name of the core
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
        //Bot.setRandomActivity(randomActivityList)
        // Or with a timer :
        Bot.setRandomActivity(randomActivityList, Time.minute.MIN_10.toMilliseconds())

        console.log("Hello world !");

    })

    // After that, you can implement what you want
}
main()