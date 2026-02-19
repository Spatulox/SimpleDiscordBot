import {GuildManager} from "../../manager/guild/GuildManager";
import {EmbedColor, EmbedManager} from "../../manager/messages/EmbedManager";
import {ChatInputCommandInteraction, EmbedField, InteractionReplyOptions} from "discord.js";

export async function embed_test(interaction: ChatInputCommandInteraction) {
    interaction.reply(EmbedManager.toInteraction(EmbedManager.success("Yey !")) as InteractionReplyOptions)
    const channel = await GuildManager.channel.text.find("1162047096220827831")
    if (channel) {
        await channel.send("--BASIC--")
        await channel.send(EmbedManager.toMessage(EmbedManager.create(EmbedColor.transparent)))
        await channel.send(EmbedManager.toMessage(EmbedManager.create(EmbedColor.yellow)))
        await channel.send(EmbedManager.toMessage(EmbedManager.simple("Simple description")))
        await channel.send(EmbedManager.toMessage(EmbedManager.description("Description description")))
        await channel.send(EmbedManager.toMessage(EmbedManager.success("Success description")))
        await channel.send(EmbedManager.toMessage(EmbedManager.debug("Debug description")))
        await channel.send(EmbedManager.toMessage(EmbedManager.error("Error description")))

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