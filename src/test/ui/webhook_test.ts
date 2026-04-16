import {ChatInputCommandInteraction} from "discord.js";
import {WebhookManager} from "../../manager/messages/WebhookManager";
import {Bot} from "../../core/Bot";
import {EmbedManager} from "../../manager/messages/EmbedManager";
import {ComponentManager} from "../../manager/messages/ComponentManager";
import {SelectMenuManager} from "../../manager/interactible/SelectMenuManager";

export function webhook_test(interaction: ChatInputCommandInteraction) {

    try {
        interaction.reply("Sending wbehook...")

        const web = new WebhookManager(Bot.client, "Amiral", "./src/test/img/amiral_super_terre.jpg")
        const web2 = new WebhookManager(Bot.client, "Linux", "https://imgs.search.brave.com/SZFEB5gZc-95omrZUtOmwS23cD0aCSh04HOvoByG6Jk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9keW1h/LmZyL2Jsb2cvY29u/dGVudC9pbWFnZXMv/c2l6ZS93OTYwLzIw/MjQvMDgvbGludXgx/MjAweDYyOC53ZWJw")
        web.send(interaction.channelId, "Coucou")
        web.send(interaction.channelId, EmbedManager.error("coucou"))
        web.send(interaction.channelId, ComponentManager.success("Success"))
        web.send(interaction.channelId, SelectMenuManager.users("user_select"))
        web2.send(interaction.channelId, "Coucou")
    } catch (e) {
        console.log(e)
    }
}