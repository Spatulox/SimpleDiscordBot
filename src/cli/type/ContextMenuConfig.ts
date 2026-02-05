import {PermissionFlagsBits} from "discord.js";
import {InteractionContextType, InteractionIntegrationType} from "./InteractionType";

export interface ContextMenuConfig {
    name: string;
    type: 2 | 3; // 2=User, 3=Message
    type_comment?: Array<string>;
    default_member_permissions?: Array<(keyof typeof PermissionFlagsBits)>;
    dm_permission: boolean;
    integration_types: InteractionIntegrationType[];
    contexts?: InteractionContextType[];
    guildID?: Array<string>;
}