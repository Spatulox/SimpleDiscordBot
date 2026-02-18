import {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalActionRowComponentBuilder,
} from "discord.js";
import {Bot} from "../../bot/Bot";

export type FieldType = 'text' | 'paragraph' | 'number' | 'date' | 'phone';

export interface ModalField {
    type: FieldType;
    label: string;
    placeholder?: string;
}

interface InternalModalField extends ModalField {
    customId: string;
}

export class ModalManager {

    /**
     * Creates base Modal - SIMPLE API !
     */
    public static create(modalTitle: string, customId: string): ModalBuilder {
        return new ModalBuilder()
            .setTitle(modalTitle)
            .setCustomId(customId)
    }

    /**
     * Individual field creator
     */
    private static _createField(
        opt: InternalModalField
    ): TextInputBuilder {
        const builder = new TextInputBuilder()
            .setCustomId(opt.customId)
            .setLabel(opt.label)
            .setRequired(true);

        if(opt.placeholder) {
            builder.setPlaceholder(opt.placeholder);
        } else {
            builder.setPlaceholder(`Enter ${opt.label.toLowerCase()}`);
        }

        switch (opt.type) {
            case 'text':
                builder.setStyle(TextInputStyle.Short).setMaxLength(4000);
                break;
            case 'paragraph':
                builder.setStyle(TextInputStyle.Paragraph).setMaxLength(4000);
                break;
            case 'number':
                builder.setStyle(TextInputStyle.Short).setMaxLength(10);
                break;
            case 'date':
                builder.setStyle(TextInputStyle.Short).setMaxLength(30).setLabel("Date");
                break;
            case 'phone':
                builder.setStyle(TextInputStyle.Short).setMaxLength(20).setLabel("Phone");
                break;
        }

        return builder;
    }

    /**
     * Simple modal with ONE field - DIRECT ModalBuilder return !
     */
    static simple(
        customId: string,
        modalTitle: string | null,
        field: ModalField
    ): ModalBuilder {
        const modal = this.create(modalTitle ?? Bot.config?.botName ?? "Bot", customId);
        const opt: InternalModalField = {
            ...field,
            customId: `${customId}_input`,
            placeholder : field.placeholder ?? `Enter ${field.label.toLowerCase()}`,
        }
        const internalfield = this._createField(opt);
        const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(internalfield);
        modal.addComponents(row);
        return modal;
    }

    /**
     * Title + Description modal preset
     */
    static titleDescription(
        customId: string,
        modalTitle: string,
        title: Omit<ModalField, "type">,
        description: Omit<ModalField, "type">,
    ): ModalBuilder {
        const modal = this.create(modalTitle, customId);

        const titleField = new TextInputBuilder()
            .setCustomId(`${customId}_title`)
            .setLabel(title.label)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder( title.placeholder ?? `Enter ${title.label.toLowerCase()}`)
            .setRequired(true)
            .setMaxLength(100);

        const descField = new TextInputBuilder()
            .setCustomId(`${customId}_desc`)
            .setLabel(description.label)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder( description.placeholder ?? `Enter ${description.label.toLowerCase()}`)
            .setRequired(true)
            .setMaxLength(4000);

        modal.addComponents(
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleField),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descField)
        );

        return modal;
    }

    /**
     * Date modal preset
     */
    static date(
        customId: string,
        modalTitle: string = "Select Date",
        inputLabel: string = "Date"
    ): ModalBuilder {
        return this.simple(`${customId}_date`, modalTitle, {label:inputLabel, type: "date", placeholder: "YYYY-MM-DD or DD/MM/YYYY"});
    }

    /**
     * Number modal preset
     */
    static number(
        customId: string,
        modalTitle: string = "Enter a Number",
        inputLabel: string = "Number"
    ): ModalBuilder {
        return this.simple(`${customId}_number`, modalTitle, {label:inputLabel, type: "number", placeholder: "Enter a number"});
    }

    /**
     * Number modal preset
     */
    static phone(
        customId: string,
        modalTitle: string = "Enter a Phone number",
        inputLabel: string = "Phone number"
    ): ModalBuilder {
        return this.simple(`${customId}_phone_number`, modalTitle, {label:inputLabel, type: "phone", placeholder: "Enter a phone number"});
    }

    /**
     * Add field to existing modal (Fluent API)
     */
    static add(modal: ModalBuilder, field: ModalField[]): ModalBuilder
    static add(modal: ModalBuilder, field: ModalField): ModalBuilder
    static add(modal: ModalBuilder, field: ModalField | ModalField[]): ModalBuilder {

        if(Array.isArray(field)){
            for (const f of field) {
                this.add(modal, f);
            }
            return modal
        }

        const opt = {
            ...field,
            customId:`${modal.data.custom_id}_${field.label}`
        }
        const comp = this._createField(opt)
        modal.addComponents(comp)
        return modal;
    }

    // Keep your existing parse methods
    static parseNumber(value: string): number | null {
        if (!/^\d+$/.test(value)) return null;
        const num = parseInt(value);
        return isNaN(num) ? null : num;
    }

    static parsePhone(value: string): string | null {
        const clean = value.replace(/[\s\-\(\)]/g, '');
        if (/^(06|07|09)\d{8}$/.test(clean) || /^(\+33|0033)?[6-9]\d{8}$/.test(clean)) {
            if (clean.startsWith('06') || clean.startsWith('07') || clean.startsWith('09')) {
                return '+33' + clean.slice(2);
            }
            return clean.startsWith('0033') ? '+33' + clean.slice(4) : clean;
        }
        return null;
    }

    static parseDate(value: string): Date | null {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split('-').map(Number);
            const date = new Date(year!, month! - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            const [day, month, year] = value.split('/').map(Number);
            const date = new Date(year!, month! - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    }

    /**
     * Transform modal to interaction.showModal() format
     */
    static toInteraction(modal: ModalBuilder): ModalBuilder {
        return modal;
    }
}