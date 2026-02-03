import { log } from "../log.js";
import { searchClientChannel } from "../guilds/channels.js";
import {createErrorEmbed, Embed, isEmbed, returnToSendEmbed, sendEmbed, sendEmbedErrorMessage} from "./embeds.js";
import { client } from '../client.js';
import { Client, DMChannel, MessageCreateOptions, TextChannel, ThreadChannel } from 'discord.js';
import config from "../../config.js";

//----------------------------------------------------------------------------//

export async function crosspostMessage(client: Client, sentence: string, channelId: string): Promise<boolean> {

    try{
        let targetChannel = await searchClientChannel(client, channelId)
        if(!targetChannel){
            return false
        }
        try{
            const message = await targetChannel.send(sentence)
            log(`INFO : Message posted : ${sentence.split('\n')[0]}`)

            try{
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                log("WARNING : Problème lors de la promise d'attente d'une secondes (postMessage)")
            }

            try{
                await message.crosspost()
                log(`INFO : Crossposted message : ${sentence.split('\n')[0]}`)
                return true
            } catch(error){
                sendEmbedErrorMessage('ERROR when posting message : '+error+`\n> - Message : ${message}\n> - TargetChannel : ${targetChannel}`, targetChannel)
                log('ERROR : Error when posting message : '+error)
                return false
            }

        } catch(error){
            log('ERROR : Error when posting message : '+error)
        }
            return true
    } catch (e){
        let msg = `ERROR : Impossible to find the channel to send the message : \n> ${sentence}\n\n> ${e}`
        log(msg)
        try{
            const errorChannel = await searchClientChannel(client, config.errorChannel)
            if(errorChannel){
                sendEmbed(createErrorEmbed(msg), errorChannel)
            } else {
                log("ERROR : Impossible to execute the postMessage function, channel is false")
            }
        } catch (err){
            log(`ERROR : [postMessage() - second try catch] : ${err}`)
        }
        return false
    }
}

//----------------------------------------------------------------------------//

export async function sendMessage(messageContent: string, targetChannel: TextChannel | DMChannel | ThreadChannel | string | null = "") {
    log("INFO : "+messageContent)
    let channelId: string = config.logChannelId
    let channel: TextChannel | DMChannel | ThreadChannel | null

    if(targetChannel){
        if(typeof(targetChannel) === "string"){
            channel = await searchClientChannel(client, channelId)    
        } else {
            channel = targetChannel
        }
    } else {
        channel = await searchClientChannel(client, channelId)
    }

    try {
        if (!channel) {
            console.error(`Canal introuvable : ${targetChannel}`);
            return;
        }
        await channel.send(messageContent);

    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
    }
}

export async function sendMessageToInfoChannel(message: string){
    sendMessage(message, config.logChannelId)
}

//----------------------------------------------------------------------------//

export async function sendMessageError(message: string){
    const channel = await searchClientChannel(client, config.errorChannel)
    if(channel){
        sendEmbedErrorMessage(`${message}`, channel)
    } else {
        sendMessage(`${message}`)
    }
}

//----------------------------------------------------------------------------//

export async function sendMessageToOwner(message: string | Embed){
    return await sendMessageToPrivateUser(message, config.owner)
}

//----------------------------------------------------------------------------//

export async function sendMessageToPrivateUser(message: string | Embed, user_id: string): Promise<boolean>{
    let messagetoSend: string | MessageCreateOptions
    if(isEmbed(message)){
        messagetoSend = returnToSendEmbed(message)
    } else {
        messagetoSend = message
    }

    try {
        const user = await client.users.fetch(user_id)
        await user.send(messagetoSend)
        return true
    } catch (e) {
        log("Failed to send private message, retrying")
        try {
            const user = await client.users.fetch(config.owner);
            await user.send(messagetoSend);
            log(`${message}`);   
            return true
        } catch (error) {
            log("Failed to send private message.")
            console.error(error)
        }
        return false
    }
}
