import {BaseCLI, MenuSelectionCLI} from "../BaseCLI";
import { BaseInteractionManager, Command } from "../../manager/handlers/interactions/BaseInteractionManager";
import {Guild, GuildListManager} from "../GuildListManager";
import {BotEnv} from "../../bot/BotEnv";

export class InteractionManagerCLI extends BaseCLI {

    protected readonly manager: BaseInteractionManager;
    protected readonly managerKey: string;

    protected getTitle(): string {
        return `${this.managerKey} - ${this.manager.folderPath}`;
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: `List Global commands`, action: () => this.listRemote() },
        { label: "List commands per GuildID", action: async () => this.guildListRemote(await new GuildListManager(BotEnv.clientId, BotEnv.token).chooseGuild()) },
        { label: "List commands per Guild", action: async () => this.guildListAllRemote() },
        { label: "Deploy local", action: () => this.handleDeploy() },
        { label: "Update remote", action: () => this.handleUpdate() },
        { label: "Delete remote", action: () => this.handleDelete() },
        { label: 'Back', action: () => this.goBack() },
    ];

    constructor(parent: BaseCLI, manager: BaseInteractionManager, managerKey: string) {
        super(parent);
        this.manager = manager;
        this.managerKey = managerKey;
    }

    protected execute(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private async listRemote(): Promise<void> {
        await this.manager.list();
    }

    private async guildListRemote(guild: Guild | null): Promise<void> {
        if(!guild) {
            return
        }
        await this.manager.listGuild(guild.id)
    }

    private async guildListAllRemote(): Promise<void> {
        await this.manager.listAllGuilds(await new GuildListManager(BotEnv.clientId, BotEnv.token).list(false))
    }

    private async handleDeploy(): Promise<void> {
        const selected = await this.selectCommands(this.manager, false);
        if (selected.length === 0) return;
        await this.manager.deploy(selected);
    }

    private async handleUpdate(): Promise<void> {
        const selected = await this.selectCommands(this.manager);
        if (selected.length === 0) return;
        await this.manager.update(selected);
    }

    private async handleDelete(): Promise<void> {
        const selected = await this.selectCommands(this.manager);
        if (selected.length === 0) return;
        await this.manager.delete(selected);
    }

    private async selectCommands(manager: BaseInteractionManager, remote: boolean = true): Promise<Command[]> {
        const handlerManagerType = `${manager.folderPath}(s)`;
        const commandList = remote ? await manager.list() as any[] : await manager.listFromFile() as any[];
        if (!commandList?.length) {
            console.log(`No ${handlerManagerType} found`);
            return [];
        }

        const input = await this.prompt('Enter numbers (ex: 1,3,5 or "all" or "exit"): ');
        if (input.toLowerCase() === 'all') return commandList;
        if (input.toLowerCase() === 'exit') return [];

        const indices = input.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i));
        const selected = commandList.filter((cmd: any) => indices.includes(cmd.index));

        if (selected.length === 0) {
            console.log('Invalid number');
            return [];
        }

        console.log(`${selected.length} selected ${handlerManagerType}`);
        return selected;
    }
}