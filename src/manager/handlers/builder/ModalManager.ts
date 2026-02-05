import {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import {Log} from "../../../utils/Log";
import {FileManager} from "../../FileManager";

type ModalInput = {
    type: 'text' | 'text_placeholder' | 'text_minmax_length' | 'number' | 'date' | 'date-hour';
    id: string;
    title: string;
    style?: 'short' | 'paragraph';
    required?: boolean;
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
};

type FormData = {
    title: string;
    id: string;
    inputs: ModalInput[];
};

const MAX_COMPONENTS = 5;

export class ModalManager {
    /**
     * Load and build modal from JSON file
     */
    static async load(name: string): Promise<ModalBuilder | null> {
        const formData = await FileManager.readJsonFile(`./form/${name}.json`);

        if (!formData) {
            Log.error(`Form ${name} not found!`);
            return null;
        }

        if (!this.validateForm(formData)) {
            Log.error(`${name}.json is not a valid modal json`)
            return null;
        }

        return this.buildModal(formData as FormData);
    }

    /**
     * Validate form structure
     */
    private static validateForm(form: any): boolean {
        if (!form?.title || typeof form.title !== 'string') {
            Log.error(`Form needs 'title' (string)`);
            return false;
        }

        if (!form?.id || typeof form.id !== 'string') {
            Log.error(`Form needs 'id' (string)`);
            return false;
        }

        if (!form?.inputs || !Array.isArray(form.inputs)) {
            Log.error(`Form needs 'inputs' array`);
            return false;
        }

        return true;
    }

    /**
     * Build ModalBuilder from validated form
     */
    private static buildModal(form: FormData): ModalBuilder {
        const modal = new ModalBuilder()
            .setCustomId(form.id)
            .setTitle(form.title);

        let componentCount = 0;

        for (const input of form.inputs.slice(0, MAX_COMPONENTS)) {
            if (!this.isValidInput(input)) {
                Log.error(`Invalid input in form '${form.title}'`);
                continue;
            }

            const row = this.createInputRow(input);
            modal.addComponents(row);
            componentCount++;
        }

        if (form.inputs.length > MAX_COMPONENTS) {
            Log.warn(`Form '${form.title}': ${form.inputs.length} inputs → ${MAX_COMPONENTS} max, Discord will force hide the 5th+ component`);
        }

        return modal;
    }

    /**
     * Validate single input
     */
    private static isValidInput(input: any): input is ModalInput {
        const requiredFields = ['type', 'id', 'title'];
        return requiredFields.every(field => input?.[field]);
    }

    /**
     * Create ActionRowBuilder from input config
     */
    private static createInputRow(input: ModalInput): ActionRowBuilder<TextInputBuilder> {
        let textInput = new TextInputBuilder()
            .setCustomId(input.id)
            .setLabel(input.title)
            .setRequired(input.required ?? false)

        // Style mapping
        const style = input.style === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short;
        textInput = textInput.setStyle(style);

        // Type-specific options
        switch (input.type) {
            case 'text_placeholder':
                textInput = textInput.setPlaceholder(input.placeholder ?? '');
                break;

            case 'text_minmax_length':
                textInput = textInput
                    .setMinLength(input.minLength ?? 0)
                    .setMaxLength(input.maxLength ?? 4000);
                break;

            case 'number':
                textInput = textInput
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Enter a number');
                break;

            case 'date':
                textInput = textInput
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('DD/MM/YYYY');
                break;

            case 'date-hour':
                textInput = textInput
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('DD/MM/YYYY HH:MM');
                break;
        }

        return new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    }
}