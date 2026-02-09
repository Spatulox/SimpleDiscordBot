import {BaseCLI, MenuSelectionCLI} from "../BaseCLI";
import {FolderName} from "../../type/FolderName";
import {PermissionFlagsBits} from "discord.js";
import {DiscordRegex} from "../../utils/DiscordRegex";
import {SlashCommandConfig} from "../type/SlashCommandConfig";

export class SlashCommandGeneratorCLI extends BaseCLI {
    protected getTitle(): string {
        return "📝 Slash Command JSON Generator";
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: "Generate Slash Command", action: () => this},
        { label: "Back", action: () => this.goBack() },
    ];

    protected async execute(): Promise<void> {
        const config: SlashCommandConfig = {
            type: 1,
            name: "",
            description: "",
            options: [],
            dm_permission: false,
            default_member_permissions: undefined,
            default_member_permissions_string: undefined,
            integration_types: [0, 1],
            contexts: [0]
        };

        // 1. Command Name
        console.clear();
        console.log("📝 1/12 - Command Name");
        config.name = await this.requireInput("Enter command name (lowercase, no spaces): ",
            val => /^[a-z_-]{1,32}$/.test(val));

        // 2. Command Description
        console.clear();
        console.log("📄 2/12 - Command Description");
        config.description = await this.requireInput("Enter command description (1-100 chars): ",
            val => val.length >= 1 && val.length <= 100);

        // 3. Member Permissions
        console.clear();
        console.log("🔐 3/12 - Permissions");
        console.log("📋 Valid permissions:\n", Object.keys(PermissionFlagsBits).join(', '));

        const permsInput = await this.requireInput(
            "Default member permissions (comma separated, or 'none'): ",
            (val) => {
                if (!val || val.toLowerCase() === "none" || val === '') return true;
                const permissions = val.split(",").map(p => p.trim());
                const invalidPerms = permissions.filter(perm => !(perm in PermissionFlagsBits));
                if (invalidPerms.length > 0) {
                    console.log(`❌ Invalid: ${invalidPerms.join(', ')}`);
                    return false;
                }
                return true;
            },
            true
        );

        if (permsInput && permsInput.toLowerCase() !== "none") {
            config.default_member_permissions_string = permsInput.split(",").map(p => p.trim()) as (keyof typeof PermissionFlagsBits)[];
        }

        // 4. DM Permission
        console.clear();
        console.log("💬 4/12 - DM Permission");
        config.dm_permission = (await this.yesNoInput("Allow in DMs? (y/n): "));

        // 5. Integration Types
        console.clear();
        console.log("🔗 5/12 - Integration Types");
        console.log("0 => GUILD_INSTALL, 1 => USER_INSTALL (comma separated, or 'all')");
        const intInput = await this.requireInput("Integration types: ");
        if (intInput.toLowerCase() === "all") {
            config.integration_types = [0, 1];
        } else {
            config.integration_types = intInput.split(",").map(i => parseInt(i.trim())).filter(i => !isNaN(i));
        }

        // 6. Contexts
        console.clear();
        console.log("🌐 6/12 - Contexts");
        console.log("0 => Server, 1 => Bot DMs, 2 => Group/Other DMs (comma separated, or 'server')");
        const ctxInput = await this.requireInput("Contexts: ", undefined, true);

        if (!ctxInput || ctxInput.trim() === "") {
            config.contexts = [0, 1, 2];
        } else if (ctxInput.toLowerCase() === "all") {
            config.contexts = [0, 1, 2];
        } else {
            config.contexts = ctxInput.split(",").map(i => parseInt(i.trim())).filter(i => !isNaN(i));
        }

        // 7. Add Subcommands/Groups?
        console.clear();
        console.log("📂 7/12 - Structure");
        const addStructure = await this.yesNoInput("Add subcommands or groups? (y/n): ");

        if (addStructure) {
            await this.addCommandStructure(config);
        } else {
            // Add basic options if no structure
            await this.addSimpleOptions(config);
        }

        // 8. Guild IDs (optional)
        console.clear();
        console.log("🏠 8/12 - Guild IDs (optional)");
        const guildInput = await this.requireInput(
            "Guild IDs (comma separated, or 'none'): ",
            (val) => {
                if (!val || val.toLowerCase() === "none") return true;
                const ids = val.split(",").map(id => id.trim());
                const invalidIds = ids.filter(id => !DiscordRegex.GUILD_ID.test(id));
                if (invalidIds.length > 0) {
                    console.log(`❌ Invalid Guild IDs: ${invalidIds.join(', ')}`);
                    return false;
                }
                return true;
            },
            true
        );

        if (guildInput && guildInput.toLowerCase() !== "none") {
            config.guildID = guildInput.split(",").map(id => id.trim());
        }

        // 9. Filename
        console.clear();
        console.log("💾 9/12 - Filename");
        const filename = (await this.requireInput("Filename (without .json): ")) + ".json";

        await this.saveFile(FolderName.SLASH_COMMANDS, filename, config);
    }

    private async addCommandStructure(config: any): Promise<void> {
        console.clear();
        console.log("📁 Structure Type");
        console.log("1 => Add Sub Command Group");
        console.log("2 => Add Sub Command");

        const structureType = parseInt(await this.requireInput("Type (1 or 2): ", val => ["1", "2"].includes(val)));

        if (structureType === 1) {
            // Sub Command Group
            const groupName = await this.requireInput("Group name: ");
            const groupDesc = await this.requireInput("Group description: ");

            config.options = config.options || [];
            config.options.push({
                type: 2,
                name: groupName,
                description: groupDesc,
                options: []
            });

            await this.addSubCommands(config.options[config.options.length - 1].options);
        } else {
            // Direct Sub Command
            await this.addSubCommands(config.options);
        }
    }

    private async addSubCommands(options: any[]): Promise<void> {
        let continueAdding = true;

        while (continueAdding) {
            console.clear();
            console.log("➕ Add Subcommand");
            const name = await this.requireInput("Subcommand name: ");
            const desc = await this.requireInput("Subcommand description: ");

            const subCmd: any = { type: 1, name, description: desc, options: [] };
            await this.addSubCommandOptions(subCmd.options);

            options.push(subCmd);

            continueAdding = await this.yesNoInput("Add another subcommand? (y/n): ");
        }
    }

    private async addSubCommandOptions(options: any[]): Promise<void> {
        let continueAdding = await this.yesNoInput("Add options to this subcommand? (y/n): ");

        while (continueAdding) {
            console.clear();
            console.log("Option Types:\n1=SUB_COMMAND,2=SUB_GROUP,3=STRING,4=INTEGER,5=BOOLEAN,6=USER,7=CHANNEL,8=ROLE,9=MENTIONNABLE,10=NUMBER");

            const type = parseInt(await this.requireInput("Option type (3-10): ", val => {
                const n = parseInt(val);
                return n >= 3 && n <= 10;
            }));

            const name = await this.requireInput("Option name: ");
            const description = await this.requireInput("Option description: ");
            const required = await this.yesNoInput("Required? (y/n): ");

            const option: any = { type, name, description, required };

            if ([3,4,10].includes(type)) {
                // String, Integer, Number
                option.choices = await this.addChoices();
            }

            if (type === 3) { // String
                option.min_length = parseInt(await this.prompt("Min length (optional, Enter=skip): ")) || undefined;
                option.max_length = parseInt(await this.prompt("Max length (optional, Enter=skip): ")) || undefined;
            } else if ([4,10].includes(type)) { // Int/Number
                option.min_value = parseFloat(await this.prompt("Min value (optional, Enter=skip): ")) || undefined;
                option.max_value = parseFloat(await this.prompt("Max value (optional, Enter=skip): ")) || undefined;
            } else if (type === 7) { // Channel
                option.channel_types = await this.addChannelTypes();
            }

            options.push(option);
            continueAdding = await this.yesNoInput("Add another option? (y/n): ");
        }
    }

    private async addChoices(): Promise<any[] | undefined> {
        const choices: any[] = [];
        let continueAdding = await this.yesNoInput("Add choices? (y/n): ");

        while (continueAdding && choices.length < 25) {
            const name = await this.requireInput("Choice name: ");
            const value = await this.requireInput("Choice value: ");
            choices.push({ name, value });
            continueAdding = await this.yesNoInput("Add another choice? (y/n): ");
        }
        return choices.length > 0 ? choices : undefined;
    }

    private async addChannelTypes(): Promise<number[] | undefined> {
        console.log("Channel types: 0=text, 2=voice, 4=category, 5=announcement, 10=thread, 11=public-thread, 12=private-thread");
        const input = await this.requireInput("Channel types (comma sep, or Enter=none): ", undefined, true);
        return input ? input.split(",").map(i => parseInt(i.trim())).filter(i => !isNaN(i)) : undefined;
    }

    private async addSimpleOptions(config: any): Promise<void> {
        console.clear();
        console.log("➕ Simple Options");
        let continueAdding = await this.yesNoInput("Add options? (y/n): ");

        config.options = [];
        while (continueAdding) {
            console.log("Quick option types: 3=string,4=int,5=bool,6=user,7=channel,8=role,9=mentionnable,10=number");
            const type = parseInt(await this.requireInput("Type (3-10): ", val => ["3","4","5","6","7","8","9","10"].includes(val)));
            const name = await this.requireInput("Name: ");
            const desc = await this.requireInput("Description: ");
            const required = await this.yesNoInput("Required?: ");

            config.options.push({ type, name, description: desc, required });
            continueAdding = await this.yesNoInput("Another option? (y/n): ");
        }
    }
}