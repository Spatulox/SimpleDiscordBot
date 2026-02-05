import {BaseCLI, MenuSelectionCLI} from "../BaseCLI";
import { BotEnv } from "../../bot/BotEnv";
import { CommandManager, ContextMenuManager } from "../../manager/handlers/builder/interactions/InteractionManager";
import {InteractionManagerCLI} from "./InteractionCLIManager";

export class InteractionCLI extends BaseCLI {

    private managers: Record<string, any> = {};

    protected getTitle(): string {
        return '🔄 Interaction Manager CLI';
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: "CommandManager", action: () => new InteractionManagerCLI(this, this.managers["CommandManager"], "CommandManager") },
        { label: "ContextMenuManager", action: () => new InteractionManagerCLI(this, this.managers["ContextMenuManager"], "ContextMenuManager") },
        { label: 'Back', action: () => this, onSelect: () => this.goBack() },
    ];

    constructor(parent?: BaseCLI) {
        super(parent);
        const { clientId, token } = BotEnv;
        this.managers['CommandManager'] = new CommandManager(clientId, token);
        this.managers['ContextMenuManager'] = new ContextMenuManager(clientId, token);
    }

    protected async action(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}