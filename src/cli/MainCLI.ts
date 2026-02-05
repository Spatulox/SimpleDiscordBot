import {BaseCLI, MenuSelectionCLI} from "./BaseCLI";
import {InteractionCLI} from "./InteractionCLI/InteractionCLI";
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

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: "Manage Interactions", action: () => new InteractionCLI(this) },
        { label: "Generate Files", action: () => new GenerationCLI(this) },
        { label: "Help", action: () => this, onSelect: () => this.showHelp() },
        { label: "Exit", action: () => null, onSelect: () => process.exit() },
    ];

    protected action(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

new MainCLI()