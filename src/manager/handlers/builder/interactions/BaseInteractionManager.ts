#!/usr/bin/env node
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import * as fs from 'fs/promises';
import {FileManager} from "../../../FileManager";
import {Log} from "../../../../utils/Log";

// Types
export interface Command {
    name: string;
    description: string;
    options?: any[];
    default_member_permissions?: string | bigint | number;
    guildID?: string[];
    type: CommandType;
    id?: string;
    filename?: string
}

export enum CommandType {
    SLASH = 1,
    USER_CONTEXT_MENU,
    MESSAGE_CONTEXT_MENU,
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

    async listFromFile(): Promise<Command[]> {
        console.log(`Listing Handlers (${this.folderPath}) not deployed on discord`);

        try {
            const files = await FileManager.listJsonFiles(`./handlers/${this.folderPath}`);
            if (!files || files.length === 0) {
                console.log('No files found');
                return [];
            }

            const commandList: Command[] = [];

            for (const [index, file] of files.entries()) {
                const cmd = await this.readCommand(`./handlers/${this.folderPath}/${file}`);
                if (!cmd || cmd.id) continue;

                const commandWithIndex = {
                    ...cmd,
                    index: index,
                    filename: file
                };
                commandList.push(commandWithIndex as Command);
            }

            console.log(`✅ ${commandList.length} local ${this.folderPath}(s) not deployed\n`);

            console.table(
                commandList.map((cmd: any) => ({
                    '#': cmd.index,
                    Nom: cmd.name,
                    Type: cmd.type === CommandType.SLASH ? 'Slash' :
                        cmd.type === CommandType.USER_CONTEXT_MENU ? 'User' : 'Message',
                    Description: cmd.description,
                    Fichier: cmd.filename
                }))
            );

            return commandList;
        } catch (error) {
            Log.error(`${(error as Error).message}`);
            return [];
        }
    }

    async list(): Promise<Command[]> {
        console.log(`Handlers ${this.folderPath} on Discord (global)...`);

        try {
            const globalCmds = await this.rest.get(
                Routes.applicationCommands(this.clientId)
            ) as any[];

            const commands: Command[] = globalCmds.filter(cmd => this.commandType.includes(cmd.type));

            const commandList: Command[] = commands.map((cmd: any, index: number) => ({
                index: index,
                name: cmd.name,
                type: cmd.type,
                description: cmd.description || 'N/A',
                id: cmd.id
            }));

            console.log(`✅ ${commands.length} ${this.folderPath}(s) found\n`);

            console.table(
                commands.map((cmd: any) => ({
                    Nom: cmd.name,
                    Type: cmd.type === CommandType.SLASH ? 'Slash' : cmd.type === CommandType.USER_CONTEXT_MENU ? 'User' : 'Message',
                    Description: cmd.descriCommandTypeption,
                    ID: cmd.id.slice(-8)
                }))
            );
            return commandList;
        } catch (error) {
            Log.error(`❌ Erreur: ${(error as Error).message}`);
            return []
        }
    }

    async deploy(commands: Command[]): Promise<void> {
        console.log(`Deploying ${commands.length} ${this.folderPath}(s)...`);
        let updatedCount = 0;
        for (const cmd of commands) {
            const file = cmd.filename;
            if (!file) {
                Log.error(`${cmd.name}: Not linked to a file (wtf)`);
                continue;
            }

            try {
                await this.deploySingleCommand(cmd, file);
                updatedCount++;
            } catch (error) {
                Log.error(`Error ${file}: ${(error as Error).message}`);
            }
        }
        console.log(`✅ ${updatedCount}/${commands.length} deployed`);
    }

    async delete(commands: Command[]): Promise<void> {
        console.log(`Deleting ${commands.length} ${this.folderPath}(s)...`);
        for (const cmd of commands) {
            if (!cmd.id) {
                Log.error(`${cmd.name}: No Discord ID, cannot delete the ${this.folderPath}`);
                continue;
            }

            try {
                await this.rest.delete(Routes.applicationCommand(this.clientId, cmd.id));
                console.log(`${cmd.name} (${cmd.id.slice(-8)}) deleted`);
            } catch (error) {
                Log.error(`${cmd.name} (${cmd.id.slice(-8)}): ${(error as Error).message}`);
            }
        }
    }

    async update(commands: Command[]): Promise<void> {
        console.log(`Updating ${commands.length} ${this.folderPath}(s)...`);
        for (const cmd of commands) {
            if (!cmd.id) {
                Log.error(`${cmd.name}: No Discord ID, cannot update the ${this.folderPath}`);
                continue;
            }

            try {
                await this.rest.patch(Routes.applicationCommand(this.clientId, cmd.id), {
                    body: { description: `${cmd.description} (Updated ${new Date().toISOString()})` }
                });
                console.log(`${cmd.name} updated`);
            } catch (error) {
                Log.error(`${cmd.name}: ${(error as Error).message}`);
            }
        }
    }

    private async deploySingleCommand(cmd: Command, file: string): Promise<void> {
        const deployToGuilds = cmd.guildID?.length ? cmd.guildID! : [];
        const dataToSend = { ...cmd };
        delete dataToSend.guildID;

        if (cmd.type === CommandType.MESSAGE_CONTEXT_MENU || cmd.type === CommandType.USER_CONTEXT_MENU) {
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