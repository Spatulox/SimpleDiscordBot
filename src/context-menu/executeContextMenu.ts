import { ContextMenuCommandInteraction } from "discord.js";
import { createErrorEmbed, sendInteractionEmbed } from "../utils/messages/embeds.js";

export async function executeContextMenu(interaction: ContextMenuCommandInteraction){
    if (!interaction.isContextMenuCommand()) return;

    switch (interaction.commandName) {
        default:
            await sendInteractionEmbed(interaction, createErrorEmbed("Hmmm, what are you doing here ?? (executeContextMenu)"), true)
            break;
    }
}