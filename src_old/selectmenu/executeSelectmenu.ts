// Slashes command in alphabetical order...
import { StringSelectMenuInteraction } from "discord.js";
import { createErrorEmbed, sendInteractionEmbed} from "../utils/messages/embeds.js";

export async function executeSelectMenu(interaction: StringSelectMenuInteraction) {
    if (!interaction.isAnySelectMenu()) return;
    
    //const selectedValue = interaction.values[0]!; // Get first selected value of the option list

    switch (interaction.customId) {    
        default:
            sendInteractionEmbed(interaction, createErrorEmbed("Why are you here ? (executeSelectMenu)"))
            break
    }
}
