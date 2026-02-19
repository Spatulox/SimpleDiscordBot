import {ChatInputCommandInteraction} from "discord.js";
import {ButtonManager} from "../../manager/interactions/ButtonManager";

export function f(interaction: ChatInputCommandInteraction) {

    const row = ButtonManager.row([
        ButtonManager.primary({ customId: 'confirm', label: 'Confirm', emoji: '✅' }),
        ButtonManager.cancel('cancel'),
        ButtonManager.danger({ customId: 'danger', label: 'Danger'}),
        ButtonManager.secondary({ customId: 'sec', label: 'Sec'}),
        ButtonManager.link( {label: 'Link', url:"https://google.com", emoji:'✅'}),
    ])

    interaction.reply({
        content: `test`,
        components: [row]
    })
}