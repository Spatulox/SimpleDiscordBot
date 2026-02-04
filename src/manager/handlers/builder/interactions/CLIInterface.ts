#!/usr/bin/env node
import readline from "readline";
import {BaseInteractionManager, Command} from "./BaseInteractionManager";
import {BotEnv} from "../../../../bot/BotEnv";
import {CommandManager, ContextMenuManager} from "./InteractionManager";

class CLIInterface {
    private rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    private managers: Record<string, BaseInteractionManager> = {};
    private currentMenu: 'main' | 'interaction' = 'main';
    private handlerManagerType = ""

    constructor() {
        const CLIENT_ID = BotEnv.clientId;
        const TOKEN = BotEnv.token;

        this.managers['CommandManager'] = new CommandManager(CLIENT_ID, TOKEN);
        this.managers['ContextMenuManager'] = new ContextMenuManager(CLIENT_ID, TOKEN);
    }

    async start(): Promise<void> {
        await this.showMainMenu();
    }

    private async showMainMenu(): Promise<void> {
        this.currentMenu = 'main';
        console.clear();
        console.log('Simple Discord Bot Manager CLI');
        console.log('═'.repeat(50));
        console.log('1. Manage Interactions (Slash command / Context menu / ...)');
        console.log('2. Generate Interaction Files (Slash command / Context menu / ...)');
        console.log('3. Help');
        console.log('4. Exit');
        console.log('═'.repeat(50));

        const choice = await this.prompt('Choose an option: ');
        switch (choice) {
            case '1': await this.showInteractionMenu(); break;
            case '2': await this.showGenerationMenu(); break;
            case '3': await this.showHelp(); break;
            case '4': console.log('Bye!'); process.exit(0);
            default: await this.showMainMenu();
        }
    }

    private async showInteractionMenu(): Promise<void> {
        this.currentMenu = 'interaction';
        console.clear();
        console.log('🔄 Interaction Manager');
        console.log('═'.repeat(40));
        console.log('1. CommandManager');
        console.log('2. ContextMenuManager');
        console.log('3. Back');
        console.log('═'.repeat(40));

        const choice = await this.prompt('Choose a manager: ');
        switch (choice) {
            case '1': await this.handleManager('CommandManager'); break;
            case '2': await this.handleManager('ContextMenuManager'); break;
            case '3': await this.showMainMenu(); break;
            default: await this.showInteractionMenu();
        }
    }

    private async handleManager(managerKey: string): Promise<void> {
        const manager = this.managers[managerKey];
        if (!manager) return;

        this.handlerManagerType = `${manager.folderPath}(s)`

        const managerName = managerKey;
        console.clear();
        console.log(`${managerName} - ${manager.folderPath}`);
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
            case '5':
                if (this.currentMenu === 'interaction') {
                    await this.showInteractionMenu();
                } else {
                    await this.showMainMenu();
                }
                return;
            default: await this.handleManager(managerKey);
        }

        await this.prompt('Press Enter to continue...');
        await this.handleManager(managerKey);
    }

    private async selectCommands(manager: BaseInteractionManager, remote: boolean = true): Promise<Command[]> {
        const commandList = remote ? await manager.list() as any[] : await manager.listFromFile() as any[];
        if (!commandList?.length) {
            console.log(`No ${this.handlerManagerType} found`);
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

        console.log(`${selected.length} selected ${this.handlerManagerType}`);
        return selected;
    }

    private async handleDeploy(manager: BaseInteractionManager): Promise<void> {
        const selected = await this.selectCommands(manager, false);
        if (selected.length === 0) return;
        await manager.deploy(selected)
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


    private async showGenerationMenu(): Promise<void> {
        console.log('⚙️  Generation - TODO');
        await this.prompt('Press Enter to continue...');
        await this.showMainMenu();
    }

    private async showHelp(): Promise<void> {
        console.clear();
        console.log('');
        console.log('||| HELP - Discord Bot Command Manager CLI |||');
        console.log('');
        console.log('🔗 Wiki: https://github.com/Spatulox/SimpleDiscordBot/wiki');
        console.log('═'.repeat(80));
        console.log('🤖 What it does:');
        console.log('  • Manage your Discord interactions (slash commands & context menus) via an interactive CLI');
        console.log('  • Let you deploy/update/delete any interaction');
        console.log('  • Let you generate an interaction files');

        console.log('');
        console.log('How you need to save your interaction files');
        console.log('📁 Folder Structure:');
        console.log('  ├── handlers/         ← in the root folder of your project');
        console.log('  │   ├── commands/     ← Slash Commands (type 1)');
        console.log('  │   └── context_menu/ ← Context Menus (type 2/3)');

        console.log('');
        console.log('🎯 Features:');
        console.log('  📊 1. List Remote    → Show deployed commands on Discord');
        console.log('  🚀 2. Deploy Local   → Deploy local JSON files → Discord');
        console.log('  🔄 3. Update Remote  → Update Discord commands based on local JSON file');
        console.log('  🗑️ 4. Delete Remote → Remove Discord commands based on local JSON file');

        console.log('');
        console.log('🎮 Selection:');
        console.log('  • Numbered lists appear after the interaction list');
        console.log('  • Enter: "1,3,5" or "all" to select which interaction you want to apply the action');

        console.log('');
        console.log('🔗 Wiki: https://github.com/Spatulox/SimpleDiscordBot/wiki');
        console.log('═'.repeat(80));

        await this.prompt('Press Enter to continue...');
        await this.showMainMenu();
    }

    private prompt(question: string): Promise<string> {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
    }
}
const cli = new CLIInterface()
cli.start()