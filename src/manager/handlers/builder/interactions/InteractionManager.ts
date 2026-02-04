import {BaseInteractionManager} from "./BaseInteractionManager";

export class CommandManager extends BaseInteractionManager {
    public commandType: number[] = [1];
    public folderPath = 'commands';
}

export class ContextMenuManager extends BaseInteractionManager {
    public commandType: number[] = [2, 3];
    public folderPath = 'context-menu';
}