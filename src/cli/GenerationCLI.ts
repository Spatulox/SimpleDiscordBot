import { BaseCLI } from "./BaseCLI";

export class GenerationCLI extends BaseCLI {

    protected getTitle(): string {
        return '⚙️  Generation Manager CLI';
    }

    async showMainMenu(): Promise<void> {
        console.clear();
        console.log(this.getTitle());
        console.log('═'.repeat(40));
        console.log('1. Generate Slash Command Template');
        console.log('2. Generate Context Menu Template');
        console.log('3. Generate All Templates');
        console.log('4. Back');
        console.log('═'.repeat(40));

        const choice = await this.prompt('Choose an option: ');
        switch (choice) {
            case '1': console.log('Slash template generation - TODO'); break;
            case '2': console.log('Context menu template - TODO'); break;
            case '3': console.log('All templates - TODO'); break;
            case '4': return this.goBack();
        }

        await this.prompt('Press Enter to continue...');
        return this.showMainMenu();
    }
}