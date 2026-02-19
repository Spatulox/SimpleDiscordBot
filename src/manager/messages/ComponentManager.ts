import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    MessageCreateOptions,
} from "discord.js";
import { Bot } from '../../bot/Bot';
import {EmbedColor} from "./EmbedManager";

export class ComponentManager {
    private static get BOT_ICON(): string {
        if (Bot.config?.botIconUrl) return Bot.config?.botIconUrl;
        return Bot.client?.user?.displayAvatarURL({ forceStatic: false, size: 128 }) || "";
    }

    private static get DEFAULT_COLOR(): number {
        return Bot.config?.defaultEmbedColor || EmbedColor.default;
    }

    /**
     * Creates base ComponentV2
     */
    static create(title: string | null = null, color: EmbedColor | null = null): ContainerBuilder {
        const container = new ContainerBuilder()
            .setAccentColor(color ?? ComponentManager.DEFAULT_COLOR);

        if(title){
            container.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent("## " + title)
            )
            .addSeparatorComponents(this.separator())
        }

        return container;
    }

    /**
     * Creates simple ComponentV2 with just description
     */
    static simple(description: string, color: EmbedColor | null = null): ContainerBuilder {
        return this.create(null, color)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(description))
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates error ComponentV2
     */
    static error(description: string): ContainerBuilder {
        return this.create("Something went wrong", EmbedColor.error)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            )
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates success ComponentV2
     */
    static success(description: string): ContainerBuilder {
        return this.create("Success", EmbedColor.success)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            )
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates simple description ComponentV2
     */
    static description(description: string): ContainerBuilder {
        return this.create()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(description))
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates debug ComponentV2
     */
    static debug(description: string): ContainerBuilder {
        return this.create("Debug", EmbedColor.green)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            )
            .addSeparatorComponents(this.separator())
    }

    private static separator(spacing: SeparatorSpacingSize = SeparatorSpacingSize.Small): SeparatorBuilder{
        return new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(spacing)
    }

    /**
     * Quick field adder
     */
    static field(container: ContainerBuilder, name: string, value: string): ContainerBuilder {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**${name}**`),
            new TextDisplayBuilder().setContent(value)
        );
        container.addSeparatorComponents(this.separator())

        return container;
    }


    /**
     * Multiple fields
     */
    static fields(container: ContainerBuilder, fields: {name: string, value: string}[]): ContainerBuilder {
        fields.forEach((f) => {
            this.field(container, f.name, f.value);
        });
        return container;
    }

    private static footer(container: ContainerBuilder): ContainerBuilder {
        container.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`-# **${Bot.config?.botName || "Bot"} · <t:${Math.floor(Date.now() / 1000)}:d> <t:${Math.floor(Date.now() / 1000)}:t>**`)
        );
        return container;
    }

    /**
     * Transform ComponentV2 into object for channel.send()
     */
    static toMessage(container: ContainerBuilder, footer: boolean = true): MessageCreateOptions {
        if(footer){
            container = this.footer(container);
        }
        return {
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        };
    }
}