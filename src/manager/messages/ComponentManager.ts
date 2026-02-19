import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    MessageCreateOptions, ThumbnailBuilder, SectionBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder,
    StringSelectMenuBuilder, UserSelectMenuBuilder, RoleSelectMenuBuilder, MentionableSelectMenuBuilder,
    ChannelSelectMenuBuilder, ButtonBuilder, AttachmentBuilder, FileBuilder,
} from "discord.js";
import { Bot } from '../../bot/Bot';
import {EmbedColor} from "./EmbedManager";
import {SelectMenuManager} from "../interactions/SelectMenuManager";

export interface ComponentManagerField {
    name: string,
    value: string,
    button?: ButtonBuilder[]
    thumbnailUrl?: string,
}

export interface ComponentManagerCreate {
    title?: string | null,
    color?: EmbedColor | null,
    thumbnailUrl?: string
}

export interface ComponentManagerFileInput {
    buffer: Buffer;
    name: string;
    spoiler?: boolean;
}

export class ComponentManager {

    private static get DEFAULT_COLOR(): number | EmbedColor {
        return Bot.config?.defaultEmbedColor || EmbedColor.default;
    }

    /**
     * Creates base ComponentV2
     */
    static create(option?: ComponentManagerCreate | null): ContainerBuilder {
        const container = new ContainerBuilder()

        const colorC = option?.color ?? this.DEFAULT_COLOR;
        if(colorC !== EmbedColor.transparent){
            container.setAccentColor(colorC)
        }

        if (option?.title || option?.thumbnailUrl) {
            if (option?.thumbnailUrl) {
                const headerSection = new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            option?.title ? "## " + option.title : "\u200B"
                        )
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(option.thumbnailUrl)
                    );
                container.addSectionComponents(headerSection);
            } else {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("## " + option.title!)
                );
            }
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
     * Creates success ComponentV2
     */
    static success(description: string): ContainerBuilder {
        return this.create({title:"Success", color:EmbedColor.success})
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(description))
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates debug ComponentV2
     */
    static debug(description: string): ContainerBuilder {
        return this.create({title:"Debug", color:EmbedColor.minecraft})
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            )
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

    /**
     * Add a media gallery (links)
     */
    static mediaGallery(container: ContainerBuilder, urls: string[]): ContainerBuilder {
        const gallery = new MediaGalleryBuilder();
        urls.forEach(url => {
            gallery.addItems(new MediaGalleryItemBuilder().setURL(url));
        });
        container.addMediaGalleryComponents(gallery);
        return container;
    }


    /**
     * Add a select menu
     */
    static selectMenu(container: ContainerBuilder, selectMenu: StringSelectMenuBuilder[] | UserSelectMenuBuilder[] | RoleSelectMenuBuilder[] | MentionableSelectMenuBuilder[] | ChannelSelectMenuBuilder[]): ContainerBuilder
    static selectMenu(container: ContainerBuilder, selectMenu: StringSelectMenuBuilder | UserSelectMenuBuilder | RoleSelectMenuBuilder | MentionableSelectMenuBuilder | ChannelSelectMenuBuilder): ContainerBuilder
    static selectMenu(
            container: ContainerBuilder,
            selectMenu: StringSelectMenuBuilder | UserSelectMenuBuilder | RoleSelectMenuBuilder | MentionableSelectMenuBuilder | ChannelSelectMenuBuilder |
                        (StringSelectMenuBuilder | UserSelectMenuBuilder | RoleSelectMenuBuilder | MentionableSelectMenuBuilder | ChannelSelectMenuBuilder)[]
    ): ContainerBuilder {
        const menus = Array.isArray(selectMenu) ? selectMenu : [selectMenu];
        menus.forEach(menu => {
            const row = SelectMenuManager.row(menu);
            container.addActionRowComponents(row);
        });

        return container;
    }


    /**
     * Add file(s)
     * Don't forget to get the files, return by the function and send it via the "file" field when sending message, or passing the file to the ComponentManager.toMessage()
     */
    static file(container: ContainerBuilder, file: ComponentManagerFileInput): { container: ContainerBuilder, files: AttachmentBuilder[] };
    static file(container: ContainerBuilder, file: ComponentManagerFileInput[]): { container: ContainerBuilder, files: AttachmentBuilder[] };
    static file(container: ContainerBuilder, file: ComponentManagerFileInput | ComponentManagerFileInput[]): { container: ContainerBuilder, files: AttachmentBuilder[] } {
        const files: AttachmentBuilder[] = [];
        const fileArray = Array.isArray(file) ? file : [file];

        fileArray.forEach(f => {
            const attachment = new AttachmentBuilder(f.buffer, {
                name: f.name
            });
            files.push(attachment);

            container.addFileComponents(
                new FileBuilder()
                    .setURL(`attachment://${f.name}`)
                    .setSpoiler(f.spoiler ?? false)
            )
            container.addSeparatorComponents(this.separator());
        });

        return { container, files };
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
    static toMessage(container: ContainerBuilder, file: AttachmentBuilder | AttachmentBuilder[] | null = null, footer: boolean = true): MessageCreateOptions {
        if(footer){
            this.footer(container);
        }
        if(file){
            return {
                components: [container],
                files: Array.isArray(file) ? file : [file],
                flags: [MessageFlags.IsComponentsV2]
            };
        }
        return {
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        };
    }
}