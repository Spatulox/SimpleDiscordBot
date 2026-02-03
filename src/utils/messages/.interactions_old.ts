// Tentative de regrouper sendInteractionEmbed() et sendInteractionSelectMenu() en une seule fonction sendInteraction()

/*import { AnySelectMenuInteraction, BaseInteraction, CommandInteraction, StringSelectMenuBuilder, MessageCreateOptions } from "discord.js";
import { log } from "../functions.js";
import { createEmbed, createErrorEmbed, EmbedColors, sendInteractionEmbed, Embed, returnToSendEmbed } from "./embeds.js";
import { returnToSendSelectMenu, SelectMenu, sendInteractionSelectMenu } from "./selectMenu.js";
import { sendMessage } from "../messages.js";

type AllInteractionType = Embed | StringSelectMenuBuilder | string

function returnTypeMessage(interaction: BaseInteraction, embed: Embed | StringSelectMenuBuilder, textMessage: string, privateVisibility: boolean): MessageCreateOptions | SelectMenu{
    let result = detectType(embed)

    let messageOptions: MessageCreateOptions | SelectMenu;

    if(result === "embed"){
        embed = embed as Embed
        const interaction1 = interaction as CommandInteraction
        if(embed.description){
            log(`INFO : Executing ${interaction1.commandName } : ${embed.description}`)
        } else {
            log(`DEBUG : Executing ${interaction1.commandName}`)
        }
        messageOptions = returnToSendEmbed(embed);

    } else if (result === "selectMenu"){
        embed = embed as StringSelectMenuBuilder
        const interaction1 = interaction as AnySelectMenuInteraction
        if(embed.data.custom_id){
            log(`INFO : Executing ${interaction1.customId} : (${textMessage || "No content provided"})`)
            messageOptions = returnToSendSelectMenu(embed, textMessage, privateVisibility);
        } else {
            log(`DEBUG : Impossible to execute ${interaction1.customId} || Need to placeholder (content) for the selectMenu`)
            messageOptions = returnToSendEmbed(createErrorEmbed("No content provided, plz use the (returnToSendSelectMenu) function only for selectMenu, before calling 'sendInteractionReply'"))
        }
    } else {
        messageOptions = returnToSendEmbed(createErrorEmbed("Une erreur c'est produite lors de la determination du type de message"))
    }
    return messageOptions
}

function detectType(responseObject: AllInteractionType): string {

    if(typeof(responseObject) === "string"){
        return "string"
    }
    if ('title' in responseObject && 'color' in responseObject && 'timestamp' in responseObject) {
        return "embed";
    }
    if (responseObject instanceof StringSelectMenuBuilder) {
        return "selectMenu";
    }
    return "other";
}

export async function sendInteractionError(interaction: BaseInteraction, embedOrMessage: AllInteractionType, privateVisibility = false) {

    let message
        if (typeof embedOrMessage === 'string') {
            message = createErrorEmbed(embedOrMessage)
        } else {
            message = embedOrMessage
        }
    await sendInteraction(interaction, message, privateVisibility)

}

export async function sendInteraction(interaction: BaseInteraction, embedOrMessage: AllInteractionType, privateVisibility = false) {
    try{
        let embed
        if(typeof embedOrMessage === 'string'){
            embed = createEmbed(EmbedColors.botColor)
            embed.title = "INFORMATION"
            embed.description = embedOrMessage
        } else {
            embed = embedOrMessage
        }

        let messageType = detectType(embedOrMessage)

        try {
            switch(messageType){
                case ('string'):
                    sendMessage(embedOrMessage as string, interaction.channelId)
                    break;
                case ('embed'):
                    await sendInteractionEmbed(interaction as CommandInteraction, embed as Embed, privateVisibility)
                    break;
                case ('selectMenu'):
                    const res = returnToSendSelectMenu(embed as StringSelectMenuBuilder, embedOrMessage.toString(), privateVisibility)
                await sendInteractionSelectMenu(interaction as AnySelectMenuInteraction, res, privateVisibility)
                    break;
                default:
                    break
            }
            
        } catch (error: unknown) {
            const interaction2 = interaction as CommandInteraction
            log(`ERROR : Erreur lors de la réponse à l'interaction (${interaction2.commandName}): ${error}`);

            try {
                sendInteractionError(interaction as CommandInteraction, createErrorEmbed(`${error}`), privateVisibility)
            } catch (finalError) {
                log(`ERROR : Échec de toutes les tentatives de réponse pour ${interaction2.commandName} : ${finalError}`);
            }

            return false;
        }
    } catch (e) {
        const interaction2 = interaction as CommandInteraction
        const interaction3 = interaction as AnySelectMenuInteraction
        log(`ERROR : Impossible to execute the sendInteractionReply for ${interaction2.commandName || interaction3.customId} : ${e}`)
        return false
    }
}
*/