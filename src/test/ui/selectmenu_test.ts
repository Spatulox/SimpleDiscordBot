import {GuildManager} from "../../manager/guild/GuildManager";
//import {Bot} from "../../bot/Bot";
import {SelectMenuCreateOption, SelectMenuManager} from "../../manager/interactions/SelectMenuManager";
import {ChatInputCommandInteraction, InteractionReplyOptions} from "discord.js";

export async function selectmenu_test(interaction: ChatInputCommandInteraction) {
    const channel = await GuildManager.channel.text.find("1162047096220827831")

    interaction.reply(SelectMenuManager.toInteraction(SelectMenuManager.users("users_menu_interaction")) as InteractionReplyOptions)
    if (channel) {
        await channel.send("--PRE-BUILT--")
        await channel.send(SelectMenuManager.toMessage(SelectMenuManager.users("user_menu")))
        await channel.send(SelectMenuManager.toMessage(SelectMenuManager.roles("user_menu")))
        await channel.send(SelectMenuManager.toMessage(SelectMenuManager.mentionables("user_menu")))
        await channel.send(SelectMenuManager.toMessage(SelectMenuManager.channels("user_menu")))

        await channel.send("--COMPLEX--")

        const selection: SelectMenuCreateOption[] = [
            {label: "Guild", value: "guild", description: "GUILD", emoji: "👀"},
            {label: "Guild1", value: "fakeguild",},
        ]

        const lotOfSelection: SelectMenuCreateOption[] = [
            {label: "Guild", value: "guild", description: "GUILD", emoji: "👀"},
            {label: "Guild1", value: "fakeguild",},
            {label: "Guild2", value: "fakeguild1",},
            {label: "Guild3", value: "fakeguild2",},
            {label: "Guild5", value: "fakeguild3",},
            {label: "Guild5", value: "fakeguild4",},
            {label: "Guild6", value: "fakeguild5",},
            {label: "Guild7", value: "fakeguild6",},
            {label: "Guild8", value: "fakeguild7",},
            {label: "Guild9", value: "fakeguild8",},
            {label: "Guild10", value: "fakeguild9",},
            {label: "Guild11", value: "fakeguild10",},
            {label: "Guild12", value: "fakeguild11",},
        ]

        await channel.send(SelectMenuManager.toMessage(SelectMenuManager.simple("simple_menu", selection)))
        await channel.send(SelectMenuManager.toMessage(SelectMenuManager.paginated("simple_menu_paginated", lotOfSelection, 5)))
    }
}