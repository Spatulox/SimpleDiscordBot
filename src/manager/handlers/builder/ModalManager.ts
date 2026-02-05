import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import {FolderName} from "../../../type/FolderName";
import {FileManager} from "../../FileManager";

export interface ModalJson {
    title: string;
    customId: string;
    label: string;
    fields: any[];
}

export class ModalManager {
    /**
     * Load modal from JSON file and return ModalBuilder
     */
    static async load(filename: string): Promise<ModalBuilder | false> {
        try {
            const file = await FileManager.readJsonFile(`./handlers/${FolderName.MODAL}/${filename}`) as ModalJson;
            if (!file) return false;
            return ModalManager.jsonToBuilder(file);
        } catch {
            return false;
        }
    }

    /**
     * List all modal files
     */
    static async list(): Promise<string[] | false> {
        try {
            const files = await FileManager.listJsonFiles(`./handlers/${FolderName.MODAL}`);
            return files || [];
        } catch {
            return false;
        }
    }

    private static jsonToBuilder(json: ModalJson): ModalBuilder {
        const modal = new ModalBuilder()
            .setCustomId(json.customId)
            .setTitle(json.title.slice(0, 45));

        // Transformer chaque field JSON → TextInputBuilder
        const actionRows: any[] = [];
        for (const fieldJson of json.fields) {
            const input = this.fieldJsonToInput(fieldJson);
            const row = new ActionRowBuilder<ModalActionRowComponentBuilder>()
                .addComponents(input);
            actionRows.push(row);
        }

        return modal.addComponents(...actionRows);
    }

    private static fieldJsonToInput(fieldJson: any): TextInputBuilder {
        const input = new TextInputBuilder()
            .setCustomId(fieldJson.customId)
            .setLabel(fieldJson.title.slice(0, 45))
            .setPlaceholder(fieldJson.placeholder || 'Enter value...')
            .setRequired(fieldJson.required !== false)
            .setMinLength(fieldJson.minLength || 0)
            .setMaxLength(fieldJson.maxLength || 400);

        // Convertir style JSON (1, 2, "Number") → TextInputStyle
        const style = fieldJson.style;
        if (typeof style === 'number') {
            // 1=Short, 2=Paragraph
            input.setStyle(style as TextInputStyle);
        } else {
            // "Number", "Phone", "Date"
            switch (style) {
                case 'Number':
                case 'Phone':
                case 'Date':
                    input.setStyle(TextInputStyle.Short);
                    input.setPlaceholder(
                        style === 'Number' ? '123' :
                            style === 'Phone' ? '+33 6 12 34 56 78' :
                                '2024-02-05'
                    );
                    break;
                default:
                    input.setStyle(TextInputStyle.Short);
            }
        }

        return input;
    }

    static parseNumber(value: string): number | null {
        if (!/^\d+$/.test(value)) return null;
        const num = parseInt(value);
        return isNaN(num) ? null : num;
    }

    static parsePhone(value: string): string | null {
        // 0604050359, +33604050359, 06 40 50 35 59, (06) 40-50-35-59
        const clean = value.replace(/[\s\-\(\)]/g, '');

        // Français : 06/07/09 + 8 chiffres OU +33 + 9 chiffres
        if (/^(06|07|09)\d{8}$/.test(clean) || /^(\+33|0033)?[6-9]\d{8}$/.test(clean)) {
            // Normalise au format international
            if (clean.startsWith('06') || clean.startsWith('07') || clean.startsWith('09')) {
                return '+33' + clean.slice(2);
            }
            return clean.startsWith('0033') ? '+33' + clean.slice(4) : clean;
        }

        return null;
    }

    static parseDate(value: string): Date | null {
        // yyyy-mm-dd → Date
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split('-').map(Number);
            const date = new Date(year!, month! - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }

        // dd/mm/yyyy → Date
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            const [day, month, year] = value.split('/').map(Number);
            const date = new Date(year!, month! - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }

        return null;
    }
}