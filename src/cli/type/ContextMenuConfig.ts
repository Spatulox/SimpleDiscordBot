import {PermissionFlagsBits} from "discord.js";

export interface ContextMenuConfig {
    name: string;
    type: 2 | 3; // 2=User, 3=Message
    type_comment?: Array<string>;
    default_member_permissions?: Array<(keyof typeof PermissionFlagsBits)>;
    dm_permission: boolean;
    integration_types: ContextMenuIntegrationType[]; // [0, 1] = [GUILD_INSTALL, USER_INSTALL]
    contexts?: ContextMenuContextType[]; // [0, 1, 2] = [Server, Bot DMs, Group/Other DMs]
    guildID?: Array<string>;
}

enum ContextMenuIntegrationType {
    GUILD_INSTALLED = 0,
    USER_INSTALLED = 1,
}

enum ContextMenuContextType {
    SERVER_CHANNEL,
    BOT_DM,
    GROUP_DM
}