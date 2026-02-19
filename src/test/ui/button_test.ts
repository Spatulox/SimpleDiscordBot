import {ChatInputCommandInteraction, InteractionReplyOptions} from "discord.js";
import {ButtonManager} from "../../manager/interactions/ButtonManager";
import {GuildManager} from "../../manager/guild/GuildManager";

export async function button_test(interaction: ChatInputCommandInteraction) {

    const row = ButtonManager.row([
        ButtonManager.primary({ customId: 'confirm', label: 'Confirm', emoji: '✅' }),
        ButtonManager.cancel('cancel'),
        ButtonManager.danger({ customId: 'danger', label: 'Danger'}),
        ButtonManager.secondary({ customId: 'sec', label: 'Sec'}),
        ButtonManager.link( {label: 'Link', url:"https://google.com", emoji:'✅'}),
    ])

    const channel = await GuildManager.channel.text.find("1162047096220827831")
    if (channel) {
        await channel.send("--BASIC--")
        await channel.send(ButtonManager.toMessage(ButtonManager.primary({ customId: 'confirm', label: 'Confirm', emoji: '✅' })))
        await channel.send("--COMPLEX--")
        await channel.send(ButtonManager.toMessage(row))
    }

    interaction.reply(ButtonManager.toInteraction(row) as InteractionReplyOptions)
}