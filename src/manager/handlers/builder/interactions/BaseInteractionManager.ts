#!/usr/bin/env node
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import * as fs from 'fs/promises';
import {FileManager} from "../../../FileManager";
import {Log} from "../../../../utils/Log";

// Types
interface Command {
    name: string;
    description: string;
    options?: any[];
    default_member_permissions?: string | bigint | number;
    guildID?: string[];
    type: 1 | 2 | 3;
    id?: string;
}

export abstract class BaseInteractionManager {
    public abstract folderPath: string;
    public abstract commandType: number[];
    protected clientId: string;
    protected token: string;
    protected rest: REST;

    constructor(clientId: string, token: string) {
        this.clientId = clientId;
        this.token = token;
        this.rest = new REST({ version: '10' }).setToken(token);
    }

    async list(): Promise<void> {
        console.log(`📋 Commandes ${this.folderPath} sur Discord (globales)...`);

        try {
            const globalCmds = await this.rest.get(
                Routes.applicationCommands(this.clientId)
            ) as any[];

            const commands = globalCmds.filter(cmd => this.commandType.includes(cmd.type));

            console.log(`✅ ${commands.length} commandes trouvées\n`);

            console.table(
                commands.map((cmd: any) => ({
                    Nom: cmd.name,
                    Type: cmd.type === 1 ? 'Slash' : cmd.type === 2 ? 'User' : 'Message',
                    Description: cmd.description,
                    ID: cmd.id.slice(-8)
                }))
            );

        } catch (error) {
            Log.error(`❌ Erreur: ${(error as Error).message}`);
        }
    }

    async deploy(): Promise<void> {
        console.log(`Deploy ${this.folderPath}...`);
        const files = await FileManager.listJsonFiles("./handlers/"+this.folderPath);
        if(!files){
            Log.error('Error listing files');
            return
        }
        let updatedCount = 0;

        for (const file of files) {
            const cmd = await this.readCommand(`./handlers/${this.folderPath}/${file}`);
            if (!cmd) continue;

            try {
                await this.deploySingleCommand(cmd, file);
                updatedCount++;
            } catch (error) {
                Log.error(`Error ${file}: ${(error as Error).message}`);
            }
        }
        console.log(`✅ ${updatedCount}/${files.length} déployés`);
    }

    async update(): Promise<void> {
        console.log(`Update ./handlers/${this.folderPath}...`);
        await this.deploy(); // Même logique que deploy
    }

    async delete(): Promise<void> {
        console.log(`Delete ./handlers/${this.folderPath}...`);
        try {
            // Globales
            const globalCmds = await this.rest.get(Routes.applicationCommands(this.clientId)) as any[];
            for (const cmd of globalCmds) {
                await this.rest.delete(Routes.applicationCommand(this.clientId, cmd.id));
                console.log(`🗑️  ${cmd.name} (global)`);
            }

            // Guilds
            /*for (const guildId of guildIds) {
                try {
                    const guildCmds = await this.rest.get(Routes.applicationGuildCommands(this.clientId, guildId)) as any[];
                    for (const cmd of guildCmds) {
                        await this.rest.delete(Routes.applicationGuildCommand(this.clientId, guildId, cmd.id));
                        console.log(chalk.red(`🗑️  ${cmd.name} (guild ${guildId.slice(-4)})`));
                    }
                } catch {}
            }*/
            console.log('✅ Tout supprimé');
        } catch (error) {
            console.error(`❌ Erreur: ${(error as Error).message}`);
        }
    }

    private async deploySingleCommand(cmd: Command, file: string): Promise<void> {
        const deployToGuilds = cmd.guildID?.length ? cmd.guildID! : [];
        const dataToSend = { ...cmd };
        delete dataToSend.guildID;

        if (cmd.type === 2 || cmd.type === 3) {
            delete dataToSend.options;
        }

        // Guild deployment
        if (deployToGuilds.length > 0) {
            for (const guildId of deployToGuilds) {
                try {
                    const guildCmds = await this.rest.get(Routes.applicationGuildCommands(this.clientId, guildId)) as any[];
                    const found = guildCmds.find((c: any) => c.name === cmd.name);

                    if (!cmd.id || !found) {
                        const resp = await this.rest.post(Routes.applicationGuildCommands(this.clientId, guildId), { body: dataToSend });
                        cmd.id = (resp as any).id;
                        await this.saveCommand(file, cmd);
                    } else {
                        await this.rest.patch(Routes.applicationGuildCommand(this.clientId, guildId, found.id), { body: dataToSend });
                    }
                } catch (error) {
                    console.error(`⚠️  Guild ${guildId.slice(-4)}: ${(error as Error).message}`);
                }
            }
        } else {
            // Global deployment
            try {
                const globalCmds = await this.rest.get(Routes.applicationCommands(this.clientId)) as any[];
                const found = globalCmds.find((c: any) => c.name === cmd.name);

                if (!cmd.id || !found) {
                    const resp = await this.rest.post(Routes.applicationCommands(this.clientId), { body: dataToSend });
                    cmd.id = (resp as any).id;
                    await this.saveCommand(file, cmd);
                } else {
                    await this.rest.patch(Routes.applicationCommand(this.clientId, found.id), { body: dataToSend });
                }
            } catch (error) {
                console.error(`⚠️  Global: ${(error as Error).message}`);
            }
        }
    }

    private async readCommand(filePath: string): Promise<Command | null> {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data) as Command;
        } catch {
            return null;
        }
    }

    private async saveCommand(fileName: string, cmd: Command): Promise<void> {
        const filePath = `./handlers/${this.folderPath}/${fileName}`;
        await fs.writeFile(filePath, JSON.stringify(cmd, null, 2));
    }
}