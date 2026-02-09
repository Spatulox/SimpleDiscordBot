#!/usr/bin/env node
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import {PermissionFlagsBits} from "discord.js";
import * as fs from 'fs/promises';
import {FileManager} from "../../FileManager";
import {Log} from "../../../utils/Log";

// Types
export interface Command {
    name: string;
    description: string;
    options?: any[];
    default_member_permissions?: string | bigint | number;
    default_member_permissions_string?: string[];
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
                const cmd = await this.readInteraction(`./handlers/${this.folderPath}/${file}`);
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

            const commandList: Command[] = commands.map((cmd: Command, index: number) => ({
                index: index,
                name: cmd.name,
                type: cmd.type,
                description: cmd.description || 'N/A',
                default_member_permissions: cmd.default_member_permissions,
                default_member_permissions_string: this.bitfieldToPermissions(cmd.default_member_permissions),
                id: cmd.id
            }));

            console.log(`✅ ${commandList.length} ${this.folderPath}(s) found\n`);

            console.table(
                commandList.map((cmd: Command) => ({
                    Nom: cmd.name,
                    Type: cmd.type === CommandType.SLASH ? 'Slash' : cmd.type === CommandType.USER_CONTEXT_MENU ? 'User Context Menu' : 'Message Context Menu',
                    Description: cmd.description,
                    Permissions: cmd.default_member_permissions_string?.join(", "),
                    ID: cmd?.id
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
                await this.deploySingleInteraction(cmd, file);
                updatedCount++;
            } catch (error) {
                Log.error(`Error ${file}: ${(error as Error).message}`);
            }
        }
        console.log(`✅ ${updatedCount}/${commands.length} deployed`);
    }

    async delete(commands: Command[]): Promise<void> {
        console.log(`Deleting ${commands.length} ${this.folderPath}(s)...`);

        const IDList: string[] = [];

        for (const cmd of commands) {
            if (!cmd.id) {
                Log.error(`${cmd.name}: No Discord ID, cannot delete the ${this.folderPath}`);
                continue;
            }

            IDList.push(cmd.id);

            try {
                await this.rest.delete(Routes.applicationCommand(this.clientId, cmd.id));
                console.log(`${cmd.name} (${cmd.id.slice(-8)}) deleted`);
            } catch (error) {
                Log.error(`${cmd.name} (${cmd.id.slice(-8)}): ${(error as Error).message}`);
            }
        }
        await this.removeLocalIdFromFile(IDList);
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

    private async deploySingleInteraction(cmd: Command, file: string): Promise<void> {
        console.log(cmd)
        const deployToGuilds = cmd.guildID?.length ? cmd.guildID! : [];
        const dataToSend = { ...cmd };
        delete dataToSend.guildID;

        if (cmd.default_member_permissions_string && Array.isArray(cmd.default_member_permissions_string)) {
            const bitfield = this.permissionsToBitfield(cmd.default_member_permissions_string);
            if (bitfield !== undefined) {
                dataToSend.default_member_permissions = bitfield;
                cmd.default_member_permissions = bitfield;
            } else {
                delete dataToSend.default_member_permissions;
            }
        }

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
                        await this.saveInteraction(file, cmd);
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
                    await this.saveInteraction(file, cmd);
                } else {
                    await this.rest.patch(Routes.applicationCommand(this.clientId, found.id), { body: dataToSend });
                }
            } catch (error) {
                console.error(`⚠️  Global: ${(error as Error).message}`);
            }
        }
    }

    private async readInteraction(filePath: string): Promise<Command | null> {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data) as Command;
        } catch {
            return null;
        }
    }

    private async saveInteraction(fileName: string, cmd: Command): Promise<void> {
        delete cmd.filename
        const filePath = `./handlers/${this.folderPath}/${fileName}`;
        await fs.writeFile(filePath, JSON.stringify(cmd, null, 2));
    }

    private async removeLocalIdFromFile(idListToDelete: string[]): Promise<void> {

        const files = await FileManager.listJsonFiles(`./handlers/${this.folderPath}`);
        if (!files || files.length === 0) {
            console.log('No local files to clean');
            return
        }

        for (const file of files) {
            const filePath = `./handlers/${this.folderPath}/${file}`;
            const localCmd = await this.readInteraction(filePath);

            if (localCmd && localCmd.id && idListToDelete.includes(localCmd.id)) {
                delete localCmd.id;
                await this.saveInteraction(file, localCmd);
                break;
            }
        }
    }

    private permissionsToBitfield(perms: string[] | undefined): string | undefined {
        if (!perms || perms.length === 0) return undefined;

        let bits = 0n;
        for (const name of perms) {
            const value = (PermissionFlagsBits as Record<string, bigint>)[name];
            if (!value) {
                console.warn(`Unknow permission in default_member_permissions: ${name}`);
                continue;
            }
            bits |= value;
        }

        return bits.toString();
    }

    private bitfieldToPermissions(bitfield: string | number | bigint | undefined): string[] {
        if (!bitfield) return [];

        const bits = BigInt(bitfield);
        const result: string[] = [];

        for (const [name, value] of Object.entries(PermissionFlagsBits)) {
            if ((bits & value) === value) {
                result.push(name);
            }
        }
        console.log("Y'a un result", result);
        return result;
    }


}