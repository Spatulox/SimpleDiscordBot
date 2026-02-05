import {BaseCLI, MenuSelectionCLI} from "../BaseCLI";
import {ContextMenuGeneratorCLI} from "./ContextMenuGeneratorCLI";
import {ModalGeneratorCLI} from "./ModalGeneratorCLI";
import {InteractionGeneratorCLI} from "./InteractionGeneratorCLI";

export class GenerationCLI extends BaseCLI {

    protected getTitle(): string {
        return '⚙️  Generation Manager CLI';
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: 'Generate Slash Command Template', action: () => new InteractionGeneratorCLI(this) },
        { label: 'Generate Context Menu Template', action: () => new ContextMenuGeneratorCLI(this) },
        { label: 'Generate Modal Template', action: () => new ModalGeneratorCLI(this) },
        { label: 'Back', action: () => this, onSelect: () => this.goBack() },
    ];

    protected async action(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}