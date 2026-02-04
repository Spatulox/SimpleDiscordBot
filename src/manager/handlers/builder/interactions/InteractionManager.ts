import {BaseInteractionManager, CommandType} from "./BaseInteractionManager";

export enum FolderName {
    COMMANDS = 'commands',
    CONTEXT_MENU = 'context_menu',
}

export class CommandManager extends BaseInteractionManager {
    public commandType: number[] = [CommandType.SLASH];
    public folderPath = FolderName.COMMANDS;
}

export class ContextMenuManager extends BaseInteractionManager {
    public commandType: number[] = [CommandType.USER_CONTEXT_MENU, CommandType.MESSAGE_CONTEXT_MENU];
    public folderPath = FolderName.CONTEXT_MENU;
}