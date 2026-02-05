import {
    EmbedBuilder,
    InteractionDeferReplyOptions,
    MessageFlags,
} from "discord.js";
import { Bot } from '../../bot/Bot';

export enum EmbedColor {
    error = 0x880015,
    success = 0x00FF00,
    black = 0x000000,
    white = 0xFFFFFF,
    red = 0xFF0000,
    green = 0x00FF00,
    blue = 0x0000FF,
    yellow = 0xFFFF00,
    cyan = 0x00FFFF,
    magenta = 0xFF00FF,
    gray = 0x808080,
    lightgray = 0xD3D3D3,
    darkgray = 0xA9A9A9,
    orange = 0xFFA500,
    purple = 0x800080,
    pink = 0xFFC0CB,
    brown = 0xA52A2A,
    lime = 0x00FF00,
    navy = 0x000080,
    teal = 0x008080,
    olive = 0x808000,
    gold = 0xFFD700,
    silver = 0xC0C0C0,
    coral = 0xFF7F50,
    salmon = 0xFA8072,
    khaki = 0xF0E68C,
    plum = 0xDDA0DD,
    lavender = 0xE6E6FA,
    beige = 0xF5F5DC,
    mint = 0x98FF98,
    peach = 0xFFDAB9,
    chocolate = 0xD2691E,
    crimson = 0xDC143C,
    youtube = 0xFF1A1A,
    default = 0x5C8AD8,
    minecraft = 0x006400
}

export class EmbedManager {
    private static get BOT_ICON(): string {
        return Bot.config.botIconUrl || "";
    }
    private static get DEFAULT_COLOR(): number | EmbedColor {
        return Bot.config.defaultEmbedColor || EmbedColor.default;
    }

    /**
     * Creates base embed - SAME SIMPLE API !
     */
    static create(color: EmbedColor | null = null): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(color ?? this.DEFAULT_COLOR)
            .setTitle('Title')
            .setDescription('')
            .setThumbnail('')
            .setFooter({
                text: Bot.config.botName || "",
                iconURL: this.BOT_ICON
            })
            .setTimestamp(new Date());
    }

    /**
     * Creates simple embed with just description
     */
    static simple(description: string, color: EmbedColor | null = null): EmbedBuilder {
        return this.create(color)
            .setTitle('')
            .setDescription(description)
            .setTimestamp(null);
    }

    /**
     * Creates error embed
     */
    static error(description: string): EmbedBuilder {
        return this.create(EmbedColor.error)
            .setTitle('Something went Wrong')
            .setDescription(description);
    }

    /**
     * Creates success embed
     */
    static success(description: string): EmbedBuilder {
        return this.create(EmbedColor.minecraft)
            .setTitle('Success')
            .setDescription(description);
    }

    /**
     * Creates debug embed
     */
    static debug(description: string): EmbedBuilder {
        return this.create(EmbedColor.green)
            .setTitle('Debug')
            .setDescription(description);
    }

    /**
     * Defer ephemeral reply
     */
    static deferEphemeral(): InteractionDeferReplyOptions {
        return { flags: MessageFlags.Ephemeral };
    }

    /**
     * Quick field adder
     */
    static field(embed: EmbedBuilder, name: string, value: string, inline: boolean = false): EmbedBuilder {
        return embed.addFields({ name, value, inline });
    }

    /**
     * Fluent API shortcuts
     */
    static title(embed: EmbedBuilder, title: string): EmbedBuilder {
        return embed.setTitle(title);
    }

    static desc(embed: EmbedBuilder, description: string): EmbedBuilder {
        return embed.setDescription(description);
    }

    static thumb(embed: EmbedBuilder, url: string): EmbedBuilder {
        return embed.setThumbnail(url);
    }

    static image(embed: EmbedBuilder, url: string): EmbedBuilder {
        return embed.setImage(url);
    }

    static footer(embed: EmbedBuilder, text: string): EmbedBuilder {
        return embed.setFooter({ text, iconURL: this.BOT_ICON });
    }
}