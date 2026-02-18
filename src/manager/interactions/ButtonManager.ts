import {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";

export interface ButtonOptions {
    label?: string;
    emoji?: string;
    customId: string;
    disabled?: boolean;
}

export class ButtonManager {

    private static _create(options: ButtonOptions & { style: ButtonStyle }): ButtonBuilder {
        const btn = new ButtonBuilder()
            .setCustomId(options.customId)
            .setLabel(options.label ?? "Button")
            .setStyle(options.style)
            .setDisabled(options.disabled ?? false);

        if (options.emoji) {
            btn.setEmoji(options.emoji);
        }

        return btn;
    }

    static primary(options: ButtonOptions): ButtonBuilder {
        return this._create({ ...options, style: ButtonStyle.Primary });
    }

    static success(options: ButtonOptions): ButtonBuilder {
        return this._create({ ...options, style: ButtonStyle.Success });
    }

    static secondary(options: ButtonOptions): ButtonBuilder {
        return this._create({ ...options, style: ButtonStyle.Secondary });
    }

    static danger(options: ButtonOptions): ButtonBuilder {
        return this._create({ ...options, style: ButtonStyle.Danger });
    }

    static link(label: string, url: string, emoji?: string): ButtonBuilder {
        const btn = new ButtonBuilder()
            .setLabel(label)
            .setURL(url)

        if(emoji) btn.setEmoji(emoji);

        return btn
    }

    static row(buttons: ButtonOptions[]): ActionRowBuilder<ButtonBuilder> {
        const buttonBuilders = buttons.map(btn =>
            this.primary(btn)
        );
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttonBuilders.slice(0, 5));
    }


    static confirm(customId: string) {
        return this.success({ customId, label: "Confirm" });
    }

    static cancel(customId: string) {
        return this.danger({ customId, label: "Cancel" });
    }
}