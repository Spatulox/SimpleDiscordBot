#!/usr/bin/env node
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import {PermissionFlagsBits} from "discord.js";
import * as fs from 'fs/promises';
import {FileManager} from "../../FileManager";
import {Log} from "../../../utils/Log";
import {Guild} from "../../../cli/GuildListManager";

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
    public abstract folderPath: string | undefined;
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

    private async fetchCommands(
        endpoint:
            | ReturnType<typeof Routes.applicationCommands>
            | ReturnType<typeof Routes.applicationGuildCommands>,
        scope: 'global' | string,
        guildId?: string,
        printResult: boolean = true,
    ): Promise<Command[]> {
        const scopeLabel = scope === 'global' ? 'global' : `guild ${scope}`;
        console.log(`Handlers ${this.folderPath} on Discord (${scopeLabel})...`);

        try {
            const rawCmds = await this.rest.get(endpoint) as any[];
            const commands = rawCmds.filter(cmd => this.commandType.includes(cmd.type));

            const commandList: Command[] = commands.map((cmd: any, index: number) => ({
                index: index,
                name: cmd.name,
                type: cmd.type,
                description: cmd.description || 'N/A',
                default_member_permissions: cmd.default_member_permissions,
                default_member_permissions_string: this.bitfieldToPermissions(cmd.default_member_permissions),
                id: cmd.id,
                ...(guildId && { guildID: [guildId] })
            }));

            if(printResult) {
                console.log(`✅ ${commandList.length} ${this.folderPath}(s) found\n`);

                console.table(
                    commandList.map((cmd: Command) => ({
                        Nom: cmd.name,
                        Type: cmd.type === CommandType.SLASH ? 'Slash' :
                            cmd.type === CommandType.USER_CONTEXT_MENU ? 'User Context Menu' : 'Message Context Menu',
                        Description: cmd.description,
                        Permissions: cmd.default_member_permissions_string?.join(", "),
                        ID: cmd.id
                    })));
            }

            return commandList;
        } catch (error) {
            const errorMsg = scope === 'global'
                ? `❌ Error: ${(error as Error).message}`
                : `❌ Guild error ${scope}: ${(error as Error).message}`;
            Log.error(errorMsg);
            return [];
        }
    }

    async list(): Promise<Command[]> {
        return this.fetchCommands(
            Routes.applicationCommands(this.clientId),
            'global'
        );
    }

    async listGuild(guildID: string): Promise<Command[]> {
        return this.fetchCommands(
            Routes.applicationGuildCommands(this.clientId, guildID),
            guildID,
            guildID
        );
    }

    async listAllGuilds(guilds: Guild[]): Promise<{ guild: string; commands: Command[] }[]> {
        console.log("📡 Getting all guilds...\n");
        console.log(`📋 ${guilds.length} guild(s) found\n`);

        if (!guilds.length) return [];

        const guildCommandPromises = guilds.map(async (guild: Guild) => {
            try {
                const commands = await this.fetchCommands(
                    Routes.applicationGuildCommands(this.clientId, guild.id),
                    guild.id,
                    guild.id,
                    false
                );

                return {
                    guild: `${guild.name} (${guild.id})`,
                    guildId: guild.id,
                    commands,
                    count: commands.length
                };
            } catch (error) {
                console.error(`⚠️ Guild ${guild.id}: ${(error as Error).message}`);
                return {
                    guild: `${guild.name} (${guild.id})`,
                    guildId: guild.id,
                    commands: [],
                    count: 0
                };
            }
        });

        const results = await Promise.all(guildCommandPromises);

        console.log("\n📊 RÉSUMÉ PAR GUILD :\n");
        console.table(results.map(r => ({
            "Guild": r.guild,
            "Commandes": r.count,
            "Total": r.commands.length
        })));

        return results.filter(r => r.count > 0);
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
                    console.error(`⚠️  Guild ${guildId}: ${(error as Error).message}`);
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

        return result;
    }


}