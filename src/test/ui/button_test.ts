import {ChatInputCommandInteraction} from "discord.js";
import {ButtonManager} from "../../manager/interactions/ButtonManager";

export function f(interaction: ChatInputCommandInteraction) {
    
    const row = ButtonManager.row([
        ButtonManager.primary({ customId: 'confirm', label: 'Confirm', emoji: '✅' }),
        ButtonManager.primary({ customId: 'cancel', label: 'Cancel', emoji: '✅' }),
    ])

    interaction.reply({
        content: `test`,
        components: [row]
    })
}