import {BaseCLI, MenuSelectionCLI} from "../BaseCLI";
import { BotEnv } from "../../bot/BotEnv";
import {
    //AllInteractionManager,
    CommandManager,
    ContextMenuManager
} from "../../manager/handlers/interactions/InteractionManager";
import {InteractionManagerCLI} from "./InteractionCLIManager";

export class InteractionCLI extends BaseCLI {

    private managers: Record<string, any> = {};

    protected getTitle(): string {
        return '🔄 Interaction Manager CLI';
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: "Command Manager", action: () => new InteractionManagerCLI(this, this.managers["CommandManager"], "CommandManager") },
        { label: "ContextMenu Manager", action: () => new InteractionManagerCLI(this, this.managers["ContextMenuManager"], "ContextMenuManager") },
        //{ label: "All Interaction Manager", action: () => new InteractionManagerCLI(this, this.managers["InteractionManager"], "InteractionManager") },
        { label: 'Back', action: () => this.goBack()},
    ];

    constructor(parent?: BaseCLI) {
        super(parent);
        const { clientId, token } = BotEnv;
        this.managers['CommandManager'] = new CommandManager(clientId, token);
        this.managers['ContextMenuManager'] = new ContextMenuManager(clientId, token);
        //this.managers['InteractionManager'] = new AllInteractionManager(clientId, token);
    }

    protected async execute(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}