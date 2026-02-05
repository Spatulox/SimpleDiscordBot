import {BaseCLI, MenuSelectionCLI} from "../BaseCLI";
import {ContextMenuConfig} from "../type/ContextMenuConfig";
import {PermissionFlagsBits} from "discord.js";
import {DiscordRegex} from "../../utils/DiscordRegex";
import {FolderName} from "../../type/FolderName";

export class ContextMenuGeneratorCLI extends BaseCLI {
    protected getTitle(): string {
        return "📝 Context Menu JSON Generator";
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: "Generate Context Menu", action: () => this },
        { label: "Back", action: () => this.goBack() },
    ];

    protected async execute(): Promise<void> {
        const config: ContextMenuConfig = {dm_permission: false, integration_types: [], name: "", type: 2};

        // 1. Context Menu Name
        console.clear();
        console.log("👤 1/10 - Name");
        config.name = await this.requireInput("Enter Context Menu name (ex: 'Example context Menu'): ");

        // 2. Type (2=User, 3=Message)
        console.clear();
        console.log("🔧 2/10 - Type");
        console.log("2 => Context Menu for users");
        console.log("3 => Context Menu for messages");
        config.type = parseInt(
            await this.requireInput("Enter type (2 or 3): ", val => ["2", "3"].includes(val))
        ) as 2 | 3;

        // 3. Member Permissions
        console.clear();
        console.log("🔐 3/10 - Permissions");
        console.log("📋 Valid permissions:\n",
            Object.keys(PermissionFlagsBits).join(', '));

        const permsInput = await this.requireInput(
            "Default member permissions (comma separated, or 'none'): ",
            (val) => {
                if (!val || val.toLowerCase() === "none" || val == '') return true;

                const permissions = val.split(",").map(p => p.trim());
                const invalidPerms = permissions.filter(perm => !(perm in PermissionFlagsBits));

                if (invalidPerms.length > 0) {
                    console.log(`❌ Invalid permissions: ${invalidPerms.join(', ')}`);
                    console.log("📋 Valid permissions:\n",
                        Object.keys(PermissionFlagsBits).join(', '));
                    return false;
                }

                return true;
            },
            true
        );

        if (permsInput !== '' && permsInput.toLowerCase() !== "none") {
            config.default_member_permissions = permsInput.split(",")
                .map(p => p.trim()) as (keyof typeof PermissionFlagsBits)[];
        }

        // 4. DM Permission
        console.clear();
        console.log("💬 4/10 - DM Permission");
        config.dm_permission = (await this.yesNoInput("Allow in DMs? (y/n): "));

        // 5. Integration Types
        console.clear();
        console.log("🔗 5/10 - Integration Types");
        console.log("0 => GUILD_INSTALL");
        console.log("1 => USER_INSTALL");
        console.log("(comma separated, or 'all')");
        const intInput = await this.requireInput("Integration types: ");
        if (intInput.toLowerCase() === "all") {
            config.integration_types = [0, 1];
        } else {
            config.integration_types = intInput.split(",").map(i => parseInt(i.trim())).filter(i => !isNaN(i));
        }

        console.clear();
        console.log("🌐 6/10 - Contexts");
        console.log("0 => Can be used inside server");
        console.log("1 => Can be used inside DMs with bot");
        console.log("2 => Group DMs & other DMs");
        console.log("(comma separated, or 'all')");
        const ctxInput = await this.requireInput("Contexts: ");
        if (ctxInput.toLowerCase() === "all") {
            config.contexts = [0, 1, 2];
        } else {
            config.contexts = ctxInput.split(",").map(i => parseInt(i.trim())).filter(i => !isNaN(i));
        }

        // 7. Guild IDs
        console.clear();
        console.log("🏠 7/10 - Guild IDs (optional)");
        console.log(" => Used to deploy specific context menu for specific guild");
        const guildInput = await this.requireInput(
            "Guild IDs (comma separated, or 'none'): ",
            (val) => {
                if (!val || val.toLowerCase() === "none") return true;

                const ids = val.split(",").map(id => id.trim());
                const invalidIds = ids.filter(id =>
                    !DiscordRegex.DISCORD_ID.test(id)
                );

                if (invalidIds.length > 0) {
                    console.log(`❌ Invalid Guild IDs: ${invalidIds.join(', ')}`);
                    console.log("ℹ️  Discord Guild ID = 18 chiffres (ex: 1111160769132896377)");
                    return false;
                }

                console.log("✅ Valid Guild IDs:", ids.join(', '));
                return true;
            },
            true
        );

        if (guildInput.toLowerCase() !== "none" && guildInput !== "") {
            config.guildID = guildInput.split(",").map(id => id.trim());
        }

        // 8. Filename
        console.clear();
        console.log("💾 8/10 - File");
        const filename = (await this.requireInput("Filename (ex: my-context-menu): ")) + ".json";

        await this.saveFile(`./handlers/${FolderName.CONTEXT_MENU}`, filename, config)
        return this.showMainMenu();

        /*

        // 9. Validating file
        console.clear();
        console.log("✨ Final JSON preview:");
        console.log(JSON.stringify(config, null, 2));

        const confirm = (await this.yesNoInput("\nSave this file? (y/n): "));
        if (!confirm) {
            console.log("Cancelled");
            await this.prompt("Press Enter...");
            return this.showMainMenu();
        }

        // 10. Write File
        try {
            let filenameTmp = filename
            if(await FileManager.readJsonFile(`./handlers/${FolderName.CONTEXT_MENU}/${filenameTmp}`)){
                if(!await this.yesNoInput(`./handlers/${FolderName.CONTEXT_MENU}/${filenameTmp}) already exist, do you want to overwrite it ? (y/n)`)){
                    filenameTmp = filename + (Date.now());
                }
            }
            await FileManager.writeJsonFile(`./handlers/${FolderName.CONTEXT_MENU}`, filenameTmp, config, false);
            console.log(`File saved: ./handlers/${FolderName.CONTEXT_MENU}/${filenameTmp}`);
        } catch (error) {
            console.error("Error saving file:", error);
        }

        await this.prompt("Press Enter to continue...");
        return this.showMainMenu();*/
    }
}