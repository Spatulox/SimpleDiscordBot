import { BaseCLI } from "./BaseCLI";
import { BaseInteractionManager, Command } from "../manager/handlers/builder/interactions/BaseInteractionManager";
import { CommandManager, ContextMenuManager } from "../manager/handlers/builder/interactions/InteractionManager";
import { BotEnv } from "../bot/BotEnv";

export class InteractionCLI extends BaseCLI {
    private managers: Record<string, BaseInteractionManager> = {};

    constructor(parent?: BaseCLI) {
        super(parent);
        const { clientId, token } = BotEnv;
        this.managers['CommandManager'] = new CommandManager(clientId, token);
        this.managers['ContextMenuManager'] = new ContextMenuManager(clientId, token);
    }

    protected getTitle(): string {
        return '🔄 Interaction Manager CLI';
    }

    async showMainMenu(): Promise<void> {
        console.clear();
        console.log(this.getTitle());
        console.log('═'.repeat(40));
        console.log('1. CommandManager');
        console.log('2. ContextMenuManager');
        console.log('3. Back');
        console.log('═'.repeat(40));

        const choice = await this.prompt('Choose a manager: ');
        switch (choice) {
            case '1': return this.handleManager('CommandManager');
            case '2': return this.handleManager('ContextMenuManager');
            case '3': return this.goBack();
            default: return this.showMainMenu();
        }
    }

    private async handleManager(key: string): Promise<void> {
        const manager = this.managers[key];
        if (!manager) return;

        console.clear();
        console.log(`${key} - ${manager.folderPath}`);
        console.log('═'.repeat(50));
        console.log(`1. List remote ${manager.folderPath}`);
        console.log(`2. Deploy local ${manager.folderPath}`);
        console.log(`3. Update remote ${manager.folderPath}`);
        console.log(`4. Delete remote ${manager.folderPath}`);
        console.log('5. Back');
        console.log('═'.repeat(50));

        const choice = await this.prompt('Choose an action: ');
        switch (choice) {
            case '1': await manager.list(); break;
            case '2': await this.handleDeploy(manager); break;
            case '3': await this.handleUpdate(manager); break;
            case '4': await this.handleDelete(manager); break;
            case '5': return this.showMainMenu();
        }

        await this.prompt('Press Enter to continue...');
        return this.handleManager(key);
    }

    private async selectCommands(manager: BaseInteractionManager, remote: boolean = true): Promise<Command[]> {
        const handlerManagerType = `${manager.folderPath}(s)`;
        const commandList = remote ? await manager.list() as any[] : await manager.listFromFile() as any[];
        if (!commandList?.length) {
            console.log(`No ${handlerManagerType} found`);
            return [];
        }

        const input = await this.prompt('Enter numbers (ex: 1,3,5 or "all"): ');
        if (input.toLowerCase() === 'all') {
            return commandList;
        }

        const indices = input.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i));
        const selected = commandList.filter((cmd: any) => indices.includes(cmd.index));

        if (selected.length === 0) {
            console.log('Invalid number');
            return [];
        }

        console.log(`${selected.length} selected ${handlerManagerType}`);
        return selected;
    }

    private async handleDeploy(manager: BaseInteractionManager): Promise<void> {
        const selected = await this.selectCommands(manager, false);
        if (selected.length === 0) return;
        await manager.deploy(selected);
    }

    private async handleUpdate(manager: BaseInteractionManager): Promise<void> {
        const selected = await this.selectCommands(manager);
        if (selected.length === 0) return;
        await manager.update(selected);
    }

    private async handleDelete(manager: BaseInteractionManager): Promise<void> {
        const selected = await this.selectCommands(manager);
        if (selected.length === 0) return;
        await manager.delete(selected);
    }
}