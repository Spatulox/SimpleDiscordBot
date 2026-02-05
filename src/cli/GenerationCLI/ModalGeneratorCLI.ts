import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import {BaseCLI} from "../BaseCLI";
import {FolderName} from "../../type/FolderName";

export interface ModalCreateOption {
    title: string;
    customId: string;
    label: string;
    fields: ModalField[];
}

export interface ModalField {
    title: string;
    customId: string;
    style: ModalFieldStyle;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
}

export interface SimpleModalCreateOption {
    customId: string,
    title: string,
    label: string,
    placeholder?: string
}

export enum ModalFieldStyle {
    // Official TextInputStyle
    Short = TextInputStyle.Short,
    Paragraph = TextInputStyle.Paragraph,

    // Custom Styles
    Number = 'Number',
    Phone = 'Phone',
    Date = 'Date'
}

export class ModalGeneratorCLI extends BaseCLI {

    protected getTitle(): string {
        return "📝 Modal JSON Generator";
    }

    protected readonly menuSelection = [
        { label: "Generate Modal", action: () => this },
        { label: "Back", action: () => null }
    ];

    protected async action(): Promise<void> {
        const modal: ModalCreateOption = {
            title: '',
            customId: '',
            label: '',
            fields: []
        };

        // 1. Nom du Modal (Title)
        console.clear();
        console.log("🎛️  1/6 - Modal Title");
        modal.title = await this.requireInput("Enter modal title (max 45 chars): ",
            val => val.length <= 45);

        // 2. Custom ID
        console.clear();
        console.log("🔑  2/6 - Custom ID");
        modal.customId = await this.requireInput("Enter custom ID (lowercase, no spaces): ",
            val => /^[a-z0-9_-]+$/.test(val) && val.length <= 100);

        // 3. Label principal (optionnel)
        console.clear();
        console.log("📝  3/6 - Main Label");
        modal.label = (await this.prompt("Enter main label (optional, press Enter to skip): "))?.trim() || '';

        // 4. Nombre de champs
        console.clear();
        console.log("📊  4/6 - Fields");
        console.log("Max 5 fields per modal");
        const fieldCount = parseInt(await this.requireInput("How many fields? (1-5): ",
            val => {
                const num = parseInt(val);
                return num >= 1 && num <= 5;
            }));

        // 5. Générer chaque champ
        for (let i = 0; i < fieldCount; i++) {
            console.clear();
            console.log(`📝  5/6 - Field ${i + 1}/${fieldCount}`);

            const fieldLabel = await this.requireInput("Field label (max 45 chars): ",
                val => val.length <= 45);
            const fieldId = await this.requireInput("Field custom ID (lowercase): ",
                val => /^[a-z0-9_-]+$/.test(val));

            const fieldPlaceholder = (await this.prompt("Placeholder (optional): "))?.trim() || undefined;
            const fieldRequired = await this.yesNoInput("Required field? (y/n): ");

            console.clear();
            console.log("🎨 Field Styles:");
            console.log("1. Short     (TextInputStyle.Short)");
            console.log("2. Paragraph (TextInputStyle.Paragraph)");
            console.log("3. Number");
            console.log("4. Phone");
            console.log("5. Date");

            const styleChoice = await this.requireInput("Choose style (1-5): ", val => ["1","2","3","4","5"].includes(val));
            let style: ModalFieldStyle;

            switch (styleChoice) {
                case '1': style = ModalFieldStyle.Short; break;
                case '2': style = ModalFieldStyle.Paragraph; break;
                case '3': style = ModalFieldStyle.Number; break;
                case '4': style = ModalFieldStyle.Phone; break;
                case '5': style = ModalFieldStyle.Date; break;
                default: style = ModalFieldStyle.Short;
            }

            // Min/Max length (optional)
            const minLengthInput = await this.prompt("Min length (optional, press Enter): ");
            const maxLengthInput = await this.prompt("Max length (optional, press Enter): ");

            modal.fields.push({
                title: fieldLabel,
                customId: fieldId,
                placeholder: fieldPlaceholder,
                required: fieldRequired,
                style,
                ...(minLengthInput && { minLength: parseInt(minLengthInput) }),
                ...(maxLengthInput && { maxLength: parseInt(maxLengthInput) })
            });
        }

        console.clear();
        console.log("💾  6/6 - Save");
        const filename = await this.requireInput("Filename (ex: server-config): ") + ".json";

        await this.saveFile(`./handlers/${FolderName.MODAL}`, filename, modal)
        return this.showMainMenu();
    }

    /**
     * Create modal from declarative config - SIMPLE API !
     */
    static create(options: ModalCreateOption): ModalBuilder {
        const modal = new ModalBuilder()
            .setCustomId(options.customId)
            .setTitle(options.title.slice(0, 45));

        const actionRows: any[] = [];
        for (const field of options.fields) {
            const input = this.buildInput(field);
            const row = new ActionRowBuilder<ModalActionRowComponentBuilder>()
                .addComponents(input);
            actionRows.push(row);
        }

        return modal.addComponents(...actionRows);
    }

    private static buildInput(field: ModalField): TextInputBuilder {
        const input = new TextInputBuilder()
            .setCustomId(field.customId)
            .setLabel(field.title.slice(0, 45))
            .setPlaceholder(field.placeholder ?? '')
            .setRequired(field.required ?? false)
            .setMinLength(field.minLength ?? 0)
            .setMaxLength(field.maxLength ?? 400);

        // Mapper les styles custom
        switch (field.style) {
            case 'Number':
                input.setStyle(TextInputStyle.Short).setPlaceholder('Enter a number');
                break;
            case 'Phone':
                input.setStyle(TextInputStyle.Short).setPlaceholder('Enter a phone number : +33 6 12 34 56 78');
                break;
            case 'Date':
                input.setStyle(TextInputStyle.Short).setPlaceholder('Enter a date : yyyy-mm-dd');
                break;
            default:
                input.setStyle(field.style as unknown as TextInputStyle);
        }

        return input;
    }

    /**
     * Quick helpers
     */
    static simple(option: SimpleModalCreateOption): ModalBuilder {
        return this.create({
            title: option.title,
            customId: option.customId,
            label : option.label,
            fields: [{
                title: option.label,
                customId: 'input',
                placeholder: option.placeholder,
                style: ModalFieldStyle.Short
            }]
        });
    }
}