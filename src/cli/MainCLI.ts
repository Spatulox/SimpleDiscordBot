import {BaseCLI} from "./BaseCLI";
import {InteractionCLI} from "./InteractionCLI";
import {GenerationCLI} from "./GenerationCLI/GenerationCLI";

/**
 * --- MainCLI ---
 * Main controller for sub menu
 */
export class MainCLI extends BaseCLI {

    protected getTitle(): string {
        return "💠 SimpleDiscordBot CLI";
    }

    constructor() {
        super();
        this.showMainMenu();
    }

    async showMainMenu(): Promise<void> {
        console.clear();
        console.log(this.getTitle());
        console.log('═'.repeat(50));
        console.log('1. Manage Interactions');
        console.log('2. Generate Files');
        console.log('3. Help');
        console.log('4. Exit');
        console.log('═'.repeat(50));

        const choice = await this.prompt('Choose an option: ');
        switch (choice) {
            case '1': return new InteractionCLI(this).showMainMenu();
            case '2': return new GenerationCLI(this).showMainMenu();
            case '3': return this.showHelp();
            case '4':
            case 'exit': console.log('👋 Bye!'); process.exit(0);
            default: return this.showMainMenu();
        }
    }
}

new MainCLI()