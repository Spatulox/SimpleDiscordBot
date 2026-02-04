// CLI Interface
import readline from "readline";
import {BaseInteractionManager} from "./BaseInteractionManager";
import {BotEnv} from "../../../../bot/BotEnv";
import {CommandManager, ContextMenuManager} from "./InteractionManager";

class CLIInterface {
    private rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    private managers: Record<string, BaseInteractionManager> = {};
    private currentMenu: 'main' | 'interaction' = 'main';

    constructor() {
        const CLIENT_ID = BotEnv.clientId;
        const TOKEN = BotEnv.token;

        this.managers['commands'] = new CommandManager(CLIENT_ID, TOKEN);
        this.managers['context-menu'] = new ContextMenuManager(CLIENT_ID, TOKEN);
    }

    async start(): Promise<void> {
        await this.showMainMenu();
    }

    private async showMainMenu(): Promise<void> {
        this.currentMenu = 'main';
        console.clear();
        console.log('🤖 Discord Bot Manager CLI');
        console.log('═'.repeat(50));
        console.log('1. Interaction Menu (Slash command / Context menu / ...)');
        console.log('2. Files Generation (Slash command / Context menu / ...)');
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
            case '1': await this.handleManager('commands'); break;
            case '2': await this.handleManager('context-menu'); break;
            case '3': await this.showMainMenu(); break;
            default: await this.showInteractionMenu();
        }
    }

    private async handleManager(managerKey: string): Promise<void> {
        const manager = this.managers[managerKey];
        if (!manager) return;

        const managerName = managerKey === 'commands' ? 'CommandManager' : 'ContextMenuManager';
        console.clear();
        console.log(`${managerName} - ${manager.folderPath}`);
        console.log('═'.repeat(50));
        console.log('1. List');
        console.log('2. Deploy');
        console.log('3. Update');
        console.log('4. Delete');
        console.log('5. Back');
        console.log('═'.repeat(50));

        const choice = await this.prompt('Choose an action: ');
        switch (choice) {
            case '1': await manager.list(); break;
            case '2': await manager.deploy(); break;
            case '3': await manager.update(); break;
            case '4': await manager.delete(); break;
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

    private async showGenerationMenu(): Promise<void> {
        console.log('⚙️  Generation - TODO');
        await this.prompt('Press Enter to continue...');
        await this.showMainMenu();
    }

    private async showHelp(): Promise<void> {
        console.log(`
🆘 HELP - Simple Discord Bot Manager CLI

📁 Folder's struct :
├── handlers/
│   ├── commands/     ← Slash commands (type 1)
│   └── context-menu/ ← Context Menu (type 2/3)

🎯 Functionalities:
• List: Affiche les fichiers JSON locaux
• Deploy: Deploy commande/context menu which exist on local file but not on Discord
• Update: Update Discord command, based on the local files
• Delete: Efface TOUT sur Discord

For an exemple of json file, please see "https://github.com/Spatulox/SimpleDiscordBot/wiki"
        `);
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