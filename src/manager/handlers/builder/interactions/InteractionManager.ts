import {BaseInteractionManager, CommandType} from "./BaseInteractionManager";
import {FolderName} from "../../../../type/FolderName";

export class CommandManager extends BaseInteractionManager {
    public commandType: number[] = [CommandType.SLASH];
    public folderPath = FolderName.COMMANDS;
}

export class ContextMenuManager extends BaseInteractionManager {
    public commandType: number[] = [CommandType.USER_CONTEXT_MENU, CommandType.MESSAGE_CONTEXT_MENU];
    public folderPath = FolderName.CONTEXT_MENU;
}