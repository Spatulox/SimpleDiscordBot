import dotenv from "dotenv";
import {
    Bot,
    BotConfig,
    ComponentManager,
    EmbedManager,
    SelectMenuManager,
    SimpleColor,
    Time,
    WebhookManager
} from "../index";
import {client} from "./client";
import {Events} from "discord.js"
import {randomActivityList} from "./randomActivityList";
dotenv.config();

async function main() {

    const config: BotConfig = {
        defaultSimpleColor: SimpleColor.blue, // (When embed are created with EmbedManager/ComponentManager)
        botName: "Simple Discord Bot", // The name of the bot
        log: {
            info: {channelId: "1162047096220827831", console: true, discord: true},
            error: {channelId: "1162047096220827831", console: true, discord: true},
            warn: {channelId: "1162047096220827831", console: true, discord: true},
            debug: {channelId: "1162047096220827831", console: true, discord: false},
        }
    }

    const bot = new Bot(client, config);
    bot.client.on(Events.ClientReady, async () => {
        Bot.setRandomActivity(randomActivityList, Time.minute.MIN_10.toMilliseconds())
    })

    bot.client.on(Events.InteractionCreate, async (interaction) => {
        if(interaction.isChatInputCommand()){
            console.log(interaction);
            const web = new WebhookManager(Bot.client, "Amiral", "./src/test/img/amiral_super_terre.jpg")
            const web2 = new WebhookManager(Bot.client, "Linux", "https://imgs.search.brave.com/SZFEB5gZc-95omrZUtOmwS23cD0aCSh04HOvoByG6Jk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9keW1h/LmZyL2Jsb2cvY29u/dGVudC9pbWFnZXMv/c2l6ZS93OTYwLzIw/MjQvMDgvbGludXgx/MjAweDYyOC53ZWJw")
            web.send(interaction.channelId, "Coucou")
            web.send(interaction.channelId, EmbedManager.error("coucou"))
            web.send(interaction.channelId, ComponentManager.success("Success"))
            web.send(interaction.channelId, SelectMenuManager.users("user_select"))
            web2.send(interaction.channelId, "Coucou")
        }
    })

}
main()