import {ChatInputCommandInteraction} from "discord.js";
import {Bot, ButtonManager, GuildManager} from "../../index";

export async function button_test(interaction: ChatInputCommandInteraction) {

    const row = ButtonManager.row([
        ButtonManager.primary({ customId: 'confirm', label: 'Confirm', emoji: '✅' }),
        ButtonManager.cancel('cancel'),
        ButtonManager.danger({ customId: 'danger', label: 'Danger'}),
        ButtonManager.secondary({ customId: 'sec', label: 'Sec'}),
        ButtonManager.link( {label: 'Link', url:"https://google.com", emoji:'✅'}),
    ])

    interaction.reply(ButtonManager.toInteraction(row))

    const channel = await GuildManager.channel.text.find("1162047096220827831")
    if (channel) {
        await channel.send("--BASIC--")
        await channel.send(ButtonManager.toMessage(ButtonManager.primary({ customId: 'confirm', label: 'Confirm', emoji: '✅' })))
        await channel.send("--COMPLEX--")
        await channel.send(ButtonManager.toMessage(row))
        await Bot.log.info("Buton row from Bot.log")
        await Bot.log.info(row)
        await Bot.log.info("Buton row from Bot.message")
        await Bot.message.send(channel, row)
    }
}