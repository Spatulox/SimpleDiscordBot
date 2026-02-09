import { BaseCLI, MenuSelectionCLI } from "./BaseCLI";
import {REST} from "@discordjs/rest";
import { Routes, GuildFeature } from 'discord-api-types/v10';

export type Guild = {
    id: string;
    name: string;
    icon: string | null,
    banner: string | null,
    owner: boolean,
    permissions: string,
    features: GuildFeature[]
}

export class GuildListManager extends BaseCLI {
    protected guilds: Guild[] = [];

    protected clientId: string;
    protected token: string;
    protected rest: REST;

    constructor(clientId: string, token: string) {
        super();
        this.clientId = clientId;
        this.token = token;
        this.rest = new REST({ version: '10' }).setToken(token);
    }

    protected getTitle(): string {
        return "Guilds Selection";
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: "List guilds", action: () => this.list() },
        { label: "Choose guild", action: () => this.chooseGuild() },
        { label: "Back", action: () => this.goBack() },
    ];

    protected async execute(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async list(printResult: boolean = true): Promise<Guild[]> {
        console.clear();
        if(printResult) console.log(`${this.getTitle()}\n`);

        try {

            this.guilds = await this.rest.get(
                Routes.userGuilds()
            ) as Guild[]

            if(printResult){
                console.table(this.guilds.map((g, i) => ({
                    Index: i,
                    "Guild ID": g.id,
                    Nom: g.name
                })));

                console.log(`\n📋 ${this.guilds.length} guild(s) found\n`);
            }

            return this.guilds;
        } catch (error) {
            console.error(`Error when listing guilds: ${error}`);
            return [];
        }
    }

    async chooseGuild(): Promise<Guild | null> {
        await this.list()
        if (!this.guilds.length) {
            console.log("No available Guild\n");
            return null;
        }

        const indexStr = await this.requireInput(
            "Enter guild index (0-" + (this.guilds.length - 1) + "): ",
            (val) => {
                const num = Number(val);
                return !isNaN(num) && num >= 0 && num < this.guilds.length;
            },
            false
        );

        const index = Number(indexStr);
        return this.guilds[index] ?? null;
    }
}