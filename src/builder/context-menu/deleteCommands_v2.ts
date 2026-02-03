import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import config from '../../config.js';
import { log } from '../../utils/log.js';


async function deleteCommands(): Promise<void> {
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    try {
        log('INFO : Suppression des menu contextuels globaux...');
        const globalCommands = await rest.get(Routes.applicationCommands(config.clientId)) as Array<{ id: string; name: string }>;

        for (const command of globalCommands) {
            try {
                await rest.delete(Routes.applicationCommand(config.clientId, command.id));
                log(`SUCCÈS : menu contextuels global "${command.name}" supprimée.`);
            } catch (err: any) {
                log(`ERREUR : Impossible de supprimer le menu contextuel global "${command.name}" : ${err.message}`);
            }
        }

        log('INFO : Suppression des menus contextuels spécifiques aux guildes...');
        const guildIDs = ["1111160769132896377", "1214320754578165901"]; // Liste des guildes à vérifier

        for (const guildId of guildIDs) {
            console.log(guildId)
            try{
                const guildCommands = await rest.get(Routes.applicationGuildCommands(config.clientId, guildId)) as Array<{ id: string; name: string }>;

                for (const command of guildCommands) {
                    try {
                        await rest.delete(Routes.applicationGuildCommand(config.clientId, guildId, command.id));
                        log(`SUCCÈS : menu contextuel "${command.name}" supprimé sur la guilde ${guildId}.`);
                    } catch (err: any) {
                        log(`ERREUR : Impossible de supprimer du menu contextuel "${command.name}" sur la guilde ${guildId} : ${err.message}`);
                    }
                }
            } catch(err: any){
                log(`ERREUR : Impossible de récupérer ou supprimer les menu contextuels pour le server ${guildId} : ${err.message}`);
            }
        }

        log('INFO : Tous les menus contextuels ont été supprimées.');
    } catch (err: any) {
        log(`ERREUR CRITIQUE : Impossible de récupérer ou supprimer les menus contextuels : ${err.message}`);
    }
}

deleteCommands();
