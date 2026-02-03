import { PermissionFlagsBits } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { setTimeout } from "timers/promises";
import { client } from '../utils/client.js';
import { Time } from '../utils/times/UnitTime.js';
import { log } from '../utils/log.js';
import { listJsonFile, readJsonFile, writeJsonFileRework } from '../utils/server/files.js';
import { loginBot } from '../utils/login.js';
import config from '../config.js';
import {Events} from "discord.js";


export interface Command {
    name: string;
    description: string;
    options?: any[];
    default_member_permissions?: string | bigint | number;
    guildID?: string[];
    type: 1 | 2 | 3; // 1 = slash, 2 = user context, 3 = message context
    id?: string; // Discord API Command ID
}

// Initialisation du REST
client.rest = new REST({ version: '10' }).setToken(config.token);

export async function deployCommand(commandPath: string[]): Promise<void> {
    if (!(await loginBot(client))) {
        log("Erreur : Impossible de connecter le bot");
        process.exit()
    }

    client.once(Events.ClientReady, async () => {
        log('INFO : Déploiement des commandes slash');

        for (const path of commandPath){
            const slashFiles = await listJsonFile(`./${path}/`);
            if (!slashFiles) {
                log('ERREUR : Impossible de lire les fichiers de commandes');
                return;
            }
            console.log(`${slashFiles.length} ${path}`)
        }
        
        // Récupère toutes les commandes actuelles sur Discord
        const globalDiscordCmds: any[] = await client.rest.get(
            Routes.applicationCommands(client.user!.id)
        ) as any[];
        
        const allLocalCommands: Command[] = [];
        const guildDiscordCmds = {} as Record<string, any[]>;
        
        for(const path of commandPath){
            const slashFiles = await listJsonFile(`./${path}/`);
            if (!slashFiles) {
                log('ERREUR : Impossible de lire les fichiers de commandes');
                return;
            }
            

            // Pour chaque guilde utilisée dans tes JSONs
            const allGuildIds = new Set<string>();
            for (const filename of slashFiles) {
                const cmdData = await readJsonFile(`./${path}/${filename}`);
                if (cmdData?.guildID) {
                    for (const gid of cmdData.guildID) allGuildIds.add(gid);
                }
            }

            for (const guildId of allGuildIds) {
                try {
                    guildDiscordCmds[guildId] = await client.rest.get(
                        Routes.applicationGuildCommands(config.clientId, guildId)
                    ) as any[];   
                } catch (error) {
                    console.error()
                }
            }

            // ---------------------- Déploiement attendue ---------------------------

            for (const file of slashFiles.filter(n=>!n.includes('example'))) {
                let updated = false;
                const cmd: Command | false = await readJsonFile(`./${path}/${file}`);
                if(!cmd) continue;

                // Traitement permissions
                if (cmd.default_member_permissions && Array.isArray(cmd.default_member_permissions)) {
                    const bitfield = cmd.default_member_permissions
                        .map(perm => {
                            const flag = PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits];
                            if (flag === undefined) throw new Error(`Permission inconnue : "${perm}"`);
                            return flag;
                        })
                        .reduce((acc, val) => acc | val, BigInt(0));
                    cmd.default_member_permissions = Number(bitfield)
                }

                // Déploiement Guild vs Global
                const deployToGuilds = (cmd.guildID && cmd.guildID.length > 0) ? cmd.guildID : [];
                if (deployToGuilds.length > 0) {
                    for (const guildId of deployToGuilds) {
                        // Cherche la commande existante sur Discord
                        const found = guildDiscordCmds[guildId]?.find(e => e.id === cmd.id || e.name === cmd.name);
                        const dataToSend = { ...cmd };
                        delete dataToSend.guildID;

                        if (cmd.type === 2 || cmd.type === 3) {
                            // Les context menus ne doivent **pas** utiliser `options`
                            console.log("on delete options")
                            delete dataToSend.options;
                        }

                        try {
                            if (!cmd.id || !found) {
                                // Pas d'ID ou pas trouvée, on crée la commande
                                console.log("Pas d'ID ou pas trouvée, on crée la commande : " + dataToSend.name)
                                const resp = await client.rest.post(
                                    Routes.applicationGuildCommands(config.clientId, guildId),
                                    { body: dataToSend }
                                ) as any;
                                cmd.id = resp.id;
                                updated = true;
                                log(`SUCCÈS : Commande "${cmd.name}" déployée/guild ${guildId}, id = ${cmd.id}`);
                            } else {
                                // Si déjà existante, on la met à jour
                                console.log("Si déjà existante, on la met à jour : " + dataToSend.name)
                                await client.rest.patch(
                                    Routes.applicationGuildCommand(config.clientId, guildId, found.id),
                                    { body: dataToSend }
                                );
                                cmd.id = found.id;
                                log(`MAJ : Commande "${cmd.name}" mise à jour/guild ${guildId}, id = ${cmd.id}`);
                            }
                            await setTimeout(Time.second.SEC_01.toMilliseconds());
                        } catch (error) {
                            console.log(error)   
                        }
                    }
                } else {
                    // Commande globale
                    const found = globalDiscordCmds.find(e => e.id === cmd.id || e.name === cmd.name);
                    const dataToSend = { ...cmd };
                    delete dataToSend.guildID;
                    if (cmd.type === 2 || cmd.type === 3) {
                        // Les context menus ne doivent **pas** utiliser `options`
                        delete dataToSend.options;
                    }

                    try {
                        if (!cmd.id || !found) {
                            const resp = await client.rest.post(
                                Routes.applicationCommands(client.user!.id),
                                { body: dataToSend }
                            ) as any;
                            cmd.id = resp.id;
                            updated = true;
                            log(`SUCCÈS : Commande globale "${cmd.name}" déployée, id = ${cmd.id}`);
                        } else {
                            await client.rest.patch(
                                Routes.applicationCommand(client.user!.id, found.id),
                                { body: dataToSend }
                            );
                            cmd.id = found.id;
                            log(`MAJ : Commande globale "${cmd.name}" mise à jour, id = ${cmd.id}`);
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
                //if (updated) await writeJsonFileRework(`./${path}/`, `${file}`, cmd); // Sauvegarde l'id Discord
                if (updated) {
                    allLocalCommands.push(cmd); // Ajoute ici la version à jour de la commande
                    await writeJsonFileRework(`./${path}/`, `${file}`, cmd);
                } else {
                    allLocalCommands.push(cmd); // Même si elle n’a pas été modifiée, on veut la conserver
                }

            }

        }

        // ---------------------- SUPPRESSION COMMANDES ---------------------------

        const localNames = allLocalCommands.map(c => c.name); // Regroupe toutes les commandes locales

        // Supprime les commandes globales non déclarées
        for (const apiCmd of globalDiscordCmds) {
            try {
                if (!localNames.includes(apiCmd.name)) {
                    await client.rest.delete(
                        Routes.applicationCommand(client.user!.id, apiCmd.id)
                    );
                    log(`SUPPR : Commande globale "${apiCmd.name}" supprimée, id = ${apiCmd.id}`);
                }
            } catch (error) {
                console.log(error);   
            }
        }

        // Supprime les commandes guild non déclarées
        for (const gid of Object.keys(guildDiscordCmds)) {
            const current = guildDiscordCmds[gid];
            if (!current) continue;
            for (const apiCmd of current) {
                try {
                    if (!localNames.includes(apiCmd.name)) {
                        await client.rest.delete(
                            Routes.applicationGuildCommand(config.clientId, gid, apiCmd.id)
                        );
                        log(`SUPPR : Commande "${apiCmd.name}" supprimée de guild ${gid}`);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        process.exit();
    });
}

deployCommand(["context-menu", "commands"]);