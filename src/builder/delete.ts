import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { log } from '../utils/log.js';
import config from '../config.js';

async function deleteAllCommandsAndMenus(): Promise<void> {
    const rest = new REST({ version: '10' }).setToken(config.token);
    const guildIDs = ["1111160769132896377", "1214320754578165901"]; // Liste des guildes à vérifier

    try {
        // 1. Suppression des commandes/menus globaux
        log('INFO : Suppression des commandes et menus contextuels globaux...');
        const globalCommands = await rest.get(Routes.applicationCommands(config.clientId)) as Array<{ id: string; name: string }>;

        for (const command of globalCommands) {
            try {
                await rest.delete(Routes.applicationCommand(config.clientId, command.id));
                log(`SUCCÈS : Commande/menu contextuel global "${command.name}" supprimé.`);
            } catch (err: any) {
                log(`ERREUR : Impossible de supprimer la commande/menu contextuel global "${command.name}" : ${err.message}`);
            }
        }

        // 2. Suppression des commandes/menus spécifiques aux guildes
        log('INFO : Suppression des commandes et menus contextuels spécifiques aux guildes...');
        for (const guildId of guildIDs) {
            try {
                const guildCommands = await rest.get(Routes.applicationGuildCommands(config.clientId, guildId)) as Array<{ id: string; name: string }>;

                for (const command of guildCommands) {
                    try {
                        await rest.delete(Routes.applicationGuildCommand(config.clientId, guildId, command.id));
                        log(`SUCCÈS : Commande/menu contextuel "${command.name}" supprimé sur la guilde ${guildId}.`);
                    } catch (err: any) {
                        log(`ERREUR : Impossible de supprimer la commande/menu contextuel "${command.name}" sur la guilde ${guildId} : ${err.message}`);
                    }
                }
            } catch (err: any) {
                log(`ERREUR : Impossible de récupérer ou supprimer les commandes/menus contextuels pour le serveur ${guildId} : ${err.message}`);
            }
        }

        log('INFO : Toutes les commandes et menus contextuels ont été supprimés.');
    } catch (err: any) {
        log(`ERREUR CRITIQUE : Impossible de récupérer ou supprimer les commandes/menus contextuels : ${err.message}`);
    }
}

deleteAllCommandsAndMenus();
