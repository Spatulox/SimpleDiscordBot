import {Bot, EmbedColor, EmbedManager, GuildManager} from "../../index";
import {ComponentManager, ComponentManagerField} from "../../manager/messages/ComponentManager";

export async function component_test(){
    const channel = await GuildManager.channel.text.find("1162047096220827831")
    if(channel) {
        /*await channel.send(ComponentManager.toMessage(ComponentManager.create()))
        await channel.send(ComponentManager.toMessage(ComponentManager.create(null, EmbedColor.crimson)))
        await channel.send(ComponentManager.toMessage(ComponentManager.create("Pas null", EmbedColor.crimson)))
        await channel.send(ComponentManager.toMessage(ComponentManager.description("desc desc")))
        await channel.send(ComponentManager.toMessage(ComponentManager.debug("desc debug")))
        await channel.send(ComponentManager.toMessage(ComponentManager.simple("desc simple")))*/

        const botIconUrl = Bot.client?.user?.displayAvatarURL({ forceStatic: false, size: 128 })
        const fields: ComponentManagerField[] = [
            {name: "Serveur", value: "Helldivers FR", thumbnailUrl: botIconUrl},
            {name: "Membres", value: "1,234"},
            {name: "Channels", value: "56"},
            {name: "Boost", value: "Niveau 2"}
        ];

        const container = ComponentManager.create({thumbnailUrl: botIconUrl})
        ComponentManager.fields(container, fields)
        await channel.send(ComponentManager.toMessage(container))
        /*await channel.send(ComponentManager.toMessage(ComponentManager.error("desc error")))

        await channel.send("Embed")

        await channel.send(EmbedManager.toMessage(EmbedManager.debug("desc embed debug")))
        await channel.send(EmbedManager.toMessage(EmbedManager.simple("desc embed simple")))
        await channel.send("---")*/
    }
}