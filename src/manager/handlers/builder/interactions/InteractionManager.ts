import {BaseInteractionManager, CommandType} from "./BaseInteractionManager";

export class CommandManager extends BaseInteractionManager {
    public commandType: number[] = [CommandType.SLASH];
    public folderPath = 'commands';
}

export class ContextMenuManager extends BaseInteractionManager {
    public commandType: number[] = [CommandType.USER_CONTEXT_MENU, CommandType.MESSAGE_CONTEXT_MENU];
    public folderPath = 'context_menu';
}