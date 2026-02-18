import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder,
} from "discord.js";
import {Bot} from "../../bot/Bot";

export enum ModalFieldType {
    SHORT,
    LONG,
    NUMBER,
    DATE,
    PHONE,
}

export interface ModalField {
    type: ModalFieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
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
    ): LabelBuilder {

        const builder = new TextInputBuilder()
            .setCustomId(opt.customId)
            .setRequired(opt.required ?? false);

        if(opt.placeholder) {
            builder.setPlaceholder(opt.placeholder);
        } else {
            builder.setPlaceholder(`Enter ${opt.label.toLowerCase()}`);
        }

        switch (opt.type) {
            case ModalFieldType.SHORT:
                builder.setStyle(TextInputStyle.Short).setMaxLength(4000);
                break;
            case ModalFieldType.LONG:
                builder.setStyle(TextInputStyle.Paragraph).setMaxLength(4000);
                break;
            case ModalFieldType.NUMBER:
                builder.setStyle(TextInputStyle.Short).setMaxLength(10);
                break;
            case ModalFieldType.DATE:
                builder.setStyle(TextInputStyle.Short).setMaxLength(10);
                break;
            case ModalFieldType.PHONE:
                builder.setStyle(TextInputStyle.Short).setMaxLength(20);
                break;
        }

        return new LabelBuilder().setLabel(opt.label).setTextInputComponent(builder);
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

        modal.addLabelComponents(this._createField(opt));
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

        const titleField: InternalModalField = {
            customId: `${customId}_title`,
            label: title.label,
            placeholder: title.placeholder ?? `Enter ${title.label.toLowerCase()}`,
            type: ModalFieldType.SHORT,
            required: title.required
        }

        const descField: InternalModalField = {
            customId: `${customId}_desc`,
            label: description.label,
            placeholder: description.placeholder ?? `Enter ${description.label.toLowerCase()}`,
            type: ModalFieldType.LONG,
            required: description.required
        }

        modal.addLabelComponents(this._createField(titleField))
        modal.addLabelComponents(this._createField(descField))

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
        return this.simple(`${customId}_date`, modalTitle, {label:inputLabel, type: ModalFieldType.DATE, placeholder: "YYYY-MM-DD or DD/MM/YYYY"});
    }

    /**
     * Number modal preset
     */
    static number(
        customId: string,
        modalTitle: string = "Enter a Number",
        inputLabel: string = "Number"
    ): ModalBuilder {
        return this.simple(`${customId}_number`, modalTitle, {label:inputLabel, type: ModalFieldType.NUMBER, placeholder: "Enter a number"});
    }

    /**
     * Number modal preset
     */
    static phone(
        customId: string,
        modalTitle: string = "Enter a Phone number",
        inputLabel: string = "Phone number"
    ): ModalBuilder {
        return this.simple(`${customId}_phone_number`, modalTitle, {label:inputLabel, type: ModalFieldType.PHONE, placeholder: "Enter a phone number"});
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

        modal.addLabelComponents(this._createField(opt))
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