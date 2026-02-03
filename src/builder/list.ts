import { Routes } from 'discord-api-types/v10';
import { client } from '../utils/client.js';
import { log } from '../utils/log.js';
import { loginBot } from '../utils/login.js';
import config from "../config.json" with {type: "json"}
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

export interface DiscordCommand extends Command {
    discordData?: any; // Données complètes depuis Discord API
    deployedGuilds: string[]; // Serveurs où la commande est déployée
}

export async function analyzeRegisteredCommands(): Promise<DiscordCommand[]> {
    if (!(await loginBot(client))) {
        log("Erreur : Impossible de connecter le bot");
        process.exit();
    }

    const allRegisteredCommands: DiscordCommand[] = [];

    client.once(Events.ClientReady, async () => {
        log('INFO : Analyse des commandes enregistrées sur Discord');

        // 1. Récupérer TOUTES les commandes Discord du bot
        const globalDiscordCmds: any[] = await client.rest.get(
            Routes.applicationCommands(client.user!.id)
        ) as any[];

        // 2. Récupérer les commandes de TOUS les serveurs où le bot est présent
        const botGuilds = client.guilds.cache.map(guild => guild.id);
        const guildDiscordCmds: Record<string, any[]> = {};

        log(`Analyse des ${botGuilds.length} serveurs où le bot est présent...`);

        for (const guildId of botGuilds) {
            try {
                const guildCmds = await client.rest.get(
                    Routes.applicationGuildCommands(config.clientId, guildId)
                ) as any[];
                guildDiscordCmds[guildId] = guildCmds;
                log(`Serveur ${guildId}: ${guildCmds.length} commandes guild`);
            } catch (error) {
                // Le bot n'a peut-être pas les permissions ou n'est pas dans ce serveur
                guildDiscordCmds[guildId] = [];
            }
        }

        // 3. Classer les commandes par nom et type
        const commandMap = new Map<string, DiscordCommand>();

        // Commandes globales
        for (const cmd of globalDiscordCmds) {
            const key = `${cmd.name}_${cmd.type}`;
            if (!commandMap.has(key)) {
                commandMap.set(key, {
                    name: cmd.name,
                    description: cmd.description || '',
                    type: cmd.type,
                    id: cmd.id,
                    deployedGuilds: ['GLOBAL'],
                    discordData: cmd
                });
            } else {
                const existing = commandMap.get(key)!;
                existing.deployedGuilds.push('GLOBAL');
            }
        }

        // Commandes par serveur
        for (const [guildId, guildCmds] of Object.entries(guildDiscordCmds)) {
            for (const cmd of guildCmds) {
                const key = `${cmd.name}_${cmd.type}`;
                if (!commandMap.has(key)) {
                    commandMap.set(key, {
                        name: cmd.name,
                        description: cmd.description || '',
                        type: cmd.type,
                        id: cmd.id,
                        deployedGuilds: [guildId],
                        discordData: cmd
                    });
                } else {
                    const existing = commandMap.get(key)!;
                    if (!existing.deployedGuilds.includes(guildId)) {
                        existing.deployedGuilds.push(guildId);
                    }
                }
            }
        } // ← Fermeture de la boucle for guildId

        // 4. Conversion en tableau et tri  ← ✅ DÉPLACÉ ICI (CORRIGÉ)
        for (const [_key, cmd] of commandMap) {
            allRegisteredCommands.push(cmd);
        }

        allRegisteredCommands.sort((a, b) => {
            if (a.deployedGuilds.includes('GLOBAL') && !b.deployedGuilds.includes('GLOBAL')) return -1;
            if (!a.deployedGuilds.includes('GLOBAL') && b.deployedGuilds.includes('GLOBAL')) return 1;
            return a.name.localeCompare(b.name);
        });

        // 5. Affichage du classement
        console.log('\n' + '='.repeat(80));
        console.log('📋 CLASSEMENT DES COMMANDES ENREGISTRÉES SUR DISCORD');
        console.log('='.repeat(80));

        const globalCmds = allRegisteredCommands.filter(cmd => cmd.deployedGuilds.includes('GLOBAL'));
        const guildOnlyCmds = allRegisteredCommands.filter(cmd => !cmd.deployedGuilds.includes('GLOBAL'));

        console.log(`🌍 ${globalCmds.length} commandes GLOBALES`);
        console.log(`🏛️  ${guildOnlyCmds.length} commandes SERVEUR-SEUL`);

        // Tableau récapitulatif
        console.table(
            allRegisteredCommands.map(cmd => ({
                Nom: cmd.name,
                Type: cmd.type === 1 ? 'Slash' : cmd.type === 2 ? 'User Context' : 'Message Context',
                Serveurs: cmd.deployedGuilds.length > 3
                    ? `${cmd.deployedGuilds.slice(0, 3).join(', ')}... (+${cmd.deployedGuilds.length - 3})`
                    : cmd.deployedGuilds.join(', '),
                ID: cmd.id?.slice(-8) || 'N/A'
            }))
        );

        // Détails par catégorie
        if (globalCmds.length > 0) {
            console.log('\n🌍 COMMANDES GLOBALES:');
            globalCmds.forEach(cmd => {
                console.log(`  • ${cmd.name} (ID: ${cmd.id?.slice(-8)}) - ${cmd.description}`);
            });
        }

        if (guildOnlyCmds.length > 0) {
            console.log('\n🏛️  COMMANDES SERVEUR-SEULEMENT:');
            const groupedByGuild = guildOnlyCmds.reduce((acc, cmd) => {
                for (const guildId of cmd.deployedGuilds) {
                    if (!acc[guildId]) acc[guildId] = [];
                    acc[guildId].push(cmd.name);
                }
                return acc;
            }, {} as Record<string, string[]>);

            for (const [guildId, cmds] of Object.entries(groupedByGuild)) {
                console.log(`  📂 Serveur ${guildId.slice(-8)}: ${cmds.join(', ')}`);
            }
        }

        console.log('\n✅ Analyse terminée!');
        process.exit();
    });

    return allRegisteredCommands;
}

// Utilisation
analyzeRegisteredCommands();