import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    MessageCreateOptions, ThumbnailBuilder, SectionBuilder,
} from "discord.js";
import { Bot } from '../../bot/Bot';
import {EmbedColor} from "./EmbedManager";

export interface ComponentManagerField {
    name: string,
    value: string,
    thumbnailUrl?: string
}

export interface ComponentManagerCreate {
    title?: string | null,
    color?: EmbedColor | null,
    thumbnailUrl?: string
}

export class ComponentManager {

    private static get DEFAULT_COLOR(): number {
        return Bot.config?.defaultEmbedColor || EmbedColor.default;
    }

    /**
     * Creates base ComponentV2
     */
    static create(option?: ComponentManagerCreate | null): ContainerBuilder {
        const container = new ContainerBuilder()
            .setAccentColor(option?.color ?? ComponentManager.DEFAULT_COLOR);

        if (option?.title || option?.thumbnailUrl) {
            const headerSection = new SectionBuilder();

            if (option?.title) {
                headerSection.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("## " + option.title)
                );
            } else {
                headerSection.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("\u200B")
                );
            }

            if (option?.thumbnailUrl) {
                headerSection.setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(option.thumbnailUrl)
                );
            }

            container.addSectionComponents(headerSection);
            container.addSeparatorComponents(this.separator());
        }

        return container;
    }

    /**
     * Creates simple ComponentV2 with just description
     */
    static simple(description: string, color: EmbedColor | null = null): ContainerBuilder {
        return this.create({color})
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(description))
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates error ComponentV2
     */
    static error(description: string): ContainerBuilder {
        return this.create({title:"Something went wrong", color: EmbedColor.error})
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            )
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates success ComponentV2
     */
    static success(description: string): ContainerBuilder {
        return this.create({title:"Success", color:EmbedColor.success})
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
        return this.create({title:"Debug", color:EmbedColor.green})
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
    static field(container: ContainerBuilder, field: ComponentManagerField): ContainerBuilder {
        if (field.thumbnailUrl) {
            const section = new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**${field.name}**`),
                    new TextDisplayBuilder().setContent(field.value)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(field.thumbnailUrl)
                );
            container.addSectionComponents(section);
        } else {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${field.name}**`),
                new TextDisplayBuilder().setContent(field.value)
            );
        }

        container.addSeparatorComponents(this.separator());
        return container;
    }



    /**
     * Multiple fields
     */
    static fields(container: ContainerBuilder, fields: ComponentManagerField[]): ContainerBuilder {
        fields.forEach((f) => {
            this.field(container, f);
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