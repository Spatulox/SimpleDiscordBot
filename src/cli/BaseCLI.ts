#!/usr/bin/env node
import readline from "readline";

/*protected async showMainMenu(): Promise<void> {
        this.currentMenu = 'main';
        console.clear();
        console.log(this.getTitle());
        console.log('═'.repeat(50));
        console.log('1. Manage');
        console.log('2. Generate');
        console.log('3. Help');
        console.log('4. Exit');
        console.log('═'.repeat(50));

        const choice = await this.prompt('Choose an option: ');
        switch (choice) {
            case '1': await new InteractionCLI().showMainMenu(); break;
            case '2': await new GenerationCLI().showMainMenu(); break;
            case '3': await this.showHelp(); break;
            case '4': console.log('Bye!'); process.exit(0); break;
            default: await this.showMainMenu();
        }
        await this.prompt('Press Enter to continue...');
    }*/

/**
 * --- BaseCLI ---
 * Classe de base de toutes les interfaces CLI
 */
export abstract class BaseCLI {
    private static _rl: readline.Interface | null = null;

    protected get rl() {
        if (!BaseCLI._rl) {
            BaseCLI._rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        }
        return BaseCLI._rl;
    }

    constructor(protected parent?: BaseCLI) {}

    protected getTitle(): string {
        return "BaseCLI";
    }

    protected abstract showMainMenu(): Promise<void>;

    protected async prompt(question: string): Promise<string> {
        return new Promise(resolve => this.rl.question(question, resolve));
    }

    protected async showHelp(): Promise<void> {
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
        console.log('  ├── handlers/         ← In the root folder of your project');
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
        if (this.parent) {
            await this.parent.showMainMenu();
        } else {
            await this.showMainMenu();
        }
    }

    protected async goBack(): Promise<void> {
        await this.parent?.showMainMenu();
    }
}
