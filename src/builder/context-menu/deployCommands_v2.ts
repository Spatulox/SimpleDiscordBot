import { client } from "../../utils/client.js";
import { listJsonFile, readJsonFile } from "../../utils/server/files.js";
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { log } from "../../utils/log.js";
import { loginBot } from "../../utils/login.js";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { setTimeout } from "timers/promises";
import { Time } from "../../utils/times/UnitTime.js";
import { Command } from "../deploy.js";
import config from "../../config.js";
import {Events} from "discord.js";


const PATH = "context-menu"

// Initialisation du REST après la création du client
client.rest = new REST({ version: '10' }).setToken(config.token);

export async function deployCommand(): Promise<void> {
    if (!(await loginBot(client))) {
        log("Erreur : Impossible de connecter le bot");
        return;
    }

    client.once(Events.ClientReady, async () => {
        log('INFO : Déploiement des commandes slash');
        const listFile = await listJsonFile(`./${PATH}/`);
        if (!listFile) return;

        const commandArray: Command[] = [];
        let numberCommandDeployed = 0
        let fileLength = 0;

        if (Array.isArray(listFile)) {
            fileLength = listFile.filter(f => !f.includes("example")).length;

            for (const file of listFile.filter(f => !f.includes("example"))) {
                try {
                    const command: Command = await readJsonFile(`./${PATH}/${file}`);
                    
                    // Conversion des permissions textuelles en bits
                    if (command.default_member_permissions && Array.isArray(command.default_member_permissions)) {
                        const bitfield = command.default_member_permissions
                            .map((perm: any) => {
                            const flag = PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits];
                            if (flag === undefined) {
                                throw new Error(
                                `Permission inconnue : "${perm}". Vérifiez l'orthographe dans votre JSON (Enumeration Discord : PermissionFlagsBits.X ).`
                                );
                            }
                            return flag;
                            })
                            .reduce((acc: any, val: any) => acc | val, BigInt(0));

                        command.default_member_permissions = Number(bitfield)
                    }

                    // Déploiement pour des guildes spécifiques ou globalement
                    if (command.guildID && command.guildID.length > 0) {
                        for (const guildId of command.guildID) {
                            // Créer une copie de la commande sans le paramètre guildID
                            const { guildID, ...commandWithoutGuildID } = command;
                    
                            try {
                                await client.rest.put(
                                    Routes.applicationGuildCommands(config.clientId, guildId),
                                    { body: [commandWithoutGuildID] }
                                );
                                log(`SUCCÈS : Menu Contextuel "${command.name}" déployée sur la guilde ${guildId}`);
                            } catch (err: any) {
                                log(`ERREUR : Impossible de déployer le menu contextuel "${command.name}" sur la guilde ${guildId}. Raison : ${err.message}`);
                            }
                            setTimeout(Time.second.SEC_01.toMilliseconds())
                        }
                        numberCommandDeployed++
                    } else {
                        log(`AJOUT : Menu contextuel "${command.name}" ajouté à la file d'attente`);
                        commandArray.push(command);
                        numberCommandDeployed++
                    }
                    
                } catch (err: any) {
                    log(`ERREUR : Lecture du fichier ${file} : ${err.message}`);
                }
            }
        } else {
            log('ERREUR : listFile n\'est pas un tableau.');
        }

        // Déploiement global des commandes sans guildID
        if (commandArray.length > 0) {
            try {
                await client.rest.put(
                    Routes.applicationCommands(client.user!.id),
                    { body: commandArray }
                );
                log(`SUCCÈS : ${numberCommandDeployed}/${fileLength} menus contextuels globaux déployés`);
            } catch (err: any) {
                log(`ERREUR CRITIQUE : Déploiement des menus contextuels globaux : ${err.message}`);
            }
        }

        process.exit();
    })
}

deployCommand();
