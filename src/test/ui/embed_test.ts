import {ChatInputCommandInteraction, EmbedField} from "discord.js";
import {Bot, SimpleColor, EmbedManager, GuildManager } from "../../index";

export async function embed_test(interaction: ChatInputCommandInteraction) {
    interaction.reply(EmbedManager.toInteraction(EmbedManager.success("Yey !")))
    const channel = await GuildManager.channel.text.find("1162047096220827831")
    if (channel) {
        await channel.send("--BASIC--")
        await channel.send(EmbedManager.toMessage(EmbedManager.create(SimpleColor.transparent)))
        await channel.send(EmbedManager.toMessage(EmbedManager.create(SimpleColor.yellow)))
        await channel.send(EmbedManager.toMessage(EmbedManager.simple("Simple description")))
        await channel.send(EmbedManager.toMessage(EmbedManager.description("Description description")))
        await channel.send(EmbedManager.toMessage(EmbedManager.success("Success description")))
        await channel.send(EmbedManager.toMessage(EmbedManager.debug("Debug description")))
        await channel.send(EmbedManager.toMessage(EmbedManager.error("Error description")))
        await Bot.log.info(EmbedManager.error("Bot log error embed"))
        await Bot.message.send(channel, EmbedManager.success("Bot message info embed"))

        await channel.send("--COMPLEX--")
        const fields: EmbedField[] = [
            {name: "Name", value: "John", inline: true},
            {name: "Lastname", value: "Doe", inline: true},
            {name: "Age", value: "41", inline: true},
            {name: "Location", value: "Somewhere", inline: true},
            {name: "School", value: "graduated", inline: true},
        ]

        await channel.send(EmbedManager.toMessage(EmbedManager.fields(EmbedManager.create().setTitle("Person"), fields)))
    }
}