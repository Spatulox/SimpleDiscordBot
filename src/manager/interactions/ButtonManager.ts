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

    /*static row(buttons: ButtonOptions): ActionRowBuilder<ButtonBuilder>
    static row(buttons: ButtonOptions[]): ActionRowBuilder<ButtonBuilder>
    static row(buttons: ButtonOptions | ButtonOptions[]): ActionRowBuilder<ButtonBuilder> {

        if(Array.isArray(buttons)) {
            const buttonBuilders = buttons.map(btn =>
                this.primary(btn)
            );
            return new ActionRowBuilder<ButtonBuilder>()
                .addComponents(buttonBuilders.slice(0, 5));
        }

        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(this.primary(buttons));
    }*/


    static confirm(customId: string) {
        return this.success({ customId, label: "Confirm" });
    }

    static cancel(customId: string) {
        return this.danger({ customId, label: "Cancel" });
    }

    static row(but: ButtonBuilder): ActionRowBuilder<ButtonBuilder>
    static row(but: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder>
    static row(but: ButtonBuilder | ButtonBuilder[]): ActionRowBuilder<ButtonBuilder> {
        const buttons = Array.isArray(but) ? but.slice(0, 5) : [but];
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttons);
    }
}