import { ModalSubmitInteraction } from "discord.js";
import { createErrorEmbed, sendInteractionEmbed } from "../utils/messages/embeds.js";

export async function executeModalSubmit(interaction: ModalSubmitInteraction){
    if (!interaction.isModalSubmit()) return;

    switch (interaction.customId) {
        default:
            await sendInteractionEmbed(interaction, createErrorEmbed("Hmmm, what are you doing here ?? (executeModalSubmit)"), true)
            break;
    }
}