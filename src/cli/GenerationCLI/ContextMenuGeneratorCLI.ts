import {BaseCLI} from "../BaseCLI";
import * as path from "path";
import {FileManager} from "../../manager/FileManager";
import {FolderName} from "../../manager/handlers/builder/interactions/InteractionManager";

export class ContextMenuGeneratorCLI extends BaseCLI {
    protected getTitle(): string {
        return "📝 Context Menu JSON Generator";
    }

    async showMainMenu(): Promise<void> {
        console.clear();
        console.log(this.getTitle());
        console.log('═'.repeat(50));
        console.log("Follow the questions to generate your JSON file");
        console.log("1. Generate Context Menu");
        console.log("2. Back");
        console.log('═'.repeat(50));

        const choice = await this.prompt('Choose an option: ');
        switch (choice) {
            case '1': await this.generateContextMenu(); break;
            case '2':
            case 'exit': return this.goBack();
            default: return this.showMainMenu();
        }
    }

    private async generateContextMenu(): Promise<void> {
        const config: any = {};

        // 1. Nom du Context Menu
        console.clear();
        console.log("👤 1/10 - Name");
        config.name = await this.prompt("Enter Context Menu name (ex: 'Example context Menu'): ");

        // 2. Type (2=User, 3=Message)
        console.clear();
        console.log("🔧 2/10 - Type");
        console.log("2 => Context Menu for users");
        console.log("3 => Context Menu for messages");
        config.type = parseInt(await this.prompt("Enter type (2 or 3): "));

        // 3. Permissions
        console.clear();
        console.log("🔐 3/10 - Permissions");
        const permsInput = await this.prompt("Default member permissions (comma separated, or 'none'): ");
        config.default_member_permissions = permsInput === 'none' ? [] : permsInput.split(',').map(p => p.trim());

        // 4. DM Permission
        console.clear();
        console.log("💬 4/10 - DM Permission");
        config.dm_permission = (await this.prompt("DM permission? (true/false): ")).toLowerCase() === 'true';

        // 5. Integration Types
        console.clear();
        console.log("🔗 5/10 - Integration Types");
        console.log("0 => GUILD_INSTALL");
        console.log("1 => USER_INSTALL");
        console.log("(comma separated, or 'all')");
        const intInput = await this.prompt("Integration types: ");
        if (intInput.toLowerCase() === 'all') {
            config.integration_types = [0, 1];
        } else if (intInput.toLowerCase() !== '') {
            config.integration_types = intInput.split(',').map(i => parseInt(i.trim()));
        }

        // 6. Contexts (si type 2 ou 3)
        if (config.type !== 1) {
            console.clear();
            console.log("🌐 6/10 - Contexts");
            console.log("0 => Can be used inside server");
            console.log("1 => Can be used inside DMs with bot");
            console.log("2 => Group DMs & other DMs");
            console.log("(comma separated, or 'all')");
            const ctxInput = await this.prompt("Contexts: ");
            if (ctxInput.toLowerCase() === 'all') {
                config.contexts = [0, 1, 2];
            }  else if (intInput.toLowerCase() !== '')  {
                config.contexts = ctxInput.split(',').map(i => parseInt(i.trim()));
            }
        }

        // 7. Guild IDs (optionnel)
        console.clear();
        console.log("🏠 7/10 - Guild IDs (optional)");
        console.log(" => Used to deploy specific context menu for specific guild");
        const guildInput = await this.prompt("Guild IDs (comma separated, or 'none'): ");
        if(guildInput.toLowerCase() !== 'none' && guildInput.toLowerCase() !== '') {
            config.guildID = guildInput.split(',').map(id => id.trim());
        }

        // 8. Nom du fichier
        console.clear();
        console.log("💾 8/10 - File");
        const filename = await this.prompt("Filename (ex: my-context-menu): ") + ".json";

        // 9. Sauvegarde
        console.clear();
        console.log("✨ Final JSON preview:");
        console.log(JSON.stringify(config, null, 2));

        const confirm = await this.prompt("\nSave this file? (y/n): ");
        if (confirm.toLowerCase() !== 'y') {
            console.log("❌ Cancelled");
            await this.prompt('Press Enter...');
            return this.showMainMenu();
        }

        // 10. Écriture fichier
        try {
            await FileManager.writeJsonFile(`./handlers/${FolderName.CONTEXT_MENU}`, filename, config, false)
            //await fs.writeFile(filename, JSON.stringify(config, null, 2), 'utf8');
            console.log(`✅ File saved: ./handlers/${FolderName.CONTEXT_MENU}.${path.resolve(filename)}`);
        } catch (error) {
            console.error("❌ Error saving file:", error);
        }

        await this.prompt('Press Enter to continue...');
        return this.showMainMenu();
    }
}