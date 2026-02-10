import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    UserSelectMenuBuilder,
    RoleSelectMenuBuilder,
    MentionableSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    MessageActionRowComponentBuilder, ChannelType,
} from "discord.js";

export type SelectMenuCreateOption = {
    label: string;
    description?: string;
    emoji?: string;
    value: string
}

export class SelectMenuManager {

    /**
     * Creates base StringSelectMenu - SIMPLE API !
     */
    static create(customId: string, placeholder: string = "Select an option..."): StringSelectMenuBuilder {
        return new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(1);
    }

    /**
     * Quick StringSelectMenu
     */
    static simple(
        customId: string,
        options: SelectMenuCreateOption[],
        placeholder: string = "Choose an option"
    ): StringSelectMenuBuilder {
        const menu = this.create(customId, placeholder);

        menu.addOptions(
            options.map(opt => {
                return this.option(opt)
            })
        );


        return menu;
    }

    /**
     * Pagination menu
     */
    static paginated(
        customId: string,
        options: SelectMenuCreateOption[],
        pageSize: number = 25
    ): ActionRowBuilder<MessageActionRowComponentBuilder> {
        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>();

        for (let i = 0; i < options.length; i += pageSize) {
            const pageOptions = options.slice(i, i + pageSize);
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`${customId}_page_${Math.floor(i/pageSize)}`)
                .setPlaceholder(`Page ${Math.floor(i/pageSize) + 1}`)
                .addOptions(pageOptions.map(opt => {
                    return this.option(opt)
                }));


            row.addComponents(menu);
        }

        return row;
    }

    /**
     * User Select Menu (Components V2)
     */
    static users(customId: string, placeholder: string = "Select users..."): UserSelectMenuBuilder {
        return new UserSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(25);
    }

    /**
     * Role Select Menu (Components V2)
     */
    static roles(customId: string, placeholder: string = "Select roles..."): RoleSelectMenuBuilder {
        return new RoleSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(25);
    }

    /**
     * Mentionable Select Menu (Components V2)
     */
    static mentionables(customId: string, placeholder: string = "Select users/roles..."): MentionableSelectMenuBuilder {
        return new MentionableSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(25);
    }

    /**
     * Channel Select Menu (Components V2)
     */
    static channels(
        customId: string,
        placeholder: string = "Select channels...",
        channelTypes: ChannelType[] = []
    ): ChannelSelectMenuBuilder {
        return new ChannelSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(25)
            .setChannelTypes(...channelTypes);
    }

    /**
     * Quick option creator
     */
    static option(option: SelectMenuCreateOption): StringSelectMenuOptionBuilder {
        const builder = new StringSelectMenuOptionBuilder()
            .setLabel(option.label)
            .setValue(option.value)

        option.description && builder.setDescription(option.description)
        option.emoji && builder.setEmoji(option.emoji)

        return builder
    }

    /**
     * Fluent API pour personnaliser
     */
    static placeholder(menu: StringSelectMenuBuilder, placeholder: string): StringSelectMenuBuilder {
        return menu.setPlaceholder(placeholder);
    }

    static minMax(menu: StringSelectMenuBuilder, min: number, max: number): StringSelectMenuBuilder {
        return menu.setMinValues(min).setMaxValues(Math.min(max, 25));
    }

    static disabled(menu: StringSelectMenuBuilder, disabled: boolean): StringSelectMenuBuilder {
        return menu.setDisabled(disabled);
    }

    /**
     * ActionRow
     */
    static row<T extends MessageActionRowComponentBuilder>(component: T): ActionRowBuilder<MessageActionRowComponentBuilder> {
        return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(component);
    }

    /**
     * Rows multiples (5 max)
     */
    static rows(...components: MessageActionRowComponentBuilder[]): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
        return components.slice(0, 5).map(component =>
            this.row(component)
        );
    }
}