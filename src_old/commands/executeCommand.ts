// Slashes command in alphabetical order...
import {CommandInteraction } from "discord.js";
import { createErrorEmbed, sendInteractionEmbed } from "../utils/messages/embeds";

export async function executeSlashCommand(interaction: CommandInteraction): Promise<void>{
    if (!interaction.isCommand()) return;

    switch (interaction.commandName) {
        default:
            await sendInteractionEmbed(interaction, createErrorEmbed("Hmmm, what are you doing here ?? (executeSlashCommand)"), true)
            break
    }
}