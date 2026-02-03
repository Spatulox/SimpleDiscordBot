import {Bot, BotConfig, EmbedColor, Time} from "../src";
import {client} from "./client";
import {Events} from "discord.js"
import {randomActivityList} from "./randomActivityList";

async function main() {

    const config: BotConfig = {
        clientId: "// Your discord bot client id", // Only this one is mandatory for the config to works
        errorChannelId: "The channel where you want the error to appear",
        defaultEmbedColor: EmbedColor.blue, // (When embed are created with EmbedManager)
        botName: "Simple Discord Bot" // The name of the bot
    }

    const bot = new Bot(client, config);
    bot.client.on(Events.ClientReady, async () => {
        Bot.setRandomActivity(randomActivityList)
        // Or with a timer :
        Bot.setRandomActivity(randomActivityList, Time.minute.MIN_10.toMilliseconds())

        console.log("Hello world !");

    })

    // After that, you can implement what you want
}
main()