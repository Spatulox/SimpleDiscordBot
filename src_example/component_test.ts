import {EmbedColor, EmbedManager, GuildManager} from "../src";
import {ComponentManager} from "../src/manager/messages/ComponentManager";

export async function sendComponent(){
    const channel = await GuildManager.channel.text.find("1215348304083161138")
    if(channel) {
        channel.send(ComponentManager.toMessage(ComponentManager.create()))
        channel.send(ComponentManager.toMessage(ComponentManager.create(null, EmbedColor.crimson)))
        channel.send(ComponentManager.toMessage(ComponentManager.create("Pas null", EmbedColor.crimson)))
        channel.send(ComponentManager.toMessage(ComponentManager.description("desc desc")))
        channel.send(ComponentManager.toMessage(ComponentManager.debug("desc debug")))
        channel.send(ComponentManager.toMessage(ComponentManager.simple("desc simple")))


        const fields = [
            {name: "Serveur", value: "Helldivers FR", inline: true},
            {name: "Membres", value: "1,234", inline: true},
            {name: "Channels", value: "56", inline: true},
            {name: "Boost", value: "Niveau 2", inline: false}
        ];

        const container = ComponentManager.create()
        ComponentManager.fields(container, fields)
        channel.send(ComponentManager.toMessage(container))
        channel.send(ComponentManager.toMessage(ComponentManager.error("desc error")))

        channel.send(EmbedManager.toMessage(EmbedManager.debug("desc embed debug")))
        channel.send(EmbedManager.toMessage(EmbedManager.simple("desc embed simple")))
    }
}