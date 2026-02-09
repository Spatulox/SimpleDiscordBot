import {PermissionFlagsBits} from "discord.js";
import {InteractionContextType, InteractionIntegrationType} from "./InteractionType";

export type DiscordCommandType =
    | 1  // SUB_COMMAND
    | 2  // SUB_COMMAND_GROUP  
    | 3  // STRING
    | 4  // INTEGER
    | 5  // BOOLEAN
    | 6  // USER
    | 7  // CHANNEL
    | 8  // ROLE
    | 9  // MENTIONABLE
    | 10 // NUMBER
    | 11; // ATTACHMENT

export type PermissionString = keyof typeof PermissionFlagsBits | string;

export interface Choice {
    name: string;
    value: string;
}

export interface Option {
    type: DiscordCommandType;
    name: string;
    description: string;
    required?: boolean;
    choices?: Choice[];
    min_length?: number;
    max_length?: number;
    min_value?: number;
    max_value?: number;
    channel_types?: number[]; // 0=text, 2=voice, 4=category, etc.
    autocomplete?: boolean;
}

export interface CommandOption extends Option {
    options?: CommandOption[];
}

export interface SlashCommandConfig {
    name: string;
    description: string;
    type: 1;
    options?: CommandOption[];

    default_member_permissions?: PermissionString[];
    default_member_permissions_string?: PermissionString[];

    dm_permission: boolean;

    integration_types: InteractionIntegrationType[];

    contexts: InteractionContextType[];

    guildID?: string[];
}

export interface ServerManagementCommandConfig {
    name: string;
    type: 1;
    description: string;
    permissions?: PermissionString[];
    options: CommandOption[];
}
