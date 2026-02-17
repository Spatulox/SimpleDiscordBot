import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    InteractionReplyOptions,
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
                    .setContent(title),
            );
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setDivider(true)
                    .setSpacing(SeparatorSpacingSize.Small)
            )
        }

        return container;
    }

    /**
     * Creates simple ComponentV2 with just description
     */
    static simple(description: string, color: EmbedColor | null = null): ContainerBuilder {
        return this.create(null, color)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(description));
    }

    /**
     * Creates error ComponentV2
     */
    static error(description: string): ContainerBuilder {
        return this.create("Something went wrong", EmbedColor.error)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            );
    }

    /**
     * Creates success ComponentV2
     */
    static success(description: string): ContainerBuilder {
        return this.create("Success", EmbedColor.success)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            );
    }

    /**
     * Creates simple description ComponentV2
     */
    static description(description: string): ContainerBuilder {
        return this.create()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(description));
    }

    /**
     * Creates debug ComponentV2
     */
    static debug(description: string): ContainerBuilder {
        return this.create("Debug", EmbedColor.green)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            );
    }

    /**
     * Quick field adder
     */
    static field(container: ContainerBuilder, name: string, value: string, _inline: boolean = false): ContainerBuilder {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**${name}**`),
            new TextDisplayBuilder().setContent(value)
        );

        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
        );

        return container;
    }


    /**
     * Multiple fields
     */
    static fields(container: ContainerBuilder, fields: {name: string, value: string, inline?: boolean}[]): ContainerBuilder {
        fields.forEach((f) => {
            this.field(container, f.name, f.value, f.inline ?? false);
        });
        return container;
    }

    private static footer(container: ContainerBuilder): ContainerBuilder {

        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
        );

        const icon = this.BOT_ICON

        if (icon) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`[${icon.slice(0, 50)}...]`)
            );
        }

        container.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*${Bot.config?.botName || "Bot"} · ${new Date().toLocaleString('fr-FR')}*`)
        );

        return container;
    }

    /**
     * Transform ComponentV2 into object for interaction.reply()
     */
    static toInteraction(container: ContainerBuilder, ephemeral: boolean = false): InteractionReplyOptions {
        container = this.footer(container);
        return {
            components: [container],
            flags: ephemeral ? [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] : [MessageFlags.IsComponentsV2]
        };
    }

    /**
     * Transform ComponentV2 into object for channel.send()
     */
    static toMessage(container: ContainerBuilder): MessageCreateOptions {
        container = this.footer(container);
        return {
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        };
    }
}