import {Bot, EmbedColor, GuildManager, SelectMenuManager} from "../../index";
import {
    ComponentManager,
    ComponentManagerField,
    ComponentManagerFileInput
} from "../../manager/messages/ComponentManager";
import {SelectMenuCreateOption} from "../../manager/interactions/SelectMenuManager";
import fs from "fs/promises";
import {ButtonManager} from "../../manager/interactions/ButtonManager";
import {ButtonBuilder} from "discord.js";

export async function component_test() {
    const channel = await GuildManager.channel.text.find("1162047096220827831")
    const botIconUrl = Bot.client?.user?.displayAvatarURL({forceStatic: false, size: 128}) ?? ""
    if (channel) {
        await channel.send("--BASIC--")
        await channel.send(ComponentManager.toMessage(ComponentManager.create()))
        await channel.send(ComponentManager.toMessage(ComponentManager.create({title:null, color:EmbedColor.crimson})))
        await channel.send(ComponentManager.toMessage(ComponentManager.create({title: "Pas null", color: EmbedColor.crimson, thumbnailUrl: botIconUrl})))
        await channel.send(ComponentManager.toMessage(ComponentManager.simple("Desc simple")))
        await channel.send(ComponentManager.toMessage(ComponentManager.success("Desc success")))
        await channel.send(ComponentManager.toMessage(ComponentManager.debug("Desc debug")))
        await channel.send(ComponentManager.toMessage(ComponentManager.error("Desc error")))

        await channel.send("--COMPLEX--")

        const buttonLine: ButtonBuilder[] = [
            ButtonManager.success({customId: "success_component_button_1"}),
            ButtonManager.link({label: "Google", url: "https://google.com"}),
            ButtonManager.danger({customId: "success_component_button_2"}),
            ButtonManager.danger({customId: "success_component_button_3"}),
            ButtonManager.danger({customId: "success_component_button_4"})
        ]

        const fields: ComponentManagerField[] = [
            {name: "Serveur", value: "Helldivers FR", thumbnailUrl: botIconUrl},
            {name: "Membres", value: "1,234", button: ButtonManager.success({customId: "success_component_button"})},
            {name: "Buttons", value: "Button line", button: buttonLine},
            {name: "Channels", value: "56"},
            {name: "Boost", value: "Niveau 2"}
        ];

        const selectOption: SelectMenuCreateOption[] = [
            {label: "Test", value: "Test"},
            {label: "Test2", value: "Test2"},
            {label: "Test3", value: "Test3"}
        ]

        const fileBuf = await fs.readFile("./handlers/commands/example.json")
        const filesData: ComponentManagerFileInput[] = [
            {buffer: fileBuf, name: "file1.json", spoiler: true},
            {buffer: fileBuf, name: "file2.json"},
        ]

        const container = ComponentManager.create({title: "Complex one", color: EmbedColor.transparent, thumbnailUrl: botIconUrl})
        ComponentManager.fields(container, fields)
        ComponentManager.mediaGallery(container, [{url:botIconUrl}, {url:botIconUrl, spoiler: true}, {url:botIconUrl}])
        ComponentManager.selectMenu(container, SelectMenuManager.users("users_select"))
        ComponentManager.selectMenu(container, SelectMenuManager.simple("any_select", selectOption))
        const {files} = ComponentManager.file(container, filesData) // Since discord works really weird, we put files reference inside the container, but the buffed files can't be put right now (not really like that but it's a simple explanation)
        await channel.send(ComponentManager.toMessage(container, files)) // Buffed files goes here
        await channel.send("--END--")
    }
}